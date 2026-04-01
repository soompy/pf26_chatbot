"use client";

/**
 * useChat — LLM API 연동 메인 훅
 *
 * 책임:
 *  - 낙관적 업데이트: 사용자 메시지 전송 즉시 UI 반영
 *  - SSE fetch streaming: streamChatCompletion async generator 소비
 *  - AbortController: 사용자 취소(stopStreaming) + 타임아웃 자동 abort
 *  - 에러 분류: NetworkError / TimeoutError / ModelError / AbortError
 *  - retry: 마지막 요청을 동일 인자로 재시도
 *
 * 사용:
 *   const { sendMessage, stopStreaming, retry, isStreaming, error, clearError } = useChat();
 */

import { useCallback, useRef, useState } from "react";
import { useChatStore } from "../stores/chatStore";
import { streamChatCompletion } from "@/lib/api/streaming";
import {
  toChatError,
  TimeoutError,
  AbortError,
  type ChatError,
} from "@/lib/api/errors";
import type { Attachment } from "../types/chat.types";

/** 응답이 없으면 30초 후 자동 취소 */
const TIMEOUT_MS = 30_000;

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export interface UseChatReturn {
  /** 메시지 전송. UI는 즉시 낙관적으로 업데이트된다. */
  sendMessage: (content: string, attachments?: Attachment[]) => Promise<void>;
  /** 스트리밍 중인 요청을 AbortController로 취소 */
  stopStreaming: () => void;
  /** 마지막 실패 요청을 동일 인자로 재시도 */
  retry: () => void;
  /** assistant 메시지를 삭제하고 동일 컨텍스트로 재생성 */
  regenerate: (assistantMessageId: string) => Promise<void>;
  /** 스트리밍 진행 중 여부 */
  isStreaming: boolean;
  /** 분류된 에러. null이면 정상 상태 */
  error: ChatError | null;
  /** 에러 상태 초기화 */
  clearError: () => void;
}

export function useChat(): UseChatReturn {
  const {
    activeThreadId,
    selectedModel,
    createThread,
    addMessage,
    updateMessage,
    removeMessage,
    setStreamingMessageId,
    getActiveThread,
  } = useChatStore();

  const isStreaming = useChatStore((s) => s.streamingMessageId !== null);
  const [error, setError] = useState<ChatError | null>(null);

  /** AbortController 참조 — stopStreaming / 타임아웃에서 공유 */
  const abortControllerRef = useRef<AbortController | null>(null);
  /** setTimeout ID — finally에서 반드시 정리 */
  const timeoutIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** 타임아웃 플래그 — catch에서 에러 분류에 사용 */
  const isTimeoutRef = useRef(false);
  /** retry()를 위해 마지막 요청 인자 보관 */
  const lastRequestRef = useRef<{ content: string; attachments?: Attachment[] } | null>(null);

  const clearError = useCallback(() => setError(null), []);

  /* ── 핵심 전송 로직 ──────────────────────────────────── */

  const _execute = useCallback(
    async (content: string, attachments?: Attachment[]) => {
      setError(null);
      isTimeoutRef.current = false;

      // 스레드가 없으면 새로 생성
      const threadId = activeThreadId ?? createThread();

      // ── 낙관적 업데이트 ①: 사용자 메시지 즉시 반영 ──
      const userMsgId = generateId();
      addMessage(threadId, {
        id: userMsgId,
        role: "user",
        content: content.trim(),
        status: "done",
        attachments,
        createdAt: new Date(),
        model: selectedModel,
      });

      // ── 낙관적 업데이트 ②: AI 응답 플레이스홀더 ──
      const assistantMsgId = generateId();
      addMessage(threadId, {
        id: assistantMsgId,
        role: "assistant",
        content: "",
        status: "streaming",
        createdAt: new Date(),
        model: selectedModel,
      });
      setStreamingMessageId(assistantMsgId);

      // ── AbortController + 타임아웃 설정 ──
      abortControllerRef.current = new AbortController();
      const { signal } = abortControllerRef.current;

      timeoutIdRef.current = setTimeout(() => {
        isTimeoutRef.current = true;
        abortControllerRef.current?.abort();
      }, TIMEOUT_MS);

      try {
        // 히스토리: 완료된 메시지만 포함 (스트리밍 중인 플레이스홀더 제외)
        const thread = getActiveThread();
        const history =
          thread?.messages
            .filter((m) => m.status === "done")
            .map((m) => ({ role: m.role, content: m.content })) ?? [];

        let accumulated = "";

        // ── SSE 스트림 소비 ──
        const stream = streamChatCompletion(
          {
            messages: [...history, { role: "user", content: content.trim() }],
            model: selectedModel,
            stream: true,
          },
          signal
        );

        for await (const chunk of stream) {
          accumulated += chunk;
          updateMessage(threadId, assistantMsgId, {
            content: accumulated,
            status: "streaming",
          });
        }

        // 스트림 정상 완료
        updateMessage(threadId, assistantMsgId, {
          content: accumulated,
          status: "done",
        });
      } catch (err) {
        // ── 에러 분류 ──
        const chatErr = isTimeoutRef.current
          ? new TimeoutError(TIMEOUT_MS)   // 타임아웃 우선
          : toChatError(err);              // 나머지: network / model / abort / unknown

        if (chatErr instanceof AbortError) {
          // 사용자가 직접 취소 → 현재까지 받은 텍스트 유지, 에러 노출 안 함
          updateMessage(threadId, assistantMsgId, { status: "done" });
        } else {
          // 그 외 에러 → 플레이스홀더 제거 + 에러 배너 표시
          updateMessage(threadId, assistantMsgId, {
            content: "",
            status: "error",
          });
          setError(chatErr);
        }
      } finally {
        if (timeoutIdRef.current) {
          clearTimeout(timeoutIdRef.current);
          timeoutIdRef.current = null;
        }
        setStreamingMessageId(null);
        abortControllerRef.current = null;
      }
    },
    [
      activeThreadId,
      selectedModel,
      createThread,
      addMessage,
      updateMessage,
      setStreamingMessageId,
      getActiveThread,
    ]
  );

  /* ── 공개 API ─────────────────────────────────────────── */

  const sendMessage = useCallback(
    async (content: string, attachments?: Attachment[]) => {
      if (!content.trim() && !attachments?.length) return;
      lastRequestRef.current = { content, attachments };
      await _execute(content, attachments);
    },
    [_execute]
  );

  const stopStreaming = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  const retry = useCallback(() => {
    if (!lastRequestRef.current) return;
    const { content, attachments } = lastRequestRef.current;
    _execute(content, attachments);
  }, [_execute]);

  const regenerate = useCallback(
    async (assistantMessageId: string) => {
      if (isStreaming) return;
      const thread = getActiveThread();
      if (!thread) return;
      const threadId = thread.id;

      // removeMessage 이전의 스냅샷으로 히스토리 구성
      // (제거 대상 assistant 메시지를 제외한 done 메시지만)
      const historyMessages = thread.messages
        .filter((m) => m.id !== assistantMessageId && m.status === "done")
        .map((m) => ({ role: m.role, content: m.content }));

      // 직전 user 메시지가 없으면 재생성 불가
      if (!historyMessages.some((m) => m.role === "user")) return;

      // 기존 assistant 메시지 제거
      removeMessage(threadId, assistantMessageId);

      setError(null);
      isTimeoutRef.current = false;

      // 새 assistant 플레이스홀더
      const newAssistantMsgId = generateId();
      addMessage(threadId, {
        id: newAssistantMsgId,
        role: "assistant",
        content: "",
        status: "streaming",
        createdAt: new Date(),
        model: selectedModel,
      });
      setStreamingMessageId(newAssistantMsgId);

      abortControllerRef.current = new AbortController();
      const { signal } = abortControllerRef.current;

      timeoutIdRef.current = setTimeout(() => {
        isTimeoutRef.current = true;
        abortControllerRef.current?.abort();
      }, TIMEOUT_MS);

      try {
        let accumulated = "";
        const stream = streamChatCompletion(
          { messages: historyMessages, model: selectedModel, stream: true },
          signal
        );
        for await (const chunk of stream) {
          accumulated += chunk;
          updateMessage(threadId, newAssistantMsgId, {
            content: accumulated,
            status: "streaming",
          });
        }
        updateMessage(threadId, newAssistantMsgId, {
          content: accumulated,
          status: "done",
        });
      } catch (err) {
        const chatErr = isTimeoutRef.current
          ? new TimeoutError(TIMEOUT_MS)
          : toChatError(err);

        if (chatErr instanceof AbortError) {
          updateMessage(threadId, newAssistantMsgId, { status: "done" });
        } else {
          updateMessage(threadId, newAssistantMsgId, { content: "", status: "error" });
          setError(chatErr);
        }
      } finally {
        if (timeoutIdRef.current) {
          clearTimeout(timeoutIdRef.current);
          timeoutIdRef.current = null;
        }
        setStreamingMessageId(null);
        abortControllerRef.current = null;
      }
    },
    [
      isStreaming,
      selectedModel,
      getActiveThread,
      removeMessage,
      addMessage,
      updateMessage,
      setStreamingMessageId,
    ]
  );

  return { sendMessage, stopStreaming, retry, regenerate, isStreaming, error, clearError };
}

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
  /** user 메시지를 수정하고 이후 메시지를 삭제 후 재전송 */
  editAndResend: (userMessageId: string, newContent: string) => Promise<void>;
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
    systemPrompt,
    createThread,
    addMessage,
    updateMessage,
    removeMessage,
    renameThread,
    setStreamingMessageId,
    setContextTokens,
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

  /* ── 공통 스트리밍 핵심 로직 ──────────────────────────── */

  /**
   * 주어진 메시지 배열로 스트리밍 API를 호출하고 결과를 assistantMsgId 메시지에 반영.
   * AbortController / 타임아웃 / 에러 분류 / cleanup 포함.
   * @returns "done" | "aborted" | "error"
   */
  const _streamToMessage = useCallback(
    async ({
      threadId,
      assistantMsgId,
      apiMessages,
      attachments,
    }: {
      threadId: string;
      assistantMsgId: string;
      apiMessages: { role: import("../types/chat.types").Role; content: string }[];
      attachments?: Attachment[];
    }): Promise<"done" | "aborted" | "error"> => {
      abortControllerRef.current = new AbortController();
      const { signal } = abortControllerRef.current;
      isTimeoutRef.current = false;

      timeoutIdRef.current = setTimeout(() => {
        isTimeoutRef.current = true;
        abortControllerRef.current?.abort();
      }, TIMEOUT_MS);

      try {
        let accumulated = "";
        // 스트리밍 중 store 업데이트를 ~60fps로 제한
        // 매 청크(10~30/s)마다 업데이트하면 MessageList 전체가 청크 수만큼 리렌더링됨
        let lastFlush = 0;
        const FLUSH_INTERVAL = 16; // ms (≈ 60fps)

        const stream = streamChatCompletion(
          {
            messages: apiMessages,
            model: selectedModel,
            stream: true,
            systemPrompt: systemPrompt || undefined,
            attachments,
          },
          signal,
          ({ completionTokens, inputTokens }) => {
            if (completionTokens != null)
              updateMessage(threadId, assistantMsgId, { tokenCount: completionTokens });
            if (inputTokens != null)
              setContextTokens(inputTokens);
          }
        );

        for await (const chunk of stream) {
          accumulated += chunk;
          const now = Date.now();
          if (now - lastFlush >= FLUSH_INTERVAL) {
            updateMessage(threadId, assistantMsgId, {
              content: accumulated,
              status: "streaming",
            });
            lastFlush = now;
          }
        }

        // 마지막 청크는 반드시 반영
        updateMessage(threadId, assistantMsgId, {
          content: accumulated,
          status: "done",
        });
        return "done";
      } catch (err) {
        const chatErr = isTimeoutRef.current
          ? new TimeoutError(TIMEOUT_MS)
          : toChatError(err);

        if (chatErr instanceof AbortError) {
          // 사용자가 직접 취소 → 현재까지 받은 텍스트 유지
          updateMessage(threadId, assistantMsgId, { status: "done" });
          return "aborted";
        } else {
          updateMessage(threadId, assistantMsgId, { content: "", status: "error" });
          setError(chatErr);
          return "error";
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
    [selectedModel, systemPrompt, updateMessage, setContextTokens, setStreamingMessageId]
  );

  /* ── 핵심 전송 로직 ──────────────────────────────────── */

  const _execute = useCallback(
    async (content: string, attachments?: Attachment[]) => {
      setError(null);

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

      // 히스토리: 완료된 메시지만 포함 (스트리밍 중인 플레이스홀더 제외)
      const thread = getActiveThread();
      const history =
        thread?.messages
          .filter((m) => m.status === "done")
          .map((m) => ({ role: m.role, content: m.content })) ?? [];

      const result = await _streamToMessage({
        threadId,
        assistantMsgId,
        apiMessages: [...history, { role: "user", content: content.trim() }],
        attachments,
      });

      // 첫 번째 교환 완료 시 AI로 대화 제목 생성 (비동기, 비중요)
      if (result === "done" && history.length === 1) {
        fetch("/api/title", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ firstUserMessage: content.trim(), model: selectedModel }),
        })
          .then((r) => (r.ok ? r.json() : null))
          .then((data) => { if (data?.title) renameThread(threadId, data.title); })
          .catch(() => {}); // 제목 생성 실패는 무시
      }
    },
    [
      activeThreadId,
      selectedModel,
      createThread,
      addMessage,
      renameThread,
      setStreamingMessageId,
      getActiveThread,
      _streamToMessage,
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

      // 제거 대상 assistant 메시지를 제외한 done 메시지로 히스토리 구성
      const historyMessages = thread.messages
        .filter((m) => m.id !== assistantMessageId && m.status === "done")
        .map((m) => ({ role: m.role, content: m.content }));

      // 직전 user 메시지가 없으면 재생성 불가
      if (!historyMessages.some((m) => m.role === "user")) return;

      // 기존 assistant 메시지 제거
      removeMessage(threadId, assistantMessageId);
      setError(null);

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

      await _streamToMessage({
        threadId,
        assistantMsgId: newAssistantMsgId,
        apiMessages: historyMessages,
      });
    },
    [
      isStreaming,
      selectedModel,
      getActiveThread,
      removeMessage,
      addMessage,
      setStreamingMessageId,
      _streamToMessage,
    ]
  );

  const editAndResend = useCallback(
    async (userMessageId: string, newContent: string) => {
      if (isStreaming || !newContent.trim()) return;
      const thread = getActiveThread();
      if (!thread) return;
      const threadId = thread.id;

      const msgIndex = thread.messages.findIndex((m) => m.id === userMessageId);
      if (msgIndex === -1) return;

      // 편집 이전 완료 메시지로 히스토리 구성 (편집 대상 제외)
      const historyBefore = thread.messages
        .slice(0, msgIndex)
        .filter((m) => m.status === "done")
        .map((m) => ({ role: m.role, content: m.content }));

      // 편집 대상 이후 메시지 모두 제거
      const idsToRemove = thread.messages.slice(msgIndex + 1).map((m) => m.id);
      for (const id of idsToRemove) {
        removeMessage(threadId, id);
      }

      // 편집된 내용으로 user 메시지 업데이트
      updateMessage(threadId, userMessageId, { content: newContent.trim() });

      setError(null);

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

      await _streamToMessage({
        threadId,
        assistantMsgId: newAssistantMsgId,
        apiMessages: [
          ...historyBefore,
          { role: "user" as const, content: newContent.trim() },
        ],
      });
    },
    [
      isStreaming,
      selectedModel,
      getActiveThread,
      updateMessage,
      removeMessage,
      addMessage,
      setStreamingMessageId,
      _streamToMessage,
    ]
  );

  return { sendMessage, stopStreaming, retry, regenerate, editAndResend, isStreaming, error, clearError };
}

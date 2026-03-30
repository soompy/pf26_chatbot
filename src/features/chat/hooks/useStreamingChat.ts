"use client";

import { useCallback, useRef } from "react";
import { useChatStore } from "../stores/chatStore";
import { streamChatCompletion } from "@/lib/api/streaming";
import type { Attachment } from "../types/chat.types";

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function useStreamingChat() {
  const {
    activeThreadId,
    selectedModel,
    createThread,
    addMessage,
    updateMessage,
    setStreamingMessageId,
    getActiveThread,
  } = useChatStore();

  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (content: string, attachments?: Attachment[]) => {
      if (!content.trim() && !attachments?.length) return;

      // 스레드가 없으면 새로 생성
      const threadId = activeThreadId ?? createThread();

      // 사용자 메시지 추가
      const userMessageId = generateId();
      addMessage(threadId, {
        id: userMessageId,
        role: "user",
        content: content.trim(),
        status: "done",
        attachments,
        createdAt: new Date(),
        model: selectedModel,
      });

      // AI 응답 플레이스홀더 추가
      const assistantMessageId = generateId();
      addMessage(threadId, {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        status: "streaming",
        createdAt: new Date(),
        model: selectedModel,
      });
      setStreamingMessageId(assistantMessageId);

      // AbortController 설정
      abortControllerRef.current = new AbortController();

      try {
        const thread = getActiveThread();
        const historyMessages =
          thread?.messages
            .filter((m) => m.status === "done")
            .map((m) => ({ role: m.role, content: m.content })) ?? [];

        let accumulated = "";

        const stream = streamChatCompletion(
          {
            messages: [...historyMessages, { role: "user", content: content.trim() }],
            model: selectedModel,
            stream: true,
          },
          abortControllerRef.current.signal
        );

        for await (const chunk of stream) {
          accumulated += chunk;
          updateMessage(threadId, assistantMessageId, {
            content: accumulated,
            status: "streaming",
          });
        }

        updateMessage(threadId, assistantMessageId, {
          content: accumulated,
          status: "done",
        });
      } catch (error) {
        const isDomAbort =
          error instanceof DOMException && error.name === "AbortError";
        if (isDomAbort) {
          // 사용자가 중단한 경우 현재 내용 유지
          updateMessage(threadId, assistantMessageId, { status: "done" });
        } else {
          updateMessage(threadId, assistantMessageId, {
            content: "",
            status: "error",
          });
          console.error("[useStreamingChat]", error);
        }
      } finally {
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

  const stopStreaming = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  const isStreaming = useChatStore((s) => s.streamingMessageId !== null);

  return { sendMessage, stopStreaming, isStreaming };
}

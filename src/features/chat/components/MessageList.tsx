"use client";

import { useEffect, useRef, useCallback } from "react";
import { useChatStore } from "../stores/chatStore";
import { useChatContext } from "../context/ChatContext";
import { MessageBubble } from "./MessageBubble";
import { MessageSkeleton } from "@/design-system";

export function MessageList() {
  const bottomRef = useRef<HTMLDivElement>(null);
  const thread = useChatStore((s) => s.getActiveThread());
  const streamingMessageId = useChatStore((s) => s.streamingMessageId);
  const { regenerate, isStreaming } = useChatContext();

  const handleRegenerate = useCallback(
    (messageId: string) => () => regenerate(messageId),
    [regenerate]
  );

  // 새 메시지마다 스크롤 하단으로
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread?.messages.length, streamingMessageId]);

  if (!thread || thread.messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-4">
        <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-6 h-6 text-accent"
            aria-hidden="true"
          >
            <path
              d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div>
          <p className="text-text-primary font-semibold text-lg">무엇이든 물어보세요</p>
          <p className="text-text-muted text-sm mt-1">AI가 스트리밍으로 답변합니다</p>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-2 w-full max-w-md">
          {SUGGESTIONS.map((s) => (
            <SuggestionCard key={s} text={s} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto py-2">
      {thread.messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          isStreaming={message.id === streamingMessageId}
          onRegenerate={
            message.role === "assistant" && message.status === "done" && !isStreaming
              ? handleRegenerate(message.id)
              : undefined
          }
        />
      ))}

      {/* 로딩 스켈레톤 (응답 대기 중) */}
      {streamingMessageId &&
        thread.messages.find((m) => m.id === streamingMessageId)?.content === "" && (
          <MessageSkeleton />
        )}

      <div ref={bottomRef} />
    </div>
  );
}

const SUGGESTIONS = [
  "React 스트리밍 UI 구현 방법",
  "Tailwind CSS 디자인 토큰 설계",
  "Zustand vs Redux 비교",
  "TypeScript 유틸리티 타입 정리",
];

function SuggestionCard({ text }: { text: string }) {
  return (
    <button className="text-left p-3 rounded-xl bg-surface-raised border border-[var(--color-border)] text-xs text-text-secondary hover:text-text-primary hover:border-accent/40 hover:bg-surface-overlay transition-all">
      {text}
    </button>
  );
}

"use client";

import { ModelSelector } from "./ModelSelector";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { useChatStore } from "../stores/chatStore";
import { useEffect } from "react";

export function ChatWindow() {
  const { activeThreadId, createThread } = useChatStore();

  // 첫 진입 시 스레드 자동 생성
  useEffect(() => {
    if (!activeThreadId) createThread();
  }, [activeThreadId, createThread]);

  return (
    <div className="flex-1 flex flex-col h-full min-w-0">
      {/* 헤더 */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-[var(--color-border)] glass">
        <div>
          <h1 className="text-sm font-semibold text-text-primary">AI Chat</h1>
          <p className="text-xs text-text-muted">스트리밍 응답 · 멀티모달 입력</p>
        </div>
        <ModelSelector />
      </header>

      {/* 메시지 리스트 */}
      <MessageList />

      {/* 입력창 */}
      <ChatInput />
    </div>
  );
}

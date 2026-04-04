"use client";

import { ModelSelector } from "./ModelSelector";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { useChatStore } from "../stores/chatStore";
import { useChat } from "../hooks/useChat";
import { ChatProvider } from "../context/ChatContext";
import { ThemeToggle } from "@/design-system";
import { ContextWindowBar } from "@/design-system/components/ContextWindowBar";
import { MODEL_MAX_TOKENS } from "../types/chat.types";
import { useEffect, useState } from "react";

export function ChatWindow() {
  const { activeThreadId, createThread, systemPrompt, setSystemPrompt, contextTokens, selectedModel } = useChatStore();
  const chat = useChat();
  const [isSystemPromptOpen, setIsSystemPromptOpen] = useState(false);

  // 첫 진입 시 스레드 자동 생성
  useEffect(() => {
    if (!activeThreadId) createThread();
  }, [activeThreadId, createThread]);

  return (
    <ChatProvider value={chat}>
    <div className="flex-1 flex flex-col h-full min-w-0">
      {/* 헤더 */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-[var(--color-border)] glass">
        <div>
          <h1 className="text-sm font-semibold text-text-primary">AI Chat</h1>
          <p className="text-xs text-text-muted">스트리밍 응답 · 멀티모달 입력</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSystemPromptOpen((p) => !p)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              isSystemPromptOpen || systemPrompt
                ? "bg-accent/10 text-accent border-accent/40"
                : "bg-surface-raised text-text-muted border-[var(--color-border)] hover:text-text-secondary"
            }`}
          >
            System
          </button>
          <ModelSelector />
          <ThemeToggle />
        </div>
      </header>

      {/* 시스템 프롬프트 패널 */}
      {isSystemPromptOpen && (
        <div className="px-4 py-3 border-b border-[var(--color-border)] bg-surface-raised/50">
          <p className="text-xs font-medium text-text-muted mb-1.5">시스템 프롬프트</p>
          <textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            placeholder="AI의 역할, 응답 방식, 제약 조건 등을 지정하세요..."
            rows={3}
            className="w-full bg-transparent resize-none text-xs text-text-primary placeholder:text-text-muted focus:outline-none leading-relaxed"
          />
        </div>
      )}

      {/* 컨텍스트 윈도우 바 */}
      {contextTokens > 0 && (
        <div className="px-4 py-1.5 border-b border-[var(--color-border)]">
          <ContextWindowBar
            used={contextTokens}
            total={MODEL_MAX_TOKENS[selectedModel]}
            showLabel
          />
        </div>
      )}

      {/* 메시지 리스트 */}
      <MessageList />

      {/* 입력창 */}
      <ChatInput />
    </div>
    </ChatProvider>
  );
}

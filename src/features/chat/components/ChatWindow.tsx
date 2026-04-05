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
import type { Thread } from "../types/chat.types";
import { useState, useEffect, useRef, useCallback } from "react";
import { Menu, Download } from "lucide-react";

interface ChatWindowProps {
  onOpenSidebar?: () => void;
}

export function ChatWindow({ onOpenSidebar }: ChatWindowProps) {
  const { activeThreadId, systemPrompt, setSystemPrompt, contextTokens, selectedModel } = useChatStore();
  const activeThread = useChatStore((s) => s.threads.find((t) => t.id === s.activeThreadId));
  const chat = useChat();
  const [isSystemPromptOpen, setIsSystemPromptOpen] = useState(false);

  return (
    <ChatProvider value={chat}>
    <div className="flex-1 flex flex-col h-full min-w-0">
      {/* 헤더 */}
      <header className="flex items-center justify-between px-4 lg:px-6 py-3 border-b border-[var(--color-border)] glass">
        <div className="flex items-center gap-3">
          {/* 햄버거 버튼 — 모바일/태블릿 전용 */}
          <button
            className="lg:hidden p-1.5 rounded-lg text-text-muted hover:text-text-secondary hover:bg-surface-overlay transition-colors"
            onClick={onOpenSidebar}
            aria-label="메뉴 열기"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-sm font-semibold text-text-primary">AI Chat</h1>
            <p className="text-xs text-text-muted hidden sm:block">스트리밍 응답 · 멀티모달 입력</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ExportButton thread={activeThread} />
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

/* ── 대화 내보내기 유틸 ───────────────────────────────── */

function threadToMarkdown(thread: Thread): string {
  const date = new Date(thread.createdAt).toLocaleDateString("ko-KR");
  const lines: string[] = [
    `# ${thread.title}`,
    `> 생성일: ${date} · 모델: ${thread.model}`,
    "",
  ];

  for (const msg of thread.messages) {
    if (msg.status !== "done" || !msg.content) continue;
    const speaker = msg.role === "user" ? "**You**" : `**Assistant** (${msg.model ?? ""})`;
    const time = new Date(msg.createdAt).toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    lines.push(`### ${speaker} · ${time}`);
    lines.push("");
    lines.push(msg.content);
    lines.push("");
    lines.push("---");
    lines.push("");
  }

  return lines.join("\n");
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function safeFilename(title: string) {
  return title.replace(/[\\/:*?"<>|]/g, "_").slice(0, 50);
}

/* ── 내보내기 드롭다운 버튼 ───────────────────────────── */

function ExportButton({ thread }: { thread: Thread | undefined }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleExport = useCallback(
    (format: "markdown" | "json") => {
      if (!thread) return;
      setOpen(false);
      const name = safeFilename(thread.title);
      if (format === "markdown") {
        downloadFile(threadToMarkdown(thread), `${name}.md`, "text/markdown");
      } else {
        downloadFile(JSON.stringify(thread, null, 2), `${name}.json`, "application/json");
      }
    },
    [thread]
  );

  // 외부 클릭 시 닫기
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  if (!thread || thread.messages.filter((m) => m.status === "done").length === 0) {
    return null;
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        aria-label="대화 내보내기"
        title="내보내기"
        className="p-1.5 rounded-lg text-text-muted hover:text-text-secondary hover:bg-surface-overlay transition-colors"
      >
        <Download className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 w-44 bg-surface-raised border border-[var(--color-border)] rounded-xl shadow-xl overflow-hidden animate-slide-up">
          <button
            onClick={() => handleExport("markdown")}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-xs text-text-secondary hover:bg-surface-overlay hover:text-text-primary transition-colors"
          >
            <span className="text-base leading-none">📄</span>
            마크다운으로 저장
          </button>
          <button
            onClick={() => handleExport("json")}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-xs text-text-secondary hover:bg-surface-overlay hover:text-text-primary transition-colors"
          >
            <span className="text-base leading-none">📦</span>
            JSON으로 저장
          </button>
        </div>
      )}
    </div>
  );
}

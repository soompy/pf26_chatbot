"use client";

import { useChatStore } from "../stores/chatStore";
import { Button } from "@/design-system";
import { MessageSquarePlus, Trash2 } from "lucide-react";
import { clsx } from "clsx";

export function Sidebar() {
  const { threads, activeThreadId, createThread, selectThread, deleteThread } =
    useChatStore();

  return (
    <aside className="w-64 shrink-0 flex flex-col bg-surface-raised border-r border-[var(--color-border)] h-full">
      {/* 헤더 */}
      <div className="p-4 border-b border-[var(--color-border)]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-accent/20 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 text-accent">
                <path
                  d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="font-semibold text-sm text-text-primary">AI Chat</span>
          </div>
        </div>
        <Button
          variant="secondary"
          size="sm"
          className="w-full"
          leftIcon={<MessageSquarePlus className="w-4 h-4" />}
          onClick={createThread}
        >
          새 대화
        </Button>
      </div>

      {/* 대화 목록 */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {threads.length === 0 ? (
          <p className="text-xs text-text-muted px-3 py-4 text-center">
            대화를 시작해 보세요
          </p>
        ) : (
          threads.map((thread) => (
            <div
              key={thread.id}
              className={clsx(
                "group flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer",
                activeThreadId === thread.id
                  ? "bg-accent/10 text-text-primary"
                  : "text-text-secondary hover:bg-surface-overlay hover:text-text-primary"
              )}
              onClick={() => selectThread(thread.id)}
            >
              <span className="flex-1 truncate text-xs">{thread.title}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteThread(thread.id);
                }}
                className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-error transition-all p-0.5 rounded"
                aria-label="대화 삭제"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </nav>

      {/* 푸터 */}
      <div className="p-4 border-t border-[var(--color-border)]">
        <p className="text-xs text-text-muted text-center">
          AI Chatbot UI Portfolio
        </p>
      </div>
    </aside>
  );
}

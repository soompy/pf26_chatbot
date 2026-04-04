"use client";

import { useChatStore } from "../stores/chatStore";
import { Button } from "@/design-system";
import { MessageSquarePlus, Trash2, X } from "lucide-react";
import { clsx } from "clsx";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const { threads, activeThreadId, createThread, selectThread, deleteThread } =
    useChatStore();

  return (
    <aside
      className={clsx(
        // 기본 스타일
        "w-64 shrink-0 flex flex-col bg-surface-raised border-r border-[var(--color-border)] h-full",
        // 모바일: fixed 드로어 (z-40, 좌측 슬라이드)
        "fixed inset-y-0 left-0 z-40 transition-transform duration-300 ease-out",
        // 데스크톱: 상대 위치로 복귀, 항상 표시
        "lg:relative lg:translate-x-0 lg:z-auto",
        // 모바일 열림/닫힘 상태
        isOpen ? "translate-x-0" : "-translate-x-full",
      )}
    >
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

          {/* 닫기 버튼 — 모바일 전용 */}
          <button
            className="lg:hidden p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-overlay transition-colors"
            onClick={onClose}
            aria-label="사이드바 닫기"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <Button
          variant="secondary"
          size="sm"
          className="w-full"
          leftIcon={<MessageSquarePlus className="w-4 h-4" />}
          onClick={() => {
            createThread();
            onClose?.();
          }}
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
              onClick={() => {
                selectThread(thread.id);
                onClose?.();
              }}
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

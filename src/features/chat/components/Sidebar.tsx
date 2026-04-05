"use client";

import { useChatStore } from "../stores/chatStore";
import { Button } from "@/design-system";
import { MessageSquarePlus, Trash2, X, Search } from "lucide-react";
import { clsx } from "clsx";
import { useState } from "react";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const { threads, activeThreadId, createThread, selectThread, deleteThread } =
    useChatStore();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredThreads = searchQuery.trim()
    ? threads.filter((t) =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : threads;

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

      {/* 검색 입력 */}
      {threads.length > 0 && (
        <div className="px-3 py-2 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-surface-overlay border border-[var(--color-border)] focus-within:border-accent/50 transition-colors">
            <Search className="w-3.5 h-3.5 text-text-muted shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="대화 검색..."
              className="flex-1 bg-transparent text-xs text-text-primary placeholder:text-text-muted focus:outline-none"
              aria-label="대화 검색"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-text-muted hover:text-text-secondary transition-colors"
                aria-label="검색 초기화"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* 대화 목록 */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {threads.length === 0 ? (
          <p className="text-xs text-text-muted px-3 py-4 text-center">
            대화를 시작해 보세요
          </p>
        ) : filteredThreads.length === 0 ? (
          <p className="text-xs text-text-muted px-3 py-4 text-center">
            검색 결과가 없습니다
          </p>
        ) : (
          filteredThreads.map((thread) => (
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

"use client";

/**
 * features/chat — MessageBubble 래퍼
 *
 * React.memo 적용: 수정된 message 객체만 리렌더링, 나머지는 skip.
 * regenerate / editAndResend 로직을 내부에서 context로 직접 처리해
 * 부모(MessageList)가 불안정한 함수 ref를 내려주는 문제를 방지.
 */

import { memo, useState, useCallback, useRef, useEffect } from "react";
import { MessageBubble as BaseMessageBubble } from "@/design-system/components/MessageBubble";
import { Avatar } from "@/design-system/components/Avatar";
import { useChatContext } from "../context/ChatContext";
import type { Message } from "../types/chat.types";

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
  isThinking?: boolean;
}

export const MessageBubble = memo(function MessageBubble({
  message,
  isStreaming = false,
  isThinking = false,
}: MessageBubbleProps) {
  const { regenerate, editAndResend, isStreaming: globalIsStreaming } = useChatContext();

  const [isEditing, setIsEditing]   = useState(false);
  const [editValue, setEditValue]   = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 편집 모드 진입 시 textarea 포커스 + 높이 자동 조정
  useEffect(() => {
    if (!isEditing || !textareaRef.current) return;
    const el = textareaRef.current;
    el.focus();
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
    // 커서를 텍스트 끝으로
    el.setSelectionRange(el.value.length, el.value.length);
  }, [isEditing]);

  const handleCopy = useCallback(async (content: string) => {
    await navigator.clipboard.writeText(content).catch(() => {});
  }, []);

  const handleRegenerate = useCallback(() => {
    regenerate(message.id);
  }, [regenerate, message.id]);

  const handleEditStart = useCallback(() => {
    setEditValue(message.content);
    setIsEditing(true);
  }, [message.content]);

  const handleEditSave = useCallback(() => {
    if (!editValue.trim()) return;
    setIsEditing(false);
    editAndResend(message.id, editValue);
  }, [editValue, message.id, editAndResend]);

  const handleEditCancel = useCallback(() => {
    setIsEditing(false);
    setEditValue("");
  }, []);

  const handleEditKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleEditSave();
      }
      if (e.key === "Escape") handleEditCancel();
    },
    [handleEditSave, handleEditCancel]
  );

  // ── 편집 모드 렌더 ──────────────────────────────────────
  if (isEditing) {
    return (
      <div className="group flex gap-3 px-3 sm:px-4 py-3 flex-row-reverse hover:bg-surface-raised/40 transition-colors">
        <Avatar role="user" size="md" className="mt-0.5 shrink-0" />
        <div className="flex flex-col gap-2 items-end max-w-[85%] sm:max-w-[80%] w-full">
          <div className="bubble-user w-full">
            <textarea
              ref={textareaRef}
              value={editValue}
              onChange={(e) => {
                setEditValue(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              onKeyDown={handleEditKeyDown}
              rows={1}
              className="w-full bg-transparent resize-none focus:outline-none text-token-base leading-relaxed min-h-[24px]"
              aria-label="메시지 편집"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleEditCancel}
              className="px-3 py-1 rounded-lg text-xs text-text-muted hover:text-text-primary bg-surface-overlay border border-line transition-all press"
            >
              취소
            </button>
            <button
              onClick={handleEditSave}
              disabled={!editValue.trim()}
              className="px-3 py-1 rounded-lg text-xs text-white bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed transition-all press"
            >
              전송
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── 일반 렌더 ───────────────────────────────────────────
  const onRegenerate =
    message.role === "assistant" && message.status === "done" && !globalIsStreaming
      ? handleRegenerate
      : undefined;

  const onEdit =
    message.role === "user" && message.status === "done" && !globalIsStreaming
      ? handleEditStart
      : undefined;

  return (
    <BaseMessageBubble
      role={message.role}
      content={message.content}
      status={message.status}
      isStreaming={isStreaming}
      isThinking={isThinking}
      model={message.model}
      tokenCount={message.tokenCount}
      attachments={message.attachments}
      createdAt={message.createdAt}
      onCopy={handleCopy}
      onRegenerate={onRegenerate}
      onEdit={onEdit}
    />
  );
});

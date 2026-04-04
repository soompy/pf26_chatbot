/**
 * MessageBubble — 재사용 가능한 base 컴포넌트
 *
 * store에 의존하지 않는 순수 UI 컴포넌트.
 * features/chat 에서 이 컴포넌트를 감싸 store와 연결.
 *
 * 지원 상태:
 *   - user / assistant / system 역할별 스타일
 *   - streaming (violet glow + 커서)
 *   - thinking  (amber glow + dots)
 *   - error     (red bg + shake)
 *   - done      (마크다운 렌더링)
 *
 * 접근성:
 *   - role="article"     : 개별 메시지를 독립적 콘텐츠 단위로
 *   - aria-label         : 발화자 + 상태 설명
 *   - aria-live="polite" : 스트리밍 텍스트 업데이트 알림
 *   - 복사 버튼 키보드 접근 가능
 *   - 타임스탬프 <time> 요소 사용
 */

"use client";

import { useState, useCallback, useEffect } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Avatar } from "@/design-system/components/Avatar";
import { StreamingText } from "@/design-system/components/StreamingText";
import { StatusIndicator } from "@/design-system/components/StatusIndicator";
import type { Role, MessageStatus, Attachment } from "@/features/chat/types/chat.types";

function cn(...inputs: Parameters<typeof clsx>) {
  return twMerge(clsx(inputs));
}

/* ── Props ─────────────────────────────────────────────── */

export interface MessageBubbleProps {
  /** 발화 역할 */
  role: Role;
  /** 메시지 본문 (누적 완성본) */
  content: string;
  /** 현재 처리 상태 */
  status?: MessageStatus;
  /** 스트리밍 중 여부 (streaming 커서 + glow) */
  isStreaming?: boolean;
  /** AI 추론 중 여부 (thinking dots + amber glow) */
  isThinking?: boolean;
  /** 표시 이름 (없으면 role 기반 기본값) */
  name?: string;
  /** 사용 모델명 */
  model?: string;
  /** 토큰 수 */
  tokenCount?: number;
  /** 첨부 파일 목록 */
  attachments?: Attachment[];
  /** 복사 버튼 클릭 */
  onCopy?: (content: string) => void;
  /** 재생성 요청 (assistant 메시지에서만 표시) */
  onRegenerate?: () => void;
  /** 마크다운 파싱 여부 (기본 true) */
  markdown?: boolean;
  /** 생성 시각 */
  createdAt?: Date;
  className?: string;
}

/* ── 타임스탬프 (클라이언트 전용) ──────────────────────── */

/**
 * SSR/클라이언트 로케일 불일치를 막기 위해
 * 마운트 후에만 포맷된 시각 문자열을 표시.
 */
function useFormattedTime(date: Date | undefined) {
  const [formatted, setFormatted] = useState<string | null>(null);

  useEffect(() => {
    if (!date) return;
    setFormatted(
      date.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
    );
  }, [date]);

  return formatted;
}

/* ── 역할별 기본값 ─────────────────────────────────────── */

const ROLE_DISPLAY: Record<Role, string> = {
  user:      "You",
  assistant: "Assistant",
  system:    "System",
};

/* ── 복사 버튼 ─────────────────────────────────────────── */

interface CopyButtonProps {
  content: string;
  onCopy?: (content: string) => void;
}

function CopyButton({ content, onCopy }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      onCopy?.(content);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API 미지원 환경 무시
    }
  }, [content, onCopy]);

  return (
    <button
      onClick={handleCopy}
      aria-label={copied ? "복사 완료" : "메시지 복사"}
      title={copied ? "복사 완료" : "복사"}
      className={cn(
        "flex items-center gap-1 px-2 py-0.5 rounded-token-sm text-[10px] font-medium",
        "transition-all duration-fast border press",
        copied
          ? "text-success bg-success/10 border-success/20"
          : "text-text-muted hover:text-text-primary bg-surface-overlay border-line opacity-0 group-hover:opacity-100 focus-visible:opacity-100",
      )}
    >
      {copied ? (
        <span className="animate-[check-pop_0.25s_var(--ease-spring)_both]">✓ 복사됨</span>
      ) : (
        "⎘ 복사"
      )}
    </button>
  );
}

/* ── 첨부 파일 ─────────────────────────────────────────── */

function AttachmentList({ attachments }: { attachments: Attachment[] }) {
  return (
    <div className="flex flex-wrap gap-2 mb-2">
      {attachments.map((att) => (
        <div
          key={att.id}
          className="flex items-center gap-1.5 bg-surface-overlay border border-line rounded-token px-2.5 py-1.5 text-token-xs text-text-secondary max-w-[180px]"
        >
          {att.type === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={att.url}
              alt={att.name}
              className="h-8 w-8 object-cover rounded shrink-0"
            />
          ) : (
            <>
              <span aria-hidden>📎</span>
              <span className="truncate">{att.name}</span>
              <span className="text-text-muted shrink-0">
                {(att.size / 1024).toFixed(0)}KB
              </span>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

/* ── MessageBubble ─────────────────────────────────────── */

export function MessageBubble({
  role,
  content,
  status = "done",
  isStreaming = false,
  isThinking = false,
  name,
  model,
  tokenCount,
  attachments,
  onCopy,
  onRegenerate,
  markdown = true,
  createdAt,
  className,
}: MessageBubbleProps) {
  const isUser      = role === "user";
  const isAssistant = role === "assistant";
  const isSystem    = role === "system";
  const isError     = status === "error";
  const displayName = name ?? ROLE_DISPLAY[role];
  // 클라이언트 마운트 후에만 포맷 (SSR 로케일 불일치 방지)
  const timeLabel   = useFormattedTime(createdAt);

  const ariaLabel = [
    displayName,
    isThinking  ? "생각 중"   : null,
    isStreaming  ? "응답 생성 중" : null,
    isError      ? "오류 발생" : null,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <article
      className={cn(
        "group flex gap-3 px-3 sm:px-4 py-3 message-enter",
        "hover:bg-surface-raised/40 transition-colors duration-fast",
        isUser   && "flex-row-reverse",
        isSystem && "justify-center",
        className,
      )}
      aria-label={ariaLabel}
      aria-live={isStreaming || isThinking ? "polite" : undefined}
    >
      {/* 아바타 — system 역할은 생략 */}
      {!isSystem && (
        <Avatar
          role={role}
          size="md"
          className="mt-0.5 shrink-0"
        />
      )}

      <div
        className={cn(
          "flex flex-col gap-1",
          isUser   ? "items-end max-w-[85%] sm:max-w-[80%]" : "items-start max-w-[85%] sm:max-w-[80%]",
          isSystem && "items-center max-w-full",
        )}
      >
        {/* ── 메타 정보 ── */}
        {!isSystem && (
          <div
            className={cn(
              "flex items-center gap-2",
              isUser && "flex-row-reverse",
            )}
          >
            <span className="text-token-xs font-medium text-text-secondary">
              {displayName}
            </span>
            {model && (
              <span className="text-token-xs text-text-muted">{model}</span>
            )}
            {createdAt && timeLabel && (
              <time
                dateTime={createdAt.toISOString()}
                className="text-token-xs text-text-muted"
              >
                {timeLabel}
              </time>
            )}
          </div>
        )}

        {/* ── 첨부 파일 ── */}
        {attachments && attachments.length > 0 && (
          <AttachmentList attachments={attachments} />
        )}

        {/* ── 메시지 본문 ── */}
        <div
          className={cn(
            // 공통
            "relative transition-shadow duration-normal",
            // 역할별 버블 스타일
            isUser      && "bubble-user",
            isAssistant && cn(
              "bubble-ai",
              isThinking  && "is-thinking",
              isStreaming && !isThinking && "is-streaming",
              isError     && "is-error",
            ),
            isSystem && cn(
              "px-token-4 py-token-2 rounded-token border text-token-xs",
              "text-text-muted bg-surface-overlay border-line italic",
            ),
          )}
        >
          {/* system 역할 */}
          {isSystem && <p>{content}</p>}

          {/* user 역할 */}
          {isUser && (
            <p className="whitespace-pre-wrap break-words text-token-base leading-relaxed">
              {content}
            </p>
          )}

          {/* assistant 역할 */}
          {isAssistant && !isError && !isThinking && (
            <StreamingText
              content={content}
              isStreaming={isStreaming}
              markdown={markdown}
            />
          )}

          {/* thinking 상태 (content 없이 dots만) */}
          {isAssistant && isThinking && !content && (
            <div className="flex items-center gap-token-2 py-token-1">
              <span className="flex gap-1" aria-hidden>
                <span className="thinking-dot" />
                <span className="thinking-dot" />
                <span className="thinking-dot" />
              </span>
              <span className="text-token-xs text-thinking-text">생각 중...</span>
            </div>
          )}

          {/* thinking 상태 + 부분 content (CoT 표시) */}
          {isAssistant && isThinking && content && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-token-xs text-thinking-text">
                <span className="flex gap-0.5" aria-hidden>
                  <span className="thinking-dot w-1 h-1" />
                  <span className="thinking-dot w-1 h-1" />
                  <span className="thinking-dot w-1 h-1" />
                </span>
                추론 중
              </div>
              <p className="text-token-sm text-text-muted italic whitespace-pre-wrap">
                {content}
              </p>
            </div>
          )}

          {/* 에러 상태 */}
          {isAssistant && isError && (
            <div className="flex items-center gap-2">
              <span className="text-error" aria-hidden>⚠</span>
              <span className="text-token-sm text-error">
                응답 생성 중 오류가 발생했습니다.
              </span>
            </div>
          )}
        </div>

        {/* ── 액션 바 (assistant 메시지만) ── */}
        {isAssistant && status === "done" && content && (
          <div
            className={cn(
              "flex items-center gap-2 mt-0.5",
              "opacity-0 group-hover:opacity-100 focus-within:opacity-100",
              "transition-opacity duration-fast",
            )}
            aria-label="메시지 액션"
          >
            <CopyButton content={content} onCopy={onCopy} />

            {onRegenerate && (
              <button
                onClick={onRegenerate}
                aria-label="이 응답 재생성"
                title="재생성"
                className={cn(
                  "flex items-center gap-1 px-2 py-0.5 rounded-token-sm text-[10px] font-medium",
                  "text-text-muted hover:text-text-primary bg-surface-overlay border border-line",
                  "transition-all duration-fast press",
                )}
              >
                ↺ 재생성
              </button>
            )}

            {tokenCount !== undefined && (
              <span className="text-[10px] text-text-muted ml-1">
                {tokenCount.toLocaleString()} tokens
              </span>
            )}
          </div>
        )}

        {/* ── 에러 상태 StatusIndicator ── */}
        {isAssistant && isError && (
          <StatusIndicator
            status="error"
            variant="inline"
            message="응답 생성 실패"
            onRetry={onRegenerate}
            className="mt-1"
          />
        )}
      </div>
    </article>
  );
}

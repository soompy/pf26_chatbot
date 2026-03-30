/**
 * StatusIndicator
 *
 * 로딩/에러/성공 등 AI 응답 처리 상태를 일관된 UX로 표현.
 *
 * 상태(status):
 *   idle      — 대기 중 (숨김)
 *   loading   — API 요청 중 (spinner)
 *   thinking  — AI 추론 중 (amber dots)
 *   streaming — 텍스트 생성 중 (violet cursor)
 *   success   — 완료 (green check, 자동 fade-out 옵션)
 *   error     — 오류 (red, 재시도 버튼)
 *
 * 변형(variant):
 *   inline  — 텍스트 옆 인라인 표시
 *   banner  — 전체 너비 상태 바
 *   dot     — 점 하나만 표시 (아이콘 위 배지 등)
 *
 * 접근성:
 *   role="status"  : 스크린리더가 상태 변경을 인지
 *   aria-live      : 동적 업데이트 알림
 *   aria-label     : 현재 상태 설명
 */

"use client";

import { useEffect, useState } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: Parameters<typeof clsx>) {
  return twMerge(clsx(inputs));
}

/* ── Types ─────────────────────────────────────────────── */

export type StatusState =
  | "idle"
  | "loading"
  | "thinking"
  | "streaming"
  | "success"
  | "error";

export type StatusVariant = "inline" | "banner" | "dot";

export interface StatusIndicatorProps {
  status: StatusState;
  variant?: StatusVariant;
  /** 상태 설명 메시지 (banner에서 표시) */
  message?: string;
  /** 재시도 콜백 (error 상태에서 버튼 표시) */
  onRetry?: () => void;
  /**
   * success 상태 자동 사라짐 지연(ms).
   * 0이면 자동 사라짐 없음 (기본 2000)
   */
  successAutoDismiss?: number;
  className?: string;
}

/* ── 상태별 설정 ─────────────────────────────────────── */

const STATE_CONFIG = {
  idle: {
    label:   "대기 중",
    color:   "text-text-muted",
    bgColor: "bg-surface",
    border:  "border-line",
  },
  loading: {
    label:   "불러오는 중",
    color:   "text-text-secondary",
    bgColor: "bg-surface",
    border:  "border-line",
  },
  thinking: {
    label:   "생각 중",
    color:   "text-thinking-text",
    bgColor: "bg-thinking-bg",
    border:  "border-thinking-border",
  },
  streaming: {
    label:   "응답 생성 중",
    color:   "text-streaming-cursor",
    bgColor: "bg-accent-subtle",
    border:  "border-accent-border",
  },
  success: {
    label:   "완료",
    color:   "text-success",
    bgColor: "bg-success/10",
    border:  "border-success/20",
  },
  error: {
    label:   "오류 발생",
    color:   "text-error",
    bgColor: "bg-error-bg",
    border:  "border-error-border",
  },
} satisfies Record<StatusState, { label: string; color: string; bgColor: string; border: string }>;

/* ── 아이콘 ─────────────────────────────────────────── */

function StatusIcon({ status }: { status: StatusState }) {
  switch (status) {
    case "loading":
      return (
        <span
          className="inline-block h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin"
          aria-hidden
        />
      );
    case "thinking":
      return (
        <span className="flex items-center gap-0.5" aria-hidden>
          <span className="thinking-dot w-1.5 h-1.5" />
          <span className="thinking-dot w-1.5 h-1.5" />
          <span className="thinking-dot w-1.5 h-1.5" />
        </span>
      );
    case "streaming":
      return (
        <span
          className="inline-block w-2 h-3.5 bg-current animate-[streaming-blink_0.6s_step-end_infinite] rounded-sm"
          aria-hidden
        />
      );
    case "success":
      return (
        <span
          className="inline-block text-base animate-[check-pop_0.25s_var(--ease-spring)_both]"
          aria-hidden
        >
          ✓
        </span>
      );
    case "error":
      return (
        <span className="inline-block text-sm" aria-hidden>
          ⚠
        </span>
      );
    default:
      return null;
  }
}

/* ── StatusIndicator ─────────────────────────────────── */

export function StatusIndicator({
  status,
  variant = "inline",
  message,
  onRetry,
  successAutoDismiss = 2000,
  className,
}: StatusIndicatorProps) {
  const [visible, setVisible] = useState(true);
  const config = STATE_CONFIG[status];

  // success 자동 fade-out
  useEffect(() => {
    if (status === "success" && successAutoDismiss > 0) {
      setVisible(true);
      const t = setTimeout(() => setVisible(false), successAutoDismiss);
      return () => clearTimeout(t);
    }
    setVisible(true);
  }, [status, successAutoDismiss]);

  if (status === "idle" || !visible) return null;

  const sharedLabel = message ?? config.label;
  const ariaProps = {
    role: "status" as const,
    "aria-live": "polite" as const,
    "aria-label": sharedLabel,
    "aria-busy": status === "loading" || status === "thinking" || status === "streaming",
  };

  /* ── dot 변형 ── */
  if (variant === "dot") {
    return (
      <span
        {...ariaProps}
        className={cn(
          "inline-block w-2 h-2 rounded-full",
          status === "loading" || status === "thinking" || status === "streaming"
            ? "animate-pulse"
            : "",
          status === "error"     && "bg-error",
          status === "success"   && "bg-success",
          status === "loading"   && "bg-text-muted",
          status === "thinking"  && "bg-thinking-cursor",
          status === "streaming" && "bg-streaming-cursor",
          className,
        )}
        title={sharedLabel}
      />
    );
  }

  /* ── banner 변형 ── */
  if (variant === "banner") {
    return (
      <div
        {...ariaProps}
        className={cn(
          "w-full flex items-center gap-3 px-4 py-2.5 rounded-token border text-token-sm font-medium",
          "animate-[fade-in_0.2s_ease-out]",
          config.bgColor,
          config.border,
          config.color,
          className,
        )}
      >
        <StatusIcon status={status} />
        <span className="flex-1">{sharedLabel}</span>

        {status === "error" && onRetry && (
          <button
            onClick={onRetry}
            className={cn(
              "text-token-xs px-2.5 py-1 rounded-token-sm border font-medium",
              "transition-opacity hover:opacity-80 active:scale-95",
              "border-error-border text-error",
            )}
          >
            재시도
          </button>
        )}
      </div>
    );
  }

  /* ── inline 변형 (기본) ── */
  return (
    <span
      {...ariaProps}
      className={cn(
        "inline-flex items-center gap-1.5 text-token-xs font-medium",
        config.color,
        className,
      )}
    >
      <StatusIcon status={status} />
      <span>{sharedLabel}</span>

      {status === "error" && onRetry && (
        <button
          onClick={onRetry}
          className="underline underline-offset-2 hover:opacity-70 transition-opacity ml-1"
        >
          재시도
        </button>
      )}
    </span>
  );
}

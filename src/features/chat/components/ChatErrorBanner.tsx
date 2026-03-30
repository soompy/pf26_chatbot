"use client";

/**
 * ChatErrorBanner — 에러 종류별 배너 UI
 *
 * kind에 따라 아이콘·색상·메시지를 달리 표시하고,
 * retryable일 때만 재시도 버튼을 노출한다.
 */

import type { ChatError } from "@/lib/api/errors";

interface Props {
  error: ChatError;
  onRetry?: () => void;
  onDismiss: () => void;
}

const KIND_META: Record<
  ChatError["kind"],
  { icon: string; colorClass: string; label: string }
> = {
  network:  { icon: "⚡", colorClass: "border-yellow-500/40 bg-yellow-500/10 text-yellow-300", label: "네트워크 오류" },
  timeout:  { icon: "⏱", colorClass: "border-orange-500/40 bg-orange-500/10 text-orange-300", label: "응답 시간 초과" },
  model:    { icon: "🤖", colorClass: "border-red-500/40 bg-red-500/10 text-red-300",          label: "모델 오류" },
  abort:    { icon: "✋", colorClass: "border-neutral-500/40 bg-neutral-500/10 text-neutral-400", label: "취소됨" },
  unknown:  { icon: "❓", colorClass: "border-red-500/40 bg-red-500/10 text-red-300",          label: "알 수 없는 오류" },
};

export function ChatErrorBanner({ error, onRetry, onDismiss }: Props) {
  const meta = KIND_META[error.kind];

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 mx-4 mb-3 px-4 py-3 rounded-xl border text-sm ${meta.colorClass}`}
    >
      <span aria-hidden="true" className="mt-0.5 shrink-0">{meta.icon}</span>

      <div className="flex-1 min-w-0">
        <p className="font-semibold leading-snug">{meta.label}</p>
        <p className="opacity-80 leading-snug mt-0.5">{error.message}</p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {error.retryable && onRetry && (
          <button
            onClick={onRetry}
            className="text-xs font-medium px-2.5 py-1 rounded-lg
                       bg-white/10 hover:bg-white/20 transition-colors"
          >
            재시도
          </button>
        )}
        <button
          onClick={onDismiss}
          aria-label="에러 닫기"
          className="opacity-60 hover:opacity-100 transition-opacity text-base leading-none"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

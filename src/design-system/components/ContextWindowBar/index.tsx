/**
 * ContextWindowBar
 *
 * 컨텍스트 윈도우 사용량을 시각화하는 진행 바.
 *
 * - 0–70%  : safe  (green)
 * - 70–90% : warning (amber)
 * - 90–100%: danger  (red, 깜빡임)
 *
 * 사용:
 *   <ContextWindowBar used={3200} total={8192} />
 *   <ContextWindowBar used={7500} total={8192} showLabel />
 */

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: Parameters<typeof clsx>) {
  return twMerge(clsx(inputs));
}

interface ContextWindowBarProps {
  /** 사용된 토큰 수 */
  used: number;
  /** 최대 컨텍스트 크기 */
  total: number;
  /** 토큰 수 텍스트 표시 여부 */
  showLabel?: boolean;
  className?: string;
}

type Level = "safe" | "warning" | "danger";

function getLevel(ratio: number): Level {
  if (ratio >= 0.9) return "danger";
  if (ratio >= 0.7) return "warning";
  return "safe";
}

function formatTokens(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

export function ContextWindowBar({
  used,
  total,
  showLabel = false,
  className,
}: ContextWindowBarProps) {
  const ratio  = Math.min(used / total, 1);
  const pct    = Math.round(ratio * 100);
  const level  = getLevel(ratio);

  const labelColor: Record<Level, string> = {
    safe:    "text-context-safe",
    warning: "text-context-warning",
    danger:  "text-context-danger",
  };

  return (
    <div className={cn("flex items-center gap-token-2", className)}>
      {/* 바 */}
      <div
        className="context-bar flex-1"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`컨텍스트 ${pct}% 사용`}
      >
        <div
          className="context-bar-fill"
          data-level={level}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* 레이블 */}
      {showLabel && (
        <span
          className={cn(
            "text-token-xs font-mono tabular-nums shrink-0",
            labelColor[level],
          )}
        >
          {formatTokens(used)} / {formatTokens(total)}
        </span>
      )}
    </div>
  );
}

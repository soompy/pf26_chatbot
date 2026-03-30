/**
 * ThinkingIndicator
 *
 * AI가 응답을 생성하기 전 추론 중임을 나타내는 컴포넌트.
 * 스트리밍 커서(violet)와 구분하기 위해 amber 팔레트를 사용.
 *
 * 사용:
 *   <ThinkingIndicator />
 *   <ThinkingIndicator label="분석 중..." compact />
 */

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: Parameters<typeof clsx>) {
  return twMerge(clsx(inputs));
}

interface ThinkingIndicatorProps {
  label?: string;
  /** 인라인 표시 (버블 내부에 넣을 때) */
  compact?: boolean;
  className?: string;
}

export function ThinkingIndicator({
  label = "생각 중",
  compact = false,
  className,
}: ThinkingIndicatorProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-token-2",
        compact ? "py-token-1" : "py-token-2 px-token-3",
        className,
      )}
      role="status"
      aria-label={label}
    >
      {/* amber thinking dots — .thinking-dot 클래스가 CSS에서 animation 적용 */}
      <span className="flex items-center gap-1" aria-hidden>
        <span className="thinking-dot" />
        <span className="thinking-dot" />
        <span className="thinking-dot" />
      </span>

      {!compact && (
        <span
          className="text-token-xs font-medium"
          style={{ color: "var(--color-thinking-text)" }}
        >
          {label}
        </span>
      )}
    </div>
  );
}

/**
 * StreamingCursor
 *
 * 스트리밍 텍스트 끝에 붙이는 블록 커서.
 * `.streaming-cursor::after` CSS 규칙으로 ▋ 문자를 표시.
 */
export function StreamingCursor({ className }: { className?: string }) {
  return (
    <span
      className={cn("streaming-cursor", className)}
      aria-hidden="true"
    />
  );
}

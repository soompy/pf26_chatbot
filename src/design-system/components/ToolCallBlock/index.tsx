/**
 * ToolCallBlock
 *
 * AI가 외부 도구(함수)를 호출할 때 결과를 표시하는 컴포넌트.
 * 호출 중 / 완료 / 오류 세 가지 상태를 지원.
 *
 * 사용:
 *   <ToolCallBlock name="search_web" args={{ query: "Next.js 15" }} status="running" />
 *   <ToolCallBlock name="read_file" result="..." status="done" />
 *   <ToolCallBlock name="exec_code" error="TimeoutError" status="error" />
 */

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: Parameters<typeof clsx>) {
  return twMerge(clsx(inputs));
}

type ToolCallStatus = "running" | "done" | "error";

interface ToolCallBlockProps {
  /** 도구(함수) 이름 */
  name: string;
  /** 입력 파라미터 (JSON 직렬화 가능한 값) */
  args?: Record<string, unknown>;
  /** 반환된 결과 문자열 */
  result?: string;
  /** 에러 메시지 */
  error?: string;
  status: ToolCallStatus;
  className?: string;
}

const STATUS_ICONS: Record<ToolCallStatus, string> = {
  running: "⟳",
  done:    "✓",
  error:   "✗",
};

const STATUS_LABELS: Record<ToolCallStatus, string> = {
  running: "실행 중",
  done:    "완료",
  error:   "오류",
};

export function ToolCallBlock({
  name,
  args,
  result,
  error,
  status,
  className,
}: ToolCallBlockProps) {
  const isDone    = status === "done";
  const isError   = status === "error";
  const isRunning = status === "running";

  return (
    <div
      className={cn(
        "tool-call my-token-2 text-token-sm",
        isError && "border-error-border bg-error-bg",
        className,
      )}
      role="region"
      aria-label={`도구 호출: ${name}`}
    >
      {/* 헤더 */}
      <div
        className={cn(
          "tool-call-header",
          isError && "text-error",
        )}
      >
        {/* 상태 아이콘 */}
        <span
          className={cn(
            "text-xs",
            isRunning && "animate-spin inline-block",
            isDone    && "animate-[check-pop_var(--duration-normal)_var(--ease-spring)_both]",
            isError   && "text-error",
          )}
          aria-hidden
        >
          {STATUS_ICONS[status]}
        </span>

        {/* 함수명 */}
        <span className="font-semibold">{name}()</span>

        {/* 상태 레이블 */}
        <span
          className={cn(
            "ml-auto text-[10px] font-normal opacity-70",
            isError && "opacity-100 text-error",
          )}
        >
          {STATUS_LABELS[status]}
        </span>
      </div>

      {/* 바디 */}
      <div className="tool-call-body space-y-token-2">
        {/* 입력 파라미터 */}
        {args && Object.keys(args).length > 0 && (
          <div>
            <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">
              입력
            </p>
            <pre className="text-text-secondary whitespace-pre-wrap !bg-transparent !border-0 !p-0 !m-0 text-xs">
              {JSON.stringify(args, null, 2)}
            </pre>
          </div>
        )}

        {/* 결과 */}
        {isDone && result && (
          <div>
            <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">
              결과
            </p>
            <p className="text-text-secondary text-xs line-clamp-3">{result}</p>
          </div>
        )}

        {/* 에러 */}
        {isError && error && (
          <p className="text-error text-xs">{error}</p>
        )}

        {/* 로딩 shimmer */}
        {isRunning && (
          <div className="space-y-1.5 pt-1">
            <div className="shimmer h-2 w-3/4 rounded" />
            <div className="shimmer h-2 w-1/2 rounded" />
          </div>
        )}
      </div>
    </div>
  );
}

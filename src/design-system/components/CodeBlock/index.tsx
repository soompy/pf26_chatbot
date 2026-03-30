/**
 * CodeBlock
 *
 * AI 응답 내 코드 블록 래퍼.
 * 언어 레이블 + 복사 버튼을 포함한 헤더를 제공.
 *
 * 사용:
 *   <CodeBlock language="typescript">
 *     {code}
 *   </CodeBlock>
 */

"use client";

import { useState } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: Parameters<typeof clsx>) {
  return twMerge(clsx(inputs));
}

interface CodeBlockProps {
  language?: string;
  /** 파일 이름 (선택) */
  filename?: string;
  children: React.ReactNode;
  className?: string;
}

export function CodeBlock({
  language,
  filename,
  children,
  className,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const text =
      typeof children === "string"
        ? children
        : (document.querySelector(`[data-code-block-id="${filename ?? language}"] code`)
            ?.textContent ?? "");

    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const label = filename ?? language ?? "code";

  return (
    <div
      className={cn("rounded-token-lg border border-line overflow-hidden", className)}
      data-code-block-id={label}
    >
      {/* 헤더 — .code-block-header CSS 클래스 적용 */}
      <div className="code-block-header">
        <div className="flex items-center gap-token-2">
          {/* 언어 dot */}
          <span
            className="w-2 h-2 rounded-full bg-accent opacity-70"
            aria-hidden
          />
          <span>{label}</span>
        </div>

        {/* 복사 버튼 */}
        <button
          onClick={handleCopy}
          className={cn(
            "flex items-center gap-1 px-token-2 py-0.5 rounded-token-sm text-[10px] font-medium",
            "transition-all duration-fast press",
            copied
              ? "text-context-safe bg-success-bg border border-success-border"
              : "text-text-muted hover:text-text-primary hover:bg-surface-overlay border border-transparent",
          )}
          aria-label="코드 복사"
        >
          {copied ? (
            <>
              <span className="animate-[check-pop_var(--duration-normal)_var(--ease-spring)_both]">
                ✓
              </span>
              복사됨
            </>
          ) : (
            <>
              <span aria-hidden>⎘</span>
              복사
            </>
          )}
        </button>
      </div>

      {/* 코드 내용 — 헤더 아래 pre 태그의 상단 radius는 CSS에서 제거됨 */}
      {children}
    </div>
  );
}

/**
 * StreamingText
 *
 * AI 응답 텍스트를 스트리밍 중/완료 두 모드로 렌더링.
 *
 * 스트리밍 중:
 *   - 단락(\n\n) 단위로 분리 → 마지막 단락에 chunk-appear 애니메이션
 *   - 블록 커서(▋)를 텍스트 끝에 표시
 *
 * 완료:
 *   - ReactMarkdown + GFM + 코드 하이라이팅으로 전체 렌더링
 *
 * 접근성:
 *   - aria-live="polite" : 스크린리더가 스트리밍 완료 후 읽어줌
 *   - aria-atomic="false" : 추가되는 내용만 알림
 *   - aria-busy          : 스트리밍 중임을 명시
 */

"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Components } from "react-markdown";

function cn(...inputs: Parameters<typeof clsx>) {
  return twMerge(clsx(inputs));
}

/* ── Props ─────────────────────────────────────────────── */

export interface StreamingTextProps {
  /** 렌더링할 텍스트 (누적 완성본) */
  content: string;
  /** true 동안 커서 표시 + chunk 애니메이션 */
  isStreaming?: boolean;
  /** 마크다운 파싱 여부 (기본 true) */
  markdown?: boolean;
  /**
   * 스트리밍 중 단락 단위 chunk 애니메이션 여부 (기본 true).
   * false 시 전체 텍스트를 단순 pre-wrap으로 표시.
   */
  animateChunks?: boolean;
  className?: string;
}

/* ── Markdown 커스텀 렌더러 ───────────────────────────── */

const markdownComponents: Components = {
  // 인라인 코드
  code({ className, children, ...props }) {
    const isBlock = Boolean(className);
    if (!isBlock) {
      return (
        <code
          className="code-inline"
          {...props}
        >
          {children}
        </code>
      );
    }
    return (
      <code className={cn(className, "text-xs")} {...props}>
        {children}
      </code>
    );
  },
  // 코드 블록 — pre 래퍼
  pre({ children, ...props }) {
    return (
      <pre
        className="my-3 overflow-x-auto rounded-token-lg border border-line bg-[#0d1117] p-4 text-xs"
        {...props}
      >
        {children}
      </pre>
    );
  },
  // 링크
  a({ href, children, ...props }) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-accent underline underline-offset-2 hover:text-accent-hover transition-colors"
        {...props}
      >
        {children}
      </a>
    );
  },
  // 인용문
  blockquote({ children, ...props }) {
    return (
      <blockquote
        className="citation my-3"
        {...props}
      >
        {children}
      </blockquote>
    );
  },
  // 테이블
  table({ children, ...props }) {
    return (
      <div className="overflow-x-auto my-3">
        <table
          className="w-full text-xs border-collapse border border-line rounded"
          {...props}
        >
          {children}
        </table>
      </div>
    );
  },
  th({ children, ...props }) {
    return (
      <th
        className="border border-line px-3 py-2 bg-surface-raised text-left font-semibold text-text-primary"
        {...props}
      >
        {children}
      </th>
    );
  },
  td({ children, ...props }) {
    return (
      <td className="border border-line px-3 py-2 text-text-secondary" {...props}>
        {children}
      </td>
    );
  },
};

/* ── StreamingText ────────────────────────────────────── */

export function StreamingText({
  content,
  isStreaming = false,
  markdown = true,
  animateChunks = true,
  className,
}: StreamingTextProps) {
  // 완료 전환 시 fade 애니메이션을 위해 직전 streaming 상태를 추적
  const [justFinished, setJustFinished] = useState(false);
  const prevStreamingRef = useRef(isStreaming);

  useEffect(() => {
    if (prevStreamingRef.current && !isStreaming) {
      // 스트리밍 완료 → 마크다운 전환 애니메이션
      setJustFinished(true);
      const t = setTimeout(() => setJustFinished(false), 400);
      return () => clearTimeout(t);
    }
    prevStreamingRef.current = isStreaming;
  }, [isStreaming]);

  /* ── 스트리밍 중 렌더 ── */
  if (isStreaming && animateChunks) {
    // 단락(\n\n) 단위 분리 — 마지막 단락만 chunk-appear 적용
    const paragraphs = content.split(/\n\n+/);

    return (
      <div
        className={cn("text-token-base leading-relaxed", className)}
        role="status"
        aria-live="polite"
        aria-atomic="false"
        aria-busy="true"
        aria-label="AI가 응답을 생성하고 있습니다"
      >
        {paragraphs.map((para, i) => {
          const isLast = i === paragraphs.length - 1;
          return (
            <p
              key={i}
              className={cn(
                "mb-2 last:mb-0 whitespace-pre-wrap break-words",
                isLast && "chunk-appear",
              )}
            >
              {para}
              {/* 마지막 단락 끝에 블록 커서 */}
              {isLast && (
                <span
                  className="streaming-cursor"
                  aria-hidden="true"
                />
              )}
            </p>
          );
        })}
      </div>
    );
  }

  /* ── 스트리밍 중이지만 animateChunks=false ── */
  if (isStreaming && !animateChunks) {
    return (
      <div
        className={cn("text-token-base leading-relaxed whitespace-pre-wrap break-words", className)}
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        {content}
        <span className="streaming-cursor" aria-hidden="true" />
      </div>
    );
  }

  /* ── 완료: 마크다운 렌더 ── */
  if (markdown) {
    return (
      <div
        className={cn(
          "prose prose-invert prose-sm max-w-none",
          "prose-p:leading-relaxed prose-p:mb-2 prose-p:last:mb-0",
          "prose-headings:text-text-primary prose-headings:font-semibold",
          "prose-strong:text-text-primary prose-em:text-text-secondary",
          "prose-li:text-token-base prose-li:leading-relaxed",
          justFinished && "animate-[fade-in_0.3s_ease-out_both]",
          className,
        )}
        role="region"
        aria-live="polite"
        aria-atomic="true"
        aria-busy="false"
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
          components={markdownComponents}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  }

  /* ── 완료: plain text ── */
  return (
    <p
      className={cn(
        "text-token-base leading-relaxed whitespace-pre-wrap break-words",
        justFinished && "animate-[fade-in_0.3s_ease-out_both]",
        className,
      )}
      role="region"
      aria-live="polite"
    >
      {content}
    </p>
  );
}

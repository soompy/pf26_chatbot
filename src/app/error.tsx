"use client";

/**
 * Next.js App Router 라우트 레벨 에러 바운더리
 * 서버 컴포넌트 및 데이터 패칭 오류를 처리한다.
 */

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Route Error]", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg text-text-primary px-6">
      <div className="text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-error/15 flex items-center justify-center mx-auto">
          <span className="text-error text-2xl" aria-hidden>⚠</span>
        </div>
        <div>
          <h2 className="text-base font-semibold text-text-primary">
            페이지를 불러오는 중 오류가 발생했습니다
          </h2>
          {error.message && (
            <p className="text-text-muted text-xs mt-1.5 font-mono">{error.message}</p>
          )}
        </div>
        <button
          onClick={reset}
          className="px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors"
        >
          다시 시도
        </button>
      </div>
    </div>
  );
}

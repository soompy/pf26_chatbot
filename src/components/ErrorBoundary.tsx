"use client";

/**
 * ErrorBoundary — React 클래스 기반 런타임 에러 캐치
 *
 * 함수형 컴포넌트에서는 불가능한 componentDidCatch를 구현.
 * ChatLayout 등 핵심 UI를 감싸 예상치 못한 렌더링 오류를
 * 앱 전체 크래시 없이 fallback UI로 대체한다.
 */

import React from "react";

interface Props {
  children: React.ReactNode;
  /** 에러 발생 시 대체할 커스텀 UI. 생략 시 기본 fallback 사용. */
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <DefaultFallback error={this.state.error} onReset={this.handleReset} />
        )
      );
    }
    return this.props.children;
  }
}

function DefaultFallback({
  error,
  onReset,
}: {
  error: Error | null;
  onReset: () => void;
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-5 text-center px-6 min-h-[300px]">
      <div className="w-14 h-14 rounded-2xl bg-error/15 flex items-center justify-center">
        <span className="text-error text-2xl" aria-hidden>⚠</span>
      </div>
      <div>
        <p className="text-text-primary font-semibold text-base">
          예상치 못한 오류가 발생했습니다
        </p>
        {error?.message && (
          <p className="text-text-muted text-xs mt-1.5 font-mono break-all max-w-sm">
            {error.message}
          </p>
        )}
      </div>
      <button
        onClick={onReset}
        className="px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors press"
      >
        다시 시도
      </button>
    </div>
  );
}

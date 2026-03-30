/**
 * ChatError — LLM API 에러 타입 계층
 *
 * kind 값으로 에러 종류를 구분하고, retryable 플래그로
 * 자동 재시도 여부를 결정한다.
 *
 * 사용 패턴:
 *   catch (e) {
 *     if (e instanceof ModelError && e.statusCode === 429) { ... }
 *     if (e instanceof ChatError && e.retryable) { retry(); }
 *   }
 */

/* ── 에러 종류 ─────────────────────────────────────────── */

export type ChatErrorKind =
  | "network"   // fetch 자체 실패 (DNS, CORS, 연결 거부)
  | "timeout"   // AbortController 타임아웃
  | "model"     // API가 에러 응답 반환 (4xx / 5xx)
  | "abort"     // 사용자가 직접 취소
  | "unknown";  // 분류되지 않은 예외

/* ── 기반 클래스 ───────────────────────────────────────── */

export class ChatError extends Error {
  readonly kind: ChatErrorKind;
  /** true면 UI에서 재시도 버튼을 노출 */
  readonly retryable: boolean;
  /** 원본 에러 (디버깅용) */
  readonly cause?: unknown;

  constructor(
    message: string,
    kind: ChatErrorKind,
    retryable: boolean,
    cause?: unknown,
  ) {
    super(message);
    this.name = "ChatError";
    this.kind = kind;
    this.retryable = retryable;
    this.cause = cause;
  }
}

/* ── 네트워크 에러 ─────────────────────────────────────── */

/** fetch() 자체가 실패한 경우 (오프라인, CORS, DNS 오류 등) */
export class NetworkError extends ChatError {
  constructor(cause?: unknown) {
    super(
      "네트워크에 연결할 수 없습니다. 인터넷 연결을 확인해주세요.",
      "network",
      true,
      cause,
    );
    this.name = "NetworkError";
  }
}

/* ── 타임아웃 에러 ─────────────────────────────────────── */

/** AbortController로 설정한 시간 내에 응답이 없는 경우 */
export class TimeoutError extends ChatError {
  readonly timeoutMs: number;

  constructor(timeoutMs: number) {
    super(
      `응답 시간이 초과됐습니다 (${timeoutMs / 1000}초). 다시 시도해주세요.`,
      "timeout",
      true,
    );
    this.name = "TimeoutError";
    this.timeoutMs = timeoutMs;
  }
}

/* ── 모델 에러 ─────────────────────────────────────────── */

/** LLM API 서버가 에러 응답(4xx/5xx)을 반환한 경우 */
export class ModelError extends ChatError {
  readonly statusCode: number;
  readonly apiMessage?: string;

  constructor(statusCode: number, apiMessage?: string) {
    const { message, retryable } = ModelError.classify(statusCode, apiMessage);
    super(message, "model", retryable);
    this.name = "ModelError";
    this.statusCode = statusCode;
    this.apiMessage = apiMessage;
  }

  private static classify(
    statusCode: number,
    apiMessage?: string,
  ): { message: string; retryable: boolean } {
    switch (statusCode) {
      case 400:
        return { message: "잘못된 요청입니다. 입력 내용을 확인해주세요.", retryable: false };
      case 401:
        return { message: "API 인증에 실패했습니다. 관리자에게 문의해주세요.", retryable: false };
      case 403:
        return { message: "이 모델에 대한 접근 권한이 없습니다.", retryable: false };
      case 429:
        return { message: "요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.", retryable: true };
      case 500:
      case 502:
      case 503:
        return { message: "AI 서버에 일시적인 문제가 발생했습니다. 다시 시도해주세요.", retryable: true };
      case 529:
        return { message: "AI 서비스가 과부하 상태입니다. 잠시 후 다시 시도해주세요.", retryable: true };
      default:
        return {
          message: apiMessage ?? `오류가 발생했습니다 (${statusCode}).`,
          retryable: statusCode >= 500,
        };
    }
  }
}

/* ── 사용자 취소 ───────────────────────────────────────── */

/** abort()를 사용자가 직접 호출한 경우 */
export class AbortError extends ChatError {
  constructor() {
    super("요청이 취소됐습니다.", "abort", false);
    this.name = "AbortError";
  }
}

/* ── 에러 분류 유틸 ────────────────────────────────────── */

/**
 * unknown 예외를 ChatError 하위 타입으로 변환.
 * streaming.ts / useChat.ts의 catch 블록에서 사용.
 */
export function toChatError(error: unknown): ChatError {
  if (error instanceof ChatError) return error;

  if (error instanceof DOMException && error.name === "AbortError") {
    // AbortController.abort()가 호출된 경우
    // — TimeoutError 구분은 abort 시 reason 확인
    return new AbortError();
  }

  if (error instanceof TypeError && error.message.includes("fetch")) {
    // fetch() 자체 실패 (네트워크 오류)
    return new NetworkError(error);
  }

  if (error instanceof Error) {
    return new ChatError(error.message, "unknown", false, error);
  }

  return new ChatError("알 수 없는 오류가 발생했습니다.", "unknown", false, error);
}

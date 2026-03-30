# AI Chatbot UI

> LLM 기반 AI 챗봇 서비스의 프론트엔드 아키텍처 포트폴리오
> **Next.js 15 · React 19 · TypeScript · Tailwind CSS · Zustand**

[![Next.js](https://img.shields.io/badge/Next.js-15.2-black?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38BDF8?logo=tailwindcss)](https://tailwindcss.com)

---

## 핵심 어필 포인트

| 역량 | 구현 내용 |
|------|----------|
| **AI 서비스 전용 컴포넌트 설계** | LLM 응답 단계(thinking → streaming → done)를 상태 머신으로 모델링, 13개 UI 컴포넌트로 분리 |
| **UI 디자인 시스템 구축** | Primitive → Semantic → Component 3-tier 토큰 구조, 다크/라이트 모드, CSS 변수 기반 |
| **LLM API 연동 레이어** | OpenAI · Anthropic SSE 스트리밍을 단일 async generator로 추상화, 청크 단위 실시간 렌더링 |
| **UX 기반 상태 워크플로우** | 낙관적 업데이트, 30초 타임아웃, AbortController 취소, 에러 타입별 재시도 제어 |
| **API 연동 UI 데이터 바인딩** | Zustand persist 스토어 + useChat 훅으로 스트리밍 상태를 UI에 단방향 바인딩 |

---

## 목차

- [프로젝트 개요](#프로젝트-개요)
- [기술 스택](#기술-스택)
- [아키텍처](#아키텍처)
- [AI 전용 디자인 시스템](#ai-전용-디자인-시스템)
- [스트리밍 상태 관리](#스트리밍-상태-관리)
- [에러 처리 레이어](#에러-처리-레이어)
- [실행 방법](#실행-방법)

---

## 프로젝트 개요

AI 챗봇 서비스를 처음부터 설계하며 **"LLM 응답의 특수성을 어떻게 UI로 풀어낼 것인가"** 에 집중한 포트폴리오입니다.

일반 웹 서비스와 달리 AI 챗봇은 응답이 한 번에 오지 않고 **스트리밍으로 흐릅니다.** 이 특수성을 고려해 컴포넌트 상태 설계, 에러 분류, UX 인터랙션 제한 조건을 처음부터 AI 응답 맥락으로 설계했습니다.

```
🌐 Live Demo  : http://localhost:3000
📐 디자인 시스템: http://localhost:3000/design-system
```

---

## 기술 스택

| 분류 | 기술 | 선택 이유 |
|------|------|----------|
| Framework | Next.js 15 (App Router) | Edge Runtime으로 SSE 스트림 직접 프록시 |
| UI | React 19 | Concurrent Features로 스트리밍 중 UI 블로킹 방지 |
| 상태관리 | Zustand 5 + persist | 대화 이력 localStorage 영속화, skipHydration으로 SSR 불일치 방지 |
| 스타일 | Tailwind CSS 3 + CSS Variables | 런타임 테마 전환을 CSS 변수로 처리, 빌드타임 의존 없음 |
| 마크다운 | react-markdown + rehype-highlight | 스트리밍 완료 후 코드 하이라이팅 포함 마크다운 전환 |
| 아이콘 | lucide-react | Tree-shakeable SVG, 번들 사이즈 최소화 |

---

## 아키텍처

```
┌─────────────────────────────────────────────────────────┐
│  app/                 Next.js App Router                 │
│    ├── page.tsx        메인 채팅 UI                      │
│    ├── design-system/  컴포넌트 쇼케이스 (13개 섹션)    │
│    └── api/chat/       Edge Route — OpenAI/Anthropic 프록시│
├─────────────────────────────────────────────────────────┤
│  features/chat/        도메인 레이어                     │
│    ├── hooks/useChat   메인 훅 (API 연동 + 상태 바인딩)  │
│    ├── stores/         Zustand (대화 이력, 모델 선택)    │
│    └── components/     store 연결 래퍼 컴포넌트          │
├─────────────────────────────────────────────────────────┤
│  design-system/        순수 UI 레이어 (store 비의존)     │
│    ├── components/     13개 AI 전용 컴포넌트             │
│    └── tokens/         CSS 변수 TypeScript 매핑          │
├─────────────────────────────────────────────────────────┤
│  lib/api/              네트워크 레이어                   │
│    ├── streaming.ts    SSE async generator               │
│    └── errors.ts       ChatError 5-tier 타입 계층        │
└─────────────────────────────────────────────────────────┘
```

### 단방향 의존성 원칙

```
app → features/chat → design-system
                    → lib/api

design-system  →  (store 의존 없음)
lib/api        →  (React 의존 없음)
```

`design-system` 컴포넌트는 순수 UI만 담당합니다. store 연결은 항상 `features/chat/components/` 래퍼에서만 이루어지며, 이는 **컴포넌트를 어떤 프로젝트에도 재사용 가능하게** 합니다.

---

## AI 전용 디자인 시스템

### 3-Tier 토큰 구조

```
Primitive (원시값)
  └── --duration-fast: 150ms
  └── --radius-bubble: 18px

    ↓ 의미 부여

Semantic (역할 기반)
  └── --color-text-primary
  └── --color-streaming-glow    ← AI 전용
  └── --color-thinking-border   ← AI 전용

    ↓ 컴포넌트에 적용

Component (클래스)
  └── .bubble-ai { background: var(--color-bubble-ai); ... }
  └── .is-streaming { box-shadow: var(--shadow-streaming); }
  └── .thinking-dot { animation: thinking-pulse 1.2s infinite; }
```

일반 UI 토큰과 AI 응답 전용 토큰을 명확히 분리해 **AI 서비스 특성이 일반 컴포넌트에 오염되지 않도록** 설계했습니다.

### AI 응답 상태별 컴포넌트

| 단계 | 컴포넌트 | 시각 표현 |
|------|---------|----------|
| 연결 중 | `MessageSkeleton` | shimmer 애니메이션 |
| 추론 중 | `ThinkingIndicator` | amber dots (3개 순차 페이드) |
| 응답 생성 중 | `StreamingText` | violet 블록 커서 + 단락 fade-in |
| 완료 | `StreamingText` (markdown) | react-markdown 전환 + 0.3s fade |
| 오류 | `ChatErrorBanner` | 에러 kind별 색상·아이콘 |

### 컴포넌트 목록 (13개)

```
AI 응답 특화          범용 채팅 UI          상태/피드백
─────────────         ─────────────         ────────────
MessageBubble         ChatInput             StatusIndicator
StreamingText         Avatar                Skeleton / MessageSkeleton
ThinkingIndicator     Button                Badge
ToolCallBlock         CodeBlock
ContextWindowBar      ThemeToggle
```

### 다크/라이트 모드

런타임 CSS 변수 교체 방식으로 구현해 **시스템 테마 변경 시 깜빡임이 없습니다.**

```css
/* 라이트 기본값 */
:root {
  --color-bg: #ffffff;
  --color-bubble-ai: #f8f9ff;
}

/* 다크 오버라이드 — JavaScript 없이 즉시 적용 */
[data-theme="dark"] {
  --color-bg: #0f0f13;
  --color-bubble-ai: #1a1a2e;
}
```

---

## 스트리밍 상태 관리

### useChat 훅 — 핵심 설계 결정

```typescript
export function useChat(): UseChatReturn {
  // 1. 낙관적 업데이트: API 응답 전에 UI 먼저 반영
  addMessage(threadId, { role: "user", status: "done", ... });
  addMessage(threadId, { role: "assistant", status: "streaming", content: "" });

  // 2. AbortController: 사용자 취소 + 타임아웃 공유
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    isTimeoutRef.current = true;
    controller.abort();          // 동일한 abort 사용
  }, 30_000);

  // 3. SSE async generator 소비
  for await (const chunk of streamChatCompletion(body, signal)) {
    accumulated += chunk;
    updateMessage(..., { content: accumulated, status: "streaming" });
  }

  // 4. 에러 분류 → 재시도 가능 여부 판단
  const chatErr = isTimeoutRef.current
    ? new TimeoutError(30_000)
    : toChatError(err);

  // 5. retry(): lastRequestRef로 동일 인자 재실행
  const retry = () => _execute(lastRequestRef.current);
}
```

### 스트리밍 상태 머신

```
idle
 │ sendMessage()
 ▼
[낙관적 업데이트] — 사용자 메시지 즉시 표시
 │
 ▼
loading — MessageSkeleton 표시 (content === "")
 │ 첫 청크 도착
 ▼
streaming — StreamingText에 누적 텍스트 전달, 커서 표시
 │
 ├── [사용자 취소] → AbortError → status: done (수신 텍스트 보존)
 ├── [30초 초과]  → TimeoutError → status: error + 재시도 버튼
 ├── [네트워크 끊김] → NetworkError → status: error + 재시도 버튼
 ├── [API 오류]   → ModelError(status코드) → status: error
 └── [정상 완료]  → status: done → ReactMarkdown 전환
```

### Zustand Store 설계

```typescript
// SSR ↔ 클라이언트 하이드레이션 불일치 방지
persist(store, {
  skipHydration: true,           // 서버에서는 초기값 유지
  partialize: (s) => ({          // 필요한 슬라이스만 직렬화
    threads: s.threads,
    selectedModel: s.selectedModel,
    activeThreadId: s.activeThreadId,
    // streamingMessageId 제외 — 세션 간 의미 없음
  }),
})

// 클라이언트 마운트 후 StoreHydration 컴포넌트가 rehydrate() 호출
```

---

## 에러 처리 레이어

### ChatError 5-tier 타입 계층

```
ChatError (기반)
  .kind: "network" | "timeout" | "model" | "abort" | "unknown"
  .retryable: boolean    ← UI 재시도 버튼 노출 여부
  .cause?: unknown       ← 원본 예외 보존
  │
  ├── NetworkError    retryable=true  — fetch() 실패 (오프라인, CORS)
  ├── TimeoutError    retryable=true  — 30초 초과
  ├── ModelError      retryable=?     — HTTP 상태코드별 자동 분류
  │     400 → false (잘못된 요청)
  │     429 → true  (Rate limit, 재시도 가능)
  │     5xx → true  (서버 장애, 재시도 가능)
  ├── AbortError      retryable=false — 사용자 직접 취소
  └── ChatError       retryable=false — 미분류
```

### toChatError() — 경계면 단일 처리

```typescript
// catch 블록에서 unknown → ChatError 변환을 단일 함수로 처리
const chatErr = isTimeoutRef.current
  ? new TimeoutError(TIMEOUT_MS)
  : toChatError(err);           // DOMException, TypeError, Error 자동 분류
```

모든 에러는 `ChatErrorBanner`에서 `kind`별 색상·아이콘·메시지로 표현됩니다.

---

## 실행 방법

```bash
git clone https://github.com/soompy/pf26_chatbot.git
cd pf26_chatbot
npm install

# .env.local 설정
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

npm run dev
# http://localhost:3000       메인 챗봇
# http://localhost:3000/design-system   컴포넌트 쇼케이스
```

### 지원 모델

| 모델 | 프로바이더 |
|------|-----------|
| gpt-4o | OpenAI |
| gpt-4o-mini | OpenAI |
| claude-opus-4-6 | Anthropic |
| claude-sonnet-4-6 | Anthropic |

> API Route가 모델 ID를 감지해 OpenAI/Anthropic SSE 포맷을 자동 분기하고,
> 클라이언트는 단일 파서(`streamChatCompletion`)로 처리합니다.

---

## 프로젝트 구조

```
src/
├── app/
│   ├── page.tsx                  # 메인 채팅 페이지
│   ├── layout.tsx                # StoreHydration 등록
│   ├── design-system/page.tsx    # 컴포넌트 쇼케이스
│   └── api/chat/route.ts         # Edge API Route
├── design-system/
│   ├── components/               # 13개 순수 UI 컴포넌트
│   └── tokens/index.ts           # 디자인 토큰 TS 매핑
├── features/chat/
│   ├── hooks/useChat.ts          # 메인 상태+API 훅
│   ├── hooks/useStreamingChat.ts # 레거시 호환 훅
│   ├── stores/chatStore.ts       # Zustand store
│   ├── components/               # store 연결 래퍼
│   └── types/chat.types.ts       # 공통 타입 정의
├── lib/api/
│   ├── streaming.ts              # SSE async generator
│   └── errors.ts                 # ChatError 타입 계층
└── docs/
    └── frontend-guidelines.md    # 팀 개발 가이드라인
```

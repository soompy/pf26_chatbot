# AI 챗봇 UI — 프론트엔드 개발 가이드라인

> **대상**: 이 프로젝트에 참여하는 프론트엔드 개발자 / 디자이너
> **기준 코드**: `src/design-system/`, `src/features/chat/`
> **마지막 업데이트**: 2026-03-31

---

## 목차

1. [아키텍처 개요](#1-아키텍처-개요)
2. [컴포넌트 사용 규칙](#2-컴포넌트-사용-규칙)
3. [AI 응답 UX 패턴](#3-ai-응답-ux-패턴)
4. [에러 메시지 작성 원칙](#4-에러-메시지-작성-원칙)
5. [디자인 토큰 사용 규칙](#5-디자인-토큰-사용-규칙)
6. [디자이너–개발자 협업 체크리스트](#6-디자이너개발자-협업-체크리스트)

---

## 1. 아키텍처 개요

### 레이어 구조

```
┌─────────────────────────────────────────────────────┐
│  app/              Next.js 15 App Router 페이지      │
├─────────────────────────────────────────────────────┤
│  features/chat/    도메인 로직 (훅, 스토어, 타입)    │
│    ├── hooks/      useChat (상태 + API 통신)          │
│    ├── stores/     chatStore (Zustand persist)       │
│    └── components/ store와 연결된 기능 컴포넌트      │
├─────────────────────────────────────────────────────┤
│  design-system/    순수 UI 컴포넌트 (store 비의존)   │
│    ├── components/ MessageBubble, ChatInput, ...    │
│    └── tokens/     CSS 변수 TypeScript 매핑          │
├─────────────────────────────────────────────────────┤
│  lib/api/          네트워크 레이어                   │
│    ├── streaming.ts  SSE async generator            │
│    └── errors.ts    ChatError 타입 계층             │
└─────────────────────────────────────────────────────┘
```

### 핵심 원칙

| 원칙 | 내용 |
|------|------|
| **단방향 의존** | `design-system` → store 의존 금지. store 연결은 `features/chat/components`에서만 |
| **낙관적 업데이트** | 메시지 전송 즉시 UI 반영, API 응답을 기다리지 않음 |
| **에러 분류** | `toChatError()`로 모든 예외를 `ChatError` 하위 타입으로 변환 후 처리 |
| **스트리밍 우선** | 모든 AI 응답은 SSE 스트림으로 수신, 완료 후 마크다운 전환 |

---

## 2. 컴포넌트 사용 규칙

### 2.1 MessageBubble

**위치**: `src/design-system/components/MessageBubble/index.tsx`

순수 UI 컴포넌트. store에 직접 연결하지 않는다.

```
✅ 올바른 사용
features/chat/components/MessageBubble.tsx  ← store 연결 래퍼
  └── design-system/MessageBubble           ← props만 받음

❌ 잘못된 사용
design-system/MessageBubble 내부에서 useChatStore() 직접 호출
```

#### status별 렌더링 매핑

| `status` | `isStreaming` | `isThinking` | 렌더 결과 |
|----------|--------------|--------------|-----------|
| `streaming` | `true` | `false` | 블록 커서 + violet glow + 단락 애니메이션 |
| `streaming` | `false` | `true` | amber dots + "생각 중..." 텍스트 |
| `done` | `false` | `false` | ReactMarkdown 전체 렌더 (fade-in) |
| `error` | `false` | `false` | ⚠ 아이콘 + 빨간 배경 + StatusIndicator |

#### Props 선택 기준

```typescript
// content가 없고 AI가 추론 중일 때
<MessageBubble role="assistant" content="" isThinking={true} status="streaming" />

// 텍스트가 쌓이고 있을 때
<MessageBubble role="assistant" content={accumulated} isStreaming={true} status="streaming" />

// 완료 후 마크다운 렌더
<MessageBubble role="assistant" content={fullText} status="done" markdown={true} />

// onRegenerate는 status="done"인 assistant 메시지에만 전달
<MessageBubble role="assistant" status="done" onRegenerate={handleRegenerate} />
```

---

### 2.2 StreamingText

**위치**: `src/design-system/components/StreamingText/index.tsx`

MessageBubble 내부에서 assistant 응답을 렌더링하는 전용 컴포넌트.
MessageBubble 외부에서 직접 사용하는 경우는 드물다.

#### 동작 모드

```
isStreaming=true, animateChunks=true  → 단락(\n\n) 분리 + chunk-appear 애니메이션 + 블록 커서
isStreaming=true, animateChunks=false → 단순 whitespace-pre-wrap + 커서만
isStreaming=false, markdown=true      → ReactMarkdown + GFM + rehype-highlight
isStreaming=false, markdown=false     → <p> 태그 plain text
```

> **주의**: `animateChunks=false`는 성능 민감 환경(모바일 저사양)에서만 사용.
> 기본값(`true`)을 변경하려면 팀 리뷰 필요.

---

### 2.3 ChatInput (design-system)

**위치**: `src/design-system/components/ChatInput/index.tsx`

store 비의존 base 컴포넌트. `features/chat/components/ChatInput/ChatInput.tsx`에서 래핑해 사용.

#### Props 의사결정 트리

```
새 입력 영역 필요?
├── 채팅 맥락 → features/chat/components/ChatInput 사용 (이미 store 연결됨)
└── 독립 입력 → design-system/ChatInput 직접 사용
      ├── 파일 첨부 필요? → acceptedFileTypes, maxAttachments 지정
      ├── 글자 수 제한? → maxLength 지정 (0 = 제한 없음)
      └── 음성 입력 불필요? → showVoiceInput={false}
```

#### 스트리밍 중 자동 동작 (개발자가 별도 처리 불필요)

- `placeholder`가 "응답 생성 중..."으로 자동 변경
- 전송 버튼 → 중단 버튼(`Square` 아이콘)으로 자동 교체
- `isStreaming=true`일 때 `handleSubmit` 내부에서 전송 차단

---

### 2.4 StatusIndicator

**위치**: `src/design-system/components/StatusIndicator/index.tsx`

AI 처리 단계를 시각적으로 표현. `variant`로 표시 방식을 선택한다.

| variant | 언제 사용 |
|---------|----------|
| `inline` | 메시지 버블 하단, 에러 재시도 링크 |
| `banner` | 전체 너비 상태 바, 네트워크 단절 알림 |
| `dot` | 아이콘/아바타 위 뱃지, 사이드바 스레드 상태 |

```typescript
// ✅ 에러 상태에서 재시도 포함
<StatusIndicator status="error" variant="inline" message="응답 생성 실패" onRetry={retry} />

// ✅ 스트리밍 상태 배너
<StatusIndicator status="streaming" variant="banner" message="응답 생성 중..." />

// ❌ idle 상태는 렌더링 안 됨 — 조건부 렌더 불필요
<StatusIndicator status="idle" /> // → null 반환
```

---

### 2.5 CodeBlock

**위치**: `src/design-system/components/CodeBlock/index.tsx`

AI 응답 내 코드 블록에 사용. StreamingText의 마크다운 렌더러가 자동으로 사용하므로
**직접 호출이 필요한 경우는 사용자가 코드를 입력하는 UI뿐**이다.

```typescript
// 언어와 파일명 모두 있으면 파일명이 우선 표시
<CodeBlock language="typescript" filename="useChat.ts">
  {codeString}
</CodeBlock>

// 언어만
<CodeBlock language="bash">{command}</CodeBlock>
```

---

### 2.6 ChatErrorBanner

**위치**: `src/features/chat/components/ChatErrorBanner.tsx`

`useChat()`이 반환하는 `error: ChatError | null`을 받아 렌더링.
`error.retryable === true`일 때만 재시도 버튼이 표시된다.

```typescript
// ChatInput 래퍼에서의 사용 패턴
const { error, clearError, retry } = useChat();

{error && (
  <ChatErrorBanner
    error={error}
    onRetry={error.retryable ? retry : undefined}
    onDismiss={clearError}
  />
)}
```

> **에러 배너를 임의로 제거하거나 항상 `onRetry`를 전달하지 말 것.**
> `retryable` 플래그는 서버 응답 코드를 기반으로 자동 설정된다 (`errors.ts` 참조).

---

## 3. AI 응답 UX 패턴

### 3.1 스트리밍 상태 머신

```
idle
  │  sendMessage() 호출
  ▼
[낙관적 업데이트] ── 사용자 메시지 즉시 추가 (status: "done")
  │               ── AI 플레이스홀더 추가   (status: "streaming", content: "")
  ▼
loading           ── MessageSkeleton 표시 (content === "" 조건)
  │  첫 청크 도착
  ▼
streaming         ── StreamingText에 누적 텍스트 전달, 커서 표시
  │
  ├── [사용자 취소] stopStreaming() → AbortError → status: "done" (수신 내용 유지)
  ├── [타임아웃]   30초 경과 → TimeoutError → status: "error" + ChatErrorBanner
  ├── [네트워크]   fetch 실패 → NetworkError → status: "error" + ChatErrorBanner
  └── [정상 완료]             → status: "done" → ReactMarkdown 전환
```

---

### 3.2 스트리밍 중 인터랙션 제한

스트리밍 중(`isStreaming === true`)에는 다음 인터랙션이 **자동으로 제한**된다.
개발자가 별도로 disabled 처리할 필요 없다.

| 인터랙션 | 제한 방식 | 위치 |
|---------|----------|------|
| 새 메시지 전송 | `handleSubmit` 내부 가드 | `design-system/ChatInput` |
| Enter 키 전송 | `handleKeyDown` 내부 가드 | `design-system/ChatInput` |
| 전송 버튼 | 중단 버튼으로 교체 | `design-system/ChatInput` |
| 재생성 버튼 | `status !== "done"`이면 미노출 | `design-system/MessageBubble` |
| retry 호출 | `isStreaming` 중이면 무시 | `features/chat/hooks/useChat` |

**허용되는 인터랙션** (스트리밍 중에도 동작해야 함):
- 중단 버튼 (`stopStreaming`) — 언제나 동작해야 함
- 스크롤 — 제한 금지
- 사이드바 스레드 전환 — 가능하되, 현재 스트림은 계속 진행

---

### 3.3 중단 버튼 노출 조건

```
isStreaming === true
  └── ChatInput: 전송 버튼 → Square(중단) 버튼으로 교체
        onClick → stopStreaming() → AbortController.abort()
        결과: 현재까지 받은 텍스트 유지, status: "done"으로 마킹
```

**중단 버튼을 별도로 만들지 않는다.** `ChatInput`의 `onStop` prop과 `isStreaming` prop 연결만으로 처리된다.

```typescript
// ✅ 올바른 패턴
<BaseChatInput
  onStop={stopStreaming}        // AbortController.abort() 호출
  isStreaming={isStreaming}     // true면 버튼 자동 교체
/>

// ❌ 불필요한 중복
{isStreaming && <button onClick={stopStreaming}>중단</button>}
<BaseChatInput isStreaming={isStreaming} />
```

---

### 3.4 로딩 스켈레톤 표시 조건

```typescript
// MessageList.tsx 패턴
{streamingMessageId &&
  thread.messages.find((m) => m.id === streamingMessageId)?.content === "" && (
    <MessageSkeleton />
  )}
```

| 조건 | 표시 여부 |
|------|----------|
| `streamingMessageId` 존재 + `content === ""` | MessageSkeleton 표시 |
| `streamingMessageId` 존재 + `content` 있음 | StreamingText로 전환 |
| `streamingMessageId === null` | 미표시 |

> 스켈레톤은 "첫 청크 도착 전"에만 표시된다. 첫 글자가 오는 순간 자동으로 사라진다.

---

### 3.5 스트리밍 완료 후 마크다운 전환 애니메이션

`StreamingText`는 `isStreaming: true → false` 전환 시 `justFinished` 플래그를 300ms 유지해
`animate-[fade-in_0.3s_ease-out_both]`를 적용한다.

```
plain text (스트리밍 중)  →  [0.3s fade-in]  →  ReactMarkdown (완료)
```

이 전환은 자동이다. 외부에서 별도 애니메이션을 추가하면 중복 효과가 발생한다.

---

## 4. 에러 메시지 작성 원칙

### 4.1 에러 타입 계층

```
ChatError (기반)
├── NetworkError    — fetch() 자체 실패 (오프라인, DNS, CORS)
├── TimeoutError    — 30초 타임아웃
├── ModelError      — API 서버 4xx/5xx 응답
│     ├── 400      — 잘못된 요청
│     ├── 401/403  — 인증/권한 오류
│     ├── 429      — Rate limit
│     └── 5xx      — 서버 장애
├── AbortError      — 사용자 직접 취소
└── ChatError       — 분류 불가 (unknown)
```

### 4.2 사용자 언어 vs 기술 용어

**원칙: 에러 메시지는 원인보다 행동을 안내한다.**

| 상황 | ❌ 나쁜 예 | ✅ 좋은 예 |
|------|-----------|-----------|
| 네트워크 오류 | "TypeError: Failed to fetch" | "네트워크에 연결할 수 없습니다. 인터넷 연결을 확인해주세요." |
| 타임아웃 | "AbortError: The operation was aborted" | "응답 시간이 초과됐습니다 (30초). 다시 시도해주세요." |
| Rate limit | "Error 429: Too Many Requests" | "요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요." |
| 서버 오류 | "HTTP 503 Service Unavailable" | "AI 서버에 일시적인 문제가 발생했습니다. 다시 시도해주세요." |
| 인증 오류 | "401 Unauthorized" | "API 인증에 실패했습니다. 관리자에게 문의해주세요." |

### 4.3 재시도 가능 여부 판단 기준

`ChatError.retryable` 플래그가 UI 재시도 버튼 노출을 결정한다.
**이 값을 임의로 오버라이드하지 않는다.**

```
retryable: true   → ChatErrorBanner에 "재시도" 버튼 표시
retryable: false  → 버튼 없음, 사용자 행동(페이지 새로고침, 관리자 문의) 안내

자동 retryable=true : NetworkError, TimeoutError, ModelError(429, 5xx)
자동 retryable=false: AbortError, ModelError(400, 401, 403)
```

### 4.4 에러 상태 메시지 배치

```
┌──────────────────────────────────┐
│  MessageList                     │
│  ┌────────────────────────────┐  │
│  │ ⚠ 응답 생성 중 오류       │  │  ← MessageBubble 내부 (status="error")
│  │   응답 생성 실패 [재시도]  │  │  ← StatusIndicator (variant="inline")
│  └────────────────────────────┘  │
│                                  │
│  ┌── ChatErrorBanner ──────────┐  │  ← 입력창 위 (API 호출 에러 전체)
│  │ ⚡ 네트워크 오류     [재시도] [✕] │
│  └────────────────────────────┘  │
│  ┌── ChatInput ────────────────┐  │
│  └────────────────────────────┘  │
└──────────────────────────────────┘
```

### 4.5 새 에러 메시지 추가 절차

```
1. src/lib/api/errors.ts 의 ModelError.classify() 에 케이스 추가
2. retryable 여부 명시
3. 사용자 친화 메시지 작성 (위 원칙 참조)
4. ChatErrorBanner의 KIND_META 확인 (kind가 이미 있는지)
```

---

## 5. 디자인 토큰 사용 규칙

### 5.1 3-tier 구조

```
Primitive → Semantic → Component
```

| 계층 | 예시 | 파일 |
|------|------|------|
| Primitive | `--duration-fast: 150ms` | `globals.css` |
| Semantic | `var(--color-accent)`, `var(--color-text-primary)` | `globals.css` |
| Component | `.bubble-ai`, `.streaming-cursor` | `globals.css` |

### 5.2 올바른 토큰 참조 방법

```typescript
// ✅ TypeScript에서 참조 — tokens/index.ts 사용
import { colors, animation } from "@/design-system/tokens";

// ✅ Tailwind에서 — 커스텀 클래스 사용
className="bg-surface-raised border-line text-text-primary"

// ✅ CSS에서 — var() 직접 참조
style={{ transitionDuration: "var(--duration-fast)" }}

// ❌ 하드코딩 금지
className="bg-[#1a1a2e] text-[#e2e8f0]"
style={{ transitionDuration: "150ms" }}
```

### 5.3 AI 전용 토큰 (`colors.ai.*`)

일반 UI에 사용하지 않는다. AI 응답 컴포넌트 전용.

| 토큰 그룹 | 사용 위치 |
|----------|----------|
| `ai.streaming.*` | StreamingText, MessageBubble (streaming 상태) |
| `ai.thinking.*` | ThinkingIndicator, MessageBubble (thinking 상태) |
| `ai.tool.*` | ToolCallBlock |
| `ai.codeBlock.*` | CodeBlock 헤더 |
| `ai.contextWindow.*` | ContextWindowBar |

---

## 6. 디자이너–개발자 협업 체크리스트

### 6.1 디자인 핸드오프 전 — 디자이너 확인

#### 상태 설계

- [ ] 각 컴포넌트의 **5가지 상태** 프레임이 모두 존재하는가?
  - `idle` / `loading` / `streaming` / `done` / `error`
- [ ] 스트리밍 중 커서(`▋`)와 glow 효과가 명시되어 있는가?
- [ ] 에러 배너의 `retryable` / `non-retryable` 두 가지 케이스가 있는가?
- [ ] 빈 상태(대화 없음)와 로딩 스켈레톤 프레임이 있는가?

#### 토큰 명세

- [ ] 신규 색상값이 있다면 `globals.css` CSS 변수로 추가 요청했는가?
  - 하드코딩된 hex 값을 스펙에 포함하지 않는다
- [ ] 다크/라이트 모드 두 가지 버전이 모두 설계되었는가?
  - `[data-theme="dark"]` 오버라이드가 필요한 값은 명시

#### 접근성

- [ ] 에러·성공 상태가 색상만으로 구분되지 않는가? (아이콘/텍스트 병행)
- [ ] 터치 타겟이 최소 44×44px인가?
- [ ] 포커스 링 디자인이 포함되어 있는가?

---

### 6.2 개발 시작 전 — 개발자 확인

#### 컴포넌트 선택

- [ ] 기존 design-system 컴포넌트로 구현 가능한가?
  → 신규 컴포넌트 생성 전 `src/design-system/` 전체 탐색
- [ ] store 연결이 필요한가?
  → `features/chat/components/` 래퍼 작성, design-system에 직접 연결 금지
- [ ] `useChat()` 훅의 반환값으로 충분한가?
  → `sendMessage`, `stopStreaming`, `retry`, `isStreaming`, `error`, `clearError`

#### 상태 처리

- [ ] 낙관적 업데이트가 적용되어 있는가? (API 응답 전 UI 반영)
- [ ] 에러는 `toChatError()`를 통해 분류하는가? (raw Error 직접 노출 금지)
- [ ] `AbortController`가 `finally` 블록에서 정리되는가?
- [ ] 스트리밍 중 불필요한 re-render가 발생하지 않는가?
  → `useChatStore(selector)` 형태로 필요한 slice만 구독

#### 접근성

- [ ] 스트리밍 텍스트 영역에 `aria-live="polite"`가 있는가?
- [ ] 에러 배너에 `role="alert"`가 있는가?
- [ ] 버튼에 `aria-label`이 모두 지정되어 있는가?

---

### 6.3 PR 제출 전 — 공통 확인

#### 기능

- [ ] 스트리밍 정상 동작 (청크 누적 → 마크다운 전환)
- [ ] 중단 버튼 → AbortError → 부분 텍스트 보존
- [ ] 타임아웃 30초 후 TimeoutError + 재시도 버튼 표시
- [ ] 오프라인 상태에서 NetworkError + 재시도 버튼 표시
- [ ] 페이지 새로고침 후 대화 이력 복원 (Zustand persist)

#### UI

- [ ] 다크/라이트 모드 전환 시 깨지는 색상 없음
- [ ] 긴 메시지 (3000자+) 레이아웃 깨지지 않음
- [ ] 코드 블록 수평 스크롤 동작
- [ ] 모바일(375px) 레이아웃 확인

#### 접근성

- [ ] 키보드만으로 전체 플로우 완료 가능 (메시지 입력 → 전송 → 중단)
- [ ] 스크린리더에서 스트리밍 완료 후 응답 내용 읽힘

---

### 6.4 자주 발생하는 협업 이슈

| 이슈 | 원인 | 해결 |
|------|------|------|
| 디자인엔 있는 상태가 코드에 없음 | 에러 상태 프레임 누락 | 핸드오프 시 5-state 체크리스트 사용 |
| 색상이 다크모드에서 깨짐 | hex 하드코딩 | 반드시 CSS 변수 (`var(--color-*)`) 사용 |
| 스트리밍 중 레이아웃 점프 | 높이 미고정 | MessageBubble `min-h` 또는 skeleton으로 공간 확보 |
| 에러가 콘솔에만 표시됨 | `console.error` 후 처리 누락 | `setError(chatErr)` 로 상태 업데이트 필수 |
| 재시도 버튼이 항상 표시됨 | `retryable` 무시 | `error.retryable` 확인 후 조건부 전달 |
| SSR hydration 불일치 | store 즉시 읽기 | `skipHydration: true` + `StoreHydration` 컴포넌트 패턴 유지 |

---

## 부록: 파일 위치 빠른 참조

```
신규 UI 컴포넌트        → src/design-system/components/{ComponentName}/index.tsx
store 연결 래퍼         → src/features/chat/components/{ComponentName}.tsx
상태 관리 훅            → src/features/chat/hooks/useChat.ts
대화 이력 스토어        → src/features/chat/stores/chatStore.ts
SSE 스트림 레이어       → src/lib/api/streaming.ts
에러 타입 정의          → src/lib/api/errors.ts
디자인 토큰 (TS)        → src/design-system/tokens/index.ts
API Route (Edge)        → src/app/api/chat/route.ts
타입 정의               → src/features/chat/types/chat.types.ts
```

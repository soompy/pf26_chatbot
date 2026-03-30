"use client";

import { useState } from "react";
import { Button } from "@/design-system/components/Button";
import { Badge } from "@/design-system/components/Badge";
import { Avatar } from "@/design-system/components/Avatar";
import { Skeleton, MessageSkeleton } from "@/design-system/components/Skeleton";
import { ThemeToggle } from "@/design-system/components/ThemeToggle";
import { ThinkingIndicator, StreamingCursor } from "@/design-system/components/ThinkingIndicator";
import { ToolCallBlock } from "@/design-system/components/ToolCallBlock";
import { ContextWindowBar } from "@/design-system/components/ContextWindowBar";
import { CodeBlock } from "@/design-system/components/CodeBlock";
// 핵심 채팅 컴포넌트
import { MessageBubble } from "@/design-system/components/MessageBubble";
import { ChatInput } from "@/design-system/components/ChatInput";
import { StreamingText } from "@/design-system/components/StreamingText";
import { StatusIndicator } from "@/design-system/components/StatusIndicator";
import type { StatusState } from "@/design-system/components/StatusIndicator";
import type { Attachment } from "@/features/chat/types/chat.types";

/* ── 쇼케이스 레이아웃 헬퍼 ──────────────────────────────── */
function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="border-b border-line pb-3">
        <h2 className="text-token-lg font-semibold text-text-primary">{title}</h2>
        {description && (
          <p className="text-token-sm text-text-muted mt-0.5">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}

function Row({
  label,
  children,
  vertical = false,
}: {
  label?: string;
  children: React.ReactNode;
  vertical?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider">
          {label}
        </p>
      )}
      <div
        className={
          vertical
            ? "flex flex-col gap-2"
            : "flex flex-wrap items-center gap-3"
        }
      >
        {children}
      </div>
    </div>
  );
}

/* ── 색상 스와치 ──────────────────────────────────────────── */
function Swatch({
  cssVar,
  label,
  size = "md",
}: {
  cssVar: string;
  label: string;
  size?: "sm" | "md";
}) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className={`rounded-token border border-line ${size === "sm" ? "h-8 w-8" : "h-12 w-12"}`}
        style={{ background: `var(${cssVar})` }}
        title={cssVar}
      />
      <span className="text-[10px] text-text-muted text-center leading-tight max-w-[56px]">
        {label}
      </span>
    </div>
  );
}

/* ── 토큰 값 표 ───────────────────────────────────────────── */
function TokenRow({ name, value }: { name: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-line last:border-0">
      <code className="text-token-sm text-accent font-mono">{name}</code>
      <span className="text-token-sm text-text-secondary font-mono">{value}</span>
    </div>
  );
}

/* ── 스트리밍 텍스트 데모 ─────────────────────────────────── */
const DEMO_STREAM_TEXT =
  "안녕하세요! 저는 AI 어시스턴트입니다. 무엇을 도와드릴까요?";

function StreamingDemo() {
  const [idx, setIdx] = useState(0);
  const [running, setRunning] = useState(false);
  const text = DEMO_STREAM_TEXT.slice(0, idx);

  function start() {
    if (running) return;
    setIdx(0);
    setRunning(true);
    let i = 0;
    const t = setInterval(() => {
      i++;
      setIdx(i);
      if (i >= DEMO_STREAM_TEXT.length) {
        clearInterval(t);
        setRunning(false);
      }
    }, 40);
  }

  return (
    <div className="space-y-3">
      <div className="bubble-ai is-streaming max-w-xs">
        <span>{text}</span>
        {running && <StreamingCursor />}
        {!running && idx > 0 && (
          <span className="text-text-muted text-xs ml-2">(완료)</span>
        )}
        {!running && idx === 0 && (
          <span className="text-text-muted text-xs">버튼을 눌러 시작하세요</span>
        )}
      </div>
      <Button size="sm" variant="secondary" onClick={start} disabled={running}>
        {running ? "스트리밍 중…" : "▶ 재생"}
      </Button>
    </div>
  );
}

/* ── 메인 페이지 ──────────────────────────────────────────── */
export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-bg text-text-primary">
      {/* 헤더 */}
      <header className="glass sticky top-0 z-50 px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-token-xl font-bold text-text-primary">
            Design System
          </h1>
          <p className="text-token-xs text-text-muted mt-0.5">
            AI Chatbot UI — 컴포넌트 쇼케이스
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="model">v1.0</Badge>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-8 py-12 space-y-16">

        {/* ── 1. 색상 토큰 ── */}
        <Section
          title="Colors"
          description="CSS Variables 기반 3-tier 시스템 (Primitive → Semantic → Component)"
        >
          <Row label="Surface — elevation 레이어">
            <Swatch cssVar="--color-bg"              label="bg" />
            <Swatch cssVar="--color-surface"         label="surface" />
            <Swatch cssVar="--color-surface-raised"  label="raised" />
            <Swatch cssVar="--color-surface-overlay" label="overlay" />
            <Swatch cssVar="--color-surface-sunken"  label="sunken" />
          </Row>
          <Row label="Text 계층">
            {["--color-text-primary", "--color-text-secondary", "--color-text-muted", "--color-text-disabled"].map((v) => (
              <div key={v} className="flex flex-col items-center gap-1">
                <span className="text-base font-medium" style={{ color: `var(${v})` }}>Aa</span>
                <span className="text-[10px] text-text-muted">{v.replace("--color-text-", "")}</span>
              </div>
            ))}
          </Row>
          <Row label="Brand / Accent">
            <Swatch cssVar="--color-accent"        label="accent" />
            <Swatch cssVar="--color-accent-hover"  label="hover" />
            <Swatch cssVar="--color-accent-subtle" label="subtle" />
            <Swatch cssVar="--color-accent-border" label="border" />
          </Row>
          <Row label="Status">
            <Swatch cssVar="--color-error"   label="error" />
            <Swatch cssVar="--color-warning" label="warning" />
            <Swatch cssVar="--color-success" label="success" />
            <Swatch cssVar="--color-info"    label="info" />
          </Row>
          <Row label="AI 특화 — Streaming (violet)">
            <Swatch cssVar="--color-streaming-cursor" label="cursor" />
            <Swatch cssVar="--color-streaming-glow"   label="glow" />
            <Swatch cssVar="--color-streaming-border" label="border" />
          </Row>
          <Row label="AI 특화 — Thinking (amber)">
            <Swatch cssVar="--color-thinking-cursor" label="cursor" />
            <Swatch cssVar="--color-thinking-bg"     label="bg" />
            <Swatch cssVar="--color-thinking-border" label="border" />
          </Row>
          <Row label="AI 특화 — Tool Call (blue)">
            <Swatch cssVar="--color-tool-bg"        label="bg" />
            <Swatch cssVar="--color-tool-border"    label="border" />
            <Swatch cssVar="--color-tool-header-bg" label="header" />
          </Row>
        </Section>

        {/* ── 2. 타이포그래피 ── */}
        <Section
          title="Typography"
          description="--font-size-* / --line-height-* / --font-weight-*"
        >
          <div className="space-y-3">
            {[
              { token: "2xl", px: "24px", weight: "700", sample: "AI Chatbot Design System" },
              { token: "xl",  px: "20px", weight: "600", sample: "섹션 제목 — Section Heading" },
              { token: "lg",  px: "18px", weight: "600", sample: "카드 제목 — Card Title" },
              { token: "md",  px: "16px", weight: "400", sample: "본문 텍스트 — Body text in conversation" },
              { token: "base",px: "15px", weight: "400", sample: "기본 채팅 메시지 본문 크기" },
              { token: "sm",  px: "13px", weight: "400", sample: "보조 텍스트, 타임스탬프, 레이블" },
              { token: "xs",  px: "11px", weight: "500", sample: "BADGE · METADATA · CAPTION" },
            ].map(({ token, px, weight, sample }) => (
              <div key={token} className="flex items-baseline gap-4">
                <code className="text-xs text-accent font-mono w-16 shrink-0">
                  {token} · {px}
                </code>
                <span
                  style={{
                    fontSize: `var(--font-size-${token})`,
                    fontWeight: weight,
                    lineHeight: "var(--line-height-normal)",
                  }}
                >
                  {sample}
                </span>
              </div>
            ))}
          </div>

          <Row label="Mono — 코드 폰트">
            <code
              className="text-token-sm px-3 py-2 rounded-token border border-line bg-surface"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              const answer = await ai.generate(prompt);
            </code>
          </Row>
        </Section>

        {/* ── 3. 애니메이션 토큰 ── */}
        <Section
          title="Animation Tokens"
          description="--duration-* / --ease-* — 일관된 모션 시스템"
        >
          <div className="grid grid-cols-2 gap-x-12 gap-y-1">
            <div>
              <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider mb-2">Duration</p>
              <TokenRow name="--duration-instant" value="50ms" />
              <TokenRow name="--duration-fast"    value="150ms" />
              <TokenRow name="--duration-normal"  value="250ms" />
              <TokenRow name="--duration-slow"    value="400ms" />
              <TokenRow name="--duration-slower"  value="600ms" />
              <TokenRow name="--duration-stream"  value="30ms" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider mb-2">Easing</p>
              <TokenRow name="--ease-default" value="cubic-bezier(0.4,0,0.2,1)" />
              <TokenRow name="--ease-spring"  value="cubic-bezier(0.34,1.56,0.64,1)" />
              <TokenRow name="--ease-out"     value="cubic-bezier(0,0,0.2,1)" />
            </div>
          </div>

          <Row label="애니메이션 미리보기">
            <div className="flex items-center gap-3 flex-wrap">
              {[
                { label: "fade-in",      cls: "animate-[fade-in_0.25s_ease-out_both]" },
                { label: "slide-up",     cls: "animate-[slide-up_0.25s_ease-out_both]" },
                { label: "message-enter",cls: "animate-message-enter" },
              ].map(({ label, cls }) => (
                <AnimPreview key={label} label={label} animClass={cls} />
              ))}
            </div>
          </Row>
        </Section>

        {/* ── 4. Button ── */}
        <Section title="Button" description="variant × size — press:active scale(0.96)">
          <Row label="Variant">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
          </Row>
          <Row label="Size">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
            <Button size="icon" aria-label="icon">⚡</Button>
          </Row>
          <Row label="State">
            <Button isLoading>Loading</Button>
            <Button disabled>Disabled</Button>
            <Button variant="primary" leftIcon={<span>✦</span>}>With Icon</Button>
          </Row>
        </Section>

        {/* ── 5. Badge ── */}
        <Section title="Badge" description="인라인 레이블 — 상태, 모델, 카테고리">
          <Row>
            <Badge variant="default">Default</Badge>
            <Badge variant="accent">Accent</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="error">Error</Badge>
            <Badge variant="model">claude-sonnet-4-6</Badge>
          </Row>
          <Row label="Size">
            <Badge size="sm">Small</Badge>
            <Badge size="md">Medium</Badge>
          </Row>
        </Section>

        {/* ── 6. Avatar ── */}
        <Section title="Avatar" description="role 기반 아이콘 + 색상">
          <Row>
            <div className="flex flex-col items-center gap-1">
              <Avatar role="assistant" size="md" />
              <span className="text-[10px] text-text-muted">assistant</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Avatar role="user" size="md" />
              <span className="text-[10px] text-text-muted">user</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Avatar role="system" size="md" />
              <span className="text-[10px] text-text-muted">system</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Avatar role="assistant" size="sm" />
              <span className="text-[10px] text-text-muted">sm</span>
            </div>
          </Row>
        </Section>

        {/* ── 7. Skeleton ── */}
        <Section title="Skeleton / Shimmer" description=".shimmer 애니메이션 — 로딩 플레이스홀더">
          <Row label="Variants" vertical>
            <div className="w-64">
              <p className="text-[10px] text-text-muted mb-1">block</p>
              <Skeleton className="h-20 w-full" />
            </div>
            <div className="w-64">
              <p className="text-[10px] text-text-muted mb-1">text (3 lines)</p>
              <Skeleton variant="text" lines={3} />
            </div>
            <div>
              <p className="text-[10px] text-text-muted mb-1">circle</p>
              <Skeleton variant="circle" className="h-10 w-10" />
            </div>
            <div className="w-full max-w-sm border border-line rounded-token-lg overflow-hidden">
              <p className="text-[10px] text-text-muted p-2 border-b border-line">MessageSkeleton</p>
              <MessageSkeleton />
            </div>
          </Row>
        </Section>

        {/* ── 8. 채팅 버블 ── */}
        <Section
          title="Chat Bubbles"
          description=".bubble-ai / .bubble-user + 상태 변형 (streaming, thinking, error)"
        >
          <Row label="기본 버블" vertical>
            <div className="flex gap-3 items-start max-w-md">
              <Avatar role="assistant" size="sm" />
              <div className="bubble-ai text-token-base max-w-xs message-enter">
                안녕하세요! 무엇을 도와드릴까요?
              </div>
            </div>
            <div className="flex gap-3 items-start max-w-md self-end flex-row-reverse">
              <Avatar role="user" size="sm" />
              <div className="bubble-user text-token-base max-w-xs message-enter">
                디자인 시스템을 설명해줘.
              </div>
            </div>
          </Row>

          <Row label="AI 상태 변형" vertical>
            {/* Thinking */}
            <div className="flex gap-3 items-start">
              <Avatar role="assistant" size="sm" />
              <div className="bubble-ai is-thinking max-w-xs">
                <ThinkingIndicator />
              </div>
            </div>

            {/* Streaming */}
            <div className="flex gap-3 items-start">
              <Avatar role="assistant" size="sm" />
              <div className="bubble-ai is-streaming max-w-xs">
                스트리밍 중인 응답 텍스트입니다<StreamingCursor />
              </div>
            </div>

            {/* Error */}
            <div className="flex gap-3 items-start">
              <Avatar role="assistant" size="sm" />
              <div className="bubble-ai is-error max-w-xs">
                <span className="text-error text-token-sm flex items-center gap-2">
                  <span>⚠</span>
                  응답 생성 중 오류가 발생했습니다.
                </span>
              </div>
            </div>
          </Row>
        </Section>

        {/* ── 9. 스트리밍 인터랙티브 데모 ── */}
        <Section
          title="Streaming Demo"
          description="실제 스트리밍 텍스트 + 커서 효과를 인터랙티브하게 체험"
        >
          <StreamingDemo />
        </Section>

        {/* ── 10. ThinkingIndicator ── */}
        <Section
          title="ThinkingIndicator"
          description="추론 단계(Thinking) — amber dots, 스트리밍과 시각적으로 구분"
        >
          <Row>
            <ThinkingIndicator />
            <ThinkingIndicator label="분석 중..." />
            <ThinkingIndicator label="코드 생성 중..." />
            <ThinkingIndicator compact />
          </Row>
        </Section>

        {/* ── 11. ToolCallBlock ── */}
        <Section
          title="Tool Call Block"
          description="AI의 함수 호출 상태 — running / done / error"
        >
          <div className="grid grid-cols-1 gap-4 max-w-lg">
            <div>
              <p className="text-[10px] text-text-muted uppercase tracking-wider mb-2">running</p>
              <ToolCallBlock
                name="search_web"
                args={{ query: "Next.js 15 App Router" }}
                status="running"
              />
            </div>
            <div>
              <p className="text-[10px] text-text-muted uppercase tracking-wider mb-2">done</p>
              <ToolCallBlock
                name="read_file"
                args={{ path: "src/app/page.tsx" }}
                result="import { ChatLayout } from '@/features/chat';\nexport default function Home() { return <ChatLayout />; }"
                status="done"
              />
            </div>
            <div>
              <p className="text-[10px] text-text-muted uppercase tracking-wider mb-2">error</p>
              <ToolCallBlock
                name="exec_code"
                args={{ language: "python", code: "print(1/0)" }}
                error="ZeroDivisionError: division by zero"
                status="error"
              />
            </div>
          </div>
        </Section>

        {/* ── 12. ContextWindowBar ── */}
        <Section
          title="Context Window Bar"
          description="토큰 사용량 시각화 — safe(green) / warning(amber) / danger(red, 깜빡임)"
        >
          <div className="space-y-4 max-w-sm">
            {[
              { used: 1200, total: 8192, label: "safe (15%)" },
              { used: 5900, total: 8192, label: "warning (72%)" },
              { used: 7700, total: 8192, label: "danger (94%)" },
            ].map(({ used, total, label }) => (
              <div key={label}>
                <p className="text-[10px] text-text-muted mb-1.5">{label}</p>
                <ContextWindowBar used={used} total={total} showLabel />
              </div>
            ))}
          </div>
        </Section>

        {/* ── 13. CodeBlock ── */}
        <Section
          title="Code Block"
          description="언어 헤더 + 복사 버튼 — rehype-highlight 연동 가능"
        >
          <div className="max-w-lg">
            <CodeBlock language="typescript" filename="useStream.ts">
              <pre><code>{`import { useState, useCallback } from "react";

export function useStream(url: string) {
  const [text, setText] = useState("");
  const [status, setStatus] = useState<
    "idle" | "thinking" | "streaming" | "done"
  >("idle");

  const start = useCallback(async () => {
    setStatus("thinking");
    const res = await fetch(url, { method: "POST" });
    const reader = res.body!.getReader();
    setStatus("streaming");

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      setText((t) => t + new TextDecoder().decode(value));
    }
    setStatus("done");
  }, [url]);

  return { text, status, start };
}`}</code></pre>
            </CodeBlock>
          </div>
        </Section>

        {/* ── NEW: MessageBubble ── */}
        <Section
          title="MessageBubble"
          description="user / assistant / system 역할별 스타일 + streaming · thinking · error 상태. 복사·재생성 액션, ARIA article"
        >
          <div className="space-y-1 max-w-2xl">
            <MessageBubble
              role="system"
              content="AI 어시스턴트 모드가 활성화되었습니다."
              status="done"
            />
            <MessageBubble
              role="user"
              content="스트리밍 응답 구현 방법을 알려줘."
              status="done"
              createdAt={new Date(Date.now() - 60000)}
              attachments={[{
                id: "1", type: "file", name: "spec.md",
                url: "#", mimeType: "text/markdown", size: 8192,
              }]}
            />
            <MessageBubble
              role="assistant"
              content={`Next.js Route Handler에서 **ReadableStream**을 반환하면 됩니다.\n\n청크 단위로 \`controller.enqueue()\`를 호출하면 클라이언트가 실시간으로 받습니다.`}
              status="done"
              model="claude-sonnet-4-6"
              tokenCount={128}
              createdAt={new Date(Date.now() - 30000)}
              onCopy={() => {}}
              onRegenerate={() => {}}
            />
            <MessageBubble
              role="assistant"
              content=""
              status="streaming"
              isThinking
            />
            <MessageBubble
              role="assistant"
              content="스트리밍 중인 응답 텍스트입니다"
              status="streaming"
              isStreaming
            />
            <MessageBubble
              role="assistant"
              content=""
              status="error"
              onRegenerate={() => {}}
            />
          </div>
        </Section>

        {/* ── NEW: StreamingText ── */}
        <Section
          title="StreamingText"
          description="단락 단위 chunk-appear 애니메이션 + 마크다운 파싱. aria-live='polite', aria-busy로 스크린리더 대응"
        >
          <StreamingTextShowcase />
        </Section>

        {/* ── NEW: StatusIndicator ── */}
        <Section
          title="StatusIndicator"
          description="idle→loading→thinking→streaming→success→error 상태 머신. inline / banner / dot 세 변형"
        >
          <div className="space-y-6">
            <Row label="inline">
              <StatusIndicator status="loading"   variant="inline" />
              <StatusIndicator status="thinking"  variant="inline" />
              <StatusIndicator status="streaming" variant="inline" />
              <StatusIndicator status="success"   variant="inline" successAutoDismiss={0} />
              <StatusIndicator status="error"     variant="inline" onRetry={() => {}} />
            </Row>
            <Row label="banner" vertical>
              {(["loading", "thinking", "streaming", "success", "error"] as StatusState[]).map((s) => (
                <StatusIndicator
                  key={s}
                  status={s}
                  variant="banner"
                  successAutoDismiss={0}
                  className="max-w-md"
                  onRetry={s === "error" ? () => {} : undefined}
                />
              ))}
            </Row>
            <Row label="dot">
              {(["loading", "thinking", "streaming", "success", "error"] as StatusState[]).map((s) => (
                <div key={s} className="flex flex-col items-center gap-1.5">
                  <StatusIndicator status={s} variant="dot" />
                  <span className="text-[10px] text-text-muted">{s}</span>
                </div>
              ))}
            </Row>
            <Row label="상태 전환 시뮬레이션">
              <StatusMachineDemo />
            </Row>
          </div>
        </Section>

        {/* ── NEW: ChatInput ── */}
        <Section
          title="ChatInput"
          description="멀티라인 자동 확장, 파일 첨부 (클릭 + Drag&Drop), 글자 수 카운터. role=form, aria-describedby"
        >
          <ChatInputShowcase />
        </Section>

        {/* ── 14. 상태 배지 / Citation ── */}
        <Section title="Status & Citation" description=".status-* / .citation 유틸리티 클래스">
          <Row label="Status 배지">
            <span className="status-error   px-3 py-1 rounded-token-sm text-token-sm">Error</span>
            <span className="status-success px-3 py-1 rounded-token-sm text-token-sm">Success</span>
            <span className="status-warning px-3 py-1 rounded-token-sm text-token-sm">Warning</span>
          </Row>
          <Row label="Citation 인용 블록" vertical>
            <div className="citation max-w-md">
              "디자인 시스템은 제품 전반에 걸쳐 일관된 시각적 언어와 상호작용 패턴을 제공하는
              컴포넌트, 토큰, 가이드라인의 집합입니다."
            </div>
          </Row>
        </Section>

        {/* ── 15. 그림자 / Glass ── */}
        <Section title="Shadow & Glass" description="--shadow-* / .glass 유틸리티">
          <Row>
            {[
              { label: "sm",   cls: "shadow-token-sm" },
              { label: "md",   cls: "shadow-token-md" },
              { label: "lg",   cls: "shadow-token-lg" },
              { label: "glow", cls: "shadow-glow-accent" },
            ].map(({ label, cls }) => (
              <div
                key={label}
                className={`${cls} bg-surface rounded-token px-6 py-4 text-token-sm text-text-secondary`}
              >
                shadow-{label}
              </div>
            ))}
          </Row>
          <Row label="Glass 효과">
            <div
              className="glass rounded-token px-6 py-4 text-token-sm text-text-secondary border border-line"
              style={{ background: undefined }}
            >
              .glass — backdrop-filter blur(12px)
            </div>
          </Row>
        </Section>

      </main>

      <footer className="border-t border-line text-center py-8 text-token-xs text-text-muted">
        AI Chatbot UI Design System — Primitive → Semantic → Component
      </footer>
    </div>
  );
}

/* ── StreamingText 쇼케이스 ─────────────────────────────── */
const STREAM_SAMPLE = `## 스트리밍 응답 예시

Next.js와 Vercel AI SDK를 조합하면 서버에서 직접 스트리밍 응답을 전송할 수 있습니다.

\`\`\`typescript
export async function POST(req: Request) {
  const stream = openai.chat.completions.stream({ model: "gpt-4o", messages });
  return new StreamingTextResponse(stream);
}
\`\`\`

> 단락 단위로 **chunk-appear** 애니메이션이 적용됩니다.`;

function StreamingTextShowcase() {
  const [content, setContent]     = useState("");
  const [isStreaming, setStreaming] = useState(false);

  function start() {
    if (isStreaming) return;
    setContent("");
    setStreaming(true);
    let i = 0;
    const t = setInterval(() => {
      i += 4;
      setContent(STREAM_SAMPLE.slice(0, i));
      if (i >= STREAM_SAMPLE.length) { clearInterval(t); setStreaming(false); }
    }, 25);
  }

  return (
    <div className="space-y-3 max-w-lg">
      <div className="bubble-ai p-4 min-h-[60px]">
        {content || isStreaming
          ? <StreamingText content={content} isStreaming={isStreaming} />
          : <span className="text-text-muted text-token-sm">버튼을 눌러 시작</span>
        }
      </div>
      <Button size="sm" variant="secondary" onClick={start} disabled={isStreaming}>
        {isStreaming ? "스트리밍 중…" : "▶ 재생"}
      </Button>
    </div>
  );
}

/* ── StatusIndicator 상태 머신 데모 ─────────────────────── */
function StatusMachineDemo() {
  const [status, setStatus] = useState<StatusState>("idle");

  async function simulate() {
    const steps: [StatusState, number][] = [
      ["loading", 600], ["thinking", 1200], ["streaming", 1800], ["success", 800], ["idle", 0],
    ];
    for (const [s, delay] of steps) {
      setStatus(s);
      if (delay) await new Promise((r) => setTimeout(r, delay));
    }
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <Button
        size="sm"
        variant="secondary"
        onClick={simulate}
        disabled={status !== "idle"}
      >
        {status === "idle" ? "▶ 시뮬레이션" : "실행 중..."}
      </Button>
      {status !== "idle" && (
        <StatusIndicator status={status} variant="inline" successAutoDismiss={0} />
      )}
    </div>
  );
}

/* ── ChatInput 쇼케이스 ──────────────────────────────────── */
function ChatInputShowcase() {
  const [log, setLog]           = useState<string[]>([]);
  const [isStreaming, setStream] = useState(false);

  function handleSubmit(content: string, attachments: Attachment[]) {
    const entry = attachments.length
      ? `"${content}" + ${attachments.length}개 파일`
      : `"${content}"`;
    setLog((p) => [entry, ...p].slice(0, 5));
    setStream(true);
    setTimeout(() => setStream(false), 2000);
  }

  return (
    <div className="space-y-3 max-w-2xl">
      {log.length > 0 && (
        <div className="text-token-xs text-text-muted space-y-1 p-3 bg-surface rounded-token border border-line">
          <p className="font-medium mb-1">전송 로그:</p>
          {log.map((l, i) => <p key={i}>{l}</p>)}
        </div>
      )}
      <ChatInput
        onSubmit={handleSubmit}
        onStop={() => setStream(false)}
        isStreaming={isStreaming}
        maxLength={500}
      />
    </div>
  );
}

/* ── 애니메이션 미리보기 카드 ────────────────────────────── */
function AnimPreview({ label, animClass }: { label: string; animClass: string }) {
  const [key, setKey] = useState(0);
  return (
    <button
      onClick={() => setKey((k) => k + 1)}
      className="flex flex-col items-center gap-2 group cursor-pointer select-none"
      title="클릭하여 재생"
    >
      <div
        key={key}
        className={`${animClass} w-10 h-10 rounded-token bg-accent/20 border border-accent/30 flex items-center justify-center text-accent text-xs`}
      >
        ✦
      </div>
      <span className="text-[10px] text-text-muted group-hover:text-text-secondary transition-colors">
        {label}
      </span>
    </button>
  );
}

/**
 * MessageBubble — Storybook Stories (CSF 3.0)
 */

import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useState } from "react";
import { MessageBubble } from "./index";

const NOW = new Date();

const meta: Meta<typeof MessageBubble> = {
  title: "Design System / Chat / MessageBubble",
  component: MessageBubble,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "AI 챗봇 메시지 버블. user/assistant/system 역할별 스타일, 스트리밍/추론/에러 상태, 복사·재생성 액션, 접근성(role=article, aria-live) 지원.",
      },
    },
  },
  argTypes: {
    role:        { control: "radio", options: ["user", "assistant", "system"] },
    status:      { control: "radio", options: ["sending", "streaming", "done", "error"] },
    isStreaming: { control: "boolean" },
    isThinking:  { control: "boolean" },
    markdown:    { control: "boolean" },
    content:     { control: "text" },
    model:       { control: "text" },
    tokenCount:  { control: "number" },
  },
};
export default meta;
type Story = StoryObj<typeof MessageBubble>;

/* ── 역할별 기본 스토리 ── */

export const UserMessage: Story = {
  args: {
    role: "user",
    content: "Next.js App Router에서 스트리밍 응답을 구현하는 방법을 알려줘.",
    status: "done",
    createdAt: NOW,
  },
};

export const AssistantMessage: Story = {
  args: {
    role: "assistant",
    content: `Next.js App Router에서는 **Route Handler**와 Web Streams API를 활용합니다.

\`\`\`typescript
// app/api/chat/route.ts
export async function POST(req: Request) {
  const { messages } = await req.json();

  const stream = await openai.chat.completions.create({
    model: "gpt-4o",
    messages,
    stream: true,
  });

  return new Response(stream.toReadableStream());
}
\`\`\`

클라이언트에서는 \`fetch\`로 스트림을 읽어 상태를 업데이트합니다.`,
    status: "done",
    model: "claude-sonnet-4-6",
    tokenCount: 284,
    createdAt: NOW,
    onCopy: (text) => console.log("복사:", text.slice(0, 30)),
    onRegenerate: () => console.log("재생성 요청"),
  },
};

export const SystemMessage: Story = {
  args: {
    role: "system",
    content: "당신은 친절하고 유능한 AI 코딩 어시스턴트입니다.",
    status: "done",
  },
};

/* ── AI 상태 변형 ── */

export const Thinking: Story = {
  args: {
    role: "assistant",
    content: "",
    status: "streaming",
    isThinking: true,
    createdAt: NOW,
  },
  parameters: {
    docs: {
      description: { story: "응답 생성 전 추론(Thinking) 단계. amber dots + 버블 amber glow." },
    },
  },
};

export const ThinkingWithPartialContent: Story = {
  args: {
    role: "assistant",
    content: "사용자가 Next.js 스트리밍에 대해 물었음. Route Handler + ReadableStream 패턴으로 답변 구성...",
    status: "streaming",
    isThinking: true,
    createdAt: NOW,
  },
};

export const StreamingInProgress: Story = {
  args: {
    role: "assistant",
    content: "Next.js App Router에서는 **Route Handler**와 Web Streams API를",
    status: "streaming",
    isStreaming: true,
    createdAt: NOW,
  },
};

export const ErrorState: Story = {
  args: {
    role: "assistant",
    content: "",
    status: "error",
    createdAt: NOW,
    onRegenerate: () => console.log("재시도"),
  },
};

/* ── 첨부 파일 ── */

export const WithAttachments: Story = {
  args: {
    role: "user",
    content: "이 파일을 분석해줘.",
    status: "done",
    attachments: [
      {
        id: "1",
        type: "file",
        name: "design-system.pdf",
        url: "#",
        mimeType: "application/pdf",
        size: 245760,
      },
      {
        id: "2",
        type: "file",
        name: "requirements.md",
        url: "#",
        mimeType: "text/markdown",
        size: 8192,
      },
    ],
    createdAt: NOW,
  },
};

/* ── 대화 흐름 갤러리 ── */

export const ConversationFlow: Story = {
  render: () => (
    <div className="space-y-1 max-w-2xl">
      <MessageBubble
        role="system"
        content="AI 어시스턴트 모드 활성화됨"
        status="done"
      />
      <MessageBubble
        role="user"
        content="안녕하세요! 디자인 시스템이 뭔가요?"
        status="done"
        createdAt={new Date(Date.now() - 60000)}
      />
      <MessageBubble
        role="assistant"
        content={`디자인 시스템은 **일관된 UX를 위한 컴포넌트와 토큰의 집합**입니다.

주요 구성 요소:
- **색상 토큰**: Primitive → Semantic → Component 3-tier
- **컴포넌트**: Button, Badge, Avatar 등 재사용 가능한 UI
- **패턴**: 레이아웃, 애니메이션, 접근성 가이드

> 잘 설계된 디자인 시스템은 개발 속도를 크게 향상시킵니다.`}
        status="done"
        model="claude-sonnet-4-6"
        tokenCount={142}
        createdAt={new Date(Date.now() - 30000)}
        onCopy={() => {}}
        onRegenerate={() => {}}
      />
      <MessageBubble
        role="assistant"
        content=""
        status="streaming"
        isThinking
        createdAt={new Date()}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: { story: "system → user → assistant(done) → assistant(thinking) 전체 흐름 예시." },
    },
  },
};

/* ── 라이브 스트리밍 데모 ── */

const STREAM_CONTENT = `## 스트리밍 응답 예시

Next.js와 Vercel AI SDK를 사용하면 서버에서 직접 스트리밍 응답을 전송할 수 있습니다.

\`\`\`typescript
const stream = await openai.chat.completions.create({
  model: "gpt-4o",
  messages,
  stream: true,
});
\`\`\`

이 방식은 **응답 대기 시간 없이** 첫 토큰부터 즉시 화면에 표시됩니다.`;

export const LiveStreamingDemo: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [phase, setPhase] = useState<"idle" | "thinking" | "streaming" | "done">("idle");
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [content, setContent] = useState("");

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      if (phase !== "streaming") return;
      let i = 0;
      const t = setInterval(() => {
        i += 4;
        setContent(STREAM_CONTENT.slice(0, i));
        if (i >= STREAM_CONTENT.length) {
          clearInterval(t);
          setPhase("done");
        }
      }, 30);
      return () => clearInterval(t);
    }, [phase]);

    function start() {
      setContent("");
      setPhase("thinking");
      setTimeout(() => setPhase("streaming"), 1200);
    }

    return (
      <div className="space-y-4 max-w-2xl">
        <MessageBubble
          role="user"
          content="스트리밍 응답을 구현하는 방법을 알려줘."
          status="done"
        />
        {phase !== "idle" && (
          <MessageBubble
            role="assistant"
            content={content}
            status={phase === "done" ? "done" : "streaming"}
            isThinking={phase === "thinking"}
            isStreaming={phase === "streaming"}
            model="claude-sonnet-4-6"
            onCopy={() => {}}
            onRegenerate={() => {}}
          />
        )}
        <button
          onClick={start}
          disabled={phase !== "idle" && phase !== "done"}
          className="px-4 py-2 text-sm bg-accent text-white rounded-lg disabled:opacity-40"
        >
          {phase === "idle" || phase === "done" ? "▶ 응답 시뮬레이션" : "실행 중..."}
        </button>
      </div>
    );
  },
};

/**
 * StreamingText — Storybook Stories (CSF 3.0)
 *
 * 실행: npx storybook dev -p 6006
 * 설치: npx storybook@latest init
 */

import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useState } from "react";
import { StreamingText } from "./index";

const meta: Meta<typeof StreamingText> = {
  title: "Design System / AI / StreamingText",
  component: StreamingText,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "AI 응답 텍스트를 스트리밍 중/완료 두 모드로 렌더링. 단락 단위 chunk-appear 애니메이션과 마크다운 파싱을 지원.",
      },
    },
  },
  argTypes: {
    content: { control: "text" },
    isStreaming: { control: "boolean" },
    markdown: { control: "boolean" },
    animateChunks: { control: "boolean" },
  },
};
export default meta;
type Story = StoryObj<typeof StreamingText>;

/* ── 기본 스토리 ── */

export const Idle: Story = {
  args: {
    content: "",
    isStreaming: false,
  },
};

export const StreamingInProgress: Story = {
  args: {
    content: "안녕하세요! 저는 AI 어시스턴트입니다. 무엇을",
    isStreaming: true,
  },
};

export const StreamingMultiParagraph: Story = {
  args: {
    content:
      "디자인 시스템은 일관된 UX를 위한 컴포넌트와 토큰의 집합입니다.\n\n" +
      "Primitive → Semantic → Component 3-tier 구조로 설계하면\n\n" +
      "라이트/다크 모드 대응이 자동화됩니다.",
    isStreaming: true,
    animateChunks: true,
  },
};

export const CompletedMarkdown: Story = {
  args: {
    content: `## 주요 기능

- **스트리밍 커서**: 실시간 응답 시각화
- **청크 애니메이션**: 단락 단위 fade-in
- **마크다운**: GFM + 코드 하이라이팅

\`\`\`typescript
const result = await fetch('/api/chat', {
  method: 'POST',
  body: JSON.stringify({ message }),
});
\`\`\`

> 참고: 스트리밍 완료 후 마크다운으로 전환됩니다.`,
    isStreaming: false,
    markdown: true,
  },
};

export const CompletedPlainText: Story = {
  args: {
    content: "마크다운 없이 plain text로만 렌더링하는 예시입니다.\n줄바꿈도 whitespace-pre-wrap으로 처리됩니다.",
    isStreaming: false,
    markdown: false,
  },
};

/* ── 인터랙티브: 실시간 스트리밍 시뮬레이션 ── */

const DEMO_CONTENT = `## 스트리밍 텍스트 예시

Next.js App Router와 Vercel AI SDK를 사용하면 서버에서 직접 스트리밍 응답을 보낼 수 있습니다.

\`\`\`typescript
export async function POST(req: Request) {
  const { messages } = await req.json();
  const stream = await openai.chat.completions.create({
    model: "gpt-4o",
    messages,
    stream: true,
  });
  return new StreamingTextResponse(stream);
}
\`\`\`

> 이 컴포넌트는 청크가 도착할 때마다 단락 단위로 애니메이션을 적용합니다.`;

export const LiveSimulation: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [content, setContent] = useState("");
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [isStreaming, setIsStreaming] = useState(false);

    function start() {
      if (isStreaming) return;
      setContent("");
      setIsStreaming(true);

      let i = 0;
      const interval = setInterval(() => {
        i += 3;
        setContent(DEMO_CONTENT.slice(0, i));
        if (i >= DEMO_CONTENT.length) {
          clearInterval(interval);
          setIsStreaming(false);
        }
      }, 25);
    }

    return (
      <div className="space-y-4 max-w-lg">
        <button
          onClick={start}
          disabled={isStreaming}
          className="px-4 py-2 text-sm bg-accent text-white rounded-lg disabled:opacity-40"
        >
          {isStreaming ? "스트리밍 중…" : "▶ 스트리밍 시작"}
        </button>
        <div className="bubble-ai p-4">
          <StreamingText content={content} isStreaming={isStreaming} />
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "실제 스트리밍을 시뮬레이션. 버튼을 클릭하면 단락 단위 chunk 애니메이션을 확인할 수 있습니다.",
      },
    },
  },
};

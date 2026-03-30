/**
 * ChatInput — Storybook Stories (CSF 3.0)
 */

import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { ChatInput } from "./index";
import type { Attachment } from "@/features/chat/types/chat.types";

const meta: Meta<typeof ChatInput> = {
  title: "Design System / Chat / ChatInput",
  component: ChatInput,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "메시지 입력창. 멀티라인 자동 확장, 파일 첨부(클릭/드래그), 전송/중단 상태 관리, 글자 수 카운터, 접근성(role=form, aria-describedby) 지원.",
      },
    },
  },
  argTypes: {
    isStreaming:     { control: "boolean" },
    disabled:        { control: "boolean" },
    showVoiceInput:  { control: "boolean" },
    maxLength:       { control: "number" },
    maxAttachments:  { control: "number" },
    placeholder:     { control: "text" },
  },
};
export default meta;
type Story = StoryObj<typeof ChatInput>;

/* ── 기본 스토리 ── */

export const Default: Story = {
  args: {
    onSubmit: (content, attachments) =>
      console.log("전송:", { content, attachments }),
    onStop: () => console.log("중단"),
    isStreaming: false,
  },
};

export const StreamingState: Story = {
  args: {
    ...Default.args,
    isStreaming: true,
  },
  parameters: {
    docs: {
      description: { story: "isStreaming=true 일 때 입력 비활성, 중단 버튼 표시." },
    },
  },
};

export const Disabled: Story = {
  args: {
    ...Default.args,
    disabled: true,
  },
};

export const WithCharacterLimit: Story = {
  args: {
    ...Default.args,
    maxLength: 500,
  },
  parameters: {
    docs: {
      description: { story: "maxLength=500. 90% 초과 시 warning, 100% 초과 시 error 색상." },
    },
  },
};

export const WithoutVoiceInput: Story = {
  args: {
    ...Default.args,
    showVoiceInput: false,
  },
};

/* ── 인터랙티브: 실제 전송 시뮬레이션 ── */

export const FullInteractive: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [messages, setMessages] = useState<
      { id: string; content: string; attachments: Attachment[] }[]
    >([]);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [isStreaming, setIsStreaming] = useState(false);

    function handleSubmit(content: string, attachments: Attachment[]) {
      const id = `${Date.now()}`;
      setMessages((prev) => [...prev, { id, content, attachments }]);
      // 2초간 스트리밍 시뮬레이션
      setIsStreaming(true);
      setTimeout(() => setIsStreaming(false), 2000);
    }

    return (
      <div className="flex flex-col gap-4 max-w-lg">
        {/* 전송된 메시지 목록 */}
        {messages.length > 0 && (
          <div className="space-y-2 max-h-64 overflow-y-auto p-3 bg-surface rounded-token border border-line">
            <p className="text-token-xs text-text-muted mb-2">전송된 메시지:</p>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className="text-token-sm text-text-secondary bubble-user max-w-none"
              >
                {msg.content}
                {msg.attachments.length > 0 && (
                  <span className="text-text-muted ml-2">
                    + {msg.attachments.length}개 파일
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        <ChatInput
          onSubmit={handleSubmit}
          onStop={() => setIsStreaming(false)}
          isStreaming={isStreaming}
          maxLength={1000}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: { story: "전송 → 2초 스트리밍 시뮬레이션 → 완료 사이클을 체험." },
    },
  },
};

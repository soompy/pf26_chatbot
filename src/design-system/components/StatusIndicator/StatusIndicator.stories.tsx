/**
 * StatusIndicator — Storybook Stories (CSF 3.0)
 */

import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { StatusIndicator } from "./index";
import type { StatusState } from "./index";

const meta: Meta<typeof StatusIndicator> = {
  title: "Design System / AI / StatusIndicator",
  component: StatusIndicator,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "AI 응답 처리 상태(loading/thinking/streaming/success/error)를 inline/banner/dot 세 가지 변형으로 표현. role='status' + aria-live로 스크린리더 대응.",
      },
    },
  },
  argTypes: {
    status: {
      control: "select",
      options: ["idle", "loading", "thinking", "streaming", "success", "error"],
    },
    variant: {
      control: "radio",
      options: ["inline", "banner", "dot"],
    },
    message: { control: "text" },
    successAutoDismiss: { control: "number" },
  },
};
export default meta;
type Story = StoryObj<typeof StatusIndicator>;

/* ── 개별 상태 ── */

export const Loading: Story = {
  args: { status: "loading", variant: "inline" },
};

export const Thinking: Story = {
  args: { status: "thinking", variant: "inline", message: "응답을 분석하는 중..." },
};

export const Streaming: Story = {
  args: { status: "streaming", variant: "inline" },
};

export const Success: Story = {
  args: { status: "success", variant: "inline", successAutoDismiss: 0 },
};

export const Error: Story = {
  args: {
    status: "error",
    variant: "inline",
    message: "응답 생성에 실패했습니다",
    onRetry: () => alert("재시도"),
  },
};

/* ── Banner 변형 ── */

export const BannerLoading: Story = {
  args: { status: "loading", variant: "banner", message: "AI 응답을 불러오는 중입니다..." },
};

export const BannerError: Story = {
  args: {
    status: "error",
    variant: "banner",
    message: "네트워크 오류가 발생했습니다. 연결을 확인해주세요.",
    onRetry: () => alert("재시도"),
  },
};

export const BannerSuccess: Story = {
  args: { status: "success", variant: "banner", message: "응답이 완료되었습니다", successAutoDismiss: 0 },
};

/* ── Dot 변형 ── */

export const DotVariants: Story = {
  render: () => (
    <div className="flex items-center gap-4 flex-wrap">
      {(["loading", "thinking", "streaming", "success", "error"] as StatusState[]).map(
        (s) => (
          <div key={s} className="flex flex-col items-center gap-1.5">
            <StatusIndicator status={s} variant="dot" />
            <span className="text-xs text-text-muted">{s}</span>
          </div>
        ),
      )}
    </div>
  ),
};

/* ── 전체 상태 갤러리 ── */

export const AllStatesInline: Story = {
  render: () => (
    <div className="space-y-3">
      {(["loading", "thinking", "streaming", "success", "error"] as StatusState[]).map(
        (s) => (
          <StatusIndicator
            key={s}
            status={s}
            variant="inline"
            successAutoDismiss={0}
            onRetry={s === "error" ? () => {} : undefined}
          />
        ),
      )}
    </div>
  ),
};

export const AllStatesBanner: Story = {
  render: () => (
    <div className="space-y-2 max-w-md">
      {(["loading", "thinking", "streaming", "success", "error"] as StatusState[]).map(
        (s) => (
          <StatusIndicator
            key={s}
            status={s}
            variant="banner"
            successAutoDismiss={0}
            onRetry={s === "error" ? () => {} : undefined}
          />
        ),
      )}
    </div>
  ),
};

/* ── 인터랙티브: 상태 전환 시뮬레이션 ── */

export const StateMachineDemo: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [status, setStatus] = useState<StatusState>("idle");

    async function simulate() {
      const steps: [StatusState, number][] = [
        ["loading",   600],
        ["thinking",  1200],
        ["streaming", 2000],
        ["success",   800],
        ["idle",      0],
      ];
      for (const [s, delay] of steps) {
        setStatus(s);
        if (delay) await new Promise((r) => setTimeout(r, delay));
      }
    }

    return (
      <div className="space-y-4 max-w-sm">
        <StatusIndicator
          status={status}
          variant="banner"
          successAutoDismiss={0}
          onRetry={() => simulate()}
        />
        <button
          onClick={simulate}
          disabled={status !== "idle"}
          className="px-4 py-2 text-sm bg-accent text-white rounded-lg disabled:opacity-40"
        >
          {status === "idle" ? "▶ 상태 전환 시뮬레이션" : "실행 중..."}
        </button>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "idle → loading → thinking → streaming → success 순서로 상태가 전환되는 시뮬레이션.",
      },
    },
  },
};

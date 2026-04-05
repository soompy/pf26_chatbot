/**
 * features/chat — MessageBubble 래퍼
 *
 * design-system/MessageBubble(base)를 감싸
 * chat store의 Message 타입과 연결.
 *
 * React.memo 적용:
 *   - message 객체 참조가 바뀌지 않은 버블은 스트리밍 중에도 리렌더링 skip
 *   - updateMessage()는 수정된 message만 새 객체로 생성하므로
 *     스트리밍 중인 버블만 재렌더링되고 나머지는 그대로 유지됨
 *
 * regenerate 내부 처리:
 *   - onRegenerate prop을 부모에서 받으면 MessageList가 매 렌더마다
 *     새 함수를 생성해 memo가 무력화됨 → 직접 context에서 가져옴
 */

"use client";

import { memo, useCallback } from "react";
import { MessageBubble as BaseMessageBubble } from "@/design-system/components/MessageBubble";
import { useChatContext } from "../context/ChatContext";
import type { Message } from "../types/chat.types";

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
  isThinking?: boolean;
}

export const MessageBubble = memo(function MessageBubble({
  message,
  isStreaming = false,
  isThinking = false,
}: MessageBubbleProps) {
  const { regenerate, isStreaming: globalIsStreaming } = useChatContext();

  const handleCopy = useCallback(async (content: string) => {
    await navigator.clipboard.writeText(content).catch(() => {});
  }, []);

  const handleRegenerate = useCallback(() => {
    regenerate(message.id);
  }, [regenerate, message.id]);

  // 스트리밍 중이거나 assistant·done 조건 미충족이면 재생성 버튼 숨김
  const onRegenerate =
    message.role === "assistant" &&
    message.status === "done" &&
    !globalIsStreaming
      ? handleRegenerate
      : undefined;

  return (
    <BaseMessageBubble
      role={message.role}
      content={message.content}
      status={message.status}
      isStreaming={isStreaming}
      isThinking={isThinking}
      model={message.model}
      tokenCount={message.tokenCount}
      attachments={message.attachments}
      createdAt={message.createdAt}
      onCopy={handleCopy}
      onRegenerate={onRegenerate}
    />
  );
});

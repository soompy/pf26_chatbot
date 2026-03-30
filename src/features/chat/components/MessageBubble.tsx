/**
 * features/chat — MessageBubble 래퍼
 *
 * design-system/MessageBubble(base)를 감싸
 * chat store의 Message 타입과 연결.
 */

"use client";

import { useCallback } from "react";
import { MessageBubble as BaseMessageBubble } from "@/design-system/components/MessageBubble";
import type { Message } from "../types/chat.types";

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
  isThinking?: boolean;
  onRegenerate?: () => void;
}

export function MessageBubble({
  message,
  isStreaming = false,
  isThinking = false,
  onRegenerate,
}: MessageBubbleProps) {
  const handleCopy = useCallback(async (content: string) => {
    await navigator.clipboard.writeText(content).catch(() => {});
  }, []);

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
}

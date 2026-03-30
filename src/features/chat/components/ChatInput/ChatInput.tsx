/**
 * features/chat — ChatInput 래퍼
 *
 * design-system/ChatInput(base)를 감싸
 * useStreamingChat store hook과 연결.
 */

"use client";

import { ChatInput as BaseChatInput } from "@/design-system/components/ChatInput";
import { useStreamingChat } from "../../hooks/useStreamingChat";
import type { Attachment } from "../../types/chat.types";

export function ChatInput() {
  const { sendMessage, stopStreaming, isStreaming } = useStreamingChat();

  return (
    <BaseChatInput
      onSubmit={(content: string, attachments: Attachment[]) =>
        sendMessage(content, attachments)
      }
      onStop={stopStreaming}
      isStreaming={isStreaming}
    />
  );
}

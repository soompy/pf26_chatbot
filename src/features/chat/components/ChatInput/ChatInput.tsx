/**
 * features/chat — ChatInput 래퍼
 *
 * design-system/ChatInput(base)를 감싸
 * useChat 훅과 연결. 에러 상태를 ChatErrorBanner로 표시한다.
 */

"use client";

import { ChatInput as BaseChatInput } from "@/design-system/components/ChatInput";
import { useChatContext } from "../../context/ChatContext";
import { ChatErrorBanner } from "../ChatErrorBanner";
import type { Attachment } from "../../types/chat.types";

export function ChatInput() {
  const { sendMessage, stopStreaming, retry, isStreaming, error, clearError } = useChatContext();

  return (
    <div className="flex flex-col">
      {error && (
        <ChatErrorBanner
          error={error}
          onRetry={error.retryable ? retry : undefined}
          onDismiss={clearError}
        />
      )}
      <BaseChatInput
        onSubmit={(content: string, attachments: Attachment[]) =>
          sendMessage(content, attachments)
        }
        onStop={stopStreaming}
        isStreaming={isStreaming}
      />
    </div>
  );
}

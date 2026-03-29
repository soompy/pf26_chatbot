"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { Avatar } from "@/design-system";
import type { Message } from "../types/chat.types";
import { clsx } from "clsx";

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
}

export function MessageBubble({ message, isStreaming }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isError = message.status === "error";

  return (
    <div
      className={clsx(
        "group flex gap-3 px-4 py-3 message-enter hover:bg-surface-raised/40 transition-colors duration-fast",
        isUser && "flex-row-reverse"
      )}
    >
      <Avatar role={message.role} size="md" className="mt-0.5" />

      <div className={clsx("flex flex-col gap-1 max-w-[80%]", isUser && "items-end")}>
        {/* 메타 정보 */}
        <div
          className={clsx(
            "flex items-center gap-2 text-xs text-text-muted",
            isUser && "flex-row-reverse"
          )}
        >
          <span className="font-medium text-text-secondary">
            {isUser ? "You" : "Assistant"}
          </span>
          {message.model && (
            <span className="text-text-muted">{message.model}</span>
          )}
        </div>

        {/* 첨부 파일 */}
        {message.attachments && message.attachments.length > 0 && (
          <div className={clsx("flex flex-wrap gap-2 mb-1", isUser && "justify-end")}>
            {message.attachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center gap-1.5 bg-surface-overlay border border-[var(--color-border)] rounded-lg px-2.5 py-1.5 text-xs text-text-secondary"
              >
                {att.type === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={att.url}
                    alt={att.name}
                    className="h-16 w-16 object-cover rounded"
                  />
                ) : (
                  <>
                    <span>📎</span>
                    <span className="max-w-[120px] truncate">{att.name}</span>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 메시지 본문 */}
        <div
          className={clsx(
            "text-sm leading-relaxed transition-shadow duration-normal",
            isUser
              ? "bubble-user"
              : clsx("bubble-ai", isStreaming && "is-streaming"),
            isError && "status-error"
          )}
        >
          {isError ? (
            <span className="text-error">
              응답 중 오류가 발생했습니다. 다시 시도해 주세요.
            </span>
          ) : isUser ? (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          ) : (
            <div className={clsx("prose prose-invert prose-sm max-w-none", isStreaming && message.content === "" ? "streaming-cursor" : "")}>
              {message.content ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                  components={{
                    code({ className, children, ...props }) {
                      const isInline = !className;
                      if (isInline) {
                        return (
                          <code
                            className="bg-surface-overlay px-1.5 py-0.5 rounded text-accent text-xs font-mono"
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      }
                      return (
                        <code className={clsx(className, "text-xs")} {...props}>
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              ) : null}
              {isStreaming && (
                <span className="streaming-cursor inline-block ml-0.5" aria-hidden="true" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

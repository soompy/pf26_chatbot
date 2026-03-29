import type { ChatRequest } from "@/features/chat/types/chat.types";

export class StreamAbortError extends Error {
  constructor() {
    super("Stream aborted by user");
    this.name = "StreamAbortError";
  }
}

/**
 * OpenAI-compatible SSE 스트림을 async generator로 래핑
 * 청크 단위로 텍스트 델타를 yield한다.
 */
export async function* streamChatCompletion(
  body: ChatRequest,
  signal?: AbortSignal
): AsyncGenerator<string> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error ?? `HTTP ${response.status}`);
  }

  if (!response.body) throw new Error("No response body");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data: ")) continue;

        const data = trimmed.slice(6);
        if (data === "[DONE]") return;

        try {
          const parsed = JSON.parse(data);
          const delta = parsed.choices?.[0]?.delta?.content;
          if (typeof delta === "string") yield delta;
        } catch {
          // 파싱 불가 청크는 무시
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

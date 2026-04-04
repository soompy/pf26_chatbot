import type { ChatRequest } from "@/features/chat/types/chat.types";
import { ModelError } from "@/lib/api/errors";

/**
 * OpenAI-compatible SSE 스트림을 async generator로 래핑
 * 청크 단위로 텍스트 델타를 yield한다.
 *
 * @param onUsage 스트림 완료 시 completion token 수를 받는 콜백.
 *   OpenAI: stream_options.include_usage=true 로 마지막 청크에 포함.
 *   Anthropic: message_delta 이벤트의 usage.output_tokens를 변환해 전달.
 */
export async function* streamChatCompletion(
  body: ChatRequest,
  signal?: AbortSignal,
  onUsage?: (usage: { completionTokens?: number; inputTokens?: number }) => void
): AsyncGenerator<string> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new ModelError(response.status, err.error ?? undefined);
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

          // usage 청크: choices가 비어있고 usage 정보가 있는 경우
          if (!parsed.choices?.length && parsed.usage) {
            const { completion_tokens, prompt_tokens } = parsed.usage;
            if (completion_tokens != null || prompt_tokens != null) {
              onUsage?.({
                completionTokens: completion_tokens ?? undefined,
                inputTokens: prompt_tokens ?? undefined,
              });
            }
            continue;
          }

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

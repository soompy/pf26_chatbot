import { NextRequest } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { messages, model, systemPrompt } = body;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "OPENAI_API_KEY가 설정되지 않았습니다." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const isAnthropic = model?.startsWith("claude");

  try {
    if (isAnthropic) {
      // Anthropic API (claude-*)
      const anthropicKey = process.env.ANTHROPIC_API_KEY;
      if (!anthropicKey) {
        return new Response(
          JSON.stringify({ error: "ANTHROPIC_API_KEY가 설정되지 않았습니다." }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": anthropicKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model,
          max_tokens: 4096,
          stream: true,
          system: systemPrompt,
          messages,
        }),
      });

      // Anthropic → OpenAI SSE 포맷 변환
      const stream = transformAnthropicStream(response.body!);
      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    } else {
      // OpenAI API (gpt-*)
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: systemPrompt
            ? [{ role: "system", content: systemPrompt }, ...messages]
            : messages,
          stream: true,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        return new Response(JSON.stringify({ error: err.error?.message ?? "API error" }), {
          status: response.status,
          headers: { "Content-Type": "application/json" },
        });
      }

      // OpenAI 스트림 그대로 패스스루
      return new Response(response.body, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

/**
 * Anthropic SSE 포맷을 OpenAI SSE 포맷으로 변환하는 TransformStream
 * 클라이언트 파서를 단일화하기 위해 사용
 */
function transformAnthropicStream(body: ReadableStream<Uint8Array>): ReadableStream<Uint8Array> {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  return new ReadableStream({
    async start(controller) {
      const reader = body.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            try {
              const event = JSON.parse(line.slice(6));
              if (event.type === "content_block_delta" && event.delta?.type === "text_delta") {
                const openaiChunk = {
                  choices: [{ delta: { content: event.delta.text } }],
                };
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify(openaiChunk)}\n\n`)
                );
              }
            } catch {
              // 파싱 불가 이벤트 무시
            }
          }
        }
      } catch (e) {
        controller.error(e);
      }
    },
  });
}

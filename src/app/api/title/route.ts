import { NextRequest } from "next/server";

export const runtime = "edge";

/**
 * POST /api/title
 * 첫 번째 사용자 메시지를 기반으로 대화 제목을 생성한다.
 * 스트리밍 없이 단순 JSON 응답.
 */
export async function POST(req: NextRequest) {
  const { firstUserMessage, model } = await req.json();
  const isAnthropic = (model as string)?.startsWith("claude");

  const prompt = `다음 메시지 내용을 보고 대화 제목을 한국어(또는 영어)로 15자 이내로 한 줄 만들어주세요. 제목 텍스트만 출력하세요. 따옴표·마침표·이모지 없이.\n\n"${String(firstUserMessage).slice(0, 300)}"`;

  try {
    if (isAnthropic) {
      const anthropicKey = process.env.ANTHROPIC_API_KEY;
      if (!anthropicKey) return Response.json({ title: null }, { status: 500 });

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": anthropicKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model,
          max_tokens: 30,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await res.json();
      const title = (data.content?.[0]?.text as string | undefined)?.trim() ?? null;
      return Response.json({ title });
    } else {
      const openaiKey = process.env.OPENAI_API_KEY;
      if (!openaiKey) return Response.json({ title: null }, { status: 500 });

      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          max_tokens: 30,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await res.json();
      const title = (data.choices?.[0]?.message?.content as string | undefined)?.trim() ?? null;
      return Response.json({ title });
    }
  } catch {
    return Response.json({ title: null }, { status: 500 });
  }
}

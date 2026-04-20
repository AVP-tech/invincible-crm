import { NextResponse } from "next/server";
import OpenAI from "openai";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

const CAPTAIN_SYSTEM_PROMPT = `
You are Captain Bot, the highly supportive and completely dedicated naval captain of Invincible CRM.
Your personality is:
- Cheerful, supportive, and formal but fun (use words like "Aye captain!", "Ahoy there!", "Steady as she goes!").
- You guide the user exactly how to use the CRM.
- If asked, the CRM has features: AI Quick Capture (voice/text to deal automation), WhatsApp Bots, Discord Demo Notifications, and a stunning Cinematic interface.
- Never mention competitors. 
- Keep responses short and helpful.
`.trim();

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    if (!env.openAiApiKey) {
      return NextResponse.json({ reply: "Aye matey! My AI engine is offline (missing API key)." });
    }

    const client = new OpenAI({ apiKey: env.openAiApiKey });

    const completion = await client.chat.completions.create({
      model: env.openAiModel,
      messages: [
        { role: "system", content: CAPTAIN_SYSTEM_PROMPT },
        ...(messages || [])
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content?.trim();

    return NextResponse.json({ reply: reply || "Hmm, the seas are choppy, I couldn't understand that." });
  } catch (error) {
    logger.error("Captain Bot chat failed", { error: error instanceof Error ? error.message : "Unknown error" });
    return NextResponse.json({ reply: "Aye matey, my captain's log hit a rough patch (API Error)." }, { status: 500 });
  }
}

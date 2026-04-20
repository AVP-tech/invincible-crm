import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/auth";
import OpenAI from "openai";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";
import { parseCaptureResult } from "@/features/capture/parser";
import { applyCapturePreview } from "@/features/capture/service";

const CAPTAIN_SYSTEM_PROMPT = `
You are Captain Hook, the highly supportive and completely dedicated naval captain of Invincible CRM.
Your personality is:
- Cheerful, supportive, and formal but fun (use words like "Aye captain!", "Ahoy there!", "Steady as she goes!").
- You guide the user exactly how to use the CRM.
- You HAVE ACCESS to their CRM system. If they ask you to save a reminder, note, task, deal or contact, immediately use the 'run_quick_capture' tool to do it!
PRICING KNOWLEDGE:
- Free Plan: Basic features, community support.
- Intermediate Plan: Priority 12hr support, advanced features.
- Advanced Plan: 24/7 unlimited white-glove support, all features.
- Never mention competitors. 
- Keep responses short and helpful (max 1 or 2 sentences).
`.trim();

const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "run_quick_capture",
      description: "Saves a reminder, deal, task, note, or contact to the CRM database automatically. Triggers when the user asks to save something, remember something, or create a record.",
      parameters: {
        type: "object",
        properties: {
          instruction: {
            type: "string",
            description: "The raw text instruction of what the user wants to save. e.g. 'Call John tomorrow' or 'Met Sarah for 50k deal'."
          }
        },
        required: ["instruction"]
      }
    }
  }
];

export async function POST(request: Request) {
  try {
    const user = await getApiUser();
    
    // Auth guard for tools
    if (!user) {
      return NextResponse.json({ reply: "Ahoy! You need to log in first before I can help you." }, { status: 401 });
    }

    const { messages } = await request.json();

    if (!env.openAiApiKey) {
      return NextResponse.json({ reply: "Aye matey! My AI engine is offline (missing API key)." });
    }

    const client = new OpenAI({ apiKey: env.openAiApiKey });
    const fullMessages = [
        { role: "system", content: CAPTAIN_SYSTEM_PROMPT },
        ...(messages || [])
    ] as any[];

    let completion = await client.chat.completions.create({
      model: env.openAiModel,
      messages: fullMessages,
      tools: tools,
      tool_choice: "auto",
      max_tokens: 300,
      temperature: 0.7,
    });

    let message = completion.choices[0]?.message;

    // Handle tool invocations
    if (message?.tool_calls) {
      fullMessages.push(message);
      
      for (const toolCall of message.tool_calls) {
        if (toolCall.type === "function" && toolCall.function.name === "run_quick_capture") {
          try {
            const args = JSON.parse(toolCall.function.arguments);
            const parsed = await parseCaptureResult(user.workspaceId, args.instruction);
            await applyCapturePreview(user.workspaceId, user.id, args.instruction, parsed.preview, { captureTitle: "Added by Captain Hook", noteSource: "captain_hook" });
            
            fullMessages.push({
              tool_call_id: toolCall.id,
              role: "tool",
              name: "run_quick_capture",
              content: "Success, the data was parsed and saved to the CRM correctly."
            });
          } catch (e) {
            fullMessages.push({
              tool_call_id: toolCall.id,
              role: "tool",
              name: "run_quick_capture",
              content: "Error parsing and saving. Tell the user it failed."
            });
          }
        }
      }
      
      // Make second call to let AI respond naturally
      completion = await client.chat.completions.create({
        model: env.openAiModel,
        messages: fullMessages,
        max_tokens: 300,
      });
      
      message = completion.choices[0]?.message;
    }

    const reply = message?.content?.trim();

    return NextResponse.json({ reply: reply || "Hmm, the seas are choppy, I couldn't understand that." });
  } catch (error) {
    logger.error("Captain Hook chat failed", { error: error instanceof Error ? error.message : "Unknown error" });
    return NextResponse.json({ reply: "Aye matey, my captain's log hit a rough patch (API Error)." }, { status: 500 });
  }
}

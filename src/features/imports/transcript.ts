import OpenAI from "openai";
import { type CapturePreview, transcriptPreviewSchema, type TranscriptPreview } from "@/lib/schemas";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";
import { parseCapturePreview } from "@/features/capture/parser";

const transcriptSystemPrompt = `
You convert a meeting or sales transcript into a CRM import preview.
Return valid JSON only.

Schema:
{
  "summary": string,
  "keyTakeaways": string[],
  "actionItems": string[],
  "preview": {
    "actionType": "create" | "update" | "mixed" | "note",
    "parserMode": "AI",
    "summary": string,
    "confidence": number,
    "missingFields": string[],
    "suggestedUpdates": string[],
    "existingContactId": string | undefined,
    "existingDealId": string | undefined,
    "contact": {
      "name": string | undefined,
      "email": string | undefined,
      "phone": string | undefined,
      "companyName": string | undefined,
      "source": string | undefined,
      "tags": string[]
    } | undefined,
    "deal": {
      "title": string | undefined,
      "description": string | undefined,
      "stage": "NEW_LEAD" | "CONTACTED" | "QUALIFIED" | "PROPOSAL_SENT" | "NEGOTIATION" | "WON" | "LOST",
      "amount": number | null | undefined,
      "currency": string,
      "expectedCloseDate": string | undefined,
      "nextStep": string | undefined
    } | undefined,
    "task": {
      "title": string | undefined,
      "description": string | undefined,
      "dueDate": string | undefined,
      "priority": "LOW" | "MEDIUM" | "HIGH",
      "status": "OPEN"
    } | undefined,
    "note": string | undefined
  }
}

Rules:
- Summarize the meeting in a concise CRM-ready note.
- Extract one best contact/deal/task set for this MVP.
- If there is a clear next action, create a task.
- If there is budget, proposal, or buying intent, create or update a deal.
- The note should be cleanly written even if the transcript is messy.
`.trim();

function toBullets(lines: string[], limit: number) {
  return lines
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, limit);
}

function summarizeTranscriptFallback(transcript: string) {
  const cleaned = transcript.replace(/\s+/g, " ").trim();
  const chunks = cleaned
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  return chunks.slice(0, 3).join(" ");
}

function deriveTakeaways(transcript: string) {
  const lines = transcript
    .split(/\n+/)
    .map((line) => line.replace(/^[A-Za-z ]+:\s*/, "").trim())
    .filter(Boolean);

  const takeaways = lines.filter((line) => /(budget|proposal|quote|interested|needs|wants|timeline|decision)/i.test(line));
  return toBullets(takeaways.length ? takeaways : lines, 4);
}

function deriveActionItems(transcript: string, preview: CapturePreview) {
  const lines = transcript
    .split(/\n+/)
    .map((line) => line.replace(/^[A-Za-z ]+:\s*/, "").trim())
    .filter(Boolean);

  const actions = lines.filter((line) => /(follow up|follow-up|send|call|share|schedule|review|next step|by friday|tomorrow|monday|tuesday|wednesday|thursday)/i.test(line));

  if (actions.length) {
    return toBullets(actions, 4);
  }

  if (preview.task?.title) {
    return [preview.task.title];
  }

  return [];
}

async function parseWithOpenAi(transcript: string, baseDate = new Date()) {
  if (!env.openAiApiKey) return null;

  const client = new OpenAI({ apiKey: env.openAiApiKey });
  const completion = await client.chat.completions.create({
    model: env.openAiModel,
    response_format: {
      type: "json_object"
    },
    messages: [
      {
        role: "system",
        content: transcriptSystemPrompt
      },
      {
        role: "user",
        content: `Reference date: ${baseDate.toISOString()}\nTranscript:\n${transcript}`
      }
    ]
  });

  const raw = completion.choices[0]?.message?.content;

  if (!raw) return null;

  const parsed = transcriptPreviewSchema.safeParse(JSON.parse(raw));
  return parsed.success ? parsed.data : null;
}

export async function parseTranscriptPreview(workspaceId: string, transcript: string, baseDate = new Date()): Promise<TranscriptPreview> {
  try {
    const aiPreview = await parseWithOpenAi(transcript, baseDate);

    if (aiPreview) {
      return aiPreview;
    }
  } catch (error) {
    logger.warn("Transcript import AI parse failed. Falling back to deterministic parsing.", {
      feature: "transcript_import",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }

  const preview = await parseCapturePreview(workspaceId, transcript, baseDate);
  const summary = summarizeTranscriptFallback(transcript);
  const keyTakeaways = deriveTakeaways(transcript);
  const actionItems = deriveActionItems(transcript, preview);

  return transcriptPreviewSchema.parse({
    summary,
    keyTakeaways,
    actionItems,
    preview: {
      ...preview,
      summary: preview.summary || "Transcript import preview",
      note:
        [
          summary,
          keyTakeaways.length ? `Key takeaways:\n- ${keyTakeaways.join("\n- ")}` : null,
          actionItems.length ? `Action items:\n- ${actionItems.join("\n- ")}` : null
        ]
          .filter(Boolean)
          .join("\n\n")
    }
  });
}

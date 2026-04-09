import { DealStage, TaskPriority } from "@prisma/client";
import OpenAI from "openai";
import { db } from "@/lib/db";
import { resolveRelativeDate } from "@/lib/date-parser";
import { env } from "@/lib/env";
import { capturePreviewSchema, type CapturePreview } from "@/lib/schemas";
import { isNonEmptyString, titleCase } from "@/lib/utils";

const systemPrompt = `
You convert natural-language CRM updates into a structured JSON preview for a simple CRM.
Return valid JSON only.

Schema:
{
  "actionType": "create" | "update" | "mixed" | "note",
  "parserMode": "AI",
  "summary": string,
  "confidence": number between 0 and 1,
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
    "expectedCloseDate": ISO string | undefined,
    "nextStep": string | undefined
  } | undefined,
  "task": {
    "title": string | undefined,
    "description": string | undefined,
    "dueDate": ISO string | undefined,
    "priority": "LOW" | "MEDIUM" | "HIGH",
    "status": "OPEN"
  } | undefined,
  "note": string | undefined
}
`.trim();

function extractAmount(input: string) {
  const match = input.toLowerCase().match(/(\d+(?:\.\d+)?)\s*(k|lakh|lac|m|million)?/);

  if (!match) return undefined;

  const base = Number(match[1]);
  const multiplier = match[2];

  if (!Number.isFinite(base)) return undefined;
  if (!multiplier) return base;
  if (multiplier === "k") return base * 1000;
  if (multiplier === "m" || multiplier === "million") return base * 1_000_000;

  return base * 100_000;
}

function deriveContactName(input: string) {
  const cleanCapturedName = (value: string) =>
    value
      .replace(/^(call|met|meet|email|message)\s+/i, "")
      .replace(/\s+(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday)$/i, "")
      .trim();

  const directPatterns = [
    /\b(?:call|email|message|follow up with|follow-up with|spoke to|met|meet|sent quote to|sent proposal to|with)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)(?=\s+(?:today|tomorrow|next|in|on|about|regarding|from)\b|,|$)/i,
    /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)(?=\s+(?:wants|needs|said|mentioned|asked)\b)/i
  ];

  for (const pattern of directPatterns) {
    const match = input.match(pattern);

    if (match?.[1]) {
      return cleanCapturedName(match[1]);
    }
  }

  const capitalized = input.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/);
  return capitalized?.[1] ? cleanCapturedName(capitalized[1]) : undefined;
}

function deriveCompanyName(input: string) {
  const match = input.match(/\b(?:from|at)\s+([A-Z][A-Za-z0-9&.\-]+(?:\s+[A-Z][A-Za-z0-9&.\-]+)*)/);
  return match?.[1]?.trim();
}

function deriveTaskTitle(input: string, contactName?: string) {
  const normalized = input.toLowerCase();

  if (normalized.includes("call")) {
    return `Call ${contactName ?? "contact"}`.trim();
  }

  if (normalized.includes("follow up")) {
    return `Follow up with ${contactName ?? "contact"}`.trim();
  }

  if (normalized.includes("proposal")) {
    return `Send proposal to ${contactName ?? "contact"}`.trim();
  }

  if (normalized.includes("quote")) {
    return `Send quote to ${contactName ?? "contact"}`.trim();
  }

  return contactName ? `Follow up with ${contactName}` : "Follow up";
}

function deriveDealStage(input: string) {
  const normalized = input.toLowerCase();

  if (normalized.includes("won")) return DealStage.WON;
  if (normalized.includes("lost")) return DealStage.LOST;
  if (normalized.includes("negotiation")) return DealStage.NEGOTIATION;
  if (normalized.includes("proposal") || normalized.includes("quote")) return DealStage.PROPOSAL_SENT;
  if (normalized.includes("interested") || normalized.includes("budget") || normalized.includes("qualified")) {
    return DealStage.QUALIFIED;
  }
  if (normalized.includes("contacted") || normalized.includes("waiting")) return DealStage.CONTACTED;

  return DealStage.NEW_LEAD;
}

function deriveDealTitle(input: string, contactName?: string) {
  const aboutMatch = input.match(/\b(?:about|for|regarding)\s+([^,.]+)/i);

  if (aboutMatch?.[1]) {
    return titleCase(aboutMatch[1].trim());
  }

  const wantsMatch = input.match(/\bwants?\s+([^,.]+)/i);

  if (wantsMatch?.[1]) {
    return titleCase(wantsMatch[1].trim());
  }

  return contactName ? `${contactName} opportunity` : undefined;
}

export function fallbackParseCapture(input: string, baseDate = new Date()): CapturePreview {
  const relativeDate = resolveRelativeDate(input, baseDate);
  const contactName = deriveContactName(input);
  const companyName = deriveCompanyName(input);
  const amount = extractAmount(input);
  const wantsTask =
    /\b(call|follow up|follow-up|send|remind|check in|check-in|proposal|quote)\b/i.test(input);
  const wantsDeal = /\b(budget|proposal|quote|interested|deal|wants|need|needs|crm|website)\b/i.test(input);
  const stage = deriveDealStage(input);
  const taskTitle = wantsTask ? deriveTaskTitle(input, contactName) : undefined;
  const note = input.trim();
  const missingFields = [];

  if (!contactName) {
    missingFields.push("Contact name");
  }

  return capturePreviewSchema.parse({
    actionType: wantsTask && wantsDeal ? "mixed" : wantsDeal ? "create" : wantsTask ? "create" : "note",
    parserMode: "FALLBACK",
    summary: contactName
      ? `Capture ${wantsTask ? "follow-up" : "note"} for ${contactName}`
      : "Capture CRM update",
    confidence: contactName ? 0.68 : 0.46,
    missingFields,
    suggestedUpdates: contactName
      ? ["Review extracted fields before saving"]
      : ["Add a contact name so the CRM can connect this update"],
    contact: contactName
      ? {
          name: contactName,
          companyName,
          source: "Quick Capture",
          tags: wantsDeal ? ["AI capture"] : []
        }
      : undefined,
    deal: wantsDeal
      ? {
          title: deriveDealTitle(input, contactName),
          description: note,
          stage,
          amount,
          currency: "INR",
          expectedCloseDate: relativeDate.date?.toISOString(),
          nextStep: wantsTask ? taskTitle : undefined
        }
      : undefined,
    task: wantsTask
      ? {
          title: taskTitle,
          description: note,
          dueDate: relativeDate.date?.toISOString(),
          priority: /\burgent|asap|today\b/i.test(input) ? TaskPriority.HIGH : TaskPriority.MEDIUM,
          status: "OPEN"
        }
      : undefined,
    note
  });
}

async function findMatches(userId: string, preview: CapturePreview) {
  let existingContactId = preview.existingContactId;
  let existingDealId = preview.existingDealId;

  if (!existingContactId && preview.contact?.email) {
    const existing = await db.contact.findFirst({
      where: {
        userId,
        email: preview.contact.email
      }
    });

    if (existing) {
      existingContactId = existing.id;
    }
  }

  if (!existingContactId && preview.contact?.name) {
    const existing = await db.contact.findFirst({
      where: {
        userId,
        name: preview.contact.name
      }
    });

    if (existing) {
      existingContactId = existing.id;
    }
  }

  if (!existingDealId && existingContactId && isNonEmptyString(preview.deal?.title)) {
    const existingDeal = await db.deal.findFirst({
      where: {
        userId,
        contactId: existingContactId,
        title: preview.deal.title
      }
    });

    if (existingDeal) {
      existingDealId = existingDeal.id;
    }
  }

  return {
    ...preview,
    existingContactId,
    existingDealId,
    actionType: existingContactId ? (preview.task || preview.deal ? "update" : preview.actionType) : preview.actionType,
    suggestedUpdates: existingContactId
      ? [...preview.suggestedUpdates, "Matched an existing contact, so this can update instead of duplicate"]
      : preview.suggestedUpdates
  } satisfies CapturePreview;
}

async function parseWithOpenAi(input: string, baseDate = new Date()) {
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
        content: systemPrompt
      },
      {
        role: "user",
        content: `Reference date: ${baseDate.toISOString()}\nInput: ${input}`
      }
    ]
  });

  const raw = completion.choices[0]?.message?.content;

  if (!raw) return null;

  const parsed = capturePreviewSchema.safeParse(JSON.parse(raw));

  if (!parsed.success) {
    return null;
  }

  return parsed.data;
}

export async function parseCapturePreview(userId: string, input: string, baseDate = new Date()) {
  try {
    const aiPreview = await parseWithOpenAi(input, baseDate);

    if (aiPreview) {
      return findMatches(userId, aiPreview);
    }
  } catch (error) {
    console.error("AI capture parse failed, falling back", error);
  }

  return findMatches(userId, fallbackParseCapture(input, baseDate));
}

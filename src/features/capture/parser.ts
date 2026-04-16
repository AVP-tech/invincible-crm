import { DealStage, TaskPriority } from "@prisma/client";
import { generateObject } from "ai";
import OpenAI from "openai";
import { db } from "@/lib/db";
import { resolveRelativeDate } from "@/lib/date-parser";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";
import { capturePreviewSchema, type CapturePreview } from "@/lib/schemas";
import { isNonEmptyString, titleCase } from "@/lib/utils";

const systemPrompt = `
You convert natural-language CRM updates into a structured JSON preview for a simple CRM.
Return valid JSON only.
Extract dates and money aggressively when the user implies them.
Examples: "budget 80k" => amount 80000, "1.5 lakh" => 150000, "send proposal Friday" => due or close date should be that Friday.

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
  const normalized = input.toLowerCase();
  const contextualPatterns = [
    /\b(?:budget|amount|price|pricing|value|worth|quote|proposal|deal value|deal worth|cost)\s*(?:is|of|for|around|about|at)?\s*(?:rs\.?|inr|usd|eur|\$|€|₹)?\s*([0-9][0-9,]*(?:\.\d+)?)\s*(k|thousand|l|lac|lakh|m|mn|million|cr|crore)?\b/i,
    /\b(?:rs\.?|inr|usd|eur|\$|€|₹)\s*([0-9][0-9,]*(?:\.\d+)?)\s*(k|thousand|l|lac|lakh|m|mn|million|cr|crore)?\b/i,
    /\b([0-9][0-9,]*(?:\.\d+)?)\s*(k|thousand|l|lac|lakh|m|mn|million|cr|crore)\b/i
  ];

  const parseAmount = (rawAmount: string, rawMultiplier?: string) => {
    const base = Number(rawAmount.replace(/,/g, ""));
    const multiplier = rawMultiplier?.toLowerCase();

    if (!Number.isFinite(base)) return undefined;
    if (!multiplier) return base >= 1000 ? base : undefined;
    if (multiplier === "k" || multiplier === "thousand") return base * 1000;
    if (multiplier === "m" || multiplier === "mn" || multiplier === "million") return base * 1_000_000;
    if (multiplier === "cr" || multiplier === "crore") return base * 10_000_000;

    return base * 100_000;
  };

  for (const pattern of contextualPatterns) {
    const match = normalized.match(pattern);

    if (match?.[1]) {
      return parseAmount(match[1], match[2]);
    }
  }

  return undefined;
}

function deriveCurrency(input: string) {
  const normalized = input.toLowerCase();

  if (/\b(?:usd|dollars?)\b/.test(normalized) || input.includes("$")) {
    return "USD";
  }

  if (/\b(?:eur|euros?)\b/.test(normalized) || input.includes("€")) {
    return "EUR";
  }

  return "INR";
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

function uniqueItems(items: string[]) {
  return Array.from(new Set(items.filter(Boolean)));
}

export type CaptureParseResult = {
  preview: CapturePreview;
  status: "ready" | "fallback";
  fallbackReason?: "ai_unavailable";
  provider?: "OpenAI";
};

function mergeCapturePreview(preferred: CapturePreview, fallback: CapturePreview): CapturePreview {
  const mergedContact = preferred.contact || fallback.contact
    ? {
        ...fallback.contact,
        ...preferred.contact,
        tags: uniqueItems([...(fallback.contact?.tags ?? []), ...(preferred.contact?.tags ?? [])])
      }
    : undefined;

  const mergedDeal = preferred.deal || fallback.deal
    ? {
        ...fallback.deal,
        ...preferred.deal,
        currency: preferred.deal?.currency ?? fallback.deal?.currency ?? "INR"
      }
    : undefined;

  const mergedTask = preferred.task || fallback.task
    ? {
        ...fallback.task,
        ...preferred.task
      }
    : undefined;

  return capturePreviewSchema.parse({
    ...fallback,
    ...preferred,
    actionType:
      preferred.actionType !== "note" || fallback.actionType === "note" ? preferred.actionType : fallback.actionType,
    confidence: Math.max(preferred.confidence, fallback.confidence),
    missingFields: uniqueItems([...(preferred.missingFields ?? []), ...(fallback.missingFields ?? [])]),
    suggestedUpdates: uniqueItems([...(preferred.suggestedUpdates ?? []), ...(fallback.suggestedUpdates ?? [])]),
    contact: mergedContact,
    deal: mergedDeal,
    task: mergedTask,
    note: preferred.note ?? fallback.note
  });
}

export function fallbackParseCapture(input: string, baseDate = new Date()): CapturePreview {
  const relativeDate = resolveRelativeDate(input, baseDate);
  const contactName = deriveContactName(input);
  const companyName = deriveCompanyName(input);
  const amount = extractAmount(input);
  const currency = deriveCurrency(input);
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

  if (wantsTask) {
    missingFields.push("Task priority");
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
      ? uniqueItems(["Review extracted fields before saving", wantsTask ? "Choose a task priority before saving" : ""])
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
          currency,
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
  if (!env.openAiApiKey) {
    return { preview: null };
  }

  const client = new OpenAI({ apiKey: env.openAiApiKey });

  try {
    const completion = await client.chat.completions.create({
      model: env.openAiModel,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Reference date: ${baseDate.toISOString()}\nInput: ${input}` }
      ]
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      logger.warn("OpenAI capture parse returned empty content.", {
        feature: "quick_capture",
        provider: "openai",
        model: env.openAiModel,
        inputLength: input.length
      });
      return { preview: null };
    }

    const parsed = capturePreviewSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) {
      logger.warn("OpenAI capture parse returned invalid JSON for the schema.", {
        feature: "quick_capture",
        provider: "openai",
        model: env.openAiModel,
        inputLength: input.length
      });
      return { preview: null };
    }

    return { preview: parsed.data };
  } catch (error) {
    logger.warn("OpenAI capture parse failed. Falling back to pattern matching.", {
      feature: "quick_capture",
      provider: "openai",
      model: env.openAiModel,
      inputLength: input.length,
      error: error instanceof Error ? error.message : "Unknown error"
    });
    return { preview: null };
  }
}

export async function parseCaptureResult(userId: string, input: string, baseDate = new Date()): Promise<CaptureParseResult> {
  const fallbackPreview = fallbackParseCapture(input, baseDate);

  try {
    const openAiResult = await parseWithOpenAi(input, baseDate);
    const aiPreview = openAiResult.preview;

    if (aiPreview) {
      return {
        preview: await findMatches(userId, mergeCapturePreview(aiPreview, fallbackPreview)),
        status: "ready",
        provider: "OpenAI"
      };
    }
  } catch (error) {
    logger.error("Capture parsing failed unexpectedly. Falling back to pattern matching.", error, {
      feature: "quick_capture",
      inputLength: input.length
    });
  }

  return {
    preview: await findMatches(userId, fallbackPreview),
    status: "fallback",
    fallbackReason: "ai_unavailable"
  };
}

export async function parseCapturePreview(userId: string, input: string, baseDate = new Date()) {
  const result = await parseCaptureResult(userId, input, baseDate);
  return result.preview;
}

import { ActivityType, ConversationSource } from "@prisma/client";
import OpenAI from "openai";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { logActivity } from "@/lib/activity";
import { inboxPreviewSchema, type InboxPreview } from "@/lib/schemas";
import { parseCapturePreview } from "@/features/capture/parser";
import { applyCapturePreview } from "@/features/capture/service";
import { getWorkspaceByOwnerUserId } from "@/lib/workspace";
import { runAutomationTrigger } from "@/features/automations/service";

const inboxSystemPrompt = `
You convert pasted email threads or WhatsApp conversations into a CRM-ready preview.
Return valid JSON only.

Schema:
{
  "source": "WHATSAPP" | "EMAIL" | "MANUAL",
  "subject": string | undefined,
  "participantLabel": string | undefined,
  "summary": string,
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
      "status": "OPEN",
      "recurrencePattern": "NONE" | "DAILY" | "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "CUSTOM_DAYS",
      "recurrenceIntervalDays": number | undefined
    } | undefined,
    "note": string | undefined
  }
}

Rules:
- Summarize the conversation into a calm CRM update.
- Extract one best contact/deal/task set for this MVP.
- Preserve buying signals, delivery requests, budget, urgency, and explicit next steps.
- The note should read like a clean internal CRM note, not like a raw transcript.
`.trim();

type InboxInput = {
  source: ConversationSource;
  subject?: string;
  participantLabel?: string;
  content: string;
};

const sourceCopy: Record<ConversationSource, string> = {
  WHATSAPP: "WhatsApp",
  EMAIL: "Email",
  MANUAL: "Manual"
};

function normalizeConversationBody(content: string) {
  return content
    .replace(/^\s*>+\s?/gm, "")
    .replace(/^\[[^\]]+\]\s*/gm, "")
    .replace(/\r/g, "")
    .trim();
}

function toBullets(values: string[], limit: number) {
  return values
    .map((value) => value.trim())
    .filter(Boolean)
    .slice(0, limit);
}

function summarizeConversation(subject: string | undefined, participantLabel: string | undefined, content: string) {
  const cleaned = normalizeConversationBody(content);
  const chunks = cleaned
    .split(/\n+/)
    .map((line) => line.replace(/^[A-Za-z][A-Za-z .'-]{0,40}:\s*/, "").trim())
    .filter(Boolean);

  const primary = chunks.slice(0, 3).join(" ");
  const header = [subject, participantLabel].filter(Boolean).join(" • ");

  return [header || null, primary].filter(Boolean).join(" - ").slice(0, 400);
}

function deriveActionItems(content: string, fallbackTaskTitle?: string) {
  const lines = normalizeConversationBody(content)
    .split(/\n+/)
    .map((line) => line.replace(/^[A-Za-z][A-Za-z .'-]{0,40}:\s*/, "").trim())
    .filter(Boolean);

  const actions = lines.filter((line) => /(follow up|follow-up|send|share|call|reply|review|schedule|tomorrow|monday|tuesday|wednesday|thursday|friday|next week)/i.test(line));

  if (actions.length) {
    return toBullets(actions, 4);
  }

  return fallbackTaskTitle ? [fallbackTaskTitle] : [];
}

function buildConversationNote(
  source: ConversationSource,
  summary: string,
  actionItems: string[],
  subject: string | undefined,
  participantLabel: string | undefined,
  noteBody: string | undefined
) {
  const header = [
    `${sourceCopy[source]} capture`,
    subject ? `Subject: ${subject}` : null,
    participantLabel ? `People: ${participantLabel}` : null
  ]
    .filter(Boolean)
    .join(" • ");

  return [header, summary, noteBody && noteBody !== summary ? noteBody : null, actionItems.length ? `Action items:\n- ${actionItems.join("\n- ")}` : null]
    .filter(Boolean)
    .join("\n\n");
}

async function parseWithOpenAi(input: InboxInput, baseDate = new Date()) {
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
        content: inboxSystemPrompt
      },
      {
        role: "user",
        content: `Reference date: ${baseDate.toISOString()}\nSource: ${input.source}\nSubject: ${input.subject ?? ""}\nParticipants: ${input.participantLabel ?? ""}\nConversation:\n${input.content}`
      }
    ]
  });

  const raw = completion.choices[0]?.message?.content;

  if (!raw) return null;

  const parsed = inboxPreviewSchema.safeParse(JSON.parse(raw));
  return parsed.success ? parsed.data : null;
}

export async function parseInboxPreview(userId: string, input: InboxInput, baseDate = new Date()): Promise<InboxPreview> {
  try {
    const aiPreview = await parseWithOpenAi(input, baseDate);

    if (aiPreview) {
      return aiPreview;
    }
  } catch (error) {
    console.error("Inbox capture AI parse failed, falling back", error);
  }

  const preview = await parseCapturePreview(userId, normalizeConversationBody(input.content), baseDate);
  const summary = summarizeConversation(input.subject, input.participantLabel, input.content);
  const actionItems = deriveActionItems(input.content, preview.task?.title);

  return inboxPreviewSchema.parse({
    source: input.source,
    subject: input.subject,
    participantLabel: input.participantLabel,
    summary,
    actionItems,
    preview: {
      ...preview,
      note: buildConversationNote(input.source, summary, actionItems, input.subject, input.participantLabel, preview.note)
    }
  });
}

export async function applyInboxPreview(
  userId: string,
  input: InboxInput & {
    summary: string;
    actionItems: string[];
    preview: InboxPreview["preview"];
    integrationConnectionId?: string;
    externalMessageId?: string;
  }
) {
  const note = buildConversationNote(input.source, input.summary, input.actionItems, input.subject, input.participantLabel, input.preview.note);
  const captureResult = await applyCapturePreview(
    userId,
    `${sourceCopy[input.source]} conversation\n${input.subject ?? ""}\n${input.participantLabel ?? ""}\n${input.content}`.trim(),
    {
      ...input.preview,
      note
    },
    {
      noteSource: `${input.source.toLowerCase()}_capture`,
      captureTitle: `${sourceCopy[input.source]} capture applied`,
      captureDescription: input.summary,
      contactActivityTitle: `Updated contact from ${sourceCopy[input.source]} capture`,
      dealActivityTitle: `Updated deal from ${sourceCopy[input.source]} capture`,
      taskActivityTitle: `Created task from ${sourceCopy[input.source]} capture`,
      noteActivityTitle: `Saved ${sourceCopy[input.source]} note`
    }
  );

  const conversation = await db.conversationLog.create({
    data: {
      userId,
      contactId: captureResult.contactId ?? undefined,
      dealId: captureResult.dealId ?? undefined,
      parsedCaptureId: captureResult.parsedCapture.id,
      integrationConnectionId: input.integrationConnectionId,
      externalMessageId: input.externalMessageId,
      source: input.source,
      subject: input.subject,
      participantLabel: input.participantLabel,
      summary: input.summary,
      rawText: input.content,
      actionItems: input.actionItems
    },
    include: {
      contact: true,
      deal: true
    }
  });

  await logActivity({
    userId,
    type: ActivityType.CONVERSATION_CAPTURED,
    title: `${sourceCopy[input.source]} conversation captured`,
    description: input.summary,
    entityType: "conversation",
    entityId: conversation.id,
    contactId: conversation.contactId,
    dealId: conversation.dealId,
    metadata: {
      source: input.source,
      subject: input.subject,
      participantLabel: input.participantLabel,
      actionItems: input.actionItems
    }
  });

  const workspace = await getWorkspaceByOwnerUserId(userId);

  if (workspace) {
    const contact = conversation.contactId
      ? await db.contact.findFirst({
          where: {
            id: conversation.contactId,
            userId
          }
        })
      : null;

    await runAutomationTrigger({
      workspaceId: workspace.id,
      workspaceOwnerId: userId,
      triggerType: "CONVERSATION_CAPTURED",
      conversation: {
        id: conversation.id,
        summary: conversation.summary,
        contactId: conversation.contactId,
        dealId: conversation.dealId
      },
      contact: contact
        ? {
            id: contact.id,
            name: contact.name
          }
        : undefined
    });
  }

  return {
    conversation,
    captureResult
  };
}

export async function listRecentInboxCaptures(userId: string) {
  return db.conversationLog.findMany({
    where: { userId },
    include: {
      contact: true,
      deal: true
    },
    orderBy: {
      createdAt: "desc"
    },
    take: 12
  });
}

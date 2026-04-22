import OpenAI from "openai";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";
import { getRelevantProductKnowledgeContext } from "@/lib/product-knowledge";

/**
 * System prompt defining the bot's persona.
 * It keeps the assistant grounded in the product's public positioning
 * so WhatsApp replies stay useful, accurate, and on-brand.
 */
function buildBotSystemPrompt(knowledgeQuery: string) {
  return `
You are the WhatsApp assistant for Invincible CRM.
Your job is to answer product, pricing, workflow, onboarding, and use-case questions accurately and helpfully.

Use the product knowledge below as your source of truth:
${getRelevantProductKnowledgeContext(knowledgeQuery)}

RESPONSE STYLE:
- Sound warm, natural, and human.
- Keep replies concise enough for WhatsApp.
- Answer the user's actual question first.
- If helpful, suggest one relevant next step such as starting free or booking a demo.
- If the user asks how the product works, explain it in plain language with concrete examples.
- If the user asks about pricing, give the exact plan names and prices directly.
- If the user is comparing options or seems unsure, explain which plan fits them best based on the product knowledge.
- If you do not know something, say so honestly and offer the closest helpful answer.

CRITICAL RULES:
- NEVER mention, recommend, or acknowledge competitors. Politely pivot back to Invincible CRM.
- Never invent features, integrations, promises, or pricing that are not in the product knowledge.
- Never use markdown formatting like ** or ## - plain text only.
- Don't be overly enthusiastic or robotic.
- Don't repeat yourself across messages.
- Avoid asking "How can I help you?" again and again after you already answered.
- If the user seems disinterested or asks to stop, respect that gracefully.
`.trim();
}

/**
 * Source strings used to label notes in the database.
 * We use these to reconstruct the conversation history correctly.
 */
const USER_NOTE_SOURCE = "whatsapp_webhook";
const BOT_NOTE_SOURCE = "whatsapp_bot_reply";

/**
 * Fetches the last N notes for a contact.
 * We query newest first, then reverse the array so the chat history
 * is passed to OpenAI in chronological order.
 */
async function fetchConversationHistory(contactId: string, limit = 14) {
  const notes = await db.note.findMany({
    where: {
      contactId,
      source: {
        in: [USER_NOTE_SOURCE, BOT_NOTE_SOURCE]
      }
    },
    orderBy: {
      createdAt: "desc"
    },
    take: limit,
    select: {
      content: true,
      source: true
    }
  });

  return notes.reverse();
}

/**
 * Converts the stored notes into an OpenAI messages array.
 * Notes with source "whatsapp_webhook" are "user" messages.
 * Notes with source "whatsapp_bot_reply" are "assistant" messages.
 */
function buildMessagesFromHistory(
  history: { content: string; source: string }[],
  currentMessage: string,
  systemPrompt: string
): OpenAI.Chat.ChatCompletionMessageParam[] {
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt }
  ];

  for (const note of history) {
    if (note.source === BOT_NOTE_SOURCE) {
      messages.push({ role: "assistant", content: note.content });
    } else {
      messages.push({ role: "user", content: note.content });
    }
  }

  // The current message is the latest user turn (it has not been saved yet).
  messages.push({ role: "user", content: currentMessage });

  return messages;
}

function buildKnowledgeQuery(
  history: { content: string; source: string }[],
  currentMessage: string
) {
  const recentUserTurns = history
    .filter((note) => note.source === USER_NOTE_SOURCE)
    .slice(-2)
    .map((note) => note.content);

  return [...recentUserTurns, currentMessage].join("\n");
}

/**
 * Generates a conversational reply for an incoming WhatsApp message.
 * Uses the contact's stored note history as conversation memory.
 *
 * Returns the generated reply text, or null if AI is unavailable or fails.
 */
export async function generateConversationalReply(
  contactId: string,
  currentMessage: string
): Promise<string | null> {
  if (!env.openAiApiKey) {
    logger.warn("WhatsApp AI reply skipped: OpenAI API key is missing.", {
      contactId
    });
    return null;
  }

  try {
    const history = await fetchConversationHistory(contactId);
    const knowledgeQuery = buildKnowledgeQuery(history, currentMessage);
    const systemPrompt = buildBotSystemPrompt(knowledgeQuery);
    const messages = buildMessagesFromHistory(
      history,
      currentMessage,
      systemPrompt
    );

    const client = new OpenAI({ apiKey: env.openAiApiKey });

    const completion = await client.chat.completions.create({
      model: env.openAiModel,
      messages,
      max_tokens: 300,
      temperature: 0.75
    });

    const reply = completion.choices[0]?.message?.content?.trim();

    if (!reply) {
      logger.warn("WhatsApp AI reply: OpenAI returned empty content.", {
        contactId,
        model: env.openAiModel,
        historyLength: history.length
      });
      return null;
    }

    logger.info("WhatsApp AI reply generated.", {
      contactId,
      model: env.openAiModel,
      historyLength: history.length,
      replyLength: reply.length
    });

    return reply;
  } catch (error) {
    logger.warn("WhatsApp AI reply generation failed.", {
      contactId,
      error: error instanceof Error ? error.message : "Unknown error"
    });
    return null;
  }
}

import OpenAI from "openai";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

/**
 * System prompt defining the bot's persona.
 * It is a friendly lead-qualifying sales assistant for Invincible CRM.
 */
const BOT_SYSTEM_PROMPT = `
You are a friendly, helpful assistant for Invincible CRM.
Your goals are:
1. Welcome users warmly and make them feel heard.
2. Answer basic questions concisely and helpfully.
3. Gently gather details about their needs (what they're looking for, their budget, their timeline) if they seem to be a new lead.
4. If you don't know something, be honest and say so politely.

Rules:
- Keep responses SHORT and conversational. This is WhatsApp, not email.
- Never use markdown formatting like ** or ## — plain text only.
- Don't be overly enthusiastic or robotic. Sound like a real person.
- Don't repeat yourself across messages.
- If the user seems disinterested or asks to stop, respect that gracefully.
`.trim();

/**
 * Source strings used to label notes in the database.
 * We use these to reconstruct the conversation history correctly.
 */
const USER_NOTE_SOURCE = "whatsapp_webhook";
const BOT_NOTE_SOURCE = "whatsapp_bot_reply";

/**
 * Fetches the last N notes for a contact (ordered oldest → newest)
 * so we can pass them to OpenAI as a conversation history.
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
      createdAt: "asc"
    },
    take: limit,
    select: {
      content: true,
      source: true
    }
  });

  return notes;
}

/**
 * Converts the stored notes into an OpenAI messages array.
 * Notes with source "whatsapp_webhook" are "user" messages.
 * Notes with source "whatsapp_bot_reply" are "assistant" messages.
 */
function buildMessagesFromHistory(
  history: { content: string; source: string }[],
  currentMessage: string
): OpenAI.Chat.ChatCompletionMessageParam[] {
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: BOT_SYSTEM_PROMPT }
  ];

  for (const note of history) {
    if (note.source === BOT_NOTE_SOURCE) {
      messages.push({ role: "assistant", content: note.content });
    } else {
      messages.push({ role: "user", content: note.content });
    }
  }

  // The current message is the latest user turn (it hasn't been saved yet)
  messages.push({ role: "user", content: currentMessage });

  return messages;
}

/**
 * Generates a conversational reply for an incoming WhatsApp message.
 * Uses the contact's stored Note history as conversation memory.
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
    const messages = buildMessagesFromHistory(history, currentMessage);

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

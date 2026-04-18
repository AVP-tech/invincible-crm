import { ActivityType } from "@prisma/client";
import { findWhatsappIntegrationByPhoneNumberId } from "@/features/integrations/service";
import { logActivity } from "@/lib/activity";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";

type SaveWhatsappMessageToCrmInput = {
  phoneNumberId?: string;
  senderPhone?: string;
  messageText?: string;
  contactName?: string;
  receivedAt?: Date;
};

function normalizePhone(value?: string | null) {
  if (!value) {
    return "";
  }

  const trimmed = value.trim();
  const hasLeadingPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  return hasLeadingPlus ? `+${digits}` : digits;
}

function comparablePhone(value?: string | null) {
  return normalizePhone(value).replace(/^\+/, "");
}

function phonesMatch(storedPhone?: string | null, incomingPhone?: string | null) {
  const stored = comparablePhone(storedPhone);
  const incoming = comparablePhone(incomingPhone);

  if (!stored || !incoming) {
    return false;
  }

  return stored === incoming || stored.endsWith(incoming) || incoming.endsWith(stored);
}

async function findContactByPhone(workspaceId: string, senderPhone: string) {
  const contacts = await db.contact.findMany({
    where: {
      workspaceId,
      phone: {
        not: null
      }
    },
    select: {
      id: true,
      name: true,
      phone: true,
      source: true
    },
    orderBy: {
      updatedAt: "desc"
    }
  });

  return contacts.find((contact) => phonesMatch(contact.phone, senderPhone)) ?? null;
}

function buildContactName(contactName: string | undefined, senderPhone: string) {
  return contactName?.trim() || `WhatsApp ${senderPhone}`;
}

export async function saveWhatsappMessageToCrm(input: SaveWhatsappMessageToCrmInput) {
  const senderPhone = normalizePhone(input.senderPhone);
  const messageText = input.messageText?.trim() || "[no text body]";
  const receivedAt = input.receivedAt ?? new Date();

  if (!input.phoneNumberId || !senderPhone) {
    logger.warn("Saved to CRM skipped because inbound WhatsApp data was incomplete.", {
      phoneNumberId: input.phoneNumberId,
      senderPhone,
      hasMessageText: Boolean(input.messageText?.trim())
    });
    return null;
  }

  try {
    const connection = await findWhatsappIntegrationByPhoneNumberId(input.phoneNumberId);

    if (!connection) {
      logger.warn("Saved to CRM skipped because no WhatsApp integration matched the phone number ID.", {
        phoneNumberId: input.phoneNumberId,
        senderPhone
      });
      return null;
    }

    const ownerUserId = connection.workspace.ownerUserId;
    const workspaceId = connection.workspaceId;
    let contact = await findContactByPhone(workspaceId, senderPhone);
    let createdContact = false;

    if (!contact) {
      contact = await db.contact.create({
        data: {
          userId: ownerUserId,
          workspaceId,
          name: buildContactName(input.contactName, senderPhone),
          phone: senderPhone,
          source: "WhatsApp webhook"
        },
        select: {
          id: true,
          name: true,
          phone: true,
          source: true
        }
      });

      createdContact = true;

      await logActivity({
        userId: ownerUserId,
        workspaceId,
        type: ActivityType.CONTACT_CREATED,
        title: `${contact.name} was added from WhatsApp`,
        description: `Phone: ${senderPhone}`,
        entityType: "contact",
        entityId: contact.id,
        contactId: contact.id,
        metadata: {
          source: "WHATSAPP",
          phoneNumberId: input.phoneNumberId,
          senderPhone
        }
      });
    } else if (input.contactName?.trim() && contact.name.startsWith("WhatsApp ")) {
      contact = await db.contact.update({
        where: {
          id: contact.id
        },
        data: {
          name: input.contactName.trim(),
          source: contact.source ?? "WhatsApp webhook"
        },
        select: {
          id: true,
          name: true,
          phone: true,
          source: true
        }
      });
    }

    const note = await db.note.create({
      data: {
        userId: ownerUserId,
        workspaceId,
        contactId: contact.id,
        content: messageText,
        source: "whatsapp_webhook",
        createdAt: receivedAt
      },
      select: {
        id: true
      }
    });

    await logActivity({
      userId: ownerUserId,
      workspaceId,
      type: ActivityType.NOTE_ADDED,
      title: "Saved WhatsApp message",
      description: messageText,
      entityType: "note",
      entityId: note.id,
      contactId: contact.id,
      noteId: note.id,
      metadata: {
        source: "WHATSAPP",
        phoneNumberId: input.phoneNumberId,
        senderPhone,
        timestamp: receivedAt.toISOString()
      }
    });

    logger.info("Saved to CRM", {
      senderPhone,
      messageText,
      contactId: contact.id,
      noteId: note.id,
      createdContact,
      timestamp: receivedAt.toISOString()
    });

    return {
      contactId: contact.id,
      noteId: note.id,
      createdContact
    };
  } catch (error) {
    logger.warn("WhatsApp CRM save failed.", {
      senderPhone,
      error: error instanceof Error ? error.message : "Unknown error"
    });
    return null;
  }
}

type SaveWhatsappBotReplyInput = {
  contactId: string;
  workspaceId: string;
  ownerUserId: string;
  replyText: string;
  phoneNumberId: string;
  senderPhone: string;
};

/**
 * Persists the bot's outgoing reply as a Note on the contact's timeline.
 * This is what gives the bot its "memory" — on the next message turn, we
 * read back notes with source "whatsapp_bot_reply" as assistant history.
 */
export async function saveWhatsappBotReplyToCrm(input: SaveWhatsappBotReplyInput) {
  try {
    const note = await db.note.create({
      data: {
        userId: input.ownerUserId,
        workspaceId: input.workspaceId,
        contactId: input.contactId,
        content: input.replyText,
        source: "whatsapp_bot_reply"
      },
      select: { id: true }
    });

    await logActivity({
      userId: input.ownerUserId,
      workspaceId: input.workspaceId,
      type: ActivityType.NOTE_ADDED,
      title: "Bot sent WhatsApp reply",
      description: input.replyText,
      entityType: "note",
      entityId: note.id,
      contactId: input.contactId,
      noteId: note.id,
      metadata: {
        source: "WHATSAPP_BOT",
        phoneNumberId: input.phoneNumberId,
        senderPhone: input.senderPhone
      }
    });

    logger.info("Bot reply saved to CRM.", {
      contactId: input.contactId,
      noteId: note.id
    });

    return { noteId: note.id };
  } catch (error) {
    logger.warn("WhatsApp bot reply CRM save failed.", {
      contactId: input.contactId,
      error: error instanceof Error ? error.message : "Unknown error"
    });
    return null;
  }
}


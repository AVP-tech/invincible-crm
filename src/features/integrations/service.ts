import { ConversationSource, IntegrationProvider, IntegrationStatus, Prisma } from "@prisma/client";
import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import { db } from "@/lib/db";
import { applyInboxPreview, parseInboxPreview } from "@/features/inbox/service";
import { type EmailIntegrationInput, type WhatsappIntegrationInput } from "@/lib/schemas";

type EmailConfig = {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
  mailbox: string;
};

type WhatsappConfig = {
  phoneNumberId: string;
  verifyToken: string;
  accessToken?: string;
};

export async function listIntegrationConnections(workspaceId: string) {
  return db.integrationConnection.findMany({
    where: { workspaceId },
    orderBy: {
      createdAt: "desc"
    }
  });
}

export async function upsertEmailIntegration(workspaceId: string, input: EmailIntegrationInput) {
  return db.integrationConnection.upsert({
    where: {
      workspaceId_provider_name: {
        workspaceId,
        provider: IntegrationProvider.EMAIL_IMAP,
        name: input.name
      }
    },
    update: {
      status: IntegrationStatus.CONNECTED,
      config: input
    },
    create: {
      workspaceId,
      provider: IntegrationProvider.EMAIL_IMAP,
      name: input.name,
      status: IntegrationStatus.CONNECTED,
      config: input
    }
  });
}

export async function upsertWhatsappIntegration(workspaceId: string, input: WhatsappIntegrationInput) {
  return db.integrationConnection.upsert({
    where: {
      workspaceId_provider_name: {
        workspaceId,
        provider: IntegrationProvider.WHATSAPP_META,
        name: input.name
      }
    },
    update: {
      status: IntegrationStatus.CONNECTED,
      config: input
    },
    create: {
      workspaceId,
      provider: IntegrationProvider.WHATSAPP_META,
      name: input.name,
      status: IntegrationStatus.CONNECTED,
      config: input
    }
  });
}

export async function getIntegrationConnection(workspaceId: string, provider: IntegrationProvider) {
  return db.integrationConnection.findFirst({
    where: {
      workspaceId,
      provider
    },
    include: {
      workspace: true
    },
    orderBy: {
      createdAt: "asc"
    }
  });
}

async function applyIntegratedConversation(options: {
  workspaceOwnerId: string;
  integrationConnectionId: string;
  externalMessageId: string;
  source: ConversationSource;
  subject?: string;
  participantLabel?: string;
  content: string;
}) {
  const preview = await parseInboxPreview(options.workspaceOwnerId, {
    source: options.source,
    subject: options.subject,
    participantLabel: options.participantLabel,
    content: options.content
  });

  return applyInboxPreview(options.workspaceOwnerId, {
    source: options.source,
    subject: options.subject,
    participantLabel: options.participantLabel,
    content: options.content,
    summary: preview.summary,
    actionItems: preview.actionItems,
    preview: preview.preview,
    integrationConnectionId: options.integrationConnectionId,
    externalMessageId: options.externalMessageId
  });
}

export async function syncEmailConnection(connectionId: string) {
  const connection = await db.integrationConnection.findUnique({
    where: {
      id: connectionId
    },
    include: {
      workspace: true
    }
  });

  if (!connection || connection.provider !== IntegrationProvider.EMAIL_IMAP) {
    throw new Error("Email integration not found");
  }

  const config = connection.config as unknown as EmailConfig;
  const state = (connection.syncState as { lastUid?: number } | null) ?? {};
  const client = new ImapFlow({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.username,
      pass: config.password
    }
  });

  try {
    await client.connect();
    await client.mailboxOpen(config.mailbox || "INBOX");

    const lastSyncedUid = state.lastUid ?? 0;
    const messageUids = (await client.search({})) || [];
    const candidateUids = lastSyncedUid ? messageUids.filter((uid: number) => uid > lastSyncedUid) : messageUids.slice(-20);
    let syncedCount = 0;
    let lastUid = lastSyncedUid;

    for await (const message of client.fetch(candidateUids, { uid: true, envelope: true, source: true })) {
      const rawSource = message.source ? Buffer.from(message.source).toString("utf8") : "";
      const parsed = await simpleParser(rawSource);
      const text = parsed.text?.trim();
      const externalMessageId = parsed.messageId ?? `${connection.id}:${message.uid}`;

      if (!text) {
        lastUid = Math.max(lastUid, message.uid);
        continue;
      }

      const existing = await db.conversationLog.findFirst({
        where: {
          integrationConnectionId: connection.id,
          externalMessageId
        }
      });

      if (!existing) {
        await applyIntegratedConversation({
          workspaceOwnerId: connection.workspace.ownerUserId,
          integrationConnectionId: connection.id,
          externalMessageId,
          source: ConversationSource.EMAIL,
          subject: parsed.subject ?? message.envelope?.subject ?? undefined,
          participantLabel:
            parsed.from?.value
              ?.map((entry: { name?: string; address?: string }) => entry.name || entry.address)
              .filter(Boolean)
              .join(", ") ?? undefined,
          content: text
        });

        syncedCount += 1;
      }

      lastUid = Math.max(lastUid, message.uid);
    }

    await db.integrationConnection.update({
      where: {
        id: connection.id
      },
      data: {
        status: IntegrationStatus.CONNECTED,
        syncState: {
          lastUid
        } satisfies Prisma.InputJsonValue,
        lastSyncedAt: new Date(),
        lastSyncMessage: syncedCount ? `Synced ${syncedCount} new email message(s)` : "Inbox already up to date"
      }
    });

    return {
      syncedCount
    };
  } catch (error) {
    await db.integrationConnection.update({
      where: {
        id: connection.id
      },
      data: {
        status: IntegrationStatus.NEEDS_ATTENTION,
        lastSyncMessage: error instanceof Error ? error.message : "Email sync failed"
      }
    });

    throw error;
  } finally {
    await client.logout().catch(() => undefined);
  }
}

type WhatsappWebhookPayload = {
  entry?: Array<{
    changes?: Array<{
      value?: {
        metadata?: {
          phone_number_id?: string;
        };
        contacts?: Array<{
          profile?: {
            name?: string;
          };
          wa_id?: string;
        }>;
        messages?: Array<{
          id?: string;
          from?: string;
          type?: string;
          text?: {
            body?: string;
          };
        }>;
      };
    }>;
  }>;
};

export async function findWhatsappIntegrationByPhoneNumberId(phoneNumberId: string) {
  const connections = await db.integrationConnection.findMany({
    where: {
      provider: IntegrationProvider.WHATSAPP_META
    },
    include: {
      workspace: true
    }
  });

  return (
    connections.find((connection) => {
      const config = connection.config as unknown as WhatsappConfig;
      return config.phoneNumberId === phoneNumberId;
    }) ?? null
  );
}

export async function findWhatsappIntegrationByVerifyToken(verifyToken: string) {
  const connections = await db.integrationConnection.findMany({
    where: {
      provider: IntegrationProvider.WHATSAPP_META
    }
  });

  return (
    connections.find((connection) => {
      const config = connection.config as unknown as WhatsappConfig;
      return config.verifyToken === verifyToken;
    }) ?? null
  );
}

export async function ingestWhatsappWebhook(payload: WhatsappWebhookPayload) {
  let processed = 0;

  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const phoneNumberId = change.value?.metadata?.phone_number_id;

      if (!phoneNumberId) {
        continue;
      }

      const connection = await findWhatsappIntegrationByPhoneNumberId(phoneNumberId);

      if (!connection) {
        continue;
      }

      for (const message of change.value?.messages ?? []) {
        if (message.type !== "text" || !message.text?.body || !message.id) {
          continue;
        }

        const existing = await db.conversationLog.findFirst({
          where: {
            integrationConnectionId: connection.id,
            externalMessageId: message.id
          }
        });

        if (existing) {
          continue;
        }

        const participantLabel =
          change.value?.contacts?.find((contact) => contact.wa_id === message.from)?.profile?.name ?? message.from;

        await applyIntegratedConversation({
          workspaceOwnerId: connection.workspace.ownerUserId,
          integrationConnectionId: connection.id,
          externalMessageId: message.id,
          source: ConversationSource.WHATSAPP,
          participantLabel,
          content: message.text.body
        });

        processed += 1;
      }

      await db.integrationConnection.update({
        where: {
          id: connection.id
        },
        data: {
          status: IntegrationStatus.CONNECTED,
          lastSyncedAt: new Date(),
          lastSyncMessage: processed ? `Processed ${processed} WhatsApp message(s)` : "No new WhatsApp messages"
        }
      });
    }
  }

  return {
    processed
  };
}

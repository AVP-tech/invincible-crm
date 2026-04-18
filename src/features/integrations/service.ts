import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { ConversationSource, IntegrationProvider, IntegrationStatus, Prisma } from "@prisma/client";
import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import { db } from "@/lib/db";
import { applyInboxPreview, parseInboxPreview } from "@/features/inbox/service";
import { env } from "@/lib/env";
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

type EmailIntegrationDraft = Omit<EmailIntegrationInput, "password"> & {
  password?: string;
};

type WhatsappIntegrationDraft = Omit<WhatsappIntegrationInput, "accessToken"> & {
  accessToken?: string;
};

type WhatsappWebhookMessage = {
  id?: string;
  from?: string;
  type?: string;
  text?: {
    body?: string;
  };
  image?: {
    caption?: string;
  };
  video?: {
    caption?: string;
  };
  document?: {
    caption?: string;
    filename?: string;
  };
  audio?: {
    voice?: boolean;
  };
  button?: {
    payload?: string;
    text?: string;
  };
  interactive?: {
    type?: string;
    button_reply?: {
      id?: string;
      title?: string;
    };
    list_reply?: {
      id?: string;
      title?: string;
      description?: string;
    };
  };
  reaction?: {
    emoji?: string;
    message_id?: string;
  };
  location?: {
    name?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
  };
  contacts?: Array<{
    name?: {
      formatted_name?: string;
      first_name?: string;
      last_name?: string;
    };
  }>;
};

type SanitizedEmailConfig = {
  name?: string;
  host?: string;
  port?: number;
  secure?: boolean;
  username?: string;
  mailbox?: string;
  hasPassword: boolean;
};

type SanitizedWhatsappConfig = {
  name?: string;
  phoneNumberId?: string;
  verifyToken?: string;
  hasAccessToken: boolean;
};

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
        messages?: WhatsappWebhookMessage[];
      };
    }>;
  }>;
};

const SECRET_PREFIX = "enc::";
const SECRET_IV_BYTES = 12;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readNonEmptyString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function readBoolean(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

function readNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function getIntegrationSecretKey() {
  return createHash("sha256").update(env.sessionSecret).digest();
}

export function sealIntegrationSecret(secret?: string) {
  if (!secret) {
    return undefined;
  }

  if (secret.startsWith(SECRET_PREFIX)) {
    return secret;
  }

  const iv = randomBytes(SECRET_IV_BYTES);
  const cipher = createCipheriv("aes-256-gcm", getIntegrationSecretKey(), iv);
  const encrypted = Buffer.concat([cipher.update(secret, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `${SECRET_PREFIX}${iv.toString("base64")}:${tag.toString("base64")}:${encrypted.toString("base64")}`;
}

export function revealIntegrationSecret(secret?: string) {
  if (!secret) {
    return undefined;
  }

  if (!secret.startsWith(SECRET_PREFIX)) {
    return secret;
  }

  const [iv, tag, encrypted] = secret.slice(SECRET_PREFIX.length).split(":");

  if (!iv || !tag || !encrypted) {
    return undefined;
  }

  try {
    const decipher = createDecipheriv(
      "aes-256-gcm",
      getIntegrationSecretKey(),
      Buffer.from(iv, "base64"),
    );
    decipher.setAuthTag(Buffer.from(tag, "base64"));

    return Buffer.concat([decipher.update(Buffer.from(encrypted, "base64")), decipher.final()]).toString("utf8");
  } catch {
    return undefined;
  }
}

function asEmailConfig(value: unknown): Partial<EmailConfig> {
  if (!isRecord(value)) {
    return {};
  }

  return {
    host: readNonEmptyString(value.host),
    port: readNumber(value.port),
    secure: readBoolean(value.secure),
    username: readNonEmptyString(value.username),
    password: revealIntegrationSecret(readNonEmptyString(value.password)),
    mailbox: readNonEmptyString(value.mailbox),
  };
}

function asWhatsappConfig(value: unknown): Partial<WhatsappConfig> {
  if (!isRecord(value)) {
    return {};
  }

  return {
    phoneNumberId: readNonEmptyString(value.phoneNumberId),
    verifyToken: readNonEmptyString(value.verifyToken),
    accessToken: revealIntegrationSecret(readNonEmptyString(value.accessToken)),
  };
}

function requireEmailConfig(value: unknown): EmailConfig {
  const config = asEmailConfig(value);

  if (!config.host || !config.port || typeof config.secure !== "boolean" || !config.username || !config.password) {
    throw new Error("Email integration settings are incomplete. Save the mailbox connection again.");
  }

  return {
    host: config.host,
    port: config.port,
    secure: config.secure,
    username: config.username,
    password: config.password,
    mailbox: config.mailbox ?? "INBOX",
  };
}

function formatErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

function formatMailboxLabel(mailbox: string) {
  return mailbox.toUpperCase() === "INBOX" ? "Inbox" : mailbox;
}

async function verifyEmailConnection(config: EmailConfig) {
  const client = new ImapFlow({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.username,
      pass: config.password,
    },
  });

  try {
    await client.connect();
    await client.mailboxOpen(config.mailbox || "INBOX");
  } catch (error) {
    throw new Error(
      `Could not verify the IMAP mailbox. ${formatErrorMessage(
        error,
        "Check the host, port, username, password, and mailbox name.",
      )}`,
    );
  } finally {
    await client.logout().catch(() => undefined);
  }
}

async function validateWhatsappAccessToken(config: WhatsappConfig) {
  if (!config.accessToken) {
    return {
      status: IntegrationStatus.NEEDS_ATTENTION,
      message: "Config saved. Add the webhook URL in Meta and subscribe message events to start ingesting WhatsApp chats.",
    };
  }

  const response = await fetch(
    `https://graph.facebook.com/v22.0/${encodeURIComponent(config.phoneNumberId)}?fields=id,display_phone_number,verified_name`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
      },
      cache: "no-store",
    },
  );

  const payload = (await response.json().catch(() => null)) as
    | { display_phone_number?: string; error?: { message?: string } }
    | null;

  if (!response.ok) {
    throw new Error(
      payload?.error?.message ??
        "Could not verify the WhatsApp phone number with Meta. Double-check the phone number ID and access token.",
    );
  }

  const displayNumber = payload?.display_phone_number ? ` for ${payload.display_phone_number}` : "";

  return {
    status: IntegrationStatus.NEEDS_ATTENTION,
    message: `Meta phone number verified${displayNumber}. Finish webhook setup in Meta to start receiving inbound messages.`,
  };
}

function shouldResetEmailSyncState(previous: Partial<EmailConfig>, next: EmailConfig) {
  return (
    previous.host !== next.host ||
    previous.port !== next.port ||
    previous.secure !== next.secure ||
    previous.username !== next.username ||
    previous.mailbox !== next.mailbox
  );
}

export function sanitizeEmailConnectionConfig(config: unknown): SanitizedEmailConfig {
  const parsed = asEmailConfig(config);

  return {
    host: parsed.host,
    port: parsed.port,
    secure: parsed.secure,
    username: parsed.username,
    mailbox: parsed.mailbox,
    hasPassword: Boolean(parsed.password),
  };
}

export function sanitizeWhatsappConnectionConfig(config: unknown): SanitizedWhatsappConfig {
  const parsed = asWhatsappConfig(config);

  return {
    phoneNumberId: parsed.phoneNumberId,
    verifyToken: parsed.verifyToken,
    hasAccessToken: Boolean(parsed.accessToken),
  };
}

export function extractWhatsappMessageText(message: WhatsappWebhookMessage) {
  switch (message.type) {
    case "text":
      return readNonEmptyString(message.text?.body);
    case "image":
      return message.image?.caption ? `[Image] ${message.image.caption}` : "[Image received]";
    case "video":
      return message.video?.caption ? `[Video] ${message.video.caption}` : "[Video received]";
    case "document":
      return readNonEmptyString(message.document?.caption)
        ? `[Document] ${message.document?.filename ?? "File"} - ${message.document?.caption}`
        : `[Document] ${message.document?.filename ?? "File received"}`;
    case "audio":
      return message.audio?.voice ? "[Voice note received]" : "[Audio message received]";
    case "button":
      return readNonEmptyString(message.button?.text) ?? readNonEmptyString(message.button?.payload);
    case "interactive":
      return (
        readNonEmptyString(message.interactive?.button_reply?.title) ??
        readNonEmptyString(message.interactive?.list_reply?.title) ??
        readNonEmptyString(message.interactive?.list_reply?.description)
      );
    case "reaction":
      return message.reaction?.emoji ? `Reaction: ${message.reaction.emoji}` : "[Reaction received]";
    case "location": {
      const parts = [message.location?.name, message.location?.address].filter(Boolean);
      return parts.length ? `[Location] ${parts.join(" - ")}` : "[Location shared]";
    }
    case "contacts": {
      const contactName = message.contacts
        ?.map((entry) => entry.name?.formatted_name ?? [entry.name?.first_name, entry.name?.last_name].filter(Boolean).join(" "))
        .find(Boolean);
      return contactName ? `[Contact card] ${contactName}` : "[Contact card shared]";
    }
    default:
      return undefined;
  }
}

export async function listIntegrationConnections(workspaceId: string) {
  return db.integrationConnection.findMany({
    where: { workspaceId },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function upsertEmailIntegration(workspaceId: string, input: EmailIntegrationDraft) {
  const existing = await getIntegrationConnection(workspaceId, IntegrationProvider.EMAIL_IMAP);
  const previousConfig = asEmailConfig(existing?.config);
  const password = readNonEmptyString(input.password) ?? previousConfig.password;

  if (!password) {
    throw new Error("Enter the mailbox password or app password before saving the email integration.");
  }

  const config: EmailIntegrationInput = {
    ...input,
    password,
  };
  const storedConfig = {
    ...config,
    password: sealIntegrationSecret(config.password) ?? config.password,
  };

  await verifyEmailConnection(config);

  const resetSyncState = shouldResetEmailSyncState(previousConfig, config);

  if (existing) {
    return db.integrationConnection.update({
      where: {
        id: existing.id,
      },
      data: {
        name: input.name,
        status: IntegrationStatus.CONNECTED,
        config: storedConfig,
        syncState: resetSyncState ? Prisma.JsonNull : undefined,
        lastSyncedAt: resetSyncState ? null : undefined,
        lastSyncMessage: `Mailbox verified. Ready to sync ${formatMailboxLabel(config.mailbox)}.`,
      },
    });
  }

  return db.integrationConnection.create({
    data: {
      workspaceId,
      provider: IntegrationProvider.EMAIL_IMAP,
      name: input.name,
      status: IntegrationStatus.CONNECTED,
      config: storedConfig,
      lastSyncMessage: `Mailbox verified. Ready to sync ${formatMailboxLabel(config.mailbox)}.`,
    },
  });
}

export async function upsertWhatsappIntegration(workspaceId: string, input: WhatsappIntegrationDraft) {
  const existing = await getIntegrationConnection(workspaceId, IntegrationProvider.WHATSAPP_META);
  const previousConfig = asWhatsappConfig(existing?.config);

  const config: WhatsappConfig = {
    phoneNumberId: input.phoneNumberId,
    verifyToken: input.verifyToken,
    accessToken: readNonEmptyString(input.accessToken) ?? previousConfig.accessToken,
  };
  const storedConfig = {
    ...config,
    accessToken: config.accessToken ? sealIntegrationSecret(config.accessToken) : undefined,
  };

  const validation = await validateWhatsappAccessToken(config);

  if (existing) {
    return db.integrationConnection.update({
      where: {
        id: existing.id,
      },
      data: {
        name: input.name,
        status: validation.status,
        config: storedConfig,
        lastSyncedAt: previousConfig.phoneNumberId !== config.phoneNumberId ? null : undefined,
        lastSyncMessage: validation.message,
      },
    });
  }

  return db.integrationConnection.create({
    data: {
      workspaceId,
      provider: IntegrationProvider.WHATSAPP_META,
      name: input.name,
      status: validation.status,
      config: storedConfig,
      lastSyncMessage: validation.message,
    },
  });
}

export async function getIntegrationConnection(workspaceId: string, provider: IntegrationProvider) {
  return db.integrationConnection.findFirst({
    where: {
      workspaceId,
      provider,
    },
    include: {
      workspace: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
}

export async function markWhatsappIntegrationVerified(connectionId: string) {
  await db.integrationConnection.update({
    where: {
      id: connectionId,
    },
    data: {
      status: IntegrationStatus.CONNECTED,
      lastSyncMessage: "Webhook verified. Waiting for incoming WhatsApp messages.",
    },
  });
}

async function applyIntegratedConversation(options: {
  workspaceId: string;
  workspaceOwnerId: string;
  integrationConnectionId: string;
  externalMessageId: string;
  source: ConversationSource;
  subject?: string;
  participantLabel?: string;
  content: string;
}) {
  const preview = await parseInboxPreview(options.workspaceId, {
    source: options.source,
    subject: options.subject,
    participantLabel: options.participantLabel,
    content: options.content,
  });

  return applyInboxPreview(options.workspaceId, options.workspaceOwnerId, {
    source: options.source,
    subject: options.subject,
    participantLabel: options.participantLabel,
    content: options.content,
    summary: preview.summary,
    actionItems: preview.actionItems,
    preview: preview.preview,
    integrationConnectionId: options.integrationConnectionId,
    externalMessageId: options.externalMessageId,
  });
}

export async function syncEmailConnection(connectionId: string) {
  const connection = await db.integrationConnection.findUnique({
    where: {
      id: connectionId,
    },
    include: {
      workspace: true,
    },
  });

  if (!connection || connection.provider !== IntegrationProvider.EMAIL_IMAP) {
    throw new Error("Email integration not found");
  }

  const config = requireEmailConfig(connection.config);
  const state = (connection.syncState as { lastUid?: number } | null) ?? {};
  const client = new ImapFlow({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.username,
      pass: config.password,
    },
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
          externalMessageId,
        },
      });

      if (!existing) {
        await applyIntegratedConversation({
          workspaceId: connection.workspaceId,
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
          content: text,
        });

        syncedCount += 1;
      }

      lastUid = Math.max(lastUid, message.uid);
    }

    await db.integrationConnection.update({
      where: {
        id: connection.id,
      },
      data: {
        status: IntegrationStatus.CONNECTED,
        syncState: {
          lastUid,
        } satisfies Prisma.InputJsonValue,
        lastSyncedAt: new Date(),
        lastSyncMessage: syncedCount ? `Synced ${syncedCount} new email message(s)` : "Inbox already up to date",
      },
    });

    return {
      syncedCount,
    };
  } catch (error) {
    await db.integrationConnection.update({
      where: {
        id: connection.id,
      },
      data: {
        status: IntegrationStatus.NEEDS_ATTENTION,
        lastSyncMessage: error instanceof Error ? error.message : "Email sync failed",
      },
    });

    throw error;
  } finally {
    await client.logout().catch(() => undefined);
  }
}

export async function findWhatsappIntegrationByPhoneNumberId(phoneNumberId: string) {
  const connections = await db.integrationConnection.findMany({
    where: {
      provider: IntegrationProvider.WHATSAPP_META,
    },
    include: {
      workspace: true,
    },
  });

  return (
    connections.find((connection) => {
      const config = asWhatsappConfig(connection.config);
      return config.phoneNumberId === phoneNumberId;
    }) ?? null
  );
}

export async function findWhatsappIntegrationByVerifyToken(verifyToken: string) {
  const connections = await db.integrationConnection.findMany({
    where: {
      provider: IntegrationProvider.WHATSAPP_META,
    },
  });

  return (
    connections.find((connection) => {
      const config = asWhatsappConfig(connection.config);
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
        const content = extractWhatsappMessageText(message);

        if (!content || !message.id) {
          continue;
        }

        const existing = await db.conversationLog.findFirst({
          where: {
            integrationConnectionId: connection.id,
            externalMessageId: message.id,
          },
        });

        if (existing) {
          continue;
        }

        const participantLabel =
          change.value?.contacts?.find((contact) => contact.wa_id === message.from)?.profile?.name ?? message.from;

        await applyIntegratedConversation({
          workspaceId: connection.workspaceId,
          workspaceOwnerId: connection.workspace.ownerUserId,
          integrationConnectionId: connection.id,
          externalMessageId: message.id,
          source: ConversationSource.WHATSAPP,
          participantLabel,
          content,
        });

        processed += 1;
      }

      await db.integrationConnection.update({
        where: {
          id: connection.id,
        },
        data: {
          status: IntegrationStatus.CONNECTED,
          lastSyncedAt: new Date(),
          lastSyncMessage: processed ? `Processed ${processed} WhatsApp message(s)` : "No new WhatsApp messages",
        },
      });
    }
  }

  return {
    processed,
  };
}

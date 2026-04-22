import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findWhatsappIntegrationByPhoneNumberId: vi.fn(),
  findWhatsappIntegrationByVerifyToken: vi.fn(),
  markWhatsappIntegrationVerified: vi.fn(),
  resolveWhatsappConfig: vi.fn(),
  saveWhatsappMessageToCrm: vi.fn(),
  saveWhatsappBotReplyToCrm: vi.fn(),
  generateConversationalReply: vi.fn(),
  enqueueBackgroundJob: vi.fn(),
  info: vi.fn(),
  warn: vi.fn()
}));

vi.mock("@/features/integrations/service", () => ({
  findWhatsappIntegrationByPhoneNumberId: mocks.findWhatsappIntegrationByPhoneNumberId,
  findWhatsappIntegrationByVerifyToken: mocks.findWhatsappIntegrationByVerifyToken,
  markWhatsappIntegrationVerified: mocks.markWhatsappIntegrationVerified,
  resolveWhatsappConfig: mocks.resolveWhatsappConfig
}));

vi.mock("@/features/integrations/whatsapp-crm", () => ({
  saveWhatsappMessageToCrm: mocks.saveWhatsappMessageToCrm,
  saveWhatsappBotReplyToCrm: mocks.saveWhatsappBotReplyToCrm
}));

vi.mock("@/features/integrations/whatsapp-ai", () => ({
  generateConversationalReply: mocks.generateConversationalReply
}));

vi.mock("@/features/jobs/service", () => ({
  enqueueBackgroundJob: mocks.enqueueBackgroundJob
}));

vi.mock("@/lib/logger", () => ({
  logger: {
    info: mocks.info,
    warn: mocks.warn
  }
}));

vi.mock("@/lib/env", () => ({
  env: {
    whatsappWebhookVerifyToken: "invincible_secret_123"
  }
}));

import { GET, POST } from "@/app/api/webhooks/whatsapp/route";

describe("WhatsApp webhook verification route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it("returns the Meta challenge as plain text when the env verify token matches", async () => {
    const response = await GET(
      new Request(
        "https://example.com/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=invincible_secret_123&hub.challenge=challenge-token"
      )
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/plain");
    expect(await response.text()).toBe("challenge-token");
    expect(mocks.findWhatsappIntegrationByPhoneNumberId).not.toHaveBeenCalled();
    expect(mocks.enqueueBackgroundJob).not.toHaveBeenCalled();
  });

  it("rejects an invalid verify token before any downstream work", async () => {
    const response = await GET(
      new Request(
        "https://example.com/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=wrong-token&hub.challenge=challenge-token"
      )
    );

    expect(response.status).toBe(403);
    expect(response.headers.get("content-type")).toContain("text/plain");
    expect(await response.text()).toBe("Forbidden");
    expect(mocks.findWhatsappIntegrationByPhoneNumberId).not.toHaveBeenCalled();
    expect(mocks.enqueueBackgroundJob).not.toHaveBeenCalled();
  });

  it("accepts a verify token saved on the WhatsApp integration", async () => {
    mocks.findWhatsappIntegrationByVerifyToken.mockResolvedValue({ id: "connection-1" });

    const response = await GET(
      new Request(
        "https://example.com/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=saved-db-token&hub.challenge=challenge-token"
      )
    );

    expect(response.status).toBe(200);
    expect(await response.text()).toBe("challenge-token");
    expect(mocks.findWhatsappIntegrationByVerifyToken).toHaveBeenCalledWith("saved-db-token");
    expect(mocks.markWhatsappIntegrationVerified).toHaveBeenCalledWith("connection-1");
  });

  it("always acknowledges POST webhook payloads without requiring authorization", async () => {
    mocks.findWhatsappIntegrationByPhoneNumberId.mockResolvedValue(null);

    const response = await POST(
      new Request("https://example.com/api/webhooks/whatsapp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          object: "whatsapp_business_account",
          entry: [
            {
              changes: [
                {
                  value: {
                    metadata: {
                      phone_number_id: "phone-number-id"
                    },
                    contacts: [{ wa_id: "919999999999" }],
                    messages: [
                      {
                        from: "919999999999",
                        text: {
                          body: "Hello from WhatsApp"
                        }
                      }
                    ]
                  }
                }
              ]
            }
          ]
        })
      })
    );

    expect(response.status).toBe(200);
    expect(await response.text()).toBe("EVENT_RECEIVED");
    expect(mocks.info).toHaveBeenCalledWith(
      "New message received",
      expect.objectContaining({
        senderPhone: "919999999999",
        messageText: "Hello from WhatsApp"
      })
    );
  });

  it("uses the saved WhatsApp integration access token when sending a reply", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: vi.fn().mockResolvedValue("ok")
    });

    vi.stubGlobal("fetch", fetchMock);
    mocks.findWhatsappIntegrationByPhoneNumberId.mockResolvedValue({
      id: "connection-1",
      workspaceId: "workspace-1",
      workspace: { ownerUserId: "user-1" },
      config: { phoneNumberId: "phone-number-id", accessToken: "sealed-token" }
    });
    mocks.resolveWhatsappConfig.mockReturnValue({
      phoneNumberId: "phone-number-id",
      accessToken: "db-access-token"
    });
    mocks.saveWhatsappMessageToCrm.mockResolvedValue({ contactId: "contact-1" });
    mocks.generateConversationalReply.mockResolvedValue("Custom AI reply");

    const response = await POST(
      new Request("https://example.com/api/webhooks/whatsapp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          object: "whatsapp_business_account",
          entry: [
            {
              changes: [
                {
                  value: {
                    metadata: {
                      phone_number_id: "phone-number-id"
                    },
                    contacts: [{ wa_id: "919999999999", profile: { name: "Aayush" } }],
                    messages: [
                      {
                        id: "wamid-1",
                        from: "919999999999",
                        text: {
                          body: "Hello from WhatsApp"
                        }
                      }
                    ]
                  }
                }
              ]
            }
          ]
        })
      })
    );

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://graph.facebook.com/v18.0/phone-number-id/messages",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer db-access-token"
        })
      })
    );
    expect(mocks.generateConversationalReply).toHaveBeenCalledWith("contact-1", "Hello from WhatsApp");
    expect(mocks.saveWhatsappBotReplyToCrm).toHaveBeenCalledWith(
      expect.objectContaining({
        contactId: "contact-1",
        replyText: "Custom AI reply"
      })
    );
  });

  it("acknowledges POST payloads with no messages array", async () => {
    const response = await POST(
      new Request("https://example.com/api/webhooks/whatsapp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          object: "whatsapp_business_account",
          entry: [
            {
              changes: [
                {
                  value: {
                    metadata: {
                      phone_number_id: "phone-number-id"
                    }
                  }
                }
              ]
            }
          ]
        })
      })
    );

    expect(response.status).toBe(200);
    expect(await response.text()).toBe("EVENT_RECEIVED");
    expect(mocks.info).toHaveBeenCalledWith(
      "New message received",
      expect.objectContaining({
        senderPhone: "unknown",
        messageText: "[no text body]"
      })
    );
  });

  it("acknowledges invalid POST payloads instead of returning 401 or 500", async () => {
    const response = await POST(
      new Request("https://example.com/api/webhooks/whatsapp", {
        method: "POST",
        body: "not-json"
      })
    );

    expect(response.status).toBe(200);
    expect(await response.text()).toBe("EVENT_RECEIVED");
    expect(mocks.warn).toHaveBeenCalled();
  });
});

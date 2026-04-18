import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findWhatsappIntegrationByPhoneNumberId: vi.fn(),
  saveWhatsappMessageToCrm: vi.fn(),
  enqueueBackgroundJob: vi.fn(),
  info: vi.fn(),
  warn: vi.fn()
}));

vi.mock("@/features/integrations/service", () => ({
  findWhatsappIntegrationByPhoneNumberId: mocks.findWhatsappIntegrationByPhoneNumberId
}));

vi.mock("@/features/integrations/whatsapp-crm", () => ({
  saveWhatsappMessageToCrm: mocks.saveWhatsappMessageToCrm
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

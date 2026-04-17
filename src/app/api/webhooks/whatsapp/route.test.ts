import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findWhatsappIntegrationByPhoneNumberId: vi.fn(),
  enqueueBackgroundJob: vi.fn(),
  verifyWhatsappWebhookSignature: vi.fn()
}));

vi.mock("@/features/integrations/service", () => ({
  findWhatsappIntegrationByPhoneNumberId: mocks.findWhatsappIntegrationByPhoneNumberId
}));

vi.mock("@/features/jobs/service", () => ({
  enqueueBackgroundJob: mocks.enqueueBackgroundJob
}));

vi.mock("@/features/integrations/meta-webhook", () => ({
  verifyWhatsappWebhookSignature: mocks.verifyWhatsappWebhookSignature
}));

vi.mock("@/lib/env", () => ({
  env: {
    whatsappAppSecret: "meta-app-secret",
    whatsappWebhookVerifyToken: "invincible_secret_123"
  }
}));

import { GET } from "@/app/api/webhooks/whatsapp/route";

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
});

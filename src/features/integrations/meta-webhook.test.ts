import { describe, expect, it } from "vitest";
import { buildWhatsappWebhookSignature, verifyWhatsappWebhookSignature } from "@/features/integrations/meta-webhook";

describe("whatsapp webhook signature verification", () => {
  it("accepts a valid Meta signature", () => {
    const body = JSON.stringify({ object: "whatsapp_business_account", entry: [] });
    const secret = "meta-app-secret";
    const signature = buildWhatsappWebhookSignature(body, secret);

    expect(verifyWhatsappWebhookSignature(body, signature, secret)).toBe(true);
  });

  it("rejects a mismatched Meta signature", () => {
    const body = JSON.stringify({ object: "whatsapp_business_account", entry: [] });

    expect(verifyWhatsappWebhookSignature(body, "sha256=not-valid", "meta-app-secret")).toBe(false);
  });

  it("rejects a missing Meta signature", () => {
    const body = JSON.stringify({ object: "whatsapp_business_account", entry: [] });

    expect(verifyWhatsappWebhookSignature(body, null, "meta-app-secret")).toBe(false);
  });
});

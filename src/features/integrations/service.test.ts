import { describe, expect, it } from "vitest";
import {
  extractWhatsappMessageText,
  revealIntegrationSecret,
  sanitizeEmailConnectionConfig,
  sanitizeWhatsappConnectionConfig,
  sealIntegrationSecret,
} from "@/features/integrations/service";

describe("integration helpers", () => {
  it("redacts email secrets before sending config to the client", () => {
    expect(
      sanitizeEmailConnectionConfig({
        host: "imap.gmail.com",
        port: 993,
        secure: true,
        username: "owner@example.com",
        password: "super-secret",
        mailbox: "INBOX",
      }),
    ).toEqual({
      host: "imap.gmail.com",
      port: 993,
      secure: true,
      username: "owner@example.com",
      mailbox: "INBOX",
      hasPassword: true,
    });
  });

  it("redacts whatsapp access tokens before sending config to the client", () => {
    expect(
      sanitizeWhatsappConnectionConfig({
        phoneNumberId: "123456",
        verifyToken: "verify-token-123",
        accessToken: "EAAB-secret",
      }),
    ).toEqual({
      phoneNumberId: "123456",
      verifyToken: "verify-token-123",
      hasAccessToken: true,
    });
  });

  it("extracts text from common whatsapp webhook message types", () => {
    expect(extractWhatsappMessageText({ type: "text", text: { body: "Need the proposal today." } })).toBe(
      "Need the proposal today.",
    );
    expect(extractWhatsappMessageText({ type: "image", image: { caption: "Signed contract" } })).toBe(
      "[Image] Signed contract",
    );
    expect(
      extractWhatsappMessageText({
        type: "interactive",
        interactive: { button_reply: { title: "Yes, let's do it" } },
      }),
    ).toBe("Yes, let's do it");
    expect(extractWhatsappMessageText({ type: "audio", audio: { voice: true } })).toBe("[Voice note received]");
  });

  it("seals and reveals saved integration secrets", () => {
    const sealed = sealIntegrationSecret("app-password-123");

    expect(sealed).toBeTruthy();
    expect(sealed).not.toBe("app-password-123");
    expect(revealIntegrationSecret(sealed)).toBe("app-password-123");
  });
});

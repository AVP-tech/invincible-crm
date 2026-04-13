import { createHmac, timingSafeEqual } from "node:crypto";

export function buildWhatsappWebhookSignature(body: string, appSecret: string) {
  return `sha256=${createHmac("sha256", appSecret).update(body).digest("hex")}`;
}

export function verifyWhatsappWebhookSignature(body: string, signatureHeader: string | null, appSecret: string) {
  if (!signatureHeader) {
    return false;
  }

  const expectedSignature = Buffer.from(buildWhatsappWebhookSignature(body, appSecret));
  const providedSignature = Buffer.from(signatureHeader.trim());

  if (expectedSignature.length !== providedSignature.length) {
    return false;
  }

  return timingSafeEqual(expectedSignature, providedSignature);
}

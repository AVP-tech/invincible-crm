import { logger } from "@/lib/logger";

const devSessionSecret = "local-dev-session-secret-change-me";
const openAiApiKey = process.env.OPENAI_API_KEY ?? "";
const whatsappAppSecret = process.env.WHATSAPP_APP_SECRET ?? "";
const whatsappWebhookVerifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN ?? "";

declare global {
  var __invincibleEnvWarningsLogged: boolean | undefined;
}

function isLikelyOpenAiKey(value: string) {
  return value.startsWith("sk-");
}

function warnOnAiEnvConfiguration() {
  if (typeof window !== "undefined" || globalThis.__invincibleEnvWarningsLogged) {
    return;
  }

  globalThis.__invincibleEnvWarningsLogged = true;

  if (!openAiApiKey) {
    logger.warn("OpenAI API key is missing. Quick Capture will fall back to pattern matching.", {
      envVar: "OPENAI_API_KEY"
    });
  } else if (!isLikelyOpenAiKey(openAiApiKey)) {
    logger.warn("OpenAI API key looks invalid. Quick Capture may fall back to pattern matching.", {
      envVar: "OPENAI_API_KEY"
    });
  }
}

warnOnAiEnvConfiguration();

export const env = {
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? "Invincible CRM",
  sessionSecret: process.env.SESSION_SECRET ?? devSessionSecret,
  demoUserEmail: process.env.DEMO_USER_EMAIL ?? "demo@invisiblecrm.local",
  demoUserPassword: process.env.DEMO_USER_PASSWORD ?? "demo12345",
  whatsappAppSecret,
  whatsappWebhookVerifyToken,
  openAiApiKey,
  openAiModel: process.env.OPENAI_MODEL ?? "gpt-4o-mini"
};

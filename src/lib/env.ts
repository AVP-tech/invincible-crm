import { logger } from "@/lib/logger";

const devSessionSecret = "local-dev-session-secret-change-me";
const geminiApiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? "";
const openAiApiKey = process.env.OPENAI_API_KEY ?? "";

declare global {
  var __invincibleEnvWarningsLogged: boolean | undefined;
}

function isLikelyOpenAiKey(value: string) {
  return value.startsWith("sk-");
}

function isLikelyGeminiKey(value: string) {
  return value.startsWith("AIza");
}

function warnOnAiEnvConfiguration() {
  if (typeof window !== "undefined" || globalThis.__invincibleEnvWarningsLogged) {
    return;
  }

  globalThis.__invincibleEnvWarningsLogged = true;

  if (!geminiApiKey) {
    logger.warn("Gemini API key is missing. Quick Capture will fall back to pattern matching.", {
      envVar: "GEMINI_API_KEY / GOOGLE_GENERATIVE_AI_API_KEY"
    });
  } else if (!isLikelyGeminiKey(geminiApiKey)) {
    logger.warn("Gemini API key looks invalid. Quick Capture may fall back to pattern matching.", {
      envVar: "GEMINI_API_KEY / GOOGLE_GENERATIVE_AI_API_KEY"
    });
  }

  if (!openAiApiKey) {
    logger.warn("OpenAI API key is missing. OpenAI fallback parsing is unavailable.", {
      envVar: "OPENAI_API_KEY"
    });
  } else if (!isLikelyOpenAiKey(openAiApiKey)) {
    logger.warn("OpenAI API key looks invalid. OpenAI parsing may fail.", {
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
  whatsappAppSecret: process.env.WHATSAPP_APP_SECRET ?? "",
  openAiApiKey,
  openAiModel: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
  googleAiApiKey: geminiApiKey,
  googleModel: process.env.GOOGLE_MODEL ?? "gemini-2.0-flash"
};

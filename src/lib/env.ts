const devSessionSecret = "local-dev-session-secret-change-me";

export const env = {
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? "Invincible CRM",
  sessionSecret: process.env.SESSION_SECRET ?? devSessionSecret,
  demoUserEmail: process.env.DEMO_USER_EMAIL ?? "demo@invisiblecrm.local",
  demoUserPassword: process.env.DEMO_USER_PASSWORD ?? "demo12345",
  whatsappAppSecret: process.env.WHATSAPP_APP_SECRET ?? "",
  openAiApiKey: process.env.OPENAI_API_KEY ?? "",
  openAiModel: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
  googleAiApiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? "",
  googleModel: process.env.GOOGLE_MODEL ?? "gemini-1.5-flash-latest"
};

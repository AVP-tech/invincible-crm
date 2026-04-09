const devSessionSecret = "local-dev-session-secret-change-me";

export const env = {
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? "Invisible CRM",
  sessionSecret: process.env.SESSION_SECRET ?? devSessionSecret,
  demoUserEmail: process.env.DEMO_USER_EMAIL ?? "demo@invisiblecrm.local",
  demoUserPassword: process.env.DEMO_USER_PASSWORD ?? "demo12345",
  openAiApiKey: process.env.OPENAI_API_KEY ?? "",
  openAiModel: process.env.OPENAI_MODEL ?? "gpt-4.1-mini"
};

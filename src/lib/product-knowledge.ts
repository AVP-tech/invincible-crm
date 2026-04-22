const PRODUCT_KNOWLEDGE_CONTEXT = `
Brand: Invincible CRM
Tagline: The CRM that never drops the ball.

What Invincible CRM does:
Invincible CRM helps founders and lean sales teams turn natural-language updates and WhatsApp conversations into structured contacts, deals, tasks, notes, and reminders without heavy manual CRM work.

Who it is for:
- Solo founders who do not want leads and follow-ups to live in memory.
- Small sales teams that sell through calls, chats, and fast-moving follow-up cycles.
- Teams that want a cleaner CRM without admin bloat.

Core product capabilities:
- AI Capture / Quick Capture: users type a plain-English update and the system can create or update contacts, deals, tasks, and notes automatically.
- WhatsApp CRM workflow: teams can turn WhatsApp lead context into structured contacts, deals, tasks, and reminders.
- Follow-up discipline: promised next steps can become visible tasks and reminders.
- Pipeline visibility: qualified leads can move into a deal pipeline with cleaner handoffs.
- Team collaboration: higher plans support team collaboration, roles, analytics, and custom workflows.

Examples of how the product works:
- "Met Rahul Sharma from TechVista, 5L budget, interested in enterprise plan" can become a contact, deal, and note.
- "Follow up with Priya Monday about the proposal, high priority" can become a scheduled task with priority.
- "Sent quote to Aman, deal moved to negotiation, 12L value" can update pipeline stage and save activity.

Pricing:
- Free: Rs 0 forever. Includes up to 100 contacts, basic deals pipeline, task and reminder management, email integration, and community support.
- Intermediate: Rs 499/month. Includes unlimited contacts, AI Capture with natural-language input, conversational WhatsApp AI Bot, smart automations, finance and invoice tracking, and priority email support.
- Advanced: Rs 999/month. Includes everything in Intermediate plus a dedicated onboarding call, team collaboration and roles, advanced pipeline analytics, custom automations and workflows, WhatsApp AI with full memory, and direct founder support.

Helpful links:
- Start free: https://invinciblecrm.com/register
- Book a demo: https://invinciblecrm.com/book-demo
- WhatsApp CRM page: https://invinciblecrm.com/whatsapp-crm

Positioning:
- The product is designed to feel simple, fast, and effortless.
- The biggest value is reducing CRM friction so teams can focus on closing deals and following up on time.
`.trim();

export function getProductKnowledgeContext() {
  return PRODUCT_KNOWLEDGE_CONTEXT;
}

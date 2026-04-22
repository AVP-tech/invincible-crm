type ProductKnowledgeChunk = {
  id: string;
  title: string;
  url?: string;
  keywords: string[];
  content: string;
};

const KNOWLEDGE_CHUNKS: ProductKnowledgeChunk[] = [
  {
    id: "overview",
    title: "Overview",
    keywords: [
      "invincible crm",
      "what is invincible crm",
      "what does invincible crm do",
      "crm"
    ],
    content: [
      "Brand: Invincible CRM.",
      "Tagline: The CRM that never drops the ball.",
      "Invincible CRM helps founders and lean sales teams turn natural-language updates and WhatsApp conversations into structured contacts, deals, tasks, notes, and reminders without heavy manual CRM work.",
      "The product is designed to feel simple, fast, and effortless so teams can focus on closing deals and following up on time."
    ].join(" ")
  },
  {
    id: "pricing",
    title: "Pricing and plans",
    url: "https://invinciblecrm.com/register",
    keywords: [
      "price",
      "pricing",
      "cost",
      "plans",
      "plan",
      "free",
      "intermediate",
      "advanced",
      "upgrade"
    ],
    content: [
      "Free plan: Rs 0 forever. Includes up to 100 contacts, basic deals pipeline, task and reminder management, email integration, and community support.",
      "Intermediate plan: Rs 499/month. Includes unlimited contacts, AI Capture with natural-language input, conversational WhatsApp AI Bot, smart automations, finance and invoice tracking, and priority email support.",
      "Advanced plan: Rs 999/month. Includes everything in Intermediate plus a dedicated onboarding call, team collaboration and roles, advanced pipeline analytics, custom automations and workflows, WhatsApp AI with full memory, and direct founder support.",
      "Useful link: https://invinciblecrm.com/register"
    ].join(" ")
  },
  {
    id: "quick-capture",
    title: "AI Capture and Quick Capture workflow",
    url: "https://invinciblecrm.com/guide",
    keywords: [
      "ai capture",
      "quick capture",
      "capture",
      "guide",
      "plain english",
      "natural language",
      "task",
      "deal",
      "contact",
      "note"
    ],
    content: [
      "Users can type updates in plain English and Invincible CRM can create or update contacts, deals, tasks, and notes automatically.",
      "Example: Met Rahul Sharma from TechVista, 5L budget, interested in enterprise plan can become a contact, deal, and note.",
      "Example: Follow up with Priya Monday about the proposal, high priority can become a scheduled task with priority.",
      "Example: Sent quote to Aman, deal moved to negotiation, 12L value can update pipeline stage and save activity.",
      "Useful link: https://invinciblecrm.com/guide"
    ].join(" ")
  },
  {
    id: "whatsapp-crm",
    title: "WhatsApp CRM workflow",
    url: "https://invinciblecrm.com/whatsapp-crm",
    keywords: [
      "whatsapp",
      "chat",
      "whatsapp crm",
      "lead capture",
      "follow up",
      "follow-up",
      "reminder",
      "pipeline",
      "chat driven"
    ],
    content: [
      "Invincible CRM helps teams turn WhatsApp conversations into structured contacts, deals, tasks, and reminders without losing context.",
      "It is designed for teams that collect leads, qualify prospects, and manage follow-up through WhatsApp conversations instead of long-form CRM entry.",
      "The workflow is: spot buying intent, structure the update, and keep momentum visible with tasks, reminders, and deal movement.",
      "Useful links: https://invinciblecrm.com/whatsapp-crm and https://invinciblecrm.com/book-demo"
    ].join(" ")
  },
  {
    id: "small-business-fit",
    title: "Fit for small business teams",
    url: "https://invinciblecrm.com/crm-for-small-business",
    keywords: [
      "small business",
      "startup",
      "small team",
      "simple crm",
      "easy crm",
      "lightweight",
      "founder"
    ],
    content: [
      "Invincible CRM is positioned for teams that want clearer follow-up and better organization without enterprise-style setup pain.",
      "Small teams usually start with contacts, deal tracking, reminders, and task management because those are the first places where scattered follow-up starts costing revenue.",
      "The core value is execution clarity: fewer missed follow-ups, cleaner records, and less admin bloat.",
      "Useful link: https://invinciblecrm.com/crm-for-small-business"
    ].join(" ")
  },
  {
    id: "indian-sales-teams",
    title: "Fit for Indian sales teams",
    url: "https://invinciblecrm.com/crm-for-indian-sales-teams",
    keywords: [
      "india",
      "indian sales team",
      "sales team",
      "calls",
      "callbacks",
      "phone calls",
      "chat heavy",
      "fast follow up"
    ],
    content: [
      "Invincible CRM is a strong fit for Indian sales teams that work across calls, WhatsApp, quick follow-ups, and founder-led selling.",
      "It is designed for fast operational reality instead of heavyweight enterprise process.",
      "The product helps reduce missed callbacks and stale follow-up by converting updates into tasks, reminders, and visible deal movement.",
      "Useful link: https://invinciblecrm.com/crm-for-indian-sales-teams"
    ].join(" ")
  },
  {
    id: "onboarding",
    title: "Guided onboarding and demo",
    url: "https://invinciblecrm.com/book-demo",
    keywords: [
      "demo",
      "book demo",
      "book a call",
      "onboarding",
      "setup",
      "video call",
      "google meet",
      "zoom"
    ],
    content: [
      "Users can book a free 10-minute onboarding video call with the founder.",
      "The team helps connect WhatsApp AI, set up the CRM, and show the product live before the call ends.",
      "Average setup time is 8 minutes, and the typical response time after submitting the onboarding form is within 2 hours.",
      "Useful link: https://invinciblecrm.com/book-demo"
    ].join(" ")
  },
  {
    id: "integrations",
    title: "Integrations setup",
    url: "https://invinciblecrm.com/integrations",
    keywords: [
      "integration",
      "integrations",
      "connect whatsapp",
      "whatsapp setup",
      "email inbox",
      "webhook",
      "meta api",
      "background jobs",
      "connect tools"
    ],
    content: [
      "Invincible CRM has an Integrations area for connecting the tools where real conversations already happen, especially email inboxes, WhatsApp messages, and background processing.",
      "The setup is meant to bridge manual CRM updates into operational capture through webhook-based WhatsApp setup and connected inbox workflows.",
      "For guided setup, users can book onboarding and get help connecting WhatsApp AI and related tokens or webhooks."
    ].join(" ")
  },
  {
    id: "automations",
    title: "Automation rules",
    url: "https://invinciblecrm.com/automations",
    keywords: [
      "automation",
      "automations",
      "rules",
      "trigger",
      "deal stage",
      "task completion",
      "inbound conversation",
      "workflow"
    ],
    content: [
      "Invincible CRM supports lightweight automation rules designed to keep the CRM proactive without turning it into an enterprise workflow maze.",
      "Automations can trigger on deal stage movement, task completion, or a new inbound conversation and create the next action at the right moment.",
      "A simple example is: when a deal moves to Proposal Sent, create a follow-up task due in 3 days."
    ].join(" ")
  },
  {
    id: "imports",
    title: "Imports and data migration",
    url: "https://invinciblecrm.com/imports",
    keywords: [
      "import",
      "imports",
      "csv",
      "contacts import",
      "transcript",
      "meeting notes",
      "migration",
      "spreadsheet",
      "dedupe"
    ],
    content: [
      "The Imports area is designed to move real business data into the workspace with less migration friction.",
      "It supports meeting transcript import so pasted call notes or transcripts can become a clean summary, follow-up task, and deal or contact updates.",
      "It also supports CSV contacts import with preview and dedupe checks before anything is written."
    ].join(" ")
  },
  {
    id: "inbox-search",
    title: "Inbox capture and workspace search",
    url: "https://invinciblecrm.com/inbox",
    keywords: [
      "inbox",
      "paste chat",
      "email threads",
      "call notes",
      "search",
      "find context",
      "search workspace",
      "conversation capture"
    ],
    content: [
      "The Inbox helps users paste WhatsApp chats, email threads, or rough call notes and convert them into clean CRM context with action-ready follow-ups.",
      "Recent inbox captures act as a lightweight audit trail of conversations turned into CRM updates.",
      "Search lets users find context fast across contacts, deals, tasks, and captured conversations from one place."
    ].join(" ")
  },
  {
    id: "finance",
    title: "Finance and invoice tracking",
    url: "https://invinciblecrm.com/finance",
    keywords: [
      "finance",
      "invoice",
      "invoices",
      "revenue",
      "export workbook",
      "accounting",
      "spreadsheet ops"
    ],
    content: [
      "Invincible CRM includes invoice and spreadsheet-friendly revenue tracking so commercial follow-through stays visible next to CRM activity.",
      "Users can track invoices, link them to contacts or deals, and export a workbook for spreadsheet-based operations.",
      "The goal is to keep proposals, invoices, and revenue context from getting split across different tools."
    ].join(" ")
  },
  {
    id: "team",
    title: "Team workspace and permissions",
    url: "https://invinciblecrm.com/team",
    keywords: [
      "team",
      "teammates",
      "workspace",
      "roles",
      "permissions",
      "owner",
      "admin",
      "member",
      "viewer"
    ],
    content: [
      "Invincible CRM supports a shared workspace where real teammates can work from one CRM context.",
      "Owners and admins can add teammates, set integrations, manage automations, and track invoices. Members can work in the CRM, and viewers are read-only.",
      "The focus is lightweight permissions with clear ownership."
    ].join(" ")
  },
  {
    id: "support",
    title: "Support and response coverage",
    url: "https://invinciblecrm.com/help",
    keywords: [
      "support",
      "help",
      "response time",
      "priority support",
      "community support",
      "email support",
      "founder support",
      "24/7"
    ],
    content: [
      "Free plan support: limited queries with response in 48 to 72 hours for general inquiries and onboarding questions.",
      "Intermediate plan support: priority queries with response in 12 to 24 hours, including help with automations and workflows.",
      "Advanced plan support: unlimited 24/7 priority support with white-glove assistance for rules, pipelines, and AI training.",
      "Concierge contact email: aayushpandey.pro@gmail.com.",
      "Useful link: https://invinciblecrm.com/help"
    ].join(" ")
  }
];

const BASE_CHUNK_IDS = ["overview"] as const;

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "about",
  "best",
  "can",
  "do",
  "for",
  "from",
  "help",
  "how",
  "i",
  "in",
  "is",
  "it",
  "me",
  "my",
  "of",
  "on",
  "or",
  "the",
  "to",
  "we",
  "what",
  "which",
  "with",
  "you",
  "your"
]);

function normalizeText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s/+-]/g, " ");
}

function tokenize(value: string) {
  return Array.from(
    new Set(
      normalizeText(value)
        .split(/\s+/)
        .filter((token) => token.length > 1 && !STOP_WORDS.has(token))
    )
  );
}

function scoreChunk(query: string, queryTokens: string[], chunk: ProductKnowledgeChunk) {
  const normalizedQuery = normalizeText(query);
  const haystack = normalizeText(
    `${chunk.title} ${chunk.keywords.join(" ")} ${chunk.content}`
  );

  let score = 0;

  for (const keyword of chunk.keywords) {
    const normalizedKeyword = normalizeText(keyword).trim();

    if (!normalizedKeyword) {
      continue;
    }

    if (normalizedQuery.includes(normalizedKeyword)) {
      score += normalizedKeyword.includes(" ") ? 10 : 6;
    }
  }

  for (const token of queryTokens) {
    if (haystack.includes(token)) {
      score += 2;
    }
  }

  return score;
}

function formatChunk(chunk: ProductKnowledgeChunk) {
  const linkLine = chunk.url ? `URL: ${chunk.url}` : "";
  return `[${chunk.title}]
${chunk.content}
${linkLine}`.trim();
}

export function getProductKnowledgeContext() {
  return KNOWLEDGE_CHUNKS.map(formatChunk).join("\n\n");
}

export function getRelevantProductKnowledgeContext(
  query: string,
  maxRelevantChunks = 4
) {
  const queryTokens = tokenize(query);
  const baseChunks = KNOWLEDGE_CHUNKS.filter((chunk) =>
    BASE_CHUNK_IDS.includes(chunk.id as (typeof BASE_CHUNK_IDS)[number])
  );
  const scoredChunks = KNOWLEDGE_CHUNKS.filter(
    (chunk) => !BASE_CHUNK_IDS.includes(chunk.id as (typeof BASE_CHUNK_IDS)[number])
  )
    .map((chunk) => ({
      chunk,
      score: scoreChunk(query, queryTokens, chunk)
    }))
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, maxRelevantChunks)
    .map(({ chunk }) => chunk);

  const fallbackChunks =
    scoredChunks.length > 0
      ? scoredChunks
      : KNOWLEDGE_CHUNKS.filter((chunk) =>
          ["pricing", "quick-capture", "whatsapp-crm"].includes(chunk.id)
        ).slice(0, maxRelevantChunks);

  return [...baseChunks, ...fallbackChunks].map(formatChunk).join("\n\n");
}

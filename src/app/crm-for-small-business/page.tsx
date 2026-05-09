import type { Metadata } from "next";
import {
  BrainCircuit,
  CheckSquare,
  KanbanSquare,
  Users,
} from "lucide-react";
import {
  buildLandingStructuredData,
  type SeoFaq,
  SeoLandingPage,
} from "@/components/marketing/seo-landing-page";

const title = "CRM for small business teams that need simplicity and follow-up control";
const description =
  "Invincible CRM gives small businesses a simpler way to manage contacts, deals, tasks, and reminders with less admin and faster follow-up.";
const canonicalPath = "/crm-for-small-business";
const keywords = [
  "crm for small business",
  "simple crm for startups",
  "affordable crm for small teams",
  "easy crm for business owners",
];

const faqs: SeoFaq[] = [
  {
    question: "Is Invincible CRM too heavy for a small business team?",
    answer:
      "No. The point is the opposite. Invincible CRM is positioned for teams that want clearer follow-up and better organization without enterprise-style setup pain.",
  },
  {
    question: "What does a small team usually use it for first?",
    answer:
      "Most small teams start with contacts, deal tracking, reminders, and task management because those are the first places where scattered follow-up starts costing revenue.",
  },
  {
    question: "Can founders and team members use the same workspace?",
    answer:
      "Yes. Small teams typically need one place where context, deal movement, and next actions are visible instead of staying inside separate notes or chat apps.",
  },
  {
    question: "Why choose this instead of a more complex CRM?",
    answer:
      "Because many small businesses do not have a CRM problem. They have an execution problem. They need fewer missed follow-ups, not more setup screens.",
  },
];

export const metadata: Metadata = {
  title,
  description,
  keywords,
  alternates: {
    canonical: canonicalPath,
  },
  openGraph: {
    title,
    description,
    url: canonicalPath,
    type: "website",
  },
  twitter: {
    title,
    description,
    card: "summary_large_image",
  },
};

export default function CrmForSmallBusinessPage() {
  const structuredData = buildLandingStructuredData({
    slug: "crm-for-small-business",
    pageTitle: "CRM for Small Business",
    description,
    faqs,
    featureTitles: [
      "Simple setup",
      "Contacts and pipeline in one workspace",
      "Follow-up tasks and reminders",
      "Natural-language updates for CRM hygiene",
    ],
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <SeoLandingPage
        eyebrow="CRM for small business"
        title="A CRM for small business teams that need momentum, not busywork"
        description="Small businesses do not need six months of CRM rollout drama. They need one place to track contacts, deals, tasks, and follow-ups without turning the whole team into data-entry operators."
        primaryCta={{ href: "/register", label: "Start free" }}
        secondaryCta={{ href: "/book-demo", label: "Book a guided setup" }}
        heroHighlights={[
          "Simple enough for small teams",
          "Strong follow-up discipline",
          "AI-assisted capture workflow",
        ]}
        heroStats={[
          { value: "Fast setup", label: "for founders who need usable structure, not configuration overload" },
          { value: "One workspace", label: "for contacts, deals, tasks, and reminders" },
          { value: "Lower friction", label: "when team members need to log updates in plain language" },
          { value: "Cleaner execution", label: "because next actions stop living in personal memory" },
        ]}
        painPoints={[
          {
            title: "Customer notes are scattered everywhere",
            description:
              "Contacts live in one app, deal status lives in another, and founders carry the rest in their head or on loose sheets.",
          },
          {
            title: "The pipeline is always slightly outdated",
            description:
              "Small teams delay CRM updates because the system feels like extra work, so managers stop trusting the view.",
          },
          {
            title: "Follow-up slips through the cracks",
            description:
              "When a small team misses one callback or proposal, the revenue impact is immediate because every lead matters.",
          },
        ]}
        solutionTitle="A simpler CRM for teams that need execution clarity"
        solutionDescription="Invincible CRM is meant to feel usable on day one. It keeps the core motions small teams actually care about in one place: who the contact is, what the opportunity looks like, what needs to happen next, and who owns that move."
        solutionBullets={[
          "Track contacts, deals, and follow-up work without stitching together five separate tools.",
          "Use natural-language updates to reduce the friction of keeping records current.",
          "Give owners and team members the same view of what is active, overdue, or ready to close.",
          "Replace fragile founder-memory workflows with tasks, reminders, and timeline context.",
        ]}
        featureTitle="What small teams usually need first"
        featureDescription="This is not about promising a thousand features. It is about giving small businesses a CRM they can actually adopt and keep using after the first week."
        features={[
          {
            title: "Quick capture",
            description:
              "Log customer updates in plain language so important context becomes structured CRM data with less effort.",
            icon: BrainCircuit,
          },
          {
            title: "Deal visibility",
            description:
              "Keep the pipeline simple and readable so the whole team knows what is moving and what needs intervention.",
            icon: KanbanSquare,
          },
          {
            title: "Task and reminder control",
            description:
              "Turn promises into action items so no opportunity depends on someone remembering to follow up later.",
            icon: CheckSquare,
          },
          {
            title: "Shared customer context",
            description:
              "Make sure founders, sales reps, and operators see the same record instead of relying on private memory or chat searches.",
            icon: Users,
          },
        ]}
        workflowTitle="What adoption looks like in a real small team"
        workflowDescription="The winning pattern is simple: capture the customer context quickly, assign the next move, and keep deal status visible enough that nobody needs a separate catch-up call just to know what is going on."
        workflowSteps={[
          {
            title: "Capture the update",
            description:
              "A founder or teammate logs the latest conversation, request, or sales movement as soon as it happens.",
          },
          {
            title: "Convert it into action",
            description:
              "The CRM turns that into contacts, notes, reminders, or deal changes that are easy to see later.",
          },
          {
            title: "Run follow-up consistently",
            description:
              "Everyone works from the same system so handoffs, callbacks, and proposal chasing stop slipping.",
          },
        ]}
        faqs={faqs}
        relatedLinks={[
          {
            href: "/whatsapp-crm",
            label: "WhatsApp CRM",
            description: "See the use-case page for small teams that close business through chat-heavy selling.",
          },
          {
            href: "/crm-for-global-sales-teams",
            label: "CRM for global sales teams",
            description: "Read the regional positioning page built for fast-moving teams managing calls, chats, and follow-up.",
          },
          {
            href: "/book-demo",
            label: "Book a product walkthrough",
            description: "If you want a faster setup path, use the concierge onboarding route.",
          },
        ]}
      />
    </>
  );
}

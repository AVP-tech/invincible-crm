import type { Metadata } from "next";
import {
  BrainCircuit,
  CheckSquare,
  KanbanSquare,
  MessageSquareMore,
} from "lucide-react";
import {
  buildLandingStructuredData,
  type SeoFaq,
  SeoLandingPage,
} from "@/components/marketing/seo-landing-page";

const title = "WhatsApp CRM for lead capture, follow-ups, and deal tracking";
const description =
  "Invincible CRM helps teams turn WhatsApp conversations into structured contacts, deals, tasks, and reminders without losing context.";
const canonicalPath = "/whatsapp-crm";
const keywords = [
  "whatsapp crm",
  "crm with whatsapp integration",
  "whatsapp lead management",
  "whatsapp sales crm",
];

const faqs: SeoFaq[] = [
  {
    question: "Can Invincible CRM help if most of my sales conversations happen on WhatsApp?",
    answer:
      "Yes. Invincible CRM is designed for teams that collect leads, qualify prospects, and manage follow-up through WhatsApp conversations instead of long-form CRM entry.",
  },
  {
    question: "Do I still need to manually rewrite chat context into my CRM?",
    answer:
      "That is exactly the workflow Invincible CRM tries to reduce. The goal is to turn natural-language updates into structured contacts, deals, notes, and tasks before anything is saved.",
  },
  {
    question: "Is this useful for solo founders as well as small sales teams?",
    answer:
      "Yes. Solo operators use it to stop forgetting follow-ups, while small teams use it to keep handoffs clean and make chat-driven selling easier to track.",
  },
  {
    question: "Can I move a WhatsApp lead into a deal pipeline and assign next steps?",
    answer:
      "Yes. Once a lead is qualified, Invincible CRM helps turn that context into contacts, deal records, tasks, and reminders so the opportunity keeps moving.",
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

export default function WhatsAppCrmPage() {
  const structuredData = buildLandingStructuredData({
    slug: "whatsapp-crm",
    pageTitle: "WhatsApp CRM",
    description,
    faqs,
    featureTitles: [
      "Capture WhatsApp lead context",
      "Create follow-ups and reminders",
      "Track deals after chat qualification",
      "Store notes without messy copy-paste",
    ],
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <SeoLandingPage
        eyebrow="WhatsApp CRM"
        title="A WhatsApp CRM that turns chat activity into pipeline progress"
        description="If your team sells on WhatsApp, the real challenge is not getting messages. It is turning those conversations into structured lead management, disciplined follow-up, and a pipeline you can actually trust."
        primaryCta={{ href: "/book-demo", label: "Book a WhatsApp CRM demo" }}
        secondaryCta={{ href: "/register", label: "Start free" }}
        heroHighlights={[
          "Capture lead context from chats",
          "Turn follow-ups into tasks",
          "Move qualified leads into deals",
        ]}
        heroStats={[
          { value: "1 chat", label: "can become a contact, task, note, and deal update" },
          { value: "Less admin", label: "for teams tired of copying messages into CRM fields" },
          { value: "Clear handoffs", label: "between founders, closers, and follow-up owners" },
          { value: "One timeline", label: "for conversations, reminders, and pipeline activity" },
        ]}
        painPoints={[
          {
            title: "Leads disappear inside chat threads",
            description:
              "Important buying signals stay buried in long conversations, voice notes, and founder memory instead of becoming clean CRM records.",
          },
          {
            title: "Follow-up depends on memory",
            description:
              "Teams promise call-backs, demos, or proposals but next steps never become tasks with ownership and due dates.",
          },
          {
            title: "Pipeline updates happen too late",
            description:
              "By the time someone manually updates the CRM, the opportunity has already cooled down or moved without visibility.",
          },
        ]}
        solutionTitle="From WhatsApp chatter to structured sales execution"
        solutionDescription="Invincible CRM is for teams that already generate conversations on WhatsApp but want cleaner lead management. Instead of treating chat and CRM as separate worlds, it helps you turn natural-language updates into actionable records your team can actually operate from."
        solutionBullets={[
          "Capture lead details the moment a conversation becomes commercially relevant.",
          "Convert next steps into reminders and tasks before they get lost in the thread.",
          "Move qualified conversations into a visible deal pipeline without the usual cleanup work.",
          "Keep notes, handoff context, and follow-up activity tied to the same account history.",
        ]}
        featureTitle="Built for WhatsApp-heavy selling"
        featureDescription="This page targets buyers searching for a WhatsApp CRM because they already know their current stack is leaky. The product story here needs to be simple: fewer missed leads, cleaner records, faster follow-up."
        features={[
          {
            title: "Conversation-aware capture",
            description:
              "Turn real chat context into contacts, notes, and opportunity records instead of leaving important information trapped in message history.",
            icon: MessageSquareMore,
          },
          {
            title: "Follow-up discipline",
            description:
              "Create reminders and tasks from what was promised in chat so the next move becomes visible and owned.",
            icon: CheckSquare,
          },
          {
            title: "Pipeline visibility",
            description:
              "Push qualified WhatsApp leads into your deal flow so managers can see what is active, stalled, or close-ready.",
            icon: KanbanSquare,
          },
          {
            title: "Natural-language workflow",
            description:
              "Use plain-language updates to keep CRM hygiene strong without forcing your team into heavy admin behavior.",
            icon: BrainCircuit,
          },
        ]}
        workflowTitle="How teams use it day to day"
        workflowDescription="The operational win is not just capturing a lead. It is building a repeatable motion from first conversation to follow-up to deal movement without relying on memory."
        workflowSteps={[
          {
            title: "Spot buying intent",
            description:
              "A WhatsApp conversation shows budget, urgency, use-case, or interest strong enough to become a real opportunity.",
          },
          {
            title: "Structure the update",
            description:
              "The team logs the context in plain language and Invincible CRM turns it into contacts, notes, tasks, or deal changes.",
          },
          {
            title: "Keep momentum visible",
            description:
              "Reminders, owners, and pipeline updates keep the opportunity moving without losing the original conversation context.",
          },
        ]}
        faqs={faqs}
        relatedLinks={[
          {
            href: "/crm-for-small-business",
            label: "CRM for small business",
            description: "See how the same product fits lean teams that need a simple CRM without admin bloat.",
          },
          {
            href: "/crm-for-indian-sales-teams",
            label: "CRM for Indian sales teams",
            description: "Explore the workflow angle for fast-moving teams selling through calls, chats, and follow-up heavy cycles.",
          },
          {
            href: "/book-demo",
            label: "Book a live demo",
            description: "Want to see the WhatsApp-to-CRM motion in action? Use the guided onboarding route.",
          },
        ]}
      />
    </>
  );
}

import type { Metadata } from "next";
import {
  BellRing,
  BrainCircuit,
  MessageSquareMore,
  PhoneCall,
} from "lucide-react";
import {
  buildLandingStructuredData,
  type SeoFaq,
  SeoLandingPage,
} from "@/components/marketing/seo-landing-page";

const title = "CRM for global sales teams handling chats, calls, and fast follow-up";
const description =
  "Invincible CRM helps global sales teams manage leads, follow-ups, reminders, and deal movement across fast, chat-heavy workflows.";
const canonicalPath = "/crm-for-global-sales-teams";
const keywords = [
  "crm for global sales teams",
  "sales crm global",
  "global crm software",
  "crm for fast-moving sales teams globally",
];

const faqs: SeoFaq[] = [
  {
    question: "Why does Invincible CRM fit global sales teams particularly well?",
    answer:
      "Because many global sales teams work across calls, WhatsApp, quick follow-ups, and founder-led selling. Invincible CRM is positioned around that fast operational reality instead of heavyweight enterprise process.",
  },
  {
    question: "Can this help teams that sell through chats and phone calls instead of long email chains?",
    answer:
      "Yes. That is one of the strongest use cases. It is designed to help teams keep context, reminders, and next steps organized when the sales motion is fast and conversational.",
  },
  {
    question: "Is this more suitable for SMB teams or bigger organizations?",
    answer:
      "The clearest fit is for growing teams that need speed, visibility, and follow-up control without rolling out a complex enterprise CRM program.",
  },
  {
    question: "Will this reduce missed callbacks and stale lead follow-up?",
    answer:
      "That is exactly the operational promise. The product is built to convert updates into tasks, reminders, and visible deal movement so follow-up gets less fragile.",
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

export default function CrmForGlobalSalesTeamsPage() {
  const structuredData = buildLandingStructuredData({
    slug: "crm-for-global-sales-teams",
    pageTitle: "CRM for Global Sales Teams",
    description,
    faqs,
    featureTitles: [
      "Chat and call driven workflow support",
      "Task and reminder discipline",
      "Natural-language CRM capture",
      "Fast-moving team visibility",
    ],
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <SeoLandingPage
        eyebrow="CRM for global sales teams"
        title="A CRM for global sales teams that move fast across calls, chats, and follow-up"
        description="Many global sales teams do not sell through neat, slow, enterprise workflows. They sell through quick calls, WhatsApp messages, repeated callbacks, and constant context switching. Invincible CRM is built for that pace."
        primaryCta={{ href: "/book-demo", label: "See it in a live walkthrough" }}
        secondaryCta={{ href: "/register", label: "Start free" }}
        heroHighlights={[
          "Built for fast-moving follow-up",
          "Works with chat-heavy selling",
          "Keeps sales execution visible",
        ]}
        heroStats={[
          { value: "Chat-first", label: "for teams where lead movement starts in WhatsApp and calls" },
          { value: "Less chaos", label: "when callbacks, reminders, and next steps need stronger ownership" },
          { value: "More visibility", label: "for founders and managers tracking active opportunities" },
          { value: "Faster hygiene", label: "through plain-language CRM updates instead of heavy admin" },
        ]}
        painPoints={[
          {
            title: "Selling happens too fast for manual CRM entry",
            description:
              "By the time a rep finishes calls and chat replies, formal CRM updates feel like late-night cleanup work.",
          },
          {
            title: "Callback-heavy workflows are fragile",
            description:
              "A team can have strong lead flow and still lose business because reminders, re-contact dates, and promised actions are scattered.",
          },
          {
            title: "Managers cannot see real execution risk",
            description:
              "Without timely updates, it becomes hard to know whether leads are truly moving or just sitting in private conversations.",
          },
        ]}
        solutionTitle="A cleaner operating system for conversational selling"
        solutionDescription="Invincible CRM gives global sales teams a simpler way to run follow-up. It is designed for the reality that much of the sales cycle happens in calls, chats, and quick updates that need to become structured records fast."
        solutionBullets={[
          "Capture lead context while it is still fresh instead of waiting for end-of-day cleanup.",
          "Create reminders and task ownership for callbacks, demos, and proposal follow-ups.",
          "Keep founder-led and team-led selling in one shared timeline so context survives handoffs.",
          "Maintain enough pipeline discipline to know what is hot, delayed, or at risk without slowing the team down.",
        ]}
        featureTitle="What matters in this workflow"
        featureDescription="For this audience, SEO copy should feel operationally real. The page needs to reflect the day-to-day messiness of chats, calls, and repeated follow-up rather than pretending sales is a perfect form-based process."
        features={[
          {
            title: "Call-to-CRM clarity",
            description:
              "Log important call outcomes quickly so the next move, owner, and commercial context are not lost after the conversation ends.",
            icon: PhoneCall,
          },
          {
            title: "WhatsApp-friendly workflow",
            description:
              "Support chat-driven selling with a CRM that understands fast conversations, follow-up promises, and context capture.",
            icon: MessageSquareMore,
          },
          {
            title: "Reminder discipline",
            description:
              "Make callbacks, check-ins, and proposal follow-up visible so sales momentum does not depend on memory alone.",
            icon: BellRing,
          },
          {
            title: "Natural-language updates",
            description:
              "Use simple plain-language inputs to keep CRM data cleaner when the team does not have time for heavy manual entry.",
            icon: BrainCircuit,
          },
        ]}
        workflowTitle="How fast-moving teams usually run it"
        workflowDescription="The idea is not to slow the team down. It is to give high-velocity sales teams just enough structure that activity becomes trackable, follow-up becomes consistent, and managers can trust what they are seeing."
        workflowSteps={[
          {
            title: "Lead activity happens in the wild",
            description:
              "The rep or founder gets context from a call, WhatsApp message, or short back-and-forth that indicates real opportunity.",
          },
          {
            title: "The update is captured quickly",
            description:
              "Instead of postponing CRM entry, the team records the update in plain language so the system can structure it fast.",
          },
          {
            title: "The next move becomes visible",
            description:
              "Tasks, reminders, and deal progress stay tied to the account so nothing disappears after the conversation ends.",
          },
        ]}
        faqs={faqs}
        relatedLinks={[
          {
            href: "/whatsapp-crm",
            label: "WhatsApp CRM",
            description: "Read the focused page for teams whose sales motion depends heavily on chat-based lead handling.",
          },
          {
            href: "/crm-for-small-business",
            label: "CRM for small business",
            description: "See the positioning page for lean teams that want simplicity without enterprise CRM overhead.",
          },
          {
            href: "/book-demo",
            label: "Book a live setup session",
            description: "If you want the fastest path, go through the guided onboarding flow.",
          },
        ]}
      />
    </>
  );
}

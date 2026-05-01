import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BellRing,
  Bot,
  BrainCircuit,
  CheckCircle2,
  CheckSquare,
  Compass,
  Crown,
  KanbanSquare,
  LayoutDashboard,
  MessageSquareMore,
  PlugZap,
  ReceiptText,
  Search,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";

const title = "Invincible CRM Feature Tour";
const description =
  "Explore every major Invincible CRM feature in one public showcase: AI capture, WhatsApp inbox, deals, tasks, reminders, automations, finance, team workspaces, imports, and search.";

type FeatureGroup = {
  title: string;
  kicker: string;
  description: string;
  icon: LucideIcon;
  accent: string;
  features: string[];
};

type ModuleCard = {
  title: string;
  description: string;
  icon: LucideIcon;
};

const heroStats = [
  { value: "12+", label: "core CRM modules visible in one tour" },
  { value: "3", label: "capture paths for calls, chats, and notes" },
  { value: "1", label: "workspace for follow-up, pipeline, and revenue" },
  { value: "0", label: "context lost between message and next action" },
];

const platformModules: ModuleCard[] = [
  {
    title: "AI Capture",
    description: "Turn plain-language sales updates into contacts, deals, notes, tasks, and reminders.",
    icon: BrainCircuit,
  },
  {
    title: "Captain Hook",
    description: "A guided product assistant for finding the next best workflow inside the CRM.",
    icon: Compass,
  },
  {
    title: "Dashboard",
    description: "See activity, pipeline health, overdue work, and revenue signals in one calm control center.",
    icon: LayoutDashboard,
  },
  {
    title: "Contacts",
    description: "Keep people, companies, notes, deal history, and follow-up context connected.",
    icon: Users,
  },
  {
    title: "Deals",
    description: "Manage a visual pipeline and move opportunities without losing customer context.",
    icon: KanbanSquare,
  },
  {
    title: "Tasks",
    description: "Track ownership, due dates, priorities, recurring follow-ups, and completed work.",
    icon: CheckSquare,
  },
  {
    title: "Reminders",
    description: "Keep callbacks, proposal nudges, and renewal touches visible before they slip.",
    icon: BellRing,
  },
  {
    title: "Inbox",
    description: "Paste WhatsApp chats, email threads, and call notes, then convert them into CRM updates.",
    icon: MessageSquareMore,
  },
  {
    title: "Automations",
    description: "Trigger the next action when a deal moves, a task closes, or a conversation arrives.",
    icon: Bot,
  },
  {
    title: "Integrations",
    description: "Connect email, WhatsApp, background jobs, and the systems where conversations begin.",
    icon: PlugZap,
  },
  {
    title: "Finance",
    description: "Track invoices and revenue next to the deals and contacts that created them.",
    icon: ReceiptText,
  },
  {
    title: "Imports and Search",
    description: "Bring in CSVs or transcripts, dedupe records, and search the whole workspace quickly.",
    icon: Search,
  },
];

const featureGroups: FeatureGroup[] = [
  {
    title: "Capture",
    kicker: "Less typing, cleaner records",
    description:
      "Start from the way sales teams already work: calls, WhatsApp messages, meeting notes, and quick updates.",
    icon: Sparkles,
    accent: "border-gold/25 bg-gold/10 text-gold",
    features: [
      "Natural-language quick capture",
      "WhatsApp and inbox conversation parsing",
      "Transcript imports for meeting notes",
      "Preview before records are saved",
    ],
  },
  {
    title: "Manage",
    kicker: "Relationships stay organized",
    description:
      "Make every customer, company, deal, task, reminder, and note easy to find when the next move matters.",
    icon: Users,
    accent: "border-emerald-300/25 bg-emerald-300/10 text-emerald-100",
    features: [
      "Contacts and companies",
      "Kanban deal pipeline",
      "Tasks with ownership and priority",
      "Reminders for time-sensitive follow-up",
    ],
  },
  {
    title: "Automate",
    kicker: "The CRM creates momentum",
    description:
      "Use lightweight rules that keep the system proactive without turning setup into an enterprise project.",
    icon: Bot,
    accent: "border-sky-300/25 bg-sky-300/10 text-sky-100",
    features: [
      "Deal-stage automation",
      "Task-completion triggers",
      "Inbound conversation actions",
      "Background job processing",
    ],
  },
  {
    title: "Collaborate",
    kicker: "Everyone sees the same truth",
    description:
      "Give founders, admins, members, and viewers a shared workspace where handoffs are obvious.",
    icon: CheckCircle2,
    accent: "border-rose-300/25 bg-rose-300/10 text-rose-100",
    features: [
      "Team workspace",
      "Role-aware access",
      "Shared activity history",
      "Centralized settings and support",
    ],
  },
  {
    title: "Measure",
    kicker: "Follow-up meets revenue",
    description:
      "Keep commercial outcomes connected to pipeline activity instead of splitting finance into another tool.",
    icon: ReceiptText,
    accent: "border-amber-300/25 bg-amber-300/10 text-amber-100",
    features: [
      "Invoice tracking",
      "Revenue context beside deals",
      "Workbook export",
      "Dashboard signals for active work",
    ],
  },
  {
    title: "Find",
    kicker: "Context comes back fast",
    description:
      "Search across CRM records and imported context so the team can recover details without digging through chat history.",
    icon: Search,
    accent: "border-cyan-300/25 bg-cyan-300/10 text-cyan-100",
    features: [
      "Workspace search",
      "Recent capture history",
      "CSV import previews",
      "Dedupe checks before writing",
    ],
  },
];

const workflowSteps = [
  {
    title: "Conversation arrives",
    description: "A lead comes from WhatsApp, email, a call, or a founder's quick note.",
  },
  {
    title: "AI structures the update",
    description: "The CRM identifies contacts, deal movement, dates, notes, and next actions.",
  },
  {
    title: "Team follows through",
    description: "Tasks, reminders, invoices, and pipeline views keep the promise visible.",
  },
];

const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Invincible CRM",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: "https://invinciblecrm.com/features",
  description,
  featureList: platformModules.map((module) => module.title),
};

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/features",
  },
  keywords: [
    "Invincible CRM features",
    "AI CRM features",
    "CRM feature tour",
    "WhatsApp CRM features",
    "sales CRM features",
  ],
  openGraph: {
    title,
    description,
    url: "/features",
    type: "website",
  },
  twitter: {
    title,
    description,
    card: "summary_large_image",
  },
};

export default function FeaturesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <main className="min-h-screen overflow-hidden bg-[#05070c] text-white">
        <section className="relative overflow-hidden border-b border-white/10 bg-[#05070c]">
          <div className="cinematic-grid opacity-25" />
          <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(5,7,12,0.94)_0%,rgba(8,17,29,0.88)_48%,rgba(23,39,37,0.7)_100%)]" />
          <Image
            src="/captain-bot.png"
            alt="Invincible CRM AI assistant"
            width={700}
            height={700}
            priority
            className="pointer-events-none absolute -right-28 top-14 hidden h-[34rem] w-[34rem] object-contain opacity-20 saturate-125 lg:block"
          />

          <div className="relative z-10 mx-auto max-w-7xl px-5 py-6 lg:px-8 lg:py-8">
            <header className="flex flex-wrap items-center justify-between gap-4">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm font-semibold text-white/60 transition hover:text-gold"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to home
              </Link>

              <div className="flex flex-wrap items-center justify-end gap-2">
                <Link href="/login" className="cinematic-top-link">
                  Sign in
                </Link>
                <Link href="/register" className="cinematic-top-link cinematic-top-link-strong">
                  Start free
                </Link>
              </div>
            </header>

            <div className="max-w-4xl pb-12 pt-16 lg:pb-16 lg:pt-24">
              <div className="inline-flex items-center gap-3 rounded-full border border-gold/15 bg-gold/10 px-4 py-2 text-sm font-semibold text-gold/85">
                <Crown className="h-4 w-4" />
                Invincible CRM feature tour
              </div>

              <h1 className="mt-8 max-w-4xl font-serif text-4xl leading-tight text-white sm:text-5xl lg:text-7xl">
                Invincible CRM feature tour
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/68">
                One shareable view of the full CRM: capture conversations, manage relationships,
                automate follow-up, collaborate with the team, track revenue, and find every detail fast.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href="/register" className="cinematic-enter-button">
                  Try the CRM
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/book-demo"
                  className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/[0.06] px-5 py-3 text-sm font-semibold text-white/80 transition hover:border-white/22 hover:bg-white/[0.1] hover:text-white"
                >
                  Book demo
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap gap-2">
                {["AI capture", "WhatsApp CRM", "Deal pipeline", "Team workspace", "Finance"].map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-semibold text-white/65"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid gap-3 pb-8 sm:grid-cols-2 lg:grid-cols-4">
              {heroStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-[1.5rem] border border-white/10 bg-white/[0.055] p-5 backdrop-blur-xl"
                >
                  <p className="text-3xl font-semibold text-white">{stat.value}</p>
                  <p className="mt-2 text-sm leading-6 text-white/58">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-14 text-ink lg:py-20">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-moss">
                Product map
              </p>
              <h2 className="mt-4 font-serif text-3xl leading-tight text-ink lg:text-5xl">
                Everything a lean sales team needs, visible in one place
              </h2>
              <p className="mt-5 text-base leading-8 text-slate-600">
                The feature tour is built for prospects, team members, and social visitors who need
                to understand the whole product without logging into a workspace first.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {[
                  "Capture lead context",
                  "Track active deals",
                  "Assign follow-up",
                  "Connect channels",
                  "Invite teammates",
                  "Export finance data",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <CheckCircle2 className="h-5 w-5 text-moss" />
                    <span className="text-sm font-semibold text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-[#0b111c] p-5 shadow-2xl shadow-slate-900/15">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.32em] text-gold/60">
                    Command center
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">Today in sales</h3>
                </div>
                <div className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-semibold text-emerald-100">
                  Live workspace
                </div>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
                <div className="space-y-3">
                  {[
                    ["New capture", "Met Priya from Skyline, wants proposal Friday"],
                    ["Deal moved", "BrightPath Studio moved to negotiation"],
                    ["Reminder", "Call Rahul tomorrow at 10 AM"],
                  ].map(([label, text]) => (
                    <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-gold/45">
                        {label}
                      </p>
                      <p className="mt-3 text-sm leading-6 text-white/78">{text}</p>
                    </div>
                  ))}
                </div>

                <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                  {[
                    ["Lead", "18", "text-sky-100", "bg-sky-300/10"],
                    ["Proposal", "9", "text-amber-100", "bg-amber-300/10"],
                    ["Won", "4", "text-emerald-100", "bg-emerald-300/10"],
                  ].map(([stage, count, color, bg]) => (
                    <div key={stage} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-white">{stage}</p>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${bg} ${color}`}>
                          {count}
                        </span>
                      </div>
                      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                        <div className={`h-full rounded-full ${bg}`} style={{ width: `${Number(count) * 5}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#08111c] py-14 lg:py-20">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.34em] text-gold/50">
                  Feature groups
                </p>
                <h2 className="mt-4 max-w-3xl font-serif text-3xl leading-tight text-white lg:text-5xl">
                  Six product stories people can understand in seconds
                </h2>
              </div>
              <p className="max-w-xl text-sm leading-7 text-white/58">
                Each group explains a complete outcome, so the product feels less like a list of
                screens and more like a working sales system.
              </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {featureGroups.map((group) => {
                const Icon = group.icon;

                return (
                  <article
                    key={group.title}
                    className="rounded-[1.75rem] border border-white/10 bg-white/[0.045] p-6 shadow-xl shadow-black/10"
                  >
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${group.accent}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="mt-6 text-sm font-semibold uppercase tracking-[0.22em] text-white/42">
                      {group.kicker}
                    </p>
                    <h3 className="mt-3 text-2xl font-semibold text-white">{group.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-white/58">{group.description}</p>

                    <ul className="mt-6 space-y-3">
                      {group.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3 text-sm leading-6 text-white/72">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-white py-14 text-ink lg:py-20">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-moss">
                Full module list
              </p>
              <h2 className="mt-4 font-serif text-3xl leading-tight text-ink lg:text-5xl">
                Every major workspace area, ready for a product walkthrough
              </h2>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {platformModules.map((module) => {
                const Icon = module.icon;

                return (
                  <article
                    key={module.title}
                    className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 transition hover:border-moss/30 hover:bg-white hover:shadow-soft"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-moss/15 bg-moss/10 text-moss">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-ink">{module.title}</h3>
                        <p className="mt-2 text-sm leading-7 text-slate-600">{module.description}</p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-[#061018] py-14 lg:py-20">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-gold/50">
                Workflow
              </p>
              <h2 className="mt-4 font-serif text-3xl leading-tight text-white lg:text-5xl">
                From conversation to follow-up without dropped context
              </h2>
              <p className="mt-5 text-base leading-8 text-white/60">
                The best product story is simple: every customer signal becomes structured work the
                team can actually complete.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {workflowSteps.map((step, index) => (
                <article
                  key={step.title}
                  className="rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-6"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/20 bg-gold/10 text-sm font-semibold text-gold">
                    {index + 1}
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-white">{step.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/58">{step.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white px-5 py-14 text-ink lg:px-8 lg:py-20">
          <div className="mx-auto max-w-5xl rounded-[2rem] border border-slate-200 bg-slate-50 p-6 text-center lg:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-moss">
              Next move
            </p>
            <h2 className="mx-auto mt-4 max-w-3xl font-serif text-3xl leading-tight text-ink lg:text-5xl">
              Give visitors one page that proves the CRM is more than a dashboard
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-600">
              Share the feature tour, send prospects to a guided demo, or let new users open a
              workspace with the product story already clear.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/book-demo"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#132032] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1d304b]"
              >
                Book a demo
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:border-moss/40 hover:text-moss"
              >
                Start free
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

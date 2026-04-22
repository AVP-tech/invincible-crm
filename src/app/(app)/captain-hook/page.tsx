import { BellRing, Compass, Search, Sparkles } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { CaptainHookDesk } from "@/components/captain-hook-desk";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

const detailCards = [
  {
    title: "Understand what needs attention",
    description:
      "Ask Captain Hook to surface overdue follow-ups, stalled deals, or the next best move before anything slips.",
    icon: BellRing,
  },
  {
    title: "Find buried context quickly",
    description:
      "Use it like a sharp search operator when you remember half the story but need the exact contact, deal, or conversation.",
    icon: Search,
  },
  {
    title: "Save updates without friction",
    description:
      "Tell Captain Hook to create a task, reminder, note, deal, or contact and it routes the update into the CRM for you.",
    icon: Sparkles,
  },
];

export default async function CaptainHookPage() {
  await requireUser();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Captain Hook"
        title="A dedicated desk for your CRM copilot"
        description="Captain Hook lives here now: a focused place to ask questions, surface what matters, and save updates without cluttering the rest of the workspace."
      />

      <div className="grid gap-4 xl:grid-cols-3">
        {detailCards.map((card) => {
          const Icon = card.icon;

          return (
            <Card
              key={card.title}
              className="border-black/5 bg-white dark:border-white/8 dark:bg-white/5"
            >
              <CardContent className="p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gold/10 text-gold">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="mt-4 text-lg font-semibold text-ink dark:text-white">
                  {card.title}
                </h2>
                <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-400">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-gold/10 bg-gold/[0.05] dark:border-gold/10 dark:bg-gold/[0.04]">
        <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-gold">
              <Compass className="h-4 w-4" />
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em]">
                How To Use It
              </p>
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-700 dark:text-slate-300">
              Best results come when you talk to Captain Hook like a teammate:
              ask what needs attention, ask it to find something specific, or
              tell it exactly what you want saved.
            </p>
          </div>
          <div className="rounded-2xl border border-gold/15 bg-white/70 px-4 py-3 text-sm text-slate-700 dark:bg-white/5 dark:text-slate-300">
            Try prompts like:
            <div className="mt-2 space-y-1">
              <p>Show me overdue follow-ups.</p>
              <p>Find everything tied to Rahul.</p>
              <p>Create a reminder for Friday.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <CaptainHookDesk />
    </div>
  );
}

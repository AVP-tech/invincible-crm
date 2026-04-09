import Link from "next/link";
import { ArrowRight, BrainCircuit, CheckCircle2, KanbanSquare, type LucideIcon } from "lucide-react";

const proofPoints = [
  {
    title: "Plain-language capture",
    description: "One sentence becomes contact updates, tasks, notes, and a next step."
  },
  {
    title: "A calm pipeline",
    description: "Track deals without the heavy enterprise clutter that small teams avoid."
  },
  {
    title: "Follow-ups that stay alive",
    description: "Recurring tasks, reminders, and activity history keep the business moving."
  }
];

const featureIcons: Array<{ icon: LucideIcon; label: string }> = [
  { icon: BrainCircuit, label: "Capture" },
  { icon: KanbanSquare, label: "Pipeline" },
  { icon: CheckCircle2, label: "Follow-up" }
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="cinematic-auth-shell min-h-screen">
      <div className="pointer-events-none absolute inset-0">
        <div className="cinematic-orb left-[-8rem] top-[-6rem] h-[22rem] w-[22rem] bg-[#1a3c69]" />
        <div className="cinematic-orb bottom-[-8rem] right-[-8rem] h-[24rem] w-[24rem] bg-[#325b45]" />
        <div className="cinematic-grid opacity-20" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center px-4 py-8 lg:px-8">
        <div className="grid w-full gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="cinematic-auth-panel flex flex-col justify-between rounded-[2.3rem] p-8 text-white lg:p-12">
            <div>
              <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-white/68 transition hover:text-white">
                Invisible CRM
                <ArrowRight className="h-4 w-4" />
              </Link>
              <p className="mt-8 text-xs font-semibold uppercase tracking-[0.35em] text-white/45">Small-business operating system</p>
              <h1 className="mt-5 max-w-xl font-serif text-4xl leading-tight lg:text-6xl">
                Calm enough for non-technical teams. Sharp enough to feel premium.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-white/68">
                Invisible CRM is built for founders, consultants, and micro teams who want the system to move in the
                background while they stay focused on customers.
              </p>
            </div>

            <div className="mt-10 grid gap-4">
              {proofPoints.map((point, index) => (
                <div
                  key={point.title}
                  className="cinematic-auth-float rounded-[1.75rem] border border-white/10 bg-white/[0.05] p-5"
                  style={{ animationDelay: `${index * 120}ms` }}
                >
                  <p className="text-lg font-semibold text-white">{point.title}</p>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-white/62">{point.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {featureIcons.map(({ icon: Icon, label }) => (
                <div key={label} className="rounded-[1.55rem] border border-white/10 bg-black/20 px-4 py-4 text-white/75 backdrop-blur-md">
                  <Icon className="h-5 w-5 text-white/85" />
                  <p className="mt-3 text-sm font-semibold">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center">{children}</div>
        </div>
      </div>
    </div>
  );
}

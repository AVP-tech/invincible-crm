import { requireUser } from "@/lib/auth";
import { AnimatedFlowchart } from "@/components/animated-flowchart";
import { QuickStartGuide } from "@/components/quick-start-guide";
import { PageHeader } from "@/components/ui/page-header";

export default async function GuidePage() {
  await requireUser();

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Guide"
        title="How Invincible CRM Works"
        description="Understand the zero-input AI architecture that replaces 30 clicks with one sentence. Learn to master the Quick Capture workflow and unlock the full power of your workspace."
      />

      {/* ── Section 1: Flowchart ── */}
      <section>
        <div className="mb-6 space-y-1">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Architecture Flowchart
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Watch how your data flows from input to dashboard — powered by AI, not manual entry.
          </p>
        </div>
        <div className="rounded-[2rem] border border-slate-200/50 bg-white/60 p-6 shadow-lg backdrop-blur-xl dark:border-white/8 dark:bg-slate-900/60 md:p-8">
          <AnimatedFlowchart />
        </div>
      </section>

      {/* ── Section 2: Quick Start Guide ── */}
      <section>
        <div className="mb-6 space-y-1">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Quick Start Guide
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Three steps to go from traditional CRM thinking to zero-input productivity.
          </p>
        </div>
        <QuickStartGuide />
      </section>
    </div>
  );
}

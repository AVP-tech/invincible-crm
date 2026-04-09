import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { compactNumber, formatCurrency, formatDueLabel } from "@/lib/utils";
import { getDashboardData } from "@/features/dashboard/service";
import { ActivityList } from "@/components/activity-list";
import { StatCard } from "@/components/stat-card";
import { DealStageBadge, TaskPriorityBadge } from "@/components/status-badges";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { AnimatedStatsGrid } from "@/components/animated-stats-grid";

export default async function DashboardPage() {
  const user = await requireUser();
  const dashboard = await getDashboardData(user.id);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Dashboard"
        title={`Good to see you, ${user.name.split(" ")[0]}`}
        description="Keep a light grip on pipeline health, follow-ups, and the most recent activity without digging through forms."
        actions={
          <Link href="/capture">
            <Button>Capture update</Button>
          </Link>
        }
      />

      {dashboard.stagnantDeals.length > 0 && (
        <div className="flex items-start justify-between gap-4 rounded-3xl border border-[#D15533]/20 bg-[#D15533]/10 p-5 dark:border-[#E86A46]/20 dark:bg-[#E86A46]/10">
          <div className="flex items-start gap-4">
            <div className="mt-0.5 rounded-full bg-[#D15533]/20 p-2 text-[#D15533] dark:bg-[#E86A46]/20 dark:text-[#E86A46]">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-ink">Stagnant pipeline alert</h3>
              <p className="mt-1 text-sm text-[#D15533] dark:text-[#E86A46]/90">
                You have {dashboard.stagnantDeals.length} deal{dashboard.stagnantDeals.length > 1 ? "s" : ""} stuck in late stages for over 7 days without updates.
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-sm text-ink/70">
                {dashboard.stagnantDeals.map((deal) => (
                  <span key={deal.id} className="rounded-xl border border-[#D15533]/20 bg-white/50 px-3 py-1 dark:bg-black/20 text-[#D15533] dark:text-[#E86A46]">
                    {deal.title}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <Link href="/deals" className="shrink-0">
            <Button variant="secondary" className="border border-[#D15533]/20 text-[#D15533] hover:bg-[#D15533] hover:text-white dark:border-[#E86A46]/30 dark:text-[#E86A46] dark:hover:bg-[#E86A46] dark:bg-transparent">
              View pipeline
            </Button>
          </Link>
        </div>
      )}

      <AnimatedStatsGrid className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Open deals" value={dashboard.stats.openDealsCount} hint="Active pipeline excluding won and lost" />
        <StatCard label="Contacts" value={dashboard.stats.contactsCount} hint="People and companies you can act on" />
        <StatCard label="Open tasks" value={dashboard.stats.openTasksCount} hint="Follow-ups still needing attention" />
        <StatCard label="Upcoming follow-ups" value={dashboard.stats.upcomingFollowUpsCount} hint="Next seven days of scheduled activity" />
      </AnimatedStatsGrid>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <div>
              <p className="text-sm font-semibold text-ink">Today’s tasks</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">The follow-ups that should happen before the day closes.</p>
            </div>
            <Link href="/tasks">
              <Button variant="secondary">Open tasks</Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboard.todayTasks.length ? (
              dashboard.todayTasks.map((task) => (
                <div key={task.id} className="rounded-3xl border border-black/5 bg-white p-4 dark:border-white/8 dark:bg-white/5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-ink">{task.title}</p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {task.contact?.name ?? "No linked contact"} {task.deal ? `• ${task.deal.title}` : ""}
                      </p>
                    </div>
                    <TaskPriorityBadge priority={task.priority} />
                  </div>
                  <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{formatDueLabel(task.dueDate)}</p>
                </div>
              ))
            ) : (
              <div className="surface-soft rounded-4xl p-6 text-sm text-slate-600 dark:text-slate-400">
                Nothing is due today. Add a new follow-up or use quick capture to create one from a sentence.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <p className="text-sm font-semibold text-ink">Pipeline snapshot</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">A quick pulse on how opportunities are distributed.</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboard.pipelineSnapshot.map((group) => (
              <div key={group.stage} className="rounded-3xl border border-black/5 bg-white p-4 dark:border-white/8 dark:bg-white/5">
                <div className="flex items-center justify-between gap-4">
                  <DealStageBadge stage={group.stage} />
                  <span className="text-sm font-semibold text-ink">{compactNumber(group._count.stage)}</span>
                </div>
                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                  Value in stage: {formatCurrency(group._sum.amount ?? 0)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <div>
              <p className="text-sm font-semibold text-ink">Upcoming follow-ups</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">What is coming next so no lead goes quiet accidentally.</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboard.upcomingFollowUps.map((task) => (
              <div key={task.id} className="rounded-3xl border border-black/5 bg-white p-4 dark:border-white/8 dark:bg-white/5">
                <p className="font-semibold text-ink">{task.title}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{task.contact?.name ?? "No contact linked"}</p>
                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{formatDueLabel(task.dueDate)}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <p className="text-sm font-semibold text-ink">Recent activity</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">A running pulse of meaningful CRM actions.</p>
            </div>
          </CardHeader>
          <CardContent>
            <ActivityList activities={dashboard.recentActivities} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import Link from "next/link";
import { AlertTriangle, Clock3, RefreshCcw, Repeat2, Target } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { formatDateTime, formatDueLabel } from "@/lib/utils";
import { getRemindersData } from "@/features/reminders/service";
import { DealStageBadge, TaskPriorityBadge, TaskRecurrenceBadge } from "@/components/status-badges";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export default async function RemindersPage() {
  const user = await requireUser();
  const reminders = await getRemindersData(user.id);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Reminders"
        title="Operational follow-up center"
        description="A practical view of what needs attention now: overdue tasks, upcoming commitments, stale deals, and opportunities missing a next step."
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <ReminderSection
          icon={AlertTriangle}
          title="Overdue tasks"
          description="Anything already slipping."
          emptyTitle="No overdue tasks"
          emptyDescription="You’re caught up here."
          items={reminders.overdueTasks.map((task) => ({
            id: task.id,
            href: `/tasks/${task.id}/edit`,
            title: task.title,
            subtitle: `${task.contact?.name ?? "No contact linked"}${task.deal ? ` • ${task.deal.title}` : ""}`,
            meta: formatDueLabel(task.dueDate),
            badge: <TaskPriorityBadge priority={task.priority} />
          }))}
        />

        <ReminderSection
          icon={Clock3}
          title="Upcoming this week"
          description="The next commitments to stay ahead of."
          emptyTitle="No upcoming tasks"
          emptyDescription="Nothing is scheduled in the next seven days."
          items={reminders.upcomingTasks.map((task) => ({
            id: task.id,
            href: `/tasks/${task.id}/edit`,
            title: task.title,
            subtitle: `${task.contact?.name ?? "No contact linked"}${task.deal ? ` • ${task.deal.title}` : ""}`,
            meta: formatDueLabel(task.dueDate),
            badge: <TaskPriorityBadge priority={task.priority} />
          }))}
        />

        <ReminderSection
          icon={Repeat2}
          title="Recurring follow-up systems"
          description="Cadences that keep relationships warm without relying on memory."
          emptyTitle="No recurring follow-ups yet"
          emptyDescription="Turn a task into a repeating follow-up when you want the next one to auto-schedule."
          items={reminders.recurringTasks.map((task) => ({
            id: task.id,
            href: `/tasks/${task.id}/edit`,
            title: task.title,
            subtitle: `${task.contact?.name ?? "No contact linked"}${task.deal ? ` • ${task.deal.title}` : ""}`,
            meta: formatDueLabel(task.dueDate),
            badge: <TaskRecurrenceBadge pattern={task.recurrencePattern} intervalDays={task.recurrenceIntervalDays} />
          }))}
        />

        <ReminderSection
          icon={RefreshCcw}
          title="Stale deals"
          description="Open opportunities that have gone quiet for more than a week."
          emptyTitle="No stale deals"
          emptyDescription="Your active deals have recent movement."
          items={reminders.staleDeals.map((deal) => ({
            id: deal.id,
            href: `/deals/${deal.id}`,
            title: deal.title,
            subtitle: `${deal.contact?.name ?? deal.company?.name ?? "No linked contact"} • Updated ${formatDateTime(deal.updatedAt)}`,
            meta: deal.nextStep ?? "No next step set",
            badge: <DealStageBadge stage={deal.stage} />
          }))}
        />

        <ReminderSection
          icon={Target}
          title="Deals missing next step"
          description="Opportunities that need a clear commitment to keep momentum."
          emptyTitle="All active deals have a next step"
          emptyDescription="Nice. Nothing is floating without ownership."
          items={reminders.dealsWithoutNextStep.map((deal) => ({
            id: deal.id,
            href: `/deals/${deal.id}/edit`,
            title: deal.title,
            subtitle: deal.contact?.name ?? deal.company?.name ?? "No linked contact",
            meta: "Add a next step and due context",
            badge: <DealStageBadge stage={deal.stage} />
          }))}
        />
      </div>
    </div>
  );
}

function ReminderSection({
  icon: Icon,
  title,
  description,
  emptyTitle,
  emptyDescription,
  items
}: {
  icon: typeof AlertTriangle;
  title: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
  items: { id: string; href: string; title: string; subtitle: string; meta: string; badge: React.ReactNode }[];
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-moss/10 p-2 text-moss">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-ink">{title}</p>
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length ? (
          items.map((item) => (
            <Link key={item.id} href={item.href} className="block rounded-3xl border border-black/5 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-ink">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{item.subtitle}</p>
                  <p className="mt-3 text-sm text-slate-600">{item.meta}</p>
                </div>
                {item.badge}
              </div>
            </Link>
          ))
        ) : (
          <EmptyState title={emptyTitle} description={emptyDescription} />
        )}
      </CardContent>
    </Card>
  );
}

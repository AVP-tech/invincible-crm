import { ConversationSource, DealStage, IntegrationStatus, JobStatus, TaskPriority, TaskRecurrencePattern, TaskStatus } from "@prisma/client";
import { conversationSourceMeta, dealStageMeta, taskPriorityMeta, taskStatusMeta } from "@/lib/domain";
import { formatTaskRecurrence } from "@/features/tasks/recurrence";
import { Badge } from "@/components/ui/badge";

export function DealStageBadge({ stage }: { stage: DealStage }) {
  const meta = dealStageMeta[stage];

  return <Badge className={meta.tone}>{meta.label}</Badge>;
}

export function TaskPriorityBadge({ priority }: { priority: TaskPriority }) {
  return <Badge className={taskPriorityMeta[priority]}>{priority}</Badge>;
}

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  return <Badge className={taskStatusMeta[status]}>{status}</Badge>;
}

export function TaskRecurrenceBadge({
  pattern,
  intervalDays
}: {
  pattern: TaskRecurrencePattern;
  intervalDays?: number | null;
}) {
  const label = formatTaskRecurrence(pattern, intervalDays);

  if (!label) return null;

  return <Badge className="bg-violet-100 text-violet-700">{label}</Badge>;
}

export function ConversationSourceBadge({ source }: { source: ConversationSource }) {
  const meta = conversationSourceMeta[source];

  return <Badge className={meta.tone}>{meta.label}</Badge>;
}

const integrationStatusMeta: Record<IntegrationStatus, { label: string; tone: string }> = {
  CONNECTED: {
    label: "Connected",
    tone: "bg-emerald-100 text-emerald-700"
  },
  NEEDS_ATTENTION: {
    label: "Needs Attention",
    tone: "bg-amber-100 text-amber-800"
  },
  DISCONNECTED: {
    label: "Disconnected",
    tone: "bg-slate-100 text-slate-700"
  }
};

const jobStatusMeta: Record<JobStatus, { label: string; tone: string }> = {
  QUEUED: {
    label: "Queued",
    tone: "bg-sky-100 text-sky-700"
  },
  RUNNING: {
    label: "Running",
    tone: "bg-violet-100 text-violet-700"
  },
  SUCCEEDED: {
    label: "Succeeded",
    tone: "bg-emerald-100 text-emerald-700"
  },
  FAILED: {
    label: "Failed",
    tone: "bg-rose-100 text-rose-700"
  }
};

export function IntegrationStatusBadge({ status }: { status: IntegrationStatus | string }) {
  const meta = integrationStatusMeta[status as IntegrationStatus] ?? integrationStatusMeta.DISCONNECTED;

  return <Badge className={meta.tone}>{meta.label}</Badge>;
}

export function JobStatusBadge({ status }: { status: JobStatus | string }) {
  const meta = jobStatusMeta[status as JobStatus] ?? jobStatusMeta.QUEUED;

  return <Badge className={meta.tone}>{meta.label}</Badge>;
}

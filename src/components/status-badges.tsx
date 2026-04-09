import { ConversationSource, DealStage, TaskPriority, TaskRecurrencePattern, TaskStatus } from "@prisma/client";
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

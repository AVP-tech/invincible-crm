import { ActivityType, ConversationSource, DealStage, TaskPriority, TaskStatus } from "@prisma/client";

export const dealStageMeta: Record<
  DealStage,
  { label: string; tone: string; description: string }
> = {
  NEW_LEAD: {
    label: "New Lead",
    tone: "bg-slate-100 text-slate-700 dark:bg-slate-400/15 dark:text-slate-200",
    description: "Fresh inbound or outbound lead"
  },
  CONTACTED: {
    label: "Contacted",
    tone: "bg-sky-100 text-sky-700 dark:bg-sky-400/15 dark:text-sky-300",
    description: "First outreach has happened"
  },
  QUALIFIED: {
    label: "Qualified",
    tone: "bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-300",
    description: "The lead is worth pursuing"
  },
  PROPOSAL_SENT: {
    label: "Proposal Sent",
    tone: "bg-orange-100 text-orange-700 dark:bg-orange-400/15 dark:text-orange-300",
    description: "Commercial proposal shared"
  },
  NEGOTIATION: {
    label: "Negotiation",
    tone: "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-400/15 dark:text-fuchsia-300",
    description: "Working through details and pricing"
  },
  WON: {
    label: "Won",
    tone: "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300",
    description: "The deal is closed won"
  },
  LOST: {
    label: "Lost",
    tone: "bg-rose-100 text-rose-700 dark:bg-rose-400/15 dark:text-rose-300",
    description: "Not moving forward for now"
  }
};

export const taskPriorityMeta: Record<TaskPriority, string> = {
  LOW: "bg-slate-100 text-slate-700 dark:bg-slate-400/15 dark:text-slate-200",
  MEDIUM: "bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-300",
  HIGH: "bg-rose-100 text-rose-700 dark:bg-rose-400/15 dark:text-rose-300"
};

export const taskStatusMeta: Record<TaskStatus, string> = {
  OPEN: "bg-sky-100 text-sky-700 dark:bg-sky-400/15 dark:text-sky-300",
  COMPLETED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300"
};

export const conversationSourceMeta: Record<ConversationSource, { label: string; tone: string }> = {
  WHATSAPP: {
    label: "WhatsApp",
    tone: "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300"
  },
  EMAIL: {
    label: "Email",
    tone: "bg-sky-100 text-sky-700 dark:bg-sky-400/15 dark:text-sky-300"
  },
  MANUAL: {
    label: "Manual",
    tone: "bg-slate-100 text-slate-700 dark:bg-slate-400/15 dark:text-slate-200"
  }
};

export const activityTypeCopy: Record<ActivityType, string> = {
  CONTACT_CREATED: "Contact created",
  CONTACT_UPDATED: "Contact updated",
  CONTACT_DELETED: "Contact deleted",
  DEAL_CREATED: "Deal created",
  DEAL_UPDATED: "Deal updated",
  DEAL_STAGE_CHANGED: "Deal stage changed",
  DEAL_DELETED: "Deal deleted",
  TASK_CREATED: "Task created",
  TASK_UPDATED: "Task updated",
  TASK_COMPLETED: "Task completed",
  TASK_DELETED: "Task deleted",
  TASK_RECURRING_SCHEDULED: "Recurring follow-up scheduled",
  NOTE_ADDED: "Note added",
  CAPTURE_APPLIED: "Quick capture applied",
  CONVERSATION_CAPTURED: "Conversation captured",
  TEAM_MEMBER_ADDED: "Team member added",
  INTEGRATION_SYNCED: "Integration synced",
  AUTOMATION_TRIGGERED: "Automation triggered",
  INVOICE_SYNCED: "Invoice synced",
  USER_ONBOARDED: "Workspace activated"
};

import { ActivityType, AutomationActionType, AutomationTriggerType, Prisma, TaskPriority } from "@prisma/client";
import { addDays } from "date-fns";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { type AutomationRuleInput } from "@/lib/schemas";

type AutomationContext = {
  workspaceId: string;
  workspaceOwnerId: string;
  triggerType: AutomationTriggerType;
  deal?: {
    id: string;
    title: string;
    stage?: string;
    contactId?: string | null;
    assignedToUserId?: string | null;
  };
  task?: {
    id: string;
    title: string;
    contactId?: string | null;
    dealId?: string | null;
    assignedToUserId?: string | null;
  };
  conversation?: {
    id: string;
    summary: string;
    contactId?: string | null;
    dealId?: string | null;
  };
  contact?: {
    id: string;
    name: string;
  };
};

function renderTemplate(template: string | undefined, context: Record<string, string | undefined>) {
  if (!template) return "";

  return template.replace(/{{\s*([^}]+)\s*}}/g, (_, token) => context[token.trim()] ?? "");
}

function buildTemplateContext(context: AutomationContext) {
  return {
    "deal.title": context.deal?.title,
    "deal.stage": context.deal?.stage,
    "task.title": context.task?.title,
    "conversation.summary": context.conversation?.summary,
    "contact.name": context.contact?.name
  };
}

export async function listAutomationRules(workspaceId: string) {
  return db.automationRule.findMany({
    where: { workspaceId },
    orderBy: {
      createdAt: "desc"
    }
  });
}

export async function createAutomationRule(workspaceId: string, createdByUserId: string, input: AutomationRuleInput) {
  const triggerConfig: Prisma.InputJsonValue | undefined =
    input.triggerType === AutomationTriggerType.DEAL_STAGE_CHANGED ? { stage: input.triggerStage } : undefined;
  const actionConfig: Prisma.InputJsonValue =
    input.actionType === AutomationActionType.CREATE_TASK
      ? {
          taskTitle: input.taskTitle,
          taskDescription: input.taskDescription,
          dueInDays: input.dueInDays ?? 1,
          priority: input.priority
        }
      : {
          noteContent: input.noteContent
        };

  return db.automationRule.create({
    data: {
      workspaceId,
      createdByUserId,
      name: input.name,
      isActive: input.isActive,
      triggerType: input.triggerType,
      triggerConfig,
      actionType: input.actionType,
      actionConfig
    }
  });
}

export async function deleteAutomationRule(workspaceId: string, ruleId: string) {
  const rule = await db.automationRule.findFirst({
    where: {
      id: ruleId,
      workspaceId
    }
  });

  if (!rule) return null;

  await db.automationRule.delete({
    where: {
      id: ruleId
    }
  });

  return rule;
}

export async function runAutomationTrigger(context: AutomationContext) {
  const rules = await db.automationRule.findMany({
    where: {
      workspaceId: context.workspaceId,
      isActive: true,
      triggerType: context.triggerType
    }
  });

  const templateContext = buildTemplateContext(context);

  for (const rule of rules) {
    const triggerConfig = (rule.triggerConfig as { stage?: string } | null) ?? null;

    if (
      context.triggerType === AutomationTriggerType.DEAL_STAGE_CHANGED &&
      triggerConfig?.stage &&
      triggerConfig.stage !== context.deal?.stage
    ) {
      continue;
    }

    const actionConfig = (rule.actionConfig as {
      taskTitle?: string;
      taskDescription?: string;
      dueInDays?: number;
      priority?: TaskPriority;
      noteContent?: string;
    }) ?? { dueInDays: 1 };

    if (rule.actionType === AutomationActionType.CREATE_TASK && actionConfig.taskTitle) {
      const task = await db.task.create({
        data: {
          userId: context.workspaceOwnerId,
          workspaceId: context.workspaceId,
          contactId: context.contact?.id ?? context.deal?.contactId ?? context.task?.contactId ?? context.conversation?.contactId ?? undefined,
          dealId: context.deal?.id ?? context.task?.dealId ?? context.conversation?.dealId ?? undefined,
          assignedToUserId: context.deal?.assignedToUserId ?? context.task?.assignedToUserId ?? undefined,
          title: renderTemplate(actionConfig.taskTitle, templateContext),
          description: renderTemplate(actionConfig.taskDescription, templateContext) || undefined,
          dueDate: addDays(new Date(), actionConfig.dueInDays ?? 1),
          priority: actionConfig.priority ?? TaskPriority.MEDIUM
        }
      });

      await logActivity({
        userId: context.workspaceOwnerId,
        workspaceId: context.workspaceId,
        type: ActivityType.AUTOMATION_TRIGGERED,
        title: `Automation ran: ${rule.name}`,
        description: `Created task: ${task.title}`,
        entityType: "task",
        entityId: task.id,
        contactId: task.contactId,
        dealId: task.dealId,
        taskId: task.id,
        metadata: {
          ruleId: rule.id,
          triggerType: rule.triggerType
        }
      });
    }

    if (rule.actionType === AutomationActionType.ADD_NOTE && actionConfig.noteContent) {
      const note = await db.note.create({
        data: {
          userId: context.workspaceOwnerId,
          workspaceId: context.workspaceId,
          contactId: context.contact?.id ?? context.deal?.contactId ?? context.task?.contactId ?? context.conversation?.contactId ?? undefined,
          dealId: context.deal?.id ?? context.task?.dealId ?? context.conversation?.dealId ?? undefined,
          source: "automation",
          content: renderTemplate(actionConfig.noteContent, templateContext)
        }
      });

      await logActivity({
        userId: context.workspaceOwnerId,
        workspaceId: context.workspaceId,
        type: ActivityType.AUTOMATION_TRIGGERED,
        title: `Automation ran: ${rule.name}`,
        description: "Added an automation note",
        entityType: "note",
        entityId: note.id,
        contactId: note.contactId,
        dealId: note.dealId,
        noteId: note.id,
        metadata: {
          ruleId: rule.id,
          triggerType: rule.triggerType
        }
      });
    }
  }
}

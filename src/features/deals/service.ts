import { ActivityType, DealStage } from "@prisma/client";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { type DealInput } from "@/lib/schemas";
import { serializeDateInput } from "@/lib/utils";
import { runAutomationTrigger } from "@/features/automations/service";

async function resolveCompany(workspaceId: string, userId: string, companyName?: string) {
  if (!companyName) return null;

  return db.company.upsert({
    where: {
      workspaceId_name: {
        workspaceId,
        name: companyName
      }
    },
    update: {},
    create: {
      userId,
      workspaceId,
      name: companyName
    }
  });
}

export async function listDeals(workspaceId: string) {
  return db.deal.findMany({
    where: { workspaceId },
    include: {
      contact: true,
      company: true,
      assignee: true,
      tasks: true
    },
    orderBy: {
      updatedAt: "desc"
    }
  });
}

export async function getDeal(workspaceId: string, dealId: string) {
  return db.deal.findFirst({
    where: {
      id: dealId,
      workspaceId
    },
    include: {
      contact: true,
      company: true,
      assignee: true,
      tasks: {
        orderBy: {
          dueDate: "asc"
        }
      },
      notes: {
        orderBy: {
          createdAt: "desc"
        }
      },
      activities: {
        orderBy: {
          createdAt: "desc"
        },
        take: 20
      }
    }
  });
}

export async function createDeal(workspaceId: string, userId: string, input: DealInput) {
  const company = await resolveCompany(workspaceId, userId, input.companyName);

  const deal = await db.deal.create({
    data: {
      userId,
      workspaceId,
      title: input.title,
      description: input.description,
      stage: input.stage,
      amount: input.amount ? Math.round(input.amount) : undefined,
      currency: input.currency || "INR",
      expectedCloseDate: input.expectedCloseDate ? new Date(serializeDateInput(input.expectedCloseDate)!) : undefined,
      nextStep: input.nextStep,
      contactId: input.contactId,
      assignedToUserId: input.assignedToUserId,
      companyId: company?.id
    },
    include: {
      contact: true,
      company: true,
      assignee: true
    }
  });

  await logActivity({
    userId,
    workspaceId,
    type: ActivityType.DEAL_CREATED,
    title: `Created deal: ${deal.title}`,
    description: deal.nextStep ?? undefined,
    entityType: "deal",
    entityId: deal.id,
    contactId: deal.contactId,
    dealId: deal.id
  });

  return deal;
}

export async function updateDeal(workspaceId: string, userId: string, dealId: string, input: DealInput) {
  const existing = await db.deal.findFirst({
    where: {
      id: dealId,
      workspaceId
    },
    select: {
      id: true
    }
  });

  if (!existing) {
    return null;
  }

  const company = await resolveCompany(workspaceId, userId, input.companyName);

  const deal = await db.deal.update({
    where: { id: existing.id },
    data: {
      title: input.title,
      description: input.description,
      stage: input.stage,
      amount: input.amount ? Math.round(input.amount) : undefined,
      currency: input.currency || "INR",
      expectedCloseDate: input.expectedCloseDate ? new Date(serializeDateInput(input.expectedCloseDate)!) : null,
      nextStep: input.nextStep,
      contactId: input.contactId,
      assignedToUserId: input.assignedToUserId,
      companyId: company?.id ?? null
    },
    include: {
      contact: true,
      company: true,
      assignee: true
    }
  });

  await logActivity({
    userId,
    workspaceId,
    type: ActivityType.DEAL_UPDATED,
    title: `Updated deal: ${deal.title}`,
    entityType: "deal",
    entityId: deal.id,
    contactId: deal.contactId,
    dealId: deal.id
  });

  return deal;
}

export async function moveDealStage(workspaceId: string, userId: string, dealId: string, stage: DealStage) {
  const existing = await db.deal.findFirst({
    where: {
      id: dealId,
      workspaceId
    },
    select: {
      id: true
    }
  });

  if (!existing) {
    return null;
  }

  const deal = await db.deal.update({
    where: { id: existing.id },
    data: { stage },
    include: {
      contact: true
    }
  });

  await logActivity({
    userId,
    workspaceId,
    type: ActivityType.DEAL_STAGE_CHANGED,
    title: `${deal.title} moved to ${stage.replaceAll("_", " ")}`,
    entityType: "deal",
    entityId: deal.id,
    contactId: deal.contactId,
    dealId: deal.id
  });

  await runAutomationTrigger({
    workspaceId,
    workspaceOwnerId: userId,
    triggerType: "DEAL_STAGE_CHANGED",
    deal: {
      id: deal.id,
      title: deal.title,
      stage: deal.stage,
      contactId: deal.contactId,
      assignedToUserId: deal.assignedToUserId
    },
    contact: deal.contact
      ? {
          id: deal.contact.id,
          name: deal.contact.name
        }
      : undefined
  });

  return deal;
}

export async function deleteDeal(workspaceId: string, userId: string, dealId: string) {
  const deal = await db.deal.findFirst({
    where: {
      id: dealId,
      workspaceId
    }
  });

  if (!deal) return null;

  await db.deal.delete({
    where: {
      id: dealId
    }
  });

  await logActivity({
    userId,
    workspaceId,
    type: ActivityType.DEAL_DELETED,
    title: `Removed deal: ${deal.title}`,
    entityType: "deal",
    entityId: dealId,
    contactId: deal.contactId
  });

  return deal;
}

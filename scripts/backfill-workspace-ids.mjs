import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function chooseWorkspaceId(userId, ownerWorkspaceByUserId, membershipWorkspaceByUserId) {
  return ownerWorkspaceByUserId.get(userId) ?? membershipWorkspaceByUserId.get(userId) ?? null;
}

async function backfillModel(modelName, findMany, update, ownerWorkspaceByUserId, membershipWorkspaceByUserId) {
  const records = await findMany();
  let updatedCount = 0;

  for (const record of records) {
    const workspaceId = chooseWorkspaceId(record.userId, ownerWorkspaceByUserId, membershipWorkspaceByUserId);

    if (!workspaceId) {
      console.warn(`[workspace-backfill] Skipped ${modelName} ${record.id}: no workspace found for user ${record.userId}`);
      continue;
    }

    await update(record.id, workspaceId);
    updatedCount += 1;
  }

  return updatedCount;
}

async function main() {
  const [workspaces, memberships] = await Promise.all([
    prisma.workspace.findMany({
      select: {
        id: true,
        ownerUserId: true
      }
    }),
    prisma.workspaceMembership.findMany({
      orderBy: {
        createdAt: "asc"
      },
      select: {
        workspaceId: true,
        userId: true
      }
    })
  ]);

  const ownerWorkspaceByUserId = new Map(workspaces.map((workspace) => [workspace.ownerUserId, workspace.id]));
  const membershipWorkspaceByUserId = new Map();

  for (const membership of memberships) {
    if (!membershipWorkspaceByUserId.has(membership.userId)) {
      membershipWorkspaceByUserId.set(membership.userId, membership.workspaceId);
    }
  }

  const results = await Promise.all([
    backfillModel(
      "Company",
      () => prisma.company.findMany({ where: { workspaceId: null }, select: { id: true, userId: true } }),
      (id, workspaceId) => prisma.company.update({ where: { id }, data: { workspaceId } }),
      ownerWorkspaceByUserId,
      membershipWorkspaceByUserId
    ),
    backfillModel(
      "Contact",
      () => prisma.contact.findMany({ where: { workspaceId: null }, select: { id: true, userId: true } }),
      (id, workspaceId) => prisma.contact.update({ where: { id }, data: { workspaceId } }),
      ownerWorkspaceByUserId,
      membershipWorkspaceByUserId
    ),
    backfillModel(
      "Deal",
      () => prisma.deal.findMany({ where: { workspaceId: null }, select: { id: true, userId: true } }),
      (id, workspaceId) => prisma.deal.update({ where: { id }, data: { workspaceId } }),
      ownerWorkspaceByUserId,
      membershipWorkspaceByUserId
    ),
    backfillModel(
      "Task",
      () => prisma.task.findMany({ where: { workspaceId: null }, select: { id: true, userId: true } }),
      (id, workspaceId) => prisma.task.update({ where: { id }, data: { workspaceId } }),
      ownerWorkspaceByUserId,
      membershipWorkspaceByUserId
    ),
    backfillModel(
      "Note",
      () => prisma.note.findMany({ where: { workspaceId: null }, select: { id: true, userId: true } }),
      (id, workspaceId) => prisma.note.update({ where: { id }, data: { workspaceId } }),
      ownerWorkspaceByUserId,
      membershipWorkspaceByUserId
    ),
    backfillModel(
      "Activity",
      () => prisma.activity.findMany({ where: { workspaceId: null }, select: { id: true, userId: true } }),
      (id, workspaceId) => prisma.activity.update({ where: { id }, data: { workspaceId } }),
      ownerWorkspaceByUserId,
      membershipWorkspaceByUserId
    ),
    backfillModel(
      "ParsedCapture",
      () => prisma.parsedCapture.findMany({ where: { workspaceId: null }, select: { id: true, userId: true } }),
      (id, workspaceId) => prisma.parsedCapture.update({ where: { id }, data: { workspaceId } }),
      ownerWorkspaceByUserId,
      membershipWorkspaceByUserId
    ),
    backfillModel(
      "ConversationLog",
      () => prisma.conversationLog.findMany({ where: { workspaceId: null }, select: { id: true, userId: true } }),
      (id, workspaceId) => prisma.conversationLog.update({ where: { id }, data: { workspaceId } }),
      ownerWorkspaceByUserId,
      membershipWorkspaceByUserId
    )
  ]);

  const totalUpdated = results.reduce((sum, count) => sum + count, 0);
  console.log(`[workspace-backfill] Updated ${totalUpdated} records.`);
}

main()
  .catch((error) => {
    console.error("[workspace-backfill] Failed.", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { DealStage, TaskStatus } from "@prisma/client";
import { addDays, startOfDay } from "date-fns";
import { db } from "@/lib/db";

export async function getDashboardData(userId: string) {
  const today = startOfDay(new Date());
  const weekAhead = addDays(today, 7);

  const [openDealsCount, contactsCount, openTasksCount, todayTasks, upcomingFollowUps, recentActivities, pipelineSnapshot, stagnantDeals] =
    await Promise.all([
      db.deal.count({
        where: {
          userId,
          stage: {
            notIn: [DealStage.WON, DealStage.LOST]
          }
        }
      }),
      db.contact.count({
        where: { userId }
      }),
      db.task.count({
        where: {
          userId,
          status: TaskStatus.OPEN
        }
      }),
      db.task.findMany({
        where: {
          userId,
          status: TaskStatus.OPEN,
          dueDate: {
            gte: today,
            lt: addDays(today, 1)
          }
        },
        include: {
          contact: true,
          deal: true
        },
        orderBy: {
          dueDate: "asc"
        },
        take: 6
      }),
      db.task.findMany({
        where: {
          userId,
          status: TaskStatus.OPEN,
          dueDate: {
            gte: today,
            lte: weekAhead
          }
        },
        include: {
          contact: true,
          deal: true
        },
        orderBy: {
          dueDate: "asc"
        },
        take: 6
      }),
      db.activity.findMany({
        where: { userId },
        orderBy: {
          createdAt: "desc"
        },
        take: 8
      }),
      db.deal.groupBy({
        by: ["stage"],
        where: {
          userId
        },
        _count: {
          stage: true
        },
        _sum: {
          amount: true
        }
      }),
      db.deal.findMany({
        where: {
          userId,
          stage: {
            in: [DealStage.PROPOSAL_SENT, DealStage.NEGOTIATION]
          },
          updatedAt: {
            lt: addDays(new Date(), -7)
          }
        },
        include: {
          contact: true
        },
        take: 3
      })
    ]);

  return {
    stats: {
      openDealsCount,
      contactsCount,
      openTasksCount,
      upcomingFollowUpsCount: upcomingFollowUps.length
    },
    todayTasks,
    upcomingFollowUps,
    recentActivities,
    pipelineSnapshot,
    stagnantDeals
  };
}

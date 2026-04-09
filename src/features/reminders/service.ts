import { DealStage, TaskRecurrencePattern, TaskStatus } from "@prisma/client";
import { addDays, subDays, startOfDay } from "date-fns";
import { db } from "@/lib/db";

export async function getRemindersData(userId: string) {
  const today = startOfDay(new Date());
  const nextWeek = addDays(today, 7);
  const staleThreshold = subDays(today, 7);

  const [overdueTasks, upcomingTasks, recurringTasks, staleDeals, dealsWithoutNextStep] = await Promise.all([
    db.task.findMany({
      where: {
        userId,
        status: TaskStatus.OPEN,
        dueDate: {
          lt: today
        }
      },
      include: {
        contact: true,
        deal: true
      },
      orderBy: {
        dueDate: "asc"
      }
    }),
    db.task.findMany({
      where: {
        userId,
        status: TaskStatus.OPEN,
        dueDate: {
          gte: today,
          lte: nextWeek
        }
      },
      include: {
        contact: true,
        deal: true
      },
      orderBy: {
        dueDate: "asc"
      }
    }),
    db.task.findMany({
      where: {
        userId,
        status: TaskStatus.OPEN,
        recurrencePattern: {
          not: TaskRecurrencePattern.NONE
        }
      },
      include: {
        contact: true,
        deal: true
      },
      orderBy: {
        dueDate: "asc"
      },
      take: 8
    }),
    db.deal.findMany({
      where: {
        userId,
        stage: {
          notIn: [DealStage.WON, DealStage.LOST]
        },
        updatedAt: {
          lt: staleThreshold
        }
      },
      include: {
        contact: true,
        company: true
      },
      orderBy: {
        updatedAt: "asc"
      }
    }),
    db.deal.findMany({
      where: {
        userId,
        stage: {
          notIn: [DealStage.WON, DealStage.LOST]
        },
        OR: [{ nextStep: null }, { nextStep: "" }]
      },
      include: {
        contact: true,
        company: true
      },
      orderBy: {
        updatedAt: "asc"
      }
    })
  ]);

  return {
    overdueTasks,
    upcomingTasks,
    recurringTasks,
    staleDeals,
    dealsWithoutNextStep
  };
}

import { db } from "@/lib/db";

export async function globalSearch(userId: string, query: string) {
  const trimmed = query.trim();

  if (!trimmed) {
    return {
      contacts: [],
      deals: [],
      tasks: [],
      conversations: []
    };
  }

  const [contacts, deals, tasks, conversations] = await Promise.all([
    db.contact.findMany({
      where: {
        userId,
        OR: [{ name: { contains: trimmed } }, { email: { contains: trimmed } }, { phone: { contains: trimmed } }]
      },
      include: { company: true },
      take: 10,
      orderBy: {
        updatedAt: "desc"
      }
    }),
    db.deal.findMany({
      where: {
        userId,
        OR: [{ title: { contains: trimmed } }, { description: { contains: trimmed } }, { nextStep: { contains: trimmed } }]
      },
      include: { contact: true },
      take: 10,
      orderBy: {
        updatedAt: "desc"
      }
    }),
    db.task.findMany({
      where: {
        userId,
        OR: [{ title: { contains: trimmed } }, { description: { contains: trimmed } }]
      },
      include: { contact: true, deal: true },
      take: 10,
      orderBy: {
        updatedAt: "desc"
      }
    }),
    db.conversationLog.findMany({
      where: {
        userId,
        OR: [
          { subject: { contains: trimmed } },
          { participantLabel: { contains: trimmed } },
          { summary: { contains: trimmed } },
          { rawText: { contains: trimmed } }
        ]
      },
      include: { contact: true, deal: true },
      take: 10,
      orderBy: {
        createdAt: "desc"
      }
    })
  ]);

  return { contacts, deals, tasks, conversations };
}

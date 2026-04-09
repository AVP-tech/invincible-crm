import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const user = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";

  // If query is too short, return empty
  if (query.trim().length === 0) {
    return NextResponse.json({ contacts: [], deals: [], tasks: [] });
  }

  // Search across three tables concurrently
  const [contacts, deals, tasks] = await Promise.all([
    db.contact.findMany({
      where: {
        userId: user.id,
        OR: [
          { name: { contains: query } },
          { email: { contains: query } },
          { company: { name: { contains: query } } }
        ]
      },
      include: {
        company: { select: { name: true } }
      },
      take: 5
    }),
    db.deal.findMany({
      where: {
        userId: user.id,
        title: { contains: query }
      },
      include: {
        contact: { select: { name: true } }
      },
      take: 5
    }),
    db.task.findMany({
      where: {
        userId: user.id,
        title: { contains: query }
      },
      take: 5
    })
  ]);

  return NextResponse.json({
    contacts,
    deals,
    tasks
  });
}

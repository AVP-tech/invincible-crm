import { ActivityType } from "@prisma/client";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { type InvoiceInput } from "@/lib/schemas";
import { serializeDateInput } from "@/lib/utils";

export async function listInvoices(workspaceId: string) {
  return db.invoice.findMany({
    where: {
      workspaceId
    },
    include: {
      contact: true,
      deal: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });
}

export async function createInvoice(workspaceId: string, workspaceOwnerId: string, input: InvoiceInput) {
  const invoice = await db.invoice.create({
    data: {
      workspaceId,
      number: input.number,
      clientName: input.clientName,
      contactId: input.contactId,
      dealId: input.dealId,
      amount: Math.round(input.amount),
      currency: input.currency || "INR",
      status: input.status,
      issueDate: input.issueDate ? new Date(serializeDateInput(input.issueDate)!) : new Date(),
      dueDate: input.dueDate ? new Date(serializeDateInput(input.dueDate)!) : undefined,
      notes: input.notes
    },
    include: {
      contact: true,
      deal: true
    }
  });

  await logActivity({
    userId: workspaceOwnerId,
    type: ActivityType.INVOICE_SYNCED,
    title: `Tracked invoice: ${invoice.number}`,
    description: `${invoice.clientName} • ${invoice.amount} ${invoice.currency}`,
    entityType: "note",
    entityId: invoice.id,
    contactId: invoice.contactId,
    dealId: invoice.dealId
  });

  return invoice;
}

export async function deleteInvoice(workspaceId: string, invoiceId: string) {
  const invoice = await db.invoice.findFirst({
    where: {
      id: invoiceId,
      workspaceId
    }
  });

  if (!invoice) return null;

  await db.invoice.delete({
    where: {
      id: invoiceId
    }
  });

  return invoice;
}

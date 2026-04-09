import * as XLSX from "xlsx";
import { getApiUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { jsonError } from "@/lib/http";

export async function GET() {
  const user = await getApiUser();

  if (!user) {
    return jsonError("Unauthorized", 401);
  }

  const [contacts, deals, tasks, invoices] = await Promise.all([
    db.contact.findMany({
      where: { userId: user.workspaceOwnerId },
      include: { company: true }
    }),
    db.deal.findMany({
      where: { userId: user.workspaceOwnerId },
      include: { contact: true, assignee: true, company: true }
    }),
    db.task.findMany({
      where: { userId: user.workspaceOwnerId },
      include: { contact: true, deal: true, assignee: true }
    }),
    db.invoice.findMany({
      where: { workspaceId: user.workspaceId },
      include: { contact: true, deal: true }
    })
  ]);

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(
      contacts.map((contact) => ({
        Name: contact.name,
        Company: contact.company?.name ?? "",
        Email: contact.email ?? "",
        Phone: contact.phone ?? "",
        Source: contact.source ?? ""
      }))
    ),
    "Contacts"
  );

  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(
      deals.map((deal) => ({
        Title: deal.title,
        Stage: deal.stage,
        Amount: deal.amount ?? "",
        Currency: deal.currency,
        Contact: deal.contact?.name ?? "",
        Company: deal.company?.name ?? "",
        Owner: deal.assignee?.name ?? "",
        "Expected Close": formatDate(deal.expectedCloseDate),
        "Next Step": deal.nextStep ?? ""
      }))
    ),
    "Deals"
  );

  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(
      tasks.map((task) => ({
        Title: task.title,
        Status: task.status,
        Priority: task.priority,
        Due: formatDate(task.dueDate),
        Contact: task.contact?.name ?? "",
        Deal: task.deal?.title ?? "",
        Owner: task.assignee?.name ?? "",
        Recurrence: task.recurrencePattern
      }))
    ),
    "Tasks"
  );

  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(
      invoices.map((invoice) => ({
        Number: invoice.number,
        Client: invoice.clientName,
        Amount: invoice.amount,
        Currency: invoice.currency,
        Status: invoice.status,
        "Issue Date": formatDate(invoice.issueDate),
        "Due Date": formatDate(invoice.dueDate),
        Contact: invoice.contact?.name ?? "",
        Deal: invoice.deal?.title ?? ""
      }))
    ),
    "Invoices"
  );

  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  return new Response(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="invisible-crm-export.xlsx"'
    }
  });
}

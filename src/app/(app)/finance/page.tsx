import { requireUser, canManageWorkspace } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils";
import { listInvoices } from "@/features/finance/service";
import { InvoiceForm } from "@/components/forms/invoice-form";
import { DeleteButton } from "@/components/delete-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

export default async function FinancePage() {
  const user = await requireUser();
  const canManage = canManageWorkspace(user);
  const [invoices, contacts, deals] = await Promise.all([
    listInvoices(user.workspaceId),
    db.contact.findMany({
      where: { workspaceId: user.workspaceId },
      select: { id: true, name: true },
      orderBy: { name: "asc" }
    }),
    db.deal.findMany({
      where: { workspaceId: user.workspaceId },
      select: { id: true, title: true },
      orderBy: { updatedAt: "desc" }
    })
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Finance"
        title="Invoice and spreadsheet-friendly revenue tracking"
        description="Keep commercial follow-through visible next to CRM activity so proposals, invoices, and revenue context are not split across tools."
        actions={
          <a href="/api/exports/workbook">
            <Button variant="secondary">Export workbook</Button>
          </a>
        }
      />

      <Card>
        <CardHeader>
          <div>
            <p className="text-sm font-semibold text-ink">Track invoice</p>
            <p className="mt-1 text-sm text-slate-500">This is the first bridge from CRM opportunities into lightweight accounting and spreadsheet-based ops.</p>
          </div>
        </CardHeader>
        <CardContent>
          <InvoiceForm canManage={canManage} contacts={contacts} deals={deals} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <p className="text-sm font-semibold text-ink">Invoices</p>
            <p className="mt-1 text-sm text-slate-500">Track which opportunities have become revenue conversations.</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {invoices.length ? (
            invoices.map((invoice) => (
              <div key={invoice.id} className="flex flex-col gap-3 rounded-3xl border border-black/5 bg-white p-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="font-semibold text-ink">
                    {invoice.number} • {invoice.clientName}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {invoice.status} • {formatCurrency(invoice.amount, invoice.currency)} • Issue {formatDate(invoice.issueDate)}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    {invoice.deal?.title ?? invoice.contact?.name ?? "No linked CRM record"}
                  </p>
                </div>
                {canManage ? <DeleteButton endpoint={`/api/finance/invoices/${invoice.id}`} redirectTo="/finance" label="invoice" /> : null}
              </div>
            ))
          ) : (
            <div className="rounded-3xl bg-sand/60 p-4 text-sm text-slate-600">
              No invoices tracked yet. Start with the opportunities that are closest to closing so revenue visibility stays simple.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

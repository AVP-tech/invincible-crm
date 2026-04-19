"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { InvoiceStatus } from "@prisma/client";
import { CalendarDays, FileSpreadsheet, Link2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn, formatCurrency, titleCase } from "@/lib/utils";

type InvoiceFormProps = {
  canManage: boolean;
  contacts: { id: string; name: string }[];
  deals: { id: string; title: string }[];
};

export function InvoiceForm({ canManage, contacts, deals }: InvoiceFormProps) {
  const router = useRouter();
  const [number, setNumber] = useState("");
  const [clientName, setClientName] = useState("");
  const [contactId, setContactId] = useState("");
  const [dealId, setDealId] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [status, setStatus] = useState<InvoiceStatus>(InvoiceStatus.DRAFT);
  const [issueDate, setIssueDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedContact = contacts.find((contact) => contact.id === contactId);
  const selectedDeal = deals.find((deal) => deal.id === dealId);
  const trimmedClientName = clientName.trim();
  const parsedAmount = amount ? Number(amount) : null;
  const noteIdeas = [
    "Proposal approved and invoice shared for confirmation.",
    "Client asked for payment terms before release.",
    "Awaiting PO number from finance team.",
    "Follow up in 3 days if payment link is not opened."
  ];

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    const response = await fetch("/api/finance/invoices", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        number,
        clientName,
        contactId,
        dealId,
        amount,
        currency,
        status,
        issueDate,
        dueDate,
        notes
      })
    });
    const payload = await response.json();
    setIsSubmitting(false);

    if (!response.ok) {
      toast.error(payload.error ?? "Could not save invoice");
      return;
    }

    toast.success("Invoice tracked");
    setNumber("");
    setClientName("");
    setContactId("");
    setDealId("");
    setAmount("");
    setIssueDate("");
    setDueDate("");
    setNotes("");
    router.refresh();
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Invoice number">
          <Input value={number} onChange={(event) => setNumber(event.target.value)} disabled={!canManage} placeholder="INV-2026-014" />
        </Field>
        <Field label="Client name">
          <Input value={clientName} onChange={(event) => setClientName(event.target.value)} disabled={!canManage} placeholder="ABC Studio" />
        </Field>
        <Field label="Linked contact">
          <Select value={contactId} onChange={(event) => setContactId(event.target.value)} disabled={!canManage}>
            <option value="">No linked contact</option>
            {contacts.map((contact) => (
              <option key={contact.id} value={contact.id}>
                {contact.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Linked deal">
          <Select value={dealId} onChange={(event) => setDealId(event.target.value)} disabled={!canManage}>
            <option value="">No linked deal</option>
            {deals.map((deal) => (
              <option key={deal.id} value={deal.id}>
                {deal.title}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Amount">
          <Input type="number" value={amount} onChange={(event) => setAmount(event.target.value)} disabled={!canManage} />
        </Field>
        <Field label="Currency">
          <Input value={currency} onChange={(event) => setCurrency(event.target.value)} disabled={!canManage} />
        </Field>
        <Field label="Status">
          <Select value={status} onChange={(event) => setStatus(event.target.value as InvoiceStatus)} disabled={!canManage}>
            {Object.values(InvoiceStatus).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Issue date">
          <Input type="date" value={issueDate} onChange={(event) => setIssueDate(event.target.value)} disabled={!canManage} />
        </Field>
        <Field label="Due date">
          <Input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} disabled={!canManage} />
        </Field>
      </div>
      <Field label="Notes">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(19rem,0.95fr)]">
          <Textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            disabled={!canManage}
            className="min-h-[220px]"
            placeholder="Add context for finance follow-up, approvals, payment terms, or anything ops should know..."
          />

          <div className="rounded-[2rem] border border-white/10 bg-[#0d1526]/85 p-5 text-white shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-gold/55">
                  Live snapshot
                </p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {number.trim() || "Invoice draft preview"}
                </p>
                <p className="mt-1 text-sm text-white/60">
                  {trimmedClientName || "Client name not set yet"}
                </p>
              </div>
              <div className="rounded-2xl border border-gold/15 bg-gold/10 p-3 text-gold">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              <SnapshotRow
                icon={Sparkles}
                label="Amount"
                value={parsedAmount && Number.isFinite(parsedAmount) ? formatCurrency(parsedAmount, currency || "INR") : "Waiting for amount"}
              />
              <SnapshotRow
                icon={CalendarDays}
                label="Timeline"
                value={issueDate || dueDate ? `${issueDate || "No issue date"} -> ${dueDate || "No due date"}` : "Issue and due dates not linked yet"}
              />
              <SnapshotRow
                icon={Link2}
                label="CRM links"
                value={[
                  selectedContact ? `Contact: ${selectedContact.name}` : null,
                  selectedDeal ? `Deal: ${selectedDeal.title}` : null
                ].filter(Boolean).join(" • ") || "No CRM record linked yet"}
              />
            </div>

            <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">
                Quick note starters
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {noteIdeas.map((idea) => (
                  <button
                    key={idea}
                    type="button"
                    onClick={() =>
                      setNotes((current) => {
                        if (!canManage) return current;
                        if (!current.trim()) return idea;
                        return current.includes(idea) ? current : `${current.trim()}\n${idea}`;
                      })
                    }
                    disabled={!canManage}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-left text-xs font-medium transition",
                      canManage
                        ? "border-gold/15 bg-gold/[0.08] text-gold/85 hover:border-gold/30 hover:bg-gold/[0.12]"
                        : "cursor-not-allowed border-white/10 bg-white/[0.03] text-white/35"
                    )}
                  >
                    {idea}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between rounded-[1.4rem] border border-emerald-400/[0.12] bg-emerald-400/[0.06] px-4 py-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200/70">
                  Status pulse
                </p>
                <p className="mt-1 text-sm text-white/80">
                  {titleCase(status.toLowerCase())} and ready to track inside the revenue view.
                </p>
              </div>
              <span className="rounded-full border border-emerald-300/20 bg-emerald-300/12 px-3 py-1 text-xs font-semibold text-emerald-200">
                Finance synced
              </span>
            </div>
          </div>
        </div>
      </Field>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.6rem] border border-black/5 bg-sand/55 px-4 py-4 dark:border-white/10 dark:bg-white/[0.03]">
        <div className="max-w-xl">
          <p className="text-sm font-semibold text-ink dark:text-white">
            Keep invoice tracking tied to CRM momentum
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Link the contact or deal whenever possible so finance, follow-ups, and relationship history stay in one thread.
          </p>
        </div>
        <Button type="submit" disabled={!canManage || isSubmitting}>
          {isSubmitting ? "Saving..." : "Track invoice"}
        </Button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-2 text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function SnapshotRow({
  icon: Icon,
  label,
  value
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-2 text-gold/85">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/40">
            {label}
          </p>
          <p className="mt-1 text-sm leading-6 text-white/78">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

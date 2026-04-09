"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { InvoiceStatus } from "@prisma/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

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
        <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} disabled={!canManage} />
      </Field>
      <Button type="submit" disabled={!canManage || isSubmitting}>
        {isSubmitting ? "Saving..." : "Track invoice"}
      </Button>
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

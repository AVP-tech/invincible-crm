"use client";

import { DealStage } from "@prisma/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { dealInputSchema, type DealInput } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type DealFormProps = {
  mode: "create" | "edit";
  dealId?: string;
  contacts: { id: string; name: string }[];
  members: { id: string; name: string }[];
  defaultValues?: {
    title?: string;
    description?: string | null;
    contactId?: string | null;
    assignedToUserId?: string | null;
    companyName?: string | null;
    stage?: DealStage;
    amount?: number | null;
    currency?: string;
    expectedCloseDate?: string | null;
    nextStep?: string | null;
  };
};

export function DealForm({ mode, dealId, contacts, members, defaultValues }: DealFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<z.input<typeof dealInputSchema>, unknown, DealInput>({
    resolver: zodResolver(dealInputSchema),
    defaultValues: {
      title: defaultValues?.title ?? "",
      description: defaultValues?.description ?? "",
      contactId: defaultValues?.contactId ?? "",
      assignedToUserId: defaultValues?.assignedToUserId ?? "",
      companyName: defaultValues?.companyName ?? "",
      stage: defaultValues?.stage ?? DealStage.NEW_LEAD,
      amount: defaultValues?.amount ?? undefined,
      currency: defaultValues?.currency ?? "INR",
      expectedCloseDate: defaultValues?.expectedCloseDate ?? "",
      nextStep: defaultValues?.nextStep ?? ""
    }
  });

  async function onSubmit(values: DealInput) {
    setIsSubmitting(true);

    const response = await fetch(mode === "create" ? "/api/deals" : `/api/deals/${dealId}`, {
      method: mode === "create" ? "POST" : "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(values)
    });

    const payload = await response.json();
    setIsSubmitting(false);

    if (!response.ok) {
      toast.error(payload.error ?? "Could not save deal");
      return;
    }

    toast.success(mode === "create" ? "Deal created" : "Deal updated");
    router.push(mode === "create" ? `/deals/${payload.deal.id}` : `/deals/${dealId}`);
    router.refresh();
  }

  return (
    <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Deal title" error={String(form.formState.errors.title?.message ?? "")}>
          <Input placeholder="Website redesign retainer" {...form.register("title")} />
        </Field>
        <Field label="Contact">
          <Select {...form.register("contactId")}>
            <option value="">No linked contact yet</option>
            {contacts.map((contact) => (
              <option key={contact.id} value={contact.id}>
                {contact.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Company">
          <Input placeholder="ABC Studio" {...form.register("companyName")} />
        </Field>
        <Field label="Owner">
          <Select {...form.register("assignedToUserId")}>
            <option value="">Unassigned</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Stage">
          <Select {...form.register("stage")}>
            {Object.values(DealStage).map((stage) => (
              <option key={stage} value={stage}>
                {stage.replaceAll("_", " ")}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Amount">
          <Input type="number" placeholder="50000" {...form.register("amount")} />
        </Field>
        <Field label="Expected close date">
          <Input type="date" {...form.register("expectedCloseDate")} />
        </Field>
      </div>

      <Field label="Next step">
        <Input placeholder="Send revised scope on Friday" {...form.register("nextStep")} />
      </Field>

      <Field label="Deal notes">
        <Textarea placeholder="Context, concerns, and what matters most in this opportunity..." {...form.register("description")} />
      </Field>

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : mode === "create" ? "Create deal" : "Save changes"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  children
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="space-y-2 text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      {children}
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
    </label>
  );
}

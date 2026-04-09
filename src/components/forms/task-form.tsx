"use client";

import { TaskPriority, TaskRecurrencePattern, TaskStatus } from "@prisma/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { taskInputSchema, type TaskInput } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type TaskFormProps = {
  mode: "create" | "edit";
  taskId?: string;
  contacts: { id: string; name: string }[];
  deals: { id: string; title: string }[];
  members: { id: string; name: string }[];
  redirectTo?: string;
  defaultValues?: {
    title?: string;
    description?: string | null;
    contactId?: string | null;
    dealId?: string | null;
    assignedToUserId?: string | null;
    dueDate?: string | null;
    priority?: TaskPriority;
    status?: TaskStatus;
    recurrencePattern?: TaskRecurrencePattern;
    recurrenceIntervalDays?: number | null;
  };
};

export function TaskForm({ mode, taskId, contacts, deals, members, redirectTo = "/tasks", defaultValues }: TaskFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<z.input<typeof taskInputSchema>, unknown, TaskInput>({
    resolver: zodResolver(taskInputSchema),
    defaultValues: {
      title: defaultValues?.title ?? "",
      description: defaultValues?.description ?? "",
      contactId: defaultValues?.contactId ?? "",
      dealId: defaultValues?.dealId ?? "",
      assignedToUserId: defaultValues?.assignedToUserId ?? "",
      dueDate: defaultValues?.dueDate ?? "",
      priority: defaultValues?.priority ?? TaskPriority.MEDIUM,
      status: defaultValues?.status ?? TaskStatus.OPEN,
      recurrencePattern: defaultValues?.recurrencePattern ?? TaskRecurrencePattern.NONE,
      recurrenceIntervalDays: defaultValues?.recurrenceIntervalDays ?? undefined
    }
  });
  const recurrencePattern = form.watch("recurrencePattern");

  async function onSubmit(values: TaskInput) {
    setIsSubmitting(true);

    const response = await fetch(mode === "create" ? "/api/tasks" : `/api/tasks/${taskId}`, {
      method: mode === "create" ? "POST" : "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(values)
    });

    const payload = await response.json();
    setIsSubmitting(false);

    if (!response.ok) {
      toast.error(payload.error ?? "Could not save task");
      return;
    }

    toast.success(mode === "create" ? "Task created" : "Task updated");
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Task title" error={String(form.formState.errors.title?.message ?? "")}>
          <Input placeholder="Follow up with Priya" {...form.register("title")} />
        </Field>
        <Field label="Due date" error={String(form.formState.errors.dueDate?.message ?? "")}>
          <Input type="date" {...form.register("dueDate")} />
        </Field>
        <Field label="Priority">
          <Select {...form.register("priority")}>
            {Object.values(TaskPriority).map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Status">
          <Select {...form.register("status")}>
            {Object.values(TaskStatus).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Repeat cadence" error={String(form.formState.errors.recurrencePattern?.message ?? "")}>
          <Select {...form.register("recurrencePattern")}>
            <option value={TaskRecurrencePattern.NONE}>Does not repeat</option>
            <option value={TaskRecurrencePattern.DAILY}>Daily</option>
            <option value={TaskRecurrencePattern.WEEKLY}>Weekly</option>
            <option value={TaskRecurrencePattern.BIWEEKLY}>Every 2 weeks</option>
            <option value={TaskRecurrencePattern.MONTHLY}>Monthly</option>
            <option value={TaskRecurrencePattern.CUSTOM_DAYS}>Custom days</option>
          </Select>
        </Field>
        <Field label="Linked contact">
          <Select {...form.register("contactId")}>
            <option value="">No linked contact</option>
            {contacts.map((contact) => (
              <option key={contact.id} value={contact.id}>
                {contact.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Linked deal">
          <Select {...form.register("dealId")}>
            <option value="">No linked deal</option>
            {deals.map((deal) => (
              <option key={deal.id} value={deal.id}>
                {deal.title}
              </option>
            ))}
          </Select>
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
      </div>

      {recurrencePattern === TaskRecurrencePattern.CUSTOM_DAYS ? (
        <Field label="Repeat every X days" error={String(form.formState.errors.recurrenceIntervalDays?.message ?? "")}>
          <Input type="number" min={2} step={1} placeholder="14" {...form.register("recurrenceIntervalDays")} />
        </Field>
      ) : null}

      <Field label="Description">
        <Textarea placeholder="Why this follow-up matters, what to ask, or what to send..." {...form.register("description")} />
      </Field>

      {recurrencePattern !== TaskRecurrencePattern.NONE ? (
        <div className="rounded-3xl bg-sand/60 p-4 text-sm text-slate-600">
          Completing this task will automatically create the next follow-up in the series.
        </div>
      ) : null}

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : mode === "create" ? "Create task" : "Save changes"}
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

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { AutomationActionType, AutomationTriggerType, DealStage, TaskPriority } from "@prisma/client";
import { automationRuleInputSchema, type AutomationRuleInput } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function AutomationForm({ canManage = true }: { canManage?: boolean }) {
  const router = useRouter();
  
  const form = useForm<any>({
    resolver: zodResolver(automationRuleInputSchema),
    defaultValues: {
      name: "",
      isActive: true,
      triggerType: AutomationTriggerType.DEAL_STAGE_CHANGED,
      triggerStage: DealStage.WON,
      actionType: AutomationActionType.CREATE_TASK,
      taskTitle: "Welcome {{contact.name}}",
      dueInDays: 1,
      priority: TaskPriority.HIGH,
      noteContent: ""
    }
  });

  const watchTriggerType = form.watch("triggerType");
  const watchActionType = form.watch("actionType");

  const onSubmit = async (values: any) => {
    try {
      const res = await fetch("/api/automations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to create automation");
        return;
      }

      toast.success("Automation rule created successfully");
      form.reset();
      router.refresh();
    } catch (e) {
      toast.error("Internal Server Error");
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-1">
        <label className="text-sm font-medium text-ink">Rule Name</label>
        <Input {...form.register("name")} placeholder="e.g. Onboard New Clients" />
        {form.formState.errors.name && <p className="text-xs text-rose-500">{form.formState.errors.name.message as string}</p>}
      </div>

      <div className="space-y-4 rounded-3xl border border-black/5 bg-slate-50 p-5 dark:border-white/5 dark:bg-white/5">
        <h4 className="font-medium text-ink">When this happens... (Trigger)</h4>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium text-ink">Event</label>
            <Select {...form.register("triggerType")}>
              <option value="DEAL_STAGE_CHANGED">Deal Stage Changes</option>
            </Select>
            {form.formState.errors.triggerType && <p className="text-xs text-rose-500">{form.formState.errors.triggerType.message as string}</p>}
          </div>

          {watchTriggerType === "DEAL_STAGE_CHANGED" && (
            <div className="space-y-1">
              <label className="text-sm font-medium text-ink">Target Stage</label>
              <Select {...form.register("triggerStage")}>
                {Object.values(DealStage).map((stage) => (
                  <option key={stage} value={stage}>{stage.replace(/_/g, " ")}</option>
                ))}
              </Select>
              {form.formState.errors.triggerStage && <p className="text-xs text-rose-500">{form.formState.errors.triggerStage.message as string}</p>}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4 rounded-3xl border border-moss/10 bg-moss/5 p-5 dark:border-moss/20">
        <h4 className="font-medium text-moss">Do this... (Action)</h4>
        <div className="space-y-1">
          <label className="text-sm font-medium text-ink">Action Type</label>
          <Select {...form.register("actionType")}>
            <option value="CREATE_TASK">Create Follow-up Task</option>
            <option value="ADD_NOTE">Add Sticky Note</option>
          </Select>
          {form.formState.errors.actionType && <p className="text-xs text-rose-500">{form.formState.errors.actionType.message as string}</p>}
        </div>

        {watchActionType === "CREATE_TASK" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-sm font-medium text-ink">Task Title Template</label>
              <Input {...form.register("taskTitle")} placeholder="e.g. Send invoice to {{contact.name}}" />
              {form.formState.errors.taskTitle && <p className="text-xs text-rose-500">{form.formState.errors.taskTitle.message as string}</p>}
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-medium text-ink">Due in (Days)</label>
              <Input type="number" {...form.register("dueInDays")} placeholder="1" />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-ink">Priority</label>
              <Select {...form.register("priority")}>
                {Object.values(TaskPriority).map((priority) => (
                   <option key={priority} value={priority}>{priority}</option>
                ))}
              </Select>
            </div>
          </div>
        )}

        {watchActionType === "ADD_NOTE" && (
          <div className="space-y-1">
            <label className="text-sm font-medium text-ink">Note Content Template</label>
            <Textarea {...form.register("noteContent")} rows={3} placeholder="e.g. Contract was signed on {{deal.stage}}" />
            {form.formState.errors.noteContent && <p className="text-xs text-rose-500">{form.formState.errors.noteContent.message as string}</p>}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-[#D15533]/20 bg-[#D15533]/5 p-4">
        <p className="text-sm text-[#D15533] dark:text-[#E86A46]">
          <strong>Pro tip:</strong> You can use <code>{"{{contact.name}}"}</code> or <code>{"{{deal.title}}"}</code> to dynamically inject client details into the title or notes!
        </p>
      </div>

      <div className="flex justify-end pt-2">
         <Button type="submit" disabled={!canManage || form.formState.isSubmitting}>
           {form.formState.isSubmitting ? "Saving rule..." : "Activate Automation"}
         </Button>
      </div>
    </form>
  );
}

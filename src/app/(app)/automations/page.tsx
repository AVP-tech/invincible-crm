import { requireUser, canManageWorkspace } from "@/lib/auth";
import { listAutomationRules } from "@/features/automations/service";
import { AutomationForm } from "@/components/forms/automation-form";
import { DeleteButton } from "@/components/delete-button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

export default async function AutomationsPage() {
  const user = await requireUser();
  const rules = await listAutomationRules(user.workspaceId);
  const canManage = canManageWorkspace(user);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Automations"
        title="Lightweight automation rules"
        description="Keep the CRM proactive without turning it into an enterprise workflow maze. These rules create the next action at the right moment."
      />

      <Card>
        <CardHeader>
          <div>
            <p className="text-sm font-semibold text-ink">New rule</p>
            <p className="mt-1 text-sm text-slate-500">Start simple: trigger on deal stage movement, task completion, or a new inbound conversation.</p>
          </div>
        </CardHeader>
        <CardContent>
          <AutomationForm canManage={canManage} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <p className="text-sm font-semibold text-ink">Active rules</p>
            <p className="mt-1 text-sm text-slate-500">These run automatically when their trigger conditions are met.</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {rules.length ? (
            rules.map((rule) => (
              <div key={rule.id} className="flex flex-col gap-3 rounded-3xl border border-black/5 bg-white p-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="font-semibold text-ink">{rule.name}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {rule.triggerType.replaceAll("_", " ")} → {rule.actionType.replaceAll("_", " ")}
                  </p>
                </div>
                {canManage ? <DeleteButton endpoint={`/api/automations/${rule.id}`} redirectTo="/automations" label="automation" /> : null}
              </div>
            ))
          ) : (
            <div className="rounded-3xl bg-sand/60 p-4 text-sm text-slate-600">
              No automation rules yet. A good first one is: when a deal moves to Proposal Sent, create a task due in 3 days.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

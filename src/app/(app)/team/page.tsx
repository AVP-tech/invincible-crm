import { requireUser, canManageWorkspace } from "@/lib/auth";
import { listWorkspaceMembers } from "@/features/team/service";
import { TeamMemberForm } from "@/components/forms/team-member-form";
import { DeleteButton } from "@/components/delete-button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

export default async function TeamPage() {
  const user = await requireUser();
  const members = await listWorkspaceMembers(user.workspaceId);
  const canManage = canManageWorkspace(user);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Team"
        title="Shared workspace and team access"
        description="Bring real teammates into one CRM workspace, assign ownership clearly, and keep permissions lightweight."
      />

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardHeader>
            <div>
              <p className="text-sm font-semibold text-ink">Workspace</p>
              <p className="mt-1 text-sm text-slate-500">Current role: {user.workspaceRole}</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-3xl bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Workspace id</p>
              <p className="mt-2 text-sm text-slate-700">{user.workspaceId}</p>
            </div>
            <div className="rounded-3xl bg-sand/60 p-4 text-sm text-slate-600">
              Owners and admins can add teammates, set integrations, manage automations, and track invoices. Members can work in the CRM. Viewers are read-only.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <p className="text-sm font-semibold text-ink">Add teammate</p>
              <p className="mt-1 text-sm text-slate-500">Create an account directly inside this workspace for a small team setup.</p>
            </div>
          </CardHeader>
          <CardContent>
            <TeamMemberForm canManage={canManage} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div>
            <p className="text-sm font-semibold text-ink">Members</p>
            <p className="mt-1 text-sm text-slate-500">Everyone who can access this shared workspace.</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {members.map((member) => (
            <div key={member.id} className="flex flex-col gap-3 rounded-3xl border border-black/5 bg-white p-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="font-semibold text-ink">{member.user.name}</p>
                <p className="mt-1 text-sm text-slate-500">{member.user.email}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-sand px-3 py-1 text-xs font-semibold text-ink">{member.role}</span>
                {member.role !== "OWNER" && canManage ? (
                  <DeleteButton endpoint={`/api/team/members/${member.id}`} redirectTo="/team" label="teammate" />
                ) : null}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

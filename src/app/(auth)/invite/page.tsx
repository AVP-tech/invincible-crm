import { redirect } from "next/navigation";
import { AcceptInviteForm } from "@/components/forms/accept-invite-form";

export default async function InvitePage({
  searchParams
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-sand px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl ring-1 ring-black/5">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-moss">You're Invited</p>
          <h1 className="mt-2 text-2xl font-bold text-ink">Join Invincible CRM</h1>
          <p className="mt-2 text-sm text-slate-500">
            Set your password below to accept the invitation and access your new workspace.
          </p>
        </div>

        <AcceptInviteForm token={token} />
      </div>
    </div>
  );
}

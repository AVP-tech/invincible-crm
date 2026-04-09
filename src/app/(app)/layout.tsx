import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getCurrentUser } from "@/lib/auth";

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!user.onboardingCompleted) {
    redirect("/welcome");
  }

  return (
    <AppShell
      user={{
        name: user.name,
        email: user.email
      }}
    >
      {children}
    </AppShell>
  );
}

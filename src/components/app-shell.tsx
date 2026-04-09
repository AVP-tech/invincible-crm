import Link from "next/link";
import { Sparkles, Search, LogOut } from "lucide-react";
import { env } from "@/lib/env";
import { Button } from "@/components/ui/button";
import { PageTransitionWrapper } from "@/components/page-transition-wrapper";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileMenu } from "@/components/mobile-menu";
import { NotificationCenter } from "@/components/notification-center";
import { FloatingActionButton } from "@/components/floating-action-button";

import { SidebarNav } from "@/components/sidebar-nav";

type AppShellProps = {
  user: {
    name: string;
    email: string;
  };
  children: React.ReactNode;
};

export function AppShell({ user, children }: AppShellProps) {
  return (
    <div className="mx-auto flex min-h-screen max-w-[1600px] gap-6 px-4 py-4 lg:px-6">
      <aside className="surface hidden w-72 shrink-0 rounded-[2rem] p-5 lg:flex lg:flex-col">
        <Link href="/dashboard" className="rounded-3xl bg-[#132032] px-5 py-4 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">Invisible CRM</p>
          <div className="mt-3 flex items-center gap-3">
            <div className="rounded-2xl bg-white/12 p-2">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">{env.appName}</p>
              <p className="text-xs text-white/70">CRM without the admin overhead</p>
            </div>
          </div>
        </Link>

        <SidebarNav />

        <div className="mt-auto rounded-3xl bg-white p-4 shadow-soft dark:bg-white/5 dark:shadow-none">
          <p className="text-sm font-semibold text-ink dark:text-slate-200">{user.name}</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
          <form action="/api/auth/logout" method="post" className="mt-4">
            <Button variant="secondary" className="w-full justify-center">
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </form>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="surface mb-6 rounded-[2rem] px-5 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-moss">Zero-input workspace</p>
                <h2 className="mt-1 text-xl font-semibold text-ink">Stay on top of relationships without spreadsheet drag</h2>
              </div>
              <MobileMenu />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <form action="/search" className="flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  name="q"
                  placeholder="Search contacts, deals, tasks..."
                  className="w-60 bg-transparent text-sm text-ink outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </form>
              <Link href="/capture">
                <Button className="w-full sm:w-auto">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Quick capture
                </Button>
              </Link>
              <div className="hidden lg:flex items-center gap-2">
                <NotificationCenter />
                <ThemeToggle />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1">
          <PageTransitionWrapper>{children}</PageTransitionWrapper>
        </main>
      </div>
      <FloatingActionButton />
    </div>
  );
}

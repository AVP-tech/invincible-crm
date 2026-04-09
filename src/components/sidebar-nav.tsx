"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import type { Route } from "next";
import { Sparkles, LayoutDashboard, Users, KanbanSquare, CheckSquare, Search, Settings, LogOut, BellRing, Upload, MessageSquareMore, PlugZap, ReceiptText, Bot } from "lucide-react";

export const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/contacts", label: "Contacts", icon: Users },
  { href: "/deals", label: "Deals", icon: KanbanSquare },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/reminders", label: "Reminders", icon: BellRing },
  { href: "/inbox", label: "Inbox", icon: MessageSquareMore },
  { href: "/team", label: "Team", icon: Users },
  { href: "/automations", label: "Automations", icon: Bot },
  { href: "/integrations", label: "Integrations", icon: PlugZap },
  { href: "/finance", label: "Finance", icon: ReceiptText },
  { href: "/capture", label: "AI Capture", icon: Sparkles },
  { href: "/imports", label: "Imports", icon: Upload },
  { href: "/search", label: "Search", icon: Search },
  { href: "/settings", label: "Settings", icon: Settings }
] satisfies { href: Route; label: string; icon: typeof Sparkles }[];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="mt-8 space-y-1 relative" role="navigation">
      {navigation.map((item) => {
        const Icon = item.icon;
        const isActive = pathname?.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`group relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
              isActive
                ? "text-ink dark:text-white"
                : "text-slate-700 hover:text-ink dark:text-slate-300 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5"
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="sidebar-active-tab"
                className="absolute inset-0 rounded-2xl bg-white shadow-sm dark:bg-white/10 dark:shadow-none pointer-events-none"
                initial={false}
                transition={{ type: "spring", stiffness: 450, damping: 30 }}
              />
            )}
            <Icon className="relative z-10 h-4 w-4" />
            <span className="relative z-10">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

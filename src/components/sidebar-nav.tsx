"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import type { Route } from "next";
import { Sparkles, LayoutDashboard, Users, KanbanSquare, CheckSquare, Search, Settings, BellRing, Upload, MessageSquareMore, PlugZap, ReceiptText, Bot, BookOpen } from "lucide-react";

type NavSection = {
  label: string;
  items: { href: Route; label: string; icon: typeof Sparkles }[];
};

const navSections: NavSection[] = [
  {
    label: "Core",
    items: [
      { href: "/capture" as Route, label: "AI Capture", icon: Sparkles },
      { href: "/dashboard" as Route, label: "Dashboard", icon: LayoutDashboard },
      { href: "/guide" as Route, label: "Guide", icon: BookOpen },
      { href: "/contacts" as Route, label: "Contacts", icon: Users },
      { href: "/deals" as Route, label: "Deals", icon: KanbanSquare },
      { href: "/tasks" as Route, label: "Tasks", icon: CheckSquare },
      { href: "/reminders" as Route, label: "Reminders", icon: BellRing },
    ],
  },
  {
    label: "Channels",
    items: [
      { href: "/inbox" as Route, label: "Inbox", icon: MessageSquareMore },
      { href: "/team" as Route, label: "Team", icon: Users },
      { href: "/automations" as Route, label: "Automations", icon: Bot },
    ],
  },
  {
    label: "Tools",
    items: [
      { href: "/integrations" as Route, label: "Integrations", icon: PlugZap },
      { href: "/finance" as Route, label: "Finance", icon: ReceiptText },
      { href: "/imports" as Route, label: "Imports", icon: Upload },
      { href: "/search" as Route, label: "Search", icon: Search },
      { href: "/settings" as Route, label: "Settings", icon: Settings },
    ],
  },
];

/* Flat export for command palette */
export const navigation = navSections.flatMap((s) => s.items);

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="mt-6 space-y-5 relative" role="navigation">
      {navSections.map((section) => (
        <div key={section.label}>
          <p className="mb-2 px-4 text-[0.6rem] font-bold uppercase tracking-[0.3em] text-slate-400/70 dark:text-slate-500">
            {section.label}
          </p>
          <div className="space-y-0.5">
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname?.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-item-glow group relative flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "text-ink dark:text-white"
                      : "text-slate-600 hover:text-ink dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active-tab"
                      className="absolute inset-0 rounded-2xl bg-white shadow-sm dark:bg-white/10 dark:shadow-none pointer-events-none"
                      style={{
                        boxShadow: isActive
                          ? "0 0 0 1px rgba(230, 193, 106, 0.15), 0 4px 12px rgba(19, 32, 50, 0.05)"
                          : "none",
                      }}
                      initial={false}
                      transition={{ type: "spring", stiffness: 450, damping: 30 }}
                    />
                  )}
                  <motion.div
                    className="relative z-10"
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  >
                    <Icon className={`h-4 w-4 transition-colors duration-200 ${
                      isActive ? "text-gold" : "text-slate-400 group-hover:text-gold/70 dark:text-slate-500"
                    }`} />
                  </motion.div>
                  <span className="relative z-10">{item.label}</span>
                  {isActive && (
                    <motion.div
                      className="absolute right-3 h-1.5 w-1.5 rounded-full bg-gold"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 25 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

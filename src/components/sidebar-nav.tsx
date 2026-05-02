"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { Route } from "next";
import {
  Sparkles,
  LayoutDashboard,
  Users,
  KanbanSquare,
  CheckSquare,
  Search,
  Settings,
  BellRing,
  Upload,
  MessageSquareMore,
  PlugZap,
  ReceiptText,
  Bot,
  BookOpen,
} from "lucide-react";

type NavSection = {
  label: string;
  items: { href: Route; label: string; icon: typeof Sparkles }[];
};

const navSections: NavSection[] = [
  {
    label: "Core",
    items: [
      { href: "/dashboard" as Route, label: "Dashboard", icon: LayoutDashboard },
      { href: "/guide" as Route,     label: "Guide",     icon: BookOpen },
      { href: "/contacts" as Route,  label: "Contacts",  icon: Users },
      { href: "/deals" as Route,     label: "Deals",     icon: KanbanSquare },
      { href: "/tasks" as Route,     label: "Tasks",     icon: CheckSquare },
      { href: "/reminders" as Route, label: "Reminders", icon: BellRing },
    ],
  },
  {
    label: "Channels",
    items: [
      { href: "/inbox" as Route,       label: "Inbox",       icon: MessageSquareMore },
      { href: "/team" as Route,        label: "Team",        icon: Users },
      { href: "/automations" as Route, label: "Automations", icon: Bot },
    ],
  },
  {
    label: "Tools",
    items: [
      { href: "/integrations" as Route, label: "Integrations", icon: PlugZap },
      { href: "/finance" as Route,      label: "Finance",      icon: ReceiptText },
      { href: "/capture" as Route,      label: "AI Capture",   icon: Sparkles },
      { href: "/imports" as Route,      label: "Imports",      icon: Upload },
      { href: "/search" as Route,       label: "Search",       icon: Search },
      { href: "/settings" as Route,     label: "Settings",     icon: Settings },
    ],
  },
];

/* Flat export for command palette */
export const navigation = navSections.flatMap((s) => s.items);

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="mt-6 space-y-5 relative" role="navigation">
      {navSections.map((section, sIdx) => (
        <motion.div
          key={section.label}
          initial={{ opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            duration: 0.44,
            delay: sIdx * 0.07,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {/* Section label */}
          <p className="mb-2 px-4 text-[0.6rem] font-bold uppercase tracking-[0.3em] text-slate-400/70 dark:text-slate-500">
            {section.label}
          </p>

          <div className="space-y-0.5">
            {section.items.map((item, iIdx) => {
              const Icon = item.icon;
              const isActive = pathname?.startsWith(item.href);

              return (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.38,
                    delay: sIdx * 0.07 + iIdx * 0.04,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <Link
                    href={item.href}
                    className={`nav-item-glow group relative flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium transition-colors duration-150 ${
                      isActive
                        ? "text-ink dark:text-white"
                        : "text-slate-600 hover:text-ink dark:text-slate-400 dark:hover:text-white"
                    }`}
                  >
                    {/* ── Sliding active pill (layoutId spring) ── */}
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active-tab"
                        className="absolute inset-0 rounded-2xl bg-white dark:bg-white/10 pointer-events-none"
                        style={{
                          boxShadow:
                            "0 0 0 1px rgba(230,193,106,0.18), 0 4px 14px rgba(19,32,50,0.06), 0 0 20px rgba(230,193,106,0.04)",
                        }}
                        initial={false}
                        transition={{
                          type: "spring",
                          stiffness: 480,
                          damping: 32,
                          mass: 0.9,
                        }}
                      />
                    )}

                    {/* ── Icon: bounce on hover + gold active glow ── */}
                    <motion.div
                      className="relative z-10"
                      whileHover={{ scale: 1.2, rotate: 6 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 420, damping: 18 }}
                    >
                      <Icon
                        className={`h-4 w-4 transition-colors duration-150 ${
                          isActive
                            ? "text-gold drop-shadow-[0_0_6px_rgba(230,193,106,0.5)]"
                            : "text-slate-400 group-hover:text-gold/70 dark:text-slate-500"
                        }`}
                      />
                    </motion.div>

                    {/* ── Label ── */}
                    <span className="relative z-10 flex-1">{item.label}</span>

                    {/* ── Active dot: scale-in spring + glow pulse ── */}
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          className="relative z-10 h-1.5 w-1.5 rounded-full bg-gold"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{
                            type: "spring",
                            stiffness: 520,
                            damping: 22,
                          }}
                          style={{
                            boxShadow: "0 0 8px rgba(230,193,106,0.7)",
                          }}
                        />
                      )}
                    </AnimatePresence>

                    {/* ── Hover shimmer line at bottom edge ── */}
                    <motion.div
                      className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent"
                      initial={{ scaleX: 0, opacity: 0 }}
                      whileHover={{ scaleX: 1, opacity: 1 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      ))}
    </nav>
  );
}

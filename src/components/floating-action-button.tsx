"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Zap, UserPlus, KanbanSquare, CheckSquare } from "lucide-react";

const actions = [
  { href: "/capture", icon: Zap, label: "AI Capture", color: "bg-moss text-white" },
  { href: "/contacts/new", icon: UserPlus, label: "New Contact", color: "bg-[#132032] text-white dark:bg-white dark:text-[#132032]" },
  { href: "/deals/new", icon: KanbanSquare, label: "New Deal", color: "bg-ember text-white" },
  { href: "/tasks/new", icon: CheckSquare, label: "New Task", color: "bg-gold text-ink" },
];

export function FloatingActionButton() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col-reverse items-end gap-3">
      {/* Sub-actions */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 -z-10"
              onClick={() => setOpen(false)}
            />
            {actions.map((action, i) => {
              const Icon = action.icon;
              return (
                <motion.div
                  key={action.href}
                  initial={{ opacity: 0, y: 16, scale: 0.85 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 380, damping: 24, delay: i * 0.04 }}
                  className="flex items-center gap-3"
                >
                  <span className="rounded-2xl bg-white/90 px-3 py-1.5 text-sm font-semibold text-ink shadow-md backdrop-blur dark:bg-[#1a2236]/95 dark:text-slate-200">
                    {action.label}
                  </span>
                  <Link
                    href={action.href}
                    onClick={() => setOpen(false)}
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl shadow-lg transition hover:scale-105 active:scale-95 ${action.color}`}
                  >
                    <Icon className="h-5 w-5" />
                  </Link>
                </motion.div>
              );
            })}
          </>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.button
        type="button"
        onClick={() => setOpen((o) => !o)}
        suppressHydrationWarning
        whileTap={{ scale: 0.93 }}
        whileHover={{ scale: 1.07 }}
        transition={{ type: "spring", stiffness: 400, damping: 22 }}
        className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#132032] text-white shadow-xl dark:bg-white dark:text-[#132032]"
        aria-label={open ? "Close quick actions" : "Open quick actions"}
      >
        <motion.div
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          {open ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
        </motion.div>
      </motion.button>
    </div>
  );
}

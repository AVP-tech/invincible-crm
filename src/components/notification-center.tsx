"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, CheckCircle2, MessageSquare, KanbanSquare, User2 } from "lucide-react";

type Notification = {
  id: string;
  icon: typeof Bell;
  iconColor: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
};

const SAMPLE_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    icon: CheckCircle2,
    iconColor: "text-moss bg-moss/10",
    title: "Task completed",
    description: "Follow-up with Raj Mehta was marked done.",
    time: "2m ago",
    read: false,
  },
  {
    id: "2",
    icon: KanbanSquare,
    iconColor: "text-ember bg-ember/10",
    title: "Deal stage updated",
    description: "\"Acme Corp\" moved to Proposal stage.",
    time: "18m ago",
    read: false,
  },
  {
    id: "3",
    icon: MessageSquare,
    iconColor: "text-blue-500 bg-blue-500/10",
    title: "New inbox message",
    description: "Sarah replied to your email thread.",
    time: "1h ago",
    read: true,
  },
  {
    id: "4",
    icon: User2,
    iconColor: "text-gold bg-gold/10",
    title: "Contact added",
    description: "AI Capture created a new contact: Priya Singh.",
    time: "3h ago",
    read: true,
  },
];

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(SAMPLE_NOTIFICATIONS);

  const unread = notifications.filter((n) => !n.read).length;

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const dismiss = (id: string) =>
    setNotifications((prev) => prev.filter((n) => n.id !== id));

  return (
    <div className="relative">
      {/* Bell trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-black/10 bg-white/80 text-slate-600 shadow-sm transition hover:scale-105 hover:shadow-md active:scale-95 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-ember text-[9px] font-bold text-white"
          >
            {unread}
          </motion.span>
        )}
      </button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-30"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              className="absolute right-0 top-12 z-40 w-[360px] overflow-hidden rounded-3xl border border-black/8 bg-white/95 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-[#151a24]/97"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-black/5 px-5 py-4 dark:border-white/5">
                <div>
                  <p className="text-sm font-semibold text-ink">Notifications</p>
                  {unread > 0 && (
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {unread} unread
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unread > 0 && (
                    <button
                      type="button"
                      onClick={markAllRead}
                      className="text-xs font-medium text-moss transition hover:text-moss/70"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-xl p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/10 dark:hover:text-slate-200"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* List */}
              <div className="max-h-[420px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">
                    All caught up 🎉
                  </div>
                ) : (
                  <ul className="p-2 space-y-0.5">
                    {notifications.map((notif) => {
                      const Icon = notif.icon;
                      return (
                        <motion.li
                          key={notif.id}
                          layout
                          initial={{ opacity: 1 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.2 }}
                          className={`group relative flex gap-3 rounded-2xl p-3 transition ${
                            !notif.read
                              ? "bg-moss/5 dark:bg-moss/10"
                              : "hover:bg-slate-50 dark:hover:bg-white/5"
                          }`}
                        >
                          <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${notif.iconColor}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <p className={`text-sm font-medium ${notif.read ? "text-slate-700 dark:text-slate-300" : "text-ink"}`}>
                                {notif.title}
                              </p>
                              {!notif.read && (
                                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-moss" />
                              )}
                            </div>
                            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                              {notif.description}
                            </p>
                            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                              {notif.time}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => dismiss(notif.id)}
                            className="absolute right-3 top-3 hidden rounded-lg p-0.5 text-slate-300 hover:text-slate-500 group-hover:block dark:text-slate-600 dark:hover:text-slate-300"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </motion.li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
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

/** 
 * Start with an empty list — real notifications will be fetched from the
 * backend once the notifications API is wired up.
 */
const INITIAL_NOTIFICATIONS: Notification[] = [];

const PANEL_WIDTH = 380;
const VIEWPORT_GUTTER = 16;

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [panelPosition, setPanelPosition] = useState({ top: 0, left: 0, width: PANEL_WIDTH });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  const unread = notifications.filter((n) => !n.read).length;

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const dismiss = (id: string) =>
    setNotifications((prev) => prev.filter((n) => n.id !== id));

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!open) {
      return;
    }

    const syncPosition = () => {
      const trigger = triggerRef.current;
      if (!trigger) {
        return;
      }

      const rect = trigger.getBoundingClientRect();
      const width = Math.min(PANEL_WIDTH, window.innerWidth - VIEWPORT_GUTTER * 2);
      const left = Math.min(
        Math.max(rect.right - width, VIEWPORT_GUTTER),
        window.innerWidth - width - VIEWPORT_GUTTER,
      );

      setPanelPosition({
        top: rect.bottom + 14,
        left,
        width,
      });
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    syncPosition();
    window.addEventListener("resize", syncPosition);
    window.addEventListener("scroll", syncPosition, true);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("resize", syncPosition);
      window.removeEventListener("scroll", syncPosition, true);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-controls={panelId}
        aria-expanded={open}
        className={`relative flex h-10 w-10 items-center justify-center rounded-2xl border text-slate-600 shadow-sm transition hover:scale-105 hover:shadow-md active:scale-95 dark:text-slate-300 ${
          open
            ? "border-gold/30 bg-white text-ink shadow-[0_14px_34px_rgba(19,32,50,0.12)] dark:border-white/15 dark:bg-white/10 dark:text-white"
            : "border-black/10 bg-white/85 dark:border-white/10 dark:bg-white/5"
        }`}
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

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <>
                <motion.button
                  type="button"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[69] bg-[#132032]/10 backdrop-blur-[2px]"
                  onClick={() => setOpen(false)}
                  aria-label="Close notifications"
                />
                <motion.div
                  id={panelId}
                  role="dialog"
                  aria-label="Notifications"
                  initial={{ opacity: 0, y: -12, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -12, scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  className="fixed z-[70] overflow-hidden rounded-[2rem] border border-[#f5ecd8] bg-[rgba(255,252,246,0.98)] shadow-[0_32px_90px_rgba(19,32,50,0.18)] ring-1 ring-black/5 backdrop-blur-xl dark:border-white/10 dark:bg-[rgba(22,28,40,0.96)]"
                  style={{
                    top: panelPosition.top,
                    left: panelPosition.left,
                    width: panelPosition.width,
                  }}
                >
                  <div className="border-b border-black/5 bg-gradient-to-b from-white to-[#fff6e8] px-5 py-4 dark:border-white/5 dark:from-slate-900 dark:to-slate-900">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</p>
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
                            className="text-xs font-medium text-moss transition-colors hover:text-moss/80"
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
                  </div>

                  <div className="max-h-[min(28rem,calc(100vh-7rem))] overflow-y-auto overflow-x-hidden px-3 py-3">
                    {notifications.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="py-12 text-center text-sm text-slate-500 dark:text-slate-400"
                      >
                        All caught up.
                      </motion.div>
                    ) : (
                      <ul className="flex flex-col gap-2">
                        <AnimatePresence initial={false}>
                          {notifications.map((notif) => {
                            const Icon = notif.icon;
                            return (
                              <motion.li
                                key={notif.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, height: 0, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                className={`group relative flex gap-3 rounded-[1.5rem] border p-3.5 shadow-sm transition-colors ${
                                  !notif.read
                                    ? "border-moss/15 bg-white/90 dark:border-moss/20 dark:bg-white/5"
                                    : "border-transparent bg-transparent hover:border-black/5 hover:bg-white/80 dark:hover:border-white/10 dark:hover:bg-white/5"
                                }`}
                              >
                                <div
                                  className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl ${notif.iconColor}`}
                                >
                                  <Icon className="h-4 w-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-start justify-between gap-2">
                                    <p
                                      className={`text-sm font-medium ${
                                        notif.read ? "text-slate-600 dark:text-slate-300" : "text-slate-900 dark:text-white"
                                      }`}
                                    >
                                      {notif.title}
                                    </p>
                                    {!notif.read && (
                                      <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-moss" />
                                    )}
                                  </div>
                                  <p className="mt-0.5 text-xs leading-5 text-slate-500 dark:text-slate-400">
                                    {notif.description}
                                  </p>
                                  <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                                    {notif.time}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => dismiss(notif.id)}
                                  className="absolute right-3 top-3 hidden rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-200/50 hover:text-slate-600 group-hover:block dark:text-slate-500 dark:hover:bg-white/10 dark:hover:text-slate-300"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </motion.li>
                            );
                          })}
                        </AnimatePresence>
                      </ul>
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
}

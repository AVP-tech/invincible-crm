"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SidebarNav } from "./sidebar-nav";
import { Button } from "./ui/button";
import { ThemeToggle } from "./theme-toggle";

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="lg:hidden flex items-center gap-3">
      <ThemeToggle />
      <Button variant="secondary" onClick={() => setIsOpen(true)} className="px-3">
        <Menu className="h-5 w-5" />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-ink/20 backdrop-blur-sm dark:bg-black/60"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 w-[280px] flex flex-col bg-white shadow-2xl dark:bg-[#132032] p-5 overflow-y-auto"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-moss">Invincible CRM</p>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  suppressHydrationWarning
                  className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10 dark:text-slate-400"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation Wrapper (closes menu on click) */}
              <div onClick={() => setIsOpen(false)}>
                <SidebarNav />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

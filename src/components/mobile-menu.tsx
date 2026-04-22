"use client";

import { useEffect, useState } from "react";
import { Menu, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SidebarNav } from "./sidebar-nav";
import { Button } from "./ui/button";
import { ThemeToggle } from "./theme-toggle";
import { openCommandPalette } from "@/components/command-palette-events";

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    if (isOpen) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  return (
    <div className="lg:hidden flex items-center gap-3">
      <ThemeToggle />
      <Button
        type="button"
        variant="secondary"
        onClick={() => {
          openCommandPalette();
          setIsOpen(false);
        }}
        aria-label="Open quick search"
        className="px-3"
      >
        <Search className="h-5 w-5" />
      </Button>
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
              className="fixed inset-y-0 left-0 z-50 flex w-screen max-w-full flex-col overflow-y-auto bg-white shadow-2xl dark:bg-[#132032]"
              style={{
                paddingTop: "max(1.25rem, env(safe-area-inset-top))",
                paddingRight: "max(1.25rem, env(safe-area-inset-right))",
                paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))",
                paddingLeft: "max(1.25rem, env(safe-area-inset-left))",
              }}
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

              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  openCommandPalette();
                  setIsOpen(false);
                }}
                className="mt-4 w-full justify-start gap-2"
              >
                <Search className="h-4 w-4" />
                Quick search
              </Button>

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

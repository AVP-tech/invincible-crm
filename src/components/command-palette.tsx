"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Command, Users, KanbanSquare, CheckSquare, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { navigation } from "@/components/sidebar-nav";

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    contacts: any[];
    deals: any[];
    tasks: any[];
  }>({ contacts: [], deals: [], tasks: [] });
  
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
      if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      // Use short timeout to ensure element is mounted
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  // Debounced Database Search
  useEffect(() => {
    if (query.trim().length === 0) {
      setResults({ contacts: [], deals: [], tasks: [] });
      setLoading(false);
      return;
    }

    setLoading(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch {
        setResults({ contacts: [], deals: [], tasks: [] });
      } finally {
        setLoading(false);
      }
    }, 250); // 250ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const filteredNav = navigation.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (href: string) => {
    setIsOpen(false);
    router.push(href);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-ink/20 backdrop-blur-sm dark:bg-black/40"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -10 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="w-full max-w-xl overflow-hidden rounded-3xl border border-black/10 bg-white/90 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-[#151a24]/95 pointer-events-auto"
            >
              <div className="flex items-center gap-3 border-b border-black/5 px-4 py-4 dark:border-white/5">
                <Search className="h-5 w-5 text-slate-400" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Where do you want to go?"
                  className="flex-1 bg-transparent text-lg text-ink outline-none placeholder:text-slate-400 dark:text-slate-100"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <div className="flex shrink-0 items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-500 dark:bg-white/10 dark:text-slate-400">
                  <Command className="h-3 w-3" />
                  <span>K</span>
                </div>
              </div>
              <div className="max-h-[60vh] overflow-y-auto p-2">
                
                {/* 1. Database Search Results */}
                {query.length > 0 && (
                  <div className="mb-4 space-y-4">
                    {loading && (
                      <div className="flex items-center justify-center p-4 text-slate-400">
                        <Loader2 className="h-5 w-5 animate-spin" />
                      </div>
                    )}
                    
                    {!loading && results.contacts.length === 0 && results.deals.length === 0 && results.tasks.length === 0 && filteredNav.length === 0 && (
                      <p className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                        No results found for &quot;{query}&quot;.
                      </p>
                    )}

                    {!loading && results.contacts.length > 0 && (
                      <div>
                        <p className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-widest">Contacts</p>
                        <ul className="space-y-1">
                          {results.contacts.map((contact) => (
                            <li key={contact.id}>
                              <button
                                onClick={() => handleSelect(`/contacts/${contact.id}`)}
                                className="group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-ink dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                              >
                                <Users className="h-4 w-4 text-moss/60 group-hover:text-moss" />
                                <span>{contact.name}</span>
                                {contact.company && <span className="text-slate-400 font-normal ml-2">— {contact.company.name}</span>}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {!loading && results.deals.length > 0 && (
                      <div>
                        <p className="px-4 mt-2 py-2 text-xs font-semibold text-slate-400 uppercase tracking-widest">Deals</p>
                        <ul className="space-y-1">
                          {results.deals.map((deal) => (
                            <li key={deal.id}>
                              <button
                                onClick={() => handleSelect(`/deals/${deal.id}`)}
                                className="group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-ink dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                              >
                                <KanbanSquare className="h-4 w-4 text-ember/60 group-hover:text-ember" />
                                <span>{deal.title}</span>
                                {deal.contact && <span className="text-slate-400 font-normal ml-2">— {deal.contact.name}</span>}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {!loading && results.tasks.length > 0 && (
                      <div>
                        <p className="px-4 mt-2 py-2 text-xs font-semibold text-slate-400 uppercase tracking-widest">Tasks</p>
                        <ul className="space-y-1">
                          {results.tasks.map((task) => (
                            <li key={task.id}>
                              <button
                                onClick={() => handleSelect(`/tasks`)} // Global tasks page till custom exists
                                className="group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-ink dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                              >
                                <CheckSquare className="h-4 w-4 text-gold/60 group-hover:text-[#8a6a1a]" />
                                <span>{task.title}</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. Navigation Results */}
                {(filteredNav.length > 0 || query.length === 0) && (
                  <div>
                    {query.length > 0 && <p className="px-4 py-2 mt-2 text-xs font-semibold text-slate-400 uppercase tracking-widest">Navigation</p>}
                    <ul className="space-y-1">
                      {filteredNav.map((item) => {
                        const Icon = item.icon;
                        return (
                          <li key={item.href}>
                            <button
                              type="button"
                              onClick={() => handleSelect(item.href)}
                              className="group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-ink dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                            >
                              <Icon className="h-4 w-4 text-slate-400 transition group-hover:text-ink dark:text-slate-500 dark:group-hover:text-white" />
                              {item.label}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

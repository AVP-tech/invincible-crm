"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, Loader2, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export function CaptainBotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [showGreeting, setShowGreeting] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Ahoy there, matey! I'm Captain Hook. How can I help you navigate your CRM today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const openWidget = () => {
    setShowGreeting(false);
    setIsOpen(true);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    const newMessages: Message[] = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const res = await fetch("/api/captain/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages })
      });

      const data = await res.json().catch(() => null);
      const reply = typeof data?.reply === "string" ? data.reply.trim() : "";

      if (!res.ok || !reply) {
        throw new Error("Captain Hook reply failed");
      }

      setMessages([...newMessages, { role: "assistant", content: reply }]);
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "Argh! The comms are down. Try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-4 z-[10000] flex flex-col items-end gap-3 sm:bottom-28 sm:right-6 lg:right-8">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: "spring", damping: 24, stiffness: 280 }}
            className="flex h-[min(36rem,calc(100dvh-8rem))] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-[1.75rem] border border-gold/20 bg-[#132032]/95 shadow-[0_24px_60px_rgba(2,8,23,0.45)] backdrop-blur-xl sm:w-[24rem]"
          >
            <div className="flex items-center justify-between border-b border-white/10 bg-black/40 px-4 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-gold/40">
                  <Image
                    src="/captain-bot.png"
                    alt="Captain Avatar"
                    fill
                    className="object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  <Bot className="absolute inset-0 m-auto h-6 w-6 text-gold" />
                </div>
                <div className="min-w-0">
                  <h3 className="truncate font-semibold text-white">Captain Hook</h3>
                  <p className="text-xs text-emerald-400">Always on Duty</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Close Captain Hook chat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={"flex " + (msg.role === "user" ? "justify-end" : "justify-start")}
                >
                  <div
                    className={"max-w-[85%] rounded-2xl px-4 py-2 text-sm " + (
                      msg.role === "user"
                        ? "rounded-tr-none bg-gold text-black"
                        : "rounded-tl-none border border-white/5 bg-white/10 text-slate-200"
                    )}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-tl-none border border-white/5 bg-white/10 px-4 py-3 text-white/50">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-white/10 bg-black/40 p-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Captain Hook..."
                  className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder-white/40 outline-none transition focus:border-gold/50 focus:bg-white/10"
                />
                <Button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  variant="primary"
                  className="h-10 w-10 shrink-0 rounded-xl bg-gold p-0 text-black hover:bg-gold/80"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            className="flex items-end gap-3"
          >
            {showGreeting && (
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
                className="relative hidden max-w-[220px] rounded-2xl border border-gold/30 bg-[#132032] px-4 py-3 pr-10 shadow-[0_0_20px_rgba(230,193,106,0.2)] sm:block"
              >
                <button
                  type="button"
                  onClick={() => setShowGreeting(false)}
                  className="absolute right-2 top-2 rounded-full p-1 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="Dismiss Captain Hook greeting"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                <p className="text-xs leading-relaxed text-slate-200">
                  Ahoy! I&apos;m <strong className="text-gold">Captain Hook</strong>.
                  <br />
                  Need a hand with your CRM?
                </p>
                <div className="absolute -right-[6px] top-1/2 -mt-1.5 h-0 w-0 border-y-[6px] border-l-[6px] border-y-transparent border-l-gold/30" />
                <div className="absolute -right-[5px] top-1/2 -mt-1.5 h-0 w-0 border-y-[6px] border-l-[6px] border-y-transparent border-l-[#132032]" />
              </motion.div>
            )}

            <button
              type="button"
              onClick={openWidget}
              className="group relative flex h-14 w-14 items-center justify-center rounded-full border-2 border-gold/50 bg-[#132032] shadow-[0_0_20px_rgba(230,193,106,0.3)] transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(230,193,106,0.45)]"
              aria-label="Open Captain Hook chat"
            >
              <div className="absolute inset-0 overflow-hidden rounded-full">
                <Image
                  src="/captain-bot.png"
                  alt="Captain Hook"
                  fill
                  className="object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
              <Bot className="h-7 w-7 text-gold drop-shadow-[0_0_5px_rgba(230,193,106,0.8)]" />

              <span className="absolute -right-1 -top-1 flex h-4 w-4">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-4 w-4 rounded-full border border-black bg-emerald-500" />
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

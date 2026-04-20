"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Bot, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export function CaptainBotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Ahoy there, matey! I'm Captain Bot. How can I help you navigate your CRM today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim()) return;

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
      const data = await res.json();
      
      setMessages([...newMessages, { role: "assistant", content: data.reply }]);
    } catch (error) {
      setMessages([...newMessages, { role: "assistant", content: "Argh! The comms are down. Try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-[9999]"
          >
            <button
              onClick={() => setIsOpen(true)}
              className="group relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-gold/50 bg-[#132032] shadow-[0_0_20px_rgba(230,193,106,0.3)] transition-all hover:scale-110 hover:shadow-[0_0_30px_rgba(230,193,106,0.5)]"
            >
              {/* Dynamic Image or fallback icon */}
              <div className="absolute inset-0 overflow-hidden rounded-full">
                <Image
                  src="/captain-bot.png"
                  alt="Captain Bot"
                  fill
                  className="object-cover"
                  onError={(e) => {
                    // Fallback if image not uploaded yet
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              <Bot className="h-8 w-8 text-gold drop-shadow-[0_0_5px_rgba(230,193,106,0.8)]" />
              
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-4 w-4 rounded-full bg-emerald-500 border border-black"></span>
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-[10000] flex h-[500px] w-[350px] flex-col overflow-hidden rounded-2xl border border-gold/20 bg-[#132032]/95 shadow-[0_0_40px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:h-[600px] sm:w-[400px]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 bg-black/40 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 overflow-hidden rounded-full border border-gold/40">
                   <Image src="/captain-bot.png" alt="Captain Avatar" fill className="object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                   <Bot className="absolute inset-0 m-auto h-6 w-6 text-gold" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Captain Bot</h3>
                  <p className="text-xs text-emerald-400">Always on Duty</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={idx}
                  className={"flex " + (msg.role === "user" ? "justify-end" : "justify-start")}
                >
                  <div
                    className={"max-w-[85%] rounded-2xl px-4 py-2 text-sm " + (
                      msg.role === "user"
                        ? "bg-gold text-black rounded-tr-none"
                        : "bg-white/10 text-slate-200 rounded-tl-none border border-white/5"
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

            {/* Input Area */}
            <div className="border-t border-white/10 bg-black/40 p-3">
              <form
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Captain Bot..."
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder-white/40 outline-none transition focus:border-gold/50 focus:bg-white/10"
                />
                <Button type="submit" disabled={!input.trim() || isLoading} variant="primary" className="h-10 w-10 p-0 rounded-xl bg-gold text-black hover:bg-gold/80">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

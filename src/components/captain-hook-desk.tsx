"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Bot, Compass, Loader2, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const STARTER_PROMPTS = [
  "Show me overdue follow-ups that need action today.",
  "What deals look stalled right now?",
  "Create a reminder to call Rahul tomorrow about the proposal.",
  "Where should this WhatsApp conversation go in the CRM?",
];

const shellClass =
  "overflow-hidden border border-black/6 bg-[radial-gradient(circle_at_top,rgba(255,243,214,0.92)_0%,rgba(255,251,244,0.98)_42%,rgba(245,238,225,0.98)_100%)] text-slate-950 shadow-[0_24px_80px_rgba(15,23,42,0.14)] dark:border-white/10 dark:bg-[radial-gradient(circle_at_top,rgba(255,239,196,0.94)_0%,rgba(245,238,225,0.98)_48%,rgba(232,223,206,0.98)_100%)] dark:text-slate-950";
const frostedPanelClass =
  "rounded-[1.75rem] border border-black/6 bg-white/76 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] backdrop-blur dark:border-black/10 dark:bg-white/72";
const softPanelClass =
  "rounded-[1.5rem] border border-black/6 bg-white/80 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] dark:border-black/10 dark:bg-white/74";
const chatShellClass =
  "flex min-h-[28rem] flex-col rounded-[1.75rem] border border-black/7 bg-[linear-gradient(180deg,rgba(255,255,255,0.74),rgba(245,238,225,0.92))] shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]";
const assistantBubbleClass =
  "rounded-[1.4rem] rounded-tl-md border border-black/7 bg-white/88 text-slate-800 shadow-sm";
const textAreaClass =
  "min-h-[110px] border-black/10 bg-white/92 text-slate-950 placeholder:text-slate-500 dark:!border-black/10 dark:!bg-white/92 dark:!text-slate-950 dark:placeholder:!text-slate-500";

export function CaptainHookDesk() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Captain Hook reporting in. Ask me what needs attention, what is slipping, or what you want saved into the CRM.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  async function sendMessage(rawInput: string) {
    const userMessage = rawInput.trim();
    if (!userMessage || isLoading) {
      return;
    }

    const nextMessages: Message[] = [
      ...messages,
      { role: "user", content: userMessage },
    ];

    setInput("");
    setMessages(nextMessages);
    setIsLoading(true);

    try {
      const response = await fetch("/api/captain/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });

      const data = await response.json().catch(() => null);
      const reply = typeof data?.reply === "string" ? data.reply.trim() : "";

      if (!response.ok || !reply) {
        throw new Error("Captain Hook reply failed");
      }

      setMessages([...nextMessages, { role: "assistant", content: reply }]);
    } catch {
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content:
            "Captain Hook hit rough waters for a moment. Try that again and I will take another pass.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className={shellClass}>
      <CardHeader className="border-b border-black/8 pb-5 dark:border-black/10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-[#9b6d14]">
              <Compass className="h-4 w-4" />
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em]">
                Captain Hook Desk
              </p>
            </div>
            <h3 className="mt-3 text-2xl font-semibold text-slate-950">
              One place for guidance, search, and quick saves
            </h3>
            <p className="mt-3 text-sm leading-7 text-slate-700">
              Captain Hook is your embedded CRM copilot. Ask what needs
              attention, where something belongs, or tell it to save a task,
              reminder, deal, or note.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 lg:max-w-sm lg:justify-end">
            {STARTER_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => setInput(prompt)}
                className="rounded-full border border-black/8 bg-white/75 px-3 py-2 text-left text-xs font-medium text-slate-800 transition hover:border-gold/30 hover:bg-gold/[0.12] hover:text-slate-950"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="grid gap-6 p-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className={frostedPanelClass}>
          <div className="flex items-center gap-3">
            <div className="relative h-14 w-14 overflow-hidden rounded-full border border-gold/30 bg-[#132032]">
              <Image
                src="/captain-bot.png"
                alt="Captain Hook"
                fill
                className="object-cover"
              />
              <Bot className="absolute inset-0 m-auto h-6 w-6 text-gold" />
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-950">Captain Hook</p>
              <p className="text-sm text-emerald-600">On duty, minus the chaos</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className={softPanelClass}>
              <p className="text-sm font-semibold text-slate-950">Best for</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                Surfacing overdue follow-ups, triaging stalled deals, finding
                buried context, and saving quick updates without switching
                screens.
              </p>
            </div>

            <div className={softPanelClass}>
              <div className="flex items-center gap-2 text-[#c38b2d]">
                <Sparkles className="h-4 w-4" />
                <p className="text-sm font-semibold text-slate-950">Good prompts</p>
              </div>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
                <li>&ldquo;What should I follow up on first today?&rdquo;</li>
                <li>&ldquo;Find anything related to Rahul or BrightPath.&rdquo;</li>
                <li>&ldquo;Create a task to send the proposal on Friday.&rdquo;</li>
                <li>&ldquo;Which deals look cold right now?&rdquo;</li>
              </ul>
            </div>
          </div>
        </div>

        <div className={chatShellClass}>
          <div className="border-b border-black/8 px-4 py-3 dark:border-black/10">
            <p className="text-sm font-semibold text-slate-950">Captain chat</p>
            <p className="mt-1 text-xs text-slate-600">
              Calm, embedded, and out of the way.
            </p>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((message, index) => (
              <motion.div
                key={`${message.role}-${index}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={
                  "flex " +
                  (message.role === "user" ? "justify-end" : "justify-start")
                }
              >
                <div
                  className={
                    "max-w-[85%] rounded-[1.4rem] px-4 py-3 text-sm leading-6 " +
                    (message.role === "user"
                      ? "rounded-tr-md bg-gold text-black"
                      : `rounded-tl-md ${assistantBubbleClass}`)
                  }
                >
                  {message.content}
                </div>
              </motion.div>
            ))}

            {isLoading ? (
              <div className="flex justify-start">
                <div className={`rounded-[1.4rem] rounded-tl-md px-4 py-3 ${assistantBubbleClass}`}>
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            ) : null}

            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              void sendMessage(input);
            }}
            className="border-t border-black/8 p-4 dark:border-black/10"
          >
            <div className="space-y-3">
              <Textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask Captain Hook something useful..."
                className={textAreaClass}
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="bg-gold text-black hover:bg-gold/85"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Send to Captain Hook
                </Button>
              </div>
            </div>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}

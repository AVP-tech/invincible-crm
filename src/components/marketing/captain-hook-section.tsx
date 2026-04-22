"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Bot,
  Compass,
  GripHorizontal,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { ScrollReveal } from "@/components/scroll-reveal";
import { TiltCard } from "@/components/tilt-card";

type CaptainHookSectionProps = {
  ctaHref: string;
  userPresent: boolean;
};

const capabilityCards = [
  {
    title: "Stays out of the way",
    description:
      "Captain Hook lives on the edge of the screen and stays draggable, so the workspace remains clean.",
    icon: Compass,
  },
  {
    title: "Finds the next move",
    description:
      "Ask for overdue follow-ups, stalled deals, or where a conversation belongs and it points you there fast.",
    icon: Search,
  },
  {
    title: "Feels like a teammate",
    description:
      "It is designed to guide, not interrupt, with answers that feel more like a sharp operator than a support widget.",
    icon: ShieldCheck,
  },
];

const statusPills = [
  "3 stalled deals surfaced",
  "7 overdue follow-ups found",
  "Search opened instantly",
];

const captainDemos = [
  {
    id: "triage",
    label: "Deal triage",
    intro: "Want me to surface overdue follow-ups, stalled deals, or the cleanest next step?",
    userPrompt: "Show me what is slipping and where I should jump in.",
    response:
      "I found 3 deals cooling down, 7 follow-ups overdue, and 1 inbox conversation that should become a task right now.",
    pills: [
      "3 stalled deals surfaced",
      "7 overdue follow-ups found",
      "1 task suggested",
    ],
    footer:
      "Best when you want the fastest operational read before the day runs away.",
  },
  {
    id: "search",
    label: "Instant search",
    intro: "Give me a name, company, or half-remembered task and I will pull the thread fast.",
    userPrompt: "Find everything tied to Rahul and tell me what still needs attention.",
    response:
      "Rahul is linked to 1 open deal, 2 conversation captures, and 1 proposal follow-up due tomorrow. Search is ready.",
    pills: [
      "Rahul context found",
      "Proposal task highlighted",
      "Search opened instantly",
    ],
    footer:
      "Perfect when the team remembers fragments and still needs a clean answer quickly.",
  },
  {
    id: "route",
    label: "Conversation routing",
    intro: "Drop a rough chat, voice-note summary, or messy update and I can point it to the right place.",
    userPrompt: "This WhatsApp conversation sounds serious. Where should it go?",
    response:
      "This should become a contact, a proposal-stage deal, and a follow-up task for Friday so the handoff stays clean.",
    pills: [
      "Contact route suggested",
      "Deal stage identified",
      "Follow-up locked in",
    ],
    footer:
      "Strongest when raw conversation energy needs structure before it cools down.",
  },
];

export function CaptainHookSection({
  ctaHref,
  userPresent,
}: CaptainHookSectionProps) {
  const [activeDemoId, setActiveDemoId] = useState(captainDemos[0].id);
  const activeDemo =
    captainDemos.find((demo) => demo.id === activeDemoId) ?? captainDemos[0];

  return (
    <section className="py-8 lg:py-12">
      <div className="grid items-center gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
        <ScrollReveal variant="fade-up">
          <div className="max-w-2xl">
            <p className="cinematic-label text-gold/55">Meet Captain Hook</p>
            <h2 className="mt-4 font-serif text-4xl leading-tight text-white lg:text-6xl">
              A floating copilot with actual presence
            </h2>
            <p className="mt-6 text-lg leading-8 text-white/64">
              Captain Hook should feel like the sharp operator who always knows
              what to do next, not a chat bubble parked in the middle of your
              screen. So it stays docked, draggable, and ready whenever you
              need guidance.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href={ctaHref} className="cinematic-enter-button">
                {userPresent
                  ? "Open Captain Hook in the app"
                  : "See Captain Hook in action"}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/book-demo"
                className="rounded-full border border-white/12 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white/80 transition hover:border-gold/20 hover:bg-gold/[0.06] hover:text-white"
              >
                Book a guided walkthrough
              </Link>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {capabilityCards.map((card, index) => {
                const Icon = card.icon;

                return (
                  <TiltCard
                    key={card.title}
                    className="rounded-[1.7rem] border border-white/10 bg-white/[0.035] p-5 backdrop-blur-sm"
                    tiltIntensity={4}
                    glareOpacity={0.06}
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.08 * index, duration: 0.45 }}
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-gold/20 bg-gold/10 text-gold">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="mt-4 text-base font-semibold text-white">
                        {card.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-white/55">
                        {card.description}
                      </p>
                    </motion.div>
                  </TiltCard>
                );
              })}
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {captainDemos.map((demo) => (
                <button
                  key={demo.id}
                  type="button"
                  onClick={() => setActiveDemoId(demo.id)}
                  className={
                    "rounded-full border px-4 py-2 text-sm font-medium transition " +
                    (activeDemo.id === demo.id
                      ? "border-gold/30 bg-gold/10 text-white shadow-[0_0_0_1px_rgba(230,193,106,0.12)]"
                      : "border-white/12 bg-white/[0.035] text-white/65 hover:border-white/20 hover:bg-white/[0.06] hover:text-white")
                  }
                >
                  {demo.label}
                </button>
              ))}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal variant="fade-up" delay={0.12}>
          <div className="relative">
            <div className="pointer-events-none absolute inset-0 -z-10">
              <div className="absolute left-[6%] top-[12%] h-32 w-32 rounded-full bg-gold/12 blur-3xl" />
              <div className="absolute bottom-[8%] right-[8%] h-40 w-40 rounded-full bg-emerald-500/12 blur-3xl" />
            </div>

            <TiltCard
              className="relative overflow-hidden rounded-[2.2rem] border border-gold/15 bg-[radial-gradient(circle_at_top,#16263d_0%,#09111d_44%,#050913_100%)] p-6 shadow-[0_30px_90px_rgba(2,8,23,0.45)]"
              tiltIntensity={5}
              glareOpacity={0.08}
            >
              <div className="absolute inset-0 opacity-30">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
                <div className="absolute left-8 top-10 h-36 w-36 rounded-full border border-gold/10" />
                <div className="absolute right-10 top-16 h-24 w-24 rounded-full border border-white/8" />
              </div>

              <div className="relative flex items-center justify-between gap-4">
                <div>
                  <p className="cinematic-label text-gold/45">Always on deck</p>
                  <h3 className="mt-2 font-serif text-3xl text-white">
                    Captain Hook
                  </h3>
                  <p className="mt-2 max-w-md text-sm leading-6 text-white/58">
                    Quiet when you are working. Decisive when you need a nudge.
                  </p>
                </div>

                <div className="flex items-center gap-2 rounded-full border border-gold/15 bg-gold/10 px-3 py-2 text-xs font-semibold text-gold">
                  <GripHorizontal className="h-3.5 w-3.5" />
                  Drag me where you want
                </div>
              </div>

              <div className="relative mt-5 flex flex-wrap gap-2">
                {captainDemos.map((demo) => (
                  <button
                    key={demo.id}
                    type="button"
                    onClick={() => setActiveDemoId(demo.id)}
                    className={
                      "rounded-full border px-3 py-2 text-xs font-semibold transition " +
                      (activeDemo.id === demo.id
                        ? "border-gold/30 bg-gold/12 text-gold"
                        : "border-white/10 bg-white/[0.035] text-white/60 hover:border-white/20 hover:text-white")
                    }
                  >
                    {demo.label}
                  </button>
                ))}
              </div>

              <div className="relative mt-7 grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
                <div className="rounded-[1.8rem] border border-white/10 bg-black/25 p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                    <motion.div
                      animate={{ y: [0, -3, 0], rotate: [0, -1, 0, 1, 0] }}
                      transition={{
                        duration: 4.8,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="relative h-11 w-11 overflow-hidden rounded-full border border-gold/30 bg-[#132032]"
                    >
                      <Image
                        src="/captain-bot.png"
                        alt="Captain Hook"
                        fill
                        className="object-cover"
                      />
                      <Bot className="absolute inset-0 m-auto h-5 w-5 text-gold" />
                    </motion.div>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        Captain Hook
                      </p>
                      <p className="text-xs text-emerald-400">On duty</p>
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeDemo.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.28, ease: "easeOut" }}
                      className="space-y-3 pt-4"
                    >
                      <div className="max-w-[82%] rounded-[1.4rem] rounded-tl-md border border-white/8 bg-white/10 px-4 py-3 text-sm leading-6 text-slate-200">
                        {activeDemo.intro}
                      </div>
                      <div className="ml-auto max-w-[80%] rounded-[1.4rem] rounded-tr-md bg-gold px-4 py-3 text-sm font-medium leading-6 text-black">
                        {activeDemo.userPrompt}
                      </div>
                      <div className="max-w-[85%] rounded-[1.4rem] rounded-tl-md border border-gold/15 bg-gold/[0.08] px-4 py-3 text-sm leading-6 text-slate-100">
                        {activeDemo.response}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-white">
                      <Sparkles className="h-4 w-4 text-gold" />
                      Live instincts
                    </div>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeDemo.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.24, ease: "easeOut" }}
                        className="mt-4 flex flex-wrap gap-2"
                      >
                        {activeDemo.pills.map((pill, index) => (
                          <motion.span
                            key={pill}
                            initial={{ opacity: 0, scale: 0.92 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                              delay: 0.06 * index,
                              duration: 0.24,
                              ease: "easeOut",
                            }}
                            className="rounded-full border border-white/12 bg-white/[0.05] px-3 py-2 text-xs font-medium text-white/72"
                          >
                            {pill}
                          </motion.span>
                        ))}
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  <div className="rounded-[1.8rem] border border-gold/15 bg-gold/[0.05] p-4">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-gold/55">
                      Why it lands
                    </p>
                    <p className="mt-3 text-sm leading-7 text-white/68">
                      The page explains Captain Hook like a character with a
                      job. The product keeps it tucked to the side like a
                      disciplined tool. That balance feels premium.
                    </p>
                    <p className="mt-3 text-sm leading-7 text-gold/70">
                      {activeDemo.footer}
                    </p>
                  </div>

                  <div className="relative overflow-hidden rounded-[1.8rem] border border-white/10 bg-[#132032]/90 p-4">
                    <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-gold/[0.12] to-transparent" />
                    <div className="relative flex items-center gap-3">
                      <motion.div
                        animate={{
                          y: [0, -4, 0],
                          boxShadow: [
                            "0 0 24px rgba(230,193,106,0.18)",
                            "0 0 34px rgba(230,193,106,0.3)",
                            "0 0 24px rgba(230,193,106,0.18)",
                          ],
                        }}
                        transition={{
                          duration: 4.2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-gold/35"
                      >
                        <Image
                          src="/captain-bot.png"
                          alt="Captain Hook portrait"
                          fill
                          className="object-cover"
                        />
                      </motion.div>
                      <div>
                        <p className="text-lg font-semibold text-white">
                          Not another widget
                        </p>
                        <p className="mt-1 text-sm text-white/58">
                          More like your sharpest closer floating one tap away.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TiltCard>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

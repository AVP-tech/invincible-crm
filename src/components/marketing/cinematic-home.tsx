"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  KanbanSquare,
  LayoutDashboard,
  Rocket,
  Sparkles,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CinematicIntro } from "@/components/cinematic-intro";

type HomeUser = {
  name: string;
  onboardingCompleted: boolean;
} | null;

type ActionCard = {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const promptSamples = [
  "Call Rahul tomorrow about the proposal",
  "Met Neha today from ABC Studio, budget 80k, send proposal Friday",
  "Follow up with Karan in 3 days, he wants a CRM for his sales team",
];

const previewCards = [
  {
    eyebrow: "Contact",
    title: "Rahul Mehra",
    description: "Proposal conversation linked to BrightPath Studio.",
  },
  {
    eyebrow: "Deal",
    title: "Website redesign · 80k",
    description: "Qualified and nudged into the proposal stage.",
  },
  {
    eyebrow: "Follow-up",
    title: "Send proposal Friday",
    description: "Due date recognized and task scheduled automatically.",
  },
];

/* Stagger orchestration for post-intro cascade */
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 1, 0.5, 1] as const },
  },
};

export function CinematicHome({ user }: { user: HomeUser }) {
  const [introComplete, setIntroComplete] = useState(false);
  const [isBooted, setIsBooted] = useState(false);
  const [promptIndex, setPromptIndex] = useState(0);

  /* After intro exits, boot the main page */
  useEffect(() => {
    if (introComplete) {
      const frame = requestAnimationFrame(() => setIsBooted(true));
      return () => cancelAnimationFrame(frame);
    }
  }, [introComplete]);

  /* Cycle prompts */
  useEffect(() => {
    if (!introComplete) return;
    const interval = window.setInterval(() => {
      setPromptIndex((c) => (c + 1) % promptSamples.length);
    }, 2600);
    return () => window.clearInterval(interval);
  }, [introComplete]);

  const nextStepHref = user
    ? user.onboardingCompleted
      ? "/dashboard"
      : "/welcome"
    : "/login";

  const greeting = user
    ? `Welcome back, ${user.name.split(" ")[0]}.`
    : "AI-first CRM for businesses that hate admin-heavy software.";

  const actionCards: ActionCard[] = user
    ? [
        {
          title: user.onboardingCompleted ? "Open dashboard" : "Continue onboarding",
          description: "Jump straight into the calm control center.",
          href: nextStepHref,
          icon: LayoutDashboard,
        },
        {
          title: "Capture an update",
          description: "Drop one sentence and let the CRM structure the work.",
          href: "/capture",
          icon: BrainCircuit,
        },
        {
          title: "Open deals pipeline",
          description: "See what is moving, stalled, or ready to close.",
          href: "/deals",
          icon: KanbanSquare,
        },
        {
          title: "Check follow-ups",
          description: "Review today, overdue, and recurring tasks in one place.",
          href: "/tasks",
          icon: CheckCircle2,
        },
      ]
    : [
        {
          title: "Enter the demo",
          description: "Use the seeded workspace and feel the product in seconds.",
          href: "/login",
          icon: Rocket,
        },
        {
          title: "Create your workspace",
          description: "Spin up your own CRM without the usual setup fatigue.",
          href: "/register",
          icon: UserPlus,
        },
        {
          title: "See the pipeline",
          description: "Walk straight into the kanban flow and activity view.",
          href: "/login",
          icon: KanbanSquare,
        },
        {
          title: "Try quick capture",
          description: "Start with a natural-language command instead of a form.",
          href: "/login",
          icon: BrainCircuit,
        },
      ];

  return (
    <>
      {/* ━━━ Cinematic Intro Overlay ━━━ */}
      <CinematicIntro onComplete={() => setIntroComplete(true)} />

      {/* ━━━ Main Landing Page ━━━ */}
      <motion.main
        className="relative min-h-screen overflow-hidden bg-[#03060d] text-white"
        initial={{ opacity: 0 }}
        animate={introComplete ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        {/* Background Effects */}
        <div className="pointer-events-none absolute inset-0">
          <div className="cinematic-orb left-[-8rem] top-[-6rem] h-[24rem] w-[24rem] bg-[#1d3c62]" />
          <div className="cinematic-orb bottom-[-10rem] right-[-8rem] h-[28rem] w-[28rem] bg-[#2f684a]" />
          <div className="cinematic-orb left-1/2 top-[20%] h-[18rem] w-[18rem] -translate-x-1/2 bg-[#7f4b21]" />
          <div className="cinematic-grid opacity-25" />
          <div className={cn("cinematic-blackout", isBooted && "cinematic-blackout-settled")} />
        </div>

        <motion.div
          className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col px-5 py-6 lg:px-8 lg:py-8"
          variants={containerVariants}
          initial="hidden"
          animate={isBooted ? "show" : "hidden"}
        >
          {/* ── Header ── */}
          <motion.header
            className="flex items-center justify-between gap-4"
            variants={itemVariants}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/8 text-sm font-semibold tracking-[0.2em] text-white/80 backdrop-blur-xl">
                IC
              </div>
              <div>
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.36em] text-white/45">
                  Invisible CRM
                </p>
                <p className="text-sm text-white/60">{greeting}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {user ? (
                <Link href={nextStepHref} className="cinematic-top-link">
                  Enter workspace
                </Link>
              ) : (
                <>
                  <Link href="/login" className="cinematic-top-link">
                    Sign in
                  </Link>
                  <Link href="/register" className="cinematic-top-link cinematic-top-link-strong">
                    Create account
                  </Link>
                </>
              )}
            </div>
          </motion.header>

          {/* ── Hero Grid ── */}
          <div className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[1.08fr_0.92fr] lg:py-14">
            <section className="max-w-3xl">
              <motion.p className="cinematic-label" variants={itemVariants}>
                Zero-input command center
              </motion.p>

              <motion.div className="mt-5" variants={itemVariants}>
                <span className={cn("cinematic-title", isBooted && "cinematic-title-active")}>
                  Invisible CRM
                </span>
                <p className="mt-4 max-w-2xl text-lg leading-8 text-white/70 lg:text-xl">
                  The CRM that cuts through the noise and gets straight to work. No clutter.
                  No endless forms. Just a sharp, intelligent workspace that listens first
                  and organizes everything after.
                </p>
              </motion.div>

              {/* Prompt Pills */}
              <motion.div className="mt-7 flex flex-wrap gap-3" variants={itemVariants}>
                {promptSamples.map((prompt, index) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => setPromptIndex(index)}
                    className={cn(
                      "rounded-full border px-4 py-2 text-left text-sm transition duration-300",
                      promptIndex === index
                        ? "border-white/30 bg-white/14 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
                        : "border-white/10 bg-white/[0.05] text-white/70 hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
                    )}
                  >
                    {prompt}
                  </button>
                ))}
              </motion.div>

              {/* CTA */}
              <motion.div
                className="mt-10 flex flex-wrap items-center gap-4"
                variants={itemVariants}
              >
                <Link href={nextStepHref} className="cinematic-enter-button">
                  Enter the workspace
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>

              {/* Action Cards */}
              <motion.div className="mt-10" variants={itemVariants}>
                <p className="cinematic-label text-white/50">Next move</p>
                <div className="mt-3">
                  <h2 className="font-serif text-4xl leading-tight text-white lg:text-5xl">
                    What&apos;s your next move?
                  </h2>
                  <p className="mt-3 max-w-2xl text-base leading-7 text-white/65">
                    Choose your intent. Invisible CRM routes you to the right place instantly —
                    no menus, no friction, no back-office feel.
                  </p>
                </div>

                <motion.div
                  className="mt-8 grid gap-4 sm:grid-cols-2"
                  variants={containerVariants}
                  initial="hidden"
                  animate={isBooted ? "show" : "hidden"}
                >
                  {actionCards.map((action) => {
                    const Icon = action.icon;
                    return (
                      <motion.div key={action.title} variants={itemVariants}>
                        <Link
                          href={action.href}
                          className="group cinematic-action-card cinematic-action-card-visible"
                          style={{ animationDelay: "0ms" }}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/12 bg-white/10 text-white/90">
                              <Icon className="h-5 w-5" />
                            </div>
                            <ArrowRight className="h-5 w-5 text-white/40 transition duration-300 group-hover:text-white/90" />
                          </div>
                          <div className="mt-7">
                            <p className="text-xl font-semibold text-white">{action.title}</p>
                            <p className="mt-2 text-sm leading-6 text-white/62">
                              {action.description}
                            </p>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </motion.div>
            </section>

            {/* ── Right Panel — AI Capture Preview ── */}
            <motion.aside className="relative" variants={itemVariants}>
              <div className="cinematic-panel cinematic-panel-feature cinematic-panel-feature-visible">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="cinematic-label text-white/45">AI quick capture</p>
                    <h3 className="mt-2 font-serif text-3xl text-white">
                      One sentence moves the whole CRM
                    </h3>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/12 bg-white/10">
                    <Sparkles className="h-5 w-5 text-white/85" />
                  </div>
                </div>

                <div className="mt-6 rounded-[1.75rem] border border-white/10 bg-black/30 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/35">
                    Live prompt
                  </p>
                  <p className="mt-4 text-xl leading-8 text-white">
                    {promptSamples[promptIndex]}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-medium text-emerald-100">
                      Contact detected
                    </span>
                    <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs font-medium text-amber-100">
                      Deal suggested
                    </span>
                    <span className="rounded-full border border-sky-300/20 bg-sky-300/10 px-3 py-1 text-xs font-medium text-sky-100">
                      Task queued
                    </span>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-3 lg:grid-cols-1">
                  {previewCards.map((card, index) => (
                    <motion.div
                      key={card.title}
                      className="cinematic-preview-card cinematic-preview-card-visible"
                      style={{ animationDelay: `${index * 120 + 260}ms` }}
                    >
                      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.32em] text-white/35">
                        {card.eyebrow}
                      </p>
                      <p className="mt-3 text-lg font-semibold text-white">{card.title}</p>
                      <p className="mt-2 text-sm leading-6 text-white/58">{card.description}</p>
                    </motion.div>
                  ))}
                </div>

                {!user ? (
                  <div className="mt-6 rounded-[1.6rem] border border-white/10 bg-white/[0.06] px-5 py-4 text-sm text-white/68">
                    Demo login is prefilled for speed:{" "}
                    <span className="font-semibold text-white">
                      demo@invisiblecrm.local / demo12345
                    </span>
                  </div>
                ) : null}
              </div>
            </motion.aside>
          </div>
        </motion.div>
      </motion.main>
    </>
  );
}

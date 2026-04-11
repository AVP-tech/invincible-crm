"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Crown,
  KanbanSquare,
  LayoutDashboard,
  Rocket,
  Sparkles,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CinematicIntro } from "@/components/cinematic-intro";
import { TiltCard } from "@/components/tilt-card";
import { ScrollReveal } from "@/components/scroll-reveal";

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

const techBadges = [
  { label: "AI Powered", delay: 0 },
  { label: "Auto Pipelines", delay: 0.15 },
  { label: "Smart Follow-ups", delay: 0.3 },
  { label: "Zero Admin", delay: 0.45 },
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
    : "The CRM that never drops the ball.";

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
          <div className="cinematic-orb left-[-8rem] top-[-6rem] h-[24rem] w-[24rem] bg-[#3d2a08]" />
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
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-gold/20 bg-gold/10 text-gold backdrop-blur-xl">
                <Crown className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.36em] text-gold/60">
                  Invincible CRM
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
              <motion.p className="cinematic-label text-gold/60" variants={itemVariants}>
                AI-powered command center
              </motion.p>

              <motion.div className="mt-5" variants={itemVariants}>
                <span className={cn("cinematic-title", isBooted && "cinematic-title-active")}>
                  Invincible
                </span>
                <p className="mt-4 max-w-2xl text-lg leading-8 text-white/70 lg:text-xl">
                  The CRM that never drops the ball. No clutter.
                  No endless forms. Just a sharp, intelligent workspace that listens first
                  and organizes everything after.
                </p>
              </motion.div>

              {/* Tech Badges — Floating */}
              <motion.div className="mt-6 flex flex-wrap gap-2" variants={itemVariants}>
                {techBadges.map((badge) => (
                  <motion.span
                    key={badge.label}
                    className="badge-shimmer rounded-full border border-gold/15 bg-gold/5 px-3 py-1.5 text-xs font-semibold text-gold/80"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={isBooted ? { opacity: 1, scale: 1 } : {}}
                    transition={{ delay: badge.delay + 0.5, type: "spring", stiffness: 300, damping: 20 }}
                  >
                    {badge.label}
                  </motion.span>
                ))}
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
                        ? "border-gold/30 bg-gold/10 text-white shadow-[0_0_0_1px_rgba(230,193,106,0.1)]"
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

              {/* Action Cards — with TiltCard */}
              <motion.div className="mt-10" variants={itemVariants}>
                <p className="cinematic-label text-gold/40">Next move</p>
                <div className="mt-3">
                  <h2 className="font-serif text-4xl leading-tight text-white lg:text-5xl">
                    What&apos;s your next move?
                  </h2>
                  <p className="mt-3 max-w-2xl text-base leading-7 text-white/65">
                    Choose your intent. Invincible CRM routes you to the right place instantly —
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
                        <TiltCard
                          className="cinematic-action-card cinematic-action-card-visible"
                          tiltIntensity={6}
                          glareOpacity={0.1}
                        >
                          <Link
                            href={action.href}
                            className="group block"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-gold/15 bg-gold/10 text-gold">
                                <Icon className="h-5 w-5" />
                              </div>
                              <ArrowRight className="h-5 w-5 text-white/40 transition duration-300 group-hover:text-gold" />
                            </div>
                            <div className="mt-7">
                              <p className="text-xl font-semibold text-white">{action.title}</p>
                              <p className="mt-2 text-sm leading-6 text-white/62">
                                {action.description}
                              </p>
                            </div>
                          </Link>
                        </TiltCard>
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
                    <p className="cinematic-label text-gold/45">AI quick capture</p>
                    <h3 className="mt-2 font-serif text-3xl text-white">
                      One sentence moves the whole CRM
                    </h3>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-gold/15 bg-gold/10">
                    <Sparkles className="h-5 w-5 text-gold" />
                  </div>
                </div>

                <div className="mt-6 rounded-[1.75rem] border border-white/10 bg-black/30 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold/35">
                    Live prompt
                  </p>
                  <motion.p
                    key={promptIndex}
                    className="mt-4 text-xl leading-8 text-white"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  >
                    {promptSamples[promptIndex]}
                  </motion.p>
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
                      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.32em] text-gold/35">
                        {card.eyebrow}
                      </p>
                      <p className="mt-3 text-lg font-semibold text-white">{card.title}</p>
                      <p className="mt-2 text-sm leading-6 text-white/58">{card.description}</p>
                    </motion.div>
                  ))}
                </div>

                {!user ? (
                  <div className="mt-6 rounded-[1.6rem] border border-gold/10 bg-gold/[0.04] px-5 py-4 text-sm text-white/68">
                    Demo login is prefilled for speed:{" "}
                    <span className="font-semibold text-gold">
                      demo@invisiblecrm.local / demo12345
                    </span>
                  </div>
                ) : null}
              </div>
            </motion.aside>
          </div>

          {/* ── Scroll Section: Why Invincible ── */}
          <ScrollReveal variant="fade-up" className="py-20">
            <div className="mx-auto max-w-4xl text-center">
              <p className="cinematic-label text-gold/50">Why Invincible?</p>
              <h2 className="mt-4 font-serif text-4xl leading-tight text-white lg:text-6xl">
                Built for teams that refuse to lose deals
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/60">
                While other CRMs bury you in forms and dashboards, Invincible works in the background — 
                capturing, organizing, and reminding — so nothing falls through the cracks.
              </p>
            </div>
          </ScrollReveal>

          {/* ── Feature Grid ── */}
          <div className="grid gap-6 pb-20 md:grid-cols-3">
            {[
              { title: "Natural Language Input", desc: "Type one sentence and watch AI structure your contacts, deals, and follow-ups automatically.", icon: "🧠", delay: 0 },
              { title: "Smart Follow-ups", desc: "Never miss a follow-up. Recurring tasks, reminders, and activity history keep every deal alive.", icon: "⚡", delay: 0.1 },
              { title: "Pipeline Intelligence", desc: "See what's moving, stalled, or ready to close. Drag-and-drop pipeline with real-time insights.", icon: "📊", delay: 0.2 },
            ].map((feature) => (
              <ScrollReveal key={feature.title} variant="fade-up" delay={feature.delay}>
                <TiltCard
                  className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-sm"
                  tiltIntensity={5}
                >
                  <div className="text-4xl">{feature.icon}</div>
                  <h3 className="mt-5 text-xl font-semibold text-white">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/55">{feature.desc}</p>
                </TiltCard>
              </ScrollReveal>
            ))}
          </div>
        </motion.div>
      </motion.main>
    </>
  );
}

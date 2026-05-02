"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowUpRight,
  Play,
  Clock,
  Globe2,
  Bot,
  MessageSquare,
  KanbanSquare,
  Zap,
  Brain,
  Shield,
  Mail,
  Smartphone,
} from "lucide-react";

type MotionUser = {
  name: string;
  onboardingCompleted: boolean;
} | null;

/* ─────────────────────────────────────────────
   FadingVideo — rAF-driven crossfade, no CSS
   ───────────────────────────────────────────── */
function FadingVideo({
  src,
  className,
  style,
}: {
  src: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const rafRef = useRef<number>(0);
  const fadingOutRef = useRef(false);
  const FADE_MS = 500;

  const fadeTo = useCallback((target: number, dur: number) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const v = videoRef.current;
    if (!v) return;
    const s = parseFloat(v.style.opacity) || 0;
    const t0 = performance.now();
    const step = (now: number) => {
      const p = Math.min((now - t0) / dur, 1);
      v.style.opacity = String(s + (target - s) * p);
      if (p < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onLoad = () => {
      v.style.opacity = "0";
      v.play().catch(() => {});
      fadeTo(1, FADE_MS);
    };
    const onTime = () => {
      if (
        !fadingOutRef.current &&
        v.duration - v.currentTime <= 0.55 &&
        v.duration - v.currentTime > 0
      ) {
        fadingOutRef.current = true;
        fadeTo(0, FADE_MS);
      }
    };
    const onEnd = () => {
      v.style.opacity = "0";
      setTimeout(() => {
        v.currentTime = 0;
        v.play().catch(() => {});
        fadingOutRef.current = false;
        fadeTo(1, FADE_MS);
      }, 100);
    };
    v.addEventListener("loadeddata", onLoad);
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("ended", onEnd);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      v.removeEventListener("loadeddata", onLoad);
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("ended", onEnd);
    };
  }, [fadeTo]);

  return (
    <video
      ref={videoRef}
      src={src}
      autoPlay
      muted
      playsInline
      preload="auto"
      className={className}
      style={{ ...style, opacity: 0 }}
    />
  );
}

/* ─────────────────────────────────────────────
   BlurText — word-by-word blur-in
   ───────────────────────────────────────────── */
function BlurText({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const words = text.split(" ");

  return (
    <p
      ref={ref}
      className={className}
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        rowGap: "0.1em",
      }}
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ filter: "blur(10px)", opacity: 0, y: 50 }}
          animate={
            visible ? { filter: "blur(0px)", opacity: 1, y: 0 } : {}
          }
          transition={{ duration: 0.7, delay: i * 0.1, ease: "easeOut" }}
          style={{ display: "inline-block", marginRight: "0.28em" }}
        >
          {word}
        </motion.span>
      ))}
    </p>
  );
}

/* ─── Anim wrapper ─── */
const blurIn = {
  initial: { filter: "blur(10px)", opacity: 0, y: 20 },
  animate: { filter: "blur(0px)", opacity: 1, y: 0 },
};

function Anim({
  d = 0,
  className,
  children,
}: {
  d?: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={blurIn.initial}
      animate={blurIn.animate}
      transition={{ delay: d, duration: 0.6, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── liquid-glass inline style factories ─── */
const glassStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.01)",
  backdropFilter: "blur(4px)",
  WebkitBackdropFilter: "blur(4px)",
  border: "none",
  boxShadow: "inset 0 1px 1px rgba(255,255,255,0.1)",
};

const glassStrongStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.01)",
  backdropFilter: "blur(50px)",
  WebkitBackdropFilter: "blur(50px)",
  border: "none",
  boxShadow:
    "4px 4px 4px rgba(0,0,0,0.05), inset 0 1px 1px rgba(255,255,255,0.15)",
};

/* Glass border pseudo-element via wrapper */
function Glass({
  children,
  className,
  strong,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  strong?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`relative overflow-hidden ${className || ""}`}
      style={{ ...(strong ? glassStrongStyle : glassStyle), ...style }}
    >
      {/* Gradient border pseudo */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          borderRadius: "inherit",
          padding: "1.4px",
          background: `linear-gradient(180deg,
            rgba(255,255,255,${strong ? 0.5 : 0.45}) 0%,
            rgba(255,255,255,${strong ? 0.2 : 0.15}) 20%,
            rgba(255,255,255,0) 40%,
            rgba(255,255,255,0) 60%,
            rgba(255,255,255,${strong ? 0.2 : 0.15}) 80%,
            rgba(255,255,255,${strong ? 0.5 : 0.45}) 100%)`,
          WebkitMask:
            "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude" as never,
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Navbar
   ───────────────────────────────────────────── */
const navLinks = [
  { label: "Home", href: "/home" },
  { label: "Features", href: "/features" },
  { label: "Capture", href: "/capture" },
  { label: "Pipeline", href: "/deals" },
  { label: "Pricing", href: "/features#pricing" },
];

function Navbar({ user }: { user: MotionUser }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const ctaHref = user
    ? user.onboardingCompleted
      ? "/dashboard"
      : "/welcome"
    : "/register";
  const ctaLabel = user ? "Open Dashboard" : "Get Started";

  return (
    <nav className="fixed top-4 left-0 right-0 px-8 lg:px-16 z-50 flex items-center justify-between">
      <div className="relative">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="focus:outline-none"
        >
          <Glass className="rounded-full h-12 w-12 flex items-center justify-center hover:scale-105 transition-transform cursor-pointer">
            <span className="font-serif italic text-white text-xl">i</span>
          </Glass>
        </button>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-14 left-0 w-64 origin-top-left"
            >
              <Glass strong className="rounded-2xl p-4 flex flex-col gap-2 shadow-2xl border border-white/10">
                <p className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-2 px-2">
                  Invincible Hub
                </p>
                <Link
                  href="/home"
                  className="px-3 py-2.5 rounded-lg hover:bg-white/10 text-white/90 hover:text-white transition flex items-center gap-3 text-sm"
                >
                  <Globe2 className="h-4 w-4" /> Classic Home
                </Link>
                <Link
                  href={user ? "/dashboard" : "/login"}
                  className="px-3 py-2.5 rounded-lg hover:bg-white/10 text-white/90 hover:text-white transition flex items-center gap-3 text-sm"
                >
                  <Zap className="h-4 w-4" /> {user ? "Your Workspace" : "Sign In"}
                </Link>
                <Link
                  href={ctaHref}
                  className="px-3 py-2.5 rounded-lg hover:bg-white/10 text-white/90 hover:text-white transition flex items-center gap-3 text-sm"
                >
                  <Bot className="h-4 w-4" /> Try Captain Hook
                </Link>
              </Glass>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Glass className="hidden md:flex rounded-full px-1.5 py-1.5 items-center gap-0">
        {navLinks.map((l) => (
          <Link
            key={l.label}
            href={l.href}
            className="px-3 py-2 text-sm font-medium text-white/90 hover:text-white transition"
          >
            {l.label}
          </Link>
        ))}
        <Link
          href={ctaHref}
          className="bg-white text-black rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap flex items-center gap-1.5 ml-1"
        >
          {ctaLabel} <ArrowUpRight className="h-4 w-4" />
        </Link>
      </Glass>

      <div className="h-12 w-12" />
    </nav>
  );
}

/* ─────────────────────────────────────────────
   Hero Section
   ───────────────────────────────────────────── */
function HeroSection({ user }: { user: MotionUser }) {
  const primaryHref = user
    ? user.onboardingCompleted
      ? "/dashboard"
      : "/welcome"
    : "/register";
  const primaryLabel = user ? "Open Dashboard" : "Start Free Trial";

  return (
    <section className="relative h-screen flex flex-col overflow-hidden">
      <FadingVideo
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_080021_d598092b-c4c2-4e53-8e46-94cf9064cd50.mp4"
        className="absolute left-1/2 top-0 -translate-x-1/2 object-cover object-top z-0"
        style={{ width: "120%", height: "120%" }}
      />

      <div className="relative z-10 flex flex-col flex-1 items-center">
        <div className="flex-1 flex flex-col items-center justify-center pt-24 px-4">
          {/* Badge */}
          <Anim d={0.4}>
            <Glass className="rounded-full flex items-center gap-2 pr-3">
              <span className="bg-white text-black rounded-full px-3 py-1 text-xs font-semibold">
                New
              </span>
              <span className="text-sm text-white/90">
                Captain Hook AI Agent — Your CRM Copilot is Live
              </span>
            </Glass>
          </Anim>

          {/* Headline */}
          <div className="mt-6">
            <BlurText
              text="Command Your Business Like Never Before"
              className="text-6xl md:text-7xl lg:text-[5.5rem] font-serif italic text-white leading-[0.85] max-w-3xl tracking-[-4px] text-center"
            />
          </div>

          {/* Subheading */}
          <Anim
            d={0.8}
            className="mt-5 text-sm md:text-base text-white/90 max-w-2xl font-light leading-relaxed text-center"
          >
            The CRM that never drops the ball. One sentence captures contacts,
            deals, and follow-ups. Captain Hook AI works while you sleep.
            WhatsApp reminders keep your pipeline alive 24/7.
          </Anim>

          {/* CTAs */}
          <Anim d={1.1} className="flex items-center gap-6 mt-6">
            <Link href={primaryHref}>
              <Glass
                strong
                className="rounded-full px-5 py-2.5 text-sm font-medium text-white flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform"
              >
                {primaryLabel} <ArrowUpRight className="h-5 w-5" />
              </Glass>
            </Link>
            <Link
              href="/features"
              className="text-white text-sm font-medium flex items-center gap-2 hover:opacity-80 transition"
            >
              View Features <Play className="h-4 w-4 fill-white" />
            </Link>
          </Anim>

          {/* Stats */}
          <Anim d={1.3} className="flex items-stretch gap-4 mt-8">
            <Glass className="rounded-[1.25rem] p-5 w-[220px]">
              <Clock className="h-7 w-7 text-white" strokeWidth={1.5} />
              <p className="font-serif italic text-white text-4xl tracking-[-1px] leading-none mt-3">
                2 Sec
              </p>
              <p className="text-xs text-white/80 font-light mt-2">
                Average AI Capture Time Per Entry
              </p>
            </Glass>
            <Glass className="rounded-[1.25rem] p-5 w-[220px]">
              <Globe2 className="h-7 w-7 text-white" strokeWidth={1.5} />
              <p className="font-serif italic text-white text-4xl tracking-[-1px] leading-none mt-3">
                24/7
              </p>
              <p className="text-xs text-white/80 font-light mt-2">
                Always-On WhatsApp Reminders
              </p>
            </Glass>
          </Anim>
        </div>

        {/* Partners / Tech */}
        <Anim d={1.4} className="flex flex-col items-center gap-4 pb-8">
          <Glass className="rounded-full px-3.5 py-1.5 text-xs font-medium text-white/90">
            Powered by the technologies that define the future
          </Glass>
          <div className="flex items-center gap-12 md:gap-16">
            {["Gemini", "OpenAI", "WhatsApp", "Resend", "Prisma"].map((n) => (
              <span
                key={n}
                className="font-serif italic text-white text-2xl md:text-3xl tracking-tight"
              >
                {n}
              </span>
            ))}
          </div>
        </Anim>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Capabilities Section
   ───────────────────────────────────────────── */
const capCards = [
  {
    icon: Bot,
    title: "Captain Hook AI",
    desc: "An autonomous AI agent that lives inside your CRM. It triages deals, surfaces overdue follow-ups, routes conversations, and executes CRM actions — all from natural language.",
    tags: ["Autonomous Agent", "Deal Triage", "Action Executor", "Always On-Deck"],
  },
  {
    icon: MessageSquare,
    title: "WhatsApp Automation",
    desc: "Background webhook capture syncs conversations automatically. Intelligent reminders reach your phone even when your laptop is off — powered by Meta Graph API.",
    tags: ["Auto Sync", "Offline Reminders", "Meta API", "Background Jobs"],
  },
  {
    icon: Brain,
    title: "AI Quick Capture",
    desc: "Type one messy sentence and watch AI extract contacts, deals, tasks, and notes simultaneously. Zero forms. Zero clicks. Natural language to structured CRM in 2 seconds.",
    tags: ["NLP Engine", "Entity Detection", "Date Parsing", "Multi-Action"],
  },
];

function CapabilitiesSection() {
  return (
    <section className="relative min-h-screen overflow-hidden">
      <FadingVideo
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_094631_d30ab262-45ee-4b7d-99f3-5d5848c8ef13.mp4"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      <div className="relative z-10 px-8 md:px-16 lg:px-20 pt-24 pb-10 flex flex-col min-h-screen">
        <div className="mb-auto">
          <motion.p
            className="text-sm text-white/80 mb-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {"// What Makes Us Invincible"}
          </motion.p>
          <motion.h2
            className="font-serif italic text-white text-6xl md:text-7xl lg:text-[6rem] leading-[0.9] tracking-[-3px]"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            Intelligence
            <br />
            evolved
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          {capCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: idx * 0.15,
                  duration: 0.7,
                  ease: "easeOut",
                }}
              >
                <Glass className="rounded-[1.25rem] p-6 min-h-[360px] flex flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <Glass className="rounded-[0.75rem] h-11 w-11 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-6 w-6 text-white" />
                    </Glass>
                    <div className="flex flex-wrap justify-end gap-1.5 max-w-[70%]">
                      {card.tags.map((t) => (
                        <Glass
                          key={t}
                          className="rounded-full px-3 py-1 text-[11px] text-white/90 whitespace-nowrap"
                        >
                          {t}
                        </Glass>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1" />
                  <div className="mt-6">
                    <h3 className="font-serif italic text-white text-3xl md:text-4xl tracking-[-1px] leading-none">
                      {card.title}
                    </h3>
                    <p className="mt-3 text-sm text-white/90 font-light leading-snug max-w-[32ch]">
                      {card.desc}
                    </p>
                  </div>
                </Glass>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Differentiators Section
   ───────────────────────────────────────────── */
const diffItems = [
  {
    icon: Zap,
    title: "Zero Data Entry",
    stat: "0 clicks",
    desc: "While legacy CRMs need 30+ clicks and 6 screens per entry, Invincible does it in one sentence.",
  },
  {
    icon: Shield,
    title: "Offline Reminders",
    stat: "Always On",
    desc: "WhatsApp reminders fire even when your laptop is off. Background workers never sleep.",
  },
  {
    icon: Mail,
    title: "Email + WhatsApp Sync",
    stat: "Auto",
    desc: "IMAP polling and webhook capture sync your conversations into the CRM in real time.",
  },
  {
    icon: Smartphone,
    title: "Zapier-Style Rules",
    stat: "If → Then",
    desc: "Create automation rules: when a deal changes stage, auto-create tasks, notes, or notifications.",
  },
  {
    icon: KanbanSquare,
    title: "Drag & Drop Pipeline",
    stat: "Visual",
    desc: "Kanban board with real-time insights. See what is moving, stalled, or ready to close.",
  },
  {
    icon: Bot,
    title: "Captain Hook Agent",
    stat: "AI Copilot",
    desc: "Floating AI agent that triages, searches, routes, and executes — like your sharpest closer.",
  },
];

function DiffSection() {
  return (
    <section className="relative py-24 px-8 md:px-16 lg:px-20">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-sm text-white/60 uppercase tracking-[0.3em] mb-4">
            The Invincible Edge
          </p>
          <h2 className="font-serif italic text-white text-5xl md:text-6xl lg:text-7xl tracking-[-3px] leading-[0.9]">
            Why teams switch
          </h2>
          <p className="mt-4 text-white/60 max-w-xl mx-auto text-base leading-relaxed">
            Every feature is built to eliminate the friction that kills deals.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {diffItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: idx * 0.08,
                  duration: 0.6,
                  ease: "easeOut",
                }}
              >
                <Glass className="rounded-[1.25rem] p-6 h-full hover:scale-[1.02] transition-transform duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <Glass className="rounded-xl h-10 w-10 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-5 w-5 text-white" />
                    </Glass>
                    <span className="font-serif italic text-white/80 text-lg">
                      {item.stat}
                    </span>
                  </div>
                  <h3 className="text-white text-lg font-semibold mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-white/70 font-light leading-relaxed">
                    {item.desc}
                  </p>
                </Glass>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   CTA Section
   ───────────────────────────────────────────── */
function CTASection({ user }: { user: MotionUser }) {
  const primaryHref = user
    ? user.onboardingCompleted
      ? "/dashboard"
      : "/welcome"
    : "/register";
  const primaryLabel = user ? "Enter Workspace" : "Start Free Trial";

  return (
    <section className="relative py-24 px-8 md:px-16 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-2xl mx-auto"
      >
        <h2 className="font-serif italic text-white text-5xl md:text-6xl tracking-[-3px] leading-[0.9]">
          Ready to become
          <br />
          invincible?
        </h2>
        <p className="mt-4 text-white/60 text-base leading-relaxed">
          Stop losing deals to admin chaos. Start free — no credit card, no
          setup fatigue.
        </p>
        <div className="flex items-center justify-center gap-6 mt-8">
          <Link href={primaryHref}>
            <Glass
              strong
              className="rounded-full px-8 py-3.5 text-base font-semibold text-white flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform"
            >
              {primaryLabel} <ArrowUpRight className="h-5 w-5" />
            </Glass>
          </Link>
          <Link href="/book-demo">
            <Glass className="rounded-full px-6 py-3.5 text-sm font-medium text-white/90 cursor-pointer hover:scale-105 transition-transform">
              Book a Demo
            </Glass>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Main Component
   ───────────────────────────────────────────── */
import { CinematicIntro } from "@/components/cinematic-intro";

export function MotionLanding({ user }: { user: MotionUser }) {
  const [introComplete, setIntroComplete] = useState(false);

  return (
    <>
      {/* ━━━ Cinematic Intro Overlay ━━━ */}
      {!introComplete && (
        <CinematicIntro onComplete={() => setIntroComplete(true)} />
      )}

      {/* ━━━ Motion Landing (fades in after intro) ━━━ */}
      <motion.main
        className="bg-black text-white min-h-screen overflow-x-clip"
        initial={{ opacity: 0 }}
        animate={introComplete ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <Navbar user={user} />
        <HeroSection user={user} />
        <CapabilitiesSection />
        <DiffSection />
        <CTASection user={user} />
      </motion.main>
    </>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Crown,
  MessageCircle,
  Phone,
  Send,
  Shield,
  Sparkles,
  Video,
  Zap,
} from "lucide-react";

const perks = [
  {
    icon: Video,
    title: "1-on-1 Video Call",
    desc: "Screen-share guided setup by the founder himself.",
  },
  {
    icon: Zap,
    title: "WhatsApp AI in 10 min",
    desc: "Your AI bot goes live before the call ends.",
  },
  {
    icon: Shield,
    title: "Zero Stress Setup",
    desc: "We handle Meta API, webhooks, and tokens for you.",
  },
  {
    icon: Sparkles,
    title: "See the Magic Live",
    desc: "Send a WhatsApp message and watch AI reply instantly.",
  },
];

const steps = [
  "Fill the form below",
  "We reach out within 2 hours",
  "10-minute video call",
  "Your AI bot goes live!",
];

export default function BookDemoPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await fetch("/api/book-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          business: formData.get("business"),
          phone: formData.get("phone"),
          email: formData.get("email"),
          challenge: formData.get("challenge"),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Something went wrong.");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#03060d] text-white">
      {/* Background Effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-8rem] top-[-6rem] h-[24rem] w-[24rem] rounded-full bg-[#3d2a08] opacity-40 blur-[100px]" />
        <div className="absolute bottom-[-10rem] right-[-8rem] h-[28rem] w-[28rem] rounded-full bg-[#2f684a] opacity-30 blur-[100px]" />
        <div className="absolute left-1/2 top-[30%] h-[18rem] w-[18rem] -translate-x-1/2 rounded-full bg-[#7f4b21] opacity-20 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-5 py-10 lg:px-8 lg:py-16">
        {/* Back link */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white/50 transition hover:text-gold"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          className="mt-10 max-w-3xl"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-gold/20 bg-gold/10 text-gold">
              <Crown className="h-5 w-5" />
            </div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.36em] text-gold/60">
              Concierge Onboarding
            </p>
          </div>

          <h1 className="mt-6 font-serif text-4xl leading-tight text-white lg:text-6xl">
            We set it up{" "}
            <span className="bg-gradient-to-r from-gold to-amber-400 bg-clip-text text-transparent">
              for you
            </span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/60">
            Book a free 10-minute video call with our founder. We&apos;ll
            connect your WhatsApp AI, set up your CRM, and you&apos;ll see
            magic happen live — before the call even ends.
          </p>
        </motion.div>

        {/* Steps timeline */}
        <motion.div
          className="mt-12 flex flex-wrap items-center gap-3"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          {steps.map((step, i) => (
            <div key={step} className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full border border-gold/25 bg-gold/10 text-xs font-bold text-gold">
                  {i + 1}
                </div>
                <span className="text-sm text-white/70">{step}</span>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden h-px w-8 bg-gold/20 sm:block" />
              )}
            </div>
          ))}
        </motion.div>

        {/* Main grid */}
        <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_1.1fr]">
          {/* Left — Perks */}
          <motion.div
            className="space-y-5"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {perks.map((perk, i) => (
                <motion.div
                  key={perk.title}
                  className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm transition-all duration-300 hover:border-gold/20 hover:bg-gold/[0.04]"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.5 + i * 0.1,
                    duration: 0.5,
                    ease: [0.25, 1, 0.5, 1],
                  }}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-gold/15 bg-gold/10">
                    <perk.icon className="h-4 w-4 text-gold" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-white">
                    {perk.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-white/50">
                    {perk.desc}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Social proof */}
            <motion.div
              className="rounded-[1.75rem] border border-emerald-400/15 bg-emerald-400/[0.04] p-6"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.5 }}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-emerald-300">
                    Trusted by early adopters
                  </p>
                  <p className="text-xs text-white/45">
                    Average setup time: 8 minutes
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Quick info badges */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs text-white/60">
                <Clock className="h-3.5 w-3.5 text-gold/70" />
                10 minutes only
              </div>
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs text-white/60">
                <Video className="h-3.5 w-3.5 text-gold/70" />
                Google Meet / Zoom
              </div>
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs text-white/60">
                <Phone className="h-3.5 w-3.5 text-gold/70" />
                100% Free
              </div>
            </div>
          </motion.div>

          {/* Right — Contact Form */}
          <motion.div
            className="rounded-[2rem] border border-gold/15 bg-gold/[0.03] p-8 backdrop-blur-sm lg:p-10"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
          >
            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-gold" />
                    <h3 className="text-xl font-semibold text-white">
                      Book Your Free Onboarding
                    </h3>
                  </div>
                  <p className="mt-2 text-sm text-white/50">
                    Fill this in and we&apos;ll reach out within 2 hours to
                    schedule your call.
                  </p>

                  <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/80">
                        Your Name
                      </label>
                      <input
                        required
                        name="name"
                        type="text"
                        placeholder="e.g. Rahul Mehra"
                        autoComplete="name"
                        className="w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition focus:border-gold/40 focus:bg-gold/[0.04] focus:ring-1 focus:ring-gold/20"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/80">
                        Business Name
                      </label>
                      <input
                        required
                        name="business"
                        type="text"
                        placeholder="e.g. BrightPath Studio"
                        autoComplete="organization"
                        className="w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition focus:border-gold/40 focus:bg-gold/[0.04] focus:ring-1 focus:ring-gold/20"
                      />
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white/80">
                          WhatsApp Number
                        </label>
                        <input
                          required
                          name="phone"
                          type="tel"
                          placeholder="+91 98765 43210"
                          autoComplete="tel"
                          className="w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition focus:border-gold/40 focus:bg-gold/[0.04] focus:ring-1 focus:ring-gold/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white/80">
                          Email
                        </label>
                        <input
                          required
                          name="email"
                          type="email"
                          placeholder="you@company.com"
                          autoComplete="email"
                          className="w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition focus:border-gold/40 focus:bg-gold/[0.04] focus:ring-1 focus:ring-gold/20"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/80">
                        What&apos;s your biggest challenge right now?
                      </label>
                      <textarea
                        name="challenge"
                        rows={3}
                        placeholder="e.g. I want to automate my WhatsApp replies and manage my leads in one place..."
                        className="w-full resize-none rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition focus:border-gold/40 focus:bg-gold/[0.04] focus:ring-1 focus:ring-gold/20"
                      />
                    </div>

                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-gold/90 to-amber-500/90 py-4 text-sm font-bold text-black shadow-[0_4px_24px_rgba(230,193,106,0.25)] transition-all duration-300 hover:shadow-[0_4px_32px_rgba(230,193,106,0.4)] disabled:opacity-70"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isSubmitting ? (
                        <>
                          <motion.div
                            className="h-4 w-4 rounded-full border-2 border-black/30 border-t-black"
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 0.8,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                          />
                          Scheduling...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Book My Free Onboarding Call
                        </>
                      )}
                    </motion.button>

                    {error && (
                      <p className="text-center text-sm font-medium text-rose-400">
                        {error}
                      </p>
                    )}

                    <p className="text-center text-xs text-white/35">
                      No payment required. No spam. Just a quick call to get you
                      started.
                    </p>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  className="flex flex-col items-center justify-center py-12 text-center"
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{
                    duration: 0.6,
                    ease: [0.25, 1, 0.5, 1],
                  }}
                >
                  <motion.div
                    className="flex h-20 w-20 items-center justify-center rounded-full border border-emerald-400/25 bg-emerald-400/10"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      delay: 0.2,
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                    }}
                  >
                    <CheckCircle2 className="h-10 w-10 text-emerald-400" />
                  </motion.div>

                  <motion.h3
                    className="mt-6 text-2xl font-semibold text-white"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    You&apos;re all set!
                  </motion.h3>

                  <motion.p
                    className="mt-3 max-w-sm text-sm leading-6 text-white/55"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    We&apos;ll reach out to you within 2 hours via WhatsApp to
                    schedule your onboarding call. Get ready to see your AI bot
                    go live!
                  </motion.p>

                  <motion.div
                    className="mt-8 flex flex-wrap justify-center gap-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <Link
                      href="/"
                      className="rounded-xl border border-white/15 bg-white/[0.06] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                    >
                      Back to Home
                    </Link>
                    <Link
                      href="/register"
                      className="rounded-xl bg-gradient-to-r from-gold/90 to-amber-500/90 px-6 py-2.5 text-sm font-bold text-black transition hover:shadow-[0_4px_24px_rgba(230,193,106,0.3)]"
                    >
                      Create Account Now
                    </Link>
                  </motion.div>

                  <motion.div
                    className="mt-8 flex items-center gap-2 text-xs text-white/40"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    Typical response time: under 2 hours
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </main>
  );
}

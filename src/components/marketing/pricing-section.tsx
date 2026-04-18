"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Crown, Sparkles, Zap } from "lucide-react";
import { ScrollReveal } from "@/components/scroll-reveal";
import { TiltCard } from "@/components/tilt-card";

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    description: "Perfect for solo founders exploring the CRM.",
    icon: Sparkles,
    featured: false,
    cta: "Start Free",
    href: "/register",
    features: [
      "Up to 100 contacts",
      "Basic deals pipeline",
      "Task & reminder management",
      "Email integration",
      "Community support",
    ],
  },
  {
    name: "Intermediate",
    price: "₹499",
    period: "/month",
    description: "For growing teams that want AI firepower.",
    icon: Zap,
    featured: true,
    cta: "Book Onboarding Call",
    href: "/book-demo",
    features: [
      "Unlimited contacts",
      "AI Capture — natural language input",
      "WhatsApp AI Bot (Conversational)",
      "Smart automations engine",
      "Finance & invoice tracking",
      "Priority email support",
    ],
  },
  {
    name: "Advanced",
    price: "₹999",
    period: "/month",
    description: "For serious businesses scaling to the moon.",
    icon: Crown,
    featured: false,
    cta: "Book Onboarding Call",
    href: "/book-demo",
    features: [
      "Everything in Intermediate",
      "Dedicated onboarding call",
      "Team collaboration & roles",
      "Advanced pipeline analytics",
      "Custom automations & workflows",
      "WhatsApp AI with full memory",
      "Direct founder support",
    ],
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: [0.25, 1, 0.5, 1] },
  }),
};

export function PricingSection() {
  return (
    <section className="py-24 relative">
      {/* Subtle glow behind the featured card */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-gold/[0.04] blur-[120px]" />

      <ScrollReveal variant="fade-up">
        <div className="mx-auto max-w-4xl text-center">
          <p className="cinematic-label text-gold/50">Pricing</p>
          <h2 className="mt-4 font-serif text-4xl leading-tight text-white lg:text-6xl">
            Simple, honest pricing
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/60">
            No hidden fees. No surprise charges. Pick the plan that matches your
            ambition and upgrade whenever you&apos;re ready.
          </p>
        </div>
      </ScrollReveal>

      <div className="mx-auto mt-16 grid max-w-6xl gap-6 px-4 md:grid-cols-3">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.name}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
          >
            <TiltCard
              className={`relative flex h-full flex-col rounded-[2rem] border p-8 backdrop-blur-sm transition-all duration-300 ${
                plan.featured
                  ? "border-gold/30 bg-gold/[0.06] shadow-[0_0_60px_-12px_rgba(230,193,106,0.15)]"
                  : "border-white/10 bg-white/[0.03] hover:border-white/20"
              }`}
              tiltIntensity={5}
              glareOpacity={plan.featured ? 0.12 : 0.06}
            >
              {/* Popular badge */}
              {plan.featured && (
                <motion.div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-gold/30 bg-gold/20 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] text-gold backdrop-blur-sm"
                  initial={{ opacity: 0, y: 8, scale: 0.8 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4, type: "spring", stiffness: 300 }}
                >
                  Most Popular
                </motion.div>
              )}

              {/* Icon */}
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${
                  plan.featured
                    ? "border-gold/25 bg-gold/15 text-gold"
                    : "border-white/15 bg-white/10 text-white/70"
                }`}
              >
                <plan.icon className="h-5 w-5" />
              </div>

              {/* Plan name & price */}
              <h3 className="mt-5 text-xl font-semibold text-white">
                {plan.name}
              </h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span
                  className={`text-5xl font-bold tracking-tight ${
                    plan.featured ? "text-gold" : "text-white"
                  }`}
                >
                  {plan.price}
                </span>
                <span className="text-sm text-white/40">{plan.period}</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-white/55">
                {plan.description}
              </p>

              {/* Divider */}
              <div
                className={`my-6 h-px w-full ${
                  plan.featured ? "bg-gold/15" : "bg-white/10"
                }`}
              />

              {/* Features */}
              <ul className="flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-sm text-white/70"
                  >
                    <Check
                      className={`mt-0.5 h-4 w-4 shrink-0 ${
                        plan.featured ? "text-gold" : "text-emerald-400/70"
                      }`}
                    />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href={plan.href}
                className={`mt-8 block w-full rounded-2xl py-3.5 text-center text-sm font-semibold transition-all duration-300 ${
                  plan.featured
                    ? "bg-gradient-to-r from-gold/90 to-amber-500/90 text-black shadow-[0_4px_24px_rgba(230,193,106,0.25)] hover:shadow-[0_4px_32px_rgba(230,193,106,0.4)] hover:scale-[1.02]"
                    : "border border-white/15 bg-white/[0.06] text-white hover:bg-white/10 hover:border-white/25"
                }`}
              >
                {plan.cta}
              </Link>
            </TiltCard>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

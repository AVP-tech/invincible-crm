"use client";

import { motion } from "framer-motion";
import { Mail, ShieldCheck, Zap, Crown, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { TiltCard } from "@/components/tilt-card";
import { CometBorder } from "@/components/comet-border";

const supportTiers = [
  {
    name: "Free Plan",
    icon: ShieldCheck,
    limits: "Limited queries (Response within 48-72 hrs)",
    description: "Basic email support for general inquiries and onboarding questions.",
    color: "from-slate-400 to-slate-200",
    bg: "bg-slate-500/10",
  },
  {
    name: "Intermediate Plan",
    icon: Zap,
    limits: "Priority queries (Response within 12-24 hrs)",
    description: "Faster resolution times, dedicated assistance for automations and workflows.",
    color: "from-blue-400 to-emerald-400",
    bg: "bg-blue-500/10",
  },
  {
    name: "Advanced Plan",
    icon: Crown,
    limits: "Unlimited 24/7 Priority Support",
    description: "Direct white-glove assistance. We help you build rules, pipelines, and train your AI.",
    color: "from-gold to-amber-500",
    bg: "bg-gold/10",
  },
];

export default function HelpPage() {
  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Concierge Desk"
        title="We're here to help you win"
        description="Invincible CRM is designed to be effortless, but when you need an expert, our concierge desk is open."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        {/* Support Tiers */}
        <div className="space-y-6">
          <h3 className="text-xl font-serif text-ink dark:text-white">Support Coverage by Plan</h3>
          <div className="grid gap-4">
            {supportTiers.map((tier, i) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <TiltCard className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-black/20" tiltIntensity={3}>
                  <div className="flex items-start gap-4">
                    <div className={`mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${tier.bg}`}>
                      <tier.icon className="h-6 w-6 text-foreground opacity-80" />
                    </div>
                    <div>
                      <h4 className={`bg-gradient-to-r ${tier.color} bg-clip-text text-lg font-bold text-transparent`}>
                        {tier.name}
                      </h4>
                      <p className="mt-1 text-sm font-semibold text-ink dark:text-slate-200">
                        {tier.limits}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                        {tier.description}
                      </p>
                    </div>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>

        {/* The Creative Surprise: The Digital Ticket */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.7, type: "spring" }}
        >
          <CometBorder isActive={true} duration={4} radius="2rem">
            <div className="relative overflow-hidden rounded-[2rem] border border-black/5 bg-gradient-to-br from-[#f8f4ec] to-white p-8 shadow-2xl dark:border-white/10 dark:from-[#132032] dark:to-[#0f172a]">
              {/* Ticket cutouts */}
              <div className="absolute -left-4 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-background shadow-inner" />
              <div className="absolute -right-4 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-background shadow-inner" />
              <div className="absolute left-6 right-6 top-1/2 border-t-2 border-dashed border-black/10 dark:border-white/10" />

              <div className="relative mb-12 text-center">
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-gold/80">
                  Direct Line
                </p>
                <h3 className="mt-3 font-serif text-3xl text-ink dark:text-white">
                  Drop us an email
                </h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  We actively monitor this inbox to keep your deals flowing.
                </p>
              </div>

              <div className="relative mt-12 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold/10 shadow-glow">
                  <Mail className="h-7 w-7 text-gold" />
                </div>
                
                <div className="mt-6">
                  <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                    CONCIERGE CONTACT
                  </p>
                  <a
                    href="mailto:aayushpandey.pro@gmail.com"
                    className="group mt-2 flex items-center justify-center gap-2 text-lg font-semibold text-ink transition-colors hover:text-gold dark:text-slate-200 dark:hover:text-gold"
                  >
                    aayushpandey.pro@gmail.com
                    <ExternalLink className="h-4 w-4 opacity-0 transition-all group-hover:opacity-100" />
                  </a>
                </div>
              </div>
            </div>
          </CometBorder>
        </motion.div>
      </div>
    </div>
  );
}

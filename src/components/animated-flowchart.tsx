"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  MessageSquare,
  Mail,
  Smartphone,
  Brain,
  User2,
  KanbanSquare,
  CheckSquare,
  StickyNote,
  LayoutDashboard,
  Zap,
  ArrowDown,
  Sparkles,
} from "lucide-react";

/* ── Animation Orchestration ── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.18, delayChildren: 0.2 },
  },
} as const;

const nodeVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.85 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 260, damping: 22 },
  },
};

const lineVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 0.8, ease: "easeInOut" as const },
  },
};

const pulseVariants = {
  visible: {
    scale: [1, 1.15, 1],
    opacity: [0.7, 1, 0.7],
    transition: { repeat: Infinity, duration: 2.4, ease: "easeInOut" as const },
  },
};

/* ── Node Component ── */
type FlowNodeProps = {
  icon: React.ElementType;
  label: string;
  sublabel?: string;
  color: string;
  bgColor: string;
  borderColor: string;
  glowColor: string;
  size?: "sm" | "md" | "lg";
  pulse?: boolean;
};

function FlowNode({
  icon: Icon,
  label,
  sublabel,
  color,
  bgColor,
  borderColor,
  glowColor,
  size = "md",
  pulse,
}: FlowNodeProps) {
  const sizeClasses = {
    sm: "px-4 py-3",
    md: "px-5 py-4",
    lg: "px-6 py-5",
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  return (
    <motion.div
      variants={nodeVariants}
      whileHover={{ scale: 1.06, y: -4 }}
      transition={{ type: "spring" as const, stiffness: 400, damping: 20 }}
      className={`relative flex items-center gap-3 rounded-2xl border ${borderColor} ${bgColor} ${sizeClasses[size]} shadow-lg backdrop-blur-xl cursor-default select-none`}
      style={{ boxShadow: `0 8px 32px ${glowColor}` }}
    >
      {pulse && (
        <motion.div
          variants={pulseVariants}
          animate="visible"
          className={`absolute -inset-1 rounded-2xl border-2 ${borderColor} opacity-30`}
        />
      )}
      <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${color}`}>
        <Icon className={iconSizes[size]} />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">{label}</p>
        {sublabel && (
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
            {sublabel}
          </p>
        )}
      </div>
    </motion.div>
  );
}

/* ── Arrow Connector ── */
function AnimatedArrow({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      variants={nodeVariants}
      className="flex justify-center py-1"
    >
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.4 }}
      >
        <ArrowDown className="h-5 w-5 text-slate-400 dark:text-slate-500" />
      </motion.div>
    </motion.div>
  );
}

/* ── Connecting Line SVG ── */
function ConnectingLines() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <svg className="h-full w-full" fill="none">
        {/* Animated gradient defs */}
        <defs>
          <linearGradient id="flow-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(122,139,99,0.6)" />
            <stop offset="50%" stopColor="rgba(230,193,106,0.6)" />
            <stop offset="100%" stopColor="rgba(100,140,255,0.4)" />
          </linearGradient>
        </defs>
        {/* Vertical center connecting line */}
        <motion.line
          x1="50%"
          y1="0"
          x2="50%"
          y2="100%"
          stroke="url(#flow-gradient)"
          strokeWidth="2"
          strokeDasharray="6 6"
          variants={lineVariants}
        />
      </svg>
    </div>
  );
}

/* ── Main Flowchart Component ── */
export function AnimatedFlowchart() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.15 });

  return (
    <motion.div
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="relative"
    >
      {/* ── SECTION 1: Input Sources ── */}
      <motion.div variants={nodeVariants} className="mb-3">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
          <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.25em] text-blue-400">
            Step 1 — Input
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
        </div>
        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mb-5">
          Data flows in from 3 channels — zero manual entry required
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <FlowNode
          icon={MessageSquare}
          label="Natural Language"
          sublabel={`"Met Rahul, 5L budget, send proposal Friday"`}
          color="text-blue-400 bg-blue-500/15"
          bgColor="bg-white/90 dark:bg-slate-800/90"
          borderColor="border-blue-500/20 dark:border-blue-400/20"
          glowColor="rgba(59,130,246,0.08)"
        />
        <FlowNode
          icon={Smartphone}
          label="WhatsApp Sync"
          sublabel="Auto-webhook background capture"
          color="text-emerald-400 bg-emerald-500/15"
          bgColor="bg-white/90 dark:bg-slate-800/90"
          borderColor="border-emerald-500/20 dark:border-emerald-400/20"
          glowColor="rgba(16,185,129,0.08)"
        />
        <FlowNode
          icon={Mail}
          label="Email Sync"
          sublabel="IMAP background polling"
          color="text-violet-400 bg-violet-500/15"
          bgColor="bg-white/90 dark:bg-slate-800/90"
          borderColor="border-violet-500/20 dark:border-violet-400/20"
          glowColor="rgba(139,92,246,0.08)"
        />
      </div>

      {/* ── Converging Arrows ── */}
      <motion.div variants={nodeVariants} className="flex justify-center py-4">
        <svg width="280" height="48" viewBox="0 0 280 48" fill="none" className="max-w-full">
          <motion.path
            d="M 40 4 Q 40 24, 140 40"
            stroke="rgba(59,130,246,0.4)"
            strokeWidth="2"
            strokeDasharray="4 4"
            variants={lineVariants}
          />
          <motion.path
            d="M 140 4 L 140 40"
            stroke="rgba(16,185,129,0.4)"
            strokeWidth="2"
            strokeDasharray="4 4"
            variants={lineVariants}
          />
          <motion.path
            d="M 240 4 Q 240 24, 140 40"
            stroke="rgba(139,92,246,0.4)"
            strokeWidth="2"
            strokeDasharray="4 4"
            variants={lineVariants}
          />
          {/* Center dot */}
          <motion.circle
            cx="140"
            cy="42"
            r="4"
            fill="rgba(230,193,106,0.8)"
            variants={nodeVariants}
          />
        </svg>
      </motion.div>

      {/* ── SECTION 2: AI Engine ── */}
      <motion.div variants={nodeVariants} className="mb-3">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
          <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.25em] text-amber-400">
            Step 2 — AI Brain
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
        </div>
      </motion.div>

      <div className="flex justify-center">
        <FlowNode
          icon={Brain}
          label="Invincible AI Engine"
          sublabel="GPT-4o parses intent, entities, dates & context in real-time"
          color="text-amber-400 bg-gradient-to-br from-amber-500/20 to-orange-500/15"
          bgColor="bg-gradient-to-br from-white/95 to-amber-50/80 dark:from-slate-800/95 dark:to-amber-950/30"
          borderColor="border-amber-500/30 dark:border-amber-400/25"
          glowColor="rgba(230,193,106,0.15)"
          size="lg"
          pulse
        />
      </div>

      {/* ── Diverging Arrows ── */}
      <motion.div variants={nodeVariants} className="flex justify-center py-4">
        <svg width="360" height="48" viewBox="0 0 360 48" fill="none" className="max-w-full">
          <motion.path
            d="M 180 4 Q 180 24, 45 42"
            stroke="rgba(16,185,129,0.4)"
            strokeWidth="2"
            strokeDasharray="4 4"
            variants={lineVariants}
          />
          <motion.path
            d="M 180 4 Q 180 24, 135 42"
            stroke="rgba(59,130,246,0.4)"
            strokeWidth="2"
            strokeDasharray="4 4"
            variants={lineVariants}
          />
          <motion.path
            d="M 180 4 Q 180 24, 225 42"
            stroke="rgba(230,193,106,0.4)"
            strokeWidth="2"
            strokeDasharray="4 4"
            variants={lineVariants}
          />
          <motion.path
            d="M 180 4 Q 180 24, 315 42"
            stroke="rgba(139,92,246,0.4)"
            strokeWidth="2"
            strokeDasharray="4 4"
            variants={lineVariants}
          />
        </svg>
      </motion.div>

      {/* ── SECTION 3: Automated Actions ── */}
      <motion.div variants={nodeVariants} className="mb-3">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
          <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.25em] text-emerald-400">
            Step 3 — Auto-Actions
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
        </div>
        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mb-5">
          One sentence → four database operations, simultaneously
        </p>
      </motion.div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <FlowNode
          icon={User2}
          label="Contact"
          sublabel="Creates or updates"
          color="text-emerald-400 bg-emerald-500/15"
          bgColor="bg-white/90 dark:bg-slate-800/90"
          borderColor="border-emerald-500/20 dark:border-emerald-400/20"
          glowColor="rgba(16,185,129,0.06)"
          size="sm"
        />
        <FlowNode
          icon={KanbanSquare}
          label="Pipeline"
          sublabel="Stage auto-updated"
          color="text-blue-400 bg-blue-500/15"
          bgColor="bg-white/90 dark:bg-slate-800/90"
          borderColor="border-blue-500/20 dark:border-blue-400/20"
          glowColor="rgba(59,130,246,0.06)"
          size="sm"
        />
        <FlowNode
          icon={CheckSquare}
          label="Follow-up"
          sublabel="Task auto-scheduled"
          color="text-amber-400 bg-amber-500/15"
          bgColor="bg-white/90 dark:bg-slate-800/90"
          borderColor="border-amber-500/20 dark:border-amber-400/20"
          glowColor="rgba(230,193,106,0.06)"
          size="sm"
        />
        <FlowNode
          icon={StickyNote}
          label="Notes"
          sublabel="Context logged"
          color="text-violet-400 bg-violet-500/15"
          bgColor="bg-white/90 dark:bg-slate-800/90"
          borderColor="border-violet-500/20 dark:border-violet-400/20"
          glowColor="rgba(139,92,246,0.06)"
          size="sm"
        />
      </div>

      <AnimatedArrow delay={2.2} />

      {/* ── SECTION 4: Dashboard Output ── */}
      <motion.div variants={nodeVariants} className="mb-3 mt-2">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
          <span className="rounded-full border border-gold/20 bg-gold/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.25em] text-gold">
            Result — Live Views
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
        </div>
      </motion.div>

      <div className="flex justify-center">
        <FlowNode
          icon={LayoutDashboard}
          label="Cinematic Dashboard"
          sublabel="Calm, real-time workspace — no clutter, no grids, no chaos"
          color="text-gold bg-gradient-to-br from-gold/20 to-amber-500/10"
          bgColor="bg-gradient-to-br from-white/95 to-gold/5 dark:from-slate-800/95 dark:to-gold/5"
          borderColor="border-gold/30 dark:border-gold/20"
          glowColor="rgba(230,193,106,0.12)"
          size="lg"
        />
      </div>

      {/* ── Bottom Comparison Badge ── */}
      <motion.div
        variants={nodeVariants}
        className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
      >
        <div className="flex items-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-2.5 dark:bg-red-500/10">
          <span className="text-xl">❌</span>
          <div>
            <p className="text-xs font-bold text-red-400">Legacy CRMs</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">30+ clicks, 6 screens, 5 min per entry</p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        >
          <Zap className="h-6 w-6 text-amber-400" />
        </motion.div>
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-2.5 dark:bg-emerald-500/10">
          <span className="text-xl">✅</span>
          <div>
            <p className="text-xs font-bold text-emerald-400">Invincible CRM</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">1 sentence, 0 clicks, 2 sec per entry</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

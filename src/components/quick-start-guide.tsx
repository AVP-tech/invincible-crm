"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  Sparkles,
  MessageSquare,
  Command,
  ArrowRight,
  CheckCircle2,
  KanbanSquare,
  Users,
  CheckSquare,
  StickyNote,
  Zap,
  Copy,
  Check,
  Lightbulb,
  Rocket,
  ChevronRight,
} from "lucide-react";

/* ── Animation Config ── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 280, damping: 24 },
  },
};

/* ── Sample Commands Data ── */
const SAMPLE_COMMANDS = [
  {
    input: "Met Rahul Sharma from TechVista, 5L budget, interested in enterprise plan",
    results: [
      { icon: Users, label: "Contact Created", detail: "Rahul Sharma • TechVista", color: "text-emerald-400" },
      { icon: KanbanSquare, label: "Deal Opened", detail: "₹5,00,000 • Enterprise Plan", color: "text-blue-400" },
      { icon: StickyNote, label: "Note Logged", detail: "Meeting context saved", color: "text-violet-400" },
    ],
  },
  {
    input: "Follow up with Priya Monday about the proposal, high priority",
    results: [
      { icon: CheckSquare, label: "Task Created", detail: "Follow up with Priya • Monday", color: "text-amber-400" },
      { icon: Zap, label: "Priority Set", detail: "High priority flagged", color: "text-red-400" },
    ],
  },
  {
    input: "Sent quote to Aman, deal moved to negotiation, 12L value",
    results: [
      { icon: KanbanSquare, label: "Pipeline Updated", detail: "Aman → Negotiation stage", color: "text-blue-400" },
      { icon: StickyNote, label: "Activity Logged", detail: "Quote sent event recorded", color: "text-violet-400" },
    ],
  },
  {
    input: "Call Deepak tomorrow 3pm about renewal, tag as VIP client",
    results: [
      { icon: CheckSquare, label: "Task Scheduled", detail: "Call Deepak • Tomorrow 3:00 PM", color: "text-amber-400" },
      { icon: Users, label: "Contact Tagged", detail: "Deepak → VIP Client", color: "text-emerald-400" },
    ],
  },
];

/* ── Keyboard Shortcut Badge ── */
function KBD({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center gap-1 rounded-lg border border-slate-300/50 bg-slate-100/80 px-2 py-1 text-[11px] font-semibold text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/10 dark:text-slate-300">
      {children}
    </kbd>
  );
}

/* ── Copyable Command ── */
function CopyableCommand({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="group flex items-start gap-2 rounded-xl border border-slate-200/50 bg-slate-50/80 px-4 py-3 text-left transition-all hover:border-gold/30 hover:bg-gold/5 dark:border-white/8 dark:bg-white/5 dark:hover:border-gold/20 dark:hover:bg-gold/5 w-full"
    >
      <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-gold/70" />
      <span className="flex-1 text-sm text-slate-700 dark:text-slate-300 font-mono leading-relaxed">
        {text}
      </span>
      <div className="mt-0.5 shrink-0">
        {copied ? (
          <Check className="h-4 w-4 text-emerald-400" />
        ) : (
          <Copy className="h-4 w-4 text-slate-400 opacity-0 transition group-hover:opacity-100" />
        )}
      </div>
    </button>
  );
}

/* ── Interactive Demo Card ── */
function InteractiveDemo() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeCommand = SAMPLE_COMMANDS[activeIndex];

  return (
    <motion.div
      variants={itemVariants}
      className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/80 shadow-xl backdrop-blur-xl dark:border-white/8 dark:bg-slate-900/80"
    >
      {/* Header */}
      <div className="border-b border-slate-200/50 bg-gradient-to-r from-slate-50 to-white px-6 py-4 dark:border-white/5 dark:from-slate-800/50 dark:to-slate-900/50">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-gold" />
          <p className="text-sm font-bold text-slate-900 dark:text-white">Live AI Parser Preview</p>
          <span className="ml-auto rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-500">
            Interactive
          </span>
        </div>
      </div>

      {/* Command Selector Tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-slate-100 p-2 dark:border-white/5">
        {SAMPLE_COMMANDS.map((cmd, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
              activeIndex === i
                ? "bg-gold/15 text-gold shadow-sm"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/5 dark:hover:text-slate-300"
            }`}
          >
            Example {i + 1}
          </button>
        ))}
      </div>

      {/* Input Section */}
      <div className="px-6 pt-5 pb-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">
          You type:
        </p>
        <div className="rounded-2xl border border-gold/20 bg-gradient-to-r from-gold/5 to-transparent p-4 dark:from-gold/5">
          <p className="text-sm font-medium text-slate-800 dark:text-white leading-relaxed">
            &ldquo;{activeCommand.input}&rdquo;
          </p>
        </div>
      </div>

      {/* Arrow */}
      <div className="flex items-center justify-center gap-2 py-1">
        <div className="h-px w-12 bg-gradient-to-r from-transparent to-gold/30" />
        <motion.div
          animate={{ y: [0, 4, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <Zap className="h-4 w-4 text-gold" />
        </motion.div>
        <div className="h-px w-12 bg-gradient-to-l from-transparent to-gold/30" />
      </div>

      {/* Output Section */}
      <div className="px-6 pb-6 pt-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-3">
          AI creates:
        </p>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="space-y-2"
          >
            {activeCommand.results.map((result, i) => {
              const Icon = result.icon;
              return (
                <motion.div
                  key={result.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.12, type: "spring", stiffness: 300, damping: 25 }}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3 dark:border-white/5 dark:bg-white/5"
                >
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-white/10 ${result.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-800 dark:text-white">
                      {result.label}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {result.detail}
                    </p>
                  </div>
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ── Quick Start Steps ── */
const STEPS = [
  {
    number: "01",
    icon: Rocket,
    title: "Open Quick Capture",
    description:
      "Press the keyboard shortcut or click the \"Quick Capture\" button in the top navigation bar to open the AI command input.",
    shortcut: (
      <span className="flex items-center gap-1.5">
        <KBD>Ctrl</KBD>
        <span className="text-slate-400">+</span>
        <KBD>K</KBD>
        <span className="text-xs text-slate-400 ml-1">or click the ✨ button</span>
      </span>
    ),
    color: "from-blue-500/15 to-blue-400/5",
    borderColor: "border-blue-500/20",
    iconColor: "text-blue-400 bg-blue-500/15",
  },
  {
    number: "02",
    icon: MessageSquare,
    title: "Type in Plain English",
    description:
      "Describe what happened naturally. The AI understands names, amounts, dates, stages, and task keywords — no rigid format needed.",
    examples: [
      "Met Rahul, 5L budget, proposal Friday",
      "Follow up with Priya Monday",
      "Sent quote to Aman, deal won",
      "Call Deepak tomorrow about renewal",
    ],
    color: "from-amber-500/15 to-gold/5",
    borderColor: "border-gold/20",
    iconColor: "text-gold bg-gold/15",
  },
  {
    number: "03",
    icon: CheckCircle2,
    title: "Confirm & Auto-Save",
    description:
      "The AI instantly parses your sentence and shows a preview of what it understood — contacts, deals, tasks, and notes. Hit confirm and everything is saved in the right place automatically.",
    color: "from-emerald-500/15 to-emerald-400/5",
    borderColor: "border-emerald-500/20",
    iconColor: "text-emerald-400 bg-emerald-500/15",
  },
];

/* ── Pro Tips ── */
const PRO_TIPS = [
  {
    tip: "Use names naturally",
    detail: "\"Met Rahul\" — AI auto-creates or links existing contacts",
  },
  {
    tip: "Include amounts",
    detail: "\"5L budget\" or \"₹2,00,000\" — auto-sets deal value",
  },
  {
    tip: "Mention dates",
    detail: "\"Tomorrow\", \"Monday\", \"next week\" — auto-schedules tasks",
  },
  {
    tip: "Use deal keywords",
    detail: "\"proposal sent\", \"deal won\", \"negotiation\" — auto-moves pipeline",
  },
  {
    tip: "Combine everything",
    detail: "One sentence can create a contact + deal + task + note simultaneously",
  },
];

/* ── Main Guide Component ── */
export function QuickStartGuide() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <motion.div
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="space-y-8"
    >
      {/* ── Step Cards ── */}
      <div className="space-y-4">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.number}
              variants={itemVariants}
              className={`group overflow-hidden rounded-3xl border ${step.borderColor} bg-gradient-to-br ${step.color} p-6 transition-all hover:shadow-lg dark:hover:shadow-2xl`}
            >
              <div className="flex items-start gap-5">
                {/* Step Number Orb */}
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${step.iconColor} shadow-sm`}
                >
                  <Icon className="h-5 w-5" />
                </motion.div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-bold text-slate-400 tabular-nums">
                      STEP {step.number}
                    </span>
                    {i < STEPS.length - 1 && (
                      <ChevronRight className="h-3 w-3 text-slate-300 dark:text-slate-600" />
                    )}
                  </div>
                  <h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    {step.description}
                  </p>

                  {/* Keyboard shortcut */}
                  {"shortcut" in step && step.shortcut && (
                    <div className="mt-3">{step.shortcut}</div>
                  )}

                  {/* Example commands */}
                  {"examples" in step && step.examples && (
                    <div className="mt-4 space-y-2">
                      {step.examples.map((ex) => (
                        <CopyableCommand key={ex} text={ex} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Interactive Live Demo ── */}
      <InteractiveDemo />

      {/* ── Pro Tips Section ── */}
      <motion.div
        variants={itemVariants}
        className="rounded-3xl border border-gold/15 bg-gradient-to-br from-gold/5 to-transparent p-6 dark:from-gold/5"
      >
        <div className="flex items-center gap-2 mb-5">
          <Lightbulb className="h-5 w-5 text-gold" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Pro Tips — Master the AI
          </h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PRO_TIPS.map((tip, i) => (
            <motion.div
              key={tip.tip}
              variants={itemVariants}
              whileHover={{ scale: 1.02, y: -2 }}
              className="rounded-2xl border border-slate-200/50 bg-white/70 p-4 transition-shadow hover:shadow-md dark:border-white/5 dark:bg-white/5"
            >
              <p className="text-sm font-semibold text-slate-800 dark:text-white">
                {tip.tip}
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                {tip.detail}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── Bottom CTA ── */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col items-center gap-3 rounded-3xl border border-emerald-500/15 bg-gradient-to-r from-emerald-500/5 via-transparent to-blue-500/5 p-8 text-center"
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        >
          <Sparkles className="h-8 w-8 text-gold" />
        </motion.div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
          Ready to go zero-input?
        </h3>
        <p className="max-w-md text-sm text-slate-500 dark:text-slate-400">
          Head to the Dashboard, open Quick Capture, and type your first update.
          The AI will handle everything else.
        </p>
      </motion.div>
    </motion.div>
  );
}

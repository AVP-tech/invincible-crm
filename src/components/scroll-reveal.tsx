"use client";

import { useRef, Children, cloneElement, isValidElement } from "react";
import { motion, useInView } from "framer-motion";

/* ─────────────────────────────────────────────────────────
   Variant map — every variant now pairs opacity/transform
   with a clip-path reveal for a cinematic edge.
   All easings use the golden spring curve [0.22, 1, 0.36, 1]
───────────────────────────────────────────────────────── */
type Variant =
  | "fade-up"
  | "fade-down"
  | "fade-left"
  | "fade-right"
  | "scale-up"
  | "blur-in"
  | "clip-up"
  | "clip-left"
  | "clip-right"
  | "iris";

const variantMap: Record<
  Variant,
  {
    hidden: Record<string, number | string>;
    visible: Record<string, number | string>;
    ease?: number[];
    duration?: number;
  }
> = {
  /* ── classic (existing, kept unchanged) ── */
  "fade-up": {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  },
  "fade-down": {
    hidden: { opacity: 0, y: -30 },
    visible: { opacity: 1, y: 0 },
  },
  "fade-left": {
    hidden: { opacity: 0, x: -40 },
    visible: { opacity: 1, x: 0 },
  },
  "fade-right": {
    hidden: { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0 },
  },
  "scale-up": {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
  },
  "blur-in": {
    hidden: { opacity: 0, filter: "blur(10px)" },
    visible: { opacity: 1, filter: "blur(0px)" },
  },

  /* ── premium new variants (skill-level quality) ── */
  "clip-up": {
    hidden: {
      opacity: 0,
      y: 32,
      clipPath: "inset(0 0 100% 0 round 12px)",
      filter: "blur(4px)",
    },
    visible: {
      opacity: 1,
      y: 0,
      clipPath: "inset(0 0 0% 0 round 0px)",
      filter: "blur(0px)",
    },
    ease: [0.16, 1, 0.3, 1],
    duration: 0.7,
  },
  "clip-left": {
    hidden: {
      opacity: 0,
      x: -24,
      clipPath: "inset(0 100% 0 0 round 12px)",
    },
    visible: {
      opacity: 1,
      x: 0,
      clipPath: "inset(0 0% 0 0 round 0px)",
    },
    ease: [0.22, 1, 0.36, 1],
    duration: 0.65,
  },
  "clip-right": {
    hidden: {
      opacity: 0,
      x: 24,
      clipPath: "inset(0 0 0 100% round 12px)",
    },
    visible: {
      opacity: 1,
      x: 0,
      clipPath: "inset(0 0 0 0% round 0px)",
    },
    ease: [0.22, 1, 0.36, 1],
    duration: 0.65,
  },
  "iris": {
    hidden: {
      opacity: 0,
      scale: 0.88,
      clipPath: "inset(12% 8% 12% 8% round 40px)",
      filter: "blur(8px) saturate(0.4)",
    },
    visible: {
      opacity: 1,
      scale: 1,
      clipPath: "inset(0% 0% 0% 0% round 0px)",
      filter: "blur(0px) saturate(1)",
    },
    ease: [0.16, 1, 0.3, 1],
    duration: 0.8,
  },
};

/* ─────────────────────────────────────────────────────────
   ScrollReveal — single element, all variants
───────────────────────────────────────────────────────── */
type ScrollRevealProps = {
  children: React.ReactNode;
  variant?: Variant;
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
  threshold?: number;
};

export function ScrollReveal({
  children,
  variant = "fade-up",
  delay = 0,
  duration,
  className,
  once = true,
  threshold = 0.15,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount: threshold });
  const v = variantMap[variant];
  const resolvedDuration = duration ?? v.duration ?? 0.6;
  const resolvedEase = (v.ease as [number, number, number, number]) ?? ([0.25, 1, 0.5, 1] as const);

  return (
    <motion.div
      ref={ref}
      initial={v.hidden}
      animate={isInView ? v.visible : v.hidden}
      transition={{
        duration: resolvedDuration,
        delay,
        ease: resolvedEase,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   StaggerReveal — orchestrates children with stagger delay
   Enhanced: supports all new variants + per-child stagger
   with cinematic spring easing on each child.
───────────────────────────────────────────────────────── */
type StaggerRevealProps = {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  delayChildren?: number;
  variant?: Variant;
  once?: boolean;
  threshold?: number;
};

export function StaggerReveal({
  children,
  className,
  stagger = 0.08,
  delayChildren = 0.1,
  variant = "fade-up",
  once = true,
  threshold = 0.1,
}: StaggerRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount: threshold });
  const v = variantMap[variant];
  const resolvedEase = (v.ease as [number, number, number, number]) ?? ([0.25, 1, 0.5, 1] as const);
  const resolvedDuration = v.duration ?? 0.5;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: stagger,
        delayChildren,
      },
    },
  };

  const childVariants = {
    hidden: v.hidden,
    visible: {
      ...v.visible,
      transition: {
        duration: resolvedDuration,
        ease: resolvedEase,
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      {Array.isArray(children)
        ? children.map((child, i) => (
            <motion.div key={i} variants={childVariants}>
              {child}
            </motion.div>
          ))
        : <motion.div variants={childVariants}>{children}</motion.div>
      }
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   TextReveal — word-by-word or char-by-char cinematic
   stagger. Pass a plain string — it splits and staggers.
   mode: "words" | "chars"
───────────────────────────────────────────────────────── */
export function TextReveal({
  text,
  mode = "words",
  delay = 0,
  stagger = 0.055,
  className,
  wordClassName,
  once = true,
}: {
  text: string;
  mode?: "words" | "chars";
  delay?: number;
  stagger?: number;
  className?: string;
  wordClassName?: string;
  once?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once, amount: 0.5 });
  const tokens = mode === "words" ? text.split(" ") : text.split("");
  const separator = mode === "words" ? " " : "";

  const container = {
    hidden: {},
    visible: {
      transition: { staggerChildren: stagger, delayChildren: delay },
    },
  };

  const tokenVariant = {
    hidden: {
      opacity: 0,
      y: 18,
      clipPath: "inset(0 0 100% 0)",
      filter: "blur(4px)",
    },
    visible: {
      opacity: 1,
      y: 0,
      clipPath: "inset(0 0 0% 0)",
      filter: "blur(0px)",
      transition: { duration: 0.48, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  return (
    <motion.span
      ref={ref}
      className={`inline-block ${className ?? ""}`}
      variants={container}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      aria-label={text}
    >
      {tokens.map((token, i) => (
        <span key={i} className="inline-block overflow-hidden">
          <motion.span
            className={`inline-block ${wordClassName ?? ""}`}
            variants={tokenVariant}
          >
            {token}
          </motion.span>
          {i < tokens.length - 1 && separator && (
            <span className="inline-block">{separator}</span>
          )}
        </span>
      ))}
    </motion.span>
  );
}

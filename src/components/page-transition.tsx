"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

/* ─────────────────────────────────────────────────────────
   PageTransition
   Cinematic wipe: clip-path iris bloom + blur lift + fade
   Preserves existing opacity/y/blur behaviour and upgrades
   it with a layered clip-path reveal on top.
───────────────────────────────────────────────────────── */
export function PageTransition({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        className={className}
        initial={{
          opacity: 0,
          y: 16,
          filter: "blur(6px) saturate(0.6)",
          clipPath: "inset(0 0 6% 0 round 24px)",
        }}
        animate={{
          opacity: 1,
          y: 0,
          filter: "blur(0px) saturate(1)",
          clipPath: "inset(0 0 0% 0 round 0px)",
        }}
        exit={{
          opacity: 0,
          y: -10,
          filter: "blur(4px) saturate(0.7)",
          clipPath: "inset(4% 0 0 0 round 20px)",
        }}
        transition={{
          duration: 0.52,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/* ─────────────────────────────────────────────────────────
   CinematicReveal
   A standalone one-shot reveal wrapper — use for hero
   sections, modals, drawers that need a dramatic entrance.
   Combines: clip-path bloom + scale + blur + golden glow.
───────────────────────────────────────────────────────── */
export function CinematicReveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{
        opacity: 0,
        scale: 0.94,
        y: 28,
        filter: "blur(12px) saturate(0.5)",
        clipPath: "inset(8% 4% 8% 4% round 32px)",
      }}
      animate={{
        opacity: 1,
        scale: 1,
        y: 0,
        filter: "blur(0px) saturate(1)",
        clipPath: "inset(0% 0% 0% 0% round 0px)",
      }}
      transition={{
        duration: 0.72,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   SlidePanel
   Directional panel slide — for sidebars, drawers, trays.
   direction: "left" | "right" | "up" | "down"
───────────────────────────────────────────────────────── */
type PanelDirection = "left" | "right" | "up" | "down";

const panelOffset: Record<PanelDirection, { x?: number; y?: number }> = {
  left:  { x: -40 },
  right: { x: 40 },
  up:    { y: -32 },
  down:  { y: 32 },
};

export function SlidePanel({
  children,
  direction = "right",
  delay = 0,
  className,
  show = true,
}: {
  children: React.ReactNode;
  direction?: PanelDirection;
  delay?: number;
  className?: string;
  show?: boolean;
}) {
  const offset = panelOffset[direction];
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className={className}
          initial={{ opacity: 0, filter: "blur(6px)", ...offset }}
          animate={{ opacity: 1, filter: "blur(0px)", x: 0, y: 0 }}
          exit={{
            opacity: 0,
            filter: "blur(4px)",
            ...Object.fromEntries(
              Object.entries(offset).map(([k, v]) => [k, (v as number) * 0.6])
            ),
          }}
          transition={{
            duration: 0.42,
            delay,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

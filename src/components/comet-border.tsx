"use client";

import { useEffect } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  type AnimationPlaybackControls,
} from "framer-motion";

// ─── Gold theme colour (matches your design token) ───────────────────────────
const GOLD = "rgba(230,193,106";   // base colour – append opacity + ")"

// ─────────────────────────────────────────────────────────────────────────────
// CometBorder
// Wraps any block-level content. When `isActive` is true a bright-headed
// comet races endlessly around the rectangular edge.
// ─────────────────────────────────────────────────────────────────────────────
interface CometBorderProps {
  isActive: boolean;
  radius?: string;
  duration?: number;
  children: React.ReactNode;
  className?: string;
}

export function CometBorder({
  isActive,
  radius = "1rem",
  duration = 2.6,
  children,
  className,
}: CometBorderProps) {
  const angle = useMotionValue(0);

  useEffect(() => {
    let controls: AnimationPlaybackControls | null = null;

    if (isActive) {
      controls = animate(angle, angle.get() + 360, {
        duration,
        repeat: Infinity,
        ease: "linear",
      });
    }

    return () => controls?.stop();
  }, [isActive, angle, duration]);

  const conicBg = useTransform(angle, (a) =>
    [
      `conic-gradient(from ${a}deg at 50% 50%,`,
      `  ${GOLD},1.00) 0deg,`,
      `  ${GOLD},0.80) 5deg,`,
      `  ${GOLD},0.50) 15deg,`,
      `  ${GOLD},0.20) 35deg,`,
      `  ${GOLD},0.05) 55deg,`,
      `  transparent   70deg,`,
      `  transparent   360deg`,
      `)`,
    ].join("\n")
  );

  const glowOpacity = useMotionValue(0);

  useEffect(() => {
    const target = isActive ? 1 : 0;
    const c = animate(glowOpacity, target, { duration: 0.6, ease: "easeInOut" });
    return c.stop;
  }, [isActive, glowOpacity]);

  const innerRadius = `calc(${radius} - 1.5px)`;

  return (
    <div
      className={className}
      style={{ position: "relative", borderRadius: radius }}
    >
      <motion.div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: radius,
          background: conicBg,
        }}
        animate={{ opacity: isActive ? 1 : 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      />

      <motion.div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: radius,
          boxShadow: [
            `0 0  8px 1px  ${GOLD},0.30)`,
            `0 0 24px 4px  ${GOLD},0.15)`,
            `0 0 48px 8px  ${GOLD},0.07)`,
          ].join(", "),
          opacity: glowOpacity,
        }}
      />

      <div
        style={{
          position: "relative",
          margin: "1.5px",
          borderRadius: innerRadius,
          overflow: "hidden",
        }}
      >
        {children}
      </div>
    </div>
  );
}

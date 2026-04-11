"use client";

import { useRef, useEffect, useState } from "react";
import { useInView, useSpring, useMotionValue, motion } from "framer-motion";

type AnimatedCounterProps = {
  value: number | string;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  formatFn?: (n: number) => string;
};

export function AnimatedCounter({
  value,
  duration = 1.5,
  className,
  prefix = "",
  suffix = "",
  formatFn,
}: AnimatedCounterProps) {
  const numericValue = typeof value === "string" ? parseFloat(value) || 0 : value;
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const [displayValue, setDisplayValue] = useState(0);

  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    stiffness: 80,
    damping: 30,
    mass: 1,
  });

  useEffect(() => {
    if (isInView) {
      motionValue.set(numericValue);
    }
  }, [isInView, numericValue, motionValue]);

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      setDisplayValue(Math.round(latest));
    });
    return unsubscribe;
  }, [springValue]);

  const formatted = formatFn ? formatFn(displayValue) : displayValue.toLocaleString();

  return (
    <motion.span
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 10 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {prefix}{formatted}{suffix}
    </motion.span>
  );
}

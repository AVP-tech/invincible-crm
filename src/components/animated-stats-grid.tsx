"use client";

import React from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { type: "spring" as const, stiffness: 300, damping: 24 }
  },
};

export function AnimatedStatsGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  const elements = React.Children.toArray(children);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "show" : "hidden"}
    >
      {elements.map((child, index) => (
        <motion.div key={index} variants={itemVariants} className="h-full">
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

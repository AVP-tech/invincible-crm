"use client";

import { motion } from "framer-motion";

type GradientMeshBgProps = {
  className?: string;
  variant?: "hero" | "subtle" | "warm";
};

const variants = {
  hero: [
    { color: "rgba(230,193,106,0.12)", x: "20%", y: "15%", size: 500 },
    { color: "rgba(100,140,255,0.08)", x: "75%", y: "25%", size: 450 },
    { color: "rgba(122,139,99,0.1)", x: "50%", y: "70%", size: 400 },
    { color: "rgba(217,119,87,0.06)", x: "85%", y: "80%", size: 350 },
  ],
  subtle: [
    { color: "rgba(122,139,99,0.06)", x: "30%", y: "20%", size: 350 },
    { color: "rgba(230,193,106,0.05)", x: "70%", y: "60%", size: 300 },
  ],
  warm: [
    { color: "rgba(230,193,106,0.15)", x: "25%", y: "20%", size: 500 },
    { color: "rgba(217,119,87,0.08)", x: "70%", y: "30%", size: 400 },
    { color: "rgba(100,140,255,0.06)", x: "50%", y: "75%", size: 450 },
  ],
};

export function GradientMeshBg({ className, variant = "hero" }: GradientMeshBgProps) {
  const blobs = variants[variant];

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`} aria-hidden="true">
      {blobs.map((blob, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: blob.size,
            height: blob.size,
            left: blob.x,
            top: blob.y,
            background: `radial-gradient(circle, ${blob.color}, transparent 70%)`,
            filter: "blur(80px)",
            transform: "translate(-50%, -50%)",
            willChange: "transform",
          }}
          animate={{
            x: [0, 30 * (i % 2 === 0 ? 1 : -1), -20 * (i % 2 === 0 ? 1 : -1), 0],
            y: [0, -25 * (i % 3 === 0 ? 1 : -1), 15 * (i % 3 === 0 ? 1 : -1), 0],
            scale: [1, 1.1, 0.95, 1],
          }}
          transition={{
            duration: 12 + i * 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

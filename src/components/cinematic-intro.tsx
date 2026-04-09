"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LETTERS = "INVISIBLE".split("");

const PARTICLES = Array.from({ length: 50 }, (_, i) => ({
  id: i,
  x: ((i * 37 + 13) % 97) + 1.5,
  y: ((i * 53 + 7) % 97) + 1.5,
  size: 1 + (i % 3),
  speed: 5 + (i % 7) * 2,
  delay: (i % 11) * 0.5,
  amplitude: 8 + (i % 5) * 6,
  brightness: 0.12 + (i % 5) * 0.06,
}));

export function CinematicIntro({ onComplete }: { onComplete: () => void }) {
  const [animating, setAnimating] = useState(false);
  const [visible, setVisible] = useState(true);
  const [showHint, setShowHint] = useState(false);
  const triggered = useRef(false);

  useEffect(() => {
    const t = setTimeout(() => setShowHint(true), 2000);
    return () => clearTimeout(t);
  }, []);

  const activate = useCallback(() => {
    if (triggered.current) return;
    triggered.current = true;
    setShowHint(false);
    setAnimating(true);
    setTimeout(() => setVisible(false), 4500);
    setTimeout(onComplete, 5400);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="cinematic-intro"
          className="fixed inset-0 z-[10000] flex select-none items-center justify-center overflow-hidden bg-black"
          onClick={activate}
          style={{ cursor: !animating ? "pointer" : "default" }}
          exit={{ opacity: 0, scale: 1.15, filter: "blur(30px)" }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
        >
          {/* ── Ambient Particles ── */}
          <div className="pointer-events-none absolute inset-0">
            {PARTICLES.map((p) => (
              <motion.div
                key={p.id}
                className="absolute rounded-full bg-white"
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  width: p.size,
                  height: p.size,
                  opacity: p.brightness,
                }}
                animate={
                  animating
                    ? { x: (p.x - 50) * 16, y: (p.y - 50) * 16, opacity: 0 }
                    : {
                        y: [0, -p.amplitude, 0],
                        opacity: [p.brightness, p.brightness * 2, p.brightness],
                      }
                }
                transition={
                  animating
                    ? { duration: 1.5, ease: "easeOut" }
                    : { duration: p.speed, delay: p.delay, repeat: Infinity, ease: "easeInOut" }
                }
              />
            ))}
          </div>

          {/* ── Breathing Core Glow ── */}
          {!animating && (
            <motion.div
              className="pointer-events-none absolute rounded-full"
              style={{
                width: 220,
                height: 220,
                background: "radial-gradient(circle, rgba(100,140,255,0.07), transparent 70%)",
              }}
              animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
          )}

          {/* ── Animation Sequence ── */}
          {animating && (
            <>
              {/* Flash */}
              <motion.div
                className="absolute inset-0 bg-white"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.85, 0] }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />

              {/* Lens Flare */}
              <motion.div
                className="absolute left-0 right-0 h-[2px]"
                style={{
                  top: "50%",
                  background:
                    "linear-gradient(90deg, transparent, rgba(120,160,255,0.5) 25%, rgba(255,255,255,0.9) 50%, rgba(120,160,255,0.5) 75%, transparent)",
                  boxShadow: "0 0 40px 15px rgba(120,160,255,0.2)",
                }}
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: [0, 1.2, 1], opacity: [0, 1, 0.08] }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              />

              {/* Title Block with Camera Shake */}
              <motion.div
                className="relative z-10 text-center"
                animate={{
                  x: [0, 0, 0, 0, 0, 0, -4, 5, -3, 3, -1, 0],
                  y: [0, 0, 0, 0, 0, 0, 3, -3, 2, -2, 1, 0],
                }}
                transition={{ delay: 1.7, duration: 0.4, ease: "easeOut" }}
              >
                {/* Glow Backdrop */}
                <motion.div
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{
                    width: 700,
                    height: 300,
                    background: "radial-gradient(ellipse, rgba(100,140,255,0.12), transparent 70%)",
                  }}
                  initial={{ opacity: 0, scale: 0.3 }}
                  animate={{ opacity: [0, 1, 0.6], scale: [0.3, 1.1, 1] }}
                  transition={{ duration: 2, ease: "easeOut" }}
                />

                {/* INVISIBLE — letter by letter materialization */}
                <div className="flex items-center justify-center">
                  {LETTERS.map((letter, i) => (
                    <motion.span
                      key={i}
                      className="inline-block font-serif"
                      style={{
                        fontSize: "clamp(3rem, 12vw, 9rem)",
                        fontWeight: 700,
                        lineHeight: 0.95,
                        letterSpacing: "-0.04em",
                      }}
                      initial={{
                        opacity: 0,
                        y: 25,
                        scale: 1.3,
                        filter: "blur(16px)",
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        filter: "blur(0px)",
                        textShadow:
                          "0 0 60px rgba(120,160,255,0.5), 0 0 120px rgba(120,160,255,0.15)",
                      }}
                      transition={{
                        delay: 0.35 + i * 0.1,
                        duration: 0.65,
                        ease: [0.25, 1, 0.5, 1],
                      }}
                    >
                      {letter}
                    </motion.span>
                  ))}
                </div>

                {/* CRM — impact drop */}
                <motion.div
                  initial={{ opacity: 0, y: -35, scale: 2 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    delay: 1.8,
                    type: "spring",
                    stiffness: 280,
                    damping: 18,
                    mass: 0.8,
                  }}
                >
                  <span
                    className="font-serif"
                    style={{
                      fontSize: "clamp(1.5rem, 5vw, 3.5rem)",
                      fontWeight: 600,
                      letterSpacing: "0.4em",
                      color: "rgba(255,255,255,0.75)",
                      textShadow: "0 0 40px rgba(100,140,255,0.35)",
                    }}
                  >
                    CRM
                  </span>
                </motion.div>

                {/* Shockwave Ring */}
                <motion.div
                  className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/25"
                  initial={{ width: 10, height: 10, opacity: 0.7 }}
                  animate={{ width: 900, height: 900, opacity: 0 }}
                  transition={{ delay: 1.85, duration: 1.2, ease: "easeOut" }}
                />

                {/* Tagline */}
                <motion.p
                  className="mt-8 text-lg tracking-wide text-white/50"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2.8, duration: 0.8, ease: "easeOut" }}
                >
                  AI-first CRM for businesses that hate admin.
                </motion.p>
              </motion.div>

              {/* Expanding edge glow */}
              <motion.div
                className="pointer-events-none absolute inset-0"
                style={{
                  boxShadow: "inset 0 0 120px 40px rgba(80,120,220,0.08)",
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0.3] }}
                transition={{ delay: 0.35, duration: 2 }}
              />
            </>
          )}

          {/* ── Click Hint ── */}
          <AnimatePresence>
            {showHint && !animating && (
              <motion.div
                key="hint"
                className="absolute bottom-16 flex flex-col items-center gap-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.6 }}
              >
                <motion.div
                  className="h-12 w-12 rounded-full border border-white/15"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.25, 0.08, 0.25] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                />
                <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/20">
                  Click anywhere to awaken
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Vignette ── */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

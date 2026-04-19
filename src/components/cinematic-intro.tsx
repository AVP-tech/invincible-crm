"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LETTERS = "INVINCIBLE".split("");

const PARTICLES = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  x: ((i * 37 + 13) % 97) + 1.5,
  y: ((i * 53 + 7) % 97) + 1.5,
  size: 1 + (i % 4),
  speed: 5 + (i % 7) * 2,
  delay: (i % 11) * 0.5,
  amplitude: 8 + (i % 5) * 6,
  brightness: 0.12 + (i % 5) * 0.06,
  isGold: i % 3 === 0,
}));

export function CinematicIntro({ onComplete }: { onComplete: () => void }) {
  const [animating, setAnimating] = useState(false);
  const [visible, setVisible] = useState(true);
  const [showHint, setShowHint] = useState(false);
  const triggered = useRef(false);
  const autoActivateTimeoutRef = useRef<number | null>(null);
  const hideTimeoutRef = useRef<number | null>(null);
  const completeTimeoutRef = useRef<number | null>(null);

  const activate = useCallback(() => {
    if (triggered.current) return;
    triggered.current = true;
    setShowHint(false);
    setAnimating(true);
    completeTimeoutRef.current = window.setTimeout(onComplete, 900);
    hideTimeoutRef.current = window.setTimeout(() => setVisible(false), 2200);
  }, [onComplete]);

  useEffect(() => {
    const hintTimeout = window.setTimeout(() => setShowHint(true), 1600);
    autoActivateTimeoutRef.current = window.setTimeout(() => activate(), 3200);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        activate();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(hintTimeout);
      if (autoActivateTimeoutRef.current) {
        window.clearTimeout(autoActivateTimeoutRef.current);
      }
      if (hideTimeoutRef.current) {
        window.clearTimeout(hideTimeoutRef.current);
      }
      if (completeTimeoutRef.current) {
        window.clearTimeout(completeTimeoutRef.current);
      }
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activate]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="cinematic-intro"
          className={`fixed inset-0 z-[10000] flex select-none items-center justify-center overflow-hidden bg-black ${animating ? "pointer-events-none" : ""}`}
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
                className="absolute rounded-full"
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  width: p.size,
                  height: p.size,
                  opacity: p.brightness,
                  background: p.isGold
                    ? "radial-gradient(circle, #f6d486, #e8a930)"
                    : "white",
                  boxShadow: p.isGold
                    ? "0 0 6px rgba(230,193,106,0.4)"
                    : "none",
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

          {/* ── Breathing Core Glow — golden ── */}
          {!animating && (
            <motion.div
              className="pointer-events-none absolute rounded-full"
              style={{
                width: 280,
                height: 280,
                background: "radial-gradient(circle, rgba(230,193,106,0.1), rgba(100,140,255,0.04), transparent 70%)",
              }}
              animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
          )}

          {/* ── Animation Sequence ── */}
          {animating && (
            <>
              {/* Golden Flash */}
              <motion.div
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(135deg, #f6d486, #ffffff, #e8a930)",
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.85, 0] }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />

              {/* Golden Lens Flare */}
              <motion.div
                className="absolute left-0 right-0 h-[2px]"
                style={{
                  top: "50%",
                  background:
                    "linear-gradient(90deg, transparent, rgba(230,193,106,0.6) 25%, rgba(255,255,255,0.9) 50%, rgba(230,193,106,0.6) 75%, transparent)",
                  boxShadow: "0 0 40px 15px rgba(230,193,106,0.25)",
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
                {/* Glow Backdrop — golden */}
                <motion.div
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{
                    width: 700,
                    height: 300,
                    background: "radial-gradient(ellipse, rgba(230,193,106,0.15), rgba(100,140,255,0.06), transparent 70%)",
                  }}
                  initial={{ opacity: 0, scale: 0.3 }}
                  animate={{ opacity: [0, 1, 0.6], scale: [0.3, 1.1, 1] }}
                  transition={{ duration: 2, ease: "easeOut" }}
                />

                {/* Crown Icon */}
                <motion.div
                  className="mx-auto mb-4 flex items-center justify-center"
                  initial={{ opacity: 0, scale: 0, rotate: -180 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ delay: 0.15, duration: 0.8, type: "spring", stiffness: 200, damping: 15 }}
                >
                  <span style={{ fontSize: "2.5rem", filter: "drop-shadow(0 0 20px rgba(230,193,106,0.5))" }}>
                    👑
                  </span>
                </motion.div>

                {/* INVINCIBLE — letter by letter materialization */}
                <div className="flex items-center justify-center">
                  {LETTERS.map((letter, i) => (
                    <motion.span
                      key={i}
                      className="inline-block font-serif"
                      style={{
                        fontSize: "clamp(2.5rem, 10vw, 8rem)",
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
                          "0 0 60px rgba(230,193,106,0.6), 0 0 120px rgba(230,193,106,0.2)",
                        color: "#ffffff",
                      }}
                      transition={{
                        delay: 0.35 + i * 0.08,
                        duration: 0.65,
                        ease: [0.25, 1, 0.5, 1],
                      }}
                    >
                      {letter}
                    </motion.span>
                  ))}
                </div>

                {/* CRM — golden impact drop */}
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
                      background: "linear-gradient(135deg, #f6d486, #e8a930, #f6d486)",
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text",
                      color: "transparent",
                      textShadow: "none",
                      filter: "drop-shadow(0 0 30px rgba(230,193,106,0.4))",
                    }}
                  >
                    CRM
                  </span>
                </motion.div>

                {/* Shockwave Ring 1 */}
                <motion.div
                  className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{ border: "1px solid rgba(230,193,106,0.35)" }}
                  initial={{ width: 10, height: 10, opacity: 0.7 }}
                  animate={{ width: 900, height: 900, opacity: 0 }}
                  transition={{ delay: 1.85, duration: 1.2, ease: "easeOut" }}
                />

                {/* Shockwave Ring 2 — delayed */}
                <motion.div
                  className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{ border: "2px solid rgba(230,193,106,0.2)" }}
                  initial={{ width: 10, height: 10, opacity: 0.5 }}
                  animate={{ width: 1200, height: 1200, opacity: 0 }}
                  transition={{ delay: 2.0, duration: 1.5, ease: "easeOut" }}
                />

                {/* Tagline */}
                <motion.p
                  className="mt-8 text-lg tracking-wide"
                  style={{ color: "rgba(230,193,106,0.7)" }}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2.8, duration: 0.8, ease: "easeOut" }}
                >
                  The CRM that never drops the ball.
                </motion.p>
              </motion.div>

              {/* Expanding edge glow — golden */}
              <motion.div
                className="pointer-events-none absolute inset-0"
                style={{
                  boxShadow: "inset 0 0 120px 40px rgba(230,193,106,0.06)",
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
                  className="h-12 w-12 rounded-full"
                  style={{ border: "1px solid rgba(230,193,106,0.2)" }}
                  animate={{ scale: [1, 1.5, 1], opacity: [0.25, 0.08, 0.25] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                />
                <p className="text-xs font-semibold uppercase tracking-[0.4em]" style={{ color: "rgba(230,193,106,0.3)" }}>
                  Click or press Enter to awaken
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

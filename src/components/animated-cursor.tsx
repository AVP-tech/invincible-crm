"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function AnimatedCursor() {
  const [isMounted, setIsMounted] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Smooth, snappy physics config so it's not frustratingly slow
  const springConfig = { damping: 30, stiffness: 450, mass: 0.2 };
  const outerX = useSpring(cursorX, springConfig);
  const outerY = useSpring(cursorY, springConfig);

  const innerSpringConfig = { damping: 25, stiffness: 800, mass: 0.1 };
  const innerX = useSpring(cursorX, innerSpringConfig);
  const innerY = useSpring(cursorY, innerSpringConfig);

  useEffect(() => {
    setIsMounted(true);

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX - 16);
      cursorY.set(e.clientY - 16);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName.toLowerCase() === "a" ||
        target.tagName.toLowerCase() === "button" ||
        target.closest("a") ||
        target.closest("button") ||
        target.closest("[role='button']")
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, [cursorX, cursorY]);

  if (!isMounted) return null;

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        * {
          cursor: none !important;
        }
      `,
        }}
      />
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[9999] flex h-8 w-8 items-center justify-center rounded-full border-2 border-accent/50 bg-accent/10 backdrop-blur-[2px]"
        style={{
          x: outerX,
          y: outerY,
        }}
        animate={{
          scale: isHovering ? 1.5 : 1,
          backgroundColor: isHovering
            ? "rgba(122, 139, 99, 0.2)"
            : "rgba(122, 139, 99, 0.1)",
        }}
        transition={{ duration: 0.15, ease: "easeOut" }}
      />
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[9999] h-2 w-2 rounded-full bg-accent-strong"
        style={{
          x: innerX,
          y: innerY,
          translateX: "12px", // 16px - 4px (half of w-2)
          translateY: "12px",
        }}
        animate={{
          scale: isHovering ? 0 : 1,
          opacity: isHovering ? 0 : 1,
        }}
        transition={{ duration: 0.1, ease: "easeOut" }}
      />
    </>
  );
}

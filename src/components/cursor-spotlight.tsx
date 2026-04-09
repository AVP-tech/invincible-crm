"use client";

import { useEffect, useRef, useState } from "react";

export function CursorSpotlight() {
  const spotlightRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const spotlight = spotlightRef.current;
    if (!spotlight) return;

    let rafId: number;

    const handleMouseMove = (e: MouseEvent) => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        spotlight.style.setProperty("--spot-x", `${e.clientX}px`);
        spotlight.style.setProperty("--spot-y", `${e.clientY}px`);
        spotlight.style.opacity = "1";
      });
    };

    const handleMouseLeave = () => {
      spotlight.style.opacity = "0";
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div
      ref={spotlightRef}
      className="cursor-spotlight"
      style={{ opacity: 0 }}
      aria-hidden="true"
    />
  );
}

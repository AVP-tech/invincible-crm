"use client";

import { useRef, useState } from "react";

type TiltCardProps = {
  children: React.ReactNode;
  className?: string;
  tiltIntensity?: number;
  glareOpacity?: number;
  scale?: number;
};

export function TiltCard({
  children,
  className = "",
  tiltIntensity = 10,
  glareOpacity = 0.15,
  scale = 1.02,
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("");
  const [glareStyle, setGlareStyle] = useState<React.CSSProperties>({ opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -tiltIntensity;
    const rotateY = ((x - centerX) / centerX) * tiltIntensity;

    setTransform(
      `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`
    );

    setGlareStyle({
      opacity: glareOpacity,
      background: `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.25), transparent 60%)`,
    });
  };

  const handleMouseLeave = () => {
    setTransform("perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)");
    setGlareStyle({ opacity: 0 });
  };

  return (
    <div
      ref={cardRef}
      className={className}
      style={{
        transform,
        transition: "transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)",
        transformStyle: "preserve-3d",
        willChange: "transform",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {/* Glare overlay */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{
          ...glareStyle,
          transition: "opacity 0.3s ease",
        }}
      />
    </div>
  );
}

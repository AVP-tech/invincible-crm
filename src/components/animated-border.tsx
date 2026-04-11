"use client";

type AnimatedBorderProps = {
  children: React.ReactNode;
  className?: string;
  borderWidth?: number;
  borderRadius?: string;
  gradient?: string;
  duration?: string;
  active?: boolean;
};

export function AnimatedBorder({
  children,
  className = "",
  borderWidth = 1.5,
  borderRadius = "2rem",
  gradient = "conic-gradient(from var(--border-angle, 0deg), rgba(230,193,106,0.4), rgba(122,139,99,0.3), rgba(100,140,255,0.3), rgba(230,193,106,0.4))",
  duration = "4s",
  active = true,
}: AnimatedBorderProps) {
  if (!active) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      className={`animated-border-wrapper ${className}`}
      style={{
        position: "relative",
        borderRadius,
        padding: borderWidth,
        background: gradient,
        backgroundSize: "100% 100%",
        animation: `border-rotate ${duration} linear infinite`,
      }}
    >
      <div
        style={{
          borderRadius: `calc(${borderRadius} - ${borderWidth}px)`,
          background: "inherit",
          position: "relative",
          zIndex: 1,
        }}
        className="bg-white dark:bg-[#161c28]"
      >
        {children}
      </div>
    </div>
  );
}

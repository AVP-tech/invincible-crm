import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Invincible CRM — The AI-Powered Command Center",
  description:
    "The CRM that never drops the ball. AI-powered workspace with Captain Hook agent, WhatsApp automation, and intelligent pipeline management.",
};

export default function MotionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

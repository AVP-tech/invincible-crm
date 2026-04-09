"use client";

import { usePathname } from "next/navigation";
import { PageTransition } from "./page-transition";

export function PageTransitionWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <PageTransition key={pathname} className="min-w-0 flex-1 flex-col flex h-full">
      {children}
    </PageTransition>
  );
}

"use client";

import { ArrowUpRight, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedCounter } from "@/components/animated-counter";

type StatCardProps = {
  label: string;
  value: string | number;
  hint: string;
};

export function StatCard({ label, value, hint }: StatCardProps) {
  const numValue = typeof value === "number" ? value : parseFloat(value) || 0;

  return (
    <Card className="stat-card-gradient h-full group">
      <CardContent className="flex h-full items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <div className="mt-3">
            <AnimatedCounter
              value={numValue}
              className="text-3xl font-bold tracking-tight text-ink"
            />
          </div>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{hint}</p>
        </div>
        <div className="rounded-2xl bg-gold/10 p-2.5 text-gold transition-all duration-300 group-hover:bg-gold/20 group-hover:scale-110">
          <TrendingUp className="h-4 w-4" />
        </div>
      </CardContent>
    </Card>
  );
}

import { ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type StatCardProps = {
  label: string;
  value: string | number;
  hint: string;
};

export function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <Card className="h-full">
      <CardContent className="flex h-full items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-ink">{value}</p>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{hint}</p>
        </div>
        <div className="rounded-2xl bg-moss/10 p-2 text-moss">
          <ArrowUpRight className="h-4 w-4" />
        </div>
      </CardContent>
    </Card>
  );
}

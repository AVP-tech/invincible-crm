"use client";

import Link from "next/link";
import { DealStage } from "@prisma/client";
import { DndContext, DragEndEvent, PointerSensor, useDroppable, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { dealStageMeta } from "@/lib/domain";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DealStageBadge } from "@/components/status-badges";

type DealCard = {
  id: string;
  title: string;
  stage: DealStage;
  amount: number | null;
  currency: string;
  expectedCloseDate: Date | null;
  contact?: {
    name: string;
  } | null;
};

type DealsBoardProps = {
  deals: DealCard[];
};

export function DealsBoard({ deals }: DealsBoardProps) {
  const router = useRouter();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const [items, setItems] = useState(deals);
  const grouped = useMemo(
    () =>
      Object.values(DealStage).reduce<Record<DealStage, DealCard[]>>((acc, stage) => {
        acc[stage] = items.filter((deal) => deal.stage === stage);
        return acc;
      }, {} as Record<DealStage, DealCard[]>),
    [items]
  );

  async function onDragEnd(event: DragEndEvent) {
    const activeId = String(event.active.id);
    const overId = event.over ? String(event.over.id) : "";

    if (!overId || activeId === overId) return;

    const nextStage = Object.values(DealStage).find((stage) => stage === overId) ?? items.find((deal) => deal.id === overId)?.stage;
    if (!nextStage) return;

    const currentDeal = items.find((deal) => deal.id === activeId);
    if (!currentDeal || currentDeal.stage === nextStage) return;

    setItems((current) => current.map((deal) => (deal.id === activeId ? { ...deal, stage: nextStage } : deal)));

    const response = await fetch(`/api/deals/${activeId}/move`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ stage: nextStage })
    });

    if (!response.ok) {
      toast.error("Could not move the deal");
      setItems(deals);
      return;
    }

    toast.success("Deal moved");
    router.refresh();
  }

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      <div className="grid gap-5 xl:grid-cols-4 2xl:grid-cols-7">
        {Object.values(DealStage).map((stage) => (
          <DealColumn key={stage} stage={stage} deals={grouped[stage]} />
        ))}
      </div>
    </DndContext>
  );
}

function DealColumn({ stage, deals }: { stage: DealStage; deals: DealCard[] }) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage
  });

  return (
    <div ref={setNodeRef} className="space-y-4 rounded-4xl bg-white/35 p-1 dark:bg-white/5">
      <Card className={`h-full transition ${isOver ? "ring-2 ring-moss/30" : ""}`}>
        <CardHeader>
          <div>
            <h3 className="font-semibold text-ink">{dealStageMeta[stage].label}</h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{dealStageMeta[stage].description}</p>
          </div>
          <div className="rounded-2xl bg-sand px-3 py-1 text-sm font-semibold text-ink">{deals.length}</div>
        </CardHeader>
        <CardContent className="space-y-3">
          <SortableContext items={deals.map((deal) => deal.id)} strategy={verticalListSortingStrategy}>
            <div className="min-h-24 space-y-3">
              {deals.map((deal) => (
                <DealSortableCard key={deal.id} deal={deal} />
              ))}
            </div>
          </SortableContext>
        </CardContent>
      </Card>
    </div>
  );
}

function DealSortableCard({ deal }: { deal: DealCard }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: deal.id });

  return (
    <Link href={`/deals/${deal.id}`}>
      <div
        ref={setNodeRef}
        style={{ transform: CSS.Transform.toString(transform), transition }}
        {...attributes}
        {...listeners}
        className="cursor-grab rounded-3xl border border-black/5 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft dark:border-white/8 dark:bg-white/5"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold text-ink">{deal.title}</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{deal.contact?.name ?? "No contact linked"}</p>
          </div>
          <DealStageBadge stage={deal.stage} />
        </div>
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="font-semibold text-ink">{formatCurrency(deal.amount, deal.currency)}</span>
          <span className="text-slate-500 dark:text-slate-400">{formatDate(deal.expectedCloseDate)}</span>
        </div>
      </div>
    </Link>
  );
}

import { activityTypeCopy } from "@/lib/domain";
import { formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type ActivityItem = {
  id: string;
  type: keyof typeof activityTypeCopy;
  title: string;
  description: string | null;
  createdAt: Date;
};

type ActivityListProps = {
  activities: ActivityItem[];
};

export function ActivityList({ activities }: ActivityListProps) {
  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex gap-4 rounded-3xl border border-black/5 bg-white/80 p-4 dark:border-white/8 dark:bg-white/5">
          <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-moss" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium text-ink">{activity.title}</p>
              <Badge className="bg-slate-100 text-slate-600">{activityTypeCopy[activity.type]}</Badge>
            </div>
            {activity.description ? <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{activity.description}</p> : null}
            <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">{formatDateTime(activity.createdAt)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

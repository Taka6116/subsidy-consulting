import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type DeadlineRailItem = {
  id: string;
  name: string;
  meta: string;
  daysLeft: number | null;
  deadlineDate: string;
};

type Urgency = "critical" | "warning" | "normal";

function urgencyFromDays(days: number | null): Urgency {
  if (days === null) return "normal";
  if (days <= 1) return "critical";
  if (days <= 3) return "warning";
  return "normal";
}

function accentClass(urgency: Urgency): string {
  switch (urgency) {
    case "critical":
      return "bg-gradient-to-b from-amber-500 to-orange-500 group-hover:from-amber-600 group-hover:to-orange-600";
    case "warning":
      return "bg-gradient-to-b from-amber-300 to-amber-400 group-hover:from-amber-400 group-hover:to-amber-500";
    default:
      return "bg-gradient-to-b from-[#93c5fd] to-[#60a5fa] group-hover:from-[#60a5fa] group-hover:to-[#3b82f6]";
  }
}

function daysPillClass(urgency: Urgency): string {
  switch (urgency) {
    case "critical":
      return "bg-amber-100 text-amber-800 ring-amber-200/80";
    case "warning":
      return "bg-amber-50 text-amber-700 ring-amber-100";
    default:
      return "bg-[#eef4ff] text-[#1f4dab] ring-[#dbe5fa]";
  }
}

function DeadlineRailRow({ item }: { item: DeadlineRailItem }) {
  const urgency = urgencyFromDays(item.daysLeft);
  const showPill = item.daysLeft !== null && item.daysLeft <= 1;
  const daysLabel =
    item.daysLeft === null ? "随時" : `残り${item.daysLeft}日`;

  return (
    <Link
      href={`/subsidies/list/${item.id}`}
      className="group relative flex gap-3 border-b border-[#eef2f8] px-1 py-3 transition last:border-b-0 hover:bg-[#f8fbff]"
    >
      <span
        aria-hidden
        className={`mt-0.5 w-[3px] shrink-0 self-stretch rounded-full ${accentClass(urgency)}`}
      />
      <div className="min-w-0 flex-1 pr-5">
        <div className="flex flex-wrap items-center gap-2">
          {showPill ? (
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums ring-1 ring-inset ${daysPillClass(urgency)}`}
            >
              {daysLabel}
            </span>
          ) : (
            <span
              className={`text-[11px] font-bold tabular-nums ${
                urgency === "warning"
                  ? "text-amber-700"
                  : urgency === "critical"
                    ? "text-amber-800"
                    : "text-[#5b6b8c]"
              }`}
            >
              {daysLabel}
            </span>
          )}
          <span className="font-mono text-[10px] tabular-nums text-[#6b7a99]">
            {item.deadlineDate}
          </span>
        </div>
        <p className="mt-1.5 line-clamp-2 text-[13px] font-semibold leading-snug text-[#243862] group-hover:text-[#0B4F8A]">
          {item.name}
        </p>
        <p className="mt-1 line-clamp-1 text-[11px] text-[#6b7a99]">{item.meta}</p>
      </div>
      <ChevronRight
        aria-hidden
        className="absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 text-[#c5d3eb] opacity-0 transition group-hover:opacity-100 group-hover:text-[#3b82f6]"
      />
    </Link>
  );
}

export default function SubsidyDeadlineRail({
  items,
}: {
  items: DeadlineRailItem[];
}) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-[0_8px_24px_rgba(29,78,160,0.05),0_0_0_1px_rgba(29,78,160,0.09)]">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-sm font-bold text-[#1e3878]">締切が近い補助金</h4>
        {items.length > 0 ? (
          <span className="inline-flex items-center rounded-full bg-[#eef4ff] px-2 py-0.5 text-[10px] font-bold tabular-nums text-[#1f4dab] ring-1 ring-inset ring-[#dbe5fa]">
            {items.length}件
          </span>
        ) : null}
      </div>
      {items.length === 0 ? (
        <p className="mt-3 text-xs leading-relaxed text-[#6b7a99]">
          締切間近の案件はありません。
        </p>
      ) : (
        <div className="mt-2">
          {items.map((item) => (
            <DeadlineRailRow key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

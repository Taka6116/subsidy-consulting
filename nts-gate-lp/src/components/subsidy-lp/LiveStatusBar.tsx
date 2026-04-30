"use client";

import { useEffect, useState } from "react";

type LiveStatusBarProps = {
  publishedAt: Date;
  updatedAt: Date;
  applicationDeadline: Date;
};

function formatDateTimeJP(date: Date): string {
  return date.toLocaleString("ja-JP", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatUpdatedLabel(now: Date, updatedAt: Date): string {
  const diffMinutes = Math.max(
    0,
    Math.floor((now.getTime() - updatedAt.getTime()) / (1000 * 60)),
  );

  if (diffMinutes < 60) return `${diffMinutes}分前`;
  if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}時間前`;
  return `${Math.floor(diffMinutes / 1440)}日前`;
}

function calcDaysUntilDeadline(now: Date, deadline: Date): number {
  return Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export default function LiveStatusBar({
  publishedAt,
  updatedAt,
  applicationDeadline,
}: LiveStatusBarProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const daysUntilDeadline = calcDaysUntilDeadline(now, applicationDeadline);
  const updatedLabel = formatUpdatedLabel(now, updatedAt);

  return (
    <div className="w-full border-b border-slate-200 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2 text-xs text-slate-600 sm:px-6 md:gap-4 md:text-sm">
        <span className="inline-flex items-center gap-1.5 font-semibold text-red-600">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-600" />
          </span>
          LIVE
        </span>

        <span className="text-slate-300">|</span>

        <span className="truncate">
          公開：{formatDateTimeJP(publishedAt)}
        </span>

        <span className="hidden text-slate-300 md:inline">|</span>

        <span className="hidden md:inline">最終更新：{updatedLabel}</span>

        <span className="ml-auto shrink-0 font-semibold text-slate-900">
          締切まで残り{" "}
          <span className={daysUntilDeadline <= 30 ? "text-red-600" : "text-slate-900"}>
            {daysUntilDeadline}
          </span>{" "}
          日
        </span>
      </div>
    </div>
  );
}

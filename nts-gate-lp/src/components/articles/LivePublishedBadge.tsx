// ========== [NEW 2026-04-30] 速報バッジコンポーネント ==========
"use client";

import { useEffect, useState } from "react";

type Props = {
  publishedAt: Date;
  /** 行政発表からの経過分数。DBにデータがない場合は undefined でよい */
  minutesAfterAnnouncement?: number;
};

export function LivePublishedBadge({ publishedAt, minutesAfterAnnouncement }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const formatted = publishedAt.toLocaleString("ja-JP", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3 text-sm">
      {/* LIVE ドット */}
      <span className="inline-flex items-center gap-2 font-semibold text-red-600">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-red-600" />
        </span>
        LIVE
      </span>

      <span className="text-slate-500">{formatted} 公開</span>

      {/* 行政発表からの経過時間（データがある場合のみ表示） */}
      {/* TODO: minutesAfterAnnouncement を DB に追加したら実データを渡す */}
      {minutesAfterAnnouncement != null && (
        <span className="rounded-full bg-amber-50 px-3 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
          行政発表から {minutesAfterAnnouncement} 分後に公開
        </span>
      )}
    </div>
  );
}

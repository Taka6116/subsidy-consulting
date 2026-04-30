"use client";

import { useEffect, useState } from "react";

function getDaysUntil(deadline: Date, now: Date): number {
  return Math.floor((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export default function DeadlineCountdown({ deadline }: { deadline: Date }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const days = getDaysUntil(deadline, now);
  const urgency = days <= 14 ? "critical" : days <= 60 ? "warning" : "normal";

  const colors = {
    normal: "border-slate-200 bg-slate-50 text-slate-700",
    warning: "border-amber-200 bg-amber-50 text-amber-900",
    critical: "border-red-300 bg-red-50 text-red-900",
  } as const;

  return (
    <section className="bg-[var(--bg-section-alt)] px-4 py-8 sm:px-6 md:py-10">
      {/* ========== [NEW 2026-04-30] 締切カウントダウン - 申請の流れ直前 ========== */}
      <div className="mx-auto max-w-3xl">
        <div className={`rounded-3xl border p-7 text-center shadow-sm md:p-9 ${colors[urgency]}`}>
          <p className="text-xs font-black uppercase tracking-[0.22em]">
            Deadline Countdown
          </p>
          <p className="mt-3 text-sm font-bold">締切までの残り日数</p>
          <p className="mt-2 text-6xl font-black leading-none tabular-nums md:text-8xl">
            {Math.max(days, 0)}
          </p>
          <p className="mt-2 text-sm font-bold">
            日（
            {deadline.toLocaleDateString("ja-JP", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
            まで）
          </p>
          {urgency === "critical" && (
            <p className="mt-4 text-xs font-extrabold">
              申請準備には通常2〜4週間が必要です。早めの確認をおすすめします。
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

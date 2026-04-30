// ========== [NEW 2026-04-30] 記事ヘッダー用 締切カウントダウン ==========
"use client";

import { useEffect, useState } from "react";

type Props = {
  /** 公募期限の Date オブジェクト */
  deadline: Date;
  /** 表示用ラベル（例: "2026年10月12日"） */
  deadlineLabel: string;
};

export function ArticleDeadlineCountdown({ deadline, deadlineLabel }: Props) {
  const [days, setDays] = useState<number | null>(null);

  useEffect(() => {
    const calc = () => {
      const diff = deadline.getTime() - Date.now();
      setDays(Math.ceil(diff / (1000 * 60 * 60 * 24)));
    };
    calc();
    const timer = setInterval(calc, 60_000);
    return () => clearInterval(timer);
  }, [deadline]);

  if (days === null) return null;

  const urgency = days <= 14 ? "critical" : days <= 60 ? "warning" : "normal";

  const styles = {
    normal:   { bg: "bg-white/80 ring-primary-200/40", label: "text-neutral-500", value: "text-primary-900", badge: "bg-primary-50 text-primary-700 ring-primary-200" },
    warning:  { bg: "bg-amber-50/80 ring-amber-200/60", label: "text-amber-700", value: "text-amber-900", badge: "bg-amber-100 text-amber-800 ring-amber-300" },
    critical: { bg: "bg-red-50/80 ring-red-200/60", label: "text-red-600", value: "text-red-900", badge: "bg-red-100 text-red-800 ring-red-300" },
  }[urgency];

  return (
    <div className={`rounded-lg px-4 py-3 ring-1 backdrop-blur-sm ${styles.bg}`}>
      <dt className={`text-xs font-medium ${styles.label}`}>締切まで</dt>
      <dd className={`mt-0.5 font-bold tabular-nums ${styles.value}`}>
        <span className="text-xl">{days > 0 ? days : 0}</span>
        <span className="ml-1 text-sm font-semibold">日</span>
      </dd>
      <p className={`mt-1 text-[11px] ${styles.label}`}>{deadlineLabel}</p>
      {urgency === "critical" && days > 0 && (
        <span className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${styles.badge}`}>
          ⚠ 申請準備は早めに
        </span>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

const PROGRESS_CAP = 76;
const TICK_MS = 280;

export default function SubsidyMatchLoading() {
  const [percent, setPercent] = useState(0);
  const [messageVisible, setMessageVisible] = useState(false);

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      setPercent(70);
      setMessageVisible(true);
      return;
    }

    const showMsg = window.setTimeout(() => setMessageVisible(true), 620);

    const id = window.setInterval(() => {
      setPercent((p) => {
        if (p >= PROGRESS_CAP) return p;
        const delta =
          p < 24 ? 0.55 : p < 46 ? 0.38 : p < 60 ? 0.25 : 0.15;
        return Math.min(PROGRESS_CAP, Math.round((p + delta) * 10) / 10);
      });
    }, TICK_MS);

    return () => {
      window.clearInterval(id);
      window.clearTimeout(showMsg);
    };
  }, []);

  const pRounded = Math.round(percent);

  return (
    <div
      className="flex min-h-[420px] flex-col items-center justify-center px-6 py-20"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="補助金を照合しています"
    >
      <div className="relative mx-auto aspect-square w-[min(56vw,200px)] max-w-[200px]">
        {/* 固定トラックリング */}
        <div
          className="pointer-events-none absolute inset-0 rounded-full border-[3px] border-white/[0.08]"
          aria-hidden
        />

        {/* 回転ハイライト弧 */}
        <div
          className="subsidy-match-loading-spin-overlay pointer-events-none absolute inset-[-1px] rounded-full"
          aria-hidden
        />

        {/* 中央の数字 */}
        <div className="absolute inset-[6px] flex flex-col items-center justify-center rounded-full">
          <span className="font-display text-[clamp(2.5rem,10vw,3.25rem)] font-semibold tabular-nums leading-none text-white">
            {pRounded}
            <span className="text-[0.45em] font-medium text-white/60">%</span>
          </span>
        </div>
      </div>

      <p
        className={`subsidy-match-loading-message px-4 ${
          messageVisible ? "subsidy-match-loading-message--visible" : ""
        }`}
      >
        日本提携支援は補助金申請だけではなく、相談から採択、そしてその先も伴走します。
      </p>
    </div>
  );
}

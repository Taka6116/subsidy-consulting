"use client";

import { useEffect, useRef, useState } from "react";
import type { SubsidyLpData } from "@/lib/subsidy-lp/buildSubsidyLpData";

type Props = { data: SubsidyLpData };

const INDUSTRY_LABELS = ["製造業・50名規模", "小売・飲食業", "サービス業・IT"];

function IndustryIcon({ index }: { index: number }) {
  const props = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    width: 32,
    height: 32,
    "aria-hidden": true,
  };

  if (index % 3 === 1) {
    return (
      <svg {...props}>
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    );
  }

  if (index % 3 === 2) {
    return (
      <svg {...props}>
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
        <line x1="12" y1="12" x2="12" y2="16" />
        <line x1="10" y1="14" x2="14" y2="14" />
      </svg>
    );
  }

  return (
    <svg {...props}>
      <path d="M2 20h20M4 20V10l6-4v4l6-4v14" />
      <rect x="14" y="14" width="4" height="6" />
    </svg>
  );
}

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

export default function SubsidyLpUseCases({ data }: Props) {
  const { ref, visible } = useInView();

  return (
    <section className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
      {/* ヘッダー */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
            Use Cases
          </p>
          <h2
            className="text-2xl font-black tracking-[-0.02em] text-slate-900 sm:text-3xl"
          >
            活用イメージ
          </h2>
        </div>
        <p
          className="max-w-xs rounded-2xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs font-bold leading-6 text-amber-700"
        >
          ※ 以下は想定事例です。実際の採択事例ではありません。
        </p>
      </div>

      {/* ペルソナカード群 */}
      <div ref={ref} className="mt-7 grid gap-5 lg:grid-cols-3">
        {data.useCases.map((uc, i) => (
          <div
            key={i}
            className="relative flex flex-col overflow-hidden rounded-2xl shadow-sm transition"
            style={{
              background: "#FFFFFF",
              border: "1px solid #E5E7EB",
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(20px)",
              transitionDuration: "var(--nts-dur-slow)",
              transitionTimingFunction: "var(--nts-ease-out)",
              transitionDelay: `${i * 100}ms`,
            }}
          >
            {/* カードヘッダー */}
            <div
              className="flex items-center gap-3 px-5 py-4"
              style={{ borderBottom: "1px solid #F1F5F9" }}
            >
              <span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-700 ring-1 ring-slate-100"
              >
                <IndustryIcon index={i} />
              </span>
              <div>
                <p
                  className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400"
                >
                  Case {String(i + 1).padStart(2, "0")}
                </p>
                <p
                  className="text-xs font-bold text-slate-500"
                >
                  {INDUSTRY_LABELS[i % INDUSTRY_LABELS.length]}
                </p>
              </div>
            </div>

            {/* カード本体 */}
            <div className="flex flex-1 flex-col px-5 py-4">
              <p
                className="text-sm font-black leading-snug text-slate-900"
              >
                {uc.label}
              </p>
              <p
                className="mt-3 flex-1 text-sm font-medium leading-7 text-slate-600"
              >
                {uc.body}
              </p>

              {/* 引用風フッター */}
              <div
                className="mt-4 rounded-xl px-4 py-3"
                style={{ background: "#F8FAFC", borderLeft: "3px solid var(--nts-accent-teal)" }}
              >
                <p
                  className="text-xs font-bold italic leading-relaxed text-slate-500"
                >
                  「申請の流れを一緒に整理してもらえたので、安心して動けました」
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      </div>
    </section>
  );
}

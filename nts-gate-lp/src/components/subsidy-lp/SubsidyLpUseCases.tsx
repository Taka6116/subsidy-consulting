"use client";

import { useEffect, useRef, useState } from "react";
import type { SubsidyLpData } from "@/lib/subsidy-lp/buildSubsidyLpData";

type Props = { data: SubsidyLpData };

const INDUSTRY_ICONS = ["🏭", "🏪", "💼"];
const INDUSTRY_LABELS = ["製造業・50名規模", "小売・飲食業", "サービス業・IT"];

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
    <section
      className="rounded-[28px] px-6 py-8 sm:px-10 sm:py-10"
      style={{
        background: "var(--nts-bg-base)",
        boxShadow: "var(--nts-shadow-lg)",
      }}
    >
      {/* ヘッダー */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p
            className="text-xs font-extrabold uppercase tracking-[0.26em]"
            style={{ color: "var(--nts-accent-cyan)" }}
          >
            Use Cases
          </p>
          <h2
            className="mt-2 text-2xl font-black tracking-[-0.02em] sm:text-3xl"
            style={{ color: "var(--nts-text-primary-dark)" }}
          >
            活用イメージ
          </h2>
        </div>
        <p
          className="max-w-xs rounded-2xl px-3.5 py-2.5 text-xs font-bold leading-6"
          style={{
            background: "rgba(245,158,11,0.15)",
            color: "#FCD34D",
            border: "1px solid rgba(245,158,11,0.3)",
          }}
        >
          ※ 以下は想定事例です。実際の採択事例ではありません。
        </p>
      </div>

      {/* ペルソナカード群 */}
      <div ref={ref} className="mt-7 grid gap-5 lg:grid-cols-3">
        {data.useCases.map((uc, i) => (
          <div
            key={i}
            className="relative flex flex-col overflow-hidden rounded-2xl transition"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "var(--nts-shadow-offset)",
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
              style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
            >
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl"
                style={{ background: "rgba(14,165,164,0.15)" }}
              >
                {INDUSTRY_ICONS[i % INDUSTRY_ICONS.length]}
              </span>
              <div>
                <p
                  className="text-[10px] font-extrabold uppercase tracking-wider"
                  style={{ color: "var(--nts-accent-cyan)" }}
                >
                  Case {String(i + 1).padStart(2, "0")}
                </p>
                <p
                  className="text-xs font-bold"
                  style={{ color: "var(--nts-text-tertiary-dark)" }}
                >
                  {INDUSTRY_LABELS[i % INDUSTRY_LABELS.length]}
                </p>
              </div>
            </div>

            {/* カード本体 */}
            <div className="flex flex-1 flex-col px-5 py-4">
              <p
                className="text-sm font-black leading-snug"
                style={{ color: "var(--nts-text-primary-dark)" }}
              >
                {uc.label}
              </p>
              <p
                className="mt-3 flex-1 text-sm font-medium leading-7"
                style={{ color: "var(--nts-text-secondary-dark)" }}
              >
                {uc.body}
              </p>

              {/* 引用風フッター */}
              <div
                className="mt-4 rounded-xl px-4 py-3"
                style={{ background: "rgba(255,255,255,0.04)", borderLeft: "3px solid var(--nts-accent-teal)" }}
              >
                <p
                  className="text-xs font-bold italic leading-relaxed"
                  style={{ color: "var(--nts-text-tertiary-dark)" }}
                >
                  「申請の流れを一緒に整理してもらえたので、安心して動けました」
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

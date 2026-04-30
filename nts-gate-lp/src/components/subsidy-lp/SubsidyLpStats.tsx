"use client";

import { useEffect, useRef, useState } from "react";
import type { SubsidyLpData } from "@/lib/subsidy-lp/buildSubsidyLpData";
import { formatYen } from "@/lib/format";

type Props = { data: SubsidyLpData };

/* ─── スクロール入場フック ─────────────────────── */
function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

/* ─── 数値カウントアップ ────────────────────── */
function CountUp({
  value,
  durationMs,
  className,
}: {
  value: string;
  durationMs: number;
  className?: string;
}) {
  const [display, setDisplay] = useState<string>("");
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || durationMs === 0) {
      setDisplay(value);
      return;
    }

    const match = value.match(/[\d,.]+/);
    if (!match) {
      setDisplay(value);
      return;
    }
    const rawNum = Number(match[0].replace(/[,，]/g, ""));
    if (!Number.isFinite(rawNum) || rawNum <= 0) {
      setDisplay(value);
      return;
    }
    const prefix = value.slice(0, value.indexOf(match[0]));
    const suffix = value.slice(value.indexOf(match[0]) + match[0].length);
    const start = Date.now();

    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const cur = Math.round(eased * rawNum);
      setDisplay(`${prefix}${cur.toLocaleString("ja-JP")}${suffix}`);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value, durationMs]);

  return <span className={className}>{display || value}</span>;
}

/* ─── KPI カード ────────────────────────────── */
type KpiCardProps = {
  label: string;
  value: string;
  sub?: string;
  tone?: "default" | "urgent" | "warning";
  /** stagger 遅延 (ms) */
  delay?: number;
  inView: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function KpiCard({ label, value, sub, tone = "default", delay = 0, inView }: KpiCardProps) {
  const valueColor =
    tone === "urgent"
      ? "var(--nts-danger)"
      : tone === "warning"
      ? "var(--nts-warning)"
      : "var(--nts-text-primary-light)";

  return (
    <div
      className="relative overflow-hidden rounded-[16px] border border-slate-200 bg-white p-6 shadow-sm"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(8px)",
        transition: `opacity var(--nts-dur-slow) var(--nts-ease-out) ${delay}ms, transform var(--nts-dur-slow) var(--nts-ease-out) ${delay}ms`,
      }}
    >
      <p
        className="text-xs font-extrabold uppercase tracking-[0.18em]"
        style={{ color: "var(--nts-text-tertiary-light)" }}
      >
        {label}
      </p>
      <p
        className="mt-3 break-words text-3xl font-black leading-tight sm:text-4xl"
        style={{ color: valueColor, fontFamily: "Inter, SF Pro Display, system-ui, sans-serif" }}
      >
        {inView ? (
          <CountUp value={value || "要確認"} durationMs={1400} />
        ) : (
          value || "要確認"
        )}
      </p>
      {sub && (
        <p
          className="mt-2 text-xs font-medium leading-relaxed"
          style={{ color: "var(--nts-text-tertiary-light)" }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

/* ─── セクション本体 ────────────────────────── */
export default function SubsidyLpStats({ data }: Props) {
  const { ref, inView } = useInView(0.15);

  // style:"hero" だと CountUp が小数(1.5)を整数(2)に丸めてしまうため、
  // FVと同じ style省略（"1.5億円"）に統一する
  const heroAmount = data.amountValue
    ? formatYen(data.amountValue)
    : data.amountLabel.replace(/^最大\s*/, "");
  const urgencyTone =
    data.remainingDays !== null && data.remainingDays <= 14
      ? "urgent"
      : data.remainingDays !== null && data.remainingDays <= 30
      ? "warning"
      : "default";

  return (
    <section
      id="lp-overview"
      aria-label="補助金概要"
      className="scroll-mt-24 bg-[var(--bg-section-alt)] py-16 md:py-24"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
      {/* ========== [LEGACY 2026-04-30] 旧statsカード - ロールバック時は下のコメントアウトを解除 ========== */}
      {/*
      <div className="mb-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
          Key Numbers
        </p>
        <h2
          className="text-2xl font-black tracking-[-0.02em] sm:text-3xl"
          style={{ color: "var(--text-primary)" }}
        >
          数字で見る制度規模
        </h2>
      </div>

      <div
        ref={ref}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <KpiCard
          label="補助上限額"
          value={data.amountLabel}
          sub="※枠・条件により異なる場合があります"
          delay={0}
          inView={inView}
        />
        <KpiCard
          label="補助率"
          value={data.rateLabel}
          sub="※類型・要件により異なる場合があります"
          delay={80}
          inView={inView}
        />
        <KpiCard
          label="公募期限"
          value={data.deadlineLabel}
          sub={
            data.remainingDays !== null && data.remainingDays >= 0
              ? `残り ${data.remainingDays} 日`
              : undefined
          }
          tone={urgencyTone}
          delay={160}
          inView={inView}
        />
        <KpiCard
          label="対象地域"
          value={data.targetArea}
          sub="※対象地域・業種は公募要領で確認が必要です"
          delay={240}
          inView={inView}
        />
      </div>
      */}

      {/* ========== [NEW 2026-04-30] 新stats - ヒーロー数字レイアウト ========== */}
      <div ref={ref} className="text-center">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
          Key Numbers
        </p>
        <h2
          className="text-2xl font-black tracking-[-0.02em] sm:text-3xl"
          style={{ color: "var(--text-primary)" }}
        >
          数字で見る制度規模
        </h2>
        <p className="mt-10 text-sm font-extrabold uppercase tracking-[0.24em] text-slate-500">
          最大
        </p>
        <p
          className="mt-2 font-heading text-[clamp(72px,14vw,160px)] font-black leading-none tracking-[-0.08em]"
          style={{ color: urgencyTone === "urgent" ? "var(--nts-danger)" : "var(--nts-text-primary-light)" }}
        >
          {inView ? (
            <CountUp value={heroAmount || "応相談"} durationMs={1400} />
          ) : (
            heroAmount || "応相談"
          )}
        </p>

        <div className="mx-auto my-8 h-px w-24 bg-slate-300" />

        <dl className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm md:text-base">
          <div className="flex items-baseline gap-2">
            <dt className="text-slate-500">補助率</dt>
            <dd className="font-extrabold text-slate-900">{data.rateLabel || "要確認"}</dd>
          </div>
          <span className="hidden text-slate-300 sm:inline">|</span>
          <div className="flex items-baseline gap-2">
            <dt className="text-slate-500">締切</dt>
            <dd className="font-extrabold text-slate-900">{data.deadlineLabel || "要確認"}</dd>
          </div>
          <span className="hidden text-slate-300 sm:inline">|</span>
          <div className="flex items-baseline gap-2">
            <dt className="text-slate-500">対象地域</dt>
            <dd className="font-extrabold text-slate-900">{data.targetArea || "全国"}</dd>
          </div>
        </dl>
      </div>

      {/* 詳細テーブル */}
      <div
        className="mt-5 overflow-hidden rounded-[16px] border bg-white"
        style={{
          borderColor: "var(--nts-border-light)",
          boxShadow: "var(--nts-shadow-sm)",
        }}
      >
        <table className="w-full text-sm">
          <tbody className="divide-y" style={{ borderColor: "var(--nts-border-light)" }}>
            {[
              ["公募開始", data.acceptanceStart],
              ["所管省庁・機関", data.institutionName],
              ["更新日", data.updatedAtLabel],
            ].map(([k, v]) => (
              <tr key={k}>
                <th
                  className="w-36 px-4 py-3 text-left text-xs font-extrabold sm:w-44"
                  style={{
                    background: "var(--nts-bg-light-soft)",
                    color: "var(--nts-text-tertiary-light)",
                  }}
                >
                  {k}
                </th>
                <td
                  className="px-4 py-3 font-bold"
                  style={{ color: "var(--nts-text-primary-light)" }}
                >
                  {v || "要確認"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>
    </section>
  );
}

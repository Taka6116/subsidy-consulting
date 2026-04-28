"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { SubsidyLpData } from "@/lib/subsidy-lp/buildSubsidyLpData";
import { subsidyLpAsset } from "@/lib/subsidy-lp/assets";

type Props = { data: SubsidyLpData };

/* ─── 残日数バッジ ─────────────────────────────── */
function UrgencyBadge({ days }: { days: number | null }) {
  if (days === null) {
    return (
      <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white ring-1 ring-white/20">
        公募期限は要確認
      </span>
    );
  }
  if (days < 0)
    return (
      <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/70 ring-1 ring-white/20">
        締切済み
      </span>
    );
  const colorClass =
    days <= 14
      ? "bg-[var(--nts-danger)] text-white ring-[var(--nts-danger)]/40"
      : days <= 30
      ? "bg-[var(--nts-accent-orange)] text-[#0F172A] ring-[var(--nts-accent-orange)]/60"
      : "bg-emerald-400 text-[#0c1b2e] ring-emerald-200/50";
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-extrabold shadow-sm ring-1 ${colorClass}`}
    >
      締切まで残り {days} 日
    </span>
  );
}

/* ─── 補助上限額カウントアップ ────────────────── */
function useCountUp(target: string, durationMs: number) {
  const [display, setDisplay] = useState(target);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    // prefers-reduced-motion 対応: duration が 0 なら即値表示
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || durationMs === 0) {
      setDisplay(target);
      hasRun.current = true;
      return;
    }
    // 末尾の数値を取り出してカウントアップ
    const match = target.match(/[\d,]+/);
    if (!match) return;
    const raw = Number(match[0].replace(/,/g, ""));
    if (!Number.isFinite(raw) || raw <= 0) return;
    const prefix = target.slice(0, target.indexOf(match[0]));
    const suffix = target.slice(target.indexOf(match[0]) + match[0].length);
    const start = Date.now();
    hasRun.current = true;
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / durationMs, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * raw);
      setDisplay(`${prefix}${current.toLocaleString("ja-JP")}${suffix}`);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, durationMs]);

  return display;
}

/* ─── Hero KPI 右カード ──────────────────────── */
function HeroConsultCard({ data }: { data: SubsidyLpData }) {
  const heroImage = subsidyLpAsset("hero-consulting.png");
  const countedAmount = useCountUp(data.amountLabel, 1400);

  return (
    <div
      className="relative overflow-hidden rounded-[24px] bg-white text-[#0F172A]"
      style={{ boxShadow: "var(--nts-shadow-offset), var(--nts-shadow-md)" }}
    >
      {/* 装飾サークル */}
      <div
        className="pointer-events-none absolute right-0 top-0 h-28 w-28 rounded-bl-[72px]"
        style={{ background: "rgba(14,165,164,0.12)" }}
        aria-hidden
      />
      {/* イメージ */}
      <div className="relative -mx-0 overflow-hidden rounded-t-[24px] bg-[#eef7fd] px-3 pt-4">
        <img
          src={heroImage}
          alt=""
          aria-hidden="true"
          className="mx-auto h-auto w-full max-w-[430px] object-contain drop-shadow-[0_18px_30px_rgba(23,32,51,0.16)]"
        />
      </div>

      <div className="px-5 pb-5 pt-4">
        <p
          className="text-xs font-extrabold uppercase tracking-[0.22em]"
          style={{ color: "var(--nts-accent-teal)" }}
        >
          Free Consultation
        </p>
        <h2 className="mt-2 text-xl font-extrabold leading-tight text-[var(--nts-text-primary-light)]">
          自社で使えるか、まずは無料で確認できます。
        </h2>

        <dl className="mt-4 space-y-2 text-sm">
          {[
            { label: "補助上限", value: countedAmount },
            { label: "補助率", value: data.rateLabel },
            { label: "公募期限", value: data.deadlineLabel },
            { label: "対象地域", value: data.targetArea },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="flex items-start justify-between gap-4 rounded-[10px] px-3 py-2.5"
              style={{ background: "var(--nts-bg-light-soft)" }}
            >
              <dt
                className="shrink-0 text-xs font-bold"
                style={{ color: "var(--nts-text-tertiary-light)" }}
              >
                {label}
              </dt>
              <dd className="text-right font-extrabold text-[var(--nts-text-primary-light)]">
                {value || "要確認"}
              </dd>
            </div>
          ))}
        </dl>

        <Link
          href="/consult"
          className="mt-5 inline-flex w-full items-center justify-center rounded-full px-5 py-3.5 text-sm font-extrabold text-white transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--nts-accent-teal)]"
          style={{
            background: "var(--nts-bg-elevated)",
            transitionDuration: "var(--nts-dur-fast)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#1e3a5c")}
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "var(--nts-bg-elevated)")
          }
        >
          無料相談を予約する
        </Link>
      </div>
    </div>
  );
}

/* ─── メイン Hero ────────────────────────────── */
export default function SubsidyLpHero({ data }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <section
      className="relative isolate overflow-hidden text-white"
      style={{ background: "var(--nts-bg-base)" }}
    >
      {/* グラデーション照射（左上 → 右下 ごく薄い） */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(circle at 78% 18%, rgba(30,155,219,0.34), transparent 34%), linear-gradient(135deg, #071525 0%, #0e2c47 54%, #133d59 100%), linear-gradient(135deg, rgba(255,255,255,0.02) 0%, transparent 60%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-20 top-0 -z-10 h-full w-[42%] skew-x-[-13deg]"
        style={{ background: "rgba(30,155,219,0.20)" }}
      />
      {/* 下フェード */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-20"
        style={{
          background: "linear-gradient(to top, #eef4f9, transparent)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-5 pb-20 pt-28 sm:px-6 sm:pb-24 sm:pt-32 lg:grid lg:grid-cols-[minmax(0,1fr)_470px] lg:items-center lg:gap-12">
        {/* 左カラム */}
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="rounded-full border px-3 py-1 text-[11px] font-bold tracking-[0.18em] backdrop-blur"
              style={{
                borderColor: "var(--nts-border-dark)",
                background: "var(--nts-bg-card)",
                color: "var(--nts-text-secondary-dark)",
              }}
            >
              SUBSIDY ACTION GUIDE
            </span>
            {mounted && <UrgencyBadge days={data.remainingDays} />}
          </div>

          <p
            className="mt-6 text-sm font-bold"
            style={{ color: "var(--nts-accent-cyan)" }}
          >
            {data.institutionName}
          </p>
          <h1
            className="mt-3 max-w-3xl font-heading text-[clamp(34px,5vw,60px)] font-extrabold leading-[1.08] tracking-[-0.03em]"
            style={{ color: "var(--nts-text-primary-dark)" }}
          >
            {data.heroCopy}
          </h1>
          <p
            className="mt-5 max-w-2xl text-base font-medium leading-8 sm:text-lg"
            style={{ color: "var(--nts-text-primary-dark)" }}
          >
            {data.subCopy}
          </p>

          {/* TARGET SUBSIDY ボックス */}
          <div
            className="mt-7 rounded-[14px] border p-4 shadow-2xl shadow-black/10 backdrop-blur-md sm:max-w-2xl"
            style={{
              background: "var(--nts-bg-card)",
              borderColor: "var(--nts-border-dark)",
            }}
          >
            <p
              className="text-xs font-bold uppercase tracking-[0.2em]"
              style={{ color: "var(--nts-text-muted-dark)" }}
            >
              Target Subsidy
            </p>
            <p
              className="mt-2 text-lg font-extrabold leading-snug sm:text-xl"
              style={{ color: "var(--nts-text-primary-dark)" }}
            >
              {data.name}
            </p>
          </div>

          {/* CTA群 */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/consult"
              className="inline-flex min-h-12 items-center justify-center rounded-full px-8 py-3.5 text-sm font-extrabold text-[#172033] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--nts-accent-orange)]"
              style={{
                background: "var(--nts-accent-orange)",
                boxShadow: "0 10px 30px rgba(251,146,60,0.34)",
                transitionDuration: "var(--nts-dur-fast)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--nts-accent-orange-strong)";
                e.currentTarget.style.boxShadow = "var(--nts-glow-orange)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--nts-accent-orange)";
                e.currentTarget.style.boxShadow = "0 10px 30px rgba(251,146,60,0.34)";
              }}
            >
              無料相談する
              <span aria-hidden className="ml-2">→</span>
            </Link>
            <Link
              href="#lp-overview"
              className="inline-flex min-h-12 items-center justify-center rounded-full border px-7 py-3.5 text-sm font-bold backdrop-blur transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              style={{
                borderColor: "rgba(255,255,255,0.35)",
                background: "var(--nts-bg-card)",
                color: "var(--nts-text-primary-dark)",
                transitionDuration: "var(--nts-dur-fast)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--nts-bg-card-hover)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "var(--nts-bg-card)")
              }
            >
              制度概要を見る
            </Link>
          </div>

          {/* 信頼チップ */}
          <div
            className="mt-5 flex flex-wrap gap-2 text-xs font-semibold"
            style={{ color: "var(--nts-text-tertiary-dark)" }}
          >
            {["相談無料", "公募要領で最終確認", "申請後も伴走支援"].map((t) => (
              <span
                key={t}
                className="rounded-full px-3 py-1 ring-1 ring-white/10"
                style={{ background: "var(--nts-bg-card)" }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* 右カラム — 浮遊カード */}
        <div className="mt-10 lg:mt-0">
          <HeroConsultCard data={data} />
        </div>
      </div>
    </section>
  );
}

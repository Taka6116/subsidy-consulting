"use client";

import Link from "next/link";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";

// ============================================================
// 採択事例データ（実績12件）
// ============================================================
const CASES = [
  {
    id: "case-1",
    industry: "宿泊業",
    schemeName: "新事業進出補助金",
    investment: "施設の建設、改装工事",
    amount: "4,000万円",
    result: "売上22%増",
  },
  {
    id: "case-2",
    industry: "飲食業",
    schemeName: "事業再構築補助金",
    investment: "店舗改装工事、厨房設備の購入",
    amount: "4,000万円",
    result: "売上33%増",
  },
  {
    id: "case-3",
    industry: "金属製品製造業",
    schemeName: "事業再構築補助金",
    investment: "溶接ロボットの導入",
    amount: "4,000万円",
    result: "売上43%増",
  },
  {
    id: "case-4",
    industry: "建設機械製造業",
    schemeName: "事業再構築補助金",
    investment: "油圧ショベル、トラックスケールなど",
    amount: "4,000万円",
    result: "売上116%増",
  },
  {
    id: "case-5",
    industry: "建設業",
    schemeName: "省力化投資補助金",
    investment: "油圧ショベル3台",
    amount: "3,000万円",
    result: "掘削作業時間を1/5に短縮",
  },
  {
    id: "case-6",
    industry: "建設業",
    schemeName: "事業再構築補助金",
    investment: "研修センター内装工事、専門研修受講",
    amount: "2,701万円",
    result: "売上27%増",
  },
  {
    id: "case-7",
    industry: "プラスチック製品製造業",
    schemeName: "事業再構築補助金",
    investment: "PP押し出し機、測定器、粉砕機の導入",
    amount: "約2,464万円",
    result: "売上19%増",
  },
  {
    id: "case-8",
    industry: "建設業",
    schemeName: "省力化投資補助金",
    investment: "油圧ショベル、自動測量機、後付けマシンガイダンス",
    amount: "2,000万円",
    result: "作業時間を47.6h→27.8h/日に削減",
  },
  {
    id: "case-9",
    industry: "損害保険代理業",
    schemeName: "事業再構築補助金",
    investment: "古民家改装工事、トレーラーハウス購入",
    amount: "2,000万円",
    result: "売上131%増",
  },
  {
    id: "case-10",
    industry: "歯科診療所",
    schemeName: "事業再構築補助金",
    investment: "店舗改装工事、治療台の購入",
    amount: "2,000万円",
    result: "売上170%増",
  },
  {
    id: "case-11",
    industry: "飲食業 + 産廃業",
    schemeName: "事業再構築補助金",
    investment: "古民家の改装工事",
    amount: "2,000万円",
    result: "売上28%増",
  },
  {
    id: "case-12",
    industry: "経営コンサルタント業",
    schemeName: "事業再構築補助金",
    investment: "教育動画・マニュアル管理プラットフォーム構築",
    amount: "1,966万円",
    result: "売上33%増",
  },
] as const;

const STATS = [
  { label: "過去支援事例", value: "60件" },
  { label: "最大補助金額", value: "4,000万円" },
  { label: "平均補助金額", value: "約1,241万円" },
  { label: "中央値", value: "約816万円" },
] as const;

export default function SubsidyCaseStudySection() {
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: -1 | 1) => {
    trackRef.current?.scrollBy({ left: dir * 340, behavior: "smooth" });
  };

  return (
    <section
      aria-labelledby="case-study-heading"
      className="w-full py-20 md:py-24"
      style={{ background: "#F4F8FC" }}
    >
      {/* ── ヘッダー ─────────────────────────────────────── */}
      <div className="mx-auto max-w-[1160px] px-5 sm:px-8">
        <div className="text-center">
          <h2
            id="case-study-heading"
            className="font-heading text-[1.7rem] font-bold leading-snug md:text-[2.2rem]"
            style={{ color: "#082A5E" }}
          >
            実際の採択事例で見る、補助金の使い方
          </h2>
          <p
            className="mx-auto mt-4 max-w-[560px] text-sm leading-relaxed md:text-base"
            style={{ color: "#4A5E78" }}
          >
            過去支援事例をもとに、業種・投資内容・補助金額・成果を一覧化。
            <br className="hidden sm:block" />
            自社に近い活用イメージを確認できます。
          </p>
        </div>

        {/* 実績サマリー */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="rounded-xl bg-white px-4 py-4 text-center"
              style={{ border: "1px solid #DCE7F3", boxShadow: "0 2px 8px rgba(8,42,94,0.05)" }}
            >
              <p
                className="font-heading text-[1.35rem] font-black leading-none sm:text-[1.55rem]"
                style={{ color: "#0068B7" }}
              >
                {s.value}
              </p>
              <p className="mt-1.5 text-[11px] font-medium" style={{ color: "#6B7A90" }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── カルーセルラッパー ────────────────────────────── */}
      <div className="relative mt-10">
        {/* 左端フェード */}
        <div
          className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 hidden w-16 sm:block"
          style={{ background: "linear-gradient(to right, #F4F8FC, transparent)" }}
          aria-hidden
        />
        {/* 右端フェード */}
        <div
          className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 hidden w-16 sm:block"
          style={{ background: "linear-gradient(to left, #F4F8FC, transparent)" }}
          aria-hidden
        />

        {/* スクロールトラック */}
        <div
          ref={trackRef}
          className="flex gap-5 overflow-x-auto"
          style={{
            scrollSnapType: "x mandatory",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
            paddingLeft: "clamp(1.25rem, calc(50vw - 37rem), 5rem)",
            paddingRight: "clamp(1.25rem, calc(50vw - 34rem), 5rem)",
            paddingBottom: "4px",
          }}
          role="region"
          aria-label="補助金採択事例カルーセル（横スワイプで操作）"
        >
          {CASES.map((c) => (
            <CaseCard key={c.id} c={c} />
          ))}
        </div>
      </div>

      {/* ── 矢印ナビ（控えめ） ───────────────────────────── */}
      <div className="mx-auto mt-6 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => scrollBy(-1)}
          aria-label="前のカードへ"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white transition hover:bg-[#EEF6FF]"
          style={{ border: "1px solid #DCE7F3", boxShadow: "0 1px 4px rgba(8,42,94,0.08)" }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M9 2L4 7l5 5" stroke="#0068B7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => scrollBy(1)}
          aria-label="次のカードへ"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white transition hover:bg-[#EEF6FF]"
          style={{ border: "1px solid #DCE7F3", boxShadow: "0 1px 4px rgba(8,42,94,0.08)" }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M5 2l5 5-5 5" stroke="#0068B7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* ── CTA ─────────────────────────────────────────── */}
      <div className="mx-auto mt-10 max-w-[1160px] px-5 sm:px-8">
        <div
          className="flex flex-col items-center gap-4 rounded-2xl bg-white px-6 py-7 text-center sm:flex-row sm:justify-between sm:text-left lg:px-10 lg:py-8"
          style={{ border: "1px solid #DCE7F3", boxShadow: "0 4px 18px rgba(8,42,94,0.07)" }}
        >
          <div>
            <p
              className="font-heading text-base font-bold leading-snug md:text-lg"
              style={{ color: "#082A5E" }}
            >
              自社に近い活用例を相談する
            </p>
            <p className="mt-1.5 text-sm leading-relaxed" style={{ color: "#4A5E78" }}>
              近い事例をもとに、対象になりうる制度を一緒に確認します。
            </p>
          </div>
          <div className="flex flex-col items-center gap-2 sm:items-end">
            <Link
              href="/consult"
              className="inline-flex items-center gap-2 rounded-xl px-7 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
              style={{ background: "#0068B7", boxShadow: "0 4px 14px rgba(0,104,183,0.22)", whiteSpace: "nowrap" }}
            >
              自社に近い活用例を相談する
              <ArrowRight size={15} aria-hidden />
            </Link>
            <Link
              href="/subsidies/lp"
              className="text-[13px] font-semibold transition hover:underline"
              style={{ color: "#0068B7" }}
            >
              補助金の対象を確認する →
            </Link>
          </div>
        </div>

        {/* 免責注意書き */}
        <p className="mt-4 text-center text-[11px] leading-relaxed" style={{ color: "#6B7A90" }}>
          ※過去支援事例であり、採択・補助金額を保証するものではありません。制度・対象経費・審査結果により異なります。
        </p>
      </div>
    </section>
  );
}

// ============================================================
// CaseCard
// ============================================================
type CaseData = (typeof CASES)[number];

function CaseCard({ c }: { c: CaseData }) {
  return (
    <article
      className="flex shrink-0 flex-col overflow-hidden rounded-2xl bg-white"
      style={{
        width: "clamp(280px, 82vw, 320px)",
        scrollSnapAlign: "start",
        border: "1px solid #DCE7F3",
        boxShadow: "0 3px 14px rgba(8,42,94,0.07)",
      }}
      aria-label={`${c.industry} — ${c.schemeName}`}
    >
      {/* カード本文 */}
      <div className="flex flex-1 flex-col p-5">
        {/* 業種タグ + 過去支援事例ラベル */}
        <div className="mb-3 flex items-center justify-between gap-2">
          <span
            className="inline-block rounded px-2 py-0.5 text-[11px] font-bold"
            style={{ background: "#EEF6FF", color: "#0068B7" }}
          >
            {c.industry}
          </span>
          <span className="text-[10px]" style={{ color: "#6B7A90" }}>
            過去支援事例
          </span>
        </div>

        {/* 補助金名 */}
        <p
          className="font-heading text-[13px] font-bold leading-snug"
          style={{ color: "#082A5E" }}
        >
          {c.schemeName}
        </p>

        {/* 補助金額 */}
        <div
          className="mt-3 rounded-xl px-4 py-3"
          style={{ background: "#EEF6FF", border: "1px solid #C8DFF5" }}
        >
          <p className="text-[10px] font-semibold" style={{ color: "#6B7A90" }}>補助金額</p>
          <p
            className="font-heading mt-0.5 text-[1.45rem] font-black leading-none"
            style={{ color: "#0068B7" }}
          >
            {c.amount}
          </p>
        </div>

        {/* 課題 → 投資 → 成果フロー */}
        <div className="mt-4 flex flex-1 flex-col gap-0">
          <FlowRow label="投資内容" value={c.investment} />
          <FlowArrow />
          <FlowRow label="成果" value={c.result} accent />
        </div>
      </div>
    </article>
  );
}

function FlowRow({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-start gap-2.5 py-2" style={{ minHeight: "3.2rem" }}>
      <span
        className="mt-[2px] shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold"
        style={{
          background: accent ? "#EEF6FF" : "rgba(8,42,94,0.06)",
          color: accent ? "#0068B7" : "#082A5E",
          border: accent ? "1px solid #C8DFF5" : "none",
        }}
      >
        {label}
      </span>
      <span
        className="text-[13px] leading-relaxed"
        style={{ color: accent ? "#0068B7" : "#3A5068", fontWeight: accent ? 700 : 400 }}
      >
        {value}
      </span>
    </div>
  );
}

function FlowArrow() {
  return (
    <div aria-hidden className="flex justify-center py-0.5">
      <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
        <path
          d="M6 0v8M2.5 5l3.5 3.5L9.5 5"
          stroke="#B5C5DA"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

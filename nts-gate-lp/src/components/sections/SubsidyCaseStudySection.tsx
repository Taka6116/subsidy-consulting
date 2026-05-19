"use client";

import Link from "next/link";
import { useRef, useEffect, useCallback, useState } from "react";
import { useReducedMotion } from "framer-motion";
import {
  ArrowRight, ChevronDown,
  Building2, Utensils, Factory, Wrench, HardHat, Boxes,
  ShieldCheck, Stethoscope, LineChart,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ============================================================
// 採択事例データ（桜庭さん提供の実データ 12件）
// ============================================================
const CASES: CaseData[] = [
  {
    id: "case-1", no: "01", industry: "宿泊業",
    icon: Building2, iconBg: "#DBEAFE", iconColor: "#1D6FE8",
    schemeName: "新事業進出補助金",
    business: "ホテルの経営",
    issue: "単一事業への経営依存",
    investment: "施設の建設、改装工事",
    investmentAmount: "8,120万円",
    subsidyRate: "1/2",
    subsidyAmount: "4,000万円",
    result: "売上22%増",
  },
  {
    id: "case-2", no: "02", industry: "飲食業",
    icon: Utensils, iconBg: "#D1FAE5", iconColor: "#059669",
    schemeName: "事業再構築補助金",
    business: "麻婆豆腐店の運営",
    issue: "他ジャンルの飲食店の開業",
    investment: "店舗改装工事、厨房設備の購入",
    investmentAmount: "6,000万円",
    subsidyRate: "2/3",
    subsidyAmount: "4,000万円",
    result: "売上33%増",
  },
  {
    id: "case-3", no: "03", industry: "金属製品製造業",
    icon: Factory, iconBg: "#E0E7FF", iconColor: "#4F46E5",
    schemeName: "事業再構築補助金",
    business: "各種洗浄機の部品製造",
    issue: "主要取引先への過度な依存",
    investment: "溶接ロボットの導入",
    investmentAmount: "7,000万円",
    subsidyRate: "2/3",
    subsidyAmount: "4,000万円",
    result: "売上43%増",
  },
  {
    id: "case-4", no: "04", industry: "建設機械製造業",
    icon: Wrench, iconBg: "#FEF3C7", iconColor: "#D97706",
    schemeName: "事業再構築補助金",
    business: "産廃の仕分け・ふるい機の製造販売",
    issue: "主要取引先への過度な依存",
    investment: "油圧ショベル、トラックスケールなど",
    investmentAmount: "6,000万円",
    subsidyRate: "2/3",
    subsidyAmount: "4,000万円",
    result: "売上116%増",
  },
  {
    id: "case-5", no: "05", industry: "建設業",
    icon: HardHat, iconBg: "#DBEAFE", iconColor: "#1D6FE8",
    schemeName: "省力化投資補助金",
    business: "土木工事業",
    issue: "人手不足",
    investment: "油圧ショベル3台",
    investmentAmount: "7,510万円",
    subsidyRate: "1/2",
    subsidyAmount: "3,000万円",
    result: "掘削作業時間を1/5に短縮",
  },
  {
    id: "case-6", no: "06", industry: "建設業",
    icon: HardHat, iconBg: "#EDE9FE", iconColor: "#7C3AED",
    schemeName: "事業再構築補助金",
    business: "養生・クリーニング業",
    issue: "外国人労働者の活用",
    investment: "研修センター内装工事、専門研修受講",
    investmentAmount: "約3,852万円",
    subsidyRate: "2/3",
    subsidyAmount: "2,701万円",
    result: "売上27%増",
  },
  {
    id: "case-7", no: "07", industry: "プラスチック製品製造業",
    icon: Boxes, iconBg: "#FCE7F3", iconColor: "#DB2777",
    schemeName: "事業再構築補助金",
    business: "不織布の再生ペレット製造",
    issue: "海外売上依存による貿易停止リスク",
    investment: "PP押し出し機、測定器、粉砕機の導入",
    investmentAmount: "約3,696万円",
    subsidyRate: "2/3",
    subsidyAmount: "約2,464万円",
    result: "売上19%増",
  },
  {
    id: "case-8", no: "08", industry: "建設業",
    icon: HardHat, iconBg: "#D1FAE5", iconColor: "#059669",
    schemeName: "省力化投資補助金",
    business: "宅地造成業",
    issue: "人手不足",
    investment: "油圧ショベル、自動測量機、後付けマシンガイダンス",
    investmentAmount: "約3,896万円",
    subsidyRate: "2/3",
    subsidyAmount: "2,000万円",
    result: "作業時間を47.6h→27.8h/日に削減",
  },
  {
    id: "case-9", no: "09", industry: "損害保険代理業",
    icon: ShieldCheck, iconBg: "#DBEAFE", iconColor: "#1D6FE8",
    schemeName: "事業再構築補助金",
    business: "保険代理店業務",
    issue: "単一事業への経営依存",
    investment: "古民家改装工事、トレーラーハウス購入",
    investmentAmount: "4,880万円",
    subsidyRate: "2/3",
    subsidyAmount: "2,000万円",
    result: "売上131%増",
  },
  {
    id: "case-10", no: "10", industry: "歯科診療所",
    icon: Stethoscope, iconBg: "#FEE2E2", iconColor: "#DC2626",
    schemeName: "事業再構築補助金",
    business: "歯科医院",
    issue: "新規事業への方向転換",
    investment: "店舗改装工事、治療台の購入",
    investmentAmount: "3,200万円",
    subsidyRate: "2/3",
    subsidyAmount: "2,000万円",
    result: "売上170%増",
  },
  {
    id: "case-11", no: "11", industry: "飲食業＋産廃業",
    icon: Utensils, iconBg: "#D1FAE5", iconColor: "#059669",
    schemeName: "事業再構築補助金",
    business: "居酒屋の運営＋空きビン回収・リサイクル",
    issue: "経営リスク分散",
    investment: "古民家の改装工事",
    investmentAmount: "2,950万円",
    subsidyRate: "2/3",
    subsidyAmount: "2,000万円",
    result: "売上28%増",
  },
  {
    id: "case-12", no: "12", industry: "経営コンサルタント業",
    icon: LineChart, iconBg: "#E0E7FF", iconColor: "#4F46E5",
    schemeName: "事業再構築補助金",
    business: "集客コンサル",
    issue: "単一事業への経営依存",
    investment: "教育動画・マニュアル管理プラットフォーム構築",
    investmentAmount: "2,949万円",
    subsidyRate: "2/3",
    subsidyAmount: "1,966万円",
    result: "売上33%増",
  },
];

type CaseData = {
  id: string;
  no: string;
  industry: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  schemeName: string;
  business: string;
  issue: string;
  investment: string;
  investmentAmount: string;
  subsidyRate: string;
  subsidyAmount: string;
  result: string;
};

const STATS = [
  { label: "過去支援事例", value: "60件", primary: true },
  { label: "最大補助金額", value: "4,000万円", primary: true },
  { label: "最高投資金額", value: "8,120万円", primary: false },
  { label: "平均補助金額", value: "約1,241万円", primary: false },
] as const;

const CARD_W = 320;
const CARD_GAP = 20;

export default function SubsidyCaseStudySection() {
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);
  const autoTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const userActed = useRef(false);
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  const [progress, setProgress] = useState(0);

  const stopAuto = useCallback(() => {
    userActed.current = true;
    if (autoTimer.current) {
      clearInterval(autoTimer.current);
      autoTimer.current = null;
    }
  }, []);

  const updateProgress = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setProgress(max > 0 ? el.scrollLeft / max : 0);
  }, []);

  useEffect(() => {
    if (reduce) return;
    const delay = setTimeout(() => {
      if (userActed.current) return;
      const el = trackRef.current;
      if (!el) return;
      autoTimer.current = setInterval(() => {
        if (userActed.current || !el) return;
        const nextSnap = Math.round(el.scrollLeft / (CARD_W + CARD_GAP) + 1) * (CARD_W + CARD_GAP);
        if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 4) { stopAuto(); return; }
        el.scrollTo({ left: nextSnap, behavior: "smooth" });
      }, 2800);
    }, 1800);
    return () => { clearTimeout(delay); if (autoTimer.current) clearInterval(autoTimer.current); };
  }, [reduce, stopAuto]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (!entry.isIntersecting) stopAuto(); },
      { threshold: 0 }
    );
    obs.observe(section);
    return () => obs.disconnect();
  }, [stopAuto]);

  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    const el = trackRef.current;
    if (!el) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();
      el.scrollLeft += e.deltaY;
      stopAuto();
    }
  }, [stopAuto]);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const el = trackRef.current;
    if (!el) return;
    isDragging.current = true;
    startX.current = e.clientX;
    scrollLeftStart.current = el.scrollLeft;
    el.setPointerCapture(e.pointerId);
    stopAuto();
  }, [stopAuto]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    const el = trackRef.current;
    if (!el) return;
    el.scrollLeft = scrollLeftStart.current - (e.clientX - startX.current);
  }, []);

  const handlePointerUp = useCallback(() => { isDragging.current = false; }, []);

  const scrollByCards = (dir: -1 | 1) => {
    const el = trackRef.current;
    if (!el) return;
    stopAuto();
    el.scrollBy({ left: dir * (CARD_W + CARD_GAP), behavior: "smooth" });
  };

  return (
    <section
      ref={sectionRef}
      aria-labelledby="case-study-heading"
      className="w-full py-20 md:py-24"
      style={{ background: "#F4F8FC" }}
    >
      {/* ── ヘッダー ── */}
      <div className="mx-auto max-w-[1160px] px-5 sm:px-8">
        <div className="text-center">
          <h2
            id="case-study-heading"
            className="font-heading text-[1.7rem] font-bold leading-snug md:text-[2.2rem]"
            style={{ color: "#082A5E" }}
          >
            実際の採択事例で見る、補助金活用の金額感
          </h2>
          <p className="mx-auto mt-4 max-w-[580px] text-sm leading-relaxed md:text-base" style={{ color: "#4A5E78" }}>
            業種・課題・投資内容・補助金額・成果まで、過去支援事例をもとに一覧化。
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
              style={{
                border: s.primary ? "1.5px solid #0068B7" : "1px solid #DCE7F3",
                boxShadow: s.primary ? "0 2px 12px rgba(0,104,183,0.10)" : "0 2px 8px rgba(8,42,94,0.05)",
              }}
            >
              <p
                className="font-heading text-[1.35rem] font-black leading-none sm:text-[1.55rem]"
                style={{ color: s.primary ? "#0068B7" : "#082A5E" }}
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

      {/* ── スワイプガイド ── */}
      <div className="mt-8 flex items-center justify-center gap-1.5">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9FB3C8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
        <p className="text-[12px]" style={{ color: "#9FB3C8" }}>横にスワイプして他の事例を見る</p>
      </div>

      {/* ── カルーセル ── */}
      <div className="relative mt-3">
        <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-10 sm:w-20" style={{ background: "linear-gradient(to right, #F4F8FC 30%, transparent)" }} aria-hidden />
        <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-10 sm:w-20" style={{ background: "linear-gradient(to left, #F4F8FC 30%, transparent)" }} aria-hidden />

        <div
          ref={trackRef}
          className="no-scrollbar carousel-track flex gap-5 overflow-x-auto"
          style={{
            paddingLeft: "clamp(1.25rem, calc(50vw - 36rem), 5rem)",
            paddingRight: "clamp(1.25rem, calc(50vw - 30rem), 5rem)",
            paddingTop: "8px",
            paddingBottom: "8px",
          }}
          onWheel={handleWheel}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onMouseEnter={stopAuto}
          onTouchStart={stopAuto}
          onFocus={stopAuto}
          onScroll={updateProgress}
          role="region"
          aria-label="補助金採択事例カルーセル（横スワイプで操作）"
        >
          {CASES.map((c) => <CaseCard key={c.id} c={c} />)}
        </div>
      </div>

      {/* ── progress + 矢印 ── */}
      <div className="mx-auto mt-4 flex max-w-[1160px] items-center gap-4 px-5 sm:px-8">
        <button type="button" onClick={() => scrollByCards(-1)} aria-label="前のカードへ" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white transition hover:bg-[#EEF6FF]" style={{ border: "1px solid #DCE7F3" }}>
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden><path d="M9 2L4 7l5 5" stroke="#0068B7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <div className="h-[3px] flex-1 overflow-hidden rounded-full" style={{ background: "#DCE7F3" }}>
          <div className="h-full rounded-full transition-all duration-300" style={{ width: `${Math.max(8, progress * 100)}%`, background: "#0068B7" }} />
        </div>
        <button type="button" onClick={() => scrollByCards(1)} aria-label="次のカードへ" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white transition hover:bg-[#EEF6FF]" style={{ border: "1px solid #DCE7F3" }}>
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden><path d="M5 2l5 5-5 5" stroke="#0068B7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>

      {/* ── CTA ── */}
      <div className="mx-auto mt-10 max-w-[1160px] px-5 sm:px-8">
        <div className="flex flex-col items-center gap-4 rounded-2xl bg-white px-6 py-7 text-center sm:flex-row sm:justify-between sm:text-left lg:px-10 lg:py-8" style={{ border: "1px solid #DCE7F3", boxShadow: "0 4px 18px rgba(8,42,94,0.07)" }}>
          <div>
            <p className="font-heading text-base font-bold leading-snug md:text-lg" style={{ color: "#082A5E" }}>自社に近い活用例を相談する</p>
            <p className="mt-1.5 text-sm leading-relaxed" style={{ color: "#4A5E78" }}>近い事例をもとに、対象になりうる制度を一緒に確認します。</p>
          </div>
          <div className="flex flex-col items-center gap-2 sm:items-end">
            <Link href="/consult" className="inline-flex items-center gap-2 rounded-xl px-7 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90" style={{ background: "#0068B7", boxShadow: "0 4px 14px rgba(0,104,183,0.22)", whiteSpace: "nowrap" }}>
              自社に近い活用例を相談する <ArrowRight size={15} aria-hidden />
            </Link>
            <Link href="/subsidies/lp" className="text-[13px] font-semibold transition hover:underline" style={{ color: "#0068B7" }}>補助金の対象を確認する →</Link>
          </div>
        </div>
        <p className="mt-4 text-center text-[11px] leading-relaxed" style={{ color: "#6B7A90" }}>
          ※過去支援事例であり、採択・補助金額を保証するものではありません。制度・対象経費・審査結果により異なります。
        </p>
      </div>
    </section>
  );
}

// ============================================================
// CaseCard — ミニ事例レポート風
// ============================================================
function CaseCard({ c }: { c: CaseData }) {
  const Icon = c.icon;
  const [open, setOpen] = useState(false);

  return (
    <article
      className="flex shrink-0 flex-col overflow-hidden rounded-2xl bg-white"
      style={{
        width: `${CARD_W}px`,
        scrollSnapAlign: "start",
        border: "1px solid #DCE7F3",
        boxShadow: "0 3px 14px rgba(8,42,94,0.07)",
      }}
      aria-label={`No.${c.no} ${c.industry} — ${c.schemeName}`}
    >
      {/* ── ビジュアルヘッダー ── */}
      <div
        className="relative flex h-[96px] w-full shrink-0 items-center justify-center overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${c.iconBg} 0%, #F0F7FF 100%)` }}
      >
        <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-20" style={{ background: c.iconColor }} aria-hidden />
        <div className="pointer-events-none absolute -bottom-3 -left-3 h-14 w-14 rounded-full opacity-10" style={{ background: c.iconColor }} aria-hidden />

        <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm" style={{ border: `1.5px solid ${c.iconBg}` }}>
          <Icon size={24} color={c.iconColor} strokeWidth={1.8} aria-hidden />
        </div>

        {/* No. */}
        <span className="absolute left-3 top-2.5 rounded px-2 py-0.5 text-[10px] font-bold" style={{ background: "rgba(255,255,255,0.88)", color: "#082A5E" }}>
          No.{c.no}
        </span>
        {/* 業種タグ */}
        <span className="absolute left-3 bottom-2.5 rounded px-2 py-0.5 text-[10px] font-bold" style={{ background: "rgba(255,255,255,0.88)", color: c.iconColor }}>
          {c.industry}
        </span>
        {/* 補助金額ミニバッジ */}
        <div className="absolute bottom-2.5 right-3 rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ background: "rgba(255,255,255,0.92)", color: "#0068B7", border: "1px solid #C8DFF5" }}>
          {c.subsidyAmount}
        </div>
      </div>

      {/* ── カード本文 ── */}
      <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
        {/* 補助金名 + 事業内容 */}
        <p className="text-[10px] font-medium" style={{ color: "#9FB3C8" }}>過去支援事例</p>
        <p className="mt-1 font-heading text-[13px] font-bold leading-snug" style={{ color: "#082A5E" }}>{c.schemeName}</p>
        <p className="mt-1 text-[11px] leading-relaxed" style={{ color: "#6B7A90" }}>{c.business}</p>

        {/* ── 金額比較ブロック ── */}
        <div className="mt-3 overflow-hidden rounded-xl" style={{ border: "1px solid #C8DFF5" }}>
          {/* 総投資額 */}
          <div className="flex items-center justify-between px-4 py-2.5" style={{ background: "#F8FBFF" }}>
            <span className="text-[10px] font-semibold" style={{ color: "#6B7A90" }}>総投資額</span>
            <span className="font-heading text-[15px] font-bold" style={{ color: "#082A5E" }}>{c.investmentAmount}</span>
          </div>
          <div style={{ borderTop: "1px solid #E4EDF7" }} />
          {/* 補助金額 */}
          <div className="flex items-center justify-between px-4 py-3" style={{ background: "#EEF6FF" }}>
            <span className="text-[10px] font-bold" style={{ color: "#0068B7" }}>補助金額</span>
            <span className="font-heading text-[1.3rem] font-black leading-none" style={{ color: "#0068B7" }}>{c.subsidyAmount}</span>
          </div>
          <div style={{ borderTop: "1px solid #C8DFF5" }} />
          {/* 補助率 */}
          <div className="flex items-center justify-between px-4 py-2" style={{ background: "#F8FBFF" }}>
            <span className="text-[10px] font-semibold" style={{ color: "#6B7A90" }}>補助率</span>
            <span className="rounded-full px-2.5 py-0.5 text-[11px] font-bold" style={{ background: "#0068B7", color: "#fff" }}>{c.subsidyRate}</span>
          </div>
        </div>

        {/* ── 課題 → 投資 → 効果 ミニテーブル ── */}
        <div className="mt-3 flex flex-col gap-0 overflow-hidden rounded-xl" style={{ border: "1px solid #E4EDF7" }}>
          <MiniRow label="課題" value={c.issue} bg="#F8FAFC" />
          <div style={{ borderTop: "1px solid #E4EDF7" }} />
          <MiniRow label="投資" value={c.investment} bg="#FFFFFF" />
          <div style={{ borderTop: "1px solid #E4EDF7" }} />
          <MiniRow label="効果" value={c.result} bg="#EEF6FF" accent />
        </div>

        {/* ── 詳細を見る（アコーディオン） ── */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg py-2 text-[12px] font-semibold transition hover:bg-[#F4F8FC]"
          style={{ color: "#0068B7" }}
          aria-expanded={open}
        >
          {open ? "閉じる" : "詳細を見る"}
          <ChevronDown
            size={14}
            className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            aria-hidden
          />
        </button>

        {open && (
          <div className="mt-1 space-y-2 border-t border-[#E4EDF7] pt-3 text-[11px]" style={{ color: "#4A5E78" }}>
            <DetailRow label="事業内容" value={c.business} />
            <DetailRow label="課題" value={c.issue} />
            <DetailRow label="投資内容" value={c.investment} />
            <DetailRow label="投資金額" value={c.investmentAmount} />
            <DetailRow label="補助率" value={c.subsidyRate} />
            <DetailRow label="補助金額" value={c.subsidyAmount} />
            <DetailRow label="効果" value={c.result} accent />
          </div>
        )}
      </div>
    </article>
  );
}

// ── ミニテーブル行 ────────────────────────────────────────
function MiniRow({ label, value, bg, accent }: { label: string; value: string; bg: string; accent?: boolean }) {
  return (
    <div className="flex items-start gap-2 px-3.5 py-2.5" style={{ background: bg }}>
      <span
        className="mt-[1px] shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold"
        style={accent
          ? { background: "#0068B7", color: "#fff" }
          : { background: "rgba(8,42,94,0.06)", color: "#082A5E" }}
      >
        {label}
      </span>
      <p
        className="line-clamp-2 text-[12px] leading-relaxed"
        style={accent ? { color: "#0068B7", fontWeight: 700 } : { color: "#3A5068" }}
      >
        {value}
      </p>
    </div>
  );
}

// ── 詳細展開行 ────────────────────────────────────────────
function DetailRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-[1px] shrink-0 text-[10px] font-bold" style={{ color: "#6B7A90", width: "56px" }}>
        {label}
      </span>
      <span style={accent ? { color: "#0068B7", fontWeight: 700 } : undefined}>
        {value}
      </span>
    </div>
  );
}

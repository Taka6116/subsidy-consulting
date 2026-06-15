"use client";

import ScrollTextReveal from "@/components/shared/ScrollTextReveal";
import { useRef, useEffect, useCallback, useState } from "react";
import { useReducedMotion } from "framer-motion";

// ============================================================
// 採択事例データ（桜庭さん提供の実データ 12件）
// ============================================================
type CaseData = {
  id: string;
  industry: string;
  photo: string;
  schemeName: string;
  business: string;
  issue: string;
  investment: string;
  investmentAmount: string;
  subsidyRate: string;
  subsidyAmount: string;
  result: string;
};

const P = "/case-images"; // public/case-images/ — Vercel静的配信

const CASES: CaseData[] = [
  {
    id: "case-1", industry: "宿泊業",
    photo: `${P}/business-meeting-conference-concept.webp`,
    schemeName: "新事業進出補助金", business: "ホテルの経営",
    issue: "単一事業への経営依存", investment: "施設の建設、改装工事",
    investmentAmount: "8,120万円", subsidyRate: "1/2", subsidyAmount: "4,000万円", result: "売上22%増",
  },
  {
    id: "case-2", industry: "飲食業",
    photo: `${P}/business-share-planing-strategy-brainstroming-concept.webp`,
    schemeName: "事業再構築補助金", business: "麻婆豆腐店の運営",
    issue: "他ジャンルの飲食店の開業", investment: "店舗改装工事、厨房設備の購入",
    investmentAmount: "6,000万円", subsidyRate: "2/3", subsidyAmount: "4,000万円", result: "売上33%増",
  },
  {
    id: "case-3", industry: "金属製品製造業",
    photo: `${P}/factory-workshop-interior-machines-glass-production-background.webp`,
    schemeName: "事業再構築補助金", business: "各種洗浄機の部品製造",
    issue: "主要取引先への過度な依存", investment: "溶接ロボットの導入",
    investmentAmount: "7,000万円", subsidyRate: "2/3", subsidyAmount: "4,000万円", result: "売上43%増",
  },
  {
    id: "case-4", industry: "建設機械製造業",
    photo: `${P}/construction-worker-engineer-working-together-construction-site.webp`,
    schemeName: "事業再構築補助金", business: "産廃の仕分け・ふるい機の製造販売",
    issue: "主要取引先への過度な依存", investment: "油圧ショベル、トラックスケールなど",
    investmentAmount: "6,000万円", subsidyRate: "2/3", subsidyAmount: "4,000万円", result: "売上116%増",
  },
  {
    id: "case-5", industry: "建設業",
    photo: `${P}/working-construction-site.webp`,
    schemeName: "省力化投資補助金", business: "土木工事業",
    issue: "人手不足", investment: "油圧ショベル3台",
    investmentAmount: "7,510万円", subsidyRate: "1/2", subsidyAmount: "3,000万円", result: "掘削作業時間を1/5に短縮",
  },
  {
    id: "case-6", industry: "建設業",
    photo: `${P}/construction-site-working-japan.webp`,
    schemeName: "事業再構築補助金", business: "養生・クリーニング業",
    issue: "外国人労働者の活用", investment: "研修センター内装工事、専門研修受講",
    investmentAmount: "約3,852万円", subsidyRate: "2/3", subsidyAmount: "2,701万円", result: "売上27%増",
  },
  {
    id: "case-7", industry: "プラスチック製品製造業",
    photo: `${P}/plant-picture-clean-room-equipment-stainless-steel-machines.webp`,
    schemeName: "事業再構築補助金", business: "不織布の再生ペレット製造",
    issue: "海外売上依存による貿易停止リスク", investment: "PP押し出し機、測定器、粉砕機の導入",
    investmentAmount: "約3,696万円", subsidyRate: "2/3", subsidyAmount: "約2,464万円", result: "売上19%増",
  },
  {
    id: "case-8", industry: "建設業",
    photo: `${P}/engineers-analyzing-data-digital-tablet.webp`,
    schemeName: "省力化投資補助金", business: "宅地造成業",
    issue: "人手不足", investment: "油圧ショベル、自動測量機、後付けマシンガイダンス",
    investmentAmount: "約3,896万円", subsidyRate: "2/3", subsidyAmount: "2,000万円", result: "作業時間を47.6h→27.8h/日に削減",
  },
  {
    id: "case-9", industry: "損害保険代理業",
    photo: `${P}/handshake-close-up-executives.webp`,
    schemeName: "事業再構築補助金", business: "保険代理店業務",
    issue: "単一事業への経営依存", investment: "古民家改装工事、トレーラーハウス購入",
    investmentAmount: "4,880万円", subsidyRate: "2/3", subsidyAmount: "2,000万円", result: "売上131%増",
  },
  {
    id: "case-10", industry: "歯科診療所",
    photo: `${P}/portrait-asian-businesswoman-presenting-her-plan-meeting.webp`,
    schemeName: "事業再構築補助金", business: "歯科医院",
    issue: "新規事業への方向転換", investment: "店舗改装工事、治療台の購入",
    investmentAmount: "3,200万円", subsidyRate: "2/3", subsidyAmount: "2,000万円", result: "売上170%増",
  },
  {
    id: "case-11", industry: "飲食業＋産廃業",
    photo: `${P}/two-cropped-startuppers-developing-business-plan.webp`,
    schemeName: "事業再構築補助金", business: "居酒屋の運営＋空きビン回収・リサイクル",
    issue: "経営リスク分散", investment: "古民家の改装工事",
    investmentAmount: "2,950万円", subsidyRate: "2/3", subsidyAmount: "2,000万円", result: "売上28%増",
  },
  {
    id: "case-12", industry: "経営コンサルタント業",
    photo: `${P}/businessman-with-digital-interface-data-growth.webp`,
    schemeName: "事業再構築補助金", business: "集客コンサル",
    issue: "単一事業への経営依存", investment: "教育動画・マニュアル管理プラットフォーム構築",
    investmentAmount: "2,949万円", subsidyRate: "2/3", subsidyAmount: "1,966万円", result: "売上33%増",
  },
];

const STATS = [
  { label: "最大補助金額", value: "4,000万円", primary: true },
  { label: "最高投資金額", value: "8,120万円", primary: false },
  { label: "平均補助金額", value: "約1,241万円", primary: false },
] as const;

const CARD_W = 320;
const CARD_GAP = 20;
const STRIDE = CARD_W + CARD_GAP;
// 前後に2セットずつコピー（合計5セット）— DOM枚数を最小化
const COPIES_EACH = 2;
const TOTAL_COPIES = COPIES_EACH * 2 + 1;
const ONE_SET = CASES.length * STRIDE;
// 本体開始位置 = 前コピー2セット分
const BODY_START = COPIES_EACH * ONE_SET;

// 自動スクロール速度 (px/frame @60fps ≈ 36px/s)
const AUTO_SPEED = 0.6;

export default function SubsidyCaseStudySection({ homeDepth = false }: { homeDepth?: boolean } = {}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  // rAFベース自動スクロール
  const rafId = useRef<number | null>(null);
  const autoActive = useRef(false);
  // 小数精度スクロール位置
  const scrollPos = useRef(BODY_START);
  const isJumping = useRef(false);

  // ── 画像プリロード（カルーセル内の全画像を事前fetch） ──────────────
  useEffect(() => {
    CASES.forEach((c) => {
      const img = new Image();
      img.src = c.photo;
    });
  }, []);

  // ── ループ補正 ──────────────────────────────────────────────────────
  const correctLoop = useCallback((el: HTMLDivElement) => {
    if (isJumping.current) return;
    const sl = el.scrollLeft;
    if (sl < BODY_START - ONE_SET) {
      isJumping.current = true;
      const next = sl + ONE_SET * 2;
      el.scrollLeft = next;
      scrollPos.current = next;
      requestAnimationFrame(() => { isJumping.current = false; });
    } else if (sl >= BODY_START + ONE_SET * 2) {
      isJumping.current = true;
      const next = sl - ONE_SET * 2;
      el.scrollLeft = next;
      scrollPos.current = next;
      requestAnimationFrame(() => { isJumping.current = false; });
    }
  }, []);

  // ── rAFループ ──────────────────────────────────────────────────────
  const rafLoop = useCallback(() => {
    const el = trackRef.current;
    if (!el || !autoActive.current) return;
    scrollPos.current += AUTO_SPEED;
    // scrollLeft は整数に丸めて書き込む（サブピクセルのジャンプを防止）
    el.scrollLeft = Math.round(scrollPos.current);
    correctLoop(el);
    rafId.current = requestAnimationFrame(rafLoop);
  }, [correctLoop]);

  const stopAuto = useCallback(() => {
    autoActive.current = false;
    if (rafId.current !== null) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
  }, []);

  const startAuto = useCallback(() => {
    if (reduce || autoActive.current) return;
    autoActive.current = true;
    rafId.current = requestAnimationFrame(rafLoop);
  }, [reduce, rafLoop]);

  // ── 初期化 ─────────────────────────────────────────────────────────
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    // scrollLeft を即時セット（レイアウト確定後）
    requestAnimationFrame(() => {
      if (!trackRef.current) return;
      trackRef.current.scrollLeft = BODY_START;
      scrollPos.current = BODY_START;
    });
    const t = setTimeout(startAuto, 800);
    return () => clearTimeout(t);
  }, [startAuto]);

  // ── セクション外 → 停止、再入 → 再開 ──────────────────────────────
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          startAuto();
        } else {
          stopAuto();
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(section);
    return () => obs.disconnect();
  }, [startAuto, stopAuto]);

  // ── クリーンアップ ──────────────────────────────────────────────────
  useEffect(() => () => stopAuto(), [stopAuto]);

  // ── ホイール ────────────────────────────────────────────────────────
  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    const el = trackRef.current;
    if (!el) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();
      const next = el.scrollLeft + e.deltaY * 1.2;
      el.scrollLeft = next;
      scrollPos.current = next;
      correctLoop(el);
    }
    stopAuto();
  }, [stopAuto, correctLoop]);

  // ── ドラッグ ────────────────────────────────────────────────────────
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const el = trackRef.current;
    if (!el) return;
    isDragging.current = true;
    startX.current = e.clientX;
    scrollLeftStart.current = el.scrollLeft;
    scrollPos.current = el.scrollLeft;
    el.setPointerCapture(e.pointerId);
    stopAuto();
  }, [stopAuto]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    const el = trackRef.current;
    if (!el) return;
    const next = scrollLeftStart.current - (e.clientX - startX.current);
    el.scrollLeft = next;
    scrollPos.current = next;
    correctLoop(el);
  }, [correctLoop]);

  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
    // ドラッグ後 1.2 秒で自動再開
    const t = setTimeout(startAuto, 1200);
    return () => clearTimeout(t);
  }, [startAuto]);

  // スマホタッチでのスクロール補正
  const handleScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el || autoActive.current) return;
    scrollPos.current = el.scrollLeft;
    correctLoop(el);
  }, [correctLoop]);

  // 表示カードリスト（5セット）
  const displayCards = Array.from({ length: TOTAL_COPIES }, (_, setIdx) =>
    CASES.map((c) => ({ ...c, _key: `${setIdx}-${c.id}` }))
  ).flat();

  return (
    <section
      ref={sectionRef}
      aria-labelledby="case-study-heading"
      className={`w-full py-20 md:py-24${homeDepth ? " lp-section-depth" : ""}`}
      style={homeDepth ? undefined : { background: "#F4F8FC" }}
    >
      {/* ── ヘッダー ── */}
      <div className="mx-auto max-w-[1160px] px-5 sm:px-8">
        <div className="text-center">
          <ScrollTextReveal
            as="h2"
            id="case-study-heading"
            className="font-heading text-3xl font-bold leading-tight text-[var(--text-primary)] md:text-4xl"
          >
            NTS 支援事例の実績
          </ScrollTextReveal>
          <p className="mx-auto mt-4 max-w-[640px] text-sm leading-relaxed md:text-base" style={{ color: "#4A5E78" }}>
            制度の名前だけでは見えない、実際の活用の姿。業種・課題・投資内容・採択金額・その後の成果
          </p>
        </div>

        {/* 実績サマリー */}
        <div className="mx-auto mt-8 grid max-w-[680px] grid-cols-3 gap-3 max-md:grid-cols-1 max-md:max-w-xs sm:gap-4">
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
        <p className="text-[12px]" style={{ color: "#9FB3C8" }}>横にスワイプして事例を見る（ループ）</p>
      </div>

      {/* ── カルーセル ── */}
      <div className="relative mt-3 overflow-hidden">
        {/* 左端フェード */}
        <div
          className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-10 sm:w-20"
          style={{ background: homeDepth ? undefined : "linear-gradient(to right, #F4F8FC 30%, transparent)" }}
          aria-hidden
        />
        {/* 右端フェード */}
        <div
          className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-10 sm:w-20"
          style={{ background: homeDepth ? undefined : "linear-gradient(to left, #F4F8FC 30%, transparent)" }}
          aria-hidden
        />

        <div
          ref={trackRef}
          data-carousel-track=""
          className="flex"
          style={{
            gap: `${CARD_GAP}px`,
            paddingLeft: `${CARD_GAP}px`,
            paddingRight: `${CARD_GAP}px`,
            paddingTop: "8px",
            paddingBottom: "8px",
            overflowX: "scroll",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            cursor: "grab",
            // GPU合成レイヤーに昇格してスクロールをスムーズに
            willChange: "transform",
            WebkitOverflowScrolling: "touch",
            touchAction: "pan-x",
          }}
          onWheel={handleWheel}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onTouchStart={stopAuto}
          onScroll={handleScroll}
          role="region"
          aria-label="補助金採択事例カルーセル（横スワイプで操作・ループ）"
        >
          {displayCards.map((c, idx) => (
            <CaseCard
              key={c._key}
              c={c}
              // 最初の1セット（12枚）は eager、それ以降は lazy
              priority={idx < CASES.length}
            />
          ))}
        </div>
      </div>

      {/* ── 免責 ── */}
      <div className="mx-auto mt-6 max-w-[1160px] px-5 sm:px-8">
        <p className="text-center text-[11px] leading-relaxed" style={{ color: "#6B7A90" }}>
          ※過去支援事例であり、採択・補助金額を保証するものではありません。制度・対象経費・審査結果により異なります。
        </p>
      </div>
    </section>
  );
}

// ============================================================
// CaseCard — ミニ事例レポート風
// ============================================================
function CaseCard({ c, priority = false }: { c: CaseData; priority?: boolean }) {
  const [imgLoaded, setImgLoaded] = useState(priority);

  return (
    <article
      data-case-card
      className="flex shrink-0 flex-col overflow-hidden rounded-2xl bg-white"
      style={{
        width: `${CARD_W}px`,
        border: "1px solid #DCE7F3",
        boxShadow: "0 3px 14px rgba(8,42,94,0.07)",
        // カード自体をGPUレイヤーに（スクロール中の再描画を抑制）
        contain: "layout style paint",
      }}
      aria-label={`${c.industry} — ${c.schemeName}`}
    >
      {/* ── 写真ヘッダー ── */}
      <div className="relative h-[160px] w-full shrink-0 overflow-hidden bg-[#e8f0f8]">
        {/* プレースホルダー（画像読み込み前の背景） */}
        {!imgLoaded && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-[#dce9f5] to-[#c8ddf0]" aria-hidden />
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={c.photo}
          alt={`${c.industry}の事例イメージ`}
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300"
          style={{ opacity: imgLoaded ? 1 : 0 }}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          draggable={false}
          onLoad={() => setImgLoaded(true)}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "linear-gradient(to bottom, rgba(8,42,94,0.15) 0%, rgba(8,42,94,0.58) 100%)" }}
          aria-hidden
        />
        {/* 補助金額バッジ */}
        <div
          className="absolute bottom-3 left-3 rounded-full px-3 py-1 text-[12px] font-black"
          style={{ background: "rgba(255,255,255,0.95)", color: "#0068B7" }}
        >
          {c.subsidyAmount}
        </div>
      </div>

      {/* ── カード本文 ── */}
      <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
        <p className="text-[10px] font-medium" style={{ color: "#9FB3C8" }}>過去支援事例</p>
        <p className="mt-1 font-heading text-[13px] font-bold leading-snug" style={{ color: "#082A5E" }}>{c.schemeName}</p>
        <p className="mt-1 text-[11px] leading-relaxed" style={{ color: "#6B7A90" }}>{c.business}</p>

        {/* 金額比較ブロック */}
        <div className="mt-3 overflow-hidden rounded-xl" style={{ border: "1px solid #C8DFF5" }}>
          <div className="flex items-center justify-between px-4 py-2.5" style={{ background: "#F8FBFF" }}>
            <span className="text-[10px] font-semibold" style={{ color: "#6B7A90" }}>総投資額</span>
            <span className="font-heading text-[15px] font-bold" style={{ color: "#082A5E" }}>{c.investmentAmount}</span>
          </div>
          <div style={{ borderTop: "1px solid #E4EDF7" }} />
          <div className="flex items-center justify-between px-4 py-3" style={{ background: "#EEF6FF" }}>
            <span className="text-[10px] font-bold" style={{ color: "#0068B7" }}>補助金額</span>
            <span className="font-heading text-[1.3rem] font-black leading-none" style={{ color: "#0068B7" }}>{c.subsidyAmount}</span>
          </div>
          <div style={{ borderTop: "1px solid #C8DFF5" }} />
          <div className="flex items-center justify-between px-4 py-2" style={{ background: "#F8FBFF" }}>
            <span className="text-[10px] font-semibold" style={{ color: "#6B7A90" }}>補助率</span>
            <span className="rounded-full px-2.5 py-0.5 text-[11px] font-bold" style={{ background: "#0068B7", color: "#fff" }}>{c.subsidyRate}</span>
          </div>
        </div>

        {/* 課題 → 投資 → 効果 */}
        <div className="mt-3 flex flex-col gap-0 overflow-hidden rounded-xl" style={{ border: "1px solid #E4EDF7" }}>
          <MiniRow label="課題" value={c.issue} bg="#F8FAFC" />
          <div style={{ borderTop: "1px solid #E4EDF7" }} />
          <MiniRow label="投資" value={c.investment} bg="#FFFFFF" />
          <div style={{ borderTop: "1px solid #E4EDF7" }} />
          <MiniRow label="効果" value={c.result} bg="#EEF6FF" accent />
        </div>
      </div>
    </article>
  );
}

function MiniRow({ label, value, bg, accent }: { label: string; value: string; bg: string; accent?: boolean }) {
  return (
    <div className="flex items-start gap-2 px-3.5 py-2.5" style={{ background: bg }}>
      <span
        className="mt-[1px] shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold"
        style={accent ? { background: "#0068B7", color: "#fff" } : { background: "rgba(8,42,94,0.06)", color: "#082A5E" }}
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

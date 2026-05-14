"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";

// ============================================================
// 事例データ — ここに追加・編集するだけで件数を増やせます
// ============================================================
const CASES = [
  {
    id: "case-1",
    featured: true,
    industry: "運送業",
    anonymousTitle: "運送業の公表事例",
    title: "倉庫間搬送を省力化し、日々の残業を削減",
    challenge: "倉庫間搬送・書類運搬に人手がかかっていた",
    solution: "無人搬送車 AGV を導入",
    resultMain: "1日142分削減",
    subsidyRange: "最大1,000万円級",
    source: "公式事例",
    imageUrl: "/images/industries/transport2.webp",
    imageAlt: "運送業・物流現場のイメージ",
  },
  {
    id: "case-2",
    featured: false,
    industry: "建設業",
    anonymousTitle: "建設業の公表事例",
    title: "工事原価作成をシステム化し、年間コストを削減",
    challenge: "工事原価や入金管理が紙・Excel中心だった",
    solution: "工事原価管理システムを導入",
    resultMain: "年間120万円削減",
    subsidyRange: "最大150万円級",
    source: "公式事例",
    imageUrl: "/images/industries/construction.webp",
    imageAlt: "建設現場のイメージ",
  },
  {
    id: "case-3",
    featured: false,
    industry: "飲食業",
    anonymousTitle: "飲食業の公表事例",
    title: "売上・在庫管理をクラウド化し、回転率を改善",
    challenge: "売上管理や在庫管理が属人的だった",
    solution: "クラウドPOS・在庫管理ツールを導入",
    resultMain: "売上40%成長",
    subsidyRange: "最大150万円級",
    source: "公式事例",
    imageUrl: "/images/industries/restaurant.png",
    imageAlt: "飲食店・カフェのイメージ",
  },
  {
    id: "case-4",
    featured: false,
    industry: "卸売・小売業",
    anonymousTitle: "卸売・小売業の公表事例",
    title: "伝票発行・在庫管理をクラウド化",
    challenge: "伝票発行・受発注が手作業中心だった",
    solution: "販売管理・受発注クラウドを導入",
    resultMain: "伝票発行 1/6",
    subsidyRange: "最大150万円級",
    source: "公式事例",
    imageUrl: "/images/industries/retail-food.png",
    imageAlt: "卸売・小売業のイメージ",
  },
  {
    id: "case-5",
    featured: false,
    industry: "不動産業",
    anonymousTitle: "不動産業の公表事例",
    title: "家賃管理など定型業務をクラウド化",
    challenge: "家賃管理などの定型業務が多かった",
    solution: "会計・顧客管理クラウドを導入",
    resultMain: "定型業務 7割→1割",
    subsidyRange: "最大150万円級",
    source: "公式事例",
    imageUrl: "/images/industries/manufacturing2.webp",
    imageAlt: "オフィス・管理業務のイメージ",
  },
  {
    id: "case-6",
    featured: false,
    industry: "建設業",
    anonymousTitle: "建設業の公表事例",
    title: "測量業務を省力化し、週あたりの作業時間を削減",
    challenge: "測量業務に週60時間ほど要していた",
    solution: "高機能測量機器を導入",
    resultMain: "週30時間削減",
    subsidyRange: "最大1,000万円級",
    source: "公式事例",
    imageUrl: "/images/industries/construction2.webp",
    imageAlt: "建設・測量現場のイメージ",
  },
  {
    id: "case-7",
    featured: false,
    industry: "建設業",
    anonymousTitle: "建設業の公表事例",
    title: "現場勤怠管理をオンライン化し残業を削減",
    challenge: "現場作業員が打刻のため本社へ往復していた",
    solution: "勤怠管理クラウドを導入",
    resultMain: "残業 1/3",
    subsidyRange: "最大150万円級",
    source: "公式事例",
    imageUrl: "/images/industries/construction3.webp",
    imageAlt: "建設現場・チームのイメージ",
  },
  {
    id: "case-8",
    featured: false,
    industry: "士業・専門サービス",
    anonymousTitle: "専門サービス業の公表事例",
    title: "人事・給与・労務システムを一元化",
    challenge: "人事・労務・給与管理が分断されていた",
    solution: "基幹業務システム・労務給与ツールを導入",
    resultMain: "業務効率化",
    subsidyRange: "最大150万円級",
    source: "公式事例",
    imageUrl: "/images/industries/human-resources3.webp",
    imageAlt: "オフィス・専門サービス業のイメージ",
  },
  {
    id: "case-9",
    featured: false,
    industry: "運送業",
    anonymousTitle: "運送業の公表事例",
    title: "ドライバーの勤務状況をリアルタイムで把握",
    challenge: "小口配達増加とドライバー不足に対応が必要だった",
    solution: "運送特化クラウド勤怠管理システムを導入",
    resultMain: "超過前アラート",
    subsidyRange: "最大150万円級",
    source: "公式事例",
    imageUrl: "/images/industries/transport3.webp",
    imageAlt: "トラック・ドライバー管理のイメージ",
  },
];

const SCROLL_SPEED = 0.5; // px/frame

export default function SubsidyCaseStudySection() {
  const trackRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number | null>(null);
  const prefersReducedRef = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    prefersReducedRef.current = mq.matches;
    const handler = (e: MediaQueryListEvent) => {
      prefersReducedRef.current = e.matches;
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const tick = () => {
      if (!prefersReducedRef.current) {
        const half = track.scrollWidth / 2;
        track.scrollLeft += SCROLL_SPEED;
        if (track.scrollLeft >= half) track.scrollLeft = 0;
      }
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  const doubled = [...CASES, ...CASES];

  return (
    <section
      aria-labelledby="case-study-heading"
      className="w-full overflow-hidden py-20 md:py-24 lg:py-28"
      style={{ background: "#F3F7FC" }}
    >
      {/* ── ヘッダー ───────────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2
            id="case-study-heading"
            className="font-heading"
            style={{
              fontSize: "clamp(1.6rem, 3.2vw, 2.4rem)",
              fontWeight: 700,
              lineHeight: 1.4,
              color: "var(--text-primary)",
            }}
          >
            実際の事例で見る、補助金の使い方
          </h2>
          <p
            className="font-body mx-auto mt-4"
            style={{
              maxWidth: "580px",
              fontSize: "0.95rem",
              lineHeight: 1.85,
              color: "var(--text-secondary)",
            }}
          >
            課題・導入内容・成果を見比べることで、自社に近い活用余地を具体的に確認できます。
          </p>
        </div>
      </div>

      {/* ── スクロールトラック ─────────────────────────── */}
      <div
        ref={trackRef}
        role="region"
        aria-label="補助金活用事例のカード一覧（横スクロール）"
        className="mt-10 flex gap-5 overflow-x-auto pb-2"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          cursor: "grab",
          WebkitOverflowScrolling: "touch",
          paddingLeft: "clamp(1.25rem, calc(50vw - 37rem), 6rem)",
          paddingRight: "clamp(1.25rem, calc(50vw - 34rem), 6rem)",
        }}
      >
        {doubled.map((c, i) => (
          <CaseCard
            key={`${c.id}-${i}`}
            caseData={c}
            ariaHidden={i >= CASES.length}
          />
        ))}
      </div>

      {/* ── 免責注意書き ──────────────────────────────── */}
      <div className="mx-auto mt-6 max-w-6xl px-5 sm:px-6 lg:px-8">
        <p
          className="font-body text-center text-[11px] leading-relaxed"
          style={{ color: "var(--text-muted)" }}
        >
          掲載内容は公表事例に基づく参考情報です。補助額・対象経費・採択可否は制度、申請内容、審査により異なります。
        </p>
      </div>

      {/* ── 下部CTAバー ───────────────────────────────── */}
      <div className="mx-auto mt-8 max-w-6xl px-5 sm:px-6 lg:px-8">
        <div
          className="flex flex-col items-start justify-between gap-5 rounded-2xl bg-white px-6 py-5 sm:flex-row sm:items-center lg:px-8 lg:py-6"
          style={{
            border: "1.5px solid #B5D4F4",
            boxShadow: "0 4px 18px rgba(26,76,142,0.08)",
          }}
        >
          <div className="flex items-start gap-4">
            <span
              className="mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
              style={{ background: "#EEF6FF", border: "1px solid #B5D4F4" }}
              aria-hidden
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--accent-navy)"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            </span>
            <div>
              <p
                className="font-heading"
                style={{
                  fontSize: "clamp(0.92rem, 1.6vw, 1.05rem)",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  lineHeight: 1.55,
                }}
              >
                NTSは制度名だけでなく、業務課題・導入内容・成果まで整理します
              </p>
              <p
                className="font-body mt-1.5"
                style={{
                  fontSize: "0.85rem",
                  lineHeight: 1.7,
                  color: "var(--text-secondary)",
                }}
              >
                近い事例をもとに、自社で確認すべき制度を絞り込めます。
              </p>
            </div>
          </div>
          <Link
            href="/consult"
            className="font-body inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-[10px] px-7 py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a4c8e] sm:w-auto"
            style={{
              background: "var(--accent-navy)",
              letterSpacing: "0.05em",
              whiteSpace: "nowrap",
              boxShadow: "0 4px 14px rgba(26,76,142,0.20)",
            }}
          >
            自社に近い事例から相談する
            <ArrowRight size={16} aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// CaseCard
// ============================================================
type CaseData = (typeof CASES)[number];

function CaseCard({
  caseData: c,
  ariaHidden,
}: {
  caseData: CaseData;
  ariaHidden: boolean;
}) {
  return (
    <article
      className="font-body relative flex shrink-0 flex-col overflow-hidden rounded-2xl bg-white"
      style={{
        width: "clamp(280px, 85vw, 360px)",
        border: c.featured ? "2px solid #1A4C8E" : "1px solid #DDE7F2",
        boxShadow: c.featured
          ? "0 8px 28px rgba(26,76,142,0.18)"
          : "0 4px 16px rgba(26,76,142,0.07)",
      }}
      aria-hidden={ariaHidden}
      tabIndex={ariaHidden ? -1 : 0}
      aria-label={ariaHidden ? undefined : `${c.industry} — ${c.title}`}
    >
      {/* おすすめバッジ */}
      {c.featured && (
        <div
          className="font-heading absolute left-0 top-3 z-[2] px-3 py-1 text-[10px] font-bold text-white"
          style={{
            background: "var(--accent-navy)",
            borderRadius: "0 6px 6px 0",
            letterSpacing: "0.06em",
          }}
        >
          おすすめ事例
        </div>
      )}

      {/* サムネイル */}
      <div
        className="relative w-full overflow-hidden bg-[#EEF3F8]"
        style={{ aspectRatio: "16/7" }}
      >
        <Image
          src={c.imageUrl}
          alt={c.imageAlt}
          fill
          sizes="(max-width: 640px) 85vw, 360px"
          className="object-cover"
          draggable={false}
        />
      </div>

      {/* 本文 */}
      <div className="flex flex-1 flex-col p-5">
        {/* 業種ラベル + 匿名タイトル */}
        <div className="mb-2 flex items-center gap-2">
          <span
            className="font-heading shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold"
            style={{
              background: "rgba(26,76,142,0.08)",
              color: "var(--accent-navy)",
            }}
          >
            {c.industry}
          </span>
          <span
            className="font-body truncate text-[11px]"
            style={{ color: "var(--text-muted)" }}
          >
            {c.anonymousTitle}
          </span>
        </div>

        {/* 事例タイトル */}
        <h3
          className="font-heading mb-4 font-bold leading-snug"
          style={{
            fontSize: "0.925rem",
            color: "var(--text-primary)",
            minHeight: "2.8rem",
          }}
        >
          {c.title}
        </h3>

        {/* 課題 → 導入 → 成果 */}
        <div className="flex flex-1 flex-col">
          <FlowRow label="課題" value={c.challenge} />
          <FlowArrow />
          <FlowRow label="導入" value={c.solution} />
          <FlowArrow />

          {/* 成果ボックス — mt-auto で下部に固定 */}
          <div
            className="mt-auto rounded-xl px-4 py-3.5"
            style={{
              background: "linear-gradient(135deg, #EEF6FF 0%, #E4EFFC 100%)",
              border: "1px solid #B5D4F4",
              minHeight: "110px",
            }}
          >
            <span
              className="font-heading mb-1.5 block text-[10px] font-bold uppercase tracking-widest"
              style={{ color: "var(--accent-navy)", opacity: 0.75 }}
            >
              成果
            </span>
            <p
              className="font-heading font-bold leading-none"
              style={{
                fontSize: "clamp(1.4rem, 3.2vw, 1.75rem)",
                color: "var(--accent-navy)",
              }}
            >
              {c.resultMain}
            </p>
            {/* 補助額レンジ（成果より小さく控えめに） */}
            <p
              className="font-body mt-2 text-[11px] leading-relaxed"
              style={{ color: "#5A7A9A" }}
            >
              制度上の補助額レンジ: {c.subsidyRange}
              <br />
              <span style={{ opacity: 0.75 }}>条件により異なります</span>
            </p>
          </div>
        </div>

        {/* 出典 */}
        <p
          className="font-body mt-4 flex items-center gap-1 text-[11px]"
          style={{ color: "var(--text-muted)" }}
        >
          <ExternalLink size={10} strokeWidth={1.8} aria-hidden />
          出典：{c.source}
        </p>
      </div>
    </article>
  );
}

// ── 小部品 ─────────────────────────────────────────────────

function FlowRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="flex items-start gap-2.5 py-2.5"
      style={{ minHeight: "3.6rem" }}
    >
      <span
        className="font-heading mt-[1px] shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold"
        style={{
          background: "rgba(26,76,142,0.08)",
          color: "var(--accent-navy)",
        }}
      >
        {label}
      </span>
      <span
        className="font-body text-[13px] leading-relaxed"
        style={{ color: "var(--text-secondary)" }}
      >
        {value}
      </span>
    </div>
  );
}

function FlowArrow() {
  return (
    <div aria-hidden className="flex justify-center">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path
          d="M6 1.5v9M2.5 7l3.5 3.5L9.5 7"
          stroke="#B5C5DA"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

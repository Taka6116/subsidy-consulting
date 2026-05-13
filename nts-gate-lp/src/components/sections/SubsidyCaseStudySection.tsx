"use client";

import { useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";

// ============================================================
// 事例データ — ここに追加・編集するだけで件数を増やせます
// ============================================================
const CASES = [
  {
    id: "case-1",
    badge: "おすすめ事例",
    showBadge: true,
    industry: "運送業",
    title: "Excel・手書き伝票から販売管理システムへ",
    challenge: "売上・入金・請求の集計に時間がかかる",
    solution: "販売管理システムを導入",
    resultMain: "30%以上短縮",
    resultSub: "売上集計の処理時間。誤請求ゼロ",
    source: "中小企業庁 公式事例",
    imageUrl: "/images/industries/transport2.webp",
    imageAlt: "運送業・物流現場のイメージ",
  },
  {
    id: "case-2",
    badge: "",
    showBadge: false,
    industry: "建設業",
    title: "本社往復の勤怠管理をオンライン化",
    challenge: "現場作業員が打刻のため本社へ往復",
    solution: "勤怠管理ソフト・Zoomを導入",
    resultMain: "残業 1/3",
    resultSub: "勤怠管理は2日から1日に短縮",
    source: "中小企業庁 公式事例",
    imageUrl: "/images/industries/construction.webp",
    imageAlt: "建設現場のイメージ",
  },
  {
    id: "case-3",
    badge: "",
    showBadge: false,
    industry: "建設・土木業",
    title: "工事原価作成をシステム化",
    challenge: "工事原価の作成や管理に手間がかかる",
    solution: "工事原価作成システムを導入",
    resultMain: "年間120万円",
    resultSub: "コスト削減。利益率0.17%増加",
    source: "IT導入補助金 公式サイト",
    imageUrl: "/images/industries/construction.webp",
    imageAlt: "土木・施工現場のイメージ",
  },
  {
    id: "case-4",
    badge: "",
    showBadge: false,
    industry: "士業・専門サービス",
    title: "業務システムをクラウド化し管理を一元化",
    challenge: "人事・労務・給与管理が分断",
    solution: "基幹業務システム・労務給与ツール",
    resultMain: "業務効率化",
    resultSub: "働き方改革と社内意識改革を推進",
    source: "IT導入補助金 公式サイト",
    imageUrl: "/images/industries/human-resources3.webp",
    imageAlt: "オフィス・専門サービス業のイメージ",
  },
  {
    id: "case-5",
    badge: "",
    showBadge: false,
    industry: "運送業",
    title: "ドライバーの勤務状況をリアルタイム把握",
    challenge: "小口配達増加、ドライバー不足、過重労働リスク",
    solution: "運送特化クラウド勤怠管理システム",
    resultMain: "事前アラート",
    resultSub: "基準時間超えを事前に把握",
    source: "ミラサポplus",
    imageUrl: "/images/industries/transport3.webp",
    imageAlt: "トラック・ドライバー管理のイメージ",
  },
] as const;

const SCROLL_SPEED = 0.6; // px/frame — 遅めで読みやすく
const RESUME_DELAY = 1800; // ms — 操作終了後に再開するまでの時間

export default function SubsidyCaseStudySection() {
  const trackRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number | null>(null);
  const isPausedRef = useRef(false);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // prefers-reduced-motion
  const prefersReducedRef = useRef(false);

  // reduced-motion 検出
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    prefersReducedRef.current = mq.matches;
    const handler = (e: MediaQueryListEvent) => {
      prefersReducedRef.current = e.matches;
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const pause = useCallback(() => {
    isPausedRef.current = true;
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
  }, []);

  const scheduleResume = useCallback(() => {
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      isPausedRef.current = false;
    }, RESUME_DELAY);
  }, []);

  // RAF ループ
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const tick = () => {
      if (!isPausedRef.current && !prefersReducedRef.current) {
        const maxScroll = track.scrollWidth / 2; // データ複製分の半分
        track.scrollLeft += SCROLL_SPEED;
        if (track.scrollLeft >= maxScroll) {
          track.scrollLeft = 0;
        }
      }
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
  }, []);

  // イベントハンドラー
  const handlePause = useCallback(() => pause(), [pause]);
  const handleResume = useCallback(() => scheduleResume(), [scheduleResume]);

  // doubled data for seamless loop
  const doubled = [...CASES, ...CASES];

  return (
    <section
      aria-labelledby="case-study-heading"
      className="w-full overflow-hidden py-20 md:py-24"
      style={{ background: "#F3F7FC" }}
    >
      {/* ── ヘッダー ───────────────────────────────────── */}
      <div className="mx-auto max-w-5xl px-5 sm:px-6 lg:px-8">
        <div className="text-center">
          <span
            className="font-body inline-flex items-center rounded-full px-4 py-1.5"
            style={{
              fontSize: "0.72rem",
              fontWeight: 700,
              letterSpacing: "0.1em",
              color: "var(--accent-navy)",
              background: "rgba(26,76,142,0.08)",
              border: "1px solid rgba(26,76,142,0.18)",
            }}
          >
            公式事例から見る活用イメージ
          </span>
          <h2
            id="case-study-heading"
            className="font-heading mt-5"
            style={{
              fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
              fontWeight: 700,
              lineHeight: 1.45,
              color: "var(--text-primary)",
            }}
          >
            実際の事例で見る、補助金の使い方
          </h2>
          <p
            className="font-body mx-auto mt-4"
            style={{
              maxWidth: "600px",
              fontSize: "0.95rem",
              lineHeight: 1.85,
              color: "var(--text-secondary)",
            }}
          >
            課題・導入内容・成果を見比べることで、自社に近い活用余地を具体的に確認できます。
          </p>
        </div>
      </div>

      {/* ── 横スクロールトラック ───────────────────────── */}
      <div
        ref={trackRef}
        className="mt-10 flex gap-5 overflow-x-auto px-5 pb-3 sm:px-8 lg:px-12"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          cursor: "grab",
          WebkitOverflowScrolling: "touch",
        }}
        onMouseEnter={handlePause}
        onMouseLeave={handleResume}
        onFocus={handlePause}
        onBlur={handleResume}
        onTouchStart={handlePause}
        onTouchEnd={handleResume}
        onMouseDown={handlePause}
        onMouseUp={handleResume}
        // キーボード操作時は停止
        onKeyDown={handlePause}
        aria-label="補助金活用事例のカード一覧（横スクロール）"
      >
        {doubled.map((c, i) => (
          <CaseCard key={`${c.id}-${i}`} caseData={c} />
        ))}
      </div>

      {/* ── 下部CTA ───────────────────────────────────── */}
      <div className="mx-auto mt-10 max-w-5xl px-5 sm:px-6 lg:px-8">
        <div
          className="flex flex-col items-start justify-between gap-5 rounded-[14px] bg-white p-6 sm:flex-row sm:items-center md:p-7"
          style={{
            border: "1px solid #DDE7F2",
            boxShadow: "0 4px 16px rgba(26,76,142,0.07)",
          }}
        >
          <div className="flex items-start gap-4">
            {/* アイコン */}
            <span
              className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
              style={{ background: "#EEF6FF", border: "1px solid #B5D4F4" }}
              aria-hidden
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--accent-navy)"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <line x1="10" y1="9" x2="8" y2="9" />
                <circle cx="8" cy="13" r="1" fill="currentColor" />
                <path d="M8 16 Q10 14 12 16" />
              </svg>
            </span>
            <div>
              <p
                className="font-heading"
                style={{
                  fontSize: "1rem",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  lineHeight: 1.5,
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
            className="font-body inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-[10px] px-6 py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a4c8e] sm:w-auto"
            style={{
              background: "var(--accent-navy)",
              letterSpacing: "0.05em",
              whiteSpace: "nowrap",
              boxShadow: "0 4px 12px rgba(26,76,142,0.18)",
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
// 個別ケースカード
// ============================================================
type CaseData = (typeof CASES)[number];

function CaseCard({ caseData: c }: { caseData: CaseData }) {
  return (
    <article
      className="font-body relative flex shrink-0 flex-col overflow-hidden rounded-[14px] bg-white"
      style={{
        width: "clamp(300px, 82vw, 400px)",
        border: "1px solid #DDE7F2",
        boxShadow: "0 4px 16px rgba(26,76,142,0.07)",
      }}
      tabIndex={0}
      aria-label={`${c.industry} — ${c.title}`}
    >
      {/* サムネイル */}
      <div className="relative h-[160px] w-full overflow-hidden bg-[#EEF3F8]">
        <Image
          src={c.imageUrl}
          alt={c.imageAlt}
          fill
          sizes="400px"
          className="object-cover"
          draggable={false}
        />
        {/* 業種ラベル */}
        <div className="absolute left-3 top-3 flex items-center gap-2">
          {c.showBadge && (
            <span
              className="font-heading rounded-full px-2.5 py-1 text-[10px] font-bold text-white"
              style={{ background: "var(--accent-navy)" }}
            >
              {c.badge}
            </span>
          )}
          <span
            className="font-heading rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold"
            style={{ color: "var(--accent-navy)" }}
          >
            {c.industry}
          </span>
        </div>
      </div>

      {/* 本文 */}
      <div className="flex flex-1 flex-col p-5">
        {/* タイトル */}
        <h3
          className="font-heading mb-4 text-base font-bold leading-snug"
          style={{ color: "var(--text-primary)" }}
        >
          {c.title}
        </h3>

        {/* 課題 → 導入 → 成果 */}
        <div className="space-y-2.5">
          <RowItem label="課題" value={c.challenge} />
          {/* 矢印 */}
          <div aria-hidden className="flex justify-center py-0.5">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 2v10M3 8l4 4 4-4" stroke="#B5C5DA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <RowItem label="導入" value={c.solution} />
          {/* 矢印 */}
          <div aria-hidden className="flex justify-center py-0.5">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 2v10M3 8l4 4 4-4" stroke="#B5C5DA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          {/* 成果 — 大きく */}
          <div
            className="rounded-[10px] p-3"
            style={{
              background: "linear-gradient(135deg, #F0F6FE 0%, #E8F2FC 100%)",
              border: "1px solid #B5D4F4",
            }}
          >
            <p
              className="font-heading mb-0.5 text-[10px] font-bold uppercase tracking-widest"
              style={{ color: "var(--accent-navy)", opacity: 0.7 }}
            >
              成果
            </p>
            <p
              className="font-heading font-bold leading-tight"
              style={{
                fontSize: "clamp(1.35rem, 4vw, 1.65rem)",
                color: "var(--accent-navy)",
              }}
            >
              {c.resultMain}
            </p>
            <p
              className="font-body mt-1 text-xs leading-relaxed"
              style={{ color: "#365578" }}
            >
              {c.resultSub}
            </p>
          </div>
        </div>

        {/* 出典 */}
        <p
          className="font-body mt-4 flex items-center gap-1 text-[11px]"
          style={{ color: "var(--text-muted)" }}
        >
          <ExternalLink size={11} strokeWidth={1.8} aria-hidden />
          出典：{c.source}
        </p>
      </div>
    </article>
  );
}

function RowItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span
        className="font-heading mt-[1px] shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold"
        style={{
          background: "rgba(26,76,142,0.08)",
          color: "var(--accent-navy)",
          minWidth: "28px",
          textAlign: "center",
        }}
      >
        {label}
      </span>
      <p
        className="font-body text-sm leading-relaxed"
        style={{ color: "var(--text-secondary)" }}
      >
        {value}
      </p>
    </div>
  );
}

"use client";

import { motion, useReducedMotion } from "framer-motion";

// ─────────────────────────────────────────────────────────────
// アニメーション
// ─────────────────────────────────────────────────────────────
const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.12 },
  transition: { duration: 0.55, ease: EASE_OUT, delay },
});

// ─────────────────────────────────────────────────────────────
// データ
// ─────────────────────────────────────────────────────────────
const PARTNER_LABELS = [
  { text: "信頼・関係性", icon: "people" as IconKey },
  { text: "現場課題の把握", icon: "chat" as IconKey },
  { text: "提案商材", icon: "chart" as IconKey },
];
const NTS_LABELS = [
  { text: "補助金活用", icon: "bulb" as IconKey },
  { text: "投資背景整理", icon: "doc" as IconKey },
  { text: "専門家連携", icon: "net" as IconKey },
];

const STEPS = [
  {
    no: "01",
    title: "課題を深く捉える",
    sub: "顧客課題・投資背景を整理",
    icon: "dig" as IconKey,
  },
  {
    no: "02",
    title: "選択肢を広げる",
    sub: "補助金活用も含めて検討",
    icon: "branch" as IconKey,
  },
  {
    no: "03",
    title: "提案を前へ進める",
    sub: "実現性と提案品質を高める",
    icon: "trend" as IconKey,
  },
];

// ─────────────────────────────────────────────────────────────
// アイコン
// ─────────────────────────────────────────────────────────────
type IconKey =
  | "people"
  | "chat"
  | "chart"
  | "bulb"
  | "doc"
  | "net"
  | "dig"
  | "branch"
  | "trend"
  | "building"
  | "shield"
  | "mountain"
  | "handshake";

function Icon({ type, className = "h-4 w-4" }: { type: IconKey; className?: string }) {
  switch (type) {
    case "people":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
          <circle cx="9" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.7" />
          <circle cx="16" cy="10" r="2" stroke="currentColor" strokeWidth="1.7" />
          <path d="M4 18c.6-2.5 2.5-4 5-4s4.4 1.5 5 4M14 14c1.6.3 2.8 1.5 3.3 3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      );
    case "chat":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
          <path d="M5 6h14v8H10L5 17V6Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        </svg>
      );
    case "chart":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
          <path d="M6 18V10M12 18V6M18 18v-8" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
          <path d="M4 19h16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      );
    case "bulb":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
          <path d="M12 4a5 5 0 0 0-3 9v2h6v-2a5 5 0 0 0-3-9Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
          <path d="M10 20h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      );
    case "doc":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
          <path d="M7 4h7l3 3v13H7V4Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
          <path d="M10 12h6M10 16h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      );
    case "net":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
          <circle cx="12" cy="5" r="2" stroke="currentColor" strokeWidth="1.7" />
          <circle cx="5" cy="19" r="2" stroke="currentColor" strokeWidth="1.7" />
          <circle cx="19" cy="19" r="2" stroke="currentColor" strokeWidth="1.7" />
          <path d="M12 7v3M10 11 6 17M14 11l4 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "dig":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
          <path d="M9 4h6l2 4H7l2-4Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
          <path d="M7 8h10l-1 12H8L7 8Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
          <circle cx="12" cy="14" r="2" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      );
    case "branch":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
          <path d="M12 20V8" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
          <path d="M12 8 6 4M12 8l6-4" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
          <path d="m4 6 2-2 2 2M16 6l2-2 2 2" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "trend":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
          <path d="M3 17l5-5 4 4 9-9" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14 7h6v6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "building":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
          <path d="M6 22V4h12v18" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M2 22h20" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
          <path d="M9 9h1M14 9h1M9 13h1M14 13h1M9 17h1M14 17h1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "shield":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
          <path d="M12 3 4 7v5c0 4.4 3.4 8.5 8 9.5 4.6-1 8-5.1 8-9.5V7L12 3Z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
          <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "mountain":
      return (
        <svg viewBox="0 0 64 48" className={className} fill="none" aria-hidden>
          <path d="M4 40 L22 14 L34 30 L44 18 L60 40 Z" fill="#dbeafe" stroke="#7eb3f0" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M22 14 L29 24 L26 26 Z" fill="#fff" stroke="#7eb3f0" strokeWidth="1" strokeLinejoin="round" />
          <path d="M44 18 L48 24 L46 25 Z" fill="#fff" stroke="#7eb3f0" strokeWidth="1" strokeLinejoin="round" />
          <path d="M44 18 V8 M44 8 H52 L48 11 L52 14 H44" stroke="#facc15" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="#facc15" />
        </svg>
      );
    case "handshake":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
          <path d="M3 12 8 7l3 2 3-2 5 5-4 4-2-2-2 2-3-3-3 2-2-3Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        </svg>
      );
  }
}

// ─────────────────────────────────────────────────────────────
// 左：御社 / NTS 入力ブロック
// ─────────────────────────────────────────────────────────────
function SourceBlock({
  label,
  sub,
  variant,
  items,
}: {
  label: string;
  sub: string;
  variant: "partner" | "nts";
  items: { text: string; icon: IconKey }[];
}) {
  const isPartner = variant === "partner";
  return (
    <div className="flex items-stretch gap-3">
      {/* 円形起点 */}
      <div className="flex shrink-0 flex-col items-center justify-center">
        <div
          className={`flex h-[78px] w-[78px] items-center justify-center rounded-full border-[2.5px] shadow-[0_6px_18px_rgba(26,86,219,0.12)] ${
            isPartner
              ? "border-[#93c5fd] bg-gradient-to-br from-[#eef4ff] to-white"
              : "border-[#67e8f9] bg-gradient-to-br from-[#e0f9ff] to-white"
          }`}
        >
          <Icon
            type={isPartner ? "building" : "handshake"}
            className={`h-9 w-9 ${isPartner ? "text-[#1a56db]" : "text-[#0891b2]"}`}
          />
        </div>
        <p className="mt-1.5 text-[14px] font-bold text-[#071b46]">{label}</p>
        <p className="text-[10.5px] font-semibold text-[#5a7a9a]">{sub}</p>
      </div>

      {/* ラベル */}
      <ul className="flex flex-1 flex-col justify-center gap-1.5">
        {items.map((item) => (
          <li
            key={item.text}
            className="flex items-center gap-2 rounded-lg border border-[#d8e6f5] bg-white px-2.5 py-1.5 shadow-[0_2px_8px_rgba(12,42,72,0.05)]"
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#eef4ff] text-[#1a56db]">
              <Icon type={item.icon} className="h-3.5 w-3.5" />
            </span>
            <span className="text-[12px] font-semibold leading-tight text-[#1e3a5f]">{item.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 中央：3ステップカード
// ─────────────────────────────────────────────────────────────
function StepCard({ no, title, sub, icon }: { no: string; title: string; sub: string; icon: IconKey }) {
  return (
    <div className="relative flex flex-col items-center rounded-xl border border-[#cdddf0] bg-white px-3 py-5 shadow-[0_4px_14px_rgba(12,42,72,0.06)] lg:px-4 lg:py-6">
      {/* 番号バッジ */}
      <span className="absolute -top-3 flex h-7 w-7 items-center justify-center rounded-full bg-[#1a56db] text-[11px] font-bold text-white shadow-md">
        {no}
      </span>
      <span className="mt-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#eef4ff] text-[#1a56db]">
        <Icon type={icon} className="h-5 w-5" />
      </span>
      <h4 className="mt-3 text-[14px] font-bold leading-tight text-[#071b46] lg:text-[15px]">{title}</h4>
      <p className="mt-1.5 text-center text-[11px] leading-snug text-[#5a7a9a] lg:text-[11.5px]">{sub}</p>
    </div>
  );
}

// ─── ステップ間矢印 ─────────────────────────────────────────
function StepArrow() {
  return (
    <div className="flex items-center justify-center" aria-hidden>
      <svg width="24" height="14" viewBox="0 0 24 14" fill="none">
        <path d="M2 7h18" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 3" />
        <path d="m18 3 4 4-4 4" stroke="#1a56db" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 左→中央：直角合流SVG（PC専用、合流のみ）
// ─────────────────────────────────────────────────────────────
function MergeConnector() {
  return (
    <svg
      className="h-full w-full"
      viewBox="0 0 80 200"
      preserveAspectRatio="none"
      fill="none"
      aria-hidden
    >
      {/* 御社水平線（上） */}
      <path d="M0 50 H40" stroke="#93c5fd" strokeWidth="2.5" strokeLinecap="round" />
      {/* NTS水平線（下） */}
      <path d="M0 150 H40" stroke="#67e8f9" strokeWidth="2.5" strokeLinecap="round" />
      {/* 縦線で合流 */}
      <path d="M40 50 V150" stroke="#7eb3f0" strokeWidth="2.5" strokeLinecap="round" />
      {/* 合流ノード */}
      <circle cx="40" cy="100" r="5" fill="#fff" stroke="#1a56db" strokeWidth="2.5" />
      {/* 中央への水平線 */}
      <path d="M40 100 H80" stroke="#1a56db" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// 中央→右：到達線
// ─────────────────────────────────────────────────────────────
function FinishConnector() {
  return (
    <div className="flex items-center justify-center" aria-hidden>
      <svg width="56" height="14" viewBox="0 0 56 14" fill="none">
        <path d="M2 7h46" stroke="#1a56db" strokeWidth="3" strokeLinecap="round" />
        <path d="m44 2 8 5-8 5" stroke="#1a56db" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 右ゴール
// ─────────────────────────────────────────────────────────────
function Goal() {
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div className="relative flex h-[96px] w-[96px] items-center justify-center">
        {/* 後光 */}
        <div className="absolute inset-0 rounded-full bg-[#dbeafe]/60 blur-2xl" aria-hidden />
        <Icon type="mountain" className="relative h-16 w-16" />
      </div>
      <p className="text-center text-[15px] font-bold tracking-wide text-[#071b46] lg:text-[16px]">
        お客様の前進へ
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// セクション本体
// ─────────────────────────────────────────────────────────────
export default function PartnerHandoffSection() {
  const reduceMotion = useReducedMotion();
  const reveal = (delay: number) => (reduceMotion ? {} : fadeUp(delay));

  return (
    <section
      className="section-alt relative overflow-hidden py-24 md:py-32"
      aria-labelledby="joint-progress-heading"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/70 to-transparent" />

      <div className="relative mx-auto max-w-[1240px] px-5 sm:px-6 lg:max-w-[1380px] lg:px-6 xl:max-w-[1440px] xl:px-8">
        {/* 見出し */}
        <motion.div className="mx-auto max-w-3xl text-center" {...reveal(0)}>
          <h2
            id="joint-progress-heading"
            className="font-heading text-3xl font-bold leading-tight text-[var(--text-primary)] md:text-4xl"
          >
            御社とともに、
            <br />
            お客様の前進を支える連携へ。
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[var(--text-secondary)] md:text-lg">
            お客様の課題を一緒に深く捉え、提案や事業の前進につながる選択肢をともに考える。
            <br className="hidden md:inline" />
            NTSは補助金活用の視点も添えながら、御社の顧客支援と提案活動をバックアップします。
          </p>
        </motion.div>

        {/* ── PC 横型合流フロー ── */}
        <motion.div
          className="relative mt-14 hidden rounded-2xl bg-[radial-gradient(ellipse_110%_75%_at_50%_45%,rgba(223,238,255,0.5)_0%,transparent_75%)] px-4 py-10 lg:block"
          {...reveal(0.06)}
        >
          {/*
            横レイアウト
            ┌──────────┬──────┬─────────────────────────┬──────┬─────┐
            │ 左 source │ 合流 │ 3ステップ（→区切り）     │ 到達 │ ゴール│
            └──────────┴──────┴─────────────────────────┴──────┴─────┘
          */}
          <div className="grid grid-cols-[minmax(260px,24%)_60px_minmax(420px,1fr)_64px_minmax(140px,160px)] items-center gap-3">
            {/* 左: 御社 / NTS（上下2段） */}
            <div className="flex flex-col gap-10">
              <SourceBlock label="御社" sub="顧客理解" variant="partner" items={PARTNER_LABELS} />
              <SourceBlock label="NTS" sub="支援視点" variant="nts" items={NTS_LABELS} />
            </div>

            {/* 直角合流線 */}
            <div className="h-full min-h-[240px]">
              <MergeConnector />
            </div>

            {/* 中央: 3ステップ + ステップ間矢印 */}
            <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-3 lg:gap-4">
              <StepCard {...STEPS[0]} />
              <StepArrow />
              <StepCard {...STEPS[1]} />
              <StepArrow />
              <StepCard {...STEPS[2]} />
            </div>

            {/* 到達線 */}
            <FinishConnector />

            {/* 右: ゴール */}
            <Goal />
          </div>
        </motion.div>

        {/* ── SP 縦構成 ── */}
        <div className="mt-10 space-y-5 lg:hidden">
          <motion.div className="space-y-5 rounded-2xl border border-[#d0e4f6] bg-white/95 p-4" {...reveal(0.06)}>
            <SourceBlock label="御社" sub="顧客理解" variant="partner" items={PARTNER_LABELS} />
            <SourceBlock label="NTS" sub="支援視点" variant="nts" items={NTS_LABELS} />
          </motion.div>

          {/* SP合流ラベル */}
          <motion.div className="flex flex-col items-center" {...reveal(0.1)} aria-hidden>
            <svg width="2" height="28" viewBox="0 0 2 28">
              <path d="M1 0V28" stroke="#7eb3f0" strokeWidth="2" strokeDasharray="3 3" />
            </svg>
            <div className="rounded-full border border-[#cdddf0] bg-white px-4 py-1.5 shadow-sm">
              <p className="text-[12px] font-bold tracking-widest text-[#1a56db]">御社 × NTS</p>
            </div>
            <svg width="2" height="28" viewBox="0 0 2 28">
              <path d="M1 0V28" stroke="#7eb3f0" strokeWidth="2" strokeDasharray="3 3" />
            </svg>
          </motion.div>

          {/* SPステップ縦並び */}
          <motion.div className="space-y-3" {...reveal(0.14)}>
            {STEPS.map((step, i) => (
              <div key={step.no}>
                <StepCard {...step} />
                {i < STEPS.length - 1 && (
                  <div className="flex justify-center py-1" aria-hidden>
                    <svg width="14" height="20" viewBox="0 0 14 20">
                      <path d="M7 1v14" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" />
                      <path d="m2 13 5 6 5-6" stroke="#1a56db" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </motion.div>

          {/* SP ゴール */}
          <motion.div className="flex justify-center pt-2" {...reveal(0.18)}>
            <Goal />
          </motion.div>
        </div>

        {/* ── CTA ── */}
        <motion.div
          className="mt-10 flex flex-col gap-4 rounded-2xl border border-[#d0e4f6] bg-white/95 px-5 py-5 shadow-[0_8px_28px_rgba(12,42,72,0.07)] sm:flex-row sm:items-center sm:justify-between sm:px-6"
          {...reveal(0.2)}
        >
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#eef4ff] text-[#1a56db]" aria-hidden>
              <Icon type="people" className="h-5 w-5" />
            </span>
            <div>
              <p className="text-base font-bold text-[#1a56db]">まずは案件のご相談から</p>
              <p className="mt-1 text-sm leading-relaxed text-[var(--text-secondary)]">
                提案中の案件や、今後のご計画についてお気軽にご相談ください。
              </p>
            </div>
          </div>
          <a
            href="#contact"
            className="inline-flex shrink-0 items-center justify-center gap-1 rounded-xl bg-[#0f3e8d] px-6 py-3 text-sm font-bold text-white shadow-[0_4px_16px_rgba(15,62,141,0.28)] transition hover:bg-[#0c3477] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a56db] focus-visible:ring-offset-2"
          >
            案件のご相談はこちら
            <span aria-hidden>›</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}

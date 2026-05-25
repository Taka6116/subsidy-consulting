"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import ScrollTextReveal from "@/components/shared/ScrollTextReveal";
import iso16 from "../../../../icon-assets/isometric_16.webp";
import iso08 from "../../../../icon-assets/isometric_08.webp";
import iso23 from "../../../../icon-assets/isometric23.webp";
import iso21 from "../../../../icon-assets/isometric_21.webp";
import iso20 from "../../../../icon-assets/isometric_20.webp";
import iso07 from "../../../../icon-assets/isometric_07.png";

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
    tag: "整理",
    title: "課題を一緒に特定",
    sub: "顧客課題を言語化",
    icon: "dig" as IconKey,
    isoImg: iso23,
  },
  {
    no: "02",
    tag: "検討",
    title: "選択肢を広げる",
    sub: "補助金・支援策を\n追加提案",
    icon: "branch" as IconKey,
    isoImg: iso21,
  },
  {
    no: "03",
    tag: "提案",
    title: "提案を前へ進める",
    sub: "資料・説明・実行を支援",
    icon: "trend" as IconKey,
    isoImg: iso20,
  },
  {
    no: "04",
    tag: "伴走",
    title: "お客様の前進へ",
    sub: "導入後の次の一手へ接続",
    icon: "flag" as IconKey,
    isoImg: iso07,
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
  | "handshake"
  | "doccheck"
  | "flag";

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
      // 書類 + 虫眼鏡（参照画像の「課題を深く捉える」）
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
          <path d="M6 3h9l3 3v9.5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M6 3v18h12v-3" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M9 9h6M9 12h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          <circle cx="15.5" cy="16.5" r="3" stroke="currentColor" strokeWidth="1.8" />
          <path d="m18 19 3 3" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
        </svg>
      );
    case "branch":
      // Y字3本上向き矢印（参照画像の「選択肢を広げる」）
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
          <path d="M12 21V11" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
          <path d="M5 14 12 9l7 5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M5 14V8M2 11l3-3 3 3" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 9V3M9 6l3-3 3 3" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M19 14V8M16 11l3-3 3 3" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "trend":
      // 棒グラフ上昇 + 矢印（参照画像の「提案を前へ進める」）
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
          <path d="M4 20h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <rect x="5.5" y="14" width="3" height="6" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
          <rect x="10.5" y="10" width="3" height="10" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
          <rect x="15.5" y="6" width="3" height="14" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
          <path d="m3 10 5-5 4 4 8-8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14 1h6v6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
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
      return null;
    case "handshake":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
          <path d="M3 13.5l5-5 2.5 2L13 8l5.5 5.5-3 3-2-2-2 2-3-3-3.5 2.5L3 13.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round" />
          <path d="m9 7 1.5-1.5 2 1M14 5.5l-1 2.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "doccheck":
      // 書類 + チェック（NTS起点用：補助金制度確認・申請支援を表す）
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
          <path d="M7 4h7l3 3v13H7V4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="m10 12 2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10 17h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "flag":
      // 旗アイコン（ゴール）
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
          <path d="M5 3v18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M5 4h12l-3 5 3 5H5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
      );
  }
}

// ─────────────────────────────────────────────────────────────
// 左：御社 / NTS 入力ブロック（3列グリッド：actor | items | ─合流線側─）
// ─────────────────────────────────────────────────────────────
function SourceBlock({
  label,
  sub1,
  sub2,
  isoImg,
  items,
}: {
  label: string;
  sub1: string;
  sub2: string;
  isoImg: Parameters<typeof Image>[0]["src"];
  items: { text: string; icon: IconKey }[];
}) {
  return (
    /* actor 列 + items 列 を揃えるために幅を固定して flex で並べる */
    <div className="flex items-center gap-5">
      {/* ── actor 列：isometric カード + ラベル（w-[120px] 固定） ── */}
      <div className="flex w-[120px] shrink-0 flex-col items-center gap-1">
        <div className="relative h-[96px] w-[96px] overflow-hidden rounded-2xl border border-[#cdddf0] bg-gradient-to-br from-[#eef4ff] to-white shadow-[0_6px_18px_rgba(26,86,219,0.12)]">
          <Image
            src={isoImg}
            alt=""
            fill
            sizes="96px"
            quality={90}
            className="object-contain p-1.5"
            aria-hidden
          />
        </div>
        <p className="mt-0.5 text-[13px] font-bold text-[#071b46]">{label}</p>
        <p className="text-center text-[10px] font-semibold leading-[1.4] text-[#5a7a9a]">{sub1}</p>
        <p className="text-center text-[10px] font-semibold leading-[1.4] text-[#5a7a9a]">{sub2}</p>
      </div>

      {/* ── items 列：3枚のカード（PC:192px固定, SP:flex-1で伸縮） ── */}
      <ul className="flex flex-1 flex-col gap-[6px] lg:w-[192px] lg:flex-none">
        {items.map((item) => (
          <li
            key={item.text}
            className="flex h-[44px] items-center gap-3 rounded-lg border border-[#d8e6f5] bg-white px-3 shadow-[0_2px_8px_rgba(12,42,72,0.05)]"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#eef4ff] text-[#1a56db]">
              <Icon type={item.icon} className="h-4 w-4" />
            </span>
            <span className="text-[12px] font-semibold leading-tight text-[#1e3a5f]">{item.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 中央：ステップカード（isometric 画像付き）
// ─────────────────────────────────────────────────────────────
function StepCard({
  no,
  tag,
  title,
  sub,
  icon,
  isoImg,
}: {
  no: string;
  tag: string;
  title: string;
  sub: string;
  icon: IconKey;
  isoImg?: Parameters<typeof Image>[0]["src"];
}) {
  return (
    <div className="relative flex flex-col items-center rounded-xl border border-[#cdddf0] bg-white px-3 pb-4 pt-7 shadow-[0_4px_14px_rgba(12,42,72,0.06)] lg:px-4 lg:pb-5 lg:pt-8">
      {/* 番号バッジ */}
      <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex h-7 min-w-[28px] items-center justify-center rounded-full bg-[#1a56db] px-2 text-[11px] font-bold text-white shadow-md">
        {no}
      </span>
      {/* タグ */}
      <span className="mb-1 rounded-full bg-[#eef4ff] px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-[#1a56db]">
        {tag}
      </span>
      {/* isometric 画像 */}
      {isoImg ? (
        <div className="relative mt-1 h-[88px] w-full max-w-[120px]">
          <Image
            src={isoImg}
            alt=""
            fill
            quality={90}
            className="object-contain"
            sizes="120px"
            aria-hidden
          />
        </div>
      ) : (
        <span className="mt-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#eef4ff] text-[#1a56db]">
          <Icon type={icon} className="h-5 w-5" />
        </span>
      )}
      <h4 className="mt-2 text-[13px] font-bold leading-tight text-[#071b46] lg:text-[14px]">{title}</h4>
      <p className="mt-1.5 whitespace-pre-line text-center text-[11px] leading-snug text-[#5a7a9a] lg:text-[11.5px]">{sub}</p>
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
  // StepArrow と同じデザインルール:
  //   点線ライン: stroke="#93c5fd" strokeWidth="2" strokeDasharray="3 3" strokeLinecap="round"
  //   矢じり:     stroke="#1a56db" strokeWidth="2"
  return (
    <svg
      className="h-full w-full"
      viewBox="0 0 80 200"
      preserveAspectRatio="none"
      fill="none"
      aria-hidden
    >
      {/* 御社ブラケット上腕（点線・統一色） */}
      <path
        d="M0 50 H40 V100"
        stroke="#93c5fd"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="3 3"
      />
      {/* NTSブラケット下腕（点線・同一スタイル） */}
      <path
        d="M0 150 H40 V100"
        stroke="#93c5fd"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="3 3"
      />
      {/* 合流→Step01 出口矢印（StepArrow と同トーン） */}
      <path d="M40 100 H72" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 3" />
      <path d="m68 96 4 4-4 4" stroke="#1a56db" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
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
          <ScrollTextReveal
            as="h2"
            id="joint-progress-heading"
            className="font-heading text-3xl font-bold leading-tight text-[var(--text-primary)] md:text-4xl"
          >
            御社の顧客接点に、
            <br />
            NTSの補助金活用支援を加える。
          </ScrollTextReveal>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[var(--text-secondary)] md:text-lg">
            顧客課題の整理から、補助金活用、提案・導入後の伴走まで。
            <br className="hidden md:inline" />
            御社の提案活動をバックアップし、お客様の次の一手を支援します。
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
          {/*
            ┌─────────────────────────┬────────┬────────────────────────────────┐
            │ 左 source（御社/NTS）    │ 合流線 │ 4ステップ（→区切り）            │
            └─────────────────────────┴────────┴────────────────────────────────┘
            左ゾーン幅: actor(120px) + gap(20px) + items(192px) = 332px
          */}
          <div className="grid grid-cols-[332px_64px_1fr] items-center gap-4 xl:grid-cols-[360px_72px_1fr]">
            {/* 左: 御社 / NTS（上下2段、縦gap 48px） */}
            <div className="flex flex-col gap-12">
              <SourceBlock
                label="御社"
                sub1="顧客をよく知る"
                sub2="営業・支援パートナー"
                isoImg={iso16}
                items={PARTNER_LABELS}
              />
              <SourceBlock
                label="NTS"
                sub1="補助金活用と"
                sub2="提案支援の専門パートナー"
                isoImg={iso08}
                items={NTS_LABELS}
              />
            </div>

            {/* 直角合流線 */}
            <div className="h-full min-h-[280px]">
              <MergeConnector />
            </div>

            {/* 中央: 4ステップ + ステップ間矢印 */}
            <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] items-center gap-2 lg:gap-3">
              <StepCard {...STEPS[0]} />
              <StepArrow />
              <StepCard {...STEPS[1]} />
              <StepArrow />
              <StepCard {...STEPS[2]} />
              <StepArrow />
              <StepCard {...STEPS[3]} />
            </div>
          </div>
        </motion.div>

        {/* ── SP 縦構成 ── */}
        <div className="mt-10 space-y-5 lg:hidden">
          <motion.div className="space-y-6 rounded-2xl border border-[#d0e4f6] bg-white/95 p-5" {...reveal(0.06)}>
            <SourceBlock
              label="御社"
              sub1="顧客をよく知る"
              sub2="営業・支援パートナー"
              isoImg={iso16}
              items={PARTNER_LABELS}
            />
            <div className="border-t border-[#e8f0fb]" />
            <SourceBlock
              label="NTS"
              sub1="補助金活用と"
              sub2="提案支援の専門パートナー"
              isoImg={iso08}
              items={NTS_LABELS}
            />
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
              <p className="text-base font-bold text-[#1a56db]">この案件、補助金が使えるか？からご相談ください。</p>
              <p className="mt-1 text-sm leading-relaxed text-[var(--text-secondary)]">
                提案中の案件や、今後の事業計画について、まずは気軽にご相談ください。
              </p>
            </div>
          </div>
          <a
            href="#contact"
            className="nts-cta-primary nts-cta-primary--xl shrink-0 gap-1 px-6 py-3 text-sm focus-visible:ring-2 focus-visible:ring-[#1368d8] focus-visible:ring-offset-2"
          >
            補助金活用の可能性を相談する
            <span aria-hidden>›</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}

"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

// ─────────────────────────────────────────────────────────────
// アニメーション
// ─────────────────────────────────────────────────────────────
const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.1 },
  transition: { duration: 0.55, ease: EASE_OUT, delay },
});

// ─────────────────────────────────────────────────────────────
// データ（左入力）
// ─────────────────────────────────────────────────────────────
const PARTNER_LINES = [
  "お客様との信頼・関係性",
  "現場の相談・経営課題の把握",
  "提案したい商材・サービス",
];
const NTS_LINES = [
  "補助金活用の視点",
  "投資背景の整理",
  "専門家との連携",
];

// ─────────────────────────────────────────────────────────────
// 入口ノードカード（小型・入口感）
// ─────────────────────────────────────────────────────────────
function InputNode({
  label,
  color,
  lines,
}: {
  label: string;
  color: "blue" | "mint";
  lines: string[];
}) {
  const pill =
    color === "blue"
      ? "border-[#b8d4ff] bg-[#eef4ff] text-[#1a56db]"
      : "border-[#a8ddd0] bg-[#edfaf5] text-[#0f6e57]";
  const dot =
    color === "blue" ? "bg-[#1a56db]" : "bg-[#0f9b78]";

  return (
    <div className="rounded-2xl border border-[#d4e4f4] bg-white/90 px-4 py-3.5 shadow-[0_4px_18px_rgba(12,42,72,0.07)]">
      <span className={`inline-flex rounded-full border px-3 py-0.5 text-[11px] font-bold ${pill}`}>
        {label}
      </span>
      <ul className="mt-3 space-y-1.5">
        {lines.map((line) => (
          <li key={line} className="flex items-center gap-2 text-[12.5px] font-semibold text-[#1e3a5f]">
            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />
            {line}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 共同ゾーン（中央）
// ─────────────────────────────────────────────────────────────
const JOINT_KEYWORDS = ["課題を深掘る", "選択肢を広げる", "提案を前へ進める"];
const SUPPORT_TAGS   = ["補助金活用の視点", "投資背景の整理", "専門家との連携"];

function JointZone() {
  return (
    <div className="flex flex-col items-center rounded-[28px] border-2 border-[#1a56db]/20 bg-white/95 px-5 py-6 shadow-[0_8px_32px_rgba(26,86,219,0.09)] sm:px-6">
      {/* ラベル */}
      <p className="text-[11px] font-bold tracking-widest text-[#1a56db]">御社 × NTS</p>
      <h3 className="mt-1 font-heading text-xl font-bold text-[#071b46] sm:text-2xl">
        一緒に深く考える
      </h3>

      {/* キーワード3行 */}
      <div className="mt-5 w-full space-y-2">
        {JOINT_KEYWORDS.map((kw, i) => (
          <div
            key={kw}
            className="flex items-center gap-3 rounded-xl border border-[#d5e4f5] bg-[#f4f8ff] px-4 py-2.5"
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1a56db] text-[11px] font-bold text-white">
              {i + 1}
            </span>
            <p className="text-[13px] font-bold text-[#071b46]">{kw}</p>
          </div>
        ))}
      </div>

      {/* 補助タグ */}
      <div className="mt-4 flex flex-wrap justify-center gap-1.5">
        {SUPPORT_TAGS.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-[#a8ddd0] bg-[#edfaf5] px-2.5 py-1 text-[11px] font-bold text-[#0f6e57]"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 右ゴール（山）
// ─────────────────────────────────────────────────────────────
function MountainGoal({ mobile = false }: { mobile?: boolean }) {
  return (
    <div className={`relative flex flex-col items-center justify-end ${mobile ? "h-[200px]" : "h-[300px] lg:h-[340px]"}`}>
      {/* 装飾背景画像（フェードマスク） */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden
      >
        <div className="absolute inset-0" style={{ maskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.55) 30%, rgba(0,0,0,0.75) 70%, rgba(0,0,0,0.6) 100%)", WebkitMaskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.55) 30%, rgba(0,0,0,0.75) 70%, rgba(0,0,0,0.6) 100%)" }}>
          <Image
            src="/images/nts_partner_progress_destination_bg_v1.png"
            alt=""
            fill
            className="object-contain object-center opacity-75"
            sizes="(max-width: 768px) 300px, 380px"
            priority={false}
          />
        </div>
      </div>
      {/* ラベル */}
      <p className="relative z-10 mb-4 text-center text-[15px] font-bold text-[#071b46] drop-shadow-[0_1px_6px_rgba(255,255,255,0.9)]">
        お客様の前進へ
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PC 共同パス SVG（背景レイヤー）
// ─────────────────────────────────────────────────────────────
// viewBox 座標は図解ステージの実寸に基づく
// Left column (0-240px) → Center (240-640px) → Right (640-960px)
// Stage height = 520px
function DesktopPathSVG() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block"
      viewBox="0 0 960 520"
      preserveAspectRatio="xMidYMid meet"
      fill="none"
      aria-hidden
    >
      <defs>
        {/* 御社ライン: 深いブルー */}
        <linearGradient id="ph-grad-top" x1="210" y1="160" x2="620" y2="260" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1a56db" />
          <stop offset="1" stopColor="#2d77f0" />
        </linearGradient>
        {/* NTS ライン: シアン → ブルー */}
        <linearGradient id="ph-grad-bottom" x1="210" y1="360" x2="620" y2="260" gradientUnits="userSpaceOnUse">
          <stop stopColor="#22c4ef" />
          <stop offset="1" stopColor="#2d77f0" />
        </linearGradient>
        {/* 共同パス: 深いブルー */}
        <linearGradient id="ph-grad-joint" x1="660" y1="260" x2="930" y2="240" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1a56db" />
          <stop offset="1" stopColor="#0b3fa0" />
        </linearGradient>
        {/* 矢印マーカー */}
        <marker id="ph-arrow" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
          <path d="M1 1 L9 5 L1 9Z" fill="#0b3fa0" />
        </marker>
        {/* グロー blur */}
        <filter id="ph-glow">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* 御社ライン（左上→中央合流点） */}
      <path
        d="M210 160 C310 160 380 255 620 260"
        stroke="url(#ph-grad-top)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      {/* NTS ライン（左下→中央合流点） */}
      <path
        d="M210 360 C310 360 380 265 620 260"
        stroke="url(#ph-grad-bottom)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      {/* 合流点ドット */}
      <circle cx="620" cy="260" r="7" fill="#fff" stroke="#1a56db" strokeWidth="3" />

      {/* 共同パス（合流点→山ゴール） */}
      <path
        d="M627 260 C720 255 800 242 930 238"
        stroke="url(#ph-grad-joint)"
        strokeWidth="5"
        strokeLinecap="round"
        markerEnd="url(#ph-arrow)"
      />

      {/* 入口ドット（御社） */}
      <circle cx="210" cy="160" r="5" fill="#1a56db" />
      {/* 入口ドット（NTS） */}
      <circle cx="210" cy="360" r="5" fill="#22c4ef" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// SP 合流矢印
// ─────────────────────────────────────────────────────────────
function MobileMerge() {
  return (
    <div className="flex justify-center py-2" aria-hidden>
      <svg width="64" height="52" viewBox="0 0 64 52" fill="none">
        <path d="M12 4 Q12 26 32 38" stroke="#1a56db" strokeWidth="3" strokeLinecap="round" />
        <path d="M52 4 Q52 26 32 38" stroke="#22c4ef" strokeWidth="3" strokeLinecap="round" />
        <path d="M32 38 V48" stroke="#1a56db" strokeWidth="3" strokeLinecap="round" />
        <path d="M26 43 L32 50 L38 43" stroke="#1a56db" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
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
      {/* 上部フェード */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/70 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">

        {/* ── 見出し・リード ── */}
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

        {/* ── PC 図解ステージ ── */}
        <motion.div
          className="relative mt-12 hidden overflow-hidden rounded-3xl border border-[#d0e2f4] bg-[linear-gradient(160deg,#f8fbff_0%,#eef5fd_100%)] lg:block"
          style={{ minHeight: 520 }}
          {...reveal(0.08)}
        >
          {/* パス SVG（背景レイヤー） */}
          <DesktopPathSVG />

          {/* 前景レイヤー */}
          <div className="relative z-10 grid h-full min-h-[520px] grid-cols-[240px_minmax(480px,1fr)_360px] items-center gap-0 px-6 py-10 xl:grid-cols-[264px_minmax(520px,1fr)_380px] xl:px-8">

            {/* 左: 入口ノード */}
            <div className="space-y-5 pr-6">
              <InputNode label="御社" color="blue" lines={PARTNER_LINES} />
              <InputNode label="NTS"  color="mint" lines={NTS_LINES} />
            </div>

            {/* 中央: 共同ゾーン */}
            <div className="px-4 xl:px-6">
              <JointZone />
            </div>

            {/* 右: ゴール（山） */}
            <div className="flex items-center justify-center pl-2">
              <MountainGoal />
            </div>
          </div>
        </motion.div>

        {/* ── SP 縦構成 ── */}
        <div className="mt-10 space-y-4 lg:hidden">
          <motion.div className="grid gap-4 sm:grid-cols-2" {...reveal(0.06)}>
            <InputNode label="御社" color="blue" lines={PARTNER_LINES} />
            <InputNode label="NTS"  color="mint" lines={NTS_LINES} />
          </motion.div>

          <MobileMerge />

          <motion.div {...reveal(0.1)}>
            <JointZone />
          </motion.div>

          {/* SP 矢印 */}
          <div className="flex justify-center py-1" aria-hidden>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M14 2V22" stroke="#1a56db" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M7 16 L14 24 L21 16" stroke="#1a56db" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <motion.div {...reveal(0.14)}>
            <MountainGoal mobile />
          </motion.div>
        </div>

        {/* ── CTA（図解ステージ外・直下） ── */}
        <motion.div
          className="mt-8 flex flex-col gap-4 rounded-2xl border border-[#d0e2f4] bg-white/95 px-5 py-5 shadow-[0_6px_28px_rgba(12,42,72,0.07)] sm:flex-row sm:items-center sm:justify-between sm:px-6"
          {...reveal(0.16)}
        >
          <div>
            <p className="text-base font-bold text-[#1a56db]">まずは案件のご相談から</p>
            <p className="mt-1 text-sm leading-relaxed text-[var(--text-secondary)]">
              提案中の案件や、今後のご計画についてお気軽にご相談ください。
            </p>
          </div>
          <a
            href="#contact"
            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[#0f3e8d] px-6 py-3 text-sm font-bold text-white shadow-[0_4px_16px_rgba(15,62,141,0.3)] transition hover:bg-[#0c3477] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a56db] focus-visible:ring-offset-2"
          >
            案件のご相談はこちら
          </a>
        </motion.div>

      </div>
    </section>
  );
}

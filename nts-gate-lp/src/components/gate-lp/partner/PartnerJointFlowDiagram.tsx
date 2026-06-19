"use client";

import type { StaticImageData } from "next/image";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import isometricMeet from "../../../../icon-assets/isometric_04.png";
import isometricWin from "../../../../icon-assets/isometric_07.png";
import isometricSupport from "../../../../icon-assets/isometric_06.png";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 },
  transition: { duration: 0.6, ease: EASE_OUT, delay },
});

// ─────────────────────────────────────────────────────────────
// Tone palette（御社中心=グリーン → 協働 → NTS中心=ブルー）
// ─────────────────────────────────────────────────────────────
type Tone = "start" | "win" | "support";

const tonePalette: Record<
  Tone,
  {
    badgeBg: string;
    badgeText: string;
    border: string;
    titleColor: string;
    chipBg: string;
    chipBorder: string;
    chipText: string;
    dot: string;
    glow: string;
  }
> = {
  start: {
    badgeBg: "linear-gradient(135deg, #10b981 0%, #0d9488 100%)",
    badgeText: "#ffffff",
    border: "rgba(16,185,129,0.26)",
    titleColor: "#0f766e",
    chipBg: "linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%)",
    chipBorder: "rgba(16,185,129,0.22)",
    chipText: "#065f46",
    dot: "linear-gradient(135deg, #10b981, #34d399)",
    glow: "rgba(16,185,129,0.10)",
  },
  win: {
    badgeBg: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
    badgeText: "#ffffff",
    border: "rgba(14,165,233,0.30)",
    titleColor: "#0369a1",
    chipBg: "linear-gradient(135deg, #e0f2fe 0%, #ffffff 100%)",
    chipBorder: "rgba(14,165,233,0.22)",
    chipText: "#075985",
    dot: "linear-gradient(135deg, #38bdf8, #0ea5e9)",
    glow: "rgba(14,165,233,0.12)",
  },
  support: {
    badgeBg: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    badgeText: "#ffffff",
    border: "rgba(37,99,235,0.30)",
    titleColor: "#1d4ed8",
    chipBg: "linear-gradient(135deg, #dbeafe 0%, #ffffff 100%)",
    chipBorder: "rgba(37,99,235,0.22)",
    chipText: "#1e3a8a",
    dot: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
    glow: "rgba(37,99,235,0.12)",
  },
};

// ─────────────────────────────────────────────────────────────
// データ定義（大きな3ステップ）
// ─────────────────────────────────────────────────────────────
type Step = {
  number: string;
  label: string;
  role: string;
  tone: Tone;
  title: string;
  description: string;
  items?: string[];
  image: StaticImageData;
  imageAlt: string;
  imageScale?: number;
};

const STEPS: Step[] = [
  {
    number: "01",
    label: "つながる",
    role: "御社 × NTS",
    tone: "start",
    title: "秘密保持契約・面談",
    description:
      "秘密保持契約（NDA）を締結し、御社の経営課題を丁寧にヒアリング。最適な提携先をご紹介し、ご面談の場を設けます。",
    items: ["秘密保持契約の締結", "提携先様とご紹介者様とのご面談"],
    image: isometricMeet,
    imageAlt: "NDAを締結し提携先と面談するイメージ",
    imageScale: 1.04,
  },
  {
    number: "02",
    label: "実現する",
    role: "NTS主導",
    tone: "win",
    title: "補助金申請支援",
    description:
      "御社の課題を把握・明確化した上で最適な制度を選定し、申請から採択まで一貫して伴走します。",
    items: ["最適な補助金制度の提案", "必要書類のサポート"],
    image: isometricWin,
    imageAlt: "補助金申請を支援するイメージ",
    imageScale: 1.08,
  },
  {
    number: "03",
    label: "伴走する",
    role: "御社 × NTS",
    tone: "support",
    title: "中長期の伴走支援",
    description:
      "申請支援で終わりではなく、次の経営課題まで見据えた御社とNTSによる中長期にわたる伴走支援を続けます。",
    items: ["補助金活用の支援", "採択後のフォロー"],
    image: isometricSupport,
    imageAlt: "中長期で伴走支援するイメージ",
    imageScale: 1.04,
  },
];

// ─────────────────────────────────────────────────────────────
// 吹き出しラベル
// ─────────────────────────────────────────────────────────────
const BUBBLE_TIP_COLOR: Record<Tone, string> = {
  start: "#0d9488",
  win: "#0284c7",
  support: "#1d4ed8",
};

function BubbleLabel({ tone, text }: { tone: Tone; text: string }) {
  const palette = tonePalette[tone];
  return (
    <div className="relative inline-flex">
      <span
        className="inline-flex items-center rounded-full px-4 py-1.5 text-[13px] font-black tracking-[0.04em]"
        style={{ background: palette.badgeBg, color: palette.badgeText }}
      >
        {text}
      </span>
      {/* 吹き出しの三角 */}
      <span
        aria-hidden
        className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2"
        style={{
          borderLeft: "6px solid transparent",
          borderRight: "6px solid transparent",
          borderTop: `7px solid ${BUBBLE_TIP_COLOR[tone]}`,
        }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ステップカード
// ─────────────────────────────────────────────────────────────
function StepCard({ step }: { step: Step }) {
  const palette = tonePalette[step.tone];
  return (
    <div className="relative h-full">
      {/* 番号バッジ（カード上端に乗る） */}
      <div className="absolute left-1/2 top-0 z-[3] -translate-x-1/2 -translate-y-1/2">
        <span
          className="flex flex-col items-center justify-center rounded-full px-1 shadow-[0_8px_18px_rgba(15,23,42,0.18)]"
          style={{
            background: palette.badgeBg,
            width: "56px",
            height: "56px",
          }}
        >
          <span className="text-[9px] font-black tracking-[0.12em] text-white/80 leading-none">
            STEP
          </span>
          <span className="text-[18px] font-black text-white leading-tight">
            {step.number}
          </span>
        </span>
      </div>

      <div
        className="flex h-full flex-col overflow-hidden rounded-[22px] bg-white px-5 pb-6 pt-9 transition-all duration-300 hover:-translate-y-[3px]"
        style={{
          border: `1px solid ${palette.border}`,
          boxShadow: `0 22px 48px rgba(15,23,42,0.10), 0 4px 12px ${palette.glow}`,
        }}
      >
        {/* 吹き出しラベル + ロール */}
        <div className="flex flex-col items-center gap-3 pb-2">
          <BubbleLabel tone={step.tone} text={step.label} />
          <span
            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide"
            style={{
              background: palette.chipBg,
              border: `1px solid ${palette.chipBorder}`,
              color: palette.chipText,
            }}
          >
            {step.role}
          </span>
        </div>

        {/* 画像 */}
        <div className="flex items-center justify-center px-2 pt-2">
          <div className="relative h-[150px] w-full max-w-[230px] overflow-visible">
            <Image
              src={step.image}
              alt={step.imageAlt}
              fill
              sizes="230px"
              className="object-contain drop-shadow-[0_16px_24px_rgba(15,23,42,0.12)]"
              style={{ transform: `scale(${step.imageScale ?? 1})` }}
            />
          </div>
        </div>

        {/* タイトル */}
        <h4
          className="mt-4 text-center text-[18px] font-black leading-[1.5]"
          style={{ color: palette.titleColor }}
        >
          {step.title}
        </h4>

        {/* サブ項目（STEP 01 のみ） */}
        {step.items && (
          <div className="mt-3 flex flex-col gap-2">
            {step.items.map((item) => (
              <div key={item}>
                <div
                  className="flex items-center justify-center rounded-[10px] px-3 py-2"
                  style={{
                    background: palette.chipBg,
                    border: `1px solid ${palette.chipBorder}`,
                  }}
                >
                  <span className="text-center text-[12.5px] font-bold leading-tight" style={{ color: palette.chipText }}>
                    {item}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 説明 */}
        <p className="mt-4 text-center text-[13px] leading-[1.8] text-[#4f6f8f]">
          {step.description}
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ステップ間の矢印（PC: 横向き）
// ─────────────────────────────────────────────────────────────
function ArrowDivider() {
  return (
    <div className="flex items-center justify-center" aria-hidden>
      <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
        <path
          d="M6 17h18M18 9l9 8-9 8"
          stroke="url(#flowArrow)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <defs>
          <linearGradient id="flowArrow" x1="6" y1="17" x2="28" y2="17" gradientUnits="userSpaceOnUse">
            <stop stopColor="#14b8a6" />
            <stop offset="1" stopColor="#2563eb" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// メイン
// ─────────────────────────────────────────────────────────────
export default function PartnerJointFlowDiagram() {
  const reduceMotion = useReducedMotion();
  const reveal = (delay: number) => (reduceMotion ? {} : fadeUp(delay));

  return (
    <>
      {/* ═══════════════════════ PC (md以上) 横並び ═══════════════════════ */}
      <div className="relative mt-10 hidden md:block">
        <div
          className="items-stretch"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr auto 1fr",
            gap: "clamp(8px, 1vw, 18px)",
            alignItems: "stretch",
          }}
        >
          {STEPS.map((step, i) => (
            <div key={step.number} className="contents">
              <motion.div {...reveal(0.08 + i * 0.12)} className="relative self-stretch pt-6">
                <StepCard step={step} />
              </motion.div>
              {i < STEPS.length - 1 && (
                <motion.div {...reveal(0.16 + i * 0.12)} className="self-center pt-6">
                  <ArrowDivider />
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════════════════ Mobile (md未満) 縦積み ═══════════════════════ */}
      <div className="mt-8 md:hidden">
        <div className="relative space-y-2 px-1">
          {STEPS.map((step, i) => (
            <div key={step.number}>
              <motion.div {...reveal(0.08 + i * 0.08)} className="pt-6">
                <StepCard step={step} />
              </motion.div>
              {i < STEPS.length - 1 && (
                <div className="flex justify-center pt-2" aria-hidden>
                  <svg width="26" height="30" viewBox="0 0 26 30" fill="none">
                    <path
                      d="M13 4v18M5 14l8 8 8-8"
                      stroke="url(#flowArrowV)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <defs>
                      <linearGradient id="flowArrowV" x1="13" y1="4" x2="13" y2="22" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#14b8a6" />
                        <stop offset="1" stopColor="#2563eb" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

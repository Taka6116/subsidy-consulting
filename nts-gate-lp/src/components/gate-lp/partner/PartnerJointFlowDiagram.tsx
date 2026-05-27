"use client";

import { motion, useReducedMotion } from "framer-motion";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.1 },
  transition: { duration: 0.55, ease: EASE_OUT, delay },
});

// ─────────────────────────────────────────────────────────────
// Icons (シンプルなインラインSVG)
// ─────────────────────────────────────────────────────────────
type IconKey = "people" | "chat" | "site" | "search" | "talk" | "stack" | "compass";

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
    case "site":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
          <path d="M4 20h16M6 20V10h4v10M14 20V6h4v14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "search":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
          <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.8" />
          <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "talk":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
          <path d="M4 6h11v8H9l-5 4V6Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
          <path d="M9 10h6M20 16v-6h-3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      );
    case "stack":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
          <rect x="4" y="4" width="7" height="7" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
          <rect x="13" y="4" width="7" height="7" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
          <rect x="4" y="13" width="7" height="7" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
          <rect x="13" y="13" width="7" height="7" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        </svg>
      );
    case "compass":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
          <path d="m9 15 2-5 5-2-2 5-5 2Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        </svg>
      );
  }
}

// ─────────────────────────────────────────────────────────────
// データ定義
// ─────────────────────────────────────────────────────────────
const entryItems: { text: string; icon: IconKey }[] = [
  { text: "顧客接点", icon: "people" },
  { text: "商談", icon: "chat" },
  { text: "現場課題", icon: "site" },
];

type Tone = "partner" | "mixed-partner" | "mixed-nts" | "nts";

type ProcessStep = {
  number: string;
  role: string;
  title: string;
  description: string;
  tone: Tone;
  ratioLabel: string;
  icon: IconKey;
};

const processSteps: ProcessStep[] = [
  {
    number: "01",
    role: "御社",
    title: "課題を見つける",
    description: "顧客接点から商談や現場の課題を捉える",
    tone: "partner",
    ratioLabel: "御社 100%",
    icon: "search",
  },
  {
    number: "02",
    role: "御社 × NTS",
    title: "一緒に課題を深掘る",
    description: "対話を通じて本質的な課題を整理する",
    tone: "mixed-partner",
    ratioLabel: "御社 50% / NTS 50%",
    icon: "talk",
  },
  {
    number: "03",
    role: "NTS主導",
    title: "補助金の選択肢を提示する",
    description: "活用可能性を整理し、提案の幅を広げる",
    tone: "mixed-nts",
    ratioLabel: "御社 30% / NTS 70%",
    icon: "stack",
  },
  {
    number: "04",
    role: "NTS",
    title: "成約後も伴走する",
    description: "導入後の次の一手まで支援する",
    tone: "nts",
    ratioLabel: "NTS 100%",
    icon: "compass",
  },
];

// ─────────────────────────────────────────────────────────────
// Tone palette
// ─────────────────────────────────────────────────────────────
const tonePalette: Record<Tone, {
  badgeBg: string;
  badgeText: string;
  border: string;
  iconBg: string;
  iconText: string;
  topAccent: string; // カード上端のアクセントライン
}> = {
  partner: {
    badgeBg: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    badgeText: "#ffffff",
    border: "rgba(16,185,129,0.25)",
    iconBg: "linear-gradient(135deg, #d1fae5 0%, #ecfdf5 100%)",
    iconText: "#059669",
    topAccent: "linear-gradient(90deg, #10b981, #34d399)",
  },
  "mixed-partner": {
    badgeBg: "linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)",
    badgeText: "#ffffff",
    border: "rgba(20,184,166,0.25)",
    iconBg: "linear-gradient(135deg, #ccfbf1 0%, #f0fdfa 100%)",
    iconText: "#0d9488",
    topAccent: "linear-gradient(90deg, #14b8a6, #06b6d4)",
  },
  "mixed-nts": {
    badgeBg: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
    badgeText: "#ffffff",
    border: "rgba(14,165,233,0.28)",
    iconBg: "linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%)",
    iconText: "#0284c7",
    topAccent: "linear-gradient(90deg, #06b6d4, #3b82f6)",
  },
  nts: {
    badgeBg: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    badgeText: "#ffffff",
    border: "rgba(37,99,235,0.3)",
    iconBg: "linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%)",
    iconText: "#1d4ed8",
    topAccent: "linear-gradient(90deg, #3b82f6, #1d4ed8)",
  },
};

// ─────────────────────────────────────────────────────────────
// 入口カード（御社）
// ─────────────────────────────────────────────────────────────
function EntryCard() {
  return (
    <div
      className="relative flex flex-col overflow-hidden rounded-[20px] bg-white transition-all duration-300 hover:-translate-y-1"
      style={{
        border: "1px solid rgba(16,185,129,0.28)",
        boxShadow: "0 20px 44px rgba(15,23,42,0.10), 0 4px 12px rgba(16,185,129,0.08)",
      }}
    >
      {/* 上端アクセント */}
      <div
        className="h-[6px] w-full"
        style={{ background: "linear-gradient(90deg, #10b981 0%, #34d399 100%)" }}
        aria-hidden
      />
      {/* ヘッダー */}
      <div
        className="flex items-center justify-center gap-2 px-4 py-3"
        style={{
          background: "linear-gradient(180deg, rgba(236,253,245,0.95) 0%, rgba(240,253,250,0.7) 100%)",
          borderBottom: "1px solid rgba(16,185,129,0.14)",
        }}
      >
        <span className="text-[15px] font-black tracking-[0.12em] text-[#065f46]">御社</span>
      </div>
      {/* 本体 */}
      <div className="flex flex-col gap-2 p-4">
        {entryItems.map((item) => (
          <div
            key={item.text}
            className="flex items-center gap-3 rounded-[10px] px-3 py-2.5"
            style={{
              background: "linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%)",
              border: "1px solid rgba(16,185,129,0.18)",
            }}
          >
            <span
              className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-md"
              style={{
                background: "linear-gradient(135deg, #d1fae5, #ecfdf5)",
                color: "#059669",
              }}
            >
              <Icon type={item.icon} className="h-[15px] w-[15px]" />
            </span>
            <span className="text-[13px] font-bold leading-tight text-[#064e3b]">{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ステップカード
// ─────────────────────────────────────────────────────────────
function StepCard({ step }: { step: ProcessStep }) {
  const palette = tonePalette[step.tone];
  return (
    <div
      className="relative flex flex-col overflow-hidden rounded-[20px] bg-white transition-all duration-300 hover:-translate-y-[3px]"
      style={{
        border: `1px solid ${palette.border}`,
        boxShadow: "0 20px 44px rgba(15,23,42,0.10), 0 4px 12px rgba(15,23,42,0.04)",
      }}
    >
      {/* 上端アクセントライン */}
      <div
        className="h-[6px] w-full"
        style={{ background: palette.topAccent }}
        aria-hidden
      />
      {/* バッジ + 番号 */}
      <div className="flex items-center justify-between gap-2 px-3.5 pt-3.5">
        <span
          className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide"
          style={{ background: palette.badgeBg, color: palette.badgeText }}
        >
          {step.role}
        </span>
        <span
          className="font-heading text-[18px] font-black leading-none"
          style={{ color: palette.iconText }}
        >
          {step.number}
        </span>
      </div>
      {/* 本体 */}
      <div className="flex flex-1 flex-col items-center px-4 pb-4 pt-3 text-center">
        <span
          className="mb-3 flex h-[44px] w-[44px] items-center justify-center rounded-xl"
          style={{ background: palette.iconBg, color: palette.iconText }}
        >
          <Icon type={step.icon} className="h-[22px] w-[22px]" />
        </span>
        <h4 className="line-clamp-2 h-[44px] text-[14px] font-bold leading-[1.55] text-[#071b46]">
          {step.title}
        </h4>
        <p className="mt-1.5 line-clamp-2 h-[34px] text-[11.5px] leading-[1.55] text-[#5a7a9a]">
          {step.description}
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 太いグラデーション矢印（背面に敷く）
// ─────────────────────────────────────────────────────────────
function ThickGradientArrow() {
  return (
    <div
      className="pointer-events-none absolute left-0 right-0 z-0 flex items-center"
      style={{
        top: "50%",
        transform: "translateY(-50%)",
        height: "clamp(52px, 5.5vw, 88px)",
      }}
      aria-hidden
    >
      <div className="relative h-full w-full">
        {/* 帯本体（右端を矢印形状にclip） */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, #10b981 0%, #14b8a6 22%, #06b6d4 48%, #3b82f6 74%, #1d4ed8 100%)",
            clipPath:
              "polygon(0% 22%, calc(100% - 64px) 22%, calc(100% - 64px) 0%, 100% 50%, calc(100% - 64px) 100%, calc(100% - 64px) 78%, 0% 78%)",
            opacity: 0.92,
            filter: "drop-shadow(0 12px 28px rgba(37,99,235,0.18))",
          }}
        />
        {/* 上にうっすらハイライト（立体感） */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0) 50%)",
            clipPath:
              "polygon(0% 22%, calc(100% - 64px) 22%, calc(100% - 64px) 0%, 100% 50%, calc(100% - 64px) 100%, calc(100% - 64px) 78%, 0% 78%)",
            pointerEvents: "none",
          }}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// レジェンド（凡例）
// ─────────────────────────────────────────────────────────────
function Legend() {
  return (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11.5px]">
      <span className="flex items-center gap-2">
        <span
          className="inline-block h-2.5 w-8 rounded-full"
          style={{ background: "linear-gradient(90deg, #10b981, #34d399)" }}
        />
        <span className="font-semibold text-[#065f46]">御社の関与が中心</span>
      </span>
      <span className="flex items-center gap-2 text-[#94a3b8]">
        <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden>
          <path d="M1 5h11M9 1l4 4-4 4" stroke="#94a3b8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="flex items-center gap-2">
        <span
          className="inline-block h-2.5 w-8 rounded-full"
          style={{ background: "linear-gradient(90deg, #3b82f6, #1d4ed8)" }}
        />
        <span className="font-semibold text-[#1e3a8a]">NTSの関与が中心</span>
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 横断ラベル（カード上のミニラベル）
// ─────────────────────────────────────────────────────────────
function SpanLabel() {
  return (
    <div className="mb-4 flex items-center justify-center gap-3 px-2">
      <div
        className="h-px flex-1"
        style={{ background: "linear-gradient(to right, transparent, rgba(37,99,235,0.22))" }}
      />
      <span className="shrink-0 text-[12px] font-bold tracking-[0.1em] text-[#1a56db]">
        御社の信頼・顧客接点 × NTSの専門知見で、課題発見から提案後まで支援
      </span>
      <div
        className="h-px flex-1"
        style={{ background: "linear-gradient(to left, transparent, rgba(37,99,235,0.22))" }}
      />
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
      <div
        className="relative mt-8 hidden md:block"
        style={{
          width: "min(1680px, calc(100vw - clamp(32px, 7vw, 120px)))",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        <motion.div {...reveal(0.05)}>
          <SpanLabel />
        </motion.div>

        {/* Flow canvas */}
        <div
          className="relative"
          style={{
            paddingTop: "clamp(20px, 2vw, 40px)",
            paddingBottom: "clamp(20px, 2vw, 40px)",
          }}
        >
          {/* 太いグラデーション矢印（背面） */}
          <ThickGradientArrow />

          {/* カード列（前面） */}
          <div
            className="relative z-[1] grid items-stretch"
            style={{
              gridTemplateColumns:
                "clamp(250px, 18vw, 320px) repeat(4, minmax(0, 1fr))",
              gap: "clamp(24px, 3vw, 56px)",
            }}
          >
            <motion.div {...reveal(0.1)} className="self-stretch">
              <EntryCard />
            </motion.div>
            {processSteps.map((step, i) => (
              <motion.div
                key={step.number}
                {...reveal(0.18 + i * 0.07)}
                className="self-stretch"
              >
                <StepCard step={step} />
              </motion.div>
            ))}
          </div>
        </div>

        <Legend />
      </div>

      {/* ═══════════════════════ Mobile (md未満) 縦積み ═══════════════════════ */}
      <div className="mt-6 md:hidden">
        <motion.div {...reveal(0.05)}>
          <div className="mb-4 px-2 text-center">
            <span className="text-[11.5px] font-bold tracking-[0.08em] text-[#1a56db]">
              御社の信頼・顧客接点 × NTSの専門知見で、
              <br />
              課題発見から提案後まで支援
            </span>
          </div>
        </motion.div>

        <div className="relative space-y-3 px-2">
          {/* 入口カード */}
          <motion.div {...reveal(0.08)}>
            <EntryCard />
          </motion.div>

          {/* 縦の太いグラデーションライン */}
          <div className="flex justify-center" aria-hidden>
            <div
              className="my-1 h-8 w-[6px] rounded-full"
              style={{
                background:
                  "linear-gradient(180deg, #10b981 0%, #14b8a6 50%, #06b6d4 100%)",
              }}
            />
          </div>

          {processSteps.map((step, i) => (
            <div key={step.number}>
              <motion.div {...reveal(0.12 + i * 0.05)}>
                <StepCard step={step} />
              </motion.div>
              {i < processSteps.length - 1 && (
                <div className="flex justify-center" aria-hidden>
                  <div
                    className="my-1 h-8 w-[6px] rounded-full"
                    style={{
                      background:
                        i === 0
                          ? "linear-gradient(180deg, #14b8a6, #06b6d4)"
                          : i === 1
                            ? "linear-gradient(180deg, #06b6d4, #3b82f6)"
                            : "linear-gradient(180deg, #3b82f6, #1d4ed8)",
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <Legend />
      </div>
    </>
  );
}

"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.1 },
  transition: { duration: 0.55, ease: EASE_OUT, delay },
});

// ─────────────────────────────────────────────────────────────
// データ定義
// ─────────────────────────────────────────────────────────────
type Tone = "partner" | "mixed-partner" | "mixed-nts" | "nts";

type ProcessStep = {
  number: string;
  role: string;
  title: string;
  description: string;
  tone: Tone;
  image: string;
  imageAlt: string;
  imageScale?: number;
};

const ENTRY_IMAGE = {
  src: "/images/hero-digital-platform.png",
  alt: "御社の顧客接点から課題を見つけるイメージ",
};

const entryItems = ["顧客接点", "商談", "現場課題"];

const processSteps: ProcessStep[] = [
  {
    number: "01",
    role: "御社",
    title: "課題を見つける",
    description: "顧客接点から商談や現場の課題を捉える",
    tone: "partner",
    image: "/icon-assets/subsidy-lp/advisor.png",
    imageAlt: "顧客課題を見つける相談イメージ",
    imageScale: 1.18,
  },
  {
    number: "02",
    role: "御社 × NTS",
    title: "一緒に課題を深掘る",
    description: "対話を通じて本質的な課題を整理する",
    tone: "mixed-partner",
    image: "/icon-assets/subsidy-lp/meeting-wide.png",
    imageAlt: "御社とNTSが一緒に課題を深掘る会議イメージ",
    imageScale: 1.45,
  },
  {
    number: "03",
    role: "NTS主導",
    title: "補助金の選択肢を提示する",
    description: "活用可能性を整理し、提案の幅を広げる",
    tone: "mixed-nts",
    image: "/icon-assets/subsidy-lp/hero-consulting.png",
    imageAlt: "補助金の選択肢を提示するイメージ",
    imageScale: 1.42,
  },
  {
    number: "04",
    role: "NTS",
    title: "成約後も伴走する",
    description: "導入後の次の一手まで支援する",
    tone: "nts",
    image: "/icon-assets/subsidy-lp/handshake.png",
    imageAlt: "成約後も伴走するイメージ",
    imageScale: 1.18,
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
  topAccent: string;
  numberBg: string;
}> = {
  partner: {
    badgeBg: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    badgeText: "#ffffff",
    border: "rgba(16,185,129,0.25)",
    iconBg: "linear-gradient(135deg, #d1fae5 0%, #ecfdf5 100%)",
    iconText: "#059669",
    topAccent: "linear-gradient(90deg, #10b981, #34d399)",
    numberBg: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
  },
  "mixed-partner": {
    badgeBg: "linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)",
    badgeText: "#ffffff",
    border: "rgba(20,184,166,0.25)",
    iconBg: "linear-gradient(135deg, #ccfbf1 0%, #f0fdfa 100%)",
    iconText: "#0d9488",
    topAccent: "linear-gradient(90deg, #14b8a6, #06b6d4)",
    numberBg: "linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)",
  },
  "mixed-nts": {
    badgeBg: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
    badgeText: "#ffffff",
    border: "rgba(14,165,233,0.28)",
    iconBg: "linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%)",
    iconText: "#0284c7",
    topAccent: "linear-gradient(90deg, #06b6d4, #3b82f6)",
    numberBg: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
  },
  nts: {
    badgeBg: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    badgeText: "#ffffff",
    border: "rgba(37,99,235,0.3)",
    iconBg: "linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%)",
    iconText: "#1d4ed8",
    topAccent: "linear-gradient(90deg, #3b82f6, #1d4ed8)",
    numberBg: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
  },
};

// ─────────────────────────────────────────────────────────────
// 入口カード（御社）
// ─────────────────────────────────────────────────────────────
function EntryCard() {
  return (
    <div className="relative h-full" style={{ paddingTop: "22px" }}>
      <div
        className="flex min-h-[340px] h-full flex-col overflow-hidden rounded-[20px] bg-white transition-all duration-300 hover:-translate-y-[3px]"
        style={{
          border: "1px solid rgba(16,185,129,0.26)",
          boxShadow: "0 20px 44px rgba(15,23,42,0.10), 0 4px 12px rgba(16,185,129,0.06)",
        }}
      >
        <div
          className="h-[6px] w-full"
          style={{ background: "linear-gradient(90deg, #10b981 0%, #34d399 100%)" }}
          aria-hidden
        />

        <div
          className="flex items-center justify-center px-4 py-3"
          style={{
            background: "linear-gradient(180deg, rgba(236,253,245,0.95) 0%, rgba(240,253,250,0.7) 100%)",
            borderBottom: "1px solid rgba(16,185,129,0.14)",
          }}
        >
          <span className="text-[15px] font-black tracking-[0.12em] text-[#065f46]">
            御社
          </span>
        </div>

        <div className="flex items-center justify-center px-4 pt-5">
          <div className="relative h-[135px] w-full max-w-[230px] overflow-visible">
            <Image
              src={ENTRY_IMAGE.src}
              alt={ENTRY_IMAGE.alt}
              fill
              sizes="230px"
              className="object-contain drop-shadow-[0_16px_24px_rgba(15,23,42,0.12)]"
              style={{ transform: "scale(1.08)" }}
            />
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-2 px-4 pb-4">
          {entryItems.map((item) => (
            <div
              key={item}
              className="flex items-center gap-3 rounded-[10px] px-3 py-2.5"
              style={{
                background: "linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%)",
                border: "1px solid rgba(16,185,129,0.18)",
              }}
            >
              <span
                className="h-[10px] w-[10px] shrink-0 rounded-full"
                style={{ background: "linear-gradient(135deg, #10b981, #34d399)" }}
                aria-hidden
              />
              <span className="text-[13px] font-bold leading-tight text-[#064e3b]">
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ステップカード（番号バッジがカード上端に乗る）
// ─────────────────────────────────────────────────────────────
function StepCard({ step }: { step: ProcessStep }) {
  const palette = tonePalette[step.tone];
  return (
    <div className="relative h-full" style={{ paddingTop: "22px" }}>
      {/* 丸い番号バッジ（中央上端に乗る） */}
      <div
        className="absolute left-1/2 top-0 z-10 flex h-[44px] w-[44px] -translate-x-1/2 items-center justify-center rounded-full"
        style={{
          background: palette.numberBg,
          boxShadow: "0 4px 16px rgba(0,0,0,0.18), 0 1px 4px rgba(0,0,0,0.10)",
        }}
        aria-hidden
      >
        <span className="text-[15px] font-black leading-none text-white">{step.number}</span>
      </div>

      {/* カード本体 */}
      <div
        className="flex min-h-[340px] h-full flex-col overflow-hidden rounded-[20px] bg-white transition-all duration-300 hover:-translate-y-[3px]"
        style={{
          border: `1px solid ${palette.border}`,
          boxShadow: "0 20px 44px rgba(15,23,42,0.10), 0 4px 12px rgba(15,23,42,0.04)",
        }}
      >
        {/* 上端アクセントライン */}
        <div className="h-[6px] w-full" style={{ background: palette.topAccent }} aria-hidden />

        {/* ロールバッジ */}
        <div className="flex items-center justify-center px-3.5 pt-4">
          <span
            className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide"
            style={{ background: palette.badgeBg, color: palette.badgeText }}
          >
            {step.role}
          </span>
        </div>

        {/* 画像 + テキストエリア */}
        <div className="flex flex-1 flex-col items-center px-4 pb-5 pt-4 text-center">
          <div className="relative mb-3 h-[150px] w-full overflow-visible">
            <Image
              src={step.image}
              alt={step.imageAlt}
              fill
              sizes="260px"
              className="object-contain drop-shadow-[0_16px_24px_rgba(15,23,42,0.12)]"
              style={{ transform: `scale(${step.imageScale ?? 1})` }}
            />
          </div>

          <h4
            className="line-clamp-2 text-[15px] font-black leading-[1.55]"
            style={{ color: palette.iconText }}
          >
            {step.title}
          </h4>

          <p className="mt-2 line-clamp-2 text-[12px] leading-[1.65] text-[#4f6f8f]">
            {step.description}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 太いグラデーション矢印（背面に敷く）
// ─────────────────────────────────────────────────────────────
function ThickGradientArrow() {
  const sharedClip =
    "polygon(0 22%, calc(100% - 92px) 22%, calc(100% - 92px) 0, 100% 50%, calc(100% - 92px) 100%, calc(100% - 92px) 78%, 0 78%)";

  const sharedRect = {
    left: "clamp(270px, 17vw, 330px)",
    right: "-72px",
    top: "50%",
    height: "clamp(74px, 6vw, 104px)",
    transform: "translateY(-50%)",
  } as const;

  return (
    <>
      {/* 本体グラデーション帯 */}
      <div
        className="pointer-events-none absolute z-0"
        aria-hidden
        style={{
          ...sharedRect,
          background:
            "linear-gradient(90deg, #20c58e 0%, #1fc5b7 38%, #248fe8 70%, #135be8 100%)",
          clipPath: sharedClip,
          opacity: 0.96,
          filter: "drop-shadow(0 16px 30px rgba(37,99,235,0.24))",
        }}
      />
      {/* 上面ハイライト（立体感） */}
      <div
        className="pointer-events-none absolute z-0"
        aria-hidden
        style={{
          ...sharedRect,
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0) 50%)",
          clipPath: sharedClip,
        }}
      />
    </>
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
// 横断ラベル（コピー + サブコピー）
// ─────────────────────────────────────────────────────────────
function SpanLabel() {
  return (
    <div className="mb-5 flex flex-col items-center gap-1 px-2">
      <div className="flex w-full items-center justify-center gap-3">
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
      <span className="text-[11px] font-medium tracking-wide text-[#64748b]">
        紹介後も、NTSが伴走します
      </span>
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
            paddingTop: "clamp(36px, 3.5vw, 58px)",
            paddingBottom: "clamp(24px, 2.4vw, 46px)",
          }}
        >
          {/* 太いグラデーション矢印（背面 z-0） */}
          <ThickGradientArrow />

          {/* カード列（前面 z-1） */}
          <div
            className="relative z-[1] grid items-stretch"
            style={{
              gridTemplateColumns:
                "clamp(270px, 17vw, 330px) repeat(4, clamp(220px, 14vw, 270px))",
              gap: "clamp(26px, 2.7vw, 52px)",
            }}
          >
            <motion.div {...reveal(0.08)} className="self-stretch">
              <EntryCard />
            </motion.div>

            {processSteps.map((step, i) => (
              <motion.div
                key={step.number}
                {...reveal(0.14 + i * 0.07)}
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
            <p className="mt-1 text-[10.5px] text-[#64748b]">紹介後も、NTSが伴走します</p>
          </div>
        </motion.div>

        <div className="relative space-y-3 px-2">
          {/* 入口カード（Mobile） */}
          <motion.div {...reveal(0.08)}>
            <EntryCard />
          </motion.div>

          <div className="flex justify-center" aria-hidden>
            <div
              className="my-2 h-8 w-[6px] rounded-full"
              style={{ background: "linear-gradient(180deg, #10b981 0%, #14b8a6 100%)" }}
            />
          </div>

          {processSteps.map((step, i) => {
            const palette = tonePalette[step.tone];
            return (
              <div key={step.number}>
                <motion.div {...reveal(0.12 + i * 0.05)}>
                  <div
                    className="flex flex-col overflow-hidden rounded-[20px] bg-white"
                    style={{
                      border: `1px solid ${palette.border}`,
                      boxShadow: "0 16px 36px rgba(15,23,42,0.09)",
                    }}
                  >
                    <div className="h-[5px] w-full" style={{ background: palette.topAccent }} aria-hidden />
                    <div className="flex items-center gap-3 px-4 pt-3.5 pb-2">
                      <div
                        className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full"
                        style={{
                          background: palette.numberBg,
                          boxShadow: "0 3px 10px rgba(0,0,0,0.15)",
                        }}
                      >
                        <span className="text-[13px] font-black text-white">{step.number}</span>
                      </div>
                      <span
                        className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold"
                        style={{ background: palette.badgeBg, color: palette.badgeText }}
                      >
                        {step.role}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 px-4 pb-4">
                      <div className="relative h-[96px] w-[112px] shrink-0 overflow-visible">
                        <Image
                          src={step.image}
                          alt={step.imageAlt}
                          fill
                          sizes="112px"
                          className="object-contain drop-shadow-[0_10px_18px_rgba(15,23,42,0.10)]"
                          style={{ transform: `scale(${step.imageScale ?? 1})` }}
                        />
                      </div>
                      <div>
                        <h4 className="text-[14px] font-bold leading-[1.5] text-[#071b46]">{step.title}</h4>
                        <p className="mt-1 text-[11.5px] leading-[1.5] text-[#5a7a9a]">{step.description}</p>
                      </div>
                    </div>
                  </div>
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
            );
          })}
        </div>

        <Legend />
      </div>
    </>
  );
}

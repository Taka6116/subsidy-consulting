"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import PANA3025 from "../../../../icon-assets/PANA3025.webp";
import PANA2727 from "../../../../icon-assets/PANA2727.webp";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.1 },
  transition: { duration: 0.55, ease: EASE_OUT, delay },
});

// ─── 左入力データ ───────────────────────────────────────────
const PARTNER_BRANCHES = [
  { text: "お客様との信頼・関係性", icon: "people" as const },
  { text: "現場の相談・経営課題の把握", icon: "chat" as const },
  { text: "提案したい商材・サービス", icon: "chart" as const },
];
const NTS_BRANCHES = [
  { text: "補助金制度の知見・最新情報", icon: "bulb" as const },
  { text: "活用戦略の設計力・投資判断", icon: "doc" as const },
  { text: "専門家ネットワーク・実行支援", icon: "net" as const },
];

const MAIN_CARDS = [
  {
    title: "課題の深掘り",
    icon: "dig" as const,
    items: ["本質的な課題の特定", "制約条件の整理", "投資背景の確認"],
  },
  {
    title: "解決の選択肢を広げる",
    icon: "expand" as const,
    items: ["解決アプローチの検討", "優先順位の整理", "実現可能性の評価"],
  },
  {
    title: "提案の質を高める",
    icon: "quality" as const,
    items: ["ストーリーの構築", "効果・メリットの最大化", "意思決定の後押し"],
  },
];

const SUPPORT_PILLS = [
  { title: "補助金活用の視点", sub: "活用可能性・制度マッチング", icon: "leaf" as const },
  { title: "投資背景の整理", sub: "投資計画・効果の可視化", icon: "coin" as const },
  { title: "専門家との連携", sub: "行政書士等・申請実行支援", icon: "team" as const },
];

// ─── 小アイコン ─────────────────────────────────────────────
function MiniIcon({ type }: { type: string }) {
  const c = "h-4 w-4";
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#eef4ff] text-[#1a56db]">
      {type === "people" && (
        <svg viewBox="0 0 24 24" className={c} fill="none" aria-hidden>
          <circle cx="9" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.6" />
          <path d="M4 18c.6-2.5 2.5-4 5-4s4.4 1.5 5 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      )}
      {type === "chat" && (
        <svg viewBox="0 0 24 24" className={c} fill="none" aria-hidden>
          <path d="M5 6h14v8H10L5 17V6Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      )}
      {type === "chart" && (
        <svg viewBox="0 0 24 24" className={c} fill="none" aria-hidden>
          <path d="M6 18V10M12 18V6M18 18v-8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M4 19h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      )}
      {type === "bulb" && (
        <svg viewBox="0 0 24 24" className={c} fill="none" aria-hidden>
          <path d="M12 4a5 5 0 0 0-3 9v2h6v-2a5 5 0 0 0-3-9Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M10 20h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      )}
      {type === "doc" && (
        <svg viewBox="0 0 24 24" className={c} fill="none" aria-hidden>
          <path d="M7 4h7l3 3v13H7V4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      )}
      {type === "net" && (
        <svg viewBox="0 0 24 24" className={c} fill="none" aria-hidden>
          <circle cx="12" cy="5" r="2" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="5" cy="19" r="2" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="19" cy="19" r="2" stroke="currentColor" strokeWidth="1.6" />
          <path d="M12 7v3M10 11 6 17M14 11l4 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      )}
      {type === "dig" && (
        <svg viewBox="0 0 24 24" className={c} fill="none" aria-hidden>
          <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.6" />
          <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      )}
      {type === "expand" && (
        <svg viewBox="0 0 24 24" className={c} fill="none" aria-hidden>
          <path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <rect x="4" y="4" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      )}
      {type === "quality" && (
        <svg viewBox="0 0 24 24" className={c} fill="none" aria-hidden>
          <path d="M6 18V8l6-4 6 4v10" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M9 18v-5h6v5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      )}
      {type === "leaf" && (
        <svg viewBox="0 0 24 24" className={c} fill="none" aria-hidden>
          <path d="M12 4c-4 6-4 10 0 16 4-6 4-10 0-16Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      )}
      {type === "coin" && (
        <svg viewBox="0 0 24 24" className={c} fill="none" aria-hidden>
          <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.6" />
          <path d="M12 8v8M9 10h6M9 14h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      )}
      {type === "team" && (
        <svg viewBox="0 0 24 24" className={c} fill="none" aria-hidden>
          <circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="17" cy="10" r="2" stroke="currentColor" strokeWidth="1.6" />
          <path d="M3 19c.7-2.8 2.6-4.5 6-4.5s5.3 1.7 6 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      )}
    </span>
  );
}

// ─── 左：起点ノード + 枝ラベル ───────────────────────────────
function SourceCluster({
  variant,
}: {
  variant: "partner" | "nts";
}) {
  const isPartner = variant === "partner";
  const branches = isPartner ? PARTNER_BRANCHES : NTS_BRANCHES;

  return (
    <div className="flex items-start gap-3">
      {/* 円形起点 */}
      <div className="flex shrink-0 flex-col items-center">
        <div
          className={`flex h-[72px] w-[72px] items-center justify-center rounded-full border-2 shadow-[0_8px_24px_rgba(26,86,219,0.12)] ${
            isPartner
              ? "border-[#b8d4ff] bg-gradient-to-br from-[#eef4ff] to-white"
              : "border-[#a8ddd0] bg-gradient-to-br from-[#edfaf5] to-white"
          }`}
        >
          {isPartner ? (
            <svg viewBox="0 0 32 32" className="h-9 w-9 text-[#1a56db]" fill="none" aria-hidden>
              <path d="M6 26V12l10-7 10 7v14H6Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              <path d="M13 26v-8h6v8" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            </svg>
          ) : (
            <span className="text-[15px] font-black tracking-tight text-[#0f6e57]">NTS</span>
          )}
        </div>
        <p className="mt-2 text-[15px] font-bold text-[#071b46]">{isPartner ? "御社" : "NTS"}</p>
        <p className="text-[11px] font-semibold text-[#5a7a9a]">
          {isPartner ? "お客様との関係" : "支援の専門性"}
        </p>
      </div>

      {/* 枝ラベル */}
      <ul className="flex flex-1 flex-col justify-center gap-2 pt-1">
        {branches.map((b) => (
          <li
            key={b.text}
            className="flex items-center gap-2 rounded-lg border border-[#d8e6f5] bg-white/90 px-2.5 py-1.5 shadow-[0_2px_8px_rgba(12,42,72,0.05)]"
          >
            <MiniIcon type={b.icon} />
            <span className="text-[11.5px] font-semibold leading-tight text-[#1e3a5f]">{b.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── 中央：主カード ─────────────────────────────────────────
function MainJointCard({
  title,
  icon,
  items,
}: {
  title: string;
  icon: string;
  items: string[];
}) {
  return (
    <div className="rounded-xl border border-[#cdddf0] bg-white px-3 py-3 shadow-[0_4px_16px_rgba(12,42,72,0.06)]">
      <div className="flex items-center gap-2 border-b border-[#e8f0fa] pb-2">
        <MiniIcon type={icon} />
        <h4 className="text-[12.5px] font-bold leading-tight text-[#071b46]">{title}</h4>
      </div>
      <ul className="mt-2 space-y-1">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-1.5 text-[11px] leading-snug text-[#3d5a78]">
            <span className="mt-[5px] h-1 w-1 shrink-0 rounded-full bg-[#1a56db]" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── PC：SVG流線（背景レイヤー） ────────────────────────────
function DesktopFlowSVG() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block"
      viewBox="0 0 1200 500"
      preserveAspectRatio="xMidYMid meet"
      fill="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="ph-partner" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1a56db" />
          <stop offset="100%" stopColor="#3d8fe8" />
        </linearGradient>
        <linearGradient id="ph-nts" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#22c4ef" />
          <stop offset="100%" stopColor="#3d8fe8" />
        </linearGradient>
        <linearGradient id="ph-joint" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1a56db" />
          <stop offset="100%" stopColor="#0b3fa0" />
        </linearGradient>
        <filter id="ph-glow">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <marker id="ph-arr" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
          <path d="M0 0 L10 5 L0 10 Z" fill="#0b3fa0" />
        </marker>
      </defs>

      {/* グロー下線 */}
      <path
        d="M248 118 C360 118 420 210 548 248"
        stroke="#1a56db"
        strokeOpacity="0.12"
        strokeWidth="22"
        strokeLinecap="round"
        filter="url(#ph-glow)"
      />
      <path
        d="M248 382 C360 382 420 290 548 252"
        stroke="#22c4ef"
        strokeOpacity="0.14"
        strokeWidth="22"
        strokeLinecap="round"
        filter="url(#ph-glow)"
      />
      <path
        d="M820 248 C920 220 1000 195 1080 175"
        stroke="#1a56db"
        strokeOpacity="0.14"
        strokeWidth="26"
        strokeLinecap="round"
        filter="url(#ph-glow)"
      />

      {/* 御社ライン */}
      <path
        d="M248 118 C360 118 420 210 548 248"
        stroke="url(#ph-partner)"
        strokeWidth="5"
        strokeLinecap="round"
      />
      {/* NTSライン */}
      <path
        d="M248 382 C360 382 420 290 548 252"
        stroke="url(#ph-nts)"
        strokeWidth="5"
        strokeLinecap="round"
      />

      {/* 合流点 */}
      <circle cx="548" cy="250" r="9" fill="#fff" stroke="#1a56db" strokeWidth="3.5" />
      <circle cx="548" cy="250" r="4" fill="#1a56db" />

      {/* 共同パス → 山 */}
      <path
        d="M557 248 C680 230 780 205 1080 168"
        stroke="url(#ph-joint)"
        strokeWidth="7"
        strokeLinecap="round"
        markerEnd="url(#ph-arr)"
      />

      {/* 流れ上のノード */}
      {[
        [340, 130],
        [440, 200],
        [500, 240],
        [340, 370],
        [440, 300],
        [500, 255],
        [700, 225],
        [850, 195],
        [980, 178],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="5" fill="#fff" stroke="#3d8fe8" strokeWidth="2" />
      ))}

      {/* 入口ドット */}
      <circle cx="248" cy="118" r="6" fill="#1a56db" />
      <circle cx="248" cy="382" r="6" fill="#22c4ef" />
    </svg>
  );
}

// ─── 右：山ゴール ───────────────────────────────────────────
function DestinationGoal() {
  return (
    <div className="relative flex h-full min-h-[280px] w-full flex-col items-center justify-end pb-2 lg:min-h-[360px]">
      {/* 都市・山背景（フェード） */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden
        style={{
          maskImage:
            "linear-gradient(to left, transparent 0%, rgba(0,0,0,0.35) 25%, rgba(0,0,0,0.7) 55%, rgba(0,0,0,0.5) 100%)",
          WebkitMaskImage:
            "linear-gradient(to left, transparent 0%, rgba(0,0,0,0.35) 25%, rgba(0,0,0,0.7) 55%, rgba(0,0,0,0.5) 100%)",
        }}
      >
        <Image
          src="/images/nts_partner_progress_destination_bg_v1.png"
          alt=""
          fill
          className="object-contain object-right-bottom opacity-90"
          sizes="(max-width: 1024px) 320px, 420px"
        />
      </div>
      {/* 到達点グロー */}
      <div className="pointer-events-none absolute bottom-16 right-8 h-32 w-32 rounded-full bg-[#dfeeff]/60 blur-2xl" aria-hidden />
      <p className="relative z-10 text-center text-[17px] font-bold tracking-wide text-[#071b46] drop-shadow-[0_1px_8px_rgba(255,255,255,0.95)] lg:text-[19px]">
        お客様の前進へ
      </p>
    </div>
  );
}

// ─── SP：合流矢印 ───────────────────────────────────────────
function MobileFlowIcon() {
  return (
    <div className="flex justify-center py-2" aria-hidden>
      <svg width="72" height="56" viewBox="0 0 72 56" fill="none">
        <path d="M14 6 C14 28 32 38 36 44" stroke="#1a56db" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M58 6 C58 28 40 38 36 44" stroke="#22c4ef" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M36 44 V52" stroke="#1a56db" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M30 47 L36 54 L42 47" stroke="#1a56db" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

// ─── セクション本体 ───────────────────────────────────────────
export default function PartnerHandoffSection() {
  const reduceMotion = useReducedMotion();
  const reveal = (delay: number) => (reduceMotion ? {} : fadeUp(delay));

  return (
    <section
      className="section-alt relative overflow-hidden py-24 md:py-32"
      aria-labelledby="joint-progress-heading"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-white/80 to-transparent" />
      <div
        className="pointer-events-none absolute left-1/2 top-40 h-[480px] w-[900px] -translate-x-1/2 rounded-full bg-[#dfeeff]/40 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto max-w-[1240px] px-5 sm:px-8">
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

        {/* ── PC 横長図解ステージ ── */}
        <motion.div
          className="relative mt-12 hidden min-h-[500px] overflow-hidden rounded-[28px] border border-[#d0e4f6] bg-[linear-gradient(135deg,rgba(255,255,255,0.97)_0%,rgba(237,246,255,0.88)_100%)] lg:block"
          {...reveal(0.06)}
        >
          <DesktopFlowSVG />

          <div className="relative z-10 grid min-h-[500px] grid-cols-[minmax(240px,26%)_minmax(480px,44%)_minmax(300px,30%)] items-stretch gap-2 px-5 py-8 xl:px-7">
            {/* 左：2入力 */}
            <div className="flex flex-col justify-center gap-10 py-4">
              <SourceCluster variant="partner" />
              <SourceCluster variant="nts" />
            </div>

            {/* 中央：共同ゾーン */}
            <div className="flex flex-col justify-center px-2">
              <div className="mb-4 text-center">
                <p className="text-[12px] font-bold tracking-widest text-[#1a56db]">御社 × NTS</p>
                <h3 className="mt-1 font-heading text-xl font-bold text-[#071b46] xl:text-2xl">
                  一緒に深く考える
                </h3>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                {MAIN_CARDS.map((card) => (
                  <MainJointCard key={card.title} {...card} />
                ))}
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2">
                {SUPPORT_PILLS.map((pill) => (
                  <div
                    key={pill.title}
                    className="rounded-lg border border-[#c5e8dc] bg-[#f0fbf7]/80 px-2 py-2 text-center"
                  >
                    <div className="flex justify-center">
                      <MiniIcon type={pill.icon} />
                    </div>
                    <p className="mt-1 text-[10.5px] font-bold text-[#0f6e57]">{pill.title}</p>
                    <p className="mt-0.5 text-[9.5px] leading-tight text-[#3d6a5c]">{pill.sub}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-center gap-3">
                <div className="relative h-11 w-11 overflow-hidden rounded-full border-2 border-white shadow-md">
                  <Image src={PANA3025} alt="" fill className="object-cover" sizes="44px" />
                </div>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eef4ff] text-[#1a56db]" aria-hidden>
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                    <path
                      d="M7 11c2-2 4-2 5 0 1 2 3 2 5 0M7 11c-2 2-2 4 0 5 2 2 4 2 5 0"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                <div className="relative h-11 w-11 overflow-hidden rounded-full border-2 border-white shadow-md">
                  <Image src={PANA2727} alt="" fill className="object-cover" sizes="44px" />
                </div>
                <p className="ml-1 max-w-[200px] text-[11px] font-semibold leading-snug text-[#3d5a78]">
                  御社とNTSが並走し、
                  <br />
                  お客様の成果につなげます
                </p>
              </div>
            </div>

            {/* 右：到達点 */}
            <div className="relative flex items-end">
              <DestinationGoal />
            </div>
          </div>
        </motion.div>

        {/* ── SP 縦構成 ── */}
        <div className="mt-10 space-y-5 lg:hidden">
          <motion.div className="space-y-6 rounded-2xl border border-[#d0e4f6] bg-white/90 p-4" {...reveal(0.06)}>
            <SourceCluster variant="partner" />
            <SourceCluster variant="nts" />
          </motion.div>

          <MobileFlowIcon />

          <motion.div className="rounded-2xl border border-[#d0e4f6] bg-white/95 p-4" {...reveal(0.1)}>
            <div className="text-center">
              <p className="text-[12px] font-bold text-[#1a56db]">御社 × NTS</p>
              <h3 className="mt-1 font-heading text-xl font-bold text-[#071b46]">一緒に深く考える</h3>
            </div>
            <div className="mt-4 space-y-3">
              {MAIN_CARDS.map((card) => (
                <MainJointCard key={card.title} {...card} />
              ))}
            </div>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {SUPPORT_PILLS.map((pill) => (
                <span
                  key={pill.title}
                  className="rounded-full border border-[#c5e8dc] bg-[#f0fbf7] px-3 py-1 text-[11px] font-bold text-[#0f6e57]"
                >
                  {pill.title}
                </span>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-center gap-2">
              <div className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-white shadow">
                <Image src={PANA3025} alt="" fill className="object-cover" sizes="40px" />
              </div>
              <div className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-white shadow">
                <Image src={PANA2727} alt="" fill className="object-cover" sizes="40px" />
              </div>
              <p className="text-[11px] font-semibold text-[#3d5a78]">御社とNTSが並走し、お客様の成果につなげます</p>
            </div>
          </motion.div>

          <div className="flex justify-center" aria-hidden>
            <svg width="28" height="32" viewBox="0 0 28 32" fill="none">
              <path d="M14 2V24" stroke="#1a56db" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M7 18 L14 28 L21 18" stroke="#1a56db" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <motion.div className="mx-auto max-w-sm" {...reveal(0.14)}>
            <DestinationGoal />
          </motion.div>
        </div>

        {/* CTA（ステージ下・横長） */}
        <motion.div
          className="mt-8 flex flex-col gap-4 rounded-2xl border border-[#d0e4f6] bg-white/95 px-5 py-5 shadow-[0_8px_28px_rgba(12,42,72,0.07)] sm:flex-row sm:items-center sm:justify-between sm:px-6"
          {...reveal(0.16)}
        >
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#eef4ff] text-[#1a56db]">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
                <circle cx="8" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.6" />
                <circle cx="16" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.6" />
                <path
                  d="M3.5 19c.7-2.7 2.4-4.2 4.5-4.2s3.8 1.5 4.5 4.2M11.5 19c.7-2.7 2.4-4.2 4.5-4.2s3.8 1.5 4.5 4.2"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
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

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
      {/* 課題の深掘り：Layers（掘り下げるレイヤー） */}
      {type === "dig" && (
        <svg viewBox="0 0 24 24" className={c} fill="none" aria-hidden>
          <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 2 2 7l10 5 10-5-10-5Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {/* 解決の選択肢を広げる：GitBranch（分岐・広がり） */}
      {type === "expand" && (
        <svg viewBox="0 0 24 24" className={c} fill="none" aria-hidden>
          <circle cx="6" cy="6" r="2" stroke="currentColor" strokeWidth="1.7" />
          <circle cx="6" cy="18" r="2" stroke="currentColor" strokeWidth="1.7" />
          <circle cx="18" cy="9" r="2" stroke="currentColor" strokeWidth="1.7" />
          <path d="M6 8v8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          <path d="M6 8C6 12 18 11 18 9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      )}
      {/* 提案の質を高める：TrendingUp（上昇・洗練） */}
      {type === "quality" && (
        <svg viewBox="0 0 24 24" className={c} fill="none" aria-hidden>
          <path d="M3 17l5-5 4 4 9-9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14 7h6v6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
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
          className={`flex h-[84px] w-[84px] items-center justify-center rounded-full border-[3px] shadow-[0_8px_28px_rgba(26,86,219,0.16)] ${
            isPartner
              ? "border-[#93c5fd] bg-gradient-to-br from-[#eef4ff] to-white"
              : "border-[#67e8f9] bg-gradient-to-br from-[#e0f9ff] to-white"
          }`}
        >
          {isPartner ? (
            /* Building2: 企業・パートナー */
            <svg viewBox="0 0 24 24" className="h-10 w-10 text-[#1a56db]" fill="none" aria-hidden>
              <path d="M6 22V4h12v18" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 22h20" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
              <path d="M9 9h1M14 9h1M9 13h1M14 13h1M9 17h1M14 17h1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : (
            /* ShieldCheck: 専門性・信頼性 */
            <svg viewBox="0 0 24 24" className="h-10 w-10 text-[#0891b2]" fill="none" aria-hidden>
              <path d="M12 3 4 7v5c0 4.4 3.4 8.5 8 9.5 4.6-1 8-5.1 8-9.5V7L12 3Z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
              <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
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
    <div className="rounded-xl border border-[#cdddf0] bg-white px-4 py-4 shadow-[0_4px_16px_rgba(12,42,72,0.07)]">
      <div className="flex items-center gap-2.5 border-b border-[#e8f0fa] pb-2.5">
        <MiniIcon type={icon} />
        <h4 className="text-[13.5px] font-bold leading-tight text-[#071b46]">{title}</h4>
      </div>
      <ul className="mt-2.5 space-y-1.5">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-[11.5px] leading-snug text-[#3d5a78]">
            <span className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#1a56db]" />
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
        {/* 共同パス用：水色グラデーション */}
        <linearGradient id="ph-joint" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#93C5FD" />
          <stop offset="100%" stopColor="#38BDF8" />
        </linearGradient>
        {/* 矢尻用：同グラデーション（水平方向） */}
        <linearGradient id="ph-arr-grad" x1="0%" y1="50%" x2="100%" y2="50%" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#93C5FD" />
          <stop offset="100%" stopColor="#38BDF8" />
        </linearGradient>
        <filter id="ph-glow">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* スマートな矢尻（角張りを抑えた形状） */}
        <marker id="ph-arr" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto">
          <path d="M1 2 L10 6 L1 10 Q4 6 1 2Z" fill="url(#ph-arr-grad)" />
        </marker>
      </defs>

      {/* グロー下線 */}
      <path
        d="M248 108 C360 108 420 205 548 248"
        stroke="#1a56db"
        strokeOpacity="0.12"
        strokeWidth="22"
        strokeLinecap="round"
        filter="url(#ph-glow)"
      />
      <path
        d="M248 392 C360 392 420 295 548 252"
        stroke="#22c4ef"
        strokeOpacity="0.14"
        strokeWidth="22"
        strokeLinecap="round"
        filter="url(#ph-glow)"
      />
      <path
        d="M820 235 C920 195 1000 155 1085 128"
        stroke="#1a56db"
        strokeOpacity="0.14"
        strokeWidth="26"
        strokeLinecap="round"
        filter="url(#ph-glow)"
      />

      {/* 御社ライン */}
      <path
        d="M248 108 C360 108 420 205 548 248"
        stroke="url(#ph-partner)"
        strokeWidth="5"
        strokeLinecap="round"
      />
      {/* NTSライン */}
      <path
        d="M248 392 C360 392 420 295 548 252"
        stroke="url(#ph-nts)"
        strokeWidth="5"
        strokeLinecap="round"
      />

      {/* 合流点 */}
      <circle cx="548" cy="250" r="9" fill="#fff" stroke="#1a56db" strokeWidth="3.5" />
      <circle cx="548" cy="250" r="4" fill="#1a56db" />

      {/* 共同パス → 山：水色グラデーション・太め・やや透明 */}
      <path
        d="M557 248 C680 215 780 175 1085 128"
        stroke="url(#ph-joint)"
        strokeWidth="11"
        strokeLinecap="round"
        opacity="0.80"
        markerEnd="url(#ph-arr)"
      />

      {/* 流れ上のノード */}
      {[
        [340, 120],
        [440, 195],
        [500, 238],
        [340, 378],
        [440, 305],
        [500, 258],
        [700, 210],
        [850, 165],
        [1000, 138],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="5" fill="#fff" stroke="#3d8fe8" strokeWidth="2" />
      ))}

      {/* 入口ドット */}
      <circle cx="248" cy="108" r="6" fill="#1a56db" />
      <circle cx="248" cy="392" r="6" fill="#22c4ef" />
    </svg>
  );
}

// ─── 右：山ゴール ───────────────────────────────────────────
function DestinationGoal() {
  return (
    <div className="relative h-full min-h-[260px] w-full lg:min-h-[340px]">
      {/* 到達点グロー（山頂付近・約30%縮小） */}
      <div
        className="pointer-events-none absolute right-6 top-[16%] h-24 w-24 rounded-full bg-[#dfeeff]/65 blur-2xl lg:right-10 lg:top-[14%] lg:h-28 lg:w-28"
        aria-hidden
      />
      {/* 都市・山（表示領域を約70%に縮小、矢印先端へ） */}
      <div
        className="pointer-events-none absolute right-[6%] top-[10%] h-[48%] w-[58%] max-h-[200px] max-w-[240px] overflow-hidden lg:right-[8%] lg:top-[8%] lg:max-h-[230px] lg:max-w-[280px]"
        aria-hidden
        style={{
          maskImage:
            "radial-gradient(ellipse 90% 88% at 72% 38%, black 30%, rgba(0,0,0,0.65) 50%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 90% 88% at 72% 38%, black 30%, rgba(0,0,0,0.65) 50%, transparent 75%)",
        }}
      >
        <Image
          src="/images/nts_partner_progress_destination_bg_v1.png"
          alt=""
          fill
          className="object-contain object-[90%_32%] opacity-[0.86]"
          sizes="(max-width: 1024px) 240px, 300px"
        />
      </div>
      {/* ラベル（山の直下） */}
      <p className="absolute bottom-2 left-1/2 z-10 w-full -translate-x-1/2 text-center text-[17px] font-bold tracking-wide text-[#071b46] drop-shadow-[0_1px_10px_rgba(255,255,255,0.95)] lg:bottom-4 lg:text-[19px]">
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

      <div className="relative mx-auto max-w-[1240px] px-5 sm:px-6 lg:max-w-[1480px] lg:px-2 xl:max-w-[min(1520px,96vw)] xl:px-3">
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
          className="relative mt-12 hidden min-h-[540px] overflow-hidden rounded-[20px] bg-[radial-gradient(ellipse_125%_85%_at_50%_38%,rgba(223,238,255,0.58)_0%,rgba(255,255,255,0.12)_52%,transparent_100%)] ring-1 ring-[#d0e4f6]/25 lg:block"
          {...reveal(0.06)}
        >
          <DesktopFlowSVG />

          <div className="relative z-10 grid min-h-[540px] grid-cols-[minmax(218px,22%)_minmax(540px,48%)_minmax(260px,30%)] items-stretch gap-0 px-1 py-5 lg:px-2 xl:px-3">
            {/* 左：2入力 */}
            <div className="flex flex-col justify-center gap-14 py-3 lg:gap-[4.25rem] xl:gap-[4.75rem]">
              <SourceCluster variant="partner" />
              <SourceCluster variant="nts" />
            </div>

            {/* 中央：共同ゾーン */}
            <div className="flex flex-col justify-center">
              <div className="mb-5 text-center lg:mb-6">
                <p className="text-[12px] font-bold tracking-widest text-[#1a56db]">御社 × NTS</p>
                <h3 className="mt-1 font-heading text-xl font-bold text-[#071b46] xl:text-2xl">
                  一緒に深く考える
                </h3>
              </div>

              {/* 上段・下段を同じ左オフセットで右寄せ・等間隔（上段1.2倍拡大）*/}
              <div className="mx-auto w-full max-w-[640px] pl-7 pr-2 lg:pl-12 lg:pr-3 xl:pl-14 xl:pr-2">
                <div className="grid grid-cols-3 gap-4 lg:gap-5">
                  {MAIN_CARDS.map((card) => (
                    <MainJointCard key={card.title} {...card} />
                  ))}
                </div>

                <div className="mt-7 grid grid-cols-3 gap-4 lg:mt-8 lg:gap-5">
                {SUPPORT_PILLS.map((pill) => (
                  <div
                    key={pill.title}
                    className="rounded-lg border border-[#c5e8dc] bg-[#f0fbf7]/80 px-2.5 py-2.5 text-center"
                  >
                    <div className="flex justify-center">
                      <MiniIcon type={pill.icon} />
                    </div>
                    <p className="mt-1.5 text-[11px] font-bold text-[#0f6e57]">{pill.title}</p>
                    <p className="mt-0.5 text-[10px] leading-tight text-[#3d6a5c]">{pill.sub}</p>
                  </div>
                ))}
                </div>
              </div>

              <div className="mt-6 flex items-center justify-center gap-3 lg:mt-7">
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

            {/* 右：到達点（矢印先端＝山頂） */}
            <div className="relative flex items-stretch pt-2">
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

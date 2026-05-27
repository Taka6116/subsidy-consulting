"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import iso16 from "../../../../icon-assets/isometric_16.webp";
import iso08 from "../../../../icon-assets/isometric_08.webp";
import iso23 from "../../../../icon-assets/isometric23.webp";
import iso21 from "../../../../icon-assets/isometric_21.webp";
import iso20 from "../../../../icon-assets/isometric_20.webp";
import iso07 from "../../../../icon-assets/isometric_07.png";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.12 },
  transition: { duration: 0.55, ease: EASE_OUT, delay },
});

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
    case "flag":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
          <path d="M5 3v18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M5 4h12l-3 5 3 5H5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
      );
  }
}

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
// 左側：御社 / NTS アクターカード（コンパクトグリッド）
// ─────────────────────────────────────────────────────────────
function ActorCard({
  label,
  subtitle,
  isoImg,
  items,
}: {
  label: string;
  subtitle: string;
  isoImg: Parameters<typeof Image>[0]["src"];
  items: { text: string; icon: IconKey }[];
}) {
  return (
    <div className="flex-1 rounded-xl border border-[#cdddf0] bg-white shadow-[0_3px_12px_rgba(12,42,72,0.06)]">
      {/* カードヘッダー */}
      <div className="flex items-center gap-2 border-b border-[#e8f0fb] px-3 py-2">
        <span className="text-[12px] font-bold tracking-wide text-[#071b46]">{label}</span>
        <span className="text-[10px] text-[#5a7a9a]">（{subtitle}）</span>
      </div>
      {/* カード本体: 画像 + 項目リスト */}
      <div className="flex items-center gap-2 p-3">
        {/* isometric イラスト */}
        <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-xl border border-[#d8e8f6] bg-gradient-to-br from-[#eef4ff] to-white">
          <Image
            src={isoImg}
            alt=""
            fill
            sizes="72px"
            quality={90}
            className="object-contain p-1"
            aria-hidden
          />
        </div>
        {/* 3項目 */}
        <ul className="flex flex-1 flex-col gap-[5px]">
          {items.map((item) => (
            <li
              key={item.text}
              className="flex h-[34px] items-center gap-2 rounded-md border border-[#e0ecf8] bg-[#f8fbff] px-2.5"
            >
              <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded text-[#1a56db]">
                <Icon type={item.icon} className="h-[13px] w-[13px]" />
              </span>
              <span className="text-[11px] font-semibold leading-tight text-[#1e3a5f]">{item.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 工程カード（完全均一化）
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
    /* 固定高さ: カード全体 210px、flex-col で各ゾーンを均等配置 */
    <div className="relative flex h-[210px] w-full flex-col items-center rounded-xl border border-[#cdddf0] bg-white px-3 pb-3 pt-6 shadow-[0_4px_14px_rgba(12,42,72,0.06)]">
      {/* 番号バッジ: top-center 絶対配置、全カード統一 */}
      <span className="absolute left-1/2 top-0 flex h-[28px] min-w-[28px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#1a56db] px-[7px] text-[11px] font-bold text-white shadow-md">
        {no}
      </span>

      {/* タグ: 高さ固定ゾーン */}
      <div className="flex h-[20px] items-center">
        <span className="rounded-full bg-[#eef4ff] px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-[#1a56db]">
          {tag}
        </span>
      </div>

      {/* 画像スロット: 高さ固定 68px */}
      <div className="relative mt-1.5 h-[68px] w-full max-w-[100px] shrink-0">
        {isoImg ? (
          <Image
            src={isoImg}
            alt=""
            fill
            quality={90}
            className="object-contain"
            sizes="100px"
            aria-hidden
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center rounded-full bg-[#eef4ff] text-[#1a56db]">
            <Icon type={icon} className="h-6 w-6" />
          </span>
        )}
      </div>

      {/* タイトル: 2行分の高さ確保 */}
      <h4 className="mt-2 line-clamp-2 h-[36px] text-center text-[12.5px] font-bold leading-[1.4] text-[#071b46]">
        {title}
      </h4>

      {/* サブテキスト: 2行分の高さ確保 */}
      <p className="mt-1 line-clamp-2 h-[30px] whitespace-pre-line text-center text-[10.5px] leading-[1.45] text-[#5a7a9a]">
        {sub}
      </p>
    </div>
  );
}

// ─── ステップ間矢印 ─────────────────────────────────────────
function StepArrow() {
  return (
    <div className="flex shrink-0 items-center justify-center" aria-hidden>
      <svg width="22" height="14" viewBox="0 0 22 14" fill="none">
        <path d="M2 7h16" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 3" />
        <path d="m16 3 4 4-4 4" stroke="#1a56db" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

// ─── 左ブロック → Step01 接続矢印（PC専用） ─────────────────
function ConnectorArrow() {
  return (
    <div className="flex h-full shrink-0 items-center justify-center" aria-hidden>
      <svg width="36" height="14" viewBox="0 0 36 14" fill="none">
        <path d="M2 7h28" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 3" />
        <path d="m30 3 4 4-4 4" stroke="#1a56db" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 御社 × NTS 合流フロー図解（メインエクスポート）
// ─────────────────────────────────────────────────────────────
export default function PartnerJointFlowDiagram() {
  const reduceMotion = useReducedMotion();
  const reveal = (delay: number) => (reduceMotion ? {} : fadeUp(delay));

  return (
    <>
      {/* ── PC（lg以上）: 横1行レイアウト ── */}
      <motion.div
        className="relative mt-10 hidden lg:block"
        {...reveal(0.06)}
      >
        {/* 薄いグラデ背景 */}
        <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(ellipse_100%_80%_at_50%_50%,rgba(223,238,255,0.4)_0%,transparent_70%)]" aria-hidden />

        <div className="relative flex items-center gap-0 rounded-2xl px-5 py-8">
          {/* ── 左: 御社 / NTS カードグリッド ── */}
          {/* 2つのカードを同一高さで上下に並べる */}
          <div className="flex w-[300px] shrink-0 flex-col gap-3 xl:w-[320px]">
            {/* 上部ラベル */}
            <div className="flex items-center justify-center gap-2 pb-0.5">
              <div className="h-px flex-1 bg-[#cdddf0]" />
              <span className="text-[11px] font-bold tracking-widest text-[#1a56db]">御社 × NTS</span>
              <div className="h-px flex-1 bg-[#cdddf0]" />
            </div>
            {/* ActorCard 2枚: 同じ高さにするため items-stretch で揃える */}
            <div className="flex flex-col gap-2.5">
              <ActorCard
                label="御社"
                subtitle="ご顧客"
                isoImg={iso16}
                items={PARTNER_LABELS}
              />
              <ActorCard
                label="NTS"
                subtitle="弊社"
                isoImg={iso08}
                items={NTS_LABELS}
              />
            </div>
          </div>

          {/* ── 接続矢印 ── */}
          <ConnectorArrow />

          {/* ── 右: 4工程カード ── */}
          {/* grid-cols-[1fr auto 1fr auto 1fr auto 1fr] で完全均一化 */}
          <div className="grid flex-1 grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] items-center gap-2">
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

      {/* ── Tablet（md〜lg）: 2段構成 ── */}
      <div className="mt-8 hidden md:block lg:hidden">
        <motion.div
          className="rounded-2xl border border-[#d0e4f6] bg-white/95 p-5"
          {...reveal(0.06)}
        >
          {/* 御社 / NTS 横並び */}
          <div className="flex gap-3">
            <ActorCard
              label="御社"
              subtitle="ご顧客"
              isoImg={iso16}
              items={PARTNER_LABELS}
            />
            <ActorCard
              label="NTS"
              subtitle="弊社"
              isoImg={iso08}
              items={NTS_LABELS}
            />
          </div>
        </motion.div>

        {/* 接続ライン */}
        <motion.div className="flex flex-col items-center py-3" {...reveal(0.1)} aria-hidden>
          <svg width="2" height="24" viewBox="0 0 2 24">
            <path d="M1 0V24" stroke="#7eb3f0" strokeWidth="2" strokeDasharray="3 3" />
          </svg>
          <div className="rounded-full border border-[#cdddf0] bg-white px-4 py-1 shadow-sm">
            <p className="text-[11px] font-bold tracking-widest text-[#1a56db]">合流して前進</p>
          </div>
          <svg width="2" height="24" viewBox="0 0 2 24">
            <path d="M1 0V24" stroke="#7eb3f0" strokeWidth="2" strokeDasharray="3 3" />
          </svg>
        </motion.div>

        {/* 工程カード 2×2 */}
        <motion.div
          className="grid grid-cols-2 gap-3"
          {...reveal(0.14)}
        >
          {STEPS.map((step) => (
            <StepCard key={step.no} {...step} />
          ))}
        </motion.div>
      </div>

      {/* ── Mobile（〜md）: 1カラム ── */}
      <div className="mt-8 md:hidden">
        {/* 御社 / NTS カード縦並び */}
        <motion.div
          className="space-y-2.5 rounded-2xl border border-[#d0e4f6] bg-white/95 p-4"
          {...reveal(0.06)}
        >
          <ActorCard
            label="御社"
            subtitle="ご顧客"
            isoImg={iso16}
            items={PARTNER_LABELS}
          />
          <div className="border-t border-[#e8f0fb]" />
          <ActorCard
            label="NTS"
            subtitle="弊社"
            isoImg={iso08}
            items={NTS_LABELS}
          />
        </motion.div>

        {/* 接続ライン */}
        <motion.div className="flex flex-col items-center py-3" {...reveal(0.1)} aria-hidden>
          <svg width="2" height="24" viewBox="0 0 2 24">
            <path d="M1 0V24" stroke="#7eb3f0" strokeWidth="2" strokeDasharray="3 3" />
          </svg>
          <div className="rounded-full border border-[#cdddf0] bg-white px-4 py-1 shadow-sm">
            <p className="text-[11px] font-bold tracking-widest text-[#1a56db]">御社 × NTS</p>
          </div>
          <svg width="2" height="24" viewBox="0 0 2 24">
            <path d="M1 0V24" stroke="#7eb3f0" strokeWidth="2" strokeDasharray="3 3" />
          </svg>
        </motion.div>

        {/* 工程カード 縦並び */}
        <motion.div className="space-y-3" {...reveal(0.14)}>
          {STEPS.map((step, i) => (
            <div key={step.no}>
              <StepCard {...step} />
              {i < STEPS.length - 1 && (
                <div className="flex justify-center py-1.5" aria-hidden>
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
    </>
  );
}

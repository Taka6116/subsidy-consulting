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
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.1 },
  transition: { duration: 0.6, ease: EASE_OUT, delay },
});
const scaleIn = (delay: number) => ({
  initial: { opacity: 0, scale: 0.82 },
  whileInView: { opacity: 1, scale: 1 },
  viewport: { once: true, amount: 0.1 },
  transition: { duration: 0.5, ease: EASE_OUT, delay },
});

// ─────────────────────────────────────────────────────────────
// アイコン
// ─────────────────────────────────────────────────────────────
type IconKey =
  | "people" | "chat" | "chart" | "bulb" | "doc" | "net"
  | "dig" | "branch" | "trend" | "flag" | "handshake";

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
    case "handshake":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
          <path d="M9 11l3 3 8-8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
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
  { text: "投資背景把握", icon: "doc" as IconKey },
  { text: "専門家連携", icon: "net" as IconKey },
];

const STEPS = [
  {
    no: "01", tag: "整理",
    title: "課題を一緒に特定",
    sub: "顧客課題を言語化し、\n本質を特定します。",
    icon: "dig" as IconKey,
    isoImg: iso23,
    accent: true,
  },
  {
    no: "02", tag: "検討",
    title: "選択肢を広げる",
    sub: "補助金・支援策を\n幅広く整理します。",
    icon: "branch" as IconKey,
    isoImg: iso21,
    accent: false,
  },
  {
    no: "03", tag: "提案",
    title: "提案を前へ進める",
    sub: "資料・説明・実行まで\n伴走します。",
    icon: "trend" as IconKey,
    isoImg: iso20,
    accent: false,
  },
  {
    no: "04", tag: "伴走",
    title: "お客様の前進へ",
    sub: "導入後の次の一手まで\n支援します。",
    icon: "flag" as IconKey,
    isoImg: iso07,
    accent: true,
  },
];

// ─────────────────────────────────────────────────────────────
// 御社 / NTS アクターカード（刷新版）
// ─────────────────────────────────────────────────────────────
function ActorCard({
  label,
  isoImg,
  items,
  variant,
}: {
  label: string;
  isoImg: Parameters<typeof Image>[0]["src"];
  items: { text: string; icon: IconKey }[];
  variant: "partner" | "nts";
}) {
  const isPartner = variant === "partner";
  return (
    <div
      className="flex flex-col overflow-hidden rounded-[18px] transition-all duration-300 hover:-translate-y-1"
      style={{
        background: isPartner
          ? "linear-gradient(160deg, rgba(240,253,250,0.95) 0%, rgba(255,255,255,0.97) 100%)"
          : "linear-gradient(160deg, rgba(255,255,255,0.97) 0%, rgba(248,251,255,0.97) 100%)",
        border: isPartner
          ? "1px solid rgba(20,184,166,0.22)"
          : "1px solid rgba(37,99,235,0.18)",
        boxShadow: "0 18px 40px rgba(15,23,42,0.08)",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* ヘッダー */}
      <div
        className="flex items-center justify-center gap-2 px-4 py-2.5"
        style={{
          borderBottom: isPartner
            ? "1px solid rgba(20,184,166,0.14)"
            : "1px solid rgba(37,99,235,0.1)",
          background: isPartner
            ? "rgba(240,253,250,0.6)"
            : "rgba(239,246,255,0.6)",
        }}
      >
        <span
          className="text-[13px] font-bold tracking-[0.1em]"
          style={{ color: isPartner ? "#0f766e" : "#1a56db" }}
        >
          {label}
        </span>
      </div>
      {/* 本体 */}
      <div className="flex items-center gap-2.5 p-3">
        {/* isometric イラスト */}
        <div
          className="relative h-[76px] w-[76px] shrink-0 overflow-hidden rounded-xl"
          style={{
            background: isPartner
              ? "linear-gradient(135deg, #ccfbf1, #f0fdf4)"
              : "linear-gradient(135deg, #dbeafe, #eff6ff)",
            border: isPartner
              ? "1px solid rgba(20,184,166,0.18)"
              : "1px solid rgba(37,99,235,0.14)",
          }}
        >
          <Image
            src={isoImg}
            alt=""
            fill
            sizes="76px"
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
              className="flex h-[32px] items-center gap-2 rounded-md px-2.5"
              style={{
                background: isPartner
                  ? "rgba(240,253,250,0.7)"
                  : "rgba(239,246,255,0.7)",
                border: isPartner
                  ? "1px solid rgba(20,184,166,0.14)"
                  : "1px solid rgba(37,99,235,0.1)",
              }}
            >
              <span
                className="flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded"
                style={{ color: isPartner ? "#0d9488" : "#1a56db" }}
              >
                <Icon type={item.icon} className="h-[12px] w-[12px]" />
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
// 共同支援バッジ
// ─────────────────────────────────────────────────────────────
function JointBadge() {
  return (
    <div
      className="flex h-[52px] w-[52px] shrink-0 flex-col items-center justify-center rounded-full"
      style={{
        background: "#ffffff",
        border: "1px solid rgba(37,99,235,0.18)",
        boxShadow: "0 16px 36px rgba(37,99,235,0.16), 0 4px 12px rgba(15,23,42,0.08)",
      }}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
        <path
          d="M4.5 15.5C3.1 14.1 3 11.9 4.1 10.3L7 7h4l1 2-3 3 1.5 1.5"
          stroke="#1a56db"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M19.5 8.5C20.9 9.9 21 12.1 19.9 13.7L17 17h-4l-1-2 3-3-1.5-1.5"
          stroke="#0d9488"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9 15l6-6"
          stroke="#7c3aed"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeDasharray="2 2"
        />
      </svg>
      <span className="mt-0.5 text-[8px] font-black leading-none tracking-wide text-[#0f3b7a]">共同支援</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// グラデーション矢印コネクター（左カード群 → 01カード）
// ─────────────────────────────────────────────────────────────
function FlowArrow({ size = "lg" }: { size?: "lg" | "sm" }) {
  if (size === "sm") {
    return (
      <div className="flex shrink-0 items-center justify-center" aria-hidden>
        <svg width="28" height="14" viewBox="0 0 28 14" fill="none">
          <defs>
            <linearGradient id="arrow-grad-sm" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>
          </defs>
          <path d="M2 7h20" stroke="url(#arrow-grad-sm)" strokeWidth="2" strokeLinecap="round" />
          <path d="m20 3 5 4-5 4" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  }
  // viewBox: width=80, height=270
  // 上カード中央Y ≈ 62 (カード高さ約124px の半分)
  // 下カード中央Y ≈ 208 (124 + 14gap + 124/2 ≈ 208)
  // 合流点Y = (62 + 208) / 2 = 135
  return (
    <div className="flex shrink-0 items-center justify-center self-stretch" aria-hidden>
      <svg
        className="h-full w-full"
        viewBox="0 0 80 270"
        preserveAspectRatio="xMidYMid meet"
        fill="none"
      >
        <defs>
          <linearGradient id="merge-line-top" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#5eead4" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
          <linearGradient id="merge-line-bot" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
          <linearGradient id="merge-line-out" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="1.4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        {/* 御社（上）→合流点 */}
        <path
          d="M2 62 H38 V135"
          stroke="url(#merge-line-top)"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#glow)"
        />
        {/* NTS（下）→合流点 */}
        <path
          d="M2 208 H38 V135"
          stroke="url(#merge-line-bot)"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#glow)"
        />
        {/* 合流点 外リング */}
        <circle cx="38" cy="135" r="7" fill="rgba(37,99,235,0.12)" />
        {/* 合流点 内丸 */}
        <circle cx="38" cy="135" r="4" fill="#2563eb" />
        {/* 合流→出口 */}
        <path
          d="M42 135 H72"
          stroke="url(#merge-line-out)"
          strokeWidth="2.6"
          strokeLinecap="round"
          filter="url(#glow)"
        />
        {/* 矢印ヘッド */}
        <path
          d="m68 130 6 5-6 5"
          stroke="#2563eb"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 工程カード（刷新版）
// ─────────────────────────────────────────────────────────────
function StepCard({
  no, tag, title, sub, icon, isoImg, accent,
}: {
  no: string; tag: string; title: string; sub: string;
  icon: IconKey; isoImg?: Parameters<typeof Image>[0]["src"]; accent?: boolean;
}) {
  return (
    <div
      className="relative flex h-[228px] w-full flex-col items-center rounded-[18px] px-3 pb-3 pt-8 transition-all duration-300 hover:-translate-y-[3px]"
      style={{
        background: "rgba(255,255,255,0.9)",
        border: accent
          ? "1px solid rgba(37,99,235,0.22)"
          : "1px solid rgba(37,99,235,0.10)",
        boxShadow: accent
          ? "0 18px 40px rgba(37,99,235,0.12), 0 4px 12px rgba(15,23,42,0.06)"
          : "0 14px 32px rgba(15,23,42,0.07), 0 2px 8px rgba(15,23,42,0.04)",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* 番号バッジ */}
      <span
        className="absolute left-1/2 top-0 flex h-[28px] min-w-[28px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full px-[7px] text-[11px] font-black text-white"
        style={{
          background: "linear-gradient(135deg, #2563eb 0%, #0f4fb8 100%)",
          boxShadow: "0 6px 16px rgba(37,99,235,0.3)",
        }}
      >
        {no}
      </span>
      {/* タグ */}
      <div className="flex h-[20px] items-center">
        <span
          className="rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide"
          style={{
            background: accent ? "rgba(219,234,254,0.8)" : "rgba(239,246,255,0.8)",
            color: "#1a56db",
            border: "1px solid rgba(37,99,235,0.14)",
          }}
        >
          {tag}
        </span>
      </div>
      {/* 画像スロット */}
      <div className="relative mt-2 h-[72px] w-full max-w-[104px] shrink-0">
        {isoImg ? (
          <Image
            src={isoImg}
            alt=""
            fill
            quality={90}
            className="object-contain"
            sizes="104px"
            aria-hidden
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center rounded-full bg-[#eef4ff] text-[#1a56db]">
            <Icon type={icon} className="h-6 w-6" />
          </span>
        )}
      </div>
      {/* タイトル */}
      <h4 className="mt-2 line-clamp-2 h-[38px] text-center text-[13px] font-bold leading-[1.45] text-[#071b46]">
        {title}
      </h4>
      {/* サブ */}
      <p className="mt-1 line-clamp-2 h-[30px] whitespace-pre-line text-center text-[11px] leading-[1.4] text-[#5a7a9a]">
        {sub}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 補足ボックス（下部）
// ─────────────────────────────────────────────────────────────
function FooterNote() {
  return (
    <div
      className="mt-6 flex items-center gap-4 rounded-[16px] px-6 py-4"
      style={{
        background: "rgba(255,255,255,0.88)",
        border: "1px solid rgba(37,99,235,0.14)",
        boxShadow: "0 12px 30px rgba(15,23,42,0.05)",
      }}
    >
      {/* アイコン丸 */}
      <div
        className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full"
        style={{
          background: "linear-gradient(135deg, #dbeafe, #eff6ff)",
          border: "1px solid rgba(37,99,235,0.16)",
        }}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
          <path
            d="M8 11c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v3c0 1.1-.9 2-2 2h-2l-3 2v-2H8c-1.1 0-2-.9-2-2v-3z"
            stroke="#1a56db"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
          <path d="M7 9V7a5 5 0 0 1 10 0v2" stroke="#1a56db" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      </div>
      <p className="text-[12.5px] font-semibold leading-[1.75] text-[#334155]">
        御社の<span className="font-bold text-[#1a56db]">信頼関係を活かし</span>、NTSが専門家として裏側で支えます。
        だから紹介先にも、<span className="font-bold text-[#1a56db]">御社にも負担が少ない</span>。
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PC帯ラベル（全工程横断）- 囲いなし
// ─────────────────────────────────────────────────────────────
function SpanLabel({ text, sub }: { text: string; sub: string }) {
  return (
    <div className="mb-3 flex flex-col items-center gap-1">
      <div className="flex w-full items-center gap-3">
        <div className="h-px flex-1" style={{ background: "linear-gradient(to right, transparent, rgba(37,99,235,0.2))" }} />
        <span className="shrink-0 text-[11.5px] font-bold tracking-[0.1em] text-[#1a56db]">
          {text}
        </span>
        <div className="h-px flex-1" style={{ background: "linear-gradient(to left, transparent, rgba(37,99,235,0.2))" }} />
      </div>
      <p className="text-[11px] font-semibold tracking-[0.08em] text-[#7ea3c6]">{sub}</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// メインエクスポート
// ─────────────────────────────────────────────────────────────
export default function PartnerJointFlowDiagram() {
  const reduceMotion = useReducedMotion();
  const reveal = (delay: number) => (reduceMotion ? {} : fadeUp(delay));
  const scale = (delay: number) => (reduceMotion ? {} : scaleIn(delay));

  return (
    <>
      {/* ════════════════════════════════════════════════════════
          PC（lg以上）: 横1行レイアウト
          ════════════════════════════════════════════════════════ */}
      <div
        className="relative mt-8 hidden lg:block"
        style={{ width: "min(94vw, 1520px)", marginLeft: "auto", marginRight: "auto" }}
      >
        {/* 帯ラベル */}
        <motion.div {...reveal(0.05)}>
          <SpanLabel
            text="御社の信頼・顧客接点 × NTSの専門知見で、課題発見から提案後まで支援"
            sub="紹介後も、NTSが伴走します"
          />
        </motion.div>

        {/* メイン横並び */}
        <div
          className="flex items-center"
          style={{ gap: "0" }}
        >
          {/* ── 左: 御社 / NTS カード列 ── */}
          <motion.div
            className="shrink-0 flex flex-col"
            style={{
              width: "clamp(270px, 22vw, 380px)",
              gap: "clamp(8px, 0.8vw, 14px)",
            }}
            {...reveal(0.1)}
          >
            <ActorCard label="御社" isoImg={iso16} items={PARTNER_LABELS} variant="partner" />
            <ActorCard label="NTS" isoImg={iso08} items={NTS_LABELS} variant="nts" />
          </motion.div>

          {/* ── 合流コネクター（共同支援バッジ込み） ── */}
          <div
            className="relative shrink-0 self-stretch"
            style={{ width: "clamp(60px, 5vw, 96px)", minHeight: "190px" }}
          >
            {/* グラデーション合流矢印 */}
            <FlowArrow size="lg" />
            {/* 共同支援バッジ：cx=38/80=47.5% → left 47.5%, cy=135/270=50% → top 50% */}
            <motion.div
              className="absolute z-10"
              style={{
                left: "calc(38 / 80 * 100%)",
                top: "calc(135 / 270 * 100%)",
                transform: "translate(-50%, -50%)",
              }}
              {...scale(0.18)}
            >
              <JointBadge />
            </motion.div>
          </div>

          {/* ── 右: 4工程カード ── */}
          <div
            className="grid flex-1 items-center"
            style={{
              gridTemplateColumns: "1fr auto 1fr auto 1fr auto 1fr",
              gap: "clamp(4px, 0.6vw, 10px)",
              marginLeft: "clamp(8px, 0.8vw, 16px)",
            }}
          >
            {STEPS.map((step, i) => (
              <>
                <motion.div key={step.no} {...reveal(0.2 + i * 0.07)}>
                  <StepCard {...step} />
                </motion.div>
                {i < STEPS.length - 1 && <FlowArrow key={`arrow-${i}`} size="sm" />}
              </>
            ))}
          </div>
        </div>

        {/* 補足ボックス */}
        <motion.div {...reveal(0.42)}>
          <FooterNote />
        </motion.div>
      </div>

      {/* ════════════════════════════════════════════════════════
          Tablet（md〜lg）: 2段構成
          ════════════════════════════════════════════════════════ */}
      <div className="mt-8 hidden md:block lg:hidden">
        <motion.div {...reveal(0.06)}>
          <SpanLabel
            text="御社 × NTSの専門知見で、課題発見から提案後まで支援"
            sub="紹介後も、NTSが伴走します"
          />
        </motion.div>

        <motion.div
          className="rounded-[18px] p-5"
          style={{
            background: "rgba(255,255,255,0.88)",
            border: "1px solid rgba(37,99,235,0.12)",
            boxShadow: "0 18px 40px rgba(15,23,42,0.08)",
          }}
          {...reveal(0.1)}
        >
          <div className="flex gap-3">
            <ActorCard label="御社" isoImg={iso16} items={PARTNER_LABELS} variant="partner" />
            <ActorCard label="NTS" isoImg={iso08} items={NTS_LABELS} variant="nts" />
          </div>
          <div className="mt-3 flex justify-center">
            <div
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[11px] font-bold text-[#1a56db]"
              style={{ background: "rgba(219,234,254,0.7)", border: "1px solid rgba(37,99,235,0.18)" }}
            >
              <JointBadge />
              <span>共同支援を起点に、4ステップで伴走</span>
            </div>
          </div>
        </motion.div>

        <motion.div className="flex flex-col items-center py-4" {...reveal(0.15)} aria-hidden>
          <svg width="2" height="28" viewBox="0 0 2 28">
            <defs>
              <linearGradient id="v-line-tab" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="100%" stopColor="#2563eb" />
              </linearGradient>
            </defs>
            <path d="M1 0V28" stroke="url(#v-line-tab)" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none" aria-hidden>
            <path d="M1 1l5 5 5-5" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.div>

        <motion.div className="grid grid-cols-2 gap-3" {...reveal(0.2)}>
          {STEPS.map((step) => (
            <StepCard key={step.no} {...step} />
          ))}
        </motion.div>

        <motion.div {...reveal(0.28)}>
          <FooterNote />
        </motion.div>
      </div>

      {/* ════════════════════════════════════════════════════════
          Mobile（〜md）: 1カラム
          ════════════════════════════════════════════════════════ */}
      <div className="mt-8 md:hidden">
        <motion.div {...reveal(0.06)}>
          <SpanLabel
            text="御社 × NTSで、課題発見から伴走"
            sub="紹介後も、NTSが伴走します"
          />
        </motion.div>

        <motion.div
          className="space-y-3 rounded-[18px] p-4"
          style={{
            background: "rgba(255,255,255,0.92)",
            border: "1px solid rgba(37,99,235,0.12)",
            boxShadow: "0 14px 32px rgba(15,23,42,0.07)",
          }}
          {...reveal(0.08)}
        >
          <ActorCard label="御社" isoImg={iso16} items={PARTNER_LABELS} variant="partner" />

          {/* 共同支援バッジ */}
          <motion.div className="flex justify-center" {...scale(0.14)}>
            <JointBadge />
          </motion.div>

          <ActorCard label="NTS" isoImg={iso08} items={NTS_LABELS} variant="nts" />
        </motion.div>

        {/* 縦接続ライン */}
        <motion.div className="flex flex-col items-center py-3" {...reveal(0.18)} aria-hidden>
          <svg width="2" height="28" viewBox="0 0 2 28">
            <defs>
              <linearGradient id="v-line-sp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="100%" stopColor="#2563eb" />
              </linearGradient>
            </defs>
            <path d="M1 0V28" stroke="url(#v-line-sp)" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none" aria-hidden>
            <path d="M1 1l5 5 5-5" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.div>

        {/* 工程カード 縦並び */}
        <motion.div className="space-y-3" {...reveal(0.22)}>
          {STEPS.map((step, i) => (
            <div key={step.no}>
              <StepCard {...step} />
              {i < STEPS.length - 1 && (
                <div className="flex justify-center py-2" aria-hidden>
                  <svg width="2" height="20" viewBox="0 0 2 20">
                    <defs>
                      <linearGradient id={`vsp-${i}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#60a5fa" />
                        <stop offset="100%" stopColor="#2563eb" />
                      </linearGradient>
                    </defs>
                    <path d="M1 0V20" stroke={`url(#vsp-${i})`} strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </motion.div>

        <motion.div {...reveal(0.32)}>
          <FooterNote />
        </motion.div>
      </div>
    </>
  );
}

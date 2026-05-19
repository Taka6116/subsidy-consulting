"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import sakurabaPhoto from "../../../icon-assets/PANA2727.webp";
import seinoPhoto from "../../../icon-assets/PANA2741.webp";

const ease = [0.22, 1, 0.36, 1] as const;
function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 22 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.1 },
    transition: { duration: 0.62, ease, delay },
  };
}

// ============================================================
// プロフィールデータ（後から差し替えやすい構造）
// ============================================================
type Consultant = {
  id: string;
  name: string;
  title: string;
  photo: typeof sakurabaPhoto;
  photoObjectPosition: string;
  photoScale: number;
  message: string;
  supports: string[];
  specialty: string;
  watchPoints: string;
};

const CONSULTANTS: Consultant[] = [
  {
    id: "sakuraba",
    name: "櫻庭真之介",
    title: "中小企業診断士",
    photo: sakurabaPhoto,
    photoObjectPosition: "50% 20%",
    photoScale: 1.08,
    message:
      "制度を見つけるだけで終わらせず、申請準備から採択後の活用相談まで継続して支援します。",
    supports: [
      "事業計画の整理・補助金活用戦略の設計",
      "申請準備・必要書類の整理サポート",
      "採択後の活用相談・効果検証の伴走",
    ],
    specialty: "事業計画策定 / 補助金活用設計",
    watchPoints:
      "補助金を「使える制度」で終わらせず、事業成長につながっているかを定期的に確認します。",
  },
  {
    id: "seino",
    name: "清野洋司",
    title: "中小企業診断士",
    photo: seinoPhoto,
    photoObjectPosition: "50% 18%",
    photoScale: 1.08,
    message:
      "制度の選定だけでなく、申請後の運用や効果測定まで、担当者として継続的に伴走します。",
    supports: [
      "現状ヒアリングと本質課題の整理",
      "最適な制度の選定・申請準備の支援",
      "導入後の効果測定・改善相談",
    ],
    specialty: "課題整理 / 採択後の活用支援",
    watchPoints:
      "投資が計画どおりに事業の成果につながっているか、現場目線で定点観測します。",
  },
];

// ============================================================
// セクション本体
// ============================================================
export default function NtsWarmIntroMergedSection() {
  const reduce = useReducedMotion();
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleToggle = (id: string) => {
    setActiveId((prev) => (prev === id ? null : id));
  };

  return (
    <section
      aria-labelledby="warm-merged-heading"
      className="relative overflow-hidden bg-[#f0f4fa] py-20 md:py-28"
    >
      <div className="relative z-10 mx-auto w-full max-w-[1280px] px-5 sm:px-8 xl:px-10">
        {/* ── 見出し ── */}
        <motion.div {...(reduce ? {} : fadeUp(0))} className="mb-12 text-center md:mb-14">
          <h2
            id="warm-merged-heading"
            className="text-[1.9rem] font-black leading-snug tracking-tight text-[#0c2a48] md:text-[2.6rem] lg:text-[2.8rem]"
            style={{ fontFamily: "'Noto Sans JP', sans-serif" }}
          >
            「補助金が使えます」。
            <br className="hidden sm:block" />
            その先に、1年間の伴走があります。
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-[0.97rem] leading-relaxed text-[#4a6a82] md:text-[1.05rem]">
            制度を見つけるだけで終わらせず、申請準備から採択後の活用相談まで、担当者が継続して支援します。
          </p>
        </motion.div>

        {/* ── 2名カード横並び ── */}
        <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 md:gap-7 lg:gap-8">
          {CONSULTANTS.map((c, i) => {
            const isActive = activeId === c.id;
            const isDimmed = activeId !== null && !isActive;
            return (
              <ConsultantBlock
                key={c.id}
                c={c}
                isActive={isActive}
                isDimmed={isDimmed}
                onToggle={() => handleToggle(c.id)}
                delay={0.08 + i * 0.08}
              />
            );
          })}
        </div>

      </div>
    </section>
  );
}

// ============================================================
// ConsultantBlock — 写真カード + プロフィールパネル（横スライド/縦展開）
// ============================================================
function ConsultantBlock({
  c,
  isActive,
  isDimmed,
  onToggle,
  delay,
}: {
  c: Consultant;
  isActive: boolean;
  isDimmed: boolean;
  onToggle: () => void;
  delay: number;
}) {
  const reduce = useReducedMotion();
  const panelId = `consultant-panel-${c.id}`;

  return (
    <motion.div
      {...(reduce ? {} : fadeUp(delay))}
      className="relative flex"
      animate={
        reduce
          ? {}
          : {
              opacity: isDimmed ? 0.55 : 1,
              scale: isDimmed ? 0.985 : 1,
            }
      }
      transition={{ duration: 0.3, ease }}
    >
      {/* ── 写真カード ── */}
      <div className="relative w-full overflow-hidden rounded-2xl border border-[#d4e8f6] bg-white shadow-[0_2px_16px_rgba(18,56,110,0.08)]">
        {/* 写真エリア */}
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#edf5fb] sm:aspect-[5/6]">
          <Image
            src={c.photo}
            alt={`${c.name}（${c.title}）の写真`}
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            style={{
              objectPosition: c.photoObjectPosition,
              transform: `scale(${c.photoScale})`,
            }}
            sizes="(min-width: 768px) 50vw, 100vw"
            quality={92}
          />
          {/* 下にグラデを敷いてボタンを読みやすく */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-32"
            style={{ background: "linear-gradient(to top, rgba(12,42,72,0.45) 0%, transparent 100%)" }}
            aria-hidden
          />

          {/* 詳細を見るボタン（写真右下） */}
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={isActive}
            aria-controls={panelId}
            className="absolute bottom-3.5 right-3.5 inline-flex items-center gap-1.5 rounded-full bg-[#1d6fe8] px-4 py-2 text-[12px] font-bold text-white shadow-[0_4px_14px_rgba(29,111,232,0.35)] transition hover:-translate-y-0.5 hover:bg-[#1a60d0] hover:shadow-[0_6px_18px_rgba(29,111,232,0.42)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:text-[13px]"
          >
            {isActive ? "閉じる" : "詳細を見る"}
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              className={`transition-transform duration-300 ${isActive ? "rotate-180" : ""}`}
              aria-hidden
            >
              <path d="M2.5 4.5L6 8l3.5-3.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* 名前・肩書 */}
        <div className="px-5 py-4 sm:px-6 sm:py-5">
          <p className="text-[12px] font-bold uppercase tracking-widest text-[#5a80a0] sm:text-[13px]">
            {c.title}
          </p>
          <p className="mt-1 text-[20px] font-black leading-snug text-[#0c2a48] sm:text-[22px]">
            {c.name}
          </p>
        </div>

        {/* ── SP: アコーディオン展開（md以下のみ） ── */}
        <AnimatePresence initial={false}>
          {isActive && (
            <motion.div
              key="sp-panel"
              id={`${panelId}-sp`}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: reduce ? 0 : 0.32, ease }}
              className="overflow-hidden border-t border-[#e4eef7] md:hidden"
            >
              <ProfileBody c={c} onClose={onToggle} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── PC: 横スライドパネル（md以上のみ） ── */}
      <AnimatePresence initial={false}>
        {isActive && (
          <motion.div
            key="pc-panel"
            id={`${panelId}-pc`}
            initial={{ opacity: 0, x: -16, width: 0 }}
            animate={{ opacity: 1, x: 0, width: "min(420px, 90vw)" }}
            exit={{ opacity: 0, x: -16, width: 0 }}
            transition={{ duration: reduce ? 0 : 0.36, ease }}
            className="ml-4 hidden shrink-0 overflow-hidden rounded-2xl border border-[#cfe2f3] bg-white shadow-[0_8px_32px_rgba(18,56,110,0.12)] md:block lg:ml-5"
            role="region"
            aria-label={`${c.name} のプロフィール`}
          >
            <ProfileBody c={c} onClose={onToggle} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ============================================================
// ProfileBody — プロフィール内容（PC/SP共通）
// ============================================================
function ProfileBody({ c, onClose }: { c: Consultant; onClose: () => void }) {
  return (
    <div className="relative p-5 sm:p-6">
      {/* 閉じるボタン */}
      <button
        type="button"
        onClick={onClose}
        aria-label="プロフィールを閉じる"
        className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full border border-[#d4e3ef] bg-white text-[#5a80a0] transition hover:bg-[#f0f6fb] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1d6fe8]"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
          <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>

      {/* 肩書 + 名前 */}
      <p className="text-[11px] font-bold uppercase tracking-widest text-[#1d6fe8]">
        {c.title}
      </p>
      <p className="mt-1 text-[20px] font-black leading-snug text-[#0c2a48]">
        {c.name}
      </p>

      {/* 一言メッセージ */}
      <p
        className="mt-4 rounded-xl bg-[#eff6fd] px-4 py-3 text-[13px] leading-relaxed text-[#1a4972] sm:text-[13.5px]"
      >
        {c.message}
      </p>

      {/* 支援できること */}
      <div className="mt-5">
        <p className="text-[11px] font-bold uppercase tracking-wider text-[#5a80a0]">
          支援できること
        </p>
        <ul className="mt-2 space-y-1.5">
          {c.supports.map((s) => (
            <li key={s} className="flex items-start gap-2 text-[13px] leading-relaxed text-[#3a5a78]">
              <span
                aria-hidden
                className="mt-[6px] inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[#1d6fe8]"
              />
              <span>{s}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 得意領域 */}
      <div className="mt-5">
        <p className="text-[11px] font-bold uppercase tracking-wider text-[#5a80a0]">
          得意領域
        </p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-[#3a5a78]">
          {c.specialty}
        </p>
      </div>

      {/* 1年間の伴走で見るポイント */}
      <div className="mt-5 rounded-xl border border-[#dde9f4] bg-[#f8fbfe] p-4">
        <p className="text-[11px] font-bold uppercase tracking-wider text-[#1d6fe8]">
          1年間の伴走で見るポイント
        </p>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-[#3a5a78]">
          {c.watchPoints}
        </p>
      </div>
    </div>
  );
}

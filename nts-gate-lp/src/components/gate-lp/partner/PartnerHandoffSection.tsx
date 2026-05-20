"use client";

import { motion, useReducedMotion } from "framer-motion";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.12 },
  transition: { duration: 0.55, ease: EASE_OUT, delay },
});

const YOUR_ITEMS = [
  { label: "顧客をご紹介", sub: "見込み客のお名前・連絡先" },
  { label: "初回接点の共有", sub: "どんな文脈で話したか" },
  { label: "商材情報の共有", sub: "御社の提案内容の概要" },
];

const NTS_ITEMS = [
  "顧客へのヒアリング",
  "課題の特定",
  "最適な補助金制度の確認",
  "補助金活用方針等の整理",
  "申請準備支援",
  "採択後の利活用戦略などの相談",
];

export default function PartnerHandoffSection() {
  const reduce = useReducedMotion();
  const fu = (d: number) => (reduce ? {} : fadeUp(d));

  return (
    <section
      className="relative py-20 md:py-28"
      style={{ background: "#F4F7FB", zIndex: 10 }}
      aria-labelledby="handoff-heading"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        {/* ── 見出し ── */}
        <motion.div className="mb-12 text-center md:mb-16" {...fu(0)}>
          <h2
            id="handoff-heading"
            className="font-heading text-2xl font-bold leading-snug text-[#0c2a48] md:text-3xl lg:text-[2rem]"
          >
            紹介後の対応は、NTSが引き受けます
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-[#4a6070] md:text-base">
            提携先様にお願いするのは、補助金に関心がありそうな顧客のご紹介まで。
            <br className="hidden md:block" />
            制度説明や申請準備の支援はNTSが対応します。
          </p>
        </motion.div>

        {/* ── 3カラム ── */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto_1fr] md:items-start lg:gap-6">

          {/* ── 左: 御社がやること ── */}
          <motion.div {...fu(0.08)}>
            <div className="rounded-2xl border border-[#d8e6f0] bg-white p-6 shadow-[0_2px_12px_rgba(12,42,72,0.06)] lg:p-7">
              <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#5a80a0]">
                御社がやること
              </p>
              <p className="mt-1 text-base font-bold text-[#0c2a48]">
                最小限の共有だけでOK
              </p>

              <div className="mt-6 space-y-3">
                {YOUR_ITEMS.map((item, i) => (
                  <div
                    key={item.label}
                    className="flex items-start gap-3 rounded-xl border border-[#e4eef6] bg-[#f8fbfd] px-4 py-3"
                    style={{ transform: `translateX(${i * 4}px)` }}
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#dbeaf6] text-[10px] font-bold text-[#3a6a92]">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold leading-snug text-[#0c2a48]">
                        {item.label}
                      </p>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-[#6a8ca8]">
                        {item.sub}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ── 中央: ハンドオフライン ── */}
          <motion.div
            {...fu(0.14)}
            className="flex flex-row items-center justify-center gap-3 py-2 md:flex-col md:py-8 lg:py-10"
          >
            {/* SP: 横ライン  PC: 縦のフロー */}
            <div className="flex items-center gap-2 md:flex-col">
              {/* 上ドット */}
              <span className="hidden h-2 w-2 rounded-full bg-[#b8d0e4] md:block" aria-hidden />

              {/* ライン */}
              <span
                className="block bg-[#b8d0e4] md:h-10 md:w-[1.5px]"
                style={{ width: "3rem", height: "1.5px" }}
                aria-hidden
              />

              {/* ラベル */}
              <span className="rounded-full border border-[#cde0ef] bg-white px-3 py-1.5 text-center text-xs font-bold text-[#2c5f8a] shadow-sm whitespace-nowrap">
                NTSへ紹介
              </span>

              {/* ライン */}
              <span
                className="block bg-[#b8d0e4] md:h-10 md:w-[1.5px]"
                style={{ width: "3rem", height: "1.5px" }}
                aria-hidden
              />

              {/* 下矢印 */}
              <svg
                width="12"
                height="8"
                viewBox="0 0 12 8"
                fill="none"
                aria-hidden
                className="shrink-0 rotate-0 md:rotate-90"
              >
                <path
                  d="M1 1l5 5 5-5"
                  stroke="#8aafc8"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </motion.div>

          {/* ── 右: NTSがやること ── */}
          <motion.div {...fu(0.2)}>
            <div className="rounded-2xl border border-[#d8e6f0] bg-white p-6 shadow-[0_2px_12px_rgba(12,42,72,0.06)] lg:p-7">
              <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#0f4fa8]">
                NTSがやること
              </p>
              <p className="mt-1 text-base font-bold text-[#0c2a48]">
                制度説明から伴走まで対応
              </p>

              <ol className="mt-6 space-y-0">
                {NTS_ITEMS.map((item, i) => (
                  <li key={item} className="relative flex items-start gap-3 py-3">
                    {/* 縦のコネクションライン */}
                    {i < NTS_ITEMS.length - 1 && (
                      <span
                        className="absolute left-[15px] top-[32px] h-[calc(100%-8px)] w-px bg-[#ddeaf4]"
                        aria-hidden
                      />
                    )}
                    <span className="relative z-10 flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full border border-[#c8ddef] bg-white text-[11px] font-bold text-[#2c5f8a]">
                      {i + 1}
                    </span>
                    <div className="flex min-h-[30px] items-center">
                      <p className="text-sm font-medium leading-snug text-[#1e3a56]">
                        {item}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </motion.div>
        </div>

        {/* ── 下部の安心帯 ── */}
        <motion.div {...fu(0.28)} className="mt-6 lg:mt-8">
          <div className="flex items-center gap-4 rounded-xl border border-[#d4e8f4] bg-white px-5 py-4 shadow-[0_1px_6px_rgba(12,42,72,0.05)]">
            {/* 盾アイコン */}
            <svg
              width="28"
              height="28"
              viewBox="0 0 28 28"
              fill="none"
              className="shrink-0"
              aria-hidden
            >
              <path
                d="M14 3L4 7v8c0 5.25 4.2 10.15 10 11.33C19.8 25.15 24 20.25 24 15V7L14 3z"
                fill="#EFF6FF"
                stroke="#90BAD9"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
              <path
                d="M10 14l2.5 2.5L18 11"
                stroke="#2c6fa8"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium leading-relaxed text-[#1e3a56]">
                補助金の専門知識がなくても、顧客対応はNTSが進めます。
              </p>
            </div>

            {/* 安心ラベル */}
            <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-[#f0faf4] px-3 py-1.5">
              <span className="h-2 w-2 rounded-full bg-[#34a85a]" aria-hidden />
              <span className="text-[11px] font-bold text-[#1e7a3c]">
                安心して紹介できます
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

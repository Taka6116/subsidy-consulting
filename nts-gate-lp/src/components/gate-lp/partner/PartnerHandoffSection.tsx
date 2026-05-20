"use client";

import { motion, useReducedMotion } from "framer-motion";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.1 },
  transition: { duration: 0.55, ease: EASE_OUT, delay },
});

const NTS_ITEMS = [
  "顧客へのヒアリング",
  "課題の特定",
  "最適な補助金制度の確認",
  "補助金活用方針等の整理",
  "申請準備支援",
  "採択後の利活用戦略などの相談",
];

// ── 左側: 実務書類カード ──────────────────────────────
function DocCard({
  num,
  title,
  note,
  children,
}: {
  num: number;
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex gap-3">
      {/* 縦コネクター */}
      {num < 3 && (
        <span
          className="absolute left-[13px] top-[28px] h-[calc(100%+8px)] w-px bg-[#dce8f2]"
          aria-hidden
        />
      )}
      {/* 番号 */}
      <span className="relative z-10 mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#0c2a48] text-[11px] font-bold text-white">
        {String(num).padStart(2, "0")}
      </span>
      <div className="min-w-0 flex-1 pb-4">
        <p className="mb-1.5 text-[11px] font-bold uppercase tracking-widest text-[#5a80a0]">
          {title}
        </p>
        <div className="rounded-xl border border-[#e0ecf6] bg-white px-4 py-3 shadow-[0_1px_6px_rgba(12,42,72,0.07)]">
          {children}
        </div>
        {note && (
          <p className="mt-1.5 text-[10px] italic leading-relaxed text-[#8aabcc]">
            {note}
          </p>
        )}
      </div>
    </div>
  );
}

// ── 右側: オペレーション行 ───────────────────────────
function OpsRow({ num, label }: { num: number; label: string }) {
  return (
    <div className="flex items-center gap-3 border-b border-[#eaf1f8] py-3 last:border-b-0">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#c5dbed] bg-white text-[11px] font-bold text-[#1f5fbf]">
        {num}
      </span>
      <p className="text-sm font-medium leading-snug text-[#1e3a56]">{label}</p>
    </div>
  );
}

export default function PartnerHandoffSection() {
  const reduce = useReducedMotion();
  const fu = (d: number) => (reduce ? {} : fadeUp(d));

  return (
    <section
      className="relative py-20 md:py-28"
      style={{ background: "#F4F7FB", zIndex: 10 }}
      aria-labelledby="handoff-heading"
    >
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8">

        {/* ── 見出し ── */}
        <motion.div className="mb-10 text-center md:mb-14" {...fu(0)}>
          <h2
            id="handoff-heading"
            className="font-heading text-2xl font-bold leading-snug text-[#0c2a48] md:text-3xl lg:text-[2rem]"
          >
            紹介後の対応は、NTSが引き受けます
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-[#4a6070] md:text-base">
            提携先様にお願いするのは、補助金に関心がありそうな顧客のご紹介まで。
            <br className="hidden md:block" />
            制度説明や申請準備の支援はNTSが対応します。
          </p>
        </motion.div>

        {/* ── 3カラム本体 ── */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto_1fr] md:items-stretch lg:grid-cols-[36fr_18fr_46fr] lg:gap-4">

          {/* ────────── 左: 御社がやること ────────── */}
          <motion.div {...fu(0.06)}>
            <div className="h-full rounded-2xl border border-[#d4e6f3] bg-white p-6 shadow-[0_2px_16px_rgba(12,42,72,0.07)] lg:p-7">
              {/* ブロックヘッダー */}
              <div className="mb-5 flex items-baseline justify-between gap-2">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#5a80a0]">
                    御社がやること
                  </p>
                  <p className="mt-0.5 text-base font-bold text-[#0c2a48]">
                    最小限の共有だけでOK
                  </p>
                </div>
              </div>

              {/* 書類カード群 */}
              <div className="space-y-1">
                <DocCard
                  num={1}
                  title="顧客をご紹介"
                  note="まずはご紹介だけで大丈夫です"
                >
                  <div className="flex items-start gap-2.5">
                    {/* 会社カード風アイコン */}
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#ddeaf4] bg-[#f3f8fc]">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                        <rect x="1" y="4" width="12" height="9" rx="1.5" stroke="#5a80a0" strokeWidth="1.2" />
                        <path d="M5 4V3a2 2 0 0 1 4 0v1" stroke="#5a80a0" strokeWidth="1.2" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12px] font-bold leading-snug text-[#0c2a48]">株式会社〇〇〇〇</p>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-[#6a8ca8]">
                        製造業 &nbsp;/&nbsp; 従業員数: 45名
                        <br />
                        所在地: 東京都中央区
                      </p>
                    </div>
                  </div>
                </DocCard>

                <DocCard
                  num={2}
                  title="初回接点の共有"
                  note="商談メモや接点状況を共有いただくだけ"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#ddeaf4] bg-[#f3f8fc]">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                        <rect x="1.5" y="1.5" width="11" height="11" rx="2" stroke="#5a80a0" strokeWidth="1.2" />
                        <path d="M4 5h6M4 7.5h6M4 10h4" stroke="#5a80a0" strokeWidth="1.2" strokeLinecap="round" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12px] leading-relaxed text-[#2c4a62]">
                        商談の中で、補助金に関心があるとのご相談がありました。
                      </p>
                      <p className="mt-1 text-[11px] text-[#6a8ca8]">
                        ご担当者: 山田様（経営企画部）
                      </p>
                    </div>
                  </div>
                </DocCard>

                <DocCard
                  num={3}
                  title="商材情報の共有"
                  note="必要に応じて資料を共有いただきます"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#ddeaf4] bg-[#f3f8fc]">
                      <svg width="13" height="14" viewBox="0 0 13 14" fill="none" aria-hidden>
                        <path d="M2 1.5h6.5l2.5 2.5V12.5a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1v-10a1 1 0 0 1 1-1z" stroke="#5a80a0" strokeWidth="1.2" />
                        <path d="M8 1.5v3h3" stroke="#5a80a0" strokeWidth="1.2" />
                        <path d="M4 7h5M4 9.5h3" stroke="#5a80a0" strokeWidth="1.1" strokeLinecap="round" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12px] font-bold leading-snug text-[#0c2a48]">
                        自社サービス概要資料.pdf
                      </p>
                      <p className="mt-0.5 text-[11px] text-[#6a8ca8]">
                        更新日: 2026/05/20 &nbsp; 2.3MB
                      </p>
                    </div>
                  </div>
                </DocCard>
              </div>
            </div>
          </motion.div>

          {/* ────────── 中央: ハンドオフレーン ────────── */}
          <motion.div {...fu(0.12)}>
            <div className="flex h-full flex-row items-center justify-center gap-2 py-4 md:flex-col md:py-0">
              {/* 浮遊カード群 + ライン */}
              <div className="flex flex-row items-center gap-2 md:flex-col md:gap-3">
                {/* 浮遊カード×3 */}
                {["顧客情報", "接点メモ", "商材資料"].map((label, i) => (
                  <div
                    key={label}
                    className="rounded-lg border border-[#cddff0] bg-white px-2.5 py-1.5 text-center shadow-[0_1px_6px_rgba(12,42,72,0.09)]"
                    style={{
                      transform: `translateX(${(i - 1) * 4}px)`,
                    }}
                  >
                    <p className="text-[10px] font-bold leading-none text-[#1f5fbf] whitespace-nowrap">
                      {label}
                    </p>
                  </div>
                ))}

                {/* 区切りライン (PC: 縦, SP: 横) */}
                <div className="flex flex-row items-center gap-1 md:flex-col">
                  <span className="block h-px w-8 bg-[#b4cfe6] md:h-6 md:w-px" aria-hidden />
                  {/* 矢印 */}
                  <svg
                    width="16"
                    height="10"
                    viewBox="0 0 16 10"
                    fill="none"
                    aria-hidden
                    className="shrink-0 rotate-0 md:rotate-90"
                  >
                    <path
                      d="M1 5h12M9 1l4 4-4 4"
                      stroke="#6a9bbf"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                {/* NTSへ紹介ラベル */}
                <div className="rounded-xl border border-[#b8d4ec] bg-[#f0f7ff] px-3 py-2 text-center shadow-sm">
                  <p className="text-[11px] font-bold text-[#0c2a48] whitespace-nowrap">NTSへ紹介</p>
                </div>

                {/* 下ライン + 矢印 */}
                <div className="flex flex-row items-center gap-1 md:flex-col">
                  <svg
                    width="16"
                    height="10"
                    viewBox="0 0 16 10"
                    fill="none"
                    aria-hidden
                    className="shrink-0 rotate-0 md:rotate-90"
                  >
                    <path
                      d="M1 5h12M9 1l4 4-4 4"
                      stroke="#6a9bbf"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="block h-px w-8 bg-[#b4cfe6] md:h-6 md:w-px" aria-hidden />
                </div>
              </div>
            </div>
          </motion.div>

          {/* ────────── 右: NTSがやること ────────── */}
          <motion.div {...fu(0.18)}>
            <div className="h-full rounded-2xl border border-[#d4e6f3] bg-white p-6 shadow-[0_2px_16px_rgba(12,42,72,0.07)] lg:p-7">
              {/* ブロックヘッダー */}
              <div className="mb-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#0f4fa8]">
                  NTSがやること
                </p>
                <p className="mt-0.5 text-base font-bold text-[#0c2a48]">
                  制度説明から伴走まで対応
                </p>
              </div>

              {/* オペレーションボード */}
              <div className="divide-y divide-[#e8f0f8] rounded-xl border border-[#ddeaf4] bg-[#f8fbfd]">
                {NTS_ITEMS.map((item, i) => (
                  <OpsRow key={item} num={i + 1} label={item} />
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── 下部安心帯 ── */}
        <motion.div {...fu(0.26)} className="mt-4 lg:mt-5">
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[#d4e8f4] bg-white px-5 py-4 shadow-[0_1px_6px_rgba(12,42,72,0.05)] sm:flex-nowrap">
            {/* 盾アイコン */}
            <svg
              width="26"
              height="26"
              viewBox="0 0 26 26"
              fill="none"
              className="shrink-0"
              aria-hidden
            >
              <path
                d="M13 2L3 6.5v7.5c0 5 3.9 9.7 10 10.8 6.1-1.1 10-5.8 10-10.8V6.5L13 2z"
                fill="#EFF6FF"
                stroke="#90BAD9"
                strokeWidth="1.3"
                strokeLinejoin="round"
              />
              <path
                d="M9 13l2.5 2.5L17 10"
                stroke="#2c6fa8"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="flex-1 text-sm font-medium leading-relaxed text-[#1e3a56]">
              補助金の専門知識がなくても、顧客対応はNTSが進めます。
            </p>
            <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-[#f0faf4] px-3 py-1.5">
              <span className="h-2 w-2 rounded-full bg-[#34a85a]" aria-hidden />
              <span className="text-[11px] font-bold text-[#1e7a3c] whitespace-nowrap">
                安心して紹介できます
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

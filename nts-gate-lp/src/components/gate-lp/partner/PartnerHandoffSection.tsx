"use client";

import { motion, useReducedMotion } from "framer-motion";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.16 },
  transition: { duration: 0.52, ease: EASE_OUT, delay },
});

const NTS_ITEMS = [
  "顧客へのヒアリング",
  "課題の特定",
  "最適な補助金制度の確認",
  "補助金活用方針等の整理",
  "申請準備支援",
  "採択後の利活用戦略などの相談",
];

function LineIcon({ type }: { type: "person" | "memo" | "file" | "chat" | "search" | "plan" | "folder" | "chart" }) {
  const common = "h-5 w-5";
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#eef5ff] text-[#0b56c5] ring-1 ring-[#d7e6fb]">
      {type === "person" && (
        <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden>
          <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="1.7" />
          <path d="M6 19c.8-3.2 3-5 6-5s5.2 1.8 6 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      )}
      {type === "memo" && (
        <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden>
          <rect x="7" y="5" width="10" height="14" rx="1.8" stroke="currentColor" strokeWidth="1.7" />
          <path d="M10 9h4M10 12h4M10 15h2.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      )}
      {type === "file" && (
        <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden>
          <path d="M7 4h6l4 4v12H7V4Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
          <path d="M13 4v4h4M10 13h4M10 16h3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      )}
      {type === "chat" && (
        <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden>
          <path d="M5 6.5h14v8.5H10l-4 3v-3H5V6.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        </svg>
      )}
      {type === "search" && (
        <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden>
          <circle cx="10.5" cy="10.5" r="5" stroke="currentColor" strokeWidth="1.7" />
          <path d="m15 15 4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      )}
      {type === "plan" && (
        <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden>
          <path d="M6 5h12v14H6V5Z" stroke="currentColor" strokeWidth="1.7" />
          <path d="m9 11 2 2 4-5M9 16h6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {type === "folder" && (
        <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden>
          <path d="M4.5 8h6l1.4 2H19.5v8.5h-15V8Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        </svg>
      )}
      {type === "chart" && (
        <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden>
          <path d="M6 18V9M12 18V5M18 18v-6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
          <path d="M4 19h16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      )}
    </span>
  );
}

function HandNote({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <p
      className={`absolute z-20 text-[12px] font-bold leading-[1.7] tracking-[0.1em] text-[#466996] ${className}`}
      style={{ fontFamily: '"Yu Mincho", "Hiragino Mincho ProN", "Klee One", cursive' }}
    >
      {children}
    </p>
  );
}

function TransferCard({
  label,
  type,
  className = "",
}: {
  label: string;
  type: "person" | "memo" | "file";
  className?: string;
}) {
  return (
    <div
      className={`absolute w-[86px] rounded-xl border border-[#d6e4f4] bg-white p-2.5 shadow-[0_10px_22px_rgba(12,42,72,0.12)] ${className}`}
    >
      <p className="text-[10px] font-black leading-none text-[#17385f]">{label}</p>
      <div className="mt-2 flex justify-center">
        <LineIcon type={type} />
      </div>
      <div className="mt-2 space-y-1">
        <span className="block h-1.5 rounded bg-[#dfe7f1]" />
        <span className="block h-1.5 w-2/3 rounded bg-[#dfe7f1]" />
      </div>
    </div>
  );
}

export default function PartnerHandoffSection() {
  const reduce = useReducedMotion();
  const fu = (delay: number) => (reduce ? {} : fadeUp(delay));

  const yourItems = [
    {
      no: "01",
      title: "顧客をご紹介",
      icon: "person" as const,
      body: (
        <>
          <p className="font-black text-[#071b46]">株式会社〇〇〇〇</p>
          <p className="mt-1 text-xs font-semibold leading-5 text-[#536985]">
            製造業　従業員数：45名
            <br />
            所在地：東京都中央区
          </p>
        </>
      ),
    },
    {
      no: "02",
      title: "初回接点の共有",
      icon: "memo" as const,
      body: (
        <p className="text-xs font-semibold leading-6 text-[#344a67]">
          商談の中で、補助金に関心があるとのご相談がありました。
          <br />
          ご担当者：山田様（経営企画部）
        </p>
      ),
    },
    {
      no: "03",
      title: "商材情報の共有",
      icon: "file" as const,
      body: (
        <>
          <p className="font-black text-[#071b46]">自社サービス概要資料.pdf</p>
          <p className="mt-1 text-xs font-semibold text-[#536985]">
            更新日：2026/05/20　2.3MB
          </p>
        </>
      ),
    },
  ];

  return (
    <section
      className="relative overflow-hidden bg-[#F4F7FB] py-10 md:py-12"
      aria-labelledby="handoff-heading"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.98),rgba(244,247,251,0))]" />

      <div className="relative mx-auto max-w-[1320px] px-3 sm:px-4">
        <motion.div className="mx-auto mb-7 max-w-3xl text-center" {...fu(0)}>
          <h2
            id="handoff-heading"
            className="text-[28px] font-black leading-tight tracking-[0.04em] text-[#071b46] md:text-[38px]"
          >
            紹介後の対応は、NTSが引き受けます
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm font-medium leading-7 tracking-[0.04em] text-[#31435f] md:text-base">
            提携先様にお願いするのは、補助金に関心がありそうな顧客のご紹介まで。
            <br className="hidden md:block" />
            制度説明や申請準備の支援はNTSが対応します。
          </p>
        </motion.div>

        <div className="grid gap-4 xl:grid-cols-[430px_300px_540px] xl:items-stretch">
          {/* ── 左: 御社がやること ── */}
          <motion.div {...fu(0.06)} className="h-full">
            <div className="relative h-full rounded-[18px] border border-[#cdddf0] bg-white/90 p-4 shadow-[0_14px_34px_rgba(12,42,72,0.08)]">
              <div className="mb-3 flex items-center gap-4">
                <p className="text-2xl font-black tracking-[0.04em] text-[#071b46]">
                  御社がやること
                </p>
                <p className="ml-auto text-xs font-black tracking-[0.06em] text-[#0b56c5]">
                  最小限の共有だけでOK
                </p>
              </div>

              <div className="space-y-3">
                {yourItems.map((item) => (
                  <div
                    key={item.no}
                    className="rounded-2xl border border-[#dce7f5] bg-white p-3.5 shadow-[0_8px_20px_rgba(12,42,72,0.055)]"
                  >
                    <div className="mb-2.5 flex items-center gap-3">
                      <span className="rounded-md bg-[#072f72] px-2.5 py-1.5 text-xs font-black text-white">
                        {item.no}
                      </span>
                      <p className="text-lg font-black tracking-[0.04em] text-[#071b46]">
                        {item.title}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl border border-[#dde8f4] bg-white px-4 py-3 shadow-sm">
                      <LineIcon type={item.icon} />
                      <div className="min-w-0">{item.body}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ── 中央: ハンドオフ領域（PC のみ表示） ── */}
          <motion.div
            className="relative hidden h-full min-h-[500px] xl:block"
            {...fu(0.12)}
            aria-hidden
          >
            <svg
              className="absolute inset-0 h-full w-full overflow-visible"
              viewBox="0 0 300 500"
              preserveAspectRatio="none"
              fill="none"
            >
              <path d="M0 116 C42 126 70 140 96 156" stroke="#c8dcf3" strokeWidth="1.7" />
              <path d="M0 250 H96" stroke="#b6d1ef" strokeWidth="1.8" />
              <path d="M0 388 C44 372 72 352 96 330" stroke="#c8dcf3" strokeWidth="1.7" />

              {/* 中央→右への太い青矢印（NTSへ紹介の下に配置） */}
              <path d="M196 290 H290" stroke="#0b56c5" strokeWidth="3" strokeLinecap="round" />
              <path d="M278 278 294 290 278 302" stroke="#0b56c5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

              <path d="M90 145 C66 150 44 162 26 181" stroke="#506f99" strokeWidth="1.15" strokeLinecap="round" strokeDasharray="3 5" />
              <path d="M90 254 C66 258 44 270 26 288" stroke="#506f99" strokeWidth="1.15" strokeLinecap="round" strokeDasharray="3 5" />
              <path d="M90 365 C66 372 44 386 26 406" stroke="#506f99" strokeWidth="1.15" strokeLinecap="round" strokeDasharray="3 5" />
            </svg>

            <HandNote className="left-[10px] top-[76px] -rotate-6 whitespace-nowrap">
              まずは
              <br />
              ご紹介だけで
              <br />
              大丈夫です
            </HandNote>

            <HandNote className="left-[6px] top-[204px] -rotate-6 whitespace-nowrap">
              商談内容や接点、
              <br />
              背景やその他を
              <br />
              共有いただきます
            </HandNote>

            <HandNote className="left-[10px] top-[346px] -rotate-6 whitespace-nowrap">
              必要に応じて
              <br />
              資料を共有
              <br />
              いただきます
            </HandNote>

            <TransferCard label="顧客情報" type="person" className="left-[104px] top-[58px]" />
            <TransferCard label="接点メモ" type="memo" className="left-[104px] top-[208px]" />
            <TransferCard label="商材資料" type="file" className="left-[104px] top-[358px]" />

            {/* NTSへ紹介ラベル（矢印の上に配置） */}
            <div className="absolute left-[196px] top-[228px] whitespace-nowrap text-center">
              <p className="text-[22px] font-black leading-none tracking-[0.08em] text-[#0b56c5]">
                NTSへ
              </p>
              <p className="mt-1 text-[14px] font-black tracking-[0.12em] text-[#0b56c5]">
                紹介
              </p>
            </div>
          </motion.div>

          {/* ── 右: NTSがやること ── */}
          <motion.div {...fu(0.18)} className="h-full">
            <div className="flex h-full flex-col rounded-[18px] border border-[#cdddf0] bg-white/95 p-4 shadow-[0_14px_34px_rgba(12,42,72,0.08)]">
              <div className="mb-4 flex items-center gap-6">
                <div className="relative bg-[#0b56c5] px-6 py-3 text-xl font-black tracking-[0.04em] text-white shadow-[0_8px_18px_rgba(11,86,197,0.18)]">
                  NTSがやること
                  <span className="absolute -right-6 top-0 h-0 w-0 border-y-[24px] border-l-[24px] border-y-transparent border-l-[#0b56c5]" />
                </div>
                <p className="text-xs font-black tracking-[0.06em] text-[#0b56c5]">
                  制度説明から伴走まで対応
                </p>
              </div>

              <ol className="relative flex flex-1 flex-col rounded-2xl border border-[#dce7f5] bg-white shadow-sm">
                {NTS_ITEMS.map((item, index) => (
                  <li
                    key={item}
                    className="relative grid flex-1 grid-cols-[48px_1fr_16px] items-center gap-3 border-b border-[#e5edf6] px-4 py-3 last:border-b-0"
                  >
                    <div className="relative flex h-full items-center justify-center">
                      {index < NTS_ITEMS.length - 1 && (
                        <span className="absolute left-1/2 top-7 h-[calc(100%+14px)] w-0.5 -translate-x-1/2 bg-[#0b56c5]" />
                      )}
                      <span className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full bg-[#0b56c5] text-xs font-black text-white">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>

                    <p className="text-base font-black tracking-[0.035em] text-[#071b46]">
                      {item}
                    </p>
                    <span className="text-xl font-light text-[#6f8199]">›</span>
                  </li>
                ))}
              </ol>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

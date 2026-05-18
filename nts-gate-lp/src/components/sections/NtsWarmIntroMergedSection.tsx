"use client";

import { Fragment } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;
function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 22 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.1 },
    transition: { duration: 0.62, ease, delay },
  };
}

const CONSULTANTS = [
  {
    name: "櫻庭真之介",
    title: "中小企業診断士",
    photo: "/images/PANA3362.jpg",
    tags: ["事業計画", "資金繰り", "実行支援", "改善検証"],
    href: "/about",
  },
  {
    name: "清野洋司",
    title: "中小企業診断士",
    photo: "/images/PANA3955.jpg",
    tags: ["事業計画", "資金繰り", "実行支援", "改善検証"],
    href: "/about",
  },
];

const TAG_ICONS: Record<string, React.ReactNode> = {
  事業計画: (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
      <rect x="1.5" y="1.5" width="10" height="10" rx="2" stroke="#1d5fa8" strokeWidth="1.3" />
      <path d="M4 5h5M4 7.5h3" stroke="#1d5fa8" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  ),
  資金繰り: (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
      <circle cx="6.5" cy="6.5" r="5" stroke="#1d5fa8" strokeWidth="1.3" />
      <path d="M6.5 3.5v6M4.5 5.5h3.5" stroke="#1d5fa8" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  ),
  実行支援: (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
      <path d="M2 10.5l3.5-3.5 2.5 2 4-5" stroke="#1d5fa8" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  改善検証: (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
      <circle cx="6.5" cy="6.5" r="5" stroke="#1d5fa8" strokeWidth="1.3" />
      <path d="M4 6.5l2 2 3.5-3.5" stroke="#1d5fa8" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

function ConsultantCard({ c, delay }: { c: (typeof CONSULTANTS)[0]; delay: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      {...(reduce ? {} : fadeUp(delay))}
      className="group flex items-start gap-5 rounded-2xl border border-[#d4e8f6] bg-white p-5 shadow-[0_2px_16px_rgba(18,56,110,0.08)] transition-all duration-200 hover:border-[#7ebde8] hover:shadow-[0_6px_28px_rgba(18,56,110,0.13)] sm:p-6"
    >
      <div className="relative h-[100px] w-[100px] shrink-0 overflow-hidden rounded-2xl border border-[#d4e8f6] bg-[#edf5fb] sm:h-[112px] sm:w-[112px]">
        <Image src={c.photo} alt={c.name} fill className="object-cover object-[50%_8%]" sizes="112px" />
      </div>
      <div className="min-w-0 flex-1 pt-1">
        <p className="text-[11px] font-bold uppercase tracking-widest text-[#5a80a0]">{c.title}</p>
        <p className="mt-1 text-[20px] font-black leading-snug text-[#0c2a48]">{c.name}</p>
        <div className="mt-3 grid grid-cols-2 gap-1.5">
          {c.tags.map((tag) => (
            <span key={tag} className="flex items-center gap-1.5 rounded-lg border border-[#cde3f4] bg-[#eaf4fb] px-2.5 py-1 text-[12px] font-semibold text-[#1d5fa8]">
              {TAG_ICONS[tag]}
              {tag}
            </span>
          ))}
        </div>
        <Link href={c.href} className="mt-4 inline-flex items-center gap-1 text-[13px] font-bold text-[#1d5fa8] transition hover:underline">
          プロフィールを見る
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
    </motion.div>
  );
}

// ── 上段ステップ ─────────────────────────────────────────────
const COMMON_STEPS = ["制度を探す", "書類を整える", "採択", "終了"];

// ── 下段ステップ ─────────────────────────────────────────────
const NTS_STEPS = [
  "本質課題を整理",
  "最適な制度を選ぶ",
  "活用法まで設計",
  "導入を進める",
  "効果を測定",
  "定点観測と伴走",
];

// ── グリッド矢印セパレーター（セル間に置く） ────────────────
function ArrowSep({ muted }: { muted: boolean }) {
  return (
    <div className="flex items-center justify-center">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
        <path d="M5 2l4 5-4 5" stroke={muted ? "#a8c4d8" : "#1d6fe8"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export default function NtsWarmIntroMergedSection() {
  const reduce = useReducedMotion();

  return (
    <section
      aria-labelledby="warm-merged-heading"
      className="relative overflow-hidden py-20 md:py-28"
      style={{ background: "#f2f8fd" }}
    >
      {/* 薄いグリッド背景 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(18,60,120,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(18,60,120,0.03) 1px,transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-[1640px] px-5 sm:px-8 xl:px-10 2xl:px-12">

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
          <p className="mx-auto mt-4 max-w-2xl text-[0.97rem] leading-relaxed text-[#4a6a82] md:text-[1.05rem]">
            申請して終わりではなく、活用計画から実行後の振り返りまで伴走します。
          </p>
        </motion.div>

        {/* ── 2カラムグリッド（items-center で縦中央揃え） ── */}
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(0,1.55fr)_minmax(390px,0.7fr)] lg:gap-10 xl:gap-12">

          {/* ─── 左: 図解カード ─── */}
          <motion.div
            {...(reduce ? {} : fadeUp(0.06))}
            className="rounded-2xl border border-[#cde3f5] bg-white p-6 shadow-[0_2px_20px_rgba(18,56,110,0.08)] sm:p-8 xl:p-10 2xl:p-12"
          >
            {/* 図解タイトル */}
            <p className="mb-7 text-center text-[13px] font-bold tracking-[0.1em] text-[#5a7fa0]">
              "申請して終わり"ではない支援範囲
            </p>

            {/* ======== 上段レーン: よくある補助金支援 ======== */}
            <div className="overflow-hidden rounded-2xl border border-[#d8e8f2]">
              <div className="grid grid-cols-[120px_minmax(0,1fr)] sm:grid-cols-[140px_minmax(0,1fr)]">
                {/* 左ラベル */}
                <div className="flex flex-col items-center justify-center gap-1.5 bg-[#eef4f9] px-3 py-6 text-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="opacity-50" aria-hidden>
                    <rect x="2" y="4" width="20" height="16" rx="3" stroke="#7a9ab0" strokeWidth="1.5" />
                    <path d="M6 10h12M6 14h8" stroke="#7a9ab0" strokeWidth="1.3" strokeLinecap="round" />
                  </svg>
                  <span className="text-[11px] font-bold leading-snug text-[#7a9ab0] sm:text-[12px]">
                    よくある<br />補助金支援
                  </span>
                </div>

                {/* ステップグリッド (4列) */}
                <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] items-center gap-0 px-5 py-6 sm:px-7">
                  {COMMON_STEPS.map((s, i) => (
                    <Fragment key={s}>
                      {/* ステップノード */}
                      <div className="flex flex-col items-center gap-1.5 text-center">
                        {s === "終了" ? (
                          <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-dashed border-[#b8cdd9]">
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                              <path d="M4 4l6 6M10 4l-6 6" stroke="#a8c0d0" strokeWidth="1.6" strokeLinecap="round" />
                            </svg>
                          </div>
                        ) : (
                          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#ccdde9] bg-white">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                              {i === 0 && <><circle cx="8" cy="8" r="6" stroke="#9ab4c4" strokeWidth="1.3" /><path d="M5 8l2 2 4-4" stroke="#9ab4c4" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></>}
                              {i === 1 && <><rect x="3" y="2" width="10" height="12" rx="2" stroke="#9ab4c4" strokeWidth="1.3" /><path d="M5.5 6h5M5.5 9h3" stroke="#9ab4c4" strokeWidth="1.2" strokeLinecap="round" /></>}
                              {i === 2 && <><path d="M8 2l1.8 3.6 4 .6-2.9 2.8.7 4L8 11l-3.6 1.9.7-4L2.2 6.2l4-.6z" stroke="#9ab4c4" strokeWidth="1.3" strokeLinejoin="round" /></>}
                            </svg>
                          </div>
                        )}
                        <span
                          className={`text-[11px] font-semibold leading-tight sm:text-[12px] ${
                            s === "終了" ? "text-[#9ab4c4] line-through" : "text-[#7a9ab0]"
                          }`}
                        >
                          {s}
                        </span>
                      </div>
                      {/* 矢印 */}
                      {i < COMMON_STEPS.length - 1 && <ArrowSep muted />}
                    </Fragment>
                  ))}
                </div>
              </div>
            </div>

            {/* 区切りマーカー */}
            <div className="relative my-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-[#d0e5f5]" />
              <div className="flex items-center gap-1.5 rounded-full border border-[#b0d4ef] bg-[#e6f2fb] px-3.5 py-1.5">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
                  <path d="M6.5 1v11M3.5 9l3 3 3-3" stroke="#1d6fe8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-[11px] font-bold text-[#1d6fe8]">NTSはここが違います</span>
              </div>
              <div className="h-px flex-1 bg-[#d0e5f5]" />
            </div>

            {/* ======== 下段レーン: NTSの伴走支援 ======== */}
            <div className="overflow-hidden rounded-2xl border-2 border-[#1d6fe8] shadow-[0_8px_28px_rgba(29,111,232,0.12)]">
              <div className="grid grid-cols-[120px_minmax(0,1fr)] sm:grid-cols-[140px_minmax(0,1fr)]">
                {/* 左ラベル */}
                <div
                  className="flex flex-col items-center justify-center gap-1.5 px-3 py-6 text-center"
                  style={{ background: "linear-gradient(160deg,#1d6fe8 0%,#1452b8 100%)" }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="1.5" />
                    <path d="M7.5 12l3.5 3.5 5.5-7" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="text-[11px] font-black leading-snug text-white sm:text-[12px]">
                    NTSの<br />伴走支援
                  </span>
                </div>

                {/* ステップグリッド (6列) */}
                <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr_auto_1fr_auto_1fr] items-center gap-0 bg-[#f0f7ff] px-4 py-6 sm:px-6">
                  {NTS_STEPS.map((s, i) => (
                    <Fragment key={s}>
                      {/* ステップノード */}
                      <div className="flex flex-col items-center gap-1.5 text-center">
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-full border-2 ${
                            i >= 3
                              ? "border-[#1d6fe8] bg-[#ddeeff]"
                              : "border-[#4a9de8] bg-white"
                          }`}
                        >
                          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
                            {i === 0 && <><path d="M7.5 2v11M4 8l3.5 3.5L11 8" stroke="#1d6fe8" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></>}
                            {i === 1 && <><circle cx="7.5" cy="7.5" r="5.5" stroke="#1d6fe8" strokeWidth="1.4" /><path d="M5 7.5l2 2 3.5-3.5" stroke="#1d6fe8" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></>}
                            {i === 2 && <><rect x="2" y="3" width="11" height="9" rx="2" stroke="#1d6fe8" strokeWidth="1.4" /><path d="M5 6.5h5M5 9h3" stroke="#1d6fe8" strokeWidth="1.2" strokeLinecap="round" /></>}
                            {i === 3 && <><path d="M3 7.5h9M9 4l3 3.5-3 3.5" stroke="#1d6fe8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></>}
                            {i === 4 && <><path d="M2.5 11l3-5 2.5 3 2.5-4 2.5 3" stroke="#1d6fe8" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></>}
                            {i === 5 && <><path d="M3 7.5c0-2.5 2-4.5 4.5-4.5S12 5 12 7.5 10 12 7.5 12" stroke="#1d6fe8" strokeWidth="1.4" strokeLinecap="round" /><path d="M3 10l0-2.5 2.5 0" stroke="#1d6fe8" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></>}
                          </svg>
                        </div>
                        <span className="text-[10px] font-bold leading-tight text-[#0c3a80] sm:text-[11px]">
                          {s === "本質課題を整理" && <><span className="block">本質課題</span><span className="block">を整理</span></>}
                          {s === "最適な制度を選ぶ" && <><span className="block">最適な制度</span><span className="block">を選ぶ</span></>}
                          {s === "活用法まで設計" && <><span className="block">活用法まで</span><span className="block">設計</span></>}
                          {s === "導入を進める" && <><span className="block">導入を</span><span className="block">進める</span></>}
                          {s === "効果を測定" && <><span className="block">効果を</span><span className="block">測定</span></>}
                          {s === "定点観測と伴走" && <><span className="block">定点観測</span><span className="block">と伴走</span></>}
                        </span>
                      </div>
                      {/* 矢印 */}
                      {i < NTS_STEPS.length - 1 && <ArrowSep muted={false} />}
                    </Fragment>
                  ))}
                </div>
              </div>
            </div>

            {/* 下部メッセージ */}
            <div className="mt-5 flex items-center gap-2.5 rounded-xl bg-[#e4f0fb] px-5 py-3.5">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="shrink-0" aria-hidden>
                <circle cx="9" cy="9" r="8" fill="#1d6fe8" />
                <path d="M5.5 9l2.5 2.5 4.5-5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="text-[13px] font-semibold leading-relaxed text-[#0c3360] sm:text-[14px]">
                補助金を<strong>"もらう"</strong>だけでなく、<strong>事業にどう活かすか</strong>まで一緒に考えます。
              </p>
            </div>
          </motion.div>

          {/* ─── 右: コンサルタントカード群 ─── */}
          <div className="flex flex-col justify-center gap-5">
            {CONSULTANTS.map((c, i) => (
              <ConsultantCard key={c.name} c={c} delay={0.1 + i * 0.09} />
            ))}
            <motion.p
              {...(reduce ? {} : fadeUp(0.28))}
              className="rounded-xl border border-[#cce0f0] bg-white px-4 py-3 text-[11px] leading-relaxed text-[#6a8aa0]"
            >
              ※ NTSは補助金活用支援・申請準備支援を行います。官公署提出書類作成等が必要な場合は、提携専門家と連携します。
            </motion.p>
          </div>
        </div>

        {/* ── CTA（2カラム外、左寄せ） ── */}
        <motion.div
          {...(reduce ? {} : fadeUp(0.18))}
          className="mt-8 flex flex-wrap items-center gap-4 lg:max-w-[60%]"
        >
          <Link
            href="/consult"
            className="inline-flex items-center gap-2.5 rounded-xl bg-[#1d6fe8] px-8 py-4 text-[16px] font-black text-white shadow-[0_4px_22px_rgba(29,111,232,0.32)] transition hover:-translate-y-0.5 hover:bg-[#1a60d0] hover:shadow-[0_8px_30px_rgba(29,111,232,0.38)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1d6fe8]"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
              <rect x="2" y="4" width="16" height="12" rx="2.5" stroke="white" strokeWidth="1.6" />
              <path d="M2 8h16" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M6 13h4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            無料相談で確認する
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <p className="flex items-center gap-1.5 text-[13px] text-[#527090]">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
              <circle cx="7.5" cy="7.5" r="6.5" stroke="#527090" strokeWidth="1.3" />
              <path d="M7.5 4.5v4l2.5 1.5" stroke="#527090" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            初回は、対象制度と活用目的を整理します。
          </p>
        </motion.div>

      </div>
    </section>
  );
}

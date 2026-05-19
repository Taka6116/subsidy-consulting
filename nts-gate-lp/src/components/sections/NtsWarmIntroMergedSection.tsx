"use client";

import { Fragment } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
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

const CONSULTANTS = [
  {
    name: "櫻庭真之介",
    title: "中小企業診断士",
    photo: sakurabaPhoto,
    bio: "20○○に日本提携支援にジョイン。○○の業界で○○年に従事し○○の経験や実績があります。",
    /** 顔が小さく見えないよう object-position（%） */
    photoObjectPosition: "50% 12%" as const,
    photoScale: 1.32,
  },
  {
    name: "清野洋司",
    title: "中小企業診断士",
    photo: seinoPhoto,
    bio: "20○○に日本提携支援にジョイン。○○の業界で○○年に従事し○○の経験や実績があります。",
    photoObjectPosition: "48% 6%" as const,
    photoScale: 1.48,
  },
];

function ConsultantCard({ c, delay }: { c: (typeof CONSULTANTS)[0]; delay: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      {...(reduce ? {} : fadeUp(delay))}
      className="group flex items-stretch gap-6 rounded-2xl border border-[#d4e8f6] bg-white p-6 shadow-[0_2px_16px_rgba(18,56,110,0.08)] transition-all duration-200 hover:border-[#7ebde8] hover:shadow-[0_6px_28px_rgba(18,56,110,0.13)] sm:gap-7 sm:p-8"
    >
      {/* 縦長の楕円（カプセル）フレーム — 前回比 約1.2倍＋拡大で顔アップ */}
      <div className="relative h-[202px] w-[125px] shrink-0 overflow-hidden rounded-full border border-[#d4e8f6] bg-[#edf5fb] sm:h-[226px] sm:w-[142px]">
        <Image
          src={c.photo}
          alt={c.name}
          fill
          className="object-cover"
          style={{
            objectPosition: c.photoObjectPosition,
            transform: `scale(${c.photoScale})`,
            transformOrigin: c.photoObjectPosition.replace(/\s+/, " "),
          }}
          sizes="(min-width: 640px) 284px, 250px"
          quality={92}
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center pt-0.5">
        <p className="text-[12px] font-bold uppercase tracking-widest text-[#5a80a0] sm:text-[13px]">{c.title}</p>
        <p className="mt-1.5 text-[22px] font-black leading-snug text-[#0c2a48] sm:text-[24px]">{c.name}</p>
        <p className="mt-4 text-[14px] leading-relaxed text-[#4a6a82] sm:text-[15px]">{c.bio}</p>
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
      className="relative overflow-hidden bg-[#f0f4fa] py-20 md:py-28"
    >
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
            目的は事業成長。　補助金はあくまで手段です。
          </p>
        </motion.div>

        {/* ── 2カラム（lg: 同じ高さに伸長。脚注はグリッド下で全幅） ── */}
        <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-[minmax(0,1.32fr)_minmax(480px,1fr)] lg:gap-10 xl:gap-12">

          {/* ─── 左: 図解カード（右の2枚のカード列と底を揃える） ─── */}
          <motion.div
            {...(reduce ? {} : fadeUp(0.06))}
            className="flex h-full min-h-0 flex-col rounded-2xl border border-[#cde3f5] bg-white p-6 shadow-[0_2px_20px_rgba(18,56,110,0.08)] sm:p-8 xl:p-10 2xl:p-12"
          >
            {/* 図解タイトル */}
            <p className="mb-7 shrink-0 text-center text-[13px] font-bold tracking-[0.1em] text-[#5a7fa0]">
              &ldquo;申請して終わり&rdquo;ではない支援範囲
            </p>

            <div className="flex min-h-0 flex-1 flex-col justify-between gap-5">
              <div className="shrink-0 space-y-4">
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
            <div className="relative flex items-center gap-3">
              <div className="h-px flex-1 bg-[#d0e5f5]" />
              <div className="flex items-center gap-1.5 rounded-full border border-[#b0d4ef] bg-[#e6f2fb] px-3.5 py-1.5">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
                  <path d="M6.5 1v11M3.5 9l3 3 3-3" stroke="#1d6fe8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-[11px] font-bold text-[#1d6fe8]">日本提携支援なら・・・</span>
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
            </div>

            {/* 下部メッセージ */}
            <div className="shrink-0 rounded-xl bg-[#e4f0fb] px-5 py-3.5">
              <p className="text-[13px] font-semibold leading-relaxed text-[#0c3360] sm:text-[14px]">
                補助金を<strong>&ldquo;採択&rdquo;</strong>だけでなく、<strong>事業にどう活かすか</strong>まで一緒に考えます。ーだから伴走なんです
              </p>
            </div>
            </div>
          </motion.div>

          {/* ─── 右: コンサルタントカードのみ（高さはここで左列と揃える） ─── */}
          <div className="flex h-full min-h-0 flex-col gap-6 lg:gap-7">
            {CONSULTANTS.map((c, i) => (
              <ConsultantCard key={c.name} c={c} delay={0.1 + i * 0.09} />
            ))}
          </div>
        </div>

        <motion.p
          {...(reduce ? {} : fadeUp(0.24))}
          className="mx-auto mt-6 max-w-[1640px] rounded-xl border border-[#cce0f0] bg-white px-4 py-3 text-[11px] leading-relaxed text-[#6a8aa0] sm:px-5"
        >
          ※ NTSは補助金活用支援・申請準備支援を行います。官公署提出書類作成等が必要な場合は、提携専門家と連携します。
        </motion.p>

        {/* ── CTA（セクション内 左右中央） ── */}
        <motion.div {...(reduce ? {} : fadeUp(0.18))} className="mt-8 flex justify-center">
          <Link
            href="/consult"
            className="inline-flex items-center justify-center rounded-xl bg-[#1d6fe8] px-8 py-4 text-[16px] font-black text-white shadow-[0_4px_22px_rgba(29,111,232,0.32)] transition hover:-translate-y-0.5 hover:bg-[#1a60d0] hover:shadow-[0_8px_30px_rgba(29,111,232,0.38)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1d6fe8]"
          >
            無料相談で確認する
          </Link>
        </motion.div>

      </div>
    </section>
  );
}

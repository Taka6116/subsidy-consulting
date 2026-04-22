"use client";

import Image from "next/image";
import { CheckCircle2, XCircle } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import imgOther from "../../../icon-assets/isometric_12.webp";
import imgNts from "../../../icon-assets/isometric_14.webp";
import {
  fadeInUpInitial,
  fadeInUpInView,
  fadeInUpReduced,
  fadeInUpTransition,
  fadeInUpViewport,
} from "@/components/sections/sectionStyles";

type Axis = {
  axis: string;
  other: string;
  nts: string;
};

const AXES: readonly Axis[] = [
  {
    axis: "書類作成",
    other: "AIで自動生成。通過率が下がる傾向。",
    nts: "審査側の視点を踏まえ、提携行政書士と一緒に設計。",
  },
  {
    axis: "事務局対応",
    other: "対応できない／社長ご本人が対応することに。",
    nts: "NTSが代わりに対応。社長の時間を守ります。",
  },
  {
    axis: "採択後",
    other: "申請で関係が終わる。",
    nts: "1年間伴走。実績報告・精算・効果検証まで。",
  },
  {
    axis: "姿勢",
    other: "書類を作ることが目的。",
    nts: "採択の先の“活用”まで、責任を持つ。",
  },
] as const;

const OTHER_TAGLINE = "申請で、関係が終わる。";
const NTS_TAGLINE = "採択の先まで、一緒に走る。";

export default function NtsComparisonSection() {
  const reduce = useReducedMotion();

  return (
    <section
      className="section-block bg-section-white text-[var(--text-primary)]"
      style={{ zIndex: 10 }}
      aria-labelledby="home-nts-comparison-heading"
    >
      <div className="section-inner">
        <motion.div
          className="mb-10 text-center md:mb-14"
          initial={reduce ? fadeInUpReduced : fadeInUpInitial}
          whileInView={reduce ? fadeInUpReduced : fadeInUpInView}
          viewport={fadeInUpViewport}
          transition={fadeInUpTransition}
        >
          <p className="sec-label mb-4">COMPARISON</p>
          <h2
            id="home-nts-comparison-heading"
            className="font-heading text-[1.75rem] font-bold leading-snug text-[var(--text-primary)] md:text-[2.25rem]"
          >
            他社との違い、ひとめで。
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[var(--text-secondary)] md:text-lg">
            補助金活用のパートナーを選ぶとき、どこを見ればいいのか。
            <br className="hidden md:inline" />
            一緒に働く相手として、4つの視点で比較してみてください。
          </p>
        </motion.div>

        {/* ===== Desktop (md+): visual headers + table rows ===== */}
        <motion.div
          className="hidden md:block"
          initial={reduce ? fadeInUpReduced : fadeInUpInitial}
          whileInView={reduce ? fadeInUpReduced : fadeInUpInView}
          viewport={fadeInUpViewport}
          transition={{ ...fadeInUpTransition, delay: 0.08 }}
        >
          <div
            className="overflow-hidden rounded-[24px] border border-[var(--border-subtle)] bg-white shadow-[0_12px_40px_rgba(26,76,142,0.10)]"
            role="table"
            aria-label="他社とNTSの比較"
          >
            {/* ---- Visual header row ---- */}
            <div
              className="grid grid-cols-[minmax(140px,200px)_1fr_1fr]"
              role="row"
            >
              {/* axis gutter (empty) */}
              <div className="bg-[var(--bg-section-alt)]" aria-hidden />

              {/* 他社 visual */}
              <div className="relative border-l border-[var(--border-subtle)] bg-[#f4f6fa] px-6 pt-8 pb-7">
                <div className="mb-3 text-center">
                  <span className="inline-block rounded-full bg-white px-4 py-1 font-heading text-[0.78rem] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)] shadow-[0_2px_6px_rgba(26,76,142,0.06)]">
                    他社
                  </span>
                </div>
                <div className="relative mx-auto aspect-[4/3] w-full max-w-[220px]">
                  <Image
                    src={imgOther}
                    alt="他社の支援イメージ：書類作成で関係が終わる"
                    fill
                    sizes="220px"
                    className="object-contain opacity-90"
                    style={{ filter: "grayscale(0.45) saturate(0.85)" }}
                  />
                </div>
                <p className="mt-4 text-center font-heading text-[1.05rem] font-bold leading-snug text-[var(--text-secondary)] lg:text-[1.125rem]">
                  {OTHER_TAGLINE}
                </p>
              </div>

              {/* NTS visual (highlighted) */}
              <div className="relative border-l border-[var(--border-subtle)] bg-[linear-gradient(180deg,rgba(0,184,148,0.12)_0%,rgba(0,184,148,0.06)_100%)] px-6 pt-8 pb-7">
                <span className="absolute left-0 top-0 h-full w-[4px] bg-[var(--accent-teal)]" />
                <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-[var(--accent-teal)] px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.1em] text-white shadow-[0_2px_8px_rgba(0,184,148,0.35)]">
                  RECOMMEND
                </span>
                <div className="mb-3 text-center">
                  <span className="inline-block rounded-full bg-[var(--accent-teal)] px-4 py-1 font-heading text-[0.78rem] font-bold uppercase tracking-[0.14em] text-white shadow-[0_2px_8px_rgba(0,184,148,0.35)]">
                    NTS
                  </span>
                </div>
                <div className="relative mx-auto aspect-[4/3] w-full max-w-[220px]">
                  <Image
                    src={imgNts}
                    alt="NTSの支援イメージ：採択後も1年間伴走"
                    fill
                    sizes="220px"
                    className="object-contain"
                  />
                </div>
                <p className="mt-4 text-center font-heading text-[1.05rem] font-bold leading-snug text-[var(--text-primary)] lg:text-[1.125rem]">
                  {NTS_TAGLINE}
                </p>
              </div>
            </div>

            {/* ---- Body rows ---- */}
            {AXES.map((row) => (
              <div
                key={row.axis}
                className="grid grid-cols-[minmax(140px,200px)_1fr_1fr] border-t border-[var(--border-subtle)]"
                role="row"
              >
                <div
                  className="flex items-center bg-[var(--bg-section-alt)] px-6 py-6 font-heading text-[1.05rem] font-bold text-[var(--text-primary)] lg:text-lg"
                  role="rowheader"
                >
                  {row.axis}
                </div>
                <div
                  className="flex items-start gap-3 border-l border-[var(--border-subtle)] px-6 py-6"
                  role="cell"
                >
                  <XCircle
                    className="mt-0.5 h-5 w-5 shrink-0 text-[#9aa5b3]"
                    aria-hidden
                  />
                  <p className="text-[0.95rem] leading-[1.85] text-[var(--text-secondary)] lg:text-base">
                    {row.other}
                  </p>
                </div>
                <div
                  className="relative flex items-start gap-3 border-l border-[var(--border-subtle)] bg-[rgba(0,184,148,0.06)] px-6 py-6"
                  role="cell"
                >
                  <span className="absolute left-0 top-0 h-full w-[4px] bg-[var(--accent-teal)]" />
                  <CheckCircle2
                    className="mt-0.5 h-5 w-5 shrink-0 text-[var(--accent-teal)]"
                    aria-hidden
                  />
                  <p className="text-[0.95rem] font-medium leading-[1.85] text-[var(--text-primary)] lg:text-base">
                    {row.nts}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ===== Mobile (<md): visual pair header + stacked axis blocks ===== */}
        <div className="md:hidden">
          {/* Visual pair header */}
          <motion.div
            className="mb-6 grid grid-cols-2 gap-3"
            initial={reduce ? fadeInUpReduced : fadeInUpInitial}
            whileInView={reduce ? fadeInUpReduced : fadeInUpInView}
            viewport={fadeInUpViewport}
            transition={{ ...fadeInUpTransition, delay: 0.05 }}
          >
            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[#f4f6fa] p-3 pb-4">
              <div className="mb-2 text-center">
                <span className="inline-block rounded-full bg-white px-3 py-0.5 font-heading text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                  他社
                </span>
              </div>
              <div className="relative mx-auto aspect-[4/3] w-full max-w-[140px]">
                <Image
                  src={imgOther}
                  alt="他社の支援イメージ"
                  fill
                  sizes="140px"
                  className="object-contain opacity-90"
                  style={{ filter: "grayscale(0.45) saturate(0.85)" }}
                />
              </div>
              <p className="mt-2 text-center font-heading text-[0.82rem] font-bold leading-snug text-[var(--text-secondary)]">
                {OTHER_TAGLINE}
              </p>
            </div>
            <div className="relative overflow-hidden rounded-2xl border border-[rgba(0,184,148,0.25)] bg-[linear-gradient(180deg,rgba(0,184,148,0.12)_0%,rgba(0,184,148,0.06)_100%)] p-3 pb-4">
              <span className="absolute left-0 top-0 h-full w-[3px] bg-[var(--accent-teal)]" />
              <div className="mb-2 text-center">
                <span className="inline-block rounded-full bg-[var(--accent-teal)] px-3 py-0.5 font-heading text-[0.65rem] font-bold uppercase tracking-[0.12em] text-white">
                  NTS
                </span>
              </div>
              <div className="relative mx-auto aspect-[4/3] w-full max-w-[140px]">
                <Image
                  src={imgNts}
                  alt="NTSの支援イメージ"
                  fill
                  sizes="140px"
                  className="object-contain"
                />
              </div>
              <p className="mt-2 text-center font-heading text-[0.82rem] font-bold leading-snug text-[var(--text-primary)]">
                {NTS_TAGLINE}
              </p>
            </div>
          </motion.div>

          {/* Axis blocks */}
          <div className="flex flex-col gap-4">
            {AXES.map((row, i) => (
              <motion.div
                key={row.axis}
                initial={reduce ? fadeInUpReduced : fadeInUpInitial}
                whileInView={reduce ? fadeInUpReduced : fadeInUpInView}
                viewport={fadeInUpViewport}
                transition={{ ...fadeInUpTransition, delay: 0.06 + i * 0.04 }}
                className="rounded-2xl border border-[var(--border-subtle)] bg-white p-4 shadow-[0_4px_18px_rgba(26,76,142,0.06)]"
              >
                <div className="mb-3 flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-[var(--accent-teal)]" />
                  <h3 className="font-heading text-[0.95rem] font-bold text-[var(--text-primary)]">
                    {row.axis}
                  </h3>
                </div>

                <div className="rounded-xl border border-[var(--border-subtle)] bg-[#f7f9fc] p-3">
                  <div className="mb-1.5 flex items-center gap-1.5">
                    <XCircle className="h-4 w-4 text-[#9aa5b3]" aria-hidden />
                    <span className="font-heading text-[0.7rem] font-bold uppercase tracking-[0.1em] text-[var(--text-muted)]">
                      他社
                    </span>
                  </div>
                  <p className="text-[0.88rem] leading-[1.8] text-[var(--text-secondary)]">
                    {row.other}
                  </p>
                </div>

                <div className="relative mt-2.5 overflow-hidden rounded-xl border border-[rgba(0,184,148,0.25)] bg-[rgba(0,184,148,0.07)] p-3">
                  <span className="absolute left-0 top-0 h-full w-[3px] bg-[var(--accent-teal)]" />
                  <div className="mb-1.5 flex items-center gap-1.5">
                    <CheckCircle2
                      className="h-4 w-4 text-[var(--accent-teal)]"
                      aria-hidden
                    />
                    <span className="font-heading text-[0.7rem] font-bold uppercase tracking-[0.1em] text-[var(--accent-teal)]">
                      NTS
                    </span>
                  </div>
                  <p className="text-[0.88rem] font-medium leading-[1.8] text-[var(--text-primary)]">
                    {row.nts}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
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
          className="mb-12 text-center md:mb-16"
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

        {/* ===== Desktop (md+): table-like 3-column grid ===== */}
        <motion.div
          className="hidden md:block"
          initial={reduce ? fadeInUpReduced : fadeInUpInitial}
          whileInView={reduce ? fadeInUpReduced : fadeInUpInView}
          viewport={fadeInUpViewport}
          transition={{ ...fadeInUpTransition, delay: 0.08 }}
        >
          <div
            className="overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-white shadow-[0_8px_32px_rgba(26,76,142,0.08)]"
            role="table"
            aria-label="他社とNTSの比較"
          >
            {/* Header row */}
            <div
              className="grid grid-cols-[minmax(140px,200px)_1fr_1fr] border-b border-[var(--border-subtle)] bg-[var(--bg-section-alt)]"
              role="row"
            >
              <div
                className="px-6 py-5 font-heading text-[0.78rem] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]"
                role="columnheader"
              >
                比較軸
              </div>
              <div
                className="border-l border-[var(--border-subtle)] px-6 py-5 font-heading text-base font-bold text-[var(--text-secondary)]"
                role="columnheader"
              >
                他社
              </div>
              <div
                className="relative border-l border-[var(--border-subtle)] bg-[rgba(0,184,148,0.06)] px-6 py-5 font-heading text-base font-bold text-[var(--accent-teal)]"
                role="columnheader"
              >
                <span className="absolute left-0 top-0 h-full w-[3px] bg-[var(--accent-teal)]" />
                NTS
              </div>
            </div>

            {/* Body rows */}
            {AXES.map((row, i) => (
              <div
                key={row.axis}
                className={`grid grid-cols-[minmax(140px,200px)_1fr_1fr] ${
                  i < AXES.length - 1
                    ? "border-b border-[var(--border-subtle)]"
                    : ""
                }`}
                role="row"
              >
                <div
                  className="flex items-center px-6 py-6 font-heading text-[1.05rem] font-bold text-[var(--text-primary)] lg:text-lg"
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
                  <span className="absolute left-0 top-0 h-full w-[3px] bg-[var(--accent-teal)]" />
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

        {/* ===== Mobile (<md): stacked axis blocks ===== */}
        <div className="flex flex-col gap-6 md:hidden">
          {AXES.map((row, i) => (
            <motion.div
              key={row.axis}
              initial={reduce ? fadeInUpReduced : fadeInUpInitial}
              whileInView={reduce ? fadeInUpReduced : fadeInUpInView}
              viewport={fadeInUpViewport}
              transition={{ ...fadeInUpTransition, delay: 0.06 + i * 0.04 }}
              className="rounded-2xl border border-[var(--border-subtle)] bg-white p-5 shadow-[0_4px_18px_rgba(26,76,142,0.06)]"
            >
              <div className="mb-4 flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-[var(--accent-teal)]" />
                <h3 className="font-heading text-base font-bold text-[var(--text-primary)]">
                  {row.axis}
                </h3>
              </div>

              <div className="rounded-xl border border-[var(--border-subtle)] bg-[#f7f9fc] p-4">
                <div className="mb-1.5 flex items-center gap-1.5">
                  <XCircle className="h-4 w-4 text-[#9aa5b3]" aria-hidden />
                  <span className="font-heading text-[0.72rem] font-bold uppercase tracking-[0.1em] text-[var(--text-muted)]">
                    他社
                  </span>
                </div>
                <p className="text-[0.9rem] leading-[1.8] text-[var(--text-secondary)]">
                  {row.other}
                </p>
              </div>

              <div className="relative mt-3 overflow-hidden rounded-xl border border-[rgba(0,184,148,0.25)] bg-[rgba(0,184,148,0.07)] p-4">
                <span className="absolute left-0 top-0 h-full w-[3px] bg-[var(--accent-teal)]" />
                <div className="mb-1.5 flex items-center gap-1.5">
                  <CheckCircle2
                    className="h-4 w-4 text-[var(--accent-teal)]"
                    aria-hidden
                  />
                  <span className="font-heading text-[0.72rem] font-bold uppercase tracking-[0.1em] text-[var(--accent-teal)]">
                    NTS
                  </span>
                </div>
                <p className="text-[0.9rem] font-medium leading-[1.8] text-[var(--text-primary)]">
                  {row.nts}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

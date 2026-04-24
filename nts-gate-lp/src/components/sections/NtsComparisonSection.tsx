"use client";

import { CheckCircle2, XCircle, MinusCircle } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import {
  fadeInUpInitial,
  fadeInUpInView,
  fadeInUpReduced,
  fadeInUpTransition,
  fadeInUpViewport,
} from "@/components/sections/sectionStyles";

type CellValue = "good" | "bad" | "partial";

type Axis = {
  axis: string;
  other: { label: string; value: CellValue };
  platform: { label: string; value: CellValue };
  nts: { label: string; value: CellValue };
};

const AXES: readonly Axis[] = [
  {
    axis: "費用",
    other: { label: "数十万〜数百万円", value: "bad" },
    platform: { label: "数万〜数十万円", value: "partial" },
    nts: { label: "成果報酬型で明快", value: "good" },
  },
  {
    axis: "書類作成",
    other: { label: "担当者任せ・品質にムラ", value: "partial" },
    platform: { label: "AI自動生成。通過率が下がる傾向", value: "bad" },
    nts: { label: "審査側視点＋提携行政書士で設計", value: "good" },
  },
  {
    axis: "各種対応サポート",
    other: { label: "別途費用が発生することが多い", value: "bad" },
    platform: { label: "対応不可／経営者本人が対応", value: "bad" },
    nts: { label: "NTSが代わりに対応。経営者の時間を守る", value: "good" },
  },
  {
    axis: "採択後フォロー",
    other: { label: "申請で関係が終わる", value: "bad" },
    platform: { label: "申請で関係が終わる", value: "bad" },
    nts: { label: "1年間伴走。実績報告・精算・効果検証まで", value: "good" },
  },
  {
    axis: "担当者の専門性",
    other: { label: "若手〜実績豊富まで差がある", value: "partial" },
    platform: { label: "担当者なし", value: "bad" },
    nts: { label: "補助金専門コンサルタントが対応", value: "good" },
  },
  {
    axis: "姿勢",
    other: { label: "書類を作ることが目的", value: "bad" },
    platform: { label: "申請件数を増やすことが目的", value: "bad" },
    nts: { label: "採択の先の「活用」まで責任を持つ", value: "good" },
  },
] as const;

function CellIcon({ value }: { value: CellValue }) {
  if (value === "good")
    return (
      <CheckCircle2
        className="h-5 w-5 shrink-0 text-[var(--accent-teal)]"
        aria-hidden
      />
    );
  if (value === "partial")
    return (
      <MinusCircle className="h-5 w-5 shrink-0 text-amber-400" aria-hidden />
    );
  return (
    <XCircle className="h-5 w-5 shrink-0 text-[#9aa5b3]" aria-hidden />
  );
}

export default function NtsComparisonSection() {
  const reduce = useReducedMotion();

  return (
    <section
      className="section-block bg-section-white text-[var(--text-primary)]"
      style={{ zIndex: 10 }}
      aria-labelledby="home-nts-comparison-heading"
    >
      <div className="section-inner">
        {/* ── ヘッダー ── */}
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
            一緒に働く相手として、6つの視点で比較してみてください。
          </p>
        </motion.div>

        {/* ── デスクトップ表（md+） ── */}
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
            aria-label="他社・プラットフォーム・NTSの比較"
          >
            {/* ── カラムヘッダー ── */}
            <div
              className="grid grid-cols-[minmax(130px,180px)_1fr_1fr_1.15fr]"
              role="row"
            >
              {/* 比較軸ラベル列（空） */}
              <div
                className="flex items-end bg-[var(--bg-section-alt)] px-5 pb-5 pt-8"
                aria-hidden
              >
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                  比較項目
                </p>
              </div>

              {/* 他社 */}
              <div className="border-l border-[var(--border-subtle)] bg-[#dfe3ea] px-6 pb-6 pt-7 text-center">
                <span className="inline-block rounded-full bg-white/70 px-4 py-1 font-heading text-[0.78rem] font-bold uppercase tracking-[0.14em] text-[#7a8392]">
                  補助金会社・FA
                </span>
                <p className="mt-4 font-heading text-[1rem] font-bold leading-snug text-[#7a8392] lg:text-[1.05rem]">
                  申請で、関係が終わる。
                </p>
              </div>

              {/* プラットフォーム */}
              <div className="border-l border-[var(--border-subtle)] bg-[#e8ecf1] px-6 pb-6 pt-7 text-center">
                <span className="inline-block rounded-full bg-white/70 px-4 py-1 font-heading text-[0.78rem] font-bold uppercase tracking-[0.14em] text-[#7a8392]">
                  補助金プラットフォーム
                </span>
                <p className="mt-4 font-heading text-[1rem] font-bold leading-snug text-[#7a8392] lg:text-[1.05rem]">
                  ツールだけで、終わる。
                </p>
              </div>

              {/* NTS（ハイライト） */}
              <div className="relative border-l border-[var(--border-subtle)] bg-[linear-gradient(180deg,rgba(0,184,148,0.14)_0%,rgba(0,184,148,0.06)_100%)] px-6 pb-6 pt-7 text-center">
                <span className="absolute left-0 top-0 h-full w-[4px] bg-[var(--accent-teal)]" />
                <span className="inline-block rounded-full bg-[var(--accent-teal)] px-4 py-1 font-heading text-[0.78rem] font-bold uppercase tracking-[0.14em] text-white shadow-[0_2px_8px_rgba(0,184,148,0.35)]">
                  NTS ニュースタンダード
                </span>
                <p className="mt-4 font-heading text-[1rem] font-bold leading-snug text-[var(--text-primary)] lg:text-[1.05rem]">
                  採択の先まで、一緒に走る。
                </p>
              </div>
            </div>

            {/* ── 比較行 ── */}
            {AXES.map((row) => (
              <div
                key={row.axis}
                className="grid grid-cols-[minmax(130px,180px)_1fr_1fr_1.15fr] border-t border-[var(--border-subtle)]"
                role="row"
              >
                {/* 軸ラベル */}
                <div
                  className="flex items-center bg-[var(--bg-section-alt)] px-5 py-5 font-heading text-[0.95rem] font-bold text-[var(--text-primary)] lg:text-[1rem]"
                  role="rowheader"
                >
                  {row.axis}
                </div>

                {/* 他社 */}
                <div
                  className="flex items-start gap-2.5 border-l border-[var(--border-subtle)] bg-[#eef1f5] px-5 py-5"
                  role="cell"
                >
                  <CellIcon value={row.other.value} />
                  <p className="text-[0.88rem] leading-[1.85] text-[#8a94a3] lg:text-[0.95rem]">
                    {row.other.label}
                  </p>
                </div>

                {/* プラットフォーム */}
                <div
                  className="flex items-start gap-2.5 border-l border-[var(--border-subtle)] bg-[#f0f3f7] px-5 py-5"
                  role="cell"
                >
                  <CellIcon value={row.platform.value} />
                  <p className="text-[0.88rem] leading-[1.85] text-[#8a94a3] lg:text-[0.95rem]">
                    {row.platform.label}
                  </p>
                </div>

                {/* NTS（ハイライト） */}
                <div
                  className="relative flex items-start gap-2.5 border-l border-[var(--border-subtle)] bg-[rgba(0,184,148,0.06)] px-5 py-5"
                  role="cell"
                >
                  <span className="absolute left-0 top-0 h-full w-[4px] bg-[var(--accent-teal)]" />
                  <CellIcon value={row.nts.value} />
                  <p className="text-[0.88rem] font-semibold leading-[1.85] text-[var(--text-primary)] lg:text-[0.95rem]">
                    {row.nts.label}
                  </p>
                </div>
              </div>
            ))}

            {/* ── フッター注釈 ── */}
            <div className="border-t border-[var(--border-subtle)] bg-[var(--bg-section-alt)] px-6 py-4">
              <p className="text-[0.72rem] leading-relaxed text-[var(--text-secondary)]">
                ※ NTSへの相談は無料です。採択後の成果報酬については個別にご案内いたします。
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── モバイル表（〜md） ── */}
        <div className="md:hidden">
          <div className="flex flex-col gap-4">
            {AXES.map((row, i) => (
              <motion.div
                key={row.axis}
                initial={reduce ? fadeInUpReduced : fadeInUpInitial}
                whileInView={reduce ? fadeInUpReduced : fadeInUpInView}
                viewport={fadeInUpViewport}
                transition={{ ...fadeInUpTransition, delay: 0.04 + i * 0.04 }}
                className="overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-white shadow-[0_4px_18px_rgba(26,76,142,0.06)]"
              >
                {/* 軸タイトル */}
                <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] bg-[var(--bg-section-alt)] px-4 py-3">
                  <span className="inline-block h-2 w-2 rounded-full bg-[var(--accent-teal)]" />
                  <h3 className="font-heading text-[0.92rem] font-bold text-[var(--text-primary)]">
                    {row.axis}
                  </h3>
                </div>

                <div className="divide-y divide-[var(--border-subtle)]">
                  {/* 他社 */}
                  <div className="flex items-start gap-2.5 bg-[#eef1f5] px-4 py-3.5">
                    <CellIcon value={row.other.value} />
                    <div>
                      <p className="mb-0.5 font-heading text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[#7a8392]">
                        補助金会社・FA
                      </p>
                      <p className="text-[0.84rem] leading-[1.8] text-[#8a94a3]">
                        {row.other.label}
                      </p>
                    </div>
                  </div>

                  {/* プラットフォーム */}
                  <div className="flex items-start gap-2.5 bg-[#f0f3f7] px-4 py-3.5">
                    <CellIcon value={row.platform.value} />
                    <div>
                      <p className="mb-0.5 font-heading text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[#7a8392]">
                        補助金プラットフォーム
                      </p>
                      <p className="text-[0.84rem] leading-[1.8] text-[#8a94a3]">
                        {row.platform.label}
                      </p>
                    </div>
                  </div>

                  {/* NTS */}
                  <div className="relative flex items-start gap-2.5 bg-[rgba(0,184,148,0.07)] px-4 py-3.5">
                    <span className="absolute left-0 top-0 h-full w-[3px] bg-[var(--accent-teal)]" />
                    <CellIcon value={row.nts.value} />
                    <div>
                      <p className="mb-0.5 font-heading text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[var(--accent-teal)]">
                        NTS ニュースタンダード
                      </p>
                      <p className="text-[0.84rem] font-semibold leading-[1.8] text-[var(--text-primary)]">
                        {row.nts.label}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <p className="mt-5 text-center text-[0.72rem] leading-relaxed text-[var(--text-secondary)]">
            ※ NTSへの相談は無料です。採択後の成果報酬については個別にご案内いたします。
          </p>
        </div>
      </div>
    </section>
  );
}

"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  fadeInUpInView,
  fadeInUpInitial,
  fadeInUpReduced,
  fadeInUpTransition,
  fadeInUpViewport,
  glassShellClass,
  sectionContainerClass,
  sectionStackClass,
} from "@/components/sections/sectionStyles";

const STEPS = [
  {
    step: "STEP 1",
    timing: "ご契約時",
    amount: "着手金 15万円",
    body: "初回ヒアリング・補助金活用戦略の設計",
  },
  {
    step: "STEP 2",
    timing: "採択が決まった時点",
    amount: "成果報酬 5%",
    body: "採択が決まったことを確認してから、初回の成果報酬",
  },
  {
    step: "STEP 3",
    timing: "実績報告・精算完了時点",
    amount: "成果報酬 5%",
    body: "補助金を実際に使い切った段階で",
  },
  {
    step: "STEP 4（最終）",
    timing: "1年後の効果検証",
    amount: "成果報酬 5%",
    body: "導入した設備・取り組みの効果を一緒に確認してから",
  },
] as const;

export default function FeeStructureSection() {
  const reduce = useReducedMotion();
  return (
    <section className={sectionStackClass} aria-labelledby="home-fee-structure-heading">
      <div className={sectionContainerClass}>
        <motion.div
          initial={reduce ? fadeInUpReduced : fadeInUpInitial}
          whileInView={reduce ? fadeInUpReduced : fadeInUpInView}
          viewport={fadeInUpViewport}
          transition={fadeInUpTransition}
          className={glassShellClass}
        >
          <p className="mb-4 text-center text-xs font-bold uppercase tracking-[0.2em] text-[#7ec8ff]">
            FEE STRUCTURE
          </p>
          <h2
            id="home-fee-structure-heading"
            className="text-center font-heading text-3xl font-bold leading-tight text-white md:text-5xl"
          >
            採択された瞬間に
            <br />
            全額請求しない理由。
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-center text-base leading-relaxed text-white/80 md:text-lg">
            私たちのフィーは、1年間の成果を見届けながら段階的に発生します。
            <br />
            これはNTSの姿勢そのものです。
          </p>

          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-4">
            {STEPS.map((s, i) => (
              <div
                key={s.step}
                className="relative rounded-xl border border-white/10 bg-white/[0.05] p-5"
              >
                <p className="text-xs font-bold tracking-wider text-[#7ec8ff]">{s.step}</p>
                <p className="mt-3 text-xs text-white/60">{s.timing}</p>
                <p className="mt-1 font-heading text-xl font-bold text-white">{s.amount}</p>
                <p className="mt-3 text-sm leading-relaxed text-white/75">{s.body}</p>
                {i < STEPS.length - 1 ? (
                  <p className="mt-4 text-center text-xs font-bold text-[#1A7B6F] md:hidden">↓</p>
                ) : null}
              </div>
            ))}
          </div>

          <div
            className="mt-8 rounded-xl border-l-[3px] border-[#1A7B6F] px-5 py-4 text-sm leading-relaxed text-white/85"
            style={{ background: "rgba(26, 123, 111, 0.1)" }}
          >
            合計の成果報酬は補助金額の15%。
            <br />
            「採択されなければ成果報酬は発生しません」——
            <br />
            この設計は、NTSがお客様の結果まで責任を持つという意思表示です。
          </div>
        </motion.div>
      </div>
    </section>
  );
}

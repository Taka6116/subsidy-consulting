"use client";

import { motion, useReducedMotion } from "framer-motion";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";
import {
  fadeInUpInView,
  fadeInUpInitial,
  fadeInUpReduced,
  fadeInUpTransition,
  fadeInUpViewport,
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
    <section className="section-block bg-section-white" aria-labelledby="home-fee-structure-heading">
      <div className="section-inner">
        <motion.div
          initial={reduce ? fadeInUpReduced : fadeInUpInitial}
          whileInView={reduce ? fadeInUpReduced : fadeInUpInView}
          viewport={fadeInUpViewport}
          transition={fadeInUpTransition}
        >
          <div className="two-col img-right mb-16 lg:mb-20">
            <div className="col-text space-y-5">
              <p className="text-center font-heading text-lg font-bold leading-snug text-[var(--text-primary)] md:text-xl lg:text-left">
                採択の瞬間に成功報酬を一括請求しない——それがNTSのスタンスです。
              </p>
              <ul className="list-disc space-y-3 pl-5 text-sm leading-relaxed text-[var(--text-secondary)] md:text-base">
                <li>
                  多くの支援では「採択＝高額請求」になりがちですが、NTSは成果報酬を段階設計し、実際に補助金を使い切り・効果を確認するまで伴走します。
                </li>
                <li>
                  着手金は戦略設計のコミットメントとして明確に提示し、以降は採択・実績報告・1年後の効果検証というマイルストーンに沿って発生します。
                </li>
                <li>
                  この料金設計は、「申請して終わり」ではなく経営成果まで責任を持つという、NTSの提供価値そのものを表しています。
                </li>
              </ul>
            </div>

            <div className="col-img w-full max-w-lg justify-self-center lg:max-w-none">
              <ImagePlaceholder label="合意・契約イラスト" aspectRatio="4/3" />
            </div>
          </div>

          <hr className="mb-16 border-0 border-t border-[rgba(26,76,142,0.1)] lg:mb-20" />

          <p className="label-section mb-4 text-center">FEE STRUCTURE</p>
          <h2
            id="home-fee-structure-heading"
            className="text-center font-heading text-3xl font-bold leading-tight text-[var(--text-primary)] md:text-5xl"
          >
            採択された瞬間に
            <br />
            全額請求しない理由。
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-center text-base leading-relaxed text-[var(--text-secondary)] md:text-lg">
            私たちのフィーは、1年間の成果を見届けながら段階的に発生します。
            <br />
            これはNTSの姿勢そのものです。
          </p>

          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
            {STEPS.map((s, i) => (
              <div key={s.step} className="nts-card relative p-8">
                <div className="pointer-events-none absolute right-3 top-3 max-h-10 max-w-10 opacity-80">
                  <ImagePlaceholder label="" aspectRatio="1/1" className="gap-1 rounded-lg py-2" />
                </div>
                <p className="text-highlight-teal text-xs font-bold tracking-wider">{s.step}</p>
                <p className="mt-3 text-xs text-[var(--text-muted)]">{s.timing}</p>
                <p className="text-highlight-gold mt-1 font-heading text-xl font-bold">{s.amount}</p>
                <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)] md:text-base">{s.body}</p>
                {i < STEPS.length - 1 ? (
                  <p className="text-highlight-teal mt-4 text-center text-xs font-bold md:hidden">
                    ↓
                  </p>
                ) : null}
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-xl border-l-[3px] border-[var(--accent-teal)] bg-[var(--accent-teal)]/10 px-5 py-4 text-sm leading-relaxed text-[var(--text-primary)] md:text-base">
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

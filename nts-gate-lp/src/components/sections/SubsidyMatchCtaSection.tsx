"use client";

import { motion, useReducedMotion } from "framer-motion";
import HeroCheckCtaLink from "@/components/shared/HeroCheckCtaLink";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";
import {
  fadeInUpInitial,
  fadeInUpInView,
  fadeInUpReduced,
  fadeInUpTransition,
  fadeInUpViewport,
} from "@/components/sections/sectionStyles";

export default function SubsidyMatchCtaSection() {
  const reduce = useReducedMotion();

  return (
    <section className="section-block bg-section-white" aria-labelledby="home-subsidy-match-heading">
      <div className="section-inner">
        <motion.div
          initial={reduce ? fadeInUpReduced : fadeInUpInitial}
          whileInView={reduce ? fadeInUpReduced : fadeInUpInView}
          viewport={fadeInUpViewport}
          transition={fadeInUpTransition}
          className="two-col img-right"
        >
          <div className="col-text space-y-6 text-center lg:text-left">
            <p className="label-section mb-2">補助金照会</p>
            <h2
              id="home-subsidy-match-heading"
              className="font-heading text-2xl font-bold leading-snug text-[var(--text-primary)] md:text-3xl lg:text-4xl"
            >
              対象の補助金を確認する
            </h2>
            <p className="mx-auto max-w-2xl text-base leading-relaxed text-[var(--text-secondary)] md:text-lg lg:mx-0">
              会社名と業種を選ぶだけで、御社に関係しそうな補助金のイメージを確認できます。
              <br className="hidden sm:inline" />
              難しい入力はなく、照会は無料です。
            </p>

            <div className="flex flex-wrap justify-center gap-4 pt-2 lg:justify-start">
              <HeroCheckCtaLink location="home_subsidy_check" />
            </div>

            <p className="text-xs leading-relaxed text-[var(--text-muted)]">
              ※ 表示は参考例です。採択可否や要件は公募要領で必ずご確認ください。
            </p>
          </div>

          <div className="col-img w-full max-w-md justify-self-center lg:max-w-lg">
            <ImagePlaceholder label="補助金照会フロー・結果画面（プレースホルダー）" aspectRatio="4/3" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

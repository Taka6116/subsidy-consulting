"use client";

import { motion, useReducedMotion } from "framer-motion";
import HeroCheckCtaLink from "@/components/shared/HeroCheckCtaLink";
import {
  fadeInUpInitial,
  fadeInUpInView,
  fadeInUpReduced,
  fadeInUpTransition,
  fadeInUpViewport,
  glassShellClass,
} from "@/components/sections/sectionStyles";

export default function CheckLeadSection() {
  const reduce = useReducedMotion();

  return (
    <section className="section-block section-white" aria-labelledby="home-check-lead-heading">
      <div className="section-inner">
        <motion.div
          initial={reduce ? fadeInUpReduced : fadeInUpInitial}
          whileInView={reduce ? fadeInUpReduced : fadeInUpInView}
          viewport={fadeInUpViewport}
          transition={fadeInUpTransition}
          className={`${glassShellClass} text-center`}
        >
          <div className="mb-12 text-center md:mb-16">
            <p className="sec-label mb-4">1分で確認できます</p>
            <h2
              id="home-check-lead-heading"
              className="font-heading text-[1.75rem] font-bold leading-snug text-[var(--text-primary)] md:text-[2.25rem]"
            >
              企業名と業種を入力するだけで、
              <br />
              対象の補助金がわかります。
            </h2>
          </div>
          <p className="mt-6 text-base leading-relaxed text-[var(--text-secondary)] md:text-lg">
            難しい質問はありません。
            <br />
            照会・相談は完全無料です。
          </p>

          <div className="mt-10 flex justify-center">
            <HeroCheckCtaLink location="home_check_lead" />
          </div>

          <p className="mt-8 text-xs leading-relaxed text-[var(--text-muted)]">
            ※ 照会結果はNTSの担当者が内容を確認のうえご案内します
          </p>
        </motion.div>
      </div>
    </section>
  );
}

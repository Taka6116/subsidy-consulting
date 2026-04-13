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
  sectionContainerClass,
  sectionStackClass,
} from "@/components/sections/sectionStyles";

export default function CheckLeadSection() {
  const reduce = useReducedMotion();

  return (
    <section className={sectionStackClass} aria-labelledby="home-check-lead-heading">
      <div className={sectionContainerClass}>
        <motion.div
          initial={reduce ? fadeInUpReduced : fadeInUpInitial}
          whileInView={reduce ? fadeInUpReduced : fadeInUpInView}
          viewport={fadeInUpViewport}
          transition={fadeInUpTransition}
          className={`${glassShellClass} text-center`}
        >
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-white/55">
            1分で確認できます
          </p>
          <h2
            id="home-check-lead-heading"
            className="font-heading text-2xl font-bold leading-snug text-white md:text-3xl lg:text-4xl"
          >
            企業名と業種を入力するだけで、
            <br />
            対象の補助金がわかります。
          </h2>
          <p className="mt-6 text-base leading-relaxed text-white/70 md:text-lg">
            難しい質問はありません。
            <br />
            照会・相談は完全無料です。
          </p>

          <div className="mt-10 flex justify-center">
            <HeroCheckCtaLink location="home_check_lead" />
          </div>

          <p className="mt-8 text-xs leading-relaxed text-white/45">
            ※ 照会結果はNTSの担当者が内容を確認のうえご案内します
          </p>
        </motion.div>
      </div>
    </section>
  );
}

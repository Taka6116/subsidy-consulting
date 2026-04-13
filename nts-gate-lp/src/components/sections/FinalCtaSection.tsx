"use client";

import { motion, useReducedMotion } from "framer-motion";
import HeroCheckCtaLink from "@/components/shared/HeroCheckCtaLink";
import {
  fadeInUpInitial,
  fadeInUpInView,
  fadeInUpReduced,
  fadeInUpTransition,
  fadeInUpViewport,
  sectionContainerClass,
  sectionStackClass,
} from "@/components/sections/sectionStyles";

const finalGlassClass =
  "rounded-2xl border border-white/10 bg-gradient-to-b from-[rgba(10,22,40,0.45)] to-[rgba(13,29,56,0.45)] p-8 text-center text-white shadow-none backdrop-blur-[12px] [-webkit-backdrop-filter:blur(12px)] md:p-12";

export default function FinalCtaSection() {
  const reduce = useReducedMotion();

  return (
    <section className={sectionStackClass} aria-labelledby="home-final-cta-heading">
      <div className={sectionContainerClass}>
        <motion.div
          initial={reduce ? fadeInUpReduced : fadeInUpInitial}
          whileInView={reduce ? fadeInUpReduced : fadeInUpInView}
          viewport={fadeInUpViewport}
          transition={fadeInUpTransition}
          className={`mx-auto max-w-2xl ${finalGlassClass}`}
        >
          <h2
            id="home-final-cta-heading"
            className="font-heading text-3xl font-bold leading-snug md:text-4xl"
          >
            まず、対象かどうかを確認してみてください。
          </h2>
          <p className="mt-6 text-base leading-relaxed text-white/75 md:text-lg">
            照会は1分。相談は無料。
            <br />
            あなたの会社に使える制度が、あるかもしれません。
          </p>
          <div className="mt-10 flex justify-center">
            <HeroCheckCtaLink location="final" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

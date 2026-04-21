"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import HeroCheckCtaLink from "@/components/shared/HeroCheckCtaLink";
import isometric08 from "../../../icon-assets/isometric_08.webp";
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
            <p className="sec-label mb-2">補助金照会</p>
            <h2
              id="home-subsidy-match-heading"
              className="font-heading text-[1.75rem] font-bold leading-snug text-[var(--text-primary)] md:text-[2.25rem]"
            >
              まず、自社に使える制度を
              <br />
              確認してみてください。
            </h2>
            <p className="mx-auto max-w-2xl text-base leading-relaxed text-[var(--text-secondary)] md:text-lg lg:mx-0">
              会社名またはURLを入力するだけで、活用できる可能性のある補助金をご案内します。無料・1分で完了します。
            </p>

            <div className="flex flex-wrap justify-center gap-4 pt-2 lg:justify-start">
              <HeroCheckCtaLink location="home_subsidy_check">
                無料で補助金を診断する
                <span aria-hidden="true">→</span>
              </HeroCheckCtaLink>
            </div>

            <p className="text-xs leading-relaxed text-[var(--text-muted)]">
              ※ 表示は参考例です。採択可否や要件は公募要領で必ずご確認ください。
            </p>
          </div>

          <div className="col-img w-full max-w-md justify-self-center lg:max-w-lg">
            <div className="relative min-h-[280px] overflow-hidden max-md:h-[200px]">
              <Image
                src={isometric08}
                alt="補助金照会を検討するグループのイラスト"
                width={640}
                height={640}
                className="absolute bottom-0 left-1/2 h-[85%] w-auto -translate-x-1/2 object-contain"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

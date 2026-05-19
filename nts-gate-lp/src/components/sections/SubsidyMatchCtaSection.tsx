"use client";

import { motion, useReducedMotion } from "framer-motion";
import HeroCheckCtaLink from "@/components/shared/HeroCheckCtaLink";
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
      <div className="mx-auto w-full max-w-[1640px] px-5 sm:px-8 xl:px-10 2xl:px-12">
        <motion.div
          initial={reduce ? fadeInUpReduced : fadeInUpInitial}
          whileInView={reduce ? fadeInUpReduced : fadeInUpInView}
          viewport={fadeInUpViewport}
          transition={fadeInUpTransition}
          className="two-col img-right lg:gap-[96px]"
        >
          <div className="col-text space-y-6 text-center lg:text-left">
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

          <div className="col-img w-full justify-self-center">
            <div className="relative overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-section-alt)] shadow-[0_12px_40px_rgba(10,34,64,0.12)]">
              <video
                className="block h-auto w-full"
                src="/video/subsidy-check-demo.mp4"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-label="補助金照会の操作デモ動画"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Users } from "lucide-react";
import ScrollTextReveal from "@/components/shared/ScrollTextReveal";
import PartnerJointFlowDiagram from "./PartnerJointFlowDiagram";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.12 },
  transition: { duration: 0.55, ease: EASE_OUT, delay },
});

export default function PartnerHandoffSection() {
  const reduceMotion = useReducedMotion();
  const reveal = (delay: number) => (reduceMotion ? {} : fadeUp(delay));

  return (
    <section
      className="section-alt relative overflow-hidden py-24 md:py-32"
      aria-labelledby="joint-progress-heading"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/70 to-transparent" />

      <div className="relative mx-auto max-w-[1240px] px-5 sm:px-6 lg:max-w-[1380px] lg:px-6 xl:max-w-[1440px] xl:px-8">
        <motion.div className="mx-auto max-w-3xl text-center" {...reveal(0)}>
          <ScrollTextReveal
            as="h2"
            id="joint-progress-heading"
            className="font-heading text-3xl font-bold leading-tight text-[var(--text-primary)] md:text-4xl"
          >
            御社の顧客接点に、
            <br />
            NTSの補助金活用支援を加える。
          </ScrollTextReveal>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[var(--text-secondary)] md:text-lg">
            顧客課題の整理から、補助金活用、提案・導入後の伴走まで。
            <br className="hidden md:inline" />
            御社の提案活動をバックアップし、お客様の次の一手を支援します。
          </p>
        </motion.div>

        <PartnerJointFlowDiagram />

        <motion.div
          className="mt-10 flex flex-col gap-4 rounded-2xl border border-[#d0e4f6] bg-white/95 px-5 py-5 shadow-[0_8px_28px_rgba(12,42,72,0.07)] sm:flex-row sm:items-center sm:justify-between sm:px-6"
          {...reveal(0.2)}
        >
          <div className="flex items-start gap-3">
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#eef4ff] text-[#1a56db]"
              aria-hidden
            >
              <Users className="h-5 w-5" />
            </span>
            <div>
              <p className="text-base font-bold text-[#1a56db]">この案件、補助金が使えるか？からご相談ください。</p>
              <p className="mt-1 text-sm leading-relaxed text-[var(--text-secondary)]">
                提案中の案件や、今後の事業計画について、まずは気軽にご相談ください。
              </p>
            </div>
          </div>
          <a
            href="#contact"
            className="nts-cta-primary nts-cta-primary--xl shrink-0 gap-1 px-6 py-3 text-sm focus-visible:ring-2 focus-visible:ring-[#1368d8] focus-visible:ring-offset-2"
          >
            補助金活用の可能性を相談する
            <span aria-hidden>›</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}

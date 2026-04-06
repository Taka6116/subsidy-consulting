"use client";

import { motion, useReducedMotion } from "framer-motion";
import CTAButton from "@/components/shared/CTAButton";
import { trackCTAClick } from "@/lib/analytics";
import SectionWrapper from "@/components/shared/SectionWrapper";

const ease = [0.16, 1, 0.3, 1] as const;

export default function FinalCTA() {
  const shouldReduceMotion = useReducedMotion();
  const skip = !!shouldReduceMotion;

  return (
    <SectionWrapper className="bg-primary-900">
      <div className="mx-auto flex min-h-[55vh] max-w-container flex-col items-center justify-center px-6 py-section-gap text-center">
        <motion.h2
          initial={skip ? false : { opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, ease }}
          className="font-heading text-h1 font-bold leading-tight text-white"
        >
          まずは1分の診断から。
        </motion.h2>

        <motion.p
          initial={skip ? false : { opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, delay: 0.15, ease }}
          className="mt-4 text-h2 leading-normal text-primary-300"
        >
          あなたの会社に合った制度があるか、
          <br className="hidden sm:inline" />
          確認してみませんか？
        </motion.p>

        <motion.div
          initial={skip ? false : { opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, delay: 0.3, ease }}
          className="mt-10 w-full sm:w-auto"
        >
          <CTAButton
            text="無料で診断する（1分）"
            href="/diagnosis"
            variant="primary"
            size="large"
            onClick={() => trackCTAClick("final")}
          />
        </motion.div>

        <motion.p
          initial={skip ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, delay: 0.4, ease }}
          className="mt-4 text-small text-primary-300/70"
        >
          個人情報の入力は不要です。
        </motion.p>
      </div>
    </SectionWrapper>
  );
}

"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import SectionWrapper from "@/components/shared/SectionWrapper";
import CTAButton from "@/components/shared/CTAButton";
import { trackCTAClick } from "@/lib/analytics";

const ease = [0.16, 1, 0.3, 1] as const;
const TARGET = 1500;
const DURATION = 1500; // ms

function useCountUp(target: number, duration: number, shouldStart: boolean) {
  const [value, setValue] = useState(0);

  const animate = useCallback(() => {
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
  }, [target, duration]);

  useEffect(() => {
    if (shouldStart) animate();
  }, [shouldStart, animate]);

  return value;
}

export default function ImpactNumber() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const shouldReduceMotion = useReducedMotion();
  const skip = !!shouldReduceMotion;

  const displayValue = useCountUp(
    TARGET,
    skip ? 0 : DURATION,
    skip ? true : isInView
  );

  const formatted = displayValue.toLocaleString();

  return (
    <SectionWrapper className="bg-primary-100">
      <div
        ref={ref}
        className="mx-auto flex min-h-[60vh] max-w-container flex-col items-center justify-center px-6 py-section-gap text-center"
      >
        {/* 見出し（スクリーンリーダー向け） */}
        <h2 className="sr-only">活用可能な補助金額</h2>

        {/* ラベル */}
        <motion.p
          initial={skip ? false : { opacity: 0, y: 8 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease }}
          className="mb-2 text-h3 text-neutral-600"
          aria-hidden="true"
        >
          最大
        </motion.p>

        {/* 数字 */}
        <div className="mb-6 flex items-baseline justify-center" aria-hidden="true">
          <span
            className="font-display text-[clamp(3rem,8vw,6rem)] font-bold leading-none text-primary-900"
            aria-label={`${TARGET.toLocaleString()}万円`}
          >
            {formatted}
          </span>
          <span className="ml-1 font-display text-[clamp(1.8rem,4.8vw,3.6rem)] font-bold leading-none text-primary-900">
            万円
          </span>
        </div>

        {/* サブコピー */}
        <motion.p
          initial={skip ? false : { opacity: 0, y: 8 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3, ease }}
          className="mb-10 max-w-lg text-h2 leading-normal text-neutral-700"
        >
          あなたの会社の投資に、使える制度が
          <br className="hidden sm:inline" />
          あるかもしれません。
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={skip ? false : { opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.5, ease }}
          className="w-full sm:w-auto"
        >
          <CTAButton
            text="対象か確認する（無料・1分）"
            href="/diagnosis"
            variant="primary"
            size="large"
            onClick={() => trackCTAClick("impact")}
          />
        </motion.div>
      </div>
    </SectionWrapper>
  );
}

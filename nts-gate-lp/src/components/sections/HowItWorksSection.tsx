"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ChevronRight } from "lucide-react";
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

const STEPS = [
  {
    n: 1,
    icon: "🔍",
    title: "補助金を照会する",
    body: "企業名と業種を入力するだけ。対象となる可能性のある補助金を即時確認できます。",
  },
  {
    n: 2,
    icon: "💬",
    title: "専門家に相談する",
    body: "照会結果をもとに、NTSの担当者が無料でご相談に対応します。申請要件や必要書類もわかりやすくご説明します。",
  },
  {
    n: 3,
    icon: "📋",
    title: "申請をサポート",
    body: "書類作成から申請手続きまで、一貫してサポートします。採択後の報告対応も含めて伴走します。",
  },
] as const;

export default function HowItWorksSection() {
  const reduce = useReducedMotion();

  return (
    <section className={sectionStackClass} aria-labelledby="home-how-heading">
      <div className={sectionContainerClass}>
        <motion.div
          initial={reduce ? fadeInUpReduced : fadeInUpInitial}
          whileInView={reduce ? fadeInUpReduced : fadeInUpInView}
          viewport={fadeInUpViewport}
          transition={fadeInUpTransition}
          className={glassShellClass}
        >
          <h2
            id="home-how-heading"
            className="text-center font-heading text-3xl font-bold text-white md:text-4xl"
          >
            ご利用の流れ
          </h2>

          <div className="mt-10 flex flex-col items-stretch gap-6 md:flex-row md:items-stretch md:justify-center md:gap-0">
            {STEPS.map((step, i) => (
              <div
                key={step.n}
                className="flex flex-col items-center md:flex-row md:items-stretch"
              >
                <article className="relative w-full max-w-md overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] p-6 md:max-w-[260px] lg:max-w-[280px]">
                  <span
                    className="pointer-events-none absolute right-3 top-2 font-display text-7xl font-bold leading-none text-white/15 md:text-8xl"
                    aria-hidden
                  >
                    {step.n}
                  </span>
                  <div className="relative z-[1] text-center md:text-left">
                    <span className="text-3xl" role="img" aria-hidden>
                      {step.icon}
                    </span>
                    <h3 className="mt-3 font-heading text-xl font-bold text-white">
                      {step.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-white/75">{step.body}</p>
                  </div>
                </article>
                {i < STEPS.length - 1 ? (
                  <div
                    className="flex shrink-0 items-center justify-center py-2 md:px-3 md:py-0"
                    aria-hidden
                  >
                    <ChevronRight className="hidden h-8 w-8 text-white/30 md:block" />
                    <span className="text-2xl text-white/30 md:hidden">↓</span>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

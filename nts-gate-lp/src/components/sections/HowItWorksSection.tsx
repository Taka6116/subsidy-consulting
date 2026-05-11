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
    body: "申請前の情報整理から採択後の実績報告まで、一貫して伴走します。申請書類の作成・提出等、資格者が行うべき業務は提携行政書士法人等が対応します。",
  },
] as const;

export default function HowItWorksSection() {
  const reduce = useReducedMotion();

  return (
    <section className="section-block bg-section-white" aria-labelledby="home-how-heading">
      <div className="section-inner">
        <motion.div
          initial={reduce ? fadeInUpReduced : fadeInUpInitial}
          whileInView={reduce ? fadeInUpReduced : fadeInUpInView}
          viewport={fadeInUpViewport}
          transition={fadeInUpTransition}
          className={glassShellClass}
        >
          <div className="mb-12 text-center md:mb-16">
            <h2
              id="home-how-heading"
              className="font-heading text-[1.75rem] font-bold leading-snug text-[var(--text-primary)] md:text-[2.25rem]"
            >
              ご利用の流れ
            </h2>
          </div>

          <div className="flex flex-col items-stretch gap-6 md:flex-row md:items-stretch md:justify-center md:gap-0">
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

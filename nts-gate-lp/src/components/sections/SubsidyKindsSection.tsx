"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useCountUp } from "@/hooks/useCountUp";
import {
  fadeInUpInitial,
  fadeInUpInView,
  fadeInUpReduced,
  fadeInUpTransition,
  fadeInUpViewport,
  glassShellClass,
  nestedGlassCardClass,
  sectionContainerClass,
  sectionStackClass,
} from "@/components/sections/sectionStyles";

const TARGET = 1500;
const DURATION_MS = 1500;

const CARDS = [
  {
    tag: "省力化・DX",
    title: "中小企業省力化投資補助金",
    body: "人手不足解消・自動化設備の導入に。",
    max: "最大1,500万円",
  },
  {
    tag: "事業承継・引継ぎ",
    title: "事業承継・引継ぎ補助金",
    body: "後継者不在・M&A後の経営基盤強化に。",
    max: "最大600万円",
  },
  {
    tag: "IT導入",
    title: "IT導入補助金",
    body: "業務効率化・DX推進のためのITツール導入に。",
    max: "最大450万円",
  },
] as const;

export default function SubsidyKindsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.25 });
  const reduce = useReducedMotion();
  const skip = !!reduce;

  const displayValue = useCountUp(
    TARGET,
    skip ? 0 : DURATION_MS,
    skip ? true : isInView,
  );
  const formatted = displayValue.toLocaleString();

  return (
    <section className={sectionStackClass} aria-labelledby="home-subsidy-kinds-heading">
      <div className={sectionContainerClass}>
        <motion.div
          initial={skip ? fadeInUpReduced : fadeInUpInitial}
          whileInView={skip ? fadeInUpReduced : fadeInUpInView}
          viewport={fadeInUpViewport}
          transition={fadeInUpTransition}
          className={glassShellClass}
        >
          <p className="mb-3 text-center text-xs font-bold uppercase tracking-[0.2em] text-white/55">
            活用できる制度
          </p>

          <div ref={ref} className="text-center">
            <h2 id="home-subsidy-kinds-heading" className="sr-only">
              補助金の種類と規模
            </h2>

            <p
              className="mb-2 text-lg font-medium text-white/90 md:text-xl"
              aria-hidden="true"
            >
              最大
            </p>
            <div
              className="mb-6 flex items-baseline justify-center gap-1"
              aria-label={`最大${displayValue.toLocaleString()}万円`}
            >
              <span className="text-6xl font-bold tabular-nums text-white md:text-8xl">
                {formatted}
              </span>
              <span className="text-3xl font-bold text-white md:text-5xl">万円</span>
            </div>

            <p className="mx-auto mb-12 max-w-xl text-base leading-relaxed text-white/75 md:text-lg">
              あなたの会社の投資に、使える制度があるかもしれません。
            </p>
          </div>

          <ul className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {CARDS.map((c) => (
              <li key={c.title} className={nestedGlassCardClass}>
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#7ec8ff]">
                  {c.tag}
                </p>
                <h3 className="font-heading text-xl font-bold text-white md:text-2xl">
                  {c.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/75">{c.body}</p>
                <p className="mt-5 text-sm font-bold text-white">{c.max}</p>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}

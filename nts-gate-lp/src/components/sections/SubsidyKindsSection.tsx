"use client";

import { motion, useReducedMotion } from "framer-motion";
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

const CARDS = [
  {
    tag: "建設業",
    title: "職人不足・設備老朽化・事業承継",
    keywords: [
      "省力化補助金",
      "事業承継補助金",
      "2024年問題",
      "主力重機の更新",
      "建設業許可",
      "後継者不在",
    ],
    body: "元請・下請を問わず、人が足りない・設備を更新したい・後継者に引き継ぎたい、という課題に対して補助金活用の戦略を設計します。",
  },
  {
    tag: "運送業",
    title: "ドライバー不足・デジタル化・2代目承継",
    keywords: [
      "省力化補助金",
      "事業承継補助金",
      "Gマーク",
      "デジタコ",
      "2024年問題",
      "主要荷主への依存",
    ],
    body: "主要荷主への依存リスクを抱えながら、人とコストの問題に直面している運送会社の経営者に、補助金という選択肢を届けます。",
  },
] as const;

export default function SubsidyKindsSection() {
  const reduce = useReducedMotion();
  const skip = !!reduce;

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
            対象業種
          </p>

          <div className="text-center">
            <h2 id="home-subsidy-kinds-heading" className="sr-only">
              補助金の種類と規模
            </h2>

            <p
              className="mb-2 text-lg font-medium text-white/90 md:text-xl"
              aria-hidden="true"
            >
              建設業・運送業に特化した、
              <br />
              補助金活用の実績。
            </p>
            <p className="mx-auto mb-12 mt-4 max-w-xl text-base leading-relaxed text-white/75 md:text-lg">
              業種特有の課題に合わせて、最適な補助金活用戦略を設計します。
            </p>
          </div>

          <ul className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {CARDS.map((c) => (
              <li key={c.title} className={nestedGlassCardClass}>
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#7ec8ff]">
                  {c.tag}
                </p>
                <h3 className="font-heading text-xl font-bold text-white md:text-2xl">
                  {c.title}
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {c.keywords.map((k) => (
                    <span
                      key={k}
                      className="rounded-full border border-white/15 bg-white/[0.08] px-2.5 py-1 text-[11px] text-white/85"
                    >
                      {k}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-white/75">{c.body}</p>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { subsidyNews } from "@/components/sections/subsidyNewsData";
import {
  fadeInUpInitial,
  fadeInUpInView,
  fadeInUpReduced,
  fadeInUpTransition,
  fadeInUpViewport,
  glassCardClass,
  sectionContainerClass,
  sectionStackClass,
} from "@/components/sections/sectionStyles";

export default function NewSubsidySection() {
  const reduce = useReducedMotion();

  return (
    <section className={sectionStackClass} aria-labelledby="home-subsidy-news-heading">
      <div className={sectionContainerClass}>
        <motion.div
          initial={reduce ? fadeInUpReduced : fadeInUpInitial}
          whileInView={reduce ? fadeInUpReduced : fadeInUpInView}
          viewport={fadeInUpViewport}
          transition={fadeInUpTransition}
          className="mx-auto max-w-3xl text-center text-white"
        >
          <h2
            id="home-subsidy-news-heading"
            className="font-heading text-3xl font-bold md:text-4xl"
          >
            新着・注目の補助金制度
          </h2>
          <p className="mt-5 text-base leading-relaxed text-white/80 md:text-lg">
            知らないと損する制度が、今日も動いています。
            <br />
            NTSが最新の補助金情報をいち早くお届けします。
          </p>
        </motion.div>

        <motion.ul
          initial={reduce ? fadeInUpReduced : fadeInUpInitial}
          whileInView={reduce ? fadeInUpReduced : fadeInUpInView}
          viewport={fadeInUpViewport}
          transition={{ ...fadeInUpTransition, delay: 0.08 }}
          className="mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] md:grid md:snap-none md:grid-cols-3 md:overflow-visible [&::-webkit-scrollbar]:hidden"
        >
          {subsidyNews.map((item) => (
            <li
              key={item.id}
              className={`min-w-[min(100%,320px)] shrink-0 snap-center text-white md:min-w-0 ${glassCardClass}`}
            >
              <span className="inline-block rounded-full border border-green-500/30 bg-green-500/20 px-3 py-1 text-xs font-bold text-green-300">
                {item.label}
              </span>
              <h3 className="mt-4 font-heading text-lg font-bold leading-snug md:text-xl">
                {item.name}
              </h3>
              <p className="mt-3 text-sm text-white/65">対象: {item.target}</p>
              <p className="mt-2 text-sm font-semibold">{item.maxAmount}</p>
              <p className="mt-2 text-sm font-medium text-orange-300">
                締切: {item.deadline}
              </p>
              <Link
                href="#"
                className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-[#7ec8ff] underline-offset-4 hover:underline"
              >
                詳細を見る
                <ChevronRight className="h-4 w-4" aria-hidden />
              </Link>
            </li>
          ))}
        </motion.ul>

        <motion.div
          initial={reduce ? fadeInUpReduced : fadeInUpInitial}
          whileInView={reduce ? fadeInUpReduced : fadeInUpInView}
          viewport={fadeInUpViewport}
          transition={{ ...fadeInUpTransition, delay: 0.12 }}
          className="mt-10 text-center"
        >
          <Link
            href="#"
            className="inline-flex items-center gap-1 text-sm font-bold text-white/90 underline-offset-4 hover:text-white hover:underline"
          >
            すべての補助金情報を見る
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

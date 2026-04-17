"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import {
  fadeInUpInitial,
  fadeInUpInView,
  fadeInUpReduced,
  fadeInUpTransition,
  fadeInUpViewport,
} from "@/components/sections/sectionStyles";
import imgCraftswoman from "../../../icon-assets/craftswoman.webp";
import imgDelivery from "../../../icon-assets/delivery.webp";

const CARDS = [
  {
    industry: "建設業",
    title: "職人不足・設備老朽化・事業承継",
    imageSrc: imgCraftswoman,
    imageAlt: "建設業の職人不足と現場課題のイメージ",
    keywords: [
      "省力化補助金",
      "事業承継補助金",
      "2024年問題",
      "主力重機の更新",
      "建設業許可",
      "後継者不在",
    ],
    body: "元請・下請を問わず、人が足りない・設備を更新したい・後継者に引き継ぎたい、という課題に対して補助金活用の戦略を設計します。",
    useCase:
      "現場の人手不足や主力重機の更新タイミングが重なり、投資判断を迫られている元請・下請の経営者。許可更新や事業承継を見据え、補助金の枠に沿った投資順序を整理したいケースに合います。",
  },
  {
    industry: "運送業",
    title: "ドライバー不足・デジタル化・2代目承継",
    imageSrc: imgDelivery,
    imageAlt: "運送業の配送現場とドライバー不足のイメージ",
    keywords: [
      "省力化補助金",
      "事業承継補助金",
      "Gマーク",
      "デジタコ",
      "2024年問題",
      "主要荷主への依存",
    ],
    body: "主要荷主への依存リスクを抱えながら、人とコストの問題に直面している運送会社の経営者に、補助金という選択肢を届けます。",
    useCase:
      "荷主依存やドライバー確保、デジタコ・車両更新のコストが同時に押し寄せている運送会社。省力化投資や2代目への引き継ぎを、補助金を組み込んだ計画で進めたい経営者向けです。",
  },
] as const;

export default function SubsidyKindsSection() {
  const reduce = useReducedMotion();
  const skip = !!reduce;

  return (
    <section className="section-block bg-section-gray" aria-labelledby="home-subsidy-kinds-heading">
      <div className="section-inner">
        <motion.div
          initial={skip ? fadeInUpReduced : fadeInUpInitial}
          whileInView={skip ? fadeInUpReduced : fadeInUpInView}
          viewport={fadeInUpViewport}
          transition={fadeInUpTransition}
        >
          <div className="mb-12 text-center md:mb-16">
            <p className="sec-label mb-3">対象業種</p>
            <h2
              id="home-subsidy-kinds-heading"
              className="font-heading text-[1.75rem] font-bold leading-snug text-[var(--text-primary)] md:text-[2.25rem]"
            >
              建設業・運送業にも特化し、
              <br />
              サポートをしています。
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-[var(--text-secondary)] md:text-lg">
              業種特有の課題に合わせて、最適な補助金活用戦略を設計します。
            </p>
          </div>

          <ul
            className="grid list-none gap-6 p-0"
            style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))" }}
          >
            {CARDS.map((c) => (
              <li key={c.title} className="nts-card p-8 md:p-10">
                <div className="mx-auto mb-6 w-[94%] overflow-hidden rounded-xl">
                  <Image
                    src={c.imageSrc}
                    alt={c.imageAlt}
                    className="h-auto w-full object-cover"
                    sizes="(max-width: 768px) 100vw, 540px"
                    priority={false}
                  />
                </div>
                <p className="text-highlight-teal mb-1 text-xs font-bold uppercase tracking-[0.18em]">
                  WORKS FOR
                </p>
                <p className="mb-2 text-xs font-semibold text-[var(--text-primary)]">{c.industry}</p>
                <h3 className="font-heading text-xl font-bold text-[var(--text-primary)] md:text-2xl">
                  {c.title}
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {c.keywords.map((k) => (
                    <span
                      key={k}
                      className="rounded-full border border-[var(--border-subtle)] bg-[#f0f4fa] px-2.5 py-1 text-[11px] text-[var(--text-secondary)]"
                    >
                      {k}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)] md:text-base">
                  {c.body}
                </p>
                <p className="mt-4 border-t border-[var(--border-subtle)] pt-4 text-sm leading-relaxed text-[var(--text-secondary)] md:text-base">
                  <span className="font-semibold text-[var(--text-primary)]">ユースケース：</span>
                  {c.useCase}
                </p>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}

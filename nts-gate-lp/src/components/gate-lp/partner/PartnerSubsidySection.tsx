"use client";

import Image, { type StaticImageData } from "next/image";
import { motion } from "framer-motion";

import isometric15 from "../../../../icon-assets/isometric_15.webp";
import isometric07 from "../../../../icon-assets/isometric_07.png";
import isometric06 from "../../../../icon-assets/isometric_06.png";

type Subsidy = {
  category: string;
  name: string;
  max: string;
  body: string;
  fit: string;
  image: StaticImageData;
  imageAlt: string;
  bgClass: string;
};

const subsidies: Subsidy[] = [
  {
    category: "省力化・DX",
    name: "中小企業省力化投資補助金",
    max: "最大1,500万円",
    body: "人手不足に悩む中小企業の省力化・自動化投資を支援。デジタコや業務システム、省人化機器の導入に活用できます。",
    fit: "IT・機械・設備ベンダー向け",
    image: isometric15,
    imageAlt: "省力化・DXをイメージしたイラスト",
    bgClass: "bg-[#EEF6FF]",
  },
  {
    category: "事業承継・引継ぎ",
    name: "事業承継・引継ぎ補助金",
    max: "最大600万円",
    body: "後継者への事業承継や、M&Aを活用した事業引継ぎに伴う費用を補助。経営課題として事業承継を抱える顧客に適しています。",
    fit: "士業・コンサル向け",
    image: isometric07,
    imageAlt: "事業承継・引継ぎをイメージしたイラスト",
    bgClass: "bg-[#E8F9F4]",
  },
  {
    category: "販路開拓・業務改善",
    name: "小規模事業者持続化補助金",
    max: "最大200万円",
    body: "販路開拓や業務効率化の取り組みを支援。小規模な顧客にも提案できる補助金です。",
    fit: "小規模事業者と取引のある企業向け",
    image: isometric06,
    imageAlt: "販路開拓・業務改善をイメージしたイラスト",
    bgClass: "bg-[#FFF4E8]",
  },
];

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 },
  transition: { duration: 0.6, ease: EASE_OUT, delay },
});

export default function PartnerSubsidySection() {
  return (
    <section
      className="section-white relative py-32 md:py-40"
      style={{ zIndex: 10 }}
    >
      <div className="mx-auto max-w-5xl px-6 md:px-8">
        <motion.div className="mb-16 text-center" {...fadeUp(0)}>
          <p className="label-section mb-4">Target Subsidies</p>
          <h2 className="font-heading text-3xl font-bold leading-tight text-[var(--text-primary)] md:text-4xl">
            例えばこんな補助金もあります。
          </h2>
          <p className="mt-4 text-base text-[var(--text-secondary)]">
            顧客の課題に応じて、活用できる補助金をNTSが選定します。
            <br />
            御社は「補助金の対象かもしれません」とお伝えいただくだけで構いません。
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {subsidies.map((s, i) => (
            <motion.div
              key={s.name}
              {...fadeUp(i * 0.1)}
              className="card group relative flex flex-col overflow-hidden p-0 transition-all duration-300"
            >
              {/* 上段：isometricビジュアル */}
              <div
                className={`relative flex h-[160px] w-full items-center justify-center ${s.bgClass}`}
              >
                <Image
                  src={s.image}
                  alt={s.imageAlt}
                  className="h-[130px] w-auto object-contain"
                  sizes="(min-width: 768px) 280px, 100vw"
                />
              </div>

              {/* 下段：コンテンツ */}
              <div className="flex flex-1 flex-col p-7">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  {s.category}
                </p>
                <h3 className="mb-1 text-lg font-bold leading-snug text-[var(--text-primary)]">
                  {s.name}
                </h3>
                <p className="text-highlight-gold mb-4 text-2xl font-bold">
                  {s.max}
                </p>
                <p className="mb-5 flex-1 text-sm leading-relaxed text-[var(--text-secondary)]">
                  {s.body}
                </p>
                <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-section-alt)] px-4 py-2.5">
                  <p className="text-[11px] text-[var(--text-muted)]">{s.fit}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import Image from "next/image";
import { motion } from "framer-motion";

type Card = {
  name: string;
  max: string;
  body: string;
  image: string;
  bgClass: string;
};

const FEATURED_SUBSIDIES: Card[] = [
  {
    name: "中小企業成長加速化補助金",
    max: "最大5億円",
    body: "大型投資感がありつつ、中小企業向けとして見せやすい",
    image: "/icon-assets/isometric_32.webp",
    bgClass: "bg-[#EEF6FF]",
  },
  {
    name: "中小企業省力化投資補助金 一般型",
    max: "最大1億円",
    body: "IT・機械・設備ベンダーとの相性が良い",
    image: "/icon-assets/isometric_30.webp",
    bgClass: "bg-[#EEF6FF]",
  },
  {
    name: "中小企業新事業進出補助金",
    max: "最大9,000万円",
    body: "新規事業・新市場・設備投資の相談に使いやすい",
    image: "/icon-assets/isometric_33.webp",
    bgClass: "bg-[#FFF4E8]",
  },
];

const ROW1: Card[] = FEATURED_SUBSIDIES;
const ROW2: Card[] = FEATURED_SUBSIDIES;

function MarqueeRow({ cards, reverse = false }: { cards: Card[]; reverse?: boolean }) {
  // 無限ループのため2セット並べる
  const doubled = [...cards, ...cards];

  return (
    <div className="overflow-hidden">
      <motion.div
        className="flex gap-4"
        initial={{ x: reverse ? "-50%" : "0%" }}
        animate={{ x: reverse ? "0%" : "-50%" }}
        transition={{
          duration: 35,
          ease: "linear",
          repeat: Infinity,
          repeatType: "loop",
        }}
        style={{ width: "max-content" }}
      >
        {doubled.map((card, i) => (
          <div
            key={`${card.name}-${i}`}
            className="card flex w-[210px] shrink-0 flex-col overflow-hidden p-0"
          >
            <div className={`flex h-[120px] w-full items-center justify-center ${card.bgClass}`}>
              <Image
                src={card.image}
                alt={card.name}
                width={200}
                height={200}
                className="h-[96px] w-auto object-contain"
              />
            </div>
            <div className="flex flex-1 flex-col p-4">
              <h3 className="mb-1 text-[12px] font-bold leading-snug text-[var(--text-primary)]">
                {card.name}
              </h3>
              <p className="text-highlight-gold mb-2 text-lg font-bold leading-tight">
                {card.max}
              </p>
              <p className="text-[11px] leading-relaxed text-[var(--text-secondary)]">
                {card.body}
              </p>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export default function SubsidyExamplesSection() {
  return (
    <section className="section-white relative overflow-hidden py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <motion.div
          className="mb-10 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="font-heading text-3xl font-bold leading-tight text-[var(--text-primary)] md:text-4xl">
            例えばこんな補助金もあります。
          </h2>
          <p className="mt-4 text-base text-[var(--text-secondary)]">
            自社の課題に応じて、活用できる制度をNTSが選定します。
          </p>
        </motion.div>
      </div>

      {/* 上段: 左→右方向に流れる */}
      <div className="mb-4">
        <MarqueeRow cards={ROW1} reverse={false} />
      </div>

      {/* 下段: 右→左方向（逆）に流れる */}
      <MarqueeRow cards={ROW2} reverse={true} />
    </section>
  );
}

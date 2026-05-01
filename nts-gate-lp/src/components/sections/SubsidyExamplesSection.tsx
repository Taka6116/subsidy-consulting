"use client";

import Image, { type StaticImageData } from "next/image";
import { motion } from "framer-motion";

import iso30 from "../../../../icon-assets/isometric_30.webp";
import iso31 from "../../../../icon-assets/isometric_31.webp";
import iso32 from "../../../../icon-assets/isometric_32.webp";
import iso33 from "../../../../icon-assets/isometric_33.webp";
import iso14 from "../../../../icon-assets/isometric_14.webp";
import iso13 from "../../../../icon-assets/isometric_13.webp";
import iso09 from "../../../../icon-assets/isometric_09.webp";
import iso10 from "../../../../icon-assets/isometric_10.webp";
import iso11 from "../../../../icon-assets/isometric_11.webp";
import iso12 from "../../../../icon-assets/isometric_12.webp";
import iso20 from "../../../../icon-assets/isometric_20.webp";
import iso16 from "../../../../icon-assets/isometric_16.webp";

type Card = {
  name: string;
  max: string;
  body: string;
  image: StaticImageData;
  bgClass: string;
};

const CARDS: Card[] = [
  {
    name: "中小企業省力化投資補助金",
    max: "最大1,500万円",
    body: "デジタコや業務システム、省人化機器の導入に活用できます。",
    image: iso30,
    bgClass: "bg-[#EEF6FF]",
  },
  {
    name: "IT導入補助金",
    max: "最大450万円",
    body: "会計・受発注・顧客管理などのITツール導入を支援します。",
    image: iso31,
    bgClass: "bg-[#E8F9F4]",
  },
  {
    name: "ものづくり補助金",
    max: "最大4,000万円",
    body: "生産性向上のための設備投資や新たな製品・サービス開発を支援。",
    image: iso32,
    bgClass: "bg-[#EEF6FF]",
  },
  {
    name: "事業再構築補助金",
    max: "最大1.5億円",
    body: "新分野展開・業種転換・事業転換・国際化など抜本的な再構築を支援。",
    image: iso33,
    bgClass: "bg-[#FFF4E8]",
  },
  {
    name: "事業承継・引継ぎ補助金",
    max: "最大600万円",
    body: "後継者への承継やM&Aを活用した事業引継ぎ費用を補助します。",
    image: iso14,
    bgClass: "bg-[#E8F9F4]",
  },
  {
    name: "小規模事業者持続化補助金",
    max: "最大200万円",
    body: "販路開拓や業務効率化の取り組みを幅広く支援します。",
    image: iso13,
    bgClass: "bg-[#FFF4E8]",
  },
  {
    name: "省エネ補助金（省エネルギー投資促進）",
    max: "最大15億円",
    body: "工場・事業場の省エネ設備導入で光熱費削減と脱炭素を実現。",
    image: iso09,
    bgClass: "bg-[#EEF6FF]",
  },
  {
    name: "雇用調整助成金（特例）",
    max: "最大1万5千円/日",
    body: "経営悪化時の休業・教育訓練を行う企業に休業手当等を助成。",
    image: iso10,
    bgClass: "bg-[#E8F9F4]",
  },
  {
    name: "キャリアアップ助成金",
    max: "最大80万円/人",
    body: "非正規雇用から正社員転換など処遇改善の取り組みを支援。",
    image: iso11,
    bgClass: "bg-[#FFF4E8]",
  },
  {
    name: "建設機械導入補助金",
    max: "最大1,431万円",
    body: "建設機械の電動化で燃料費・環境負担を同時に軽減します。",
    image: iso12,
    bgClass: "bg-[#EEF6FF]",
  },
  {
    name: "脱炭素移行支援補助金",
    max: "最大1.5億円",
    body: "脱炭素型経済構造への移行に向けた設備投資・体制整備を支援。",
    image: iso20,
    bgClass: "bg-[#E8F9F4]",
  },
  {
    name: "インボイス対応IT補助金",
    max: "最大350万円",
    body: "インボイス制度対応のための会計・受発注システム導入を後押し。",
    image: iso16,
    bgClass: "bg-[#FFF4E8]",
  },
];

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

      {/* 横スクロールレーン（全幅） */}
      <div
        className="flex gap-4 overflow-x-auto px-6 pb-5 md:px-8"
        style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
      >
        {CARDS.map((card, i) => (
          <motion.div
            key={card.name}
            className="card group flex w-[220px] shrink-0 flex-col overflow-hidden p-0"
            style={{ scrollSnapAlign: "start" }}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: Math.min(i * 0.06, 0.4) }}
          >
            {/* 上段: イラスト */}
            <div className={`flex h-[130px] w-full items-center justify-center ${card.bgClass}`}>
              <Image
                src={card.image}
                alt={card.name}
                className="h-[105px] w-auto object-contain"
                sizes="220px"
              />
            </div>

            {/* 下段: テキスト */}
            <div className="flex flex-1 flex-col p-5">
              <h3 className="mb-1 text-[13px] font-bold leading-snug text-[var(--text-primary)]">
                {card.name}
              </h3>
              <p className="text-highlight-gold mb-3 text-xl font-bold">
                {card.max}
              </p>
              <p className="text-[12px] leading-relaxed text-[var(--text-secondary)]">
                {card.body}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

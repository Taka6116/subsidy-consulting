"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import ScrollTextReveal from "@/components/shared/ScrollTextReveal";

type Card = {
  name: string;
  max: string;
  body: string;
  image: string;
  bgClass: string;
};

const ROW1: Card[] = [
  { name: "中小企業省力化投資補助金", max: "最大1,500万円", body: "省人化機器・デジタコ・業務システムの導入を支援。", image: "/icon-assets/isometric_30.webp", bgClass: "bg-[#EEF6FF]" },
  { name: "IT導入補助金", max: "最大450万円", body: "会計・受発注・顧客管理などのITツール導入を支援。", image: "/icon-assets/isometric_31.webp", bgClass: "bg-[#E8F9F4]" },
  { name: "ものづくり補助金", max: "最大4,000万円", body: "設備投資や新製品・サービス開発で生産性向上を図る。", image: "/icon-assets/isometric_32.webp", bgClass: "bg-[#EEF6FF]" },
  { name: "事業再構築補助金", max: "最大1.5億円", body: "新分野展開・業種転換など抜本的な再構築を支援。", image: "/icon-assets/isometric_33.webp", bgClass: "bg-[#FFF4E8]" },
  { name: "事業承継・引継ぎ補助金", max: "最大600万円", body: "後継者承継やM&Aに伴う費用を補助します。", image: "/icon-assets/isometric_14.webp", bgClass: "bg-[#E8F9F4]" },
  { name: "小規模事業者持続化補助金", max: "最大200万円", body: "販路開拓・業務効率化の取り組みを幅広く支援。", image: "/icon-assets/isometric_13.webp", bgClass: "bg-[#FFF4E8]" },
  { name: "省エネルギー投資促進支援補助金", max: "最大15億円", body: "工場・事業場の省エネ設備導入で光熱費削減を実現。", image: "/icon-assets/isometric_09.webp", bgClass: "bg-[#EEF6FF]" },
  { name: "キャリアアップ助成金", max: "最大80万円/人", body: "非正規から正社員転換など処遇改善の取り組みを支援。", image: "/icon-assets/isometric_11.webp", bgClass: "bg-[#E8F9F4]" },
];

const ROW2: Card[] = [
  { name: "建設機械導入補助金", max: "最大1,431万円", body: "建設機械の電動化で燃料費・環境負担を同時に軽減。", image: "/icon-assets/isometric_12.webp", bgClass: "bg-[#EEF6FF]" },
  { name: "脱炭素移行支援補助金", max: "最大1.5億円", body: "脱炭素型経済構造への移行に向けた設備投資を支援。", image: "/icon-assets/isometric_20.webp", bgClass: "bg-[#E8F9F4]" },
  { name: "雇用調整助成金（特例）", max: "最大1万5千円/日", body: "経営悪化時の休業・教育訓練を行う企業を助成。", image: "/icon-assets/isometric_10.webp", bgClass: "bg-[#FFF4E8]" },
  { name: "インボイス対応IT補助金", max: "最大350万円", body: "インボイス制度対応の会計・受発注システム導入を後押し。", image: "/icon-assets/isometric_16.webp", bgClass: "bg-[#EEF6FF]" },
  { name: "採択後伴走支援補助金", max: "最大200万円", body: "補助事業の実施後も専門家が伴走し経営改善を支援。", image: "/icon-assets/isometric_21.webp", bgClass: "bg-[#E8F9F4]" },
  { name: "新市場開拓支援補助金", max: "最大500万円", body: "海外展開・EC構築など新たな販路開拓を幅広く支援。", image: "/icon-assets/isometric_22.png", bgClass: "bg-[#FFF4E8]" },
  { name: "物流効率化補助金", max: "最大3,000万円", body: "配送ルート最適化・倉庫自動化で物流コストを削減。", image: "/icon-assets/isometric_04.png", bgClass: "bg-[#EEF6FF]" },
  { name: "創業支援補助金", max: "最大200万円", body: "起業・創業初期の設備や広告費用を重点的に支援。", image: "/icon-assets/isometric_05.png", bgClass: "bg-[#E8F9F4]" },
];

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
    <section className="section-white lp-section-depth relative overflow-hidden py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <motion.div
          className="mb-10 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <ScrollTextReveal
            as="h2"
            className="font-heading text-3xl font-bold leading-tight text-[var(--text-primary)] md:text-4xl"
          >
            例えばこんな補助金もあります。
          </ScrollTextReveal>
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

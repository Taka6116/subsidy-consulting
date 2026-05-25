"use client";

import type { StaticImageData } from "next/image";
import Image from "next/image";
import { motion } from "framer-motion";
import ScrollTextReveal from "@/components/shared/ScrollTextReveal";
import isometric10 from "../../../../icon-assets/isometric_10.webp";
import isometric11 from "../../../../icon-assets/isometric_11.webp";
import isometric20 from "../../../../icon-assets/isometric_20.webp";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.6, ease: EASE_OUT, delay },
});

const CARDS: {
  tag: string;
  title: string;
  body: string;
  image: StaticImageData;
}[] = [
  {
    tag: "IT・省力化機器",
    title: "IT・省力化機器メーカー・販売会社",
    body:
      "デジタコ、業務ソフト、省力化機器などの提案時に「補助金が使えます」と添えることで、導入の壁を下げられます。",
    image: isometric10,
  },
  {
    tag: "士業・コンサル",
    title: "士業・中小企業診断士・コンサル",
    body:
      "顧問先から補助金の相談を受けたとき、信頼できる紹介先があれば顧客との関係がさらに深まります。",
    image: isometric11,
  },
  {
    tag: "設備投資に関わる企業",
    title: "補助金対象設備に関わるすべての企業",
    body:
      "建設・運送・製造・介護など、設備投資や人材採用が発生する業界の顧客をお持ちの方はどなたでも対象です。",
    image: isometric20,
  },
];

export default function PartnerUseCasesSection() {
  return (
    <section
      id="use-cases"
      className="section-alt relative py-32 md:py-40"
      style={{ zIndex: 10 }}
    >
      <div className="mx-auto max-w-4xl px-6 md:px-8">
        <div className="mb-20 text-center">
          <ScrollTextReveal
            as="h2"
            className="font-heading text-3xl font-bold leading-tight text-[var(--text-primary)] md:text-4xl lg:text-5xl"
          >
            こんな企業様と
            <br />
            提携しています。
          </ScrollTextReveal>
          <motion.p
            className="mt-8 text-lg leading-relaxed text-[var(--text-secondary)] md:text-xl"
            {...fadeUp(0.12)}
          >
            業種や規模を問わず、顧客に補助金を案内できる立場の方であれば
            どなたでもご相談いただけます。
          </motion.p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {CARDS.map((card, i) => (
            <motion.div
              key={card.tag}
              {...fadeUp(i * 0.1)}
              className="card overflow-hidden p-0"
            >
              <div
                className="relative h-[160px] overflow-hidden rounded-t-[12px] bg-[#F5F8FF]"
                data-placeholder={`target-card-${i + 1}`}
              >
                <Image
                  src={card.image}
                  alt=""
                  aria-hidden="true"
                  className="h-full w-full object-contain object-center p-3"
                  sizes="(min-width: 768px) 33vw, 100vw"
                />
              </div>
              <div className="p-7">
                <p className="mb-3 text-xs text-[var(--text-muted)]">{card.tag}</p>
                <h3 className="mb-5 font-heading text-xl font-bold leading-snug text-[var(--text-primary)] md:text-2xl">
                  {card.title}
                </h3>
                <div className="border-t border-[var(--border-subtle)] pt-4">
                  <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{card.body}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import type { ReactNode } from "react";
import type { StaticImageData } from "next/image";
import Image from "next/image";
import { motion } from "framer-motion";
import isometric24 from "../../../../icon-assets/isometric_24.webp";
import isometric14 from "../../../../icon-assets/isometric_14.webp";
import isometric12 from "../../../../icon-assets/isometric_12.webp";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.6, ease: EASE_OUT, delay },
});

const CARDS: {
  situation: string;
  pain: string;
  note: ReactNode;
  placeholder: string;
  image: StaticImageData;
  imageAlt: string;
}[] = [
  {
    situation: "提案したとき",
    pain: "「費用が\nネック…」",
    note: (
      <>
        設備投資に二の足を踏む顧客に「補助金が使えます」と伝えられたら、商談の結末が変わります。
      </>
    ),
    placeholder: "awareness-card-1",
    image: isometric24,
    imageAlt: "",
  },
  {
    situation: "せっかく興味を持ってもらっても",
    pain: "「今期の\n予算が…」",
    note: (
      <>
        予算不足を理由に見送った顧客が、補助金を知っていれば発注できたケースがあります。
      </>
    ),
    placeholder: "awareness-card-2",
    image: isometric14,
    imageAlt: "",
  },
  {
    situation: "判断を保留されて",
    pain: "「少し\n考えます…」",
    note: (
      <>
        判断を保留した顧客の背景に、資金調達の不安があることは珍しくありません。
      </>
    ),
    placeholder: "awareness-card-3",
    image: isometric12,
    imageAlt: "",
  },
];

export default function PartnerAgitationSection() {
  return (
    <section
      id="agitation"
      className="section-white relative py-32 md:py-40"
      style={{ zIndex: 10 }}
    >
      <div className="mx-auto max-w-4xl px-6 md:px-8">
        <div className="mb-20 text-center">
          <motion.h2
            className="font-heading text-3xl font-bold leading-tight text-[var(--text-primary)] md:text-4xl lg:text-5xl"
            {...fadeUp(0)}
          >
            その「見送り」の裏に、
            <br />
            使えるはずの補助金がありました。
          </motion.h2>

          <motion.p
            className="mt-8 text-lg leading-relaxed text-[var(--text-secondary)] md:text-xl"
            {...fadeUp(0.15)}
          >
            顧客が「予算がネックで…」と言うとき、その決断の前に補助金という選択肢を提示できていたでしょうか。
            <br />
            知らないまま逃している案件が、あるかもしれません。
          </motion.p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {CARDS.map((card, i) => (
            <motion.div
              key={i}
              {...fadeUp(i * 0.1)}
              className="card overflow-hidden p-0"
            >
              <div
                className="relative h-[160px] overflow-hidden rounded-t-[12px] bg-[#F0F6FF]"
                data-placeholder={card.placeholder}
              >
                <Image
                  src={card.image}
                  alt={card.imageAlt}
                  aria-hidden="true"
                  className="h-full w-full object-contain object-center p-3"
                  sizes="(min-width: 768px) 33vw, 100vw"
                />
              </div>
              <div className="p-7">
                <p className="mb-3 text-xs text-[var(--text-muted)]">{card.situation}</p>
                <p className="mb-5 whitespace-pre-line font-heading text-2xl font-bold leading-snug text-[var(--text-primary)]">
                  {card.pain}
                </p>
                <div className="border-t border-[var(--border-subtle)] pt-4">
                  <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{card.note}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.a
          href="#merit"
          className="mt-16 block rounded-2xl border border-[var(--accent-gold)]/25 bg-[var(--accent-gold)]/10 p-8 text-center transition hover:bg-[var(--accent-gold)]/15"
          {...fadeUp(0.3)}
        >
          <p className="font-heading text-xl font-bold text-[var(--text-primary)] md:text-2xl">
            「補助金が使えます」——その一言が、
            <span className="text-highlight-gold">御社の武器になります。</span>
          </p>
          <p className="mt-3 text-sm font-semibold text-[var(--accent-teal)]">
            提携プログラムの詳細を見る →
          </p>
        </motion.a>
      </div>
    </section>
  );
}

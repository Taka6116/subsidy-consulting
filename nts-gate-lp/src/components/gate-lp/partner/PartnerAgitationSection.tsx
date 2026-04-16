"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

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
}[] = [
  {
    situation: "顧客に提案しても",
    pain: "「費用が\nネックで…」",
    note: (
      <>
        省力化補助金を活用すれば、自己負担が半額以下になるケースがあります。
        <br />
        「高くて無理」が「補助金があるなら動ける」に変わります。
        <br />
        NTSが採択後も1年間伴走するので、紹介した後も顧客に責任を果たせます。
      </>
    ),
    placeholder: "awareness-card-1",
  },
  {
    situation: "せっかく興味を持ってもらっても",
    pain: "「今期の\n予算がない」",
    note: (
      <>
        補助金の公募スケジュールに合わせれば、「来期でいい」を「今動く」に変えられます。
        <br />
        NTSが採択後も継続的に関わるので、紹介した後のフォローも安心です。
      </>
    ),
    placeholder: "awareness-card-2",
  },
  {
    situation: "検討が長引いて",
    pain: "「やっぱり\n見送ります」",
    note: (
      <>
        「補助金が使える」という一言が、止まっていた意思決定を動かします。
        <br />
        採択後も1年間伴走する体制があることが、顧客の背中を押す武器になります。
      </>
    ),
    placeholder: "awareness-card-3",
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
            その「見送ります」の裏に、
            <br />
            使えるはずの補助金があります。
          </motion.h2>

          <motion.p
            className="mt-8 text-lg leading-relaxed text-[var(--text-secondary)] md:text-xl"
            {...fadeUp(0.15)}
          >
            「費用がネックで…」「今期は予算がなくて…」——
            <br className="hidden sm:block" />
            その言葉が出るたびに、商談を諦めてきませんでしたか。
            <br />
            実は、補助金を知らないだけのケースがほとんどです。
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
                className="relative h-[140px] overflow-hidden rounded-t-[12px] bg-[#F0F6FF]"
                data-placeholder={card.placeholder}
              >
                <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-xs text-[#B0C4D8]">
                  画像を入れる場所
                </p>
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

        <motion.div
          className="mt-16 rounded-2xl border border-[var(--accent-gold)]/25 bg-[var(--accent-gold)]/10 p-8 text-center"
          {...fadeUp(0.3)}
        >
          <p className="font-heading text-xl font-bold text-[var(--text-primary)] md:text-2xl">
            「補助金が使えます」——
            <br />
            <span className="text-highlight-gold">その一言の先に、NTSの1年間の伴走があります。</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}

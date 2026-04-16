"use client";

import { motion } from "framer-motion";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.6, ease: EASE_OUT, delay },
});

const CARDS = [
  {
    tag: "IT・省力化商材",
    title: "IT・省力化商材を売る企業",
    body:
      "IoT機器・ロボット・業務システムなど、省力化補助金の対象になりやすい商材を扱っている会社。「補助金が使えます」という一言で、導入検討が一気に前進します。",
  },
  {
    tag: "士業・支援",
    title: "士業・中小企業支援・コンサル",
    body:
      "税理士・行政書士・中小企業診断士など、経営者の相談窓口になっている士業・コンサル。顧客に「補助金という選択肢」を渡すことで、支援の幅が広がります。",
  },
  {
    tag: "対象商材",
    title: "補助金対象商材に関わるすべての企業",
    body:
      "建設業・運送業向けの商材・サービスを扱っている会社はとくにご相談ください。NTSが特に注力している業種のため、提案がスムーズに進みます。",
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
          <motion.p
            className="label-section mb-4"
            {...fadeUp(0)}
          >
            FOR PARTNERS
          </motion.p>
          <motion.h2
            className="font-heading text-3xl font-bold leading-tight text-[var(--text-primary)] md:text-4xl lg:text-5xl"
            {...fadeUp(0.05)}
          >
            どんな方が、
            <br />
            提携先になっていますか。
          </motion.h2>
          <motion.p
            className="mt-8 text-lg leading-relaxed text-[var(--text-secondary)] md:text-xl"
            {...fadeUp(0.12)}
          >
            業種を問わず、「補助金」という選択肢を持つことで、顧客への提案力が変わります。
          </motion.p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {CARDS.map((card, i) => (
            <motion.div
              key={card.tag}
              {...fadeUp(i * 0.1)}
              className="card p-7"
            >
              <p className="mb-3 text-xs text-[var(--text-muted)]">{card.tag}</p>
              <h3 className="mb-5 font-heading text-xl font-bold leading-snug text-[var(--text-primary)] md:text-2xl">
                {card.title}
              </h3>
              <div className="border-t border-[var(--border-subtle)] pt-4">
                <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{card.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

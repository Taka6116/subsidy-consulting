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
    tag: "設備・機器販売業",
    title: "省力化設備を扱う企業",
    body:
      "「費用がネックで」と断られてきた商談に、補助金という新しい選択肢を加えられます。中小企業省力化投資補助金（最大1,500万円）が対象になるケースが多くあります。",
  },
  {
    tag: "士業・コンサルタント",
    title: "税理士・社労士・FP・中小企業診断士",
    body:
      "顧問先が抱える「人手不足」「事業承継」の課題に、補助金という解決策を提案できます。知識は不要。NTSが判断から申請まで行います。",
  },
  {
    tag: "その他",
    title: "「顧客の経営課題」に向き合う方すべて",
    body:
      "IT支援・建設・製造・流通など業種は問いません。「投資を考えている顧客がいる」「経営者と話せる」——それだけで提携の条件を満たします。",
  },
];

export default function PartnerUseCasesSection() {
  return (
    <section id="use-cases" className="relative py-32 md:py-40" style={{ zIndex: 10 }}>
      <div className="mx-auto max-w-4xl px-6 md:px-8">
        <div className="mb-20 text-center">
          <motion.p
            className="mb-4 text-[11px] font-bold uppercase tracking-[0.25em] text-white/35"
            {...fadeUp(0)}
          >
            FOR PARTNERS
          </motion.p>
          <motion.h2
            className="font-heading text-3xl font-bold leading-tight text-white md:text-4xl lg:text-5xl"
            {...fadeUp(0.05)}
          >
            どんな方が、
            <br />
            提携先になっていますか。
          </motion.h2>
          <motion.p
            className="mt-8 text-lg leading-relaxed text-white/[0.58] md:text-xl"
            {...fadeUp(0.12)}
          >
            業種を問わず、「顧客に投資を検討している企業がいる」方であれば提携できます。
          </motion.p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {CARDS.map((card, i) => (
            <motion.div
              key={card.tag}
              {...fadeUp(i * 0.1)}
              className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-7 backdrop-blur-[12px] [-webkit-backdrop-filter:blur(12px)]"
            >
              <p className="mb-3 text-xs text-white/[0.38]">{card.tag}</p>
              <h3 className="mb-5 font-heading text-xl font-bold leading-snug text-white md:text-2xl">
                {card.title}
              </h3>
              <div className="border-t border-white/10 pt-4">
                <p className="text-sm leading-relaxed text-white/55">{card.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

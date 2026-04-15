"use client";

import { motion } from "framer-motion";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 },
  transition: { duration: 0.6, ease: EASE_OUT, delay },
});

const FAQ_ITEMS = [
  {
    q: "補助金の知識がなくても大丈夫ですか？",
    a: "まったく問題ありません。診断・書類作成・申請まで、すべてNTSが対応します。提携先の方にお願いするのは、「補助金が使えるかもしれません」とお客様に一言お伝えいただくことだけです。",
  },
  {
    q: "紹介した顧客に断られた場合、関係が気まずくなりませんか？",
    a: "ご安心ください。NTSが直接お客様に連絡・対応するため、提携先の方が矢面に立つことはありません。「使えなかった」という結果でも、提案した誠意はお客様に残ります。",
  },
  {
    q: "フィーはいつ、どのくらい受け取れますか？",
    a: "補助金の採択・入金後にお支払いします。金額は案件の補助額に応じて変わります。詳細は個別にご案内しますので、まずはお問い合わせください。",
  },
  {
    q: "紹介できる件数に上限はありますか？",
    a: "上限はありません。紹介いただいた件数分、フィーをお支払いします。",
  },
];

export default function PartnerFaqSection() {
  return (
    <section id="faq" className="relative py-32 md:py-40" style={{ zIndex: 10 }}>
      <div className="mx-auto max-w-3xl px-6 md:px-8">
        <div className="mb-14 text-center">
          <motion.p
            className="mb-4 text-[11px] font-bold uppercase tracking-[0.25em] text-white/35"
            {...fadeUp(0)}
          >
            FAQ
          </motion.p>
          <motion.h2
            className="font-heading text-3xl font-bold leading-tight text-white md:text-4xl lg:text-5xl"
            {...fadeUp(0.06)}
          >
            よくある疑問に答えます。
          </motion.h2>
        </div>

        <div className="flex flex-col gap-4">
          {FAQ_ITEMS.map((item, i) => (
            <motion.div
              key={item.q}
              {...fadeUp(0.08 + i * 0.06)}
              className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-6 backdrop-blur-[12px] [-webkit-backdrop-filter:blur(12px)] md:p-8"
            >
              <p className="font-heading text-lg font-bold leading-snug text-white md:text-xl">
                Q. {item.q}
              </p>
              <p className="mt-4 border-t border-white/10 pt-4 text-sm leading-relaxed text-white/60 md:text-base">
                A. {item.a}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

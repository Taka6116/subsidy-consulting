"use client";

import { motion } from "framer-motion";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.6, ease: EASE_OUT, delay },
});

export default function PartnerAboutSection() {
  return (
    <section
      className="section-white relative py-32 md:py-40"
      style={{ zIndex: 10 }}
    >
      <div className="mx-auto max-w-4xl px-6 md:px-8">
        <div className="card p-10 md:p-14">
          <motion.div {...fadeUp(0)}>
            <p className="label-section mb-4">About NTS</p>
            <h2 className="font-heading text-3xl font-bold leading-snug text-[var(--text-primary)] md:text-4xl">
              補助金活用の専門チームが、
              <br />
              提携先とともに動きます。
            </h2>
          </motion.div>

          <motion.p
            className="mt-6 text-base leading-relaxed text-[var(--text-secondary)]"
            {...fadeUp(0.1)}
          >
            申請サポートにとどまらず、採択後の1年間もお客様の経営に寄り添います。
            御社が紹介してくださった顧客に、NTSが責任を持って伴走します。
          </motion.p>

          <motion.div
            className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3"
            {...fadeUp(0.2)}
          >
            {[
              {
                title: "3種類",
                body: "NTSが対応する補助金は現在3種類。顧客の課題に合わせて最適な制度を選定します。",
              },
              {
                title: "全対応",
                body: "戦略設計から申請サポート・採択後の1年伴走まで、NTSが一貫して担当します。",
              },
              {
                title: "完全成果報酬",
                body: "採択されなければ紹介フィーは発生しません。御社のリスクはゼロです。",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-base)] px-6 py-5 text-center"
              >
                <p className="mb-2 text-xl font-bold text-[var(--text-primary)]">{item.title}</p>
                <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{item.body}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { motion } from "framer-motion";

const subsidies = [
  {
    category: "省力化・DX",
    name: "中小企業省力化投資補助金",
    max: "最大1,500万円",
    body: "人手不足に悩む企業が、IoT機器・ロボットなどの省力化製品を導入する際の費用を支援します。建設業・運送業の顧客に特に刺さる補助金です。",
    fit: "IT・機械・設備ベンダー向け",
  },
  {
    category: "事業承継・引継ぎ",
    name: "事業承継・引継ぎ補助金",
    max: "最大600万円",
    body: "代替わりやM&Aをきっかけとした設備投資・専門家費用を支援します。後継者問題を抱える経営者への提案で力を発揮します。",
    fit: "士業・コンサル向け",
  },
  {
    category: "IT導入",
    name: "IT導入補助金",
    max: "最大450万円",
    body: "業務効率化を目的としたITツール・システムの導入費用を支援します。DX推進を検討している顧客へのきっかけとして活用できます。",
    fit: "SaaS・ITサービスベンダー向け",
  },
];

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 },
  transition: { duration: 0.6, ease: EASE_OUT, delay },
});

export default function PartnerSubsidySection() {
  return (
    <section
      className="section-white relative py-32 md:py-40"
      style={{ zIndex: 10 }}
    >
      <div className="mx-auto max-w-5xl px-6 md:px-8">
        <motion.div className="mb-16 text-center" {...fadeUp(0)}>
          <p className="label-section mb-4">Target Subsidies</p>
          <h2 className="font-heading text-3xl font-bold leading-tight text-[var(--text-primary)] md:text-4xl">
            提携先に使える補助金、3種。
          </h2>
          <p className="mt-4 text-base text-[var(--text-secondary)]">
            NTSが現在サポートしている補助金です。
            <br />
            御社の顧客の業種・課題に合わせて、最適な制度をNTSが選定します。
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {subsidies.map((s, i) => (
            <motion.div
              key={s.name}
              {...fadeUp(i * 0.1)}
              className="card group relative flex flex-col p-7 transition-all duration-300"
            >
              <div
                className={`absolute right-4 top-4 h-20 w-20 rounded-lg ${
                  i === 0 ? "bg-[#EEF6FF]" : i === 1 ? "bg-[#E8F9F4]" : "bg-[#FFF4E8]"
                }`}
                data-placeholder={`subsidy-icon-${i + 1}`}
              />
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                {s.category}
              </p>
              <h3 className="mb-1 pr-24 text-lg font-bold leading-snug text-[var(--text-primary)]">{s.name}</h3>
              <p className="text-highlight-gold mb-4 text-2xl font-bold">
                {s.max}
              </p>
              <p className="mb-5 flex-1 text-sm leading-relaxed text-[var(--text-secondary)]">
                {s.body}
              </p>
              <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-section-alt)] px-4 py-2.5">
                <p className="text-[11px] text-[var(--text-muted)]">{s.fit}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

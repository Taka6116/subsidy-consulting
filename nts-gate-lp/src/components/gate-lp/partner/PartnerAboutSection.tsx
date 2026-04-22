"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.6, ease: EASE_OUT, delay },
});

const STATS = [
  {
    title: "1年伴走",
    body: "採択後の1年間も、お客様の経営に寄り添います。",
  },
  {
    title: "行政書士連携",
    body: "申請プロセスは提携行政書士と共に進めます。",
  },
  {
    title: "完全成果報酬",
    body: "採択されなければ紹介フィーは発生しません。",
  },
];

export default function PartnerAboutSection() {
  return (
    <section
      id="about-nts"
      className="section-white relative py-32 md:py-40"
      style={{ zIndex: 10 }}
    >
      <div className="mx-auto max-w-5xl px-6 md:px-8">
        <motion.div
          className="overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-white shadow-[0_20px_60px_rgba(10,34,64,0.12)]"
          {...fadeUp(0)}
        >
          {/* 上段：チーム写真バナー（上下をトリミングして顔まわりにフォーカス） */}
          <div className="relative aspect-[16/7] w-full overflow-hidden sm:aspect-[1024/340]">
            <Image
              src="/images/subsidy-footer.webp"
              alt="日本提携支援株式会社 チームメンバー"
              fill
              sizes="(min-width: 1024px) 960px, 100vw"
              className="object-cover object-[center_42%]"
              priority={false}
            />
            {/* 下部にソフトなグラデーションオーバーレイ（キャプションの可読性確保） */}
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent"
              aria-hidden="true"
            />
            {/* キャプションピル */}
            <div className="absolute bottom-6 left-6 rounded-full bg-white/95 px-4 py-2 text-xs font-medium text-[var(--text-primary)] shadow-sm backdrop-blur-sm md:bottom-8 md:left-8 md:text-sm">
              紹介いただいた案件を、このチームが担当します
            </div>
          </div>

          {/* 下段：コピー + Stats */}
          <div className="bg-white px-6 py-12 md:px-12 md:py-16 lg:px-16 lg:py-20">
            <div className="mx-auto max-w-3xl text-center">
              <motion.p className="label-section mb-4" {...fadeUp(0.1)}>
                About NTS
              </motion.p>

              <motion.h2
                className="font-heading text-2xl font-bold leading-snug text-[var(--text-primary)] md:text-3xl lg:text-[2.25rem] lg:leading-[1.35]"
                {...fadeUp(0.15)}
              >
                紹介いただいた顧客に、
                <br className="hidden md:block" />
                私たちが責任を持って伴走します。
              </motion.h2>

              <motion.p
                className="mt-6 text-base leading-relaxed text-[var(--text-secondary)] md:text-lg"
                {...fadeUp(0.2)}
              >
                日本提携支援は、補助金の活用戦略設計から採択、そして採択後1年間の伴走までを一貫して支援する専門チームです。
                提携先の皆様からご紹介いただいた案件には、私たちが責任を持って対応します。
              </motion.p>
            </div>

            <motion.div
              className="mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-4 border-t border-[var(--border-subtle)] pt-10 sm:grid-cols-3"
              {...fadeUp(0.28)}
            >
              {STATS.map((item) => (
                <div key={item.title} className="text-center">
                  <p className="mb-2 font-heading text-base font-bold leading-tight text-[var(--accent-navy)] md:text-lg">
                    {item.title}
                  </p>
                  <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                    {item.body}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

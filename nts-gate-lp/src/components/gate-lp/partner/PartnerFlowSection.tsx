"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import PANA3025 from "../../../../icon-assets/PANA3025.webp";
import PANA2727 from "../../../../icon-assets/PANA2727.webp";
import PANA2741 from "../../../../icon-assets/PANA2741.webp";
import PANA2962 from "../../../../icon-assets/PANA2962.webp";
import PANA2975 from "../../../../icon-assets/PANA2975.webp";

const consultantPhotos = [PANA3025, PANA2727, PANA2741, PANA2962, PANA2975];

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 },
  transition: { duration: 0.6, ease: EASE_OUT, delay },
});

export default function PartnerFlowSection() {
  return (
    <section
      className="section-alt relative py-32 md:py-40"
      style={{ zIndex: 10 }}
    >
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <motion.div className="mb-16 text-center" {...fadeUp(0)}>
          <h2 className="font-heading text-3xl font-bold text-[var(--text-primary)] md:text-4xl">
            お客様の経営課題に、
            <br />
            補助金という解決策を添えて届けます。
          </h2>
          <p className="mt-6 text-base leading-relaxed text-[var(--text-secondary)] md:text-lg">
            ヒアリングから補助金の活用戦略の設計、提携行政書士との連携を通じた申請のサポート、採択後の伴走まで、NTSが段階を追って進めます。
            <br className="hidden md:inline" />
            制度の細部まで御社で説明いただく必要はありません。まずはお声がけをお願いします。
          </p>
        </motion.div>

        <motion.div
          {...fadeUp(0.1)}
          className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5"
          aria-label="日本提携支援の担当者"
        >
          {consultantPhotos.map((photo) => (
            <div
              key={photo.src}
              className="relative aspect-[4/5] overflow-hidden rounded-[22px] shadow-[0_18px_46px_-26px_rgba(26,76,142,0.48)]"
            >
              <Image
                src={photo}
                alt="日本提携支援の担当者"
                fill
                sizes="(max-width: 1024px) 45vw, (max-width: 1536px) 18vw, 220px"
                quality={90}
                className="object-cover object-[50%_15%]"
              />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

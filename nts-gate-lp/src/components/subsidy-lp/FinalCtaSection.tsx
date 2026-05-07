"use client";

import Image, { type StaticImageData } from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import staff1 from "../../../icon-assets/PANA2727.webp";
import staff2 from "../../../icon-assets/PANA2741.webp";
import staff3 from "../../../icon-assets/PANA2962.webp";
import staff4 from "../../../icon-assets/PANA2975.webp";
import staff5 from "../../../icon-assets/PANA3025.webp";

const staffPhotos: StaticImageData[] = [staff1, staff2, staff3, staff4, staff5];

export default function FinalCtaSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % staffPhotos.length);
    }, 3500);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section className="relative overflow-hidden bg-[#0B173A] py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col items-center gap-10 md:flex-row">
          <div className="flex-1 text-white">
            <p className="mb-2 text-sm font-medium text-[#FEA00D]">補助金のプロが、</p>
            <h2 className="mb-4 text-2xl font-bold leading-tight text-white md:text-4xl">
              貴社の挑戦を
              <br />
              サポートします
            </h2>
            <p className="text-sm leading-relaxed text-white md:text-base">
              「自社が対象か知りたい」「まずは相談だけしたい」
              <br />
              そんな方もお気軽にご相談ください。
            </p>
          </div>

          <div className="flex flex-col items-center gap-3">
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs text-white">
              簡単30秒で完了
            </span>
            <a
              href="#contact"
              id="cta-main"
              className="inline-flex w-64 items-center justify-center rounded-lg bg-[#FEA00D] px-8 py-4 text-base font-bold text-white transition-colors hover:bg-[#e8900a]"
            >
              無料相談を予約する →
            </a>
          </div>

          <div className="hidden w-48 flex-shrink-0 md:block">
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  className="absolute inset-0"
                >
                  <Image
                    src={staffPhotos[activeIndex]}
                    alt="専門コンサルタント"
                    fill
                    sizes="200px"
                    className="object-cover"
                    priority={activeIndex === 0}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

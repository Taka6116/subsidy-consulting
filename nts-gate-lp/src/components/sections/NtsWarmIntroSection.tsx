"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import {
  fadeInUpInitial,
  fadeInUpInView,
  fadeInUpReduced,
  fadeInUpTransition,
  fadeInUpViewport,
} from "@/components/sections/sectionStyles";

const PHOTO_SRC = "/images/PANA2822-2.jpg";

/**
 * 課題共感の次 — 日本提携支援の紹介（左：写真 / 右：コピー）
 */
export default function NtsWarmIntroSection() {
  const reduce = useReducedMotion();

  return (
    <section
      className="section-block section-alt"
      aria-labelledby="home-nts-warm-intro-heading"
    >
      <div className="section-inner">
        <motion.div
          initial={reduce ? fadeInUpReduced : fadeInUpInitial}
          whileInView={reduce ? fadeInUpReduced : fadeInUpInView}
          viewport={fadeInUpViewport}
          transition={fadeInUpTransition}
        >
          <div className="mb-12 text-center md:mb-16">
            <p className="sec-label mb-3">日本提携支援</p>
            <h2
              id="home-nts-warm-intro-heading"
              className="font-heading text-[1.75rem] font-bold leading-snug text-[var(--text-primary)] md:text-[2.25rem]"
            >
              「補助金が使えます」——その一言の先に、1年間の伴走があります。
            </h2>
          </div>

          <div className="two-col img-left mt-2">
            <div className="col-img w-full max-w-xl justify-self-center lg:max-w-none">
              <div className="overflow-hidden rounded-[1.35rem] shadow-[0_14px_48px_-12px_rgba(26,76,142,0.2)] ring-1 ring-[rgba(26,76,142,0.08)] sm:rounded-[1.75rem]">
                <Image
                  src={PHOTO_SRC}
                  alt="日本提携支援のスタッフが対話している様子"
                  width={1200}
                  height={900}
                  className="h-auto w-full object-cover object-[50%_45%] brightness-[1.02] saturate-[1.03]"
                  sizes="(max-width: 1024px) 100vw, 46vw"
                  priority={false}
                />
              </div>
            </div>

            <div className="col-text flex flex-col justify-center gap-5 text-center lg:text-left">
              <p className="font-heading text-xl font-bold leading-snug text-[var(--text-primary)] md:text-2xl">
                私たちは補助金だけではなく、あなたが直面している経営課題にも寄り添います。
              </p>
              <p className="text-base font-medium leading-loose text-[var(--text-secondary)] md:text-lg md:leading-loose">
                採択して終わりではなく、1年間にわたり伴走いたします。
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

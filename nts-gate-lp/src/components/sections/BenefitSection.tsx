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
import imgIsometric10 from "../../../icon-assets/isometric_10.webp";
import imgIsometric13 from "../../../icon-assets/isometric_13.webp";
import imgIsometric14 from "../../../icon-assets/isometric_14.webp";

const HIGHLIGHTS = [
  { main: "150,000円", sub: "" },
  { main: "5%", sub: "（補助額）" },
  { main: "5% × 2回", sub: "（補助額）" },
] as const;

const BENEFIT_IMAGES = [
  { src: imgIsometric13, alt: "着手金・戦略設計のイメージ" },
  { src: imgIsometric10, alt: "採択時の成果報酬のイメージ" },
  { src: imgIsometric14, alt: "実績報告・1年後の効果検証のイメージ" },
] as const;

const BENEFITS = [
  {
    num: "01",
    title: "着手金",
    body: (
      <>
        初回ヒアリング・補助金活用戦略の設計費用です。
        <br />
        まず会社の課題を理解し、方針を固めます。
      </>
    ),
  },
  {
    num: "02",
    title: "成果報酬（採択時）",
    body: (
      <>
        採択が決まった時点でいただきます。
        <br />
        結果が出て初めて発生するフィーです。
      </>
    ),
  },
  {
    num: "03",
    title: "成果報酬（報告完了・1年後）",
    body: (
      <>
        実績報告・精算完了時と、1年後の効果検証時にそれぞれ5%。
        <br />
        最後まで関わり続けるからこそ、この設計です。
      </>
    ),
  },
] as const;

export default function BenefitSection() {
  const reduce = useReducedMotion();

  return (
    <section className="section-block bg-section-gray" aria-labelledby="home-benefit-heading">
      <div className="section-inner">
        <motion.div
          initial={reduce ? fadeInUpReduced : fadeInUpInitial}
          whileInView={reduce ? fadeInUpReduced : fadeInUpInView}
          viewport={fadeInUpViewport}
          transition={fadeInUpTransition}
        >
          <div className="mb-12 text-center md:mb-16">
            <p className="sec-label mb-3">FEE STRUCTURE</p>
            <h2
              id="home-benefit-heading"
              className="font-heading text-[1.75rem] font-bold leading-snug text-[var(--text-primary)] md:text-[2.25rem]"
            >
              段階的な成果報酬で、
              <br />
              最後まで責任を共有します。
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[var(--text-secondary)] md:text-lg">
              「採択された瞬間に全額請求」ではありません。1年間の成果を見届けながら、3つのタイミングでお支払いいただく構造です。
            </p>
          </div>

          <div className="mb-14 grid grid-cols-1 gap-x-6 gap-y-2 md:mb-16 md:grid-cols-3">
            {BENEFITS.map(({ num, title, body }, idx) => {
              const hi = HIGHLIGHTS[idx];
              const image = BENEFIT_IMAGES[idx];
              return (
                <div key={num} className="flex flex-col">
                  {/* カード外・上部 — 全カード共通 h-36 で高さを揃える */}
                  <div className="flex h-36 w-full items-end justify-center pb-3">
                    <Image
                      src={image.src}
                      alt={image.alt}
                      className="max-h-full w-auto object-contain drop-shadow-sm"
                      sizes="160px"
                      priority={false}
                    />
                  </div>
                  {/* カード本体 */}
                  <div className="nts-card flex flex-1 flex-col p-9 md:p-10">
                    <p className="mb-3 font-heading text-[0.7rem] font-bold tracking-[0.12em] text-[var(--accent-teal)]">
                      {num}
                    </p>
                    <h3 className="mb-4 min-h-[3.5rem] font-heading text-xl font-extrabold leading-snug text-[var(--text-primary)] md:text-[1.25rem]">
                      {title}
                    </h3>
                    <div
                      className="mb-4 rounded-[10px] px-4 py-3"
                      style={{ backgroundColor: "rgba(0, 184, 148, 0.06)" }}
                    >
                      <span className="font-heading text-2xl font-extrabold leading-none text-[var(--accent-teal)] md:text-[1.5rem]">
                        {hi.main}
                      </span>
                      {hi.sub ? (
                        <span className="ml-2 text-[0.8rem] text-[var(--text-secondary)]">{hi.sub}</span>
                      ) : null}
                    </div>
                    <p className="flex-1 text-sm leading-[1.9] text-[var(--text-secondary)] md:text-base">{body}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

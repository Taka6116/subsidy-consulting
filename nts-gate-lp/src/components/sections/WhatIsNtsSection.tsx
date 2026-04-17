"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import isometric11 from "../../../icon-assets/isometric_11.webp";
import isometric13 from "../../../icon-assets/isometric_13.webp";
import isometric15 from "../../../icon-assets/isometric_15.webp";
import isometric14 from "../../../icon-assets/isometric_14.webp";
import PANA3025 from "../../../icon-assets/PANA3025.webp";
import PANA2727 from "../../../icon-assets/PANA2727.webp";
import PANA2741 from "../../../icon-assets/PANA2741.webp";
import PANA2962 from "../../../icon-assets/PANA2962.webp";
import PANA2975 from "../../../icon-assets/PANA2975.webp";
import {
  fadeInUpInitial,
  fadeInUpInView,
  fadeInUpReduced,
  fadeInUpTransition,
  fadeInUpViewport,
} from "@/components/sections/sectionStyles";

const FLOW_STEPS = [
  {
    title: "無料で補助金を照会",
    body: "会社名・業種を入力するだけで、対象補助金をすぐに確認できます。",
    image: isometric11,
    bg: "#EEF6FF",
    border: "#B5D4F4",
  },
  {
    title: "戦略設計・ご相談",
    body: "経営課題に合わせた補助金活用プランを専門家が設計します。",
    image: isometric13,
    bg: "#E8F9F4",
    border: "#9FE1CB",
  },
  {
    title: "書類作成・申請",
    body: "提携行政書士と連携し、採択率を高める申請書類を一緒に作ります。",
    image: isometric15,
    bg: "#EEF6FF",
    border: "#B5D4F4",
  },
  {
    title: "採択・1年間伴走",
    body: "採択後の効果検証・実績報告まで、1年間サポートを継続します。",
    image: isometric14,
    bg: "#E8F9F4",
    border: "#9FE1CB",
  },
] as const;

const PANA_IMAGES = [
  { src: PANA3025, alt: "NTSコンサルタント" },
  { src: PANA2727, alt: "NTSコンサルタント" },
  { src: PANA2741, alt: "NTSコンサルタント" },
  { src: PANA2962, alt: "NTSコンサルタント" },
  { src: PANA2975, alt: "NTSコンサルタント" },
] as const;

export default function WhatIsNtsSection() {
  const reduce = useReducedMotion();

  return (
    <section className="section-block bg-section-white" aria-labelledby="home-what-is-nts-heading">
      <div className="section-inner">
        <motion.div
          initial={reduce ? fadeInUpReduced : fadeInUpInitial}
          whileInView={reduce ? fadeInUpReduced : fadeInUpInView}
          viewport={fadeInUpViewport}
          transition={fadeInUpTransition}
        >
          <div className="mb-12 text-center md:mb-16">
            <p className="sec-label mb-2">NTSとは</p>
            <h2
              id="home-what-is-nts-heading"
              className="font-heading text-[1.75rem] font-bold leading-snug text-[var(--text-primary)] md:text-[2.25rem]"
            >
              補助金活用から伴走までのフロー
            </h2>
          </div>

          <div className="flex flex-col gap-10 lg:flex-row lg:gap-12">
            {/* 左カラム: 2×2 フロー図 */}
            <div className="lg:w-[58%]">
              <div className="grid grid-cols-2 gap-4 md:gap-6">
                {FLOW_STEPS.map((step, i) => {
                  const stepNo = String(i + 1).padStart(2, "0");
                  const showRightArrow = i % 2 === 0;
                  const showDownArrow = i < 2;
                  return (
                    <div key={step.title} className="relative flex flex-col items-center">
                      {/* ステップカード */}
                      <div
                        className="relative h-36 w-full overflow-hidden rounded-2xl border md:h-40"
                        style={{ background: step.bg, borderColor: step.border }}
                      >
                        <Image
                          src={step.image}
                          alt={step.title}
                          className="absolute bottom-0 left-1/2 h-[88%] w-auto -translate-x-1/2 object-contain"
                        />
                      </div>

                      {/* 横矢印（各行の左カード → 右カード） */}
                      {showRightArrow && (
                        <span
                          className="absolute right-[-18px] top-[70px] z-10 hidden text-[#1A7B6F] lg:flex"
                          aria-hidden
                        >
                          <ArrowRight className="h-5 w-5" />
                        </span>
                      )}

                      {/* 下矢印（上段2枚） */}
                      {showDownArrow && (
                        <span
                          className="mt-2 hidden text-[#1A7B6F] lg:flex"
                          aria-hidden
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 5v14M5 12l7 7 7-7" />
                          </svg>
                        </span>
                      )}

                      <div className="mx-auto mb-2 mt-3 flex h-7 w-7 items-center justify-center rounded-full bg-[#1A7B6F] text-xs font-semibold text-white">
                        {stepNo}
                      </div>
                      <p className="mb-1 text-center text-sm font-semibold text-[var(--text-primary)]">
                        {step.title}
                      </p>
                      <p className="text-center text-[12px] leading-[1.7] text-[var(--text-secondary)]">
                        {step.body}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 右カラム: PANA 5枚均一（上3・下2中央） */}
            <div className="hidden lg:flex lg:w-[42%] lg:flex-col lg:gap-3">
              {/* 上段: 3枚 */}
              <div className="grid grid-cols-3 gap-3">
                {PANA_IMAGES.slice(0, 3).map((img) => (
                  <div key={img.alt + img.src.src} className="overflow-hidden rounded-xl">
                    <Image
                      src={img.src}
                      alt={img.alt}
                      width={320}
                      height={420}
                      className="h-auto w-full object-cover"
                    />
                  </div>
                ))}
              </div>

              {/* 下段: 2枚（中央寄せ） */}
              <div className="grid grid-cols-3 gap-3">
                <div aria-hidden="true" />
                {PANA_IMAGES.slice(3, 5).map((img) => (
                  <div key={img.alt + img.src.src} className="overflow-hidden rounded-xl">
                    <Image
                      src={img.src}
                      alt={img.alt}
                      width={320}
                      height={420}
                      className="h-auto w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

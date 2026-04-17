"use client";

import Image from "next/image";
import { ArrowDownLeft, ArrowLeft, ArrowRight } from "lucide-react";
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
import styles from "./WhatIsNtsSection.module.css";

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
    title: "採択・1年間伴走",
    body: "採択後の効果検証・実績報告まで、1年間サポートを継続します。",
    image: isometric14,
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

          <div className="flex flex-col gap-10 lg:flex-row lg:items-stretch lg:gap-12">
            {/* 左カラム: 2×2 フロー（各セル＝画像＋テキスト一体カード） */}
            <div className="lg:flex lg:h-full lg:min-h-0 lg:w-[58%] lg:flex-col">
              <div className="grid flex-1 grid-cols-2 gap-4 md:gap-6 lg:min-h-0 lg:grid-rows-2">
                {FLOW_STEPS.map((step, i) => {
                  const stepNo = String(i + 1).padStart(2, "0");
                  const showRowArrow = i === 0 || i === 2;
                  const isLeftArrow = i === 2;
                  const showDownDiagArrow = i === 1;
                  return (
                    <div
                      key={step.title}
                      className="relative flex min-h-0 flex-col items-stretch"
                    >
                      <div
                        className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border shadow-[0_2px_12px_rgba(26,76,142,0.06)]"
                        style={{ background: step.bg, borderColor: step.border }}
                      >
                        {/* イラスト */}
                        <div className="relative h-28 w-full shrink-0 overflow-hidden md:h-32">
                          <Image
                            src={step.image}
                            alt={step.title}
                            width={640}
                            height={640}
                            className="absolute bottom-0 left-1/2 h-[92%] w-auto max-w-[95%] -translate-x-1/2 object-contain object-bottom"
                          />
                        </div>
                        {/* 番号・タイトル・本文 */}
                        <div className="flex flex-1 flex-col items-center px-3 pb-3 pt-1 text-center">
                          <div className="mb-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1A7B6F] text-xs font-semibold text-white">
                            {stepNo}
                          </div>
                          <p className="mb-1 text-sm font-semibold leading-snug text-[var(--text-primary)]">
                            {step.title}
                          </p>
                          <p className="text-[12px] leading-[1.65] text-[var(--text-secondary)]">
                            {step.body}
                          </p>
                        </div>
                      </div>

                      {showRowArrow && (
                        <span
                          className={`absolute right-[-14px] top-1/2 z-10 hidden -translate-y-1/2 md:right-[-16px] lg:flex ${styles.flowArrow}`}
                          aria-hidden
                        >
                          {isLeftArrow ? (
                            <ArrowLeft className="h-5 w-5" />
                          ) : (
                            <ArrowRight className="h-5 w-5" />
                          )}
                        </span>
                      )}

                      {showDownDiagArrow && (
                        <span
                          className={`absolute -bottom-5 left-[24%] z-10 hidden lg:flex ${styles.flowArrow}`}
                          aria-hidden
                        >
                          <ArrowDownLeft className="h-5 w-5" />
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 右カラム: PANA 5枚「2・1・2」— 顔を見せつつ高さを左とバランス */}
            <div className="hidden lg:flex lg:h-full lg:min-h-0 lg:w-[42%] lg:flex-col lg:justify-start lg:gap-3">
              <div className="grid min-h-0 grid-cols-2 gap-3">
                {PANA_IMAGES.slice(0, 2).map((img) => (
                  <div
                    key={img.src.src}
                    className="h-[170px] min-h-0 overflow-hidden rounded-xl xl:h-[182px]"
                  >
                    <Image
                      src={img.src}
                      alt={img.alt}
                      width={400}
                      height={520}
                      className="h-full w-full object-cover object-[50%_22%]"
                    />
                  </div>
                ))}
              </div>

              <div className="flex min-h-0 shrink-0 justify-center">
                <div className="h-[170px] w-[52%] max-w-[220px] overflow-hidden rounded-xl xl:h-[182px]">
                  <Image
                    src={PANA_IMAGES[2].src}
                    alt={PANA_IMAGES[2].alt}
                    width={400}
                    height={520}
                    className="h-full w-full object-cover object-[50%_22%]"
                  />
                </div>
              </div>

              <div className="grid min-h-0 grid-cols-2 gap-3">
                {PANA_IMAGES.slice(3, 5).map((img) => (
                  <div
                    key={img.src.src}
                    className="h-[170px] min-h-0 overflow-hidden rounded-xl xl:h-[182px]"
                  >
                    <Image
                      src={img.src}
                      alt={img.alt}
                      width={400}
                      height={520}
                      className="h-full w-full object-cover object-[50%_22%]"
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

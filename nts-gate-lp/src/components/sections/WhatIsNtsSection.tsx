"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import isometric11 from "../../../icon-assets/isometric_11.webp";
import isometric13 from "../../../icon-assets/isometric_13.webp";
import isometric15 from "../../../icon-assets/isometric_15.webp";
import isometric14 from "../../../icon-assets/isometric_14.webp";
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

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              {FLOW_STEPS.map((step, i) => {
                const stepNo = String(i + 1).padStart(2, "0");
                const showArrow = i < FLOW_STEPS.length - 1;
              return (
                <div key={step.title} className="relative flex flex-col items-center">
                  <div
                    className="relative h-40 w-full overflow-hidden rounded-2xl border md:h-44 lg:h-40"
                    style={{ background: step.bg, borderColor: step.border }}
                  >
                    <Image
                      src={step.image}
                      alt={step.title}
                      className="absolute bottom-0 left-1/2 h-[88%] w-auto -translate-x-1/2 object-contain"
                    />
                  </div>

                  {showArrow ? (
                    <span className="absolute right-[-12px] top-[80px] z-10 hidden text-[#1A7B6F] lg:block" aria-hidden>
                      <ArrowRight className="h-5 w-5" />
                    </span>
                  ) : null}

                  <div className="mx-auto mb-2 mt-4 flex h-7 w-7 items-center justify-center rounded-full bg-[#1A7B6F] text-xs font-semibold text-white">
                    {stepNo}
                  </div>
                  <p className="mb-1.5 text-center text-sm font-semibold text-[var(--text-primary)]">
                    {step.title}
                  </p>
                  <p className="text-center text-[13px] leading-[1.7] text-[var(--text-secondary)]">
                    {step.body}
                  </p>
                </div>
              );
            })}
            </div>
        </motion.div>
      </div>
    </section>
  );
}

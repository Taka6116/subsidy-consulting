"use client";

import Image from "next/image";
import { ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";
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
    title: "無料ヒアリング",
    body: "経営課題と現状をお聞きします。補助金の話より先に、あなたの会社のことを理解するところから始めます。",
    image: isometric11,
    bg: "#EEF6FF",
    border: "#B5D4F4",
  },
  {
    title: "補助金活用戦略の設計",
    body: "課題に合った補助金を選定し、活用戦略を設計します。着手金15万円をいただいた後、具体的なプランをご提示します。",
    image: isometric13,
    bg: "#E8F9F4",
    border: "#9FE1CB",
  },
  {
    title: "採択に向けた準備・申請",
    body: "提携行政書士法人等と連携しながら申請準備を進めます。採択が決まった時点で、補助額の5%をコンサルティングフィーとしていただきます。",
    image: isometric15,
    bg: "#EEF6FF",
    border: "#B5D4F4",
  },
  {
    title: "採択後1年間の伴走",
    body: "採択がゴールではありません。実績報告・精算完了時に5%、1年後の効果検証時に5%。最後まで責任を持って、一緒に動き続けます。",
    image: isometric14,
    bg: "#E8F9F4",
    border: "#9FE1CB",
  },
] as const;

// 写真ローテーション用プール（5枚）
const PANA_ALL = [PANA3025, PANA2727, PANA2741, PANA2962, PANA2975];

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
            <h2
              id="home-what-is-nts-heading"
              className="font-heading text-[1.75rem] font-bold leading-snug text-[var(--text-primary)] md:text-[2.25rem]"
            >
              申請が、ゴールではありません。
            </h2>
            <p className="mt-4 font-heading text-[1.05rem] font-bold leading-snug text-[var(--text-secondary)] md:text-[1.25rem]">
              相談から採択、そして1年後まで。私たちが一緒に動きます。
            </p>
            <p className="mx-auto mt-5 max-w-2xl text-[0.95rem] leading-relaxed text-[var(--text-secondary)] md:text-base">
              従来の補助金コンサルとの違い——私たちが提供するのは、書類ではなく「伴走」です。下のフローで、相談から効果検証までの流れをご確認いただけます。
            </p>
          </div>

          <div className="flex flex-col gap-10">
            {/* 上段: 2×2 フロー（各セル＝画像＋テキスト一体カード） */}
            <div>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
                {FLOW_STEPS.map((step, i) => {
                  // PC横並び4列では右矢印のみ（最後以外）
                  const showRightArrow = i < 3;
                  const showLeftArrow = false;
                  const showDownArrow = false;
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
                        {/* タイトル・本文 */}
                        <div className="flex flex-1 flex-col items-center px-3 pb-3 pt-2 text-center">
                          <p className="mb-1 text-sm font-semibold leading-snug text-[var(--text-primary)]">
                            {step.title}
                          </p>
                          <p className="text-[12px] leading-[1.65] text-[var(--text-secondary)]">
                            {step.body}
                          </p>
                        </div>
                      </div>

                      {/* → 横矢印（01→02） */}
                      {showRightArrow && (
                        <span
                          className={`absolute right-[-14px] top-1/2 z-10 hidden -translate-y-1/2 md:right-[-16px] lg:flex ${styles.flowArrow}`}
                          aria-hidden
                        >
                          <ArrowRight className="h-5 w-5" />
                        </span>
                      )}

                      {/* ← 横矢印（03→04：右下から左下へ逆向き） */}
                      {showLeftArrow && (
                        <span
                          className={`absolute left-[-14px] top-1/2 z-10 hidden -translate-y-1/2 md:left-[-16px] lg:flex ${styles.flowArrow}`}
                          aria-hidden
                        >
                          <ArrowLeft className="h-5 w-5" />
                        </span>
                      )}

                      {/* ↓ 縦矢印（02の下端中央 → 03へ） */}
                      {showDownArrow && (
                        <span
                          className={`absolute -bottom-[22px] left-1/2 z-10 hidden -translate-x-1/2 lg:flex ${styles.flowArrow}`}
                          aria-hidden
                        >
                          <ArrowDown className="h-5 w-5" />
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 下段: 担当者写真 — 5枚横並び */}
            <div className="grid h-[260px] grid-cols-5 gap-3 md:h-[320px]">
              {PANA_ALL.map((photo) => (
                <div
                  key={photo.src}
                  className="relative overflow-hidden rounded-2xl"
                >
                  <Image
                    src={photo}
                    alt="NTSコンサルタント"
                    fill
                    sizes="(max-width: 768px) 18vw, (max-width: 1280px) 15vw, 200px"
                    quality={90}
                    className="object-cover object-[50%_15%]"
                  />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}


"use client";

import Image from "next/image";
import { ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import isometric13 from "../../../../icon-assets/isometric_13.webp";
import isometric16 from "../../../../icon-assets/isometric_16.webp";
import isometric21 from "../../../../icon-assets/isometric_21.png";
import isometric14 from "../../../../icon-assets/isometric_14.webp";
import PANA3025 from "../../../../icon-assets/PANA3025.webp";
import PANA2727 from "../../../../icon-assets/PANA2727.webp";
import PANA2741 from "../../../../icon-assets/PANA2741.webp";
import PANA2962 from "../../../../icon-assets/PANA2962.webp";

const steps = [
  {
    number: "01",
    title: "顧客をご紹介",
    body: "「補助金が使えるか相談してみては」と一言お伝えください。それだけで構いません。",
    image: isometric16,
    bg: "#EEF6FF",
  },
  {
    number: "02",
    title: "補助金活用戦略の設計",
    body: "NTSが顧客にヒアリングを行い、課題に合った補助金と活用戦略をご提案します。",
    image: isometric13,
    bg: "#E8F9F4",
  },
  {
    number: "03",
    title: "申請・採択のサポート",
    body: "提携行政書士と連携しながら申請プロセスをサポート。採択まで責任を持って動きます。",
    image: isometric21,
    bg: "#EEF6FF",
  },
  {
    number: "04",
    title: "採択後の伴走＋紹介フィーのお支払い",
    body: "採択後も1年間、顧客の経営に伴走し続けます。紹介フィーは採択確定後にお支払いします。",
    image: isometric14,
    bg: "#E8F9F4",
  },
];

const flowGridSteps = [steps[0], steps[1], steps[3], steps[2]];
const consultantPhotos = [PANA3025, PANA2727, PANA2741, PANA2962];

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
      <div className="mx-auto max-w-5xl px-6 md:px-8">
        <motion.div className="mb-16 text-center" {...fadeUp(0)}>
          <h2 className="font-heading text-3xl font-bold text-[var(--text-primary)] md:text-4xl">
            お客様をご紹介いただいたら、
            <br />
            あとは我々が伴走します。
          </h2>
          <p className="mt-6 text-base leading-relaxed text-[var(--text-secondary)] md:text-lg">
            ヒアリングから補助金の活用戦略の設計、提携行政書士との連携を通じた申請のサポート、採択後の伴走まで、NTSが段階を追って進めます。
            <br className="hidden md:inline" />
            制度の細部まで御社で説明いただく必要はありません。まずはお声がけをお願いします。
          </p>
        </motion.div>

        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch lg:gap-12">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
            {flowGridSteps.map((step, i) => {
              const showRightArrow = i === 0;
              const showDownArrow = i === 1;
              const showLeftArrow = i === 3;

              return (
                <motion.div
                  key={step.number}
                  {...fadeUp(i * 0.08)}
                  className="relative flex min-h-0 flex-col"
                >
                  <div
                    className="flex h-full min-h-[300px] flex-col overflow-hidden rounded-2xl border bg-white shadow-[0_2px_14px_rgba(26,76,142,0.08)]"
                    style={{ borderColor: "rgba(26, 76, 142, 0.08)" }}
                  >
                    <div
                      className="relative h-[118px] w-full shrink-0 overflow-hidden"
                      style={{ background: step.bg }}
                      data-placeholder={`flow-step-${step.number}`}
                    >
                      <Image
                        src={step.image}
                        alt={`${step.title}のイラスト`}
                        width={640}
                        height={640}
                        className="absolute bottom-0 left-1/2 h-[86%] w-auto -translate-x-1/2 object-contain"
                      />
                    </div>
                    <div className="flex flex-1 flex-col px-6 py-5">
                      <div
                        className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border font-heading text-base font-bold text-[var(--accent-navy)]"
                        style={{
                          borderColor: "rgba(245, 166, 35, 0.4)",
                          background: "rgba(245, 166, 35, 0.12)",
                        }}
                      >
                        {step.number}
                      </div>
                      <h3 className="mb-2 text-base font-bold text-[var(--text-primary)]">
                        {step.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                        {step.body}
                      </p>
                    </div>
                  </div>

                  {showRightArrow && (
                    <span
                      className="absolute right-[-18px] top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[var(--accent-teal)] shadow-[0_4px_14px_rgba(26,76,142,0.12)] sm:flex"
                      aria-hidden
                    >
                      <ArrowRight className="h-5 w-5" />
                    </span>
                  )}
                  {showDownArrow && (
                    <span
                      className="absolute -bottom-[20px] left-1/2 z-10 hidden h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full bg-white text-[var(--accent-teal)] shadow-[0_4px_14px_rgba(26,76,142,0.12)] sm:flex"
                      aria-hidden
                    >
                      <ArrowDown className="h-5 w-5" />
                    </span>
                  )}
                  {showLeftArrow && (
                    <span
                      className="absolute left-[-18px] top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[var(--accent-teal)] shadow-[0_4px_14px_rgba(26,76,142,0.12)] sm:flex"
                      aria-hidden
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>

          <motion.div
            {...fadeUp(0.18)}
            className="grid min-h-[420px] grid-cols-2 gap-3 sm:grid-cols-4 lg:h-full lg:min-h-[560px]"
            aria-label="日本提携支援の担当者"
          >
            {consultantPhotos.map((photo, i) => (
              <div
                key={photo.src}
                className={`relative overflow-hidden rounded-[20px] bg-white shadow-[0_16px_44px_-28px_rgba(26,76,142,0.45)] ${
                  i % 2 === 0 ? "sm:mt-0" : "sm:mt-8"
                }`}
              >
                <Image
                  src={photo}
                  alt="日本提携支援の担当者"
                  fill
                  sizes="(max-width: 768px) 45vw, (max-width: 1280px) 12vw, 160px"
                  className="object-cover object-[50%_18%]"
                />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

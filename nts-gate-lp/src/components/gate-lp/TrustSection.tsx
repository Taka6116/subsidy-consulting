"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Compass, FileCheck, Handshake } from "lucide-react";
import SectionWrapper from "@/components/shared/SectionWrapper";
import type { LucideIcon } from "lucide-react";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    icon: Compass,
    title: "経営課題から考える",
    description:
      "補助金ありきではなく、あなたの課題に合った制度を選びます。",
  },
  {
    icon: FileCheck,
    title: "申請から採択まで伴走",
    description:
      "事業計画の作成支援から書類提出まで、すべてサポートします。",
  },
  {
    icon: Handshake,
    title: "採択後も続く関係",
    description:
      "定期報告の支援を通じて、長期的にお付き合いします。",
  },
];

const ease = [0.16, 1, 0.3, 1] as const;

function FeatureCards() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.15 });
  const shouldReduceMotion = useReducedMotion();
  const skip = !!shouldReduceMotion;

  return (
    <div ref={ref} className="flex flex-col gap-5">
      {FEATURES.map((feature, i) => {
        const Icon = feature.icon;
        return (
          <motion.div
            key={feature.title}
            initial={skip ? false : { opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 + i * 0.15, ease }}
            className="rounded-card border border-neutral-200 bg-white p-5"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50">
                <Icon
                  className="text-primary-500"
                  size={20}
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
              </div>
              <div>
                <h3 className="font-heading text-body font-bold text-primary-900">
                  {feature.title}
                </h3>
                <p className="mt-1 text-small leading-normal text-neutral-700">
                  {feature.description}
                </p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export default function TrustSection() {
  return (
    <SectionWrapper className="bg-neutral-50 py-section-gap">
      <div className="mx-auto max-w-container px-6">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:gap-16">
          {/* Left: text block */}
          <div className="lg:w-1/2">
            <h2 className="font-heading text-h1 font-bold leading-tight text-primary-900">
              日本提携支援について
            </h2>
            <p className="mt-6 text-body leading-loose text-neutral-700">
              M&A仲介で培った経営支援の知見を活かし、補助金の選定から申請、採択後の実行支援までを一貫してサポートします。
            </p>
            <p className="mt-4 text-body leading-loose text-neutral-700">
              単なる申請代行ではなく、経営課題を理解した上で最適な制度をご提案します。
            </p>
          </div>

          {/* Right: feature cards */}
          <div className="lg:w-1/2">
            <FeatureCards />
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}

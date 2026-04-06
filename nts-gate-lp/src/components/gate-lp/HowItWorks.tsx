"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import SectionWrapper from "@/components/shared/SectionWrapper";
import CTAButton from "@/components/shared/CTAButton";
import { trackCTAClick } from "@/lib/analytics";

interface Step {
  number: number;
  title: string;
  description: string;
  time: string;
}

const STEPS: Step[] = [
  {
    number: 1,
    title: "業種と規模を選ぶ",
    description: "あなたの会社の業種と従業員数を選ぶだけ。",
    time: "30秒",
  },
  {
    number: 2,
    title: "経営課題を選ぶ",
    description: "今悩んでいることを選択するだけ。難しい知識は不要です。",
    time: "30秒",
  },
  {
    number: 3,
    title: "結果を受け取る",
    description: "活用できる可能性のある制度を、その場でご案内します。",
    time: "即時",
  },
];

const ease = [0.16, 1, 0.3, 1] as const;

function StepConnector({ className }: { className?: string }) {
  return (
    <>
      {/* Desktop/Tablet: horizontal dashed arrow */}
      <div
        className={`hidden items-center lg:flex ${className ?? ""}`}
        aria-hidden="true"
      >
        <div className="h-0 flex-1 border-t-2 border-dashed border-primary-300" />
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          className="-ml-1 text-primary-300"
        >
          <path d="M2 1 L10 6 L2 11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      {/* Mobile: vertical dashed arrow */}
      <div
        className="flex flex-col items-center py-2 lg:hidden"
        aria-hidden="true"
      >
        <div className="h-8 w-0 border-l-2 border-dashed border-primary-300" />
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          className="-mt-1 text-primary-300"
        >
          <path d="M1 2 L6 10 L11 2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </>
  );
}

function StepCards() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.15 });
  const shouldReduceMotion = useReducedMotion();
  const skip = !!shouldReduceMotion;

  return (
    <div
      ref={ref}
      className="mt-14 flex flex-col items-center lg:flex-row lg:items-start lg:justify-center"
    >
      {STEPS.map((step, i) => (
        <div key={step.number} className="contents">
          <motion.div
            initial={skip ? false : { opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: i * 0.2, ease }}
            className="flex w-full max-w-[280px] flex-col items-center text-center"
          >
            {/* Number circle */}
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-500 text-lg font-bold text-white font-display">
              {step.number}
            </div>

            {/* Time badge */}
            <span className="mt-4 inline-block rounded-full bg-primary-100 px-3 py-1 text-caption font-medium text-primary-700">
              {step.time}
            </span>

            {/* Title */}
            <h3 className="mt-3 font-heading text-h3 font-bold text-primary-900">
              {step.title}
            </h3>

            {/* Description */}
            <p className="mt-2 text-small leading-normal text-neutral-700">
              {step.description}
            </p>
          </motion.div>

          {/* Connector between steps */}
          {i < STEPS.length - 1 && (
            <motion.div
              initial={skip ? false : { opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.4, delay: i * 0.2 + 0.3, ease }}
              className="flex shrink-0 items-center px-3"
            >
              <StepConnector />
            </motion.div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function HowItWorks() {
  return (
    <SectionWrapper className="bg-neutral-100 py-section-gap">
      <div className="mx-auto max-w-container px-6 text-center">
        <h2 className="font-heading text-h1 font-bold leading-tight text-primary-900">
          診断は、たった3ステップ。
        </h2>

        <StepCards />

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, delay: 0.6, ease }}
          className="mt-14 flex flex-col items-center"
        >
          <CTAButton
            text="診断をはじめる"
            href="/diagnosis"
            variant="primary"
            size="large"
            onClick={() => trackCTAClick("steps")}
          />
          <p className="mt-3 text-small text-neutral-600">
            個人情報の入力は不要です。
          </p>
        </motion.div>
      </div>
    </SectionWrapper>
  );
}

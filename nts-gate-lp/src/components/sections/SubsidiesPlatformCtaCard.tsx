"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import {
  fadeInUpInitial,
  fadeInUpInView,
  fadeInUpReduced,
  fadeInUpTransition,
  fadeInUpViewport,
} from "@/components/sections/sectionStyles";

const PUBLISHED_COUNT = 373;
const CLOSING_SOON_COUNT = 90;

function useCountUp(target: number, enabled: boolean, durationMs = 700) {
  const [value, setValue] = useState(enabled ? 0 : target);

  useEffect(() => {
    if (!enabled) {
      setValue(target);
      return;
    }

    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1);
      const eased = 1 - (1 - progress) ** 3;
      setValue(Math.round(target * eased));
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [enabled, target, durationMs]);

  return value;
}

function StatChip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex max-w-full items-center rounded-full border border-[#d4e8f6] bg-[#f4f9fe] px-2.5 py-1 text-[11px] font-semibold leading-snug text-[#3a5a78] sm:text-xs">
      {children}
    </span>
  );
}

export default function SubsidiesPlatformCtaCard() {
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { once: true, amount: 0.25 });
  const animateCount = inView && !reduce;

  const published = useCountUp(PUBLISHED_COUNT, animateCount);
  const closingSoon = useCountUp(CLOSING_SOON_COUNT, animateCount);

  return (
    <motion.div
      ref={rootRef}
      initial={reduce ? fadeInUpReduced : fadeInUpInitial}
      whileInView={reduce ? fadeInUpReduced : fadeInUpInView}
      viewport={fadeInUpViewport}
      transition={fadeInUpTransition}
      className="mt-6 md:mt-8"
    >
      <div className="overflow-hidden rounded-2xl border border-[#cce0f0] bg-white px-5 py-5 shadow-[0_4px_24px_rgba(18,56,110,0.08)] sm:px-6 sm:py-6 md:px-8">
        <div className="flex min-w-0 flex-col gap-5 lg:flex-row lg:items-center lg:gap-8">
          <div className="flex shrink-0 items-center gap-2.5 lg:w-[168px] lg:flex-col lg:items-start lg:gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#c8e6d4] bg-[#edf9f1] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-[#1a7a45]">
              <span
                className="live-dot-pulse inline-block h-2 w-2 rounded-full bg-[#22c55e]"
                aria-hidden
              />
              LIVE
            </span>
            <p className="text-[11px] leading-snug text-[#5a7088] sm:text-xs">最新情報を自動更新中</p>
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="font-heading text-[1.05rem] font-bold leading-snug text-[#0c2a48] sm:text-lg md:text-xl">
              最速で補助金情報を把握できるプラットフォームはこちら
            </h3>
            <p className="mt-2 text-[13px] leading-relaxed text-[#4a6a82] sm:text-sm">
              全国の補助金情報を、受付状況・締切・目的別にまとめて確認できます。
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <StatChip>
                公開中 <span className="tabular-nums">{published}</span>件
              </StatChip>
              <StatChip>
                締切間近 <span className="tabular-nums">{closingSoon}</span>件
              </StatChip>
              <StatChip>目的別に整理</StatChip>
            </div>
          </div>

          <div className="shrink-0 lg:w-auto">
            <Link
              href="/subsidies"
              className="nts-cta-primary nts-cta-primary--xl group/platform-cta min-h-[44px] w-full gap-2 px-5 py-3 text-[13px] sm:text-sm lg:w-auto lg:min-w-[240px]"
            >
              補助金情報プラットフォームを見る
              <span
                className="inline-block transition-transform duration-200 group-hover/platform-cta:translate-x-0.5 motion-reduce:transform-none"
                aria-hidden
              >
                →
              </span>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

"use client";

import { useReducedMotion } from "framer-motion";
import { SUBSIDY_PROGRAMS, PREFECTURES } from "@/data/heroStripData";

export type HeroPartnerStripVariant = "default" | "dark";

type HeroPartnerStripProps = {
  variant?: HeroPartnerStripVariant;
};

/** テキストバッジ（補助金制度名 / 都道府県名） */
const BADGE_CARD =
  "inline-flex h-9 w-auto flex-shrink-0 items-center gap-1.5 rounded-full border border-[var(--border-card)] bg-[var(--bg-white)] px-3.5 shadow-[var(--shadow-card)] sm:h-10 sm:px-4";

const BADGE_DOT =
  "inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent-teal)]";

const BADGE_TEXT =
  "whitespace-nowrap font-heading text-[0.78rem] font-bold tracking-[0.02em] text-[var(--text-primary)] sm:text-[0.82rem]";

/** 帯全体のシェル */
const STRIP_GLASS_SHELL =
  "section-tag-band relative z-[6] flex w-full flex-none flex-col border-t border-[var(--border-subtle)] py-2 sm:py-3";

function textCells(items: readonly string[], keySuffix: string) {
  return items.map((label, i) => (
    <div key={`${label}-${i}-${keySuffix}`} className={BADGE_CARD}>
      <span aria-hidden className={BADGE_DOT} />
      <span className={BADGE_TEXT}>{label}</span>
    </div>
  ));
}

export default function HeroPartnerStrip({
  variant = "default",
}: HeroPartnerStripProps) {
  const shouldReduceMotion = useReducedMotion();

  const scrollTrack = (
    className: string,
    items: readonly string[],
    copyA: string,
    copyB: string,
  ) => (
    <div className={className}>
      {textCells(items, copyA)}
      {textCells(items, copyB)}
    </div>
  );

  if (shouldReduceMotion) {
    return (
      <div
        className={STRIP_GLASS_SHELL}
        aria-label="対応可能な補助金制度と対応都道府県"
        data-hero-partner-strip-variant={variant}
      >
        <div className="flex flex-col gap-3 px-4 sm:gap-4">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:gap-x-5">
            {textCells(SUBSIDY_PROGRAMS, "static-top")}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:gap-x-5">
            {textCells(PREFECTURES, "static-bottom")}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={STRIP_GLASS_SHELL}
      aria-label="対応可能な補助金制度と対応都道府県"
      data-hero-partner-strip-variant={variant}
    >
      <div className="flex flex-col gap-2 sm:gap-3">
        {/* Top: 対応補助金制度 (RTL) */}
        <div className="hero-partner-logo-mask relative overflow-hidden">
          {scrollTrack(
            "hero-partner-logo-track flex items-center gap-6 sm:gap-8",
            SUBSIDY_PROGRAMS,
            "subsidy-a",
            "subsidy-b",
          )}
        </div>
        {/* Bottom: 対応都道府県 (LTR) */}
        <div className="hero-partner-logo-mask relative overflow-hidden">
          {scrollTrack(
            "hero-partner-logo-track-reverse flex items-center gap-6 sm:gap-8",
            PREFECTURES,
            "pref-a",
            "pref-b",
          )}
        </div>
      </div>
    </div>
  );
}

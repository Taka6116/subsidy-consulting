"use client";

import Image from "next/image";
import { useReducedMotion } from "framer-motion";
import { PARTNER_LOGOS, type PartnerLogo } from "@/data/partnerLogos";

export type HeroPartnerStripVariant = "default" | "dark";

type HeroPartnerStripProps = {
  variant?: HeroPartnerStripVariant;
};

/** ロゴカード（タグ帯上の白カード） */
const LOGO_GLASS_CARD =
  "flex h-10 w-auto flex-shrink-0 items-center justify-center rounded-xl border border-[var(--border-card)] bg-[var(--bg-white)] px-3 py-1.5 shadow-[var(--shadow-card)] sm:h-11 sm:px-3.5";

/** 提携ロゴ帯 */
const STRIP_GLASS_SHELL =
  "section-tag-band relative z-[6] flex w-full flex-none flex-col border-t border-[var(--border-subtle)] py-2 sm:py-3";

function logoCells(logos: PartnerLogo[], keySuffix: string) {
  return logos.map((logo, i) => (
    <div key={`${logo.alt}-${i}-${keySuffix}`} className={LOGO_GLASS_CARD}>
      <Image
        src={logo.src}
        alt={logo.alt}
        width={160}
        height={40}
        className="h-7 w-auto max-w-[120px] object-contain sm:h-8 sm:max-w-[144px]"
        priority={i < 5}
      />
    </div>
  ));
}

export default function HeroPartnerStrip({
  variant = "default",
}: HeroPartnerStripProps) {
  const shouldReduceMotion = useReducedMotion();

  const scrollTrack = (className: string, copyA: string, copyB: string) => (
    <div className={className}>
      {logoCells(PARTNER_LOGOS, copyA)}
      {logoCells(PARTNER_LOGOS, copyB)}
    </div>
  );

  const shellClass = STRIP_GLASS_SHELL;

  if (shouldReduceMotion) {
    const mid = Math.ceil(PARTNER_LOGOS.length / 2);
    const topLogos = PARTNER_LOGOS.slice(0, mid);
    const bottomLogos = PARTNER_LOGOS.slice(mid);

    return (
      <div
        className={shellClass}
        aria-hidden="true"
        data-hero-partner-strip-variant={variant}
      >
        <div className="flex flex-col gap-3 px-4 sm:gap-4">
          <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2.5 sm:gap-x-9">
            {logoCells(topLogos, "static-top")}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2.5 sm:gap-x-9">
            {logoCells(bottomLogos, "static-bottom")}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={shellClass}
      aria-hidden="true"
      data-hero-partner-strip-variant={variant}
    >
      <div className="flex flex-col gap-2 sm:gap-3">
        <div className="hero-partner-logo-mask relative overflow-hidden">
          {scrollTrack(
            "hero-partner-logo-track flex items-center gap-10 sm:gap-12",
            "rtl-a",
            "rtl-b",
          )}
        </div>
        <div className="hero-partner-logo-mask relative overflow-hidden">
          {scrollTrack(
            "hero-partner-logo-track-reverse flex items-center gap-10 sm:gap-12",
            "ltr-a",
            "ltr-b",
          )}
        </div>
      </div>
    </div>
  );
}

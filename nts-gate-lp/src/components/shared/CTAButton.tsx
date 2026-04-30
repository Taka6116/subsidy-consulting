"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";

type CTAButtonVariant = "primary" | "secondary";
type CTAButtonSize = "default" | "large";

interface CTAButtonProps {
  text: string;
  href: string;
  variant?: CTAButtonVariant;
  size?: CTAButtonSize;
  onClick?: () => void;
}

const variantStyles: Record<CTAButtonVariant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
};

const sizeStyles: Record<CTAButtonSize, string> = {
  default: "text-body",
  /**
   * `large` はPC向け設計 (`!px-16`)。375pxでは 128px の左右パディングが内包を
   * 食い潰すため、モバイルのみ `!px-6` に締めてラベルが親を食い破らないようにする。
   */
  large: "text-lg !px-6 sm:!px-16 !py-[1.125rem]",
};

export default function CTAButton({
  text,
  href,
  variant = "primary",
  size = "default",
  onClick,
}: CTAButtonProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      whileHover={shouldReduceMotion ? {} : { y: -2 }}
      whileTap={shouldReduceMotion ? {} : { y: 0 }}
      transition={{
        duration: 0.2,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <Link
        href={href}
        onClick={onClick}
        aria-label={text}
        className={`
          inline-block w-full text-center whitespace-nowrap min-h-[44px] min-w-[44px]
          font-medium transition-colors duration-200
          ease-[cubic-bezier(0.16,1,0.3,1)]
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-navy)]
          ${variantStyles[variant]}
          ${sizeStyles[size]}
        `}
      >
        {text}
      </Link>
    </motion.div>
  );
}

// ========== [LEGACY 2026-04-30] 旧 CTAButton - 既存実装は上の default export として維持 ==========

// ========== [NEW 2026-04-30] 温度別CTAバリアント ==========
export type CTATemperature = "cold" | "warm" | "hot" | "fire";

const temperatureStyles: Record<CTATemperature, string> = {
  cold: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
  warm: "bg-amber-500 text-white hover:bg-amber-600 shadow-lg shadow-amber-500/30",
  hot: "bg-slate-900 text-white hover:bg-slate-800",
  fire: "bg-red-600 text-white hover:bg-red-700",
};

const temperatureLabels: Record<CTATemperature, string> = {
  cold: "情報だけ持ち帰る",
  warm: "まず1分で診断する",
  hot: "無料相談を予約する",
  fire: "今すぐ電話で相談",
};

export function TemperatureCTA({
  temperature,
  href,
  label,
  size = "default",
  className,
}: {
  temperature: CTATemperature;
  href: string;
  label?: string;
  size?: "default" | "large";
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={[
        "inline-flex items-center justify-center rounded-full font-semibold transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400",
        size === "large" ? "px-8 py-4 text-base md:text-lg" : "px-6 py-3 text-sm md:text-base",
        temperatureStyles[temperature],
        className ?? "",
      ].join(" ")}
    >
      {label ?? temperatureLabels[temperature]}
    </Link>
  );
}

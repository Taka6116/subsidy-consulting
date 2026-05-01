"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";

type CTAButtonVariant = "primary" | "secondary";
type CTAButtonSize = "default" | "large";
type CTATemperature = "cold" | "warm" | "hot";

interface CTAButtonProps {
  text: string;
  href: string;
  variant?: CTAButtonVariant;
  size?: CTAButtonSize;
  onClick?: () => void;
}

interface TemperatureCTAProps {
  temperature: CTATemperature;
  href: string;
  label: string;
  size?: CTAButtonSize;
  className?: string;
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

const temperatureStyles: Record<CTATemperature, string> = {
  cold:
    "bg-white text-slate-800 ring-1 ring-slate-200 hover:bg-slate-50 hover:text-slate-950",
  warm:
    "bg-gradient-to-r from-amber-300 to-orange-400 text-[#172033] shadow-[0_20px_45px_rgba(251,191,36,0.28)] hover:from-amber-200 hover:to-orange-300",
  hot:
    "bg-gradient-to-r from-cyan-300 to-sky-400 text-[#082f49] shadow-[0_20px_45px_rgba(56,189,248,0.24)] hover:from-cyan-200 hover:to-sky-300",
};

export function TemperatureCTA({
  temperature,
  href,
  label,
  size = "default",
  className = "",
  onClick,
}: TemperatureCTAProps) {
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
        aria-label={label}
        className={`
          inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full
          px-5 py-3 text-center font-bold transition-colors duration-200
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-navy)]
          ${sizeStyles[size]}
          ${temperatureStyles[temperature]}
          ${className}
        `}
      >
        {label}
      </Link>
    </motion.div>
  );
}

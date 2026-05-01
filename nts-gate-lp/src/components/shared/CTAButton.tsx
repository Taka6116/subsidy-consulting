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

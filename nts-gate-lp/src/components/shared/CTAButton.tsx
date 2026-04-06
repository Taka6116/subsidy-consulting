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
  primary:
    "bg-accent-500 text-white shadow-[0_2px_8px_rgba(224,112,64,0.25)] hover:shadow-[0_4px_16px_rgba(224,112,64,0.35)]",
  secondary:
    "bg-white text-primary-700 border border-primary-300 hover:bg-primary-50",
};

const sizeStyles: Record<CTAButtonSize, string> = {
  default: "px-12 py-4 text-body",
  large: "px-16 py-5 text-lg",
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
          inline-block w-full text-center whitespace-nowrap min-h-[44px] min-w-[44px] rounded-card
          font-medium transition-colors duration-200
          ease-[cubic-bezier(0.16,1,0.3,1)]
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500
          ${variantStyles[variant]}
          ${sizeStyles[size]}
        `}
      >
        {text}
      </Link>
    </motion.div>
  );
}

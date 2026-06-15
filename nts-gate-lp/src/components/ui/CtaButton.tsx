import Link from "next/link";
import { ROUTES } from "@/lib/constants";

type CtaButtonProps = {
  /** "primary" | "secondary" | "ghost" */
  variant?: "primary" | "secondary" | "ghost";
  /** ボタン内テキスト */
  label: string;
  /** リンク先（デフォルト: /consult） */
  href?: string;
  /** 追加クラス */
  className?: string;
  /** フルwidth */
  fullWidth?: boolean;
};

const variantStyles: Record<NonNullable<CtaButtonProps["variant"]>, string> = {
  primary:
    "bg-[#0e357f] text-white hover:bg-[#1a4fa0] rounded-full",
  secondary:
    "border border-[#0e357f] text-[#0e357f] hover:bg-[#eff6ff] rounded-full",
  ghost:
    "text-[#0e357f] underline underline-offset-2 hover:text-[#1a4fa0]",
};

export default function CtaButton({
  variant = "primary",
  label,
  href = ROUTES.CONSULT,
  className = "",
  fullWidth = false,
}: CtaButtonProps) {
  return (
    <Link
      href={href}
      className={`
        inline-flex items-center justify-center
        px-6 py-3 font-bold text-sm transition
        ${variantStyles[variant]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `.replace(/\s+/g, " ").trim()}
    >
      {label}
    </Link>
  );
}

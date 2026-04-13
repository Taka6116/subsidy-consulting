import type { Transition } from "framer-motion";

/** セクション外枠（背景は透過、fixed 海の上に載せる） */
export const sectionStackClass = "relative z-10 py-24 md:py-32";

/** 標準コンテナ（左右に余白、海が見える） */
export const sectionContainerClass = "mx-auto max-w-5xl px-6 md:px-8";

/**
 * メインの glass パネル（1枚で包む用）
 * 文言どおり `text-white` を含む
 */
export const glassShellClass =
  "rounded-2xl border border-white/10 bg-white/[0.06] p-8 text-white shadow-none backdrop-blur-[12px] [-webkit-backdrop-filter:blur(12px)] md:p-12";

/** 旧来互換・個別カード用（FAQ カード・補助金カード等） */
export const glassCardClass =
  "rounded-2xl border border-white/10 bg-white/[0.06] p-6 shadow-none backdrop-blur-[12px] [-webkit-backdrop-filter:blur(12px)] sm:p-8";

/** Section B 内のネスト glass */
export const nestedGlassCardClass =
  "rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-none backdrop-blur-md [-webkit-backdrop-filter:blur(12px)] sm:p-8";

export const fadeInUpInitial = { opacity: 0, y: 30 };
export const fadeInUpInView = { opacity: 1, y: 0 };
export const fadeInUpReduced = { opacity: 1, y: 0 };

export const fadeInUpViewport = { once: true, amount: 0.22 as const };

export const fadeInUpTransition: Transition = {
  duration: 0.55,
  ease: [0.16, 1, 0.3, 1],
};

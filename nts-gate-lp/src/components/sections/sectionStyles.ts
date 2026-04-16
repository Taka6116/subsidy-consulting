import type { Transition } from "framer-motion";

/** セクション外枠（背景は section-white / section-alt で付与） */
export const sectionStackClass = "relative z-10 py-24 md:py-32";

/** 標準コンテナ */
export const sectionContainerClass = "mx-auto max-w-5xl px-6 md:px-8";

/** メインのカードパネル（1枚で包む用） */
export const glassShellClass =
  "card p-8 text-[var(--text-primary)] md:p-12";

/** トップLP：design-guide 準拠のサーフェス（glassShell / nested と併用） */
export const lpCardSurfaceClass = "lp-card-surface";

/** 個別カード（FAQ・補助金ニュース等） */
export const glassCardClass =
  "card p-6 sm:p-8 text-[var(--text-primary)]";

/** ネストカード */
export const nestedGlassCardClass =
  "card p-6 sm:p-8 text-[var(--text-primary)]";

export const fadeInUpInitial = { opacity: 0, y: 30 };
export const fadeInUpInView = { opacity: 1, y: 0 };
export const fadeInUpReduced = { opacity: 1, y: 0 };

export const fadeInUpViewport = { once: true, amount: 0.22 as const };

export const fadeInUpTransition: Transition = {
  duration: 0.55,
  ease: [0.16, 1, 0.3, 1],
};

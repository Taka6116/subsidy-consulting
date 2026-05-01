"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { trackCTAClick } from "@/lib/analytics";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.6, ease: EASE_OUT, delay },
});

export default function MidCtaSection() {
  return (
    <section
      className="relative overflow-hidden py-20 md:py-28"
      style={{
        background: "linear-gradient(135deg, #071525 0%, #0e2c47 55%, #133d59 100%)",
      }}
    >
      {/* 背景装飾 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 80% 20%, rgba(30,155,219,0.22), transparent 40%), radial-gradient(circle at 10% 80%, rgba(0,180,130,0.12), transparent 40%)",
        }}
      />

      <div className="relative mx-auto max-w-3xl px-6 text-center md:px-8">
        {/* 小見出し */}
        <motion.p
          {...fadeUp(0)}
          className="mb-4 text-sm font-semibold tracking-[0.18em] text-[var(--accent-teal)]"
        >
          無料・1分で完了
        </motion.p>

        {/* 見出し */}
        <motion.h2
          {...fadeUp(0.1)}
          className="font-heading text-[clamp(1.75rem,4vw,2.75rem)] font-bold leading-tight tracking-[-0.02em] text-white"
        >
          自社に使える補助金、
          <br className="hidden sm:inline" />
          まず確認してみませんか？
        </motion.h2>

        {/* サブコピー */}
        <motion.p
          {...fadeUp(0.2)}
          className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/75"
        >
          会社名またはURLを入力するだけで、活用できる可能性のある補助金をご案内します。
          <br className="hidden sm:inline" />
          相談は無料。押し売りは一切しません。
        </motion.p>

        {/* CTAボタン群 */}
        <motion.div
          {...fadeUp(0.3)}
          className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4"
        >
          <Link
            href="/check"
            onClick={() => trackCTAClick("mid_cta_check")}
            className="inline-flex items-center gap-2 rounded-full bg-[var(--accent-teal)] px-8 py-4 text-base font-bold text-white shadow-[0_4px_24px_rgba(0,180,130,0.35)] transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-teal)]"
          >
            補助金を無料で診断する
            <span aria-hidden="true">→</span>
          </Link>
          <Link
            href="/consult"
            onClick={() => trackCTAClick("mid_cta_consult")}
            className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50"
          >
            まず話だけ聞いてみる
          </Link>
        </motion.div>

        {/* 信頼バッジ */}
        <motion.p
          {...fadeUp(0.4)}
          className="mt-6 text-xs text-white/45"
        >
          ✓ 完全無料 &nbsp;｜&nbsp; ✓ 登録不要 &nbsp;｜&nbsp; ✓ 1分で完了
        </motion.p>
      </div>
    </section>
  );
}

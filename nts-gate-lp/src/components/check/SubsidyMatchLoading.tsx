"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

// ── キーメッセージ定義 ──────────────────────────────
const FRAMES = [
  {
    lines: [
      { text: '"まさかうちが対象だったとは。"', large: true },
      { text: "そう驚く経営者が、", large: false },
      { text: "毎月います。", large: false },
    ],
  },
  {
    lines: [
      { text: "補助金は、申請しなければ", large: true },
      { text: "ゼロです。", large: true },
      { text: "対象でも、動かなければ受け取れません。", large: false },
    ],
  },
  {
    lines: [
      { text: "書類の質も、採択率を分けます。", large: true },
    ],
  },
  {
    lines: [
      { text: "採択されたあとにも、", large: true },
      { text: "やることがあります。", large: true },
    ],
  },
  {
    lines: [
      {
        text: "日本提携支援は採択後も1年間お客様の経営に寄り添い続けます。",
        large: true,
      },
    ],
  },
  {
    lines: [
      { text: "照合が完了しました。", large: true },
      { text: "使える可能性のある制度が", large: false },
      { text: "見つかりました。", large: false },
    ],
  },
];

const FRAME_DURATION = 6500;
const TRANSITION_DURATION = 0.5;
/** API 完了後、最終フレームを見せてから結果へ遷移するまで（ms） */
const FINAL_HOLD_MS = 1600;

const TOTAL_ESTIMATE_MS = FRAME_DURATION * FRAMES.length;

type Props = {
  /** true になると最終フレームへ移し、その後 onReadyToTransition を呼ぶ */
  apiComplete?: boolean;
  onReadyToTransition?: () => void;
};

export default function SubsidyMatchLoading({
  apiComplete = false,
  onReadyToTransition,
}: Props) {
  const shouldReduceMotion = useReducedMotion();
  const [frameIndex, setFrameIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const startTimeRef = useRef(Date.now());
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const finaleHoldRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // プログレスバー
  useEffect(() => {
    if (apiComplete) {
      setProgress(100);
      return;
    }
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min((elapsed / TOTAL_ESTIMATE_MS) * 100, 99);
      setProgress(pct);
    }, 80);
    return () => clearInterval(timer);
  }, [apiComplete]);

  // フレーム自動送り（API 未完了時のみ）
  useEffect(() => {
    if (apiComplete) return;
    if (frameIndex >= FRAMES.length - 1) return;

    timerRef.current = setTimeout(() => {
      setFrameIndex((i) => i + 1);
    }, FRAME_DURATION);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [frameIndex, apiComplete]);

  // API 完了 → 最終フレーム → 親へ遷移依頼
  useEffect(() => {
    if (!apiComplete || !onReadyToTransition) return;
    let cancelled = false;
    if (timerRef.current) clearTimeout(timerRef.current);

    setFrameIndex(FRAMES.length - 1);
    setProgress(100);

    finaleHoldRef.current = setTimeout(() => {
      if (cancelled) return;
      onReadyToTransition();
    }, FINAL_HOLD_MS);

    return () => {
      cancelled = true;
      if (finaleHoldRef.current) clearTimeout(finaleHoldRef.current);
    };
  }, [apiComplete, onReadyToTransition]);

  const frame = FRAMES[frameIndex] ?? FRAMES[FRAMES.length - 1]!;

  return (
    <div
      className="fixed inset-0 z-[100] flex min-h-screen flex-col items-center justify-center overflow-hidden"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="補助金を照合しています"
      style={{ background: "var(--bg-base)" }}
    >
      <header
        className="fixed left-0 right-0 top-0 z-40 flex items-center justify-between border-b border-[var(--border-subtle)] px-6 py-5 sm:px-8"
        style={{ background: "var(--bg-base)" }}
      >
        <Link
          href="/"
          className="flex shrink-0 items-center rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-teal)]"
        >
          <img
            src="/nts-logo.svg"
            alt="日本提携支援"
            className="h-7 w-auto sm:h-8"
            width={200}
            height={29}
          />
        </Link>
        <Link
          href="/"
          className="text-sm text-[var(--text-muted)] transition hover:text-[var(--text-primary)]"
        >
          トップへ
        </Link>
      </header>

      <main className="relative z-10 flex w-full max-w-2xl flex-col items-center px-6 pb-16 pt-24 text-center sm:px-8">
        <div className="mb-16 flex min-h-[11rem] w-full flex-col items-center justify-center sm:mb-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={frameIndex}
              className="flex flex-col items-center gap-3"
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: shouldReduceMotion ? 0 : TRANSITION_DURATION, ease: "easeInOut" }}
            >
              {frame.lines.map((line, i) => (
                <motion.p
                  key={i}
                  className={
                    line.large
                      ? "font-heading text-3xl font-bold leading-tight text-[var(--text-primary)] md:text-4xl"
                      : "text-xl leading-relaxed text-[var(--text-secondary)] md:text-2xl"
                  }
                  initial={
                    shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }
                  }
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: shouldReduceMotion ? 0 : 0.55,
                    delay: shouldReduceMotion ? 0 : i * 0.35,
                    ease: [0.22, 1, 0.36, 1] as const,
                  }}
                >
                  {line.text}
                </motion.p>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-2">
          {FRAMES.map((_, i) => (
            <motion.div
              key={i}
              className="rounded-full bg-[var(--accent-navy)]"
              animate={{
                width: i === frameIndex ? 20 : 6,
                opacity: i === frameIndex ? 1 : 0.2,
              }}
              style={{ height: 6 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
            />
          ))}
        </div>

        <div
          className="mt-6 w-48 overflow-hidden rounded-full bg-[var(--border-subtle)] md:w-64"
          style={{ height: 3 }}
        >
          <motion.div
            className="h-full rounded-full bg-[var(--accent-teal)]"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: "linear" }}
          />
        </div>
      </main>
    </div>
  );
}

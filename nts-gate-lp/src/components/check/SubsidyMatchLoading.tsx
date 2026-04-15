"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import HeroThreeWebGLBackground from "@/components/gate-lp/hero-three/HeroThreeWebGLBackground";

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
      { text: "NTSは事業計画書の作成から", large: false },
      { text: "一緒に取り組みます。", large: false },
    ],
  },
  {
    lines: [
      { text: "採択されたあとにも、", large: true },
      { text: "やることがあります。", large: true },
      {
        text: "日本提携支援は採択後も1年間お客様の経営に寄り添い続けます。",
        large: false,
      },
      { text: "最後まで、NTSがそばにいます。", large: false },
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
const FADE_DURATION = 700;
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
  const [curtain, setCurtain] = useState(false);
  const startTimeRef = useRef(Date.now());
  const timersRef = useRef<{
    step1?: ReturnType<typeof setTimeout>;
    step2?: ReturnType<typeof setTimeout>;
  }>({});
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

    timersRef.current.step1 = setTimeout(() => {
      setCurtain(true);
      timersRef.current.step2 = setTimeout(() => {
        setFrameIndex((i) => i + 1);
        setCurtain(false);
      }, FADE_DURATION);
    }, FRAME_DURATION);

    return () => {
      const { step1, step2 } = timersRef.current;
      if (step1) clearTimeout(step1);
      if (step2) clearTimeout(step2);
    };
  }, [frameIndex, apiComplete]);

  // API 完了 → 最終フレーム → 親へ遷移依頼
  useEffect(() => {
    if (!apiComplete || !onReadyToTransition) return;
    let cancelled = false;
    if (timersRef.current.step1) clearTimeout(timersRef.current.step1);
    if (timersRef.current.step2) clearTimeout(timersRef.current.step2);

    setCurtain(true);
    const t1 = setTimeout(() => {
      if (cancelled) return;
      setFrameIndex(FRAMES.length - 1);
      setCurtain(false);
      setProgress(100);
      finaleHoldRef.current = setTimeout(() => {
        if (cancelled) return;
        onReadyToTransition();
      }, FINAL_HOLD_MS);
    }, FADE_DURATION);

    return () => {
      cancelled = true;
      clearTimeout(t1);
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
    >
      <HeroThreeWebGLBackground interactive={false} />

      <AnimatePresence>
        {curtain && (
          <motion.div
            key="curtain"
            className="pointer-events-none fixed inset-0 z-50 bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            transition={{ duration: FADE_DURATION / 1000 }}
          />
        )}
      </AnimatePresence>

      <header
        className="fixed left-0 right-0 top-0 z-40 flex items-center justify-between border-b border-white/10 px-6 py-5 sm:px-8"
        style={{
          background: "rgba(6,14,28,0.28)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        <Link
          href="/"
          className="flex shrink-0 items-center rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <img
            src="/nts-logo.svg"
            alt="日本提携支援"
            className="h-7 w-auto brightness-0 invert sm:h-8"
            width={200}
            height={29}
          />
        </Link>
        <Link
          href="/"
          className="text-sm text-white/60 transition hover:text-white"
        >
          トップへ
        </Link>
      </header>

      <main className="relative z-10 flex w-full max-w-2xl flex-col items-center px-6 pb-16 pt-24 text-center sm:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={frameIndex}
            className="mb-16 flex flex-col items-center gap-3 sm:mb-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.4 }}
          >
            {frame.lines.map((line, i) => (
              <motion.p
                key={`${frameIndex}-${i}-${line.text}`}
                className={
                  line.large
                    ? "font-heading text-3xl font-bold leading-tight text-white md:text-4xl"
                    : "text-lg leading-relaxed text-white/60"
                }
                initial={
                  shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }
                }
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: shouldReduceMotion ? 0 : 0.65,
                  delay: shouldReduceMotion ? 0 : i * 0.45,
                  ease: [0.22, 1, 0.36, 1] as const,
                }}
              >
                {line.text}
              </motion.p>
            ))}
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center gap-2">
          {FRAMES.map((_, i) => (
            <motion.div
              key={i}
              className="rounded-full bg-white"
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
          className="mt-6 w-48 overflow-hidden rounded-full bg-white/10 md:w-64"
          style={{ height: 3 }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{
              background:
                "linear-gradient(to right, rgba(232,136,10,0.7), rgba(232,136,10,1))",
            }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: "linear" }}
          />
        </div>
      </main>
    </div>
  );
}

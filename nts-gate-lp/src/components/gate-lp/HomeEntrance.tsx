"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { motion, useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { HomeIntroContext } from "@/contexts/HomeIntroContext";
import {
  trackIntroComplete,
  trackIntroSkip,
  trackIntroStart,
} from "@/lib/analytics";

const ease = [0.16, 1, 0.3, 1] as const;
const CONTENT_IN = 0.55;
const CONTENT_Y = 14;

const SPLASH_LINES = [
  "人手不足、設備の老朽化、事業承継——",
  "その経営課題、国の支援制度で",
  "動かせるかもしれません。",
] as const;

const SPLASH_SUBLINE = "1分の無料診断。個人情報の入力は不要です。";

const FULL_INTRO_ARIA = `${[...SPLASH_LINES, SPLASH_SUBLINE].join(" ")}`;

const LINE_FADE_IN_DURATION = 0.8;
const LINE_STAGGER_IN = 0.8;
const HOLD_AFTER_LINES = 1.0;
const LINE_FADE_OUT_DURATION = 0.8;
const LINE_STAGGER_OUT = 0.2;

function primeSplashHidden(
  overlay: HTMLElement,
  lines: HTMLParagraphElement[],
  sub: HTMLElement,
  skipBtn: HTMLElement | null,
) {
  gsap.set(overlay, { opacity: 1 });
  lines.forEach((el) => gsap.set(el, { opacity: 0, yPercent: 120 }));
  gsap.set(sub, { opacity: 0, yPercent: 80 });
  if (skipBtn) gsap.set(skipBtn, { opacity: 0 });
}

function collectLineRefs(
  refs: (HTMLParagraphElement | null)[],
): HTMLParagraphElement[] {
  return SPLASH_LINES.map((_, i) => refs[i]).filter(
    (el): el is HTMLParagraphElement => el != null,
  );
}

export default function HomeEntrance({ children }: { children: ReactNode }) {
  const systemReduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<"splash" | "done">("splash");
  const [suppressHeroMotion, setSuppressHeroMotion] = useState(false);
  const [contentTransitionSec, setContentTransitionSec] = useState(0);
  const introStartedAt = useRef<number | null>(null);
  const introFinishedRef = useRef(false);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const gsapCtxRef = useRef<gsap.Context | null>(null);

  const overlayRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const subRef = useRef<HTMLParagraphElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);

  const finishIntro = useCallback((fromSkip: boolean) => {
    if (introFinishedRef.current) return;
    introFinishedRef.current = true;
    timelineRef.current?.kill();
    timelineRef.current = null;
    gsapCtxRef.current?.revert();
    gsapCtxRef.current = null;

    if (fromSkip) {
      trackIntroSkip();
    } else if (introStartedAt.current != null) {
      trackIntroComplete(
        Math.round(performance.now() - introStartedAt.current),
      );
    }

    setSuppressHeroMotion(true);
    setContentTransitionSec(CONTENT_IN);
    setPhase("done");
  }, []);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;

    const reduced =
      systemReduceMotion ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      setContentTransitionSec(0);
      setPhase("done");
      return;
    }

    if (phase !== "splash") return;

    const overlay = overlayRef.current;
    const sub = subRef.current;
    const skipBtn = skipRef.current;
    const lines = collectLineRefs(lineRefs.current);
    if (!overlay || !sub || lines.length !== SPLASH_LINES.length) return;

    primeSplashHidden(overlay, lines, sub, skipBtn);
  }, [phase, systemReduceMotion]);

  useEffect(() => {
    if (phase !== "splash") return;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      finishIntro(false);
      return;
    }

    let cancelled = false;
    let raf = 0;

    const run = () => {
      if (cancelled) return;
      const overlay = overlayRef.current;
      const sub = subRef.current;
      const skipBtn = skipRef.current;
      const lines = collectLineRefs(lineRefs.current);

      if (!overlay || !sub || lines.length !== SPLASH_LINES.length) {
        raf = requestAnimationFrame(run);
        return;
      }

      introStartedAt.current = performance.now();
      trackIntroStart();

      gsapCtxRef.current?.revert();
      gsapCtxRef.current = gsap.context(() => {
        primeSplashHidden(overlay, lines, sub, skipBtn);

        const tl = gsap.timeline();
        timelineRef.current = tl;

        const exitTargets = [...lines, sub];

        tl.fromTo(
          lines,
          { opacity: 0, yPercent: 120 },
          {
            opacity: 1,
            yPercent: 0,
            duration: LINE_FADE_IN_DURATION,
            stagger: LINE_STAGGER_IN,
            ease: "power3.out",
          },
        )
          .fromTo(
            sub,
            { opacity: 0, yPercent: 80 },
            {
              opacity: 1,
              yPercent: 0,
              duration: 0.8,
              ease: "power3.out",
            },
            "+=0.2",
          )
          .to({}, { duration: HOLD_AFTER_LINES })
          .to(exitTargets, {
            opacity: 0,
            yPercent: -120,
            duration: LINE_FADE_OUT_DURATION,
            stagger: LINE_STAGGER_OUT,
            ease: "power3.in",
          })
          .to(overlay, {
            opacity: 0,
            duration: 0.5,
            ease: "power2.inOut",
            onComplete: () => {
              timelineRef.current = null;
              finishIntro(false);
            },
          });

        if (skipBtn) {
          tl.to(
            skipBtn,
            { opacity: 1, duration: 0.35, ease: "power2.out" },
            0.3,
          );
        }
      }, overlay);
    };

    raf = requestAnimationFrame(run);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      timelineRef.current?.kill();
      timelineRef.current = null;
      gsapCtxRef.current?.revert();
      gsapCtxRef.current = null;
    };
  }, [phase, finishIntro]);

  const skip = useCallback(() => {
    finishIntro(true);
  }, [finishIntro]);

  const showSplash = phase === "splash";

  return (
    <HomeIntroContext.Provider value={{ suppressHeroMotion }}>
      <div className="relative min-h-screen">
        <motion.div
          inert={showSplash}
          initial={false}
          animate={{
            opacity: showSplash ? 0 : 1,
            y: showSplash ? CONTENT_Y : 0,
          }}
          transition={{
            duration: contentTransitionSec,
            ease,
          }}
          className={showSplash ? "pointer-events-none select-none" : undefined}
        >
          {children}
        </motion.div>

        {showSplash && (
          <div
            ref={overlayRef}
            role="dialog"
            aria-modal="true"
            aria-label={FULL_INTRO_ARIA}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#F2F2F2] px-4"
          >
            <div className="w-full max-w-xl text-center font-heading will-change-transform">
              {SPLASH_LINES.map((line, i) => (
                <p
                  key={i}
                  ref={(el) => {
                    lineRefs.current[i] = el;
                  }}
                  aria-hidden="true"
                  className={`opacity-0 will-change-transform ${
                    i === 0
                      ? "text-[clamp(1.05rem,3.6vw,1.5rem)] font-bold leading-snug text-neutral-700"
                      : "mt-3 text-[clamp(1.2rem,4vw,1.85rem)] font-bold leading-snug text-primary-900"
                  }`}
                >
                  {line}
                </p>
              ))}
              <p
                ref={subRef}
                aria-hidden="true"
                className="intro-splash-sub mt-8 opacity-0 text-small font-medium text-neutral-600 sm:text-body will-change-transform"
              >
                {SPLASH_SUBLINE}
              </p>
            </div>

            <button
              ref={skipRef}
              type="button"
              onClick={skip}
              className="absolute bottom-10 left-1/2 opacity-0 -translate-x-1/2 rounded-sm text-caption text-neutral-500 underline underline-offset-4 transition-colors hover:text-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
            >
              スキップ
            </button>
          </div>
        )}
      </div>
    </HomeIntroContext.Provider>
  );
}

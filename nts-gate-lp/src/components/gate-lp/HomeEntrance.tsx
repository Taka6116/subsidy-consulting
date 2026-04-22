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
  "多くの経営者は知らない。",
  "自分の会社が、国の支援を受けられることを。",
] as const;

const FULL_INTRO_ARIA = SPLASH_LINES.join(" ");

/** スプラッシュ各行は opacity のみ（フェードイン／フェードアウト） */
const LINE_FADE_IN_DURATION = 1;
const LINE_STAGGER_IN = 0.8;
const HOLD_AFTER_LINES = 0.35;
const LINE_FADE_OUT_DURATION = 1;
const LINE_STAGGER_OUT = 0.2;

function primeSplashHidden(
  overlay: HTMLElement,
  lines: HTMLParagraphElement[],
  skipBtn: HTMLElement | null,
) {
  gsap.set(overlay, { opacity: 1 });
  lines.forEach((el) => gsap.set(el, { opacity: 0, yPercent: 0 }));
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
    const skipBtn = skipRef.current;
    const lines = collectLineRefs(lineRefs.current);
    if (!overlay || lines.length !== SPLASH_LINES.length) return;

    primeSplashHidden(overlay, lines, skipBtn);
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
      const skipBtn = skipRef.current;
      const lines = collectLineRefs(lineRefs.current);

      if (!overlay || lines.length !== SPLASH_LINES.length) {
        raf = requestAnimationFrame(run);
        return;
      }

      introStartedAt.current = performance.now();
      trackIntroStart();

      gsapCtxRef.current?.revert();
      gsapCtxRef.current = gsap.context(() => {
        primeSplashHidden(overlay, lines, skipBtn);

        const tl = gsap.timeline();
        timelineRef.current = tl;

        tl.fromTo(
          lines,
          { opacity: 0 },
          {
            opacity: 1,
            duration: LINE_FADE_IN_DURATION,
            stagger: LINE_STAGGER_IN,
            ease: "power2.out",
          },
        )
          .to({}, { duration: HOLD_AFTER_LINES })
          .to(lines, {
            opacity: 0,
            duration: LINE_FADE_OUT_DURATION,
            stagger: LINE_STAGGER_OUT,
            ease: "power2.in",
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

  // スプラッシュ表示中はスクロール抑止（useLayoutEffect で初回ペイント前に反映）
  useLayoutEffect(() => {
    if (phase !== "splash") return;
    if (typeof document === "undefined") return;

    const { body, documentElement: html } = document;
    const prev = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
      htmlHeight: html.style.height,
      bodyHeight: body.style.height,
      htmlOverscroll: html.style.overscrollBehavior,
      bodyOverscroll: body.style.overscrollBehavior,
      bodyTouch: body.style.touchAction,
    };

    html.style.overflow = "hidden";
    html.style.height = "100%";
    html.style.overscrollBehavior = "none";
    body.style.overflow = "hidden";
    body.style.height = "100%";
    body.style.overscrollBehavior = "none";
    body.style.touchAction = "none";

    return () => {
      html.style.overflow = prev.htmlOverflow;
      html.style.height = prev.htmlHeight;
      html.style.overscrollBehavior = prev.htmlOverscroll;
      body.style.overflow = prev.bodyOverflow;
      body.style.height = prev.bodyHeight;
      body.style.overscrollBehavior = prev.bodyOverscroll;
      body.style.touchAction = prev.bodyTouch;
    };
  }, [phase]);

  const showSplash = phase === "splash";

  return (
    <HomeIntroContext.Provider value={{ suppressHeroMotion }}>
      <div
        className={
          showSplash
            ? "relative h-[100dvh] max-h-[100dvh] overflow-hidden"
            : "relative min-h-screen"
        }
      >
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
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden bg-[var(--bg-base)] px-4 sm:px-6"
          >
            <div className="mx-auto w-full max-w-[min(100%,36rem)] shrink-0 text-center font-heading">
              <p
                ref={(el) => {
                  lineRefs.current[0] = el;
                }}
                aria-hidden="true"
                className="opacity-0 will-change-[opacity] text-[clamp(1.375rem,5.2vmin,2.5rem)] font-bold leading-snug text-[var(--text-secondary)]"
              >
                {SPLASH_LINES[0]}
              </p>
              <p
                ref={(el) => {
                  lineRefs.current[1] = el;
                }}
                aria-hidden="true"
                className="opacity-0 will-change-[opacity] mt-[clamp(0.75rem,2.8vmin,1.25rem)] text-[clamp(1.5rem,5.8vmin,2.75rem)] font-bold leading-snug text-[var(--text-primary)]"
              >
                {SPLASH_LINES[1]}
              </p>
            </div>

            <button
              ref={skipRef}
              type="button"
              onClick={skip}
              className="absolute bottom-10 left-1/2 opacity-0 -translate-x-1/2 rounded-sm text-caption text-[var(--text-muted)] underline underline-offset-4 transition-colors hover:text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-navy)]"
            >
              スキップ
            </button>
          </div>
        )}
      </div>
    </HomeIntroContext.Provider>
  );
}

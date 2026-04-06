"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useLayoutEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { useHomeIntro } from "@/contexts/HomeIntroContext";
import { trackCTAClick } from "@/lib/analytics";
import HeroPartnerStrip from "@/components/gate-lp/HeroPartnerStrip";

const GRADIENT_A =
  "linear-gradient(105deg, rgba(10,22,46,0.82) 0%, rgba(10,22,46,0.55) 42%, rgba(10,22,46,0.15) 65%, transparent 100%)";
const GRADIENT_B =
  "linear-gradient(to left, rgba(10,22,46,0.50) 0%, transparent 45%)";

const HERO_PICTURE_SRC = "/images/hero_picture.png";

/** イントロ完了後など: テキストのみ最終表示 */
function applyHeroTextVisibleState(root: HTMLElement) {
  gsap.set(root.querySelectorAll(".hero-text-item"), {
    opacity: 1,
    y: 0,
  });
  gsap.set(root.querySelectorAll(".hero-subtext"), {
    opacity: 1,
    y: 0,
  });
}

export default function Hero() {
  const shouldReduceMotion = useReducedMotion();
  const { suppressHeroMotion } = useHomeIntro();
  /** スプラッシュと二重にならないようテキスト GSAP のみ抑止 */
  const skipTextAnim = !!shouldReduceMotion || suppressHeroMotion;
  const rootRef = useRef<HTMLElement>(null);
  const ctxTextRef = useRef<gsap.Context | null>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    if (shouldReduceMotion) {
      applyHeroTextVisibleState(root);
    }
  }, [skipTextAnim, shouldReduceMotion]);

  useEffect(() => {
    if (skipTextAnim) return;
    const root = rootRef.current;
    if (!root) return;

    ctxTextRef.current?.revert();
    ctxTextRef.current = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.2 });

      tl.fromTo(
        ".hero-text-item:first-child",
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
        },
      )
        .fromTo(
          ".hero-text-item:not(:first-child)",
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.12,
            ease: "power2.out",
          },
          "-=0.2",
        )
        .fromTo(
          ".hero-subtext",
          { opacity: 0, y: 16 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
          },
          "+=0.5",
        );
    }, root);

    return () => {
      ctxTextRef.current?.revert();
      ctxTextRef.current = null;
    };
  }, [skipTextAnim]);

  /** revert より後にテキストを復帰（suppressHeroMotion 遷移時） */
  useEffect(() => {
    if (!skipTextAnim) return;
    const root = rootRef.current;
    if (!root) return;
    applyHeroTextVisibleState(root);
  }, [skipTextAnim]);

  return (
    <div className="flex h-[max(100dvh,520px)] w-full flex-col bg-[#0d1a2e]">
      <section
        ref={rootRef}
        className="relative min-h-0 flex-1 w-full overflow-hidden bg-[#0d1a2e]"
        aria-label="メインビジュアル"
      >
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          <Image
            src={HERO_PICTURE_SRC}
            alt=""
            fill
            className="object-cover hero-static-visual"
            sizes="100vw"
            priority
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: GRADIENT_A }}
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: GRADIENT_B }}
            aria-hidden="true"
          />
        </div>

        <div className="pointer-events-none absolute inset-0 z-[5] flex flex-col justify-center pl-6 sm:pl-10 md:w-[62%] md:pl-16">
          <div className="pointer-events-auto max-w-xl">
            <p className="hero-text-item mb-5 text-[13px] font-medium leading-snug tracking-normal text-white/75 opacity-0">
              その経営課題、補助金で動かせるかもしれません
            </p>
            <h1 className="hero-text-item mb-8 font-heading text-[clamp(24px,2.4vw,36px)] font-bold leading-[1.55] text-white opacity-0">
              人手不足、設備の老朽化、事業承継
              <br />
              それでも、前に進む方法がある。
            </h1>
            <div className="hero-text-item opacity-0">
              <Link
                href="/diagnosis"
                onClick={() => trackCTAClick("hero")}
                className="inline-flex items-center gap-2 rounded border-0 bg-[#d05a28] px-8 py-4 text-[15px] font-medium text-white transition-transform hover:-translate-y-px hover:bg-[#b84e22] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                1分で無料診断する
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <p className="hero-subtext mt-3 text-[12px] text-white/40 opacity-0">
              約1分・4つの質問に答えるだけ。個人情報の入力は不要です。
            </p>
          </div>
        </div>
      </section>
      <div className="relative z-[6] -mt-10 shrink-0 sm:-mt-14">
        <HeroPartnerStrip />
      </div>
    </div>
  );
}

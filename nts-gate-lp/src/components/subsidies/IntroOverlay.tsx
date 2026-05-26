"use client";

import { useEffect, useRef, useCallback } from "react";
import AuroraText from "@/components/shared/AuroraText";

/** OP見出しの濃い青グラデーション（淡い背景でも視認できる） */
const OP_HIGHLIGHT_COLORS = ["#1e40af", "#1d4ed8", "#2563eb", "#0b3a7a"];

interface IntroOverlayProps {
  onComplete: () => void;
}

export default function IntroOverlay({ onComplete }: IntroOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLParagraphElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tlRef = useRef<any>(null);

  const skip = useCallback(() => {
    if (tlRef.current) {
      tlRef.current.kill();
    }
    if (overlayRef.current) {
      overlayRef.current.style.display = "none";
    }
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let ctx: any;

    const run = async () => {
      const { gsap } = await import("gsap");

      ctx = gsap.context(() => {
        const tl = gsap.timeline({
          onComplete: () => {
            onComplete();
          },
        });
        tlRef.current = tl;

        gsap.set([headlineRef.current, subRef.current], {
          opacity: 0,
          y: 20,
        });

        tl
          .to(headlineRef.current, {
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: "power3.out",
          })
          .to(
            subRef.current,
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: "power2.out",
            },
            "-=0.5",
          )
          .to({}, { duration: 1.4 })
          .to(overlayRef.current, {
            opacity: 0,
            duration: 0.8,
            ease: "power2.inOut",
            onComplete: () => {
              if (overlayRef.current) {
                overlayRef.current.style.display = "none";
              }
            },
          });
      });
    };

    run();

    return () => {
      ctx?.revert();
    };
  }, [onComplete]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white px-4 sm:px-6"
      aria-hidden="true"
    >
      <div className="mx-auto w-fit max-w-full shrink-0 text-center font-heading">
        <p
          ref={headlineRef}
          className="whitespace-nowrap text-[clamp(1.05rem,4.8vw,2.6rem)] font-bold leading-snug text-[var(--text-primary)]"
        >
          補助金情報を
          <AuroraText animated={false} colors={OP_HIGHLIGHT_COLORS} className="font-bold">
            最速でお届け
          </AuroraText>
        </p>
        <p
          ref={subRef}
          className="mt-[clamp(0.75rem,2.8vmin,1.25rem)] font-body text-sm leading-relaxed text-[var(--text-secondary)] md:text-base"
        >
          公募開始から最速でお届け。
        </p>
      </div>

      <button
        type="button"
        onClick={skip}
        className="absolute bottom-10 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-[#d1d5db] bg-transparent px-5 py-2 font-body text-[13px] tracking-wide text-[#9ca3af] transition-colors hover:border-[#9ca3af] hover:text-[#374151]"
      >
        スキップ
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <polyline points="13 17 18 12 13 7" />
          <polyline points="6 17 11 12 6 7" />
        </svg>
      </button>
    </div>
  );
}

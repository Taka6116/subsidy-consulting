"use client";

import { useEffect, useRef } from "react";

interface IntroOverlayProps {
  onComplete: () => void;
}

export default function IntroOverlay({ onComplete }: IntroOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const line1Ref = useRef<HTMLParagraphElement>(null);
  const line2Ref = useRef<HTMLParagraphElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);

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

        gsap.set([line1Ref.current, line2Ref.current, subRef.current], {
          opacity: 0,
          y: 20,
        });

        tl
          .to(line1Ref.current, {
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: "power3.out",
          })
          .to(
            line2Ref.current,
            {
              opacity: 1,
              y: 0,
              duration: 1.2,
              ease: "power3.out",
            },
            "-=0.7"
          )
          .to(
            subRef.current,
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: "power2.out",
            },
            "-=0.4"
          )
          // ホールド 1.4秒
          .to({}, { duration: 1.4 })
          // オーバーレイ フェードアウト
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
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: "#f8f7f4",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "all",
      }}
      aria-hidden="true"
    >
      <div style={{ textAlign: "center", padding: "0 1.5rem" }}>
        <p
          ref={line1Ref}
          style={{
            fontFamily: "var(--font-heading, inherit)",
            fontSize: "clamp(36px, 5.5vw, 72px)",
            fontWeight: 400,
            lineHeight: 1.1,
            color: "#1a2544",
            margin: 0,
          }}
        >
          補助金を、
        </p>
        <p
          ref={line2Ref}
          style={{
            fontFamily: "var(--font-heading, inherit)",
            fontSize: "clamp(36px, 5.5vw, 72px)",
            fontWeight: 400,
            lineHeight: 1.1,
            color: "#1a2544",
            margin: "0 0 1.5rem",
          }}
        >
          最速で届ける。
        </p>
        <p
          ref={subRef}
          style={{
            fontSize: "clamp(13px, 1.4vw, 16px)",
            color: "#6b7280",
            letterSpacing: "0.03em",
            lineHeight: 1.7,
            margin: 0,
          }}
        >
          公募開始から最速でお届け。
        </p>
      </div>
    </div>
  );
}

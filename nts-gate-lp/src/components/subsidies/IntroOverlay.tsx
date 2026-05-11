"use client";

import { useEffect, useRef, useCallback } from "react";

interface IntroOverlayProps {
  onComplete: () => void;
}

export default function IntroOverlay({ onComplete }: IntroOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const line1Ref = useRef<HTMLParagraphElement>(null);
  const line2Ref = useRef<HTMLParagraphElement>(null);
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
            fontSize: "clamp(30px, 4.6vw, 64px)",
            fontWeight: 400,
            lineHeight: 1.1,
            color: "#1a2544",
            margin: "0 0 1.5rem",
            whiteSpace: "nowrap",
          }}
        >
          補助金情報を最速で届けます
        </p>
        <p
          ref={line2Ref}
          style={{
            fontFamily: "var(--font-heading, inherit)",
            fontSize: 0,
            fontWeight: 400,
            lineHeight: 0,
            color: "#1a2544",
            margin: 0,
          }}
        >
          {" "}
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

      {/* スキップボタン */}
      <button
        type="button"
        onClick={skip}
        style={{
          position: "absolute",
          bottom: "2.5rem",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
          gap: "0.375rem",
          padding: "0.5rem 1.25rem",
          border: "1px solid #d1d5db",
          borderRadius: "9999px",
          backgroundColor: "transparent",
          color: "#9ca3af",
          fontSize: "13px",
          letterSpacing: "0.04em",
          cursor: "pointer",
          transition: "color 0.15s, border-color 0.15s",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color = "#374151";
          (e.currentTarget as HTMLButtonElement).style.borderColor = "#9ca3af";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color = "#9ca3af";
          (e.currentTarget as HTMLButtonElement).style.borderColor = "#d1d5db";
        }}
      >
        スキップ
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="13 17 18 12 13 7" /><polyline points="6 17 11 12 6 7" />
        </svg>
      </button>
    </div>
  );
}

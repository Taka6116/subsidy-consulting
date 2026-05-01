"use client";

import { useEffect, useRef, useState } from "react";
import type { SubsidyLpData } from "@/lib/subsidy-lp/buildSubsidyLpData";

type Props = { data: SubsidyLpData };

const CASE_IMAGES = [
  "/icon-assets/isometric_10.webp",
  "/icon-assets/isometric_20.webp",
  "/icon-assets/isometric_15.webp",
];

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

export default function SubsidyLpUseCases({ data }: Props) {
  const { ref, visible } = useInView();

  return (
    <section className="bg-[var(--bg-base)] py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* ヘッダー */}
        <div className="text-center">
          <h2
            className="text-2xl font-black tracking-[-0.02em] sm:text-3xl"
            style={{ color: "var(--text-primary)" }}
          >
            {/* 活用イメージ ← 旧 */}
            実際、こういう会社が動いています
          </h2>
        </div>

        {/* ペルソナカード群 */}
        <div ref={ref} className="mt-7 grid gap-5 lg:grid-cols-3">
          {data.useCases.map((uc, i) => (
            <div
              key={i}
              className="relative flex flex-col overflow-hidden rounded-2xl shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              style={{
                background: "#FFFFFF",
                border: "1px solid #E5E7EB",
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(20px)",
                transitionDuration: "var(--nts-dur-slow)",
                transitionTimingFunction: "var(--nts-ease-out)",
                transitionDelay: `${i * 100}ms`,
              }}
            >
              {/* カード上部 — isometric 画像 */}
              <div
                className="flex h-44 items-end justify-center overflow-hidden px-4 pt-4"
                style={{ background: "var(--bg-section-alt)" }}
              >
                <img
                  src={CASE_IMAGES[i % CASE_IMAGES.length]}
                  alt=""
                  aria-hidden="true"
                  className="h-full w-auto object-contain object-bottom drop-shadow-[0_8px_16px_rgba(10,34,64,0.10)] transition duration-300 group-hover:scale-105"
                />
              </div>

              {/* カード下部 — テキスト */}
              <div className="flex flex-1 flex-col px-5 py-5">
                <p
                  className="mt-2 text-sm font-black leading-snug"
                  style={{ color: "var(--text-primary)" }}
                >
                  {uc.label}
                </p>
                <p
                  className="mt-3 flex-1 text-sm font-medium leading-7"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {uc.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

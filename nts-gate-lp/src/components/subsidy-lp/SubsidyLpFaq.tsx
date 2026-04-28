"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { SubsidyLpData } from "@/lib/subsidy-lp/buildSubsidyLpData";

type Props = { data: SubsidyLpData };

const CONCERNS = [
  {
    icon: "😟",
    worry: "申請が複雑そう…",
    answer:
      "公募要領の読み込みから事業計画書の作成まで、専門家が伴走します。初めての方でも安心して進められるようにサポートします。",
    cta: { label: "無料相談で確認する", href: "/consult" },
    ctaAccent: true,
  },
  {
    icon: "🤔",
    worry: "採択されるか不安…",
    answer:
      "事前に要件・事業計画・申請内容を整理することで、採択可能性を高められます。まず30秒診断で自社の適合度を確認しましょう。",
    cta: { label: "30秒で適合確認する", href: "#checker" },
    ctaAccent: false,
  },
  {
    icon: "💰",
    worry: "費用がいくらかかる？",
    answer:
      "初回相談は無料です。支援費用は案件・対応範囲によって異なります。まずはご相談いただき、費用感も含めて確認できます。",
    cta: { label: "費用を確認する", href: "/consult" },
    ctaAccent: false,
  },
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

function FaqAccordion({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
      className="last:border-0"
    >
      <button
        className="flex w-full items-start justify-between gap-4 py-5 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{
          color: "var(--nts-text-primary-dark)",
          outlineColor: "var(--nts-accent-cyan)",
          transitionDuration: "var(--nts-dur-fast)",
        }}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="flex items-start gap-2 text-sm font-bold">
          <span style={{ color: "var(--nts-accent-cyan)" }} className="mt-0.5 shrink-0">Q.</span>
          {q}
        </span>
        <span
          className="shrink-0 transition-transform"
          style={{
            color: "rgba(255,255,255,0.4)",
            transform: open ? "rotate(45deg)" : "none",
            transitionDuration: "var(--nts-dur-fast)",
          }}
          aria-hidden
        >
          +
        </span>
      </button>
      {open && (
        <div
          className="pb-5 pl-5 pr-2 text-sm font-medium leading-7"
          style={{ color: "var(--nts-text-secondary-dark)" }}
        >
          <span className="mr-2 font-black" style={{ color: "var(--nts-accent-orange)" }}>A.</span>
          {a}
        </div>
      )}
    </div>
  );
}

export default function SubsidyLpFaq({ data }: Props) {
  const { ref, visible } = useInView();

  return (
    <section
      className="rounded-[28px] overflow-hidden"
      style={{
        background: "var(--nts-bg-elevated)",
        boxShadow: "var(--nts-shadow-lg)",
      }}
    >
      <div className="px-6 pt-8 sm:px-10 sm:pt-10">
        <p
          className="text-xs font-extrabold uppercase tracking-[0.26em]"
          style={{ color: "var(--nts-accent-cyan)" }}
        >
          よくある不安
        </p>
        <h2
          className="mt-2 text-2xl font-black tracking-[-0.02em] sm:text-3xl"
          style={{ color: "var(--nts-text-primary-dark)" }}
        >
          申請前によくある3つの不安
        </h2>
        <p
          className="mt-2 text-sm font-medium"
          style={{ color: "var(--nts-text-tertiary-dark)" }}
        >
          それぞれに、具体的な解決策があります
        </p>
      </div>

      {/* 不安→回答→CTAカード3枚 */}
      <div ref={ref} className="mt-8 grid gap-4 px-6 sm:px-10 lg:grid-cols-3">
        {CONCERNS.map((c, i) => (
          <div
            key={i}
            className="flex flex-col rounded-2xl overflow-hidden transition"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "var(--nts-shadow-offset)",
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(20px)",
              transitionDuration: "var(--nts-dur-slow)",
              transitionTimingFunction: "var(--nts-ease-out)",
              transitionDelay: `${i * 100}ms`,
            }}
          >
            {/* 不安ヘッダー */}
            <div
              className="px-5 py-4"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl" aria-hidden>{c.icon}</span>
                <p
                  className="text-sm font-black"
                  style={{ color: "var(--nts-text-primary-dark)" }}
                >
                  {c.worry}
                </p>
              </div>
            </div>

            {/* 回答 */}
            <div className="flex flex-1 flex-col px-5 py-4">
              <div
                className="mb-3 flex items-center gap-1.5"
              >
                <span
                  className="text-[10px] font-extrabold uppercase tracking-wider"
                  style={{ color: "var(--nts-accent-teal)" }}
                >
                  ↓ 回答
                </span>
              </div>
              <p
                className="flex-1 text-sm font-medium leading-7"
                style={{ color: "var(--nts-text-secondary-dark)" }}
              >
                {c.answer}
              </p>

              {/* 次の一歩 CTA */}
              <Link
                href={c.cta.href}
                className="mt-5 inline-flex items-center justify-center rounded-full px-5 py-2.5 text-xs font-extrabold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={
                  c.ctaAccent
                    ? {
                        background: "var(--nts-accent-orange)",
                        color: "#0F172A",
                        boxShadow: "var(--nts-glow-orange)",
                        transitionDuration: "var(--nts-dur-fast)",
                        outlineColor: "var(--nts-accent-orange)",
                      }
                    : {
                        background: "rgba(255,255,255,0.08)",
                        color: "var(--nts-text-primary-dark)",
                        border: "1px solid rgba(255,255,255,0.15)",
                        transitionDuration: "var(--nts-dur-fast)",
                        outlineColor: "var(--nts-accent-cyan)",
                      }
                }
              >
                {c.cta.label} →
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* 詳細FAQ アコーディオン */}
      {data.faqs.length > 0 && (
        <div className="mt-8 px-6 pb-8 sm:px-10 sm:pb-10">
          <p
            className="mb-1 text-xs font-extrabold uppercase tracking-[0.26em]"
            style={{ color: "var(--nts-text-tertiary-dark)" }}
          >
            FAQ
          </p>
          <h3
            className="mb-5 text-lg font-black"
            style={{ color: "var(--nts-text-primary-dark)" }}
          >
            よくある質問
          </h3>
          <div
            className="rounded-2xl px-5"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            {data.faqs.map((faq, i) => (
              <FaqAccordion key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

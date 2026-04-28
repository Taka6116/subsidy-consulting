"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { SubsidyLpData } from "@/lib/subsidy-lp/buildSubsidyLpData";

type Props = { data: SubsidyLpData };

const CONCERNS = [
  {
    icon: "document",
    worry: "申請が複雑そう…",
    answer:
      "公募要領の読み込みから事業計画書の作成まで、専門家が伴走します。初めての方でも安心して進められるようにサポートします。",
    cta: { label: "無料相談で確認する", href: "/consult" },
    ctaAccent: true,
  },
  {
    icon: "pulse",
    worry: "採択されるか不安…",
    answer:
      "事前に要件・事業計画・申請内容を整理することで、採択可能性を高められます。まず30秒診断で自社の適合度を確認しましょう。",
    cta: { label: "30秒で適合確認する", href: "#checker" },
    ctaAccent: false,
  },
  {
    icon: "clock",
    worry: "費用がいくらかかる？",
    answer:
      "初回相談は無料です。支援費用は案件・対応範囲によって異なります。まずはご相談いただき、費用感も含めて確認できます。",
    cta: { label: "費用を確認する", href: "/consult" },
    ctaAccent: false,
  },
];

function ConcernIcon({ icon }: { icon: string }) {
  const props = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    width: 28,
    height: 28,
    "aria-hidden": true,
  };

  if (icon === "pulse") {
    return (
      <svg {...props}>
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    );
  }

  if (icon === "clock") {
    return (
      <svg {...props}>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4l3 3" />
      </svg>
    );
  }

  return (
    <svg {...props}>
      <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

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
    <div className="border-b border-slate-200 last:border-0">
      <button
        className="flex w-full items-start justify-between gap-4 py-5 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{
          color: "var(--nts-text-primary-light)",
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
            color: "#94A3B8",
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
          style={{ color: "var(--nts-text-secondary-light)" }}
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
    <section className="bg-white pt-12 md:pt-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
          よくある不安
        </p>
        <h2
          className="text-2xl font-black tracking-[-0.02em] text-slate-900 sm:text-3xl"
        >
          申請前によくある3つの不安
        </h2>
        <p
          className="mt-2 text-sm font-medium text-slate-500"
        >
          それぞれに、具体的な解決策があります
        </p>
      </div>

      {/* 不安→回答→CTAカード3枚 */}
      <div ref={ref} className="mt-8 grid gap-4 lg:grid-cols-3">
        {CONCERNS.map((c, i) => (
          <div
            key={i}
            className="flex flex-col overflow-hidden rounded-2xl shadow-sm transition"
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
            {/* 不安ヘッダー */}
            <div
              className="px-5 py-4"
              style={{ borderBottom: "1px solid #F1F5F9" }}
            >
              <div className="flex items-center gap-2">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-700 ring-1 ring-slate-100">
                  <ConcernIcon icon={c.icon} />
                </span>
                <p
                  className="text-sm font-black text-slate-900"
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
                className="flex-1 text-sm font-medium leading-7 text-slate-600"
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
                        background: "#F8FAFC",
                        color: "var(--nts-text-primary-light)",
                        border: "1px solid #E2E8F0",
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
      </div>

      {/* 詳細FAQ アコーディオン */}
      {data.faqs.length > 0 && (
        <div className="mt-12 bg-slate-50 py-12 md:py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
            FAQ
          </p>
          <h3
            className="mb-5 text-lg font-black text-slate-900"
          >
            よくある質問
          </h3>
          <div
            className="rounded-2xl border border-slate-200 bg-white px-5"
          >
            {data.faqs.map((faq, i) => (
              <FaqAccordion key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
          </div>
        </div>
      )}
    </section>
  );
}

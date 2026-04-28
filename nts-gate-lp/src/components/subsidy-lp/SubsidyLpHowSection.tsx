"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { subsidyLpAsset } from "@/lib/subsidy-lp/assets";

const STEPS = [
  {
    num: "01",
    title: "事前準備",
    duration: "1〜2週間",
    body: "対象要件・補助対象経費・締切を確認し、自社で活用できるかを整理します。",
    accent: true,
  },
  {
    num: "02",
    title: "公募申請",
    duration: "締切までに提出",
    body: "事業計画書を作成し、所定のシステムから申請書類を提出します。採択の鍵となる最重要ステップです。",
    accent: false,
  },
  {
    num: "03",
    title: "採択発表",
    duration: "約2〜3ヶ月後",
    body: "審査結果が公表されます。採択率は制度・回によって異なり、事前の計画書品質が重要です。",
    accent: false,
  },
  {
    num: "04",
    title: "交付申請・事業実施",
    duration: "採択後〜補助対象期間",
    body: "採択後に詳細な交付申請を行い、補助対象期間内で事業を実施します。",
    accent: false,
  },
  {
    num: "05",
    title: "実績報告・入金",
    duration: "事業完了後",
    body: "完了報告書を提出し、確定検査を経て補助金が交付されます。",
    accent: false,
  },
];

function useInView(threshold = 0.2) {
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

export default function SubsidyLpHowSection() {
  const { ref, visible } = useInView(0.15);
  const handshakeImage = subsidyLpAsset("handshake.png");

  return (
    <section
      className="overflow-hidden rounded-[28px] border border-slate-100 bg-slate-50 shadow-[0_18px_45px_rgba(23,32,51,0.06)]"
    >
      <div className="px-6 pt-8 sm:px-10 sm:pt-10">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
          Process
        </p>
        <h2
          className="text-2xl font-black tracking-[-0.02em] sm:text-3xl"
          style={{ color: "var(--nts-text-primary-light)" }}
        >
          申請検討から採択後までの流れ
        </h2>
        <p
          className="mt-2 text-sm font-medium"
          style={{ color: "var(--nts-text-tertiary-light)" }}
        >
          複雑に見える申請プロセスを5ステップで整理しました
        </p>
      </div>

      {/* タイムライン本体 */}
      <div ref={ref} className="mt-8 px-6 pb-8 sm:px-10 sm:pb-10">
        {/* PC: 横タイムライン */}
        <div className="hidden lg:block">
          {/* 接続線（スクロール連動で伸びる） */}
          <div className="relative mb-2 px-[5%]">
            <div
              className="absolute left-[5%] top-5 h-[2px] rounded-full"
              style={{
                right: "5%",
                background: "var(--nts-border-light)",
              }}
            />
            <div
              className="absolute left-[5%] top-5 h-[2px] rounded-full transition-all"
              style={{
                width: visible ? "90%" : "0%",
                background: `linear-gradient(90deg, var(--nts-accent-teal), var(--nts-accent-cyan))`,
                transitionDuration: "1200ms",
                transitionTimingFunction: "var(--nts-ease-out)",
              }}
            />
            {/* バッジ群 */}
            <div className="relative flex justify-between">
              {STEPS.map((step) => (
                <div
                  key={step.num}
                  className="flex flex-col items-center"
                  style={{ width: "18%" }}
                >
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-black transition"
                    style={{
                      background: step.accent ? "var(--nts-accent-teal)" : "var(--nts-bg-base)",
                      color: step.accent ? "#0F172A" : "var(--nts-accent-cyan)",
                      border: step.accent ? "none" : "2px solid var(--nts-accent-teal)",
                      boxShadow: step.accent ? "var(--nts-glow-teal)" : "none",
                    }}
                  >
                    {step.num}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* カード群 */}
          <div className="mt-5 grid grid-cols-5 gap-3">
            {STEPS.map((step, i) => (
              <div
                key={step.num}
                className="rounded-2xl p-4 transition"
                style={{
                  background: step.accent ? "rgba(14,165,164,0.08)" : "#FFFFFF",
                  border: `1px solid ${step.accent ? "rgba(14,165,164,0.35)" : "var(--nts-border-light)"}`,
                  boxShadow: "var(--nts-shadow-offset)",
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0)" : "translateY(16px)",
                  transitionDuration: "var(--nts-dur-slow)",
                  transitionTimingFunction: "var(--nts-ease-out)",
                  transitionDelay: `${i * 80}ms`,
                }}
              >
                <p
                  className="text-[10px] font-extrabold uppercase"
                  style={{ color: step.accent ? "var(--nts-accent-teal)" : "var(--nts-text-tertiary-light)" }}
                >
                  {step.duration}
                </p>
                <p
                  className="mt-1.5 text-sm font-black leading-snug"
                  style={{ color: "var(--nts-text-primary-light)" }}
                >
                  {step.title}
                </p>
                <p
                  className="mt-2 text-xs font-medium leading-relaxed"
                  style={{ color: "var(--nts-text-tertiary-light)" }}
                >
                  {step.body}
                </p>
                {step.accent && (
                  <span
                    className="mt-2 inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-black"
                    style={{ background: "var(--nts-accent-teal)", color: "#0F172A" }}
                  >
                    最初に確認
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* SP: 縦タイムライン */}
        <div className="lg:hidden">
          <div className="relative pl-8">
            {/* 縦線 */}
            <div
              className="absolute left-3.5 top-0 w-[2px] rounded-full"
              style={{
                bottom: 0,
                background: "var(--nts-border-light)",
              }}
            />
            <div
              className="absolute left-3.5 top-0 w-[2px] rounded-full transition-all"
              style={{
                height: visible ? "100%" : "0%",
                background: `linear-gradient(180deg, var(--nts-accent-teal), var(--nts-accent-cyan))`,
                transitionDuration: "1200ms",
                transitionTimingFunction: "var(--nts-ease-out)",
              }}
            />

            {STEPS.map((step, i) => (
              <div
                key={step.num}
                className="relative mb-5 last:mb-0"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateX(0)" : "translateX(-12px)",
                  transitionDuration: "var(--nts-dur-slow)",
                  transitionTimingFunction: "var(--nts-ease-out)",
                  transitionDelay: `${i * 100}ms`,
                }}
              >
                {/* ドット */}
                <div
                  className="absolute -left-[1.625rem] flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-black"
                  style={{
                    background: step.accent ? "var(--nts-accent-teal)" : "var(--nts-bg-base)",
                    color: step.accent ? "#0F172A" : "var(--nts-accent-cyan)",
                    border: step.accent ? "none" : "2px solid var(--nts-accent-teal)",
                  }}
                >
                  {step.num}
                </div>
                <div
                  className="rounded-2xl p-4"
                  style={{
                    background: step.accent ? "rgba(14,165,164,0.08)" : "#FFFFFF",
                    border: `1px solid ${step.accent ? "rgba(14,165,164,0.35)" : "var(--nts-border-light)"}`,
                    boxShadow: "var(--nts-shadow-offset)",
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className="text-sm font-black"
                      style={{ color: "var(--nts-text-primary-light)" }}
                    >
                      {step.title}
                    </p>
                    {step.accent && (
                      <span
                        className="shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-black"
                        style={{ background: "var(--nts-accent-teal)", color: "#0F172A" }}
                      >
                        最初に確認
                      </span>
                    )}
                  </div>
                  <p
                    className="mt-0.5 text-[10px] font-extrabold uppercase"
                    style={{ color: step.accent ? "var(--nts-accent-teal)" : "var(--nts-text-tertiary-light)" }}
                  >
                    {step.duration}
                  </p>
                  <p
                    className="mt-2 text-xs font-medium leading-relaxed"
                    style={{ color: "var(--nts-text-tertiary-light)" }}
                  >
                    {step.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 下部バナー（伴走支援の訴求） */}
      <div
        className="grid overflow-hidden md:grid-cols-[1fr_200px]"
        style={{
          background: "var(--nts-bg-base)",
          borderTop: "1px solid var(--nts-border-dark)",
        }}
      >
        <div className="px-8 py-7">
          <p
            className="text-base font-black"
            style={{ color: "var(--nts-text-primary-dark)" }}
          >
            NTSは「申請代行」ではなく「戦略設計と伴走支援」です
          </p>
          <p
            className="mt-2 text-sm font-medium leading-7"
            style={{ color: "var(--nts-text-secondary-dark)" }}
          >
            どの補助金をどう活用するかという設計から、採択後の実行管理までを一緒に整理します。制度の最終確認は公募要領に基づいて行います。
          </p>
          <Link
            href="/consult"
            className="mt-4 inline-flex items-center rounded-full px-5 py-3 text-xs font-extrabold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              background: "var(--nts-accent-orange)",
              color: "#0F172A",
              boxShadow: "var(--nts-glow-orange)",
              transitionDuration: "var(--nts-dur-fast)",
            }}
          >
            無料相談を予約する
          </Link>
        </div>
        <div className="hidden items-end justify-center bg-white/5 px-4 pt-4 md:flex">
          <img
            src={handshakeImage}
            alt=""
            aria-hidden="true"
            className="h-44 w-auto object-contain drop-shadow-[0_14px_24px_rgba(0,0,0,0.22)]"
          />
        </div>
      </div>
    </section>
  );
}

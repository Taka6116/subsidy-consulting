"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { getPartnerUrl } from "@/lib/partnerUrl";
import IntroOverlay from "@/components/subsidies/IntroOverlay";
import SubsidyHero from "@/components/subsidies/SubsidyHeroV2";

type Counts = { grants: number; articles: number; videos: number; lps: number };
type Props  = { counts: Counts; activePrefectureCount: number };

const CATEGORY_CARDS = [
  {
    href: "/subsidies/list",
    label: "補助金一覧",
    desc: "省庁・jGrantsから自動収集した最新補助金を検索。締切・上限額・対象業種を一目で確認。",
    badge: "最速更新",
    badgeClass: "bg-amber-50 text-amber-700 ring-amber-200",
  },
  {
    href: "/subsidies/articles",
    label: "解説記事",
    desc: "補助金ごとの詳しい解説・申請ポイントをまとめた専門記事。",
    badge: "補助金記事",
    badgeClass: "bg-blue-50 text-blue-700 ring-blue-200",
  },
  {
    href: "/subsidies/lp",
    label: "活用ガイド",
    desc: "制度ごとの対象課題・活用例・申請の流れをLP形式で整理。",
    badge: "webページ",
    badgeClass: "bg-teal-50 text-teal-700 ring-teal-200",
  },
  {
    href: "/subsidies/videos",
    label: "解説動画",
    desc: "音声ナレーション付きの動画で補助金の概要を手軽に理解。通勤中にも。",
    badge: "補助金解説動画",
    badgeClass: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
] as const;

export default function SubsidiesGalaxyClient({ counts, activePrefectureCount }: Props) {
  const partnerHref = getPartnerUrl();
  const [introComplete, setIntroComplete] = useState(false);
  const handleIntroComplete = useCallback(() => setIntroComplete(true), []);

  useEffect(() => {
    if (!introComplete) return;
    const run = async () => {
      const { gsap } = await import("gsap");
      const targets = document.querySelectorAll("[data-intro-reveal]");
      gsap.fromTo(
        targets,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.65, ease: "power3.out", stagger: 0.1, clearProps: "transform" }
      );
    };
    run();
  }, [introComplete]);

  return (
    <>
      {!introComplete && <IntroOverlay onComplete={handleIntroComplete} />}

      <div
        data-intro-reveal
        style={{ opacity: 0 }}
        className="relative font-body"
      >
        {/* ヒーロー（地図 + コピー + リアルタイム検知 + 特徴カード） */}
        <SubsidyHero counts={counts} activePrefectureCount={activePrefectureCount} />

        {/* ── カテゴリナビ ── */}
        <section className="mx-auto w-full max-w-[1400px] px-6 pb-16 pt-6">
          <div className="mb-6 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORY_CARDS.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="group flex flex-col rounded-2xl border border-[#dbe4f0] bg-white/80 p-6 shadow-sm transition-all duration-150 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
              >
                <div className="mb-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ring-1 ${card.badgeClass}`}>
                    {card.badge}
                  </span>
                </div>
                <h2 className="font-heading text-lg font-semibold text-[#0f172a]">{card.label}</h2>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-[#475569]">{card.desc}</p>
                <div className="mt-5 flex items-center gap-1 text-xs font-semibold text-[#2563eb] transition-all duration-150 group-hover:gap-2">
                  詳しく見る
                  <span aria-hidden="true" className="transition-transform duration-150 group-hover:translate-x-0.5">→</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── CTA バー ── */}
        <div
          className="w-full border-t border-[rgba(16,24,40,0.08)]"
          style={{
            background:
              "linear-gradient(135deg, #0b3a7a 0%, #1a4c8e 45%, #1368d8 100%)",
          }}
        >
          <div className="mx-auto flex max-w-[1400px] flex-col items-center gap-4 px-6 py-10 sm:flex-row sm:justify-between">
            <div>
              <p className="mt-1 text-base font-medium text-white/95">
                あなたのビジネスに最適な補助金を、専門家が無料でご提案します。
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
              <Link
                href="/consult"
                className="inline-flex items-center justify-center rounded-2xl px-7 py-3 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:brightness-110 [background:var(--nts-gradient-primary)]"
              >
                無料相談を予約する →
              </Link>
              <Link
                href={partnerHref}
                className="inline-flex items-center justify-center rounded-2xl px-7 py-3 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:brightness-110 [background:var(--nts-gradient-check)]"
              >
                提携先ページへ
              </Link>
            </div>
          </div>
        </div>

        {/* ── トップへ ── */}
        <div className="w-full bg-[#f7f9fc] py-6 text-center">
          <Link
            href="/"
            className="text-sm text-slate-400 underline-offset-4 transition hover:text-slate-700 hover:underline"
          >
            ← トップへ戻る
          </Link>
        </div>
      </div>
    </>
  );
}

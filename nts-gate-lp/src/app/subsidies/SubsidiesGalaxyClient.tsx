"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { ArrowUpRight, BookOpen, FileSearch, PlaySquare, Sparkles } from "lucide-react";
import { getPartnerUrl } from "@/lib/partnerUrl";
import IntroOverlay from "@/components/subsidies/IntroOverlay";
import SubsidyHeroV3 from "@/components/subsidies/SubsidyHeroV3";
import type { TopPageContent } from "@/lib/subsidies/topPageContent";

type Props = { content: TopPageContent };

const CATEGORY_CARDS = [
  {
    href: "/subsidies/list",
    label: "補助金一覧",
    desc: "省庁・jGrantsから自動収集した最新補助金を検索。締切・上限額・対象業種を一目で確認。",
    badge: "最速更新",
    badgeClass: "bg-amber-50 text-amber-700 ring-amber-200",
    icon: FileSearch,
    iconClass: "bg-blue-600 text-white",
    accentClass: "from-blue-600 to-cyan-500",
  },
  {
    href: "/subsidies/articles",
    label: "解説記事",
    desc: "補助金ごとの詳しい解説・申請ポイントをまとめた専門記事。",
    badge: "補助金記事",
    badgeClass: "bg-blue-50 text-blue-700 ring-blue-200",
    icon: BookOpen,
    iconClass: "bg-indigo-600 text-white",
    accentClass: "from-indigo-600 to-violet-500",
  },
  {
    href: "/subsidies/lp",
    label: "活用ガイド",
    desc: "制度ごとの対象課題・活用例・申請の流れをLP形式で整理。",
    badge: "webページ",
    badgeClass: "bg-teal-50 text-teal-700 ring-teal-200",
    icon: Sparkles,
    iconClass: "bg-teal-600 text-white",
    accentClass: "from-teal-600 to-emerald-500",
  },
  {
    href: "/subsidies/videos",
    label: "解説動画",
    desc: "音声ナレーション付きの動画で補助金の概要を手軽に理解。通勤中にも。",
    badge: "補助金解説動画",
    badgeClass: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    icon: PlaySquare,
    iconClass: "bg-sky-600 text-white",
    accentClass: "from-sky-600 to-blue-500",
  },
] as const;

export default function SubsidiesGalaxyClient({ content }: Props) {
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
        {/* ヒーロー（コピー + チーム写真 + 新着記事/動画/ガイド + 最新速報） */}
        <SubsidyHeroV3
          articles={content.articles}
          videos={content.videos}
          guides={content.guides}
          liveItems={content.liveItems}
        />

        {/* ── カテゴリナビ ── */}
        <section className="mx-auto w-full max-w-[1400px] px-6 pb-16 pt-6">
          <div className="mb-7 flex items-end justify-between">
            <div>
              <p className="text-xs font-black tracking-[0.18em] text-[#1d5fe8]">EXPLORE</p>
              <h2 className="mt-1 font-heading text-2xl font-black text-[#10294a]">
                補助金情報を、目的から探す
              </h2>
            </div>
            <p className="hidden max-w-[360px] text-right text-sm font-medium leading-6 text-[#6b7e94] lg:block">
              制度の検索から申請のポイントまで、必要な情報へ最短でアクセスできます。
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORY_CARDS.map((card) => {
              const Icon = card.icon;
              return (
              <Link
                key={card.href}
                href={card.href}
                className="group relative flex min-h-[230px] flex-col overflow-hidden rounded-2xl border border-[#dbe4f0] bg-white p-6 shadow-[0_10px_28px_rgba(30,66,110,0.07)] transition-all duration-200 hover:-translate-y-1.5 hover:border-blue-200 hover:shadow-[0_18px_36px_rgba(30,66,110,0.15)]"
              >
                <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${card.accentClass}`} />
                <div className="mb-5 flex items-center justify-between">
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ring-1 ${card.badgeClass}`}>
                    {card.badge}
                  </span>
                  <span className={`grid h-11 w-11 place-items-center rounded-xl shadow-sm ${card.iconClass}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                </div>
                <h2 className="font-heading text-lg font-semibold text-[#0f172a]">{card.label}</h2>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-[#475569]">{card.desc}</p>
                <div className="mt-5 flex items-center gap-1.5 text-xs font-bold text-[#2563eb]">
                  詳しく見る
                  <ArrowUpRight aria-hidden="true" className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </Link>
              );
            })}
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

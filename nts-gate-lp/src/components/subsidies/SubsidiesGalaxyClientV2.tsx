"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import IntroOverlay from "@/components/subsidies/IntroOverlay";
import SubsidyHeroV2 from "@/components/subsidies/SubsidyHeroV2";
import { Search, BookOpen, LayoutList, PlaySquare, ArrowRight } from "lucide-react";

type Counts = { grants: number; articles: number; videos: number; lps: number };
type Props  = { counts: Counts; activePrefectureCount: number };

const CATEGORY_CARDS = [
  {
    href: "/subsidies/list",
    label: "補助金一覧",
    desc: "受付中の補助金を、地域・業種・締切から探せます。",
    cta: "補助金を探す",
    badge: "最速更新",
    badgeClass: "bg-amber-50 text-amber-700 ring-amber-200",
    Icon: Search,
    iconBg: "bg-amber-50 text-amber-600",
  },
  {
    href: "/subsidies/articles",
    label: "解説記事",
    desc: "制度の概要、対象企業、申請前の注意点を記事で確認できます。",
    cta: "記事を読む",
    badge: "補助金記事",
    badgeClass: "bg-blue-50 text-blue-700 ring-blue-200",
    Icon: BookOpen,
    iconBg: "bg-blue-50 text-blue-600",
  },
  {
    href: "/subsidies/lp",
    label: "活用ガイド",
    desc: "制度ごとの対象課題・活用例・相談前の判断材料をLP形式で整理しています。",
    cta: "ガイドを見る",
    badge: "専門ガイド",
    badgeClass: "bg-teal-50 text-teal-700 ring-teal-200",
    Icon: LayoutList,
    iconBg: "bg-teal-50 text-teal-600",
  },
  {
    href: "/subsidies/videos",
    label: "解説動画",
    desc: "音声ナレーション付きの動画で、補助金の概要を短時間で理解できます。",
    cta: "動画を見る",
    badge: "解説動画",
    badgeClass: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    Icon: PlaySquare,
    iconBg: "bg-emerald-50 text-emerald-600",
  },
] as const;

export default function SubsidiesGalaxyClientV2({ counts, activePrefectureCount }: Props) {
  const [introComplete, setIntroComplete] = useState(false);
  const handleIntroComplete = useCallback(() => setIntroComplete(true), []);

  useEffect(() => {
    if (!introComplete) return;
    const run = async () => {
      const { gsap } = await import("gsap");
      const targets = document.querySelectorAll("[data-intro-reveal-v2]");
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
        data-intro-reveal-v2
        style={{ opacity: 0 }}
        className="relative font-body"
      >
        {/* ヒーロー */}
        <SubsidyHeroV2 counts={counts} activePrefectureCount={activePrefectureCount} />

        {/* ── セクション見出し + 4カード ── */}
        <section className="mx-auto w-full max-w-[1400px] px-6 pb-10 pt-8">
          <div className="mb-6 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />

          {/* セクション見出し */}
          <div className="mb-8 text-center">
            <h2 className="font-heading text-xl font-bold text-[#0f172a] sm:text-2xl">
              目的に合わせて補助金情報を見る
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#475569]">
              探す、読む、見る、相談する。必要な形で補助金情報を確認できます。
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORY_CARDS.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="group flex flex-col rounded-2xl border border-[#dbe4f0] bg-white p-6 shadow-sm transition-all duration-150 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
              >
                {/* アイコン */}
                <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${card.iconBg}`}>
                  <card.Icon className="h-5 w-5" />
                </div>

                {/* バッジ */}
                <span className={`mb-3 w-fit rounded-full px-2.5 py-0.5 text-[10px] font-medium ring-1 ${card.badgeClass}`}>
                  {card.badge}
                </span>

                <h3 className="font-heading text-lg font-semibold text-[#0f172a]">{card.label}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-[#475569]">{card.desc}</p>

                {/* CTA */}
                <div className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-[#2563eb] px-4 py-2 text-xs font-bold text-white transition-all duration-150 group-hover:bg-blue-600">
                  {card.cta}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── 下部CTA ── */}
        <div className="w-full border-t border-slate-200 bg-[#f0f4fb]">
          <div className="mx-auto flex max-w-[1400px] flex-col gap-6 px-6 py-12 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
            <div className="max-w-xl">
              <p className="text-lg font-bold leading-snug text-[#0f172a] sm:text-xl">
                事業内容に合う補助金を、申請前の整理から相談できます。
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[#475569]">
                業種・投資内容・地域をもとに、活用できる可能性のある補助金や申請前に整理すべきポイントを専門家が無料で確認します。
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
              <Link
                href="/consult"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#2563eb] px-7 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-blue-500"
              >
                <MessageCircleIcon />
                無料相談する
              </Link>
              <Link
                href="/subsidies/list"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-7 py-3.5 text-sm font-bold text-[#0f172a] shadow-sm transition hover:border-blue-300 hover:shadow-md"
              >
                <SearchIcon />
                対象補助金を確認する
              </Link>
            </div>
          </div>
        </div>

        {/* ── パートナー + トップへ戻る ── */}
      </div>
    </>
  );
}

function MessageCircleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
  );
}

"use client";

/*
 * /subsidies ハブページ — 「情報の司令塔」リデザイン
 * Editorial Minimalism × Data Intelligence
 * バックエンド・ルーティング・DB は一切変更なし
 */

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { getPartnerUrl } from "@/lib/partnerUrl";
import SubsidiesGalaxyBackdrop from "./SubsidiesGalaxyBackdrop";
import IntroOverlay from "@/components/subsidies/IntroOverlay";

type Counts = {
  grants: number;
  articles: number;
  videos: number;
};

type Props = {
  counts: Counts;
};

// data-intro-reveal 要素はイントロ前に非表示にするインラインスタイル
const hiddenStyle = { opacity: 0 } as const;

function StatPanel({ counts }: { counts: Counts }) {
  return (
    <div
      data-intro-reveal
      style={hiddenStyle}
      className="rounded-2xl border border-white/30 bg-white/60 px-8 py-6 shadow-xl backdrop-blur-md"
    >
      <p className="mb-4 text-[10px] font-medium tracking-[0.25em] text-neutral-400">
        LIVE STATS
      </p>
      <ul className="space-y-4">
        <StatRow
          label="掲載補助金"
          value={counts.grants}
          unit="件"
          color="text-amber-600"
        />
        <StatRow
          label="解説記事"
          value={counts.articles}
          unit="本"
          color="text-primary-700"
        />
        <StatRow
          label="解説動画"
          value={counts.videos}
          unit="本"
          color="text-primary-700"
        />
      </ul>
      <div className="mt-5 border-t border-neutral-100 pt-4">
        <p className="flex items-center gap-1.5 text-[11px] text-neutral-400">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
          リアルタイム自動更新中
        </p>
      </div>
    </div>
  );
}

function StatRow({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: number;
  unit: string;
  color: string;
}) {
  return (
    <li className="flex items-center justify-between gap-6">
      <span className="text-sm text-neutral-600">{label}</span>
      <span className={`text-2xl font-bold tabular-nums ${color}`}>
        {value.toLocaleString()}
        <span className="ml-0.5 text-sm font-normal text-neutral-400">{unit}</span>
      </span>
    </li>
  );
}

const CATEGORY_CARDS = [
  {
    href: "/subsidies/list",
    label: "補助金一覧",
    subLabel: "GRANT DATABASE",
    description: "省庁・jGrants から自動収集した最新補助金を即検索。締切・上限額・対象業種を一目で確認。",
    badge: "毎日更新",
    badgeColor: "bg-amber-50 text-amber-700 ring-amber-200",
  },
  {
    href: "/subsidies/articles",
    label: "解説記事",
    subLabel: "EXPERT ARTICLES",
    description: "補助金ごとの詳しい解説・申請ポイントをわかりやすくまとめた専門記事。",
    badge: "AI生成・随時追加",
    badgeColor: "bg-primary-50 text-primary-700 ring-primary-200",
  },
  {
    href: "/subsidies/videos",
    label: "解説動画",
    subLabel: "VIDEO GUIDE",
    description: "音声ナレーション付きの動画で補助金の概要を手軽に理解。通勤・移動中にも。",
    badge: "音声対応",
    badgeColor: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
] as const;

export default function SubsidiesGalaxyClient({ counts }: Props) {
  const partnerHref = getPartnerUrl();

  // 毎回イントロを表示する
  const [introComplete, setIntroComplete] = useState(false);

  const handleIntroComplete = useCallback(() => {
    setIntroComplete(true);
  }, []);

  // イントロ完了後に data-intro-reveal 要素を stagger フェードイン（GSAPに一元管理）
  useEffect(() => {
    if (!introComplete) return;

    const run = async () => {
      const { gsap } = await import("gsap");
      const targets = document.querySelectorAll("[data-intro-reveal]");
      gsap.fromTo(
        targets,
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.75,
          ease: "power3.out",
          stagger: 0.12,
          clearProps: "transform",
        }
      );
    };

    run();
  }, [introComplete]);

  return (
    <>
      {!introComplete && (
        <IntroOverlay onComplete={handleIntroComplete} />
      )}
      <section
        className="relative flex min-h-[100svh] w-full flex-col overflow-hidden bg-[#f8f7f4] font-body"
        aria-label="補助金インテリジェンスプラットフォーム"
      >
        <SubsidiesGalaxyBackdrop />

        {/* ── HERO ── */}
        <div className="relative z-10 w-full px-6 pb-0 pt-28 sm:pt-32">
          <div className="mx-auto max-w-container">
            <div className="lg:grid lg:grid-cols-[1fr_auto] lg:items-center lg:gap-16">
              {/* 左: メインコピー */}
              <div>
                <p
                  data-intro-reveal
                  style={hiddenStyle}
                  className="mb-3 text-[10px] font-semibold tracking-[0.3em] text-amber-600"
                >
                  SUBSIDY INTELLIGENCE PLATFORM
                </p>
                <h1
                  data-intro-reveal
                  style={hiddenStyle}
                  className="font-heading text-[clamp(40px,6vw,80px)] font-normal leading-[1.1] text-[#1a2544]"
                >
                  補助金を、<br />
                  最速で届ける。
                </h1>
                <p
                  data-intro-reveal
                  style={hiddenStyle}
                  className="mt-5 max-w-[480px] text-base leading-relaxed text-neutral-600"
                >
                  公募開始から最速でお届け。
                  <br />
                  申請期限・補助上限・対象業種を、ひとつの画面で見れる場所。
                </p>

                {/* 速報バッジ */}
                <div
                  data-intro-reveal
                  style={hiddenStyle}
                  className="mt-6 flex flex-wrap gap-3"
                >
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 ring-1 ring-amber-200">
                    各省庁公式情報
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700 ring-1 ring-primary-200">
                    最速随時追加
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700 ring-1 ring-rose-200">
                    無料メール通知
                  </span>
                </div>
              </div>

              {/* 右: StatPanel */}
              <div className="mt-10 lg:mt-0">
                <StatPanel counts={counts} />
              </div>
            </div>
          </div>
        </div>

        {/* ── 区切り線 ── */}
        <div
          data-intro-reveal
          style={hiddenStyle}
          className="relative z-10 mx-auto mt-14 w-full max-w-container px-6"
        >
          <div className="h-px w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent" />
          <p className="mt-3 text-center text-[10px] tracking-[0.25em] text-neutral-400">
            EXPLORE CATEGORIES
          </p>
        </div>

        {/* ── 3カテゴリカード ── */}
        <div className="relative z-10 mx-auto w-full max-w-container px-6 pb-16 pt-8">
          <div className="grid gap-5 sm:grid-cols-3">
            {CATEGORY_CARDS.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                data-intro-reveal
                style={hiddenStyle}
                className="group relative flex flex-col rounded-2xl border border-white/50 bg-white/70 p-6 shadow-md backdrop-blur-sm transition-all duration-150 ease-out hover:-translate-y-1 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
              >
                <div className="mb-4">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ring-1 ${card.badgeColor}`}
                  >
                    {card.badge}
                  </span>
                </div>
                <p className="mb-0.5 text-[9px] font-semibold tracking-[0.25em] text-neutral-400">
                  {card.subLabel}
                </p>
                <h2 className="font-heading text-xl font-medium text-[#1a2544]">
                  {card.label}
                </h2>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-neutral-600">
                  {card.description}
                </p>
                <div className="mt-5 flex items-center gap-1 text-xs font-semibold text-amber-600 transition-gap duration-150 group-hover:gap-2">
                  詳しく見る
                  <span aria-hidden="true" className="transition-transform duration-150 group-hover:translate-x-0.5">→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── CTA バー ── */}
        <div
          data-intro-reveal
          style={hiddenStyle}
          className="relative z-10 w-full border-t border-white/40 bg-[#1a2544]/90 backdrop-blur-sm"
        >
          <div className="mx-auto flex max-w-container flex-col items-center gap-4 px-6 py-10 sm:flex-row sm:justify-between">
            <div>
              <p className="text-[10px] tracking-[0.2em] text-white/50">
                FREE CONSULTATION
              </p>
              <p className="mt-1 text-base font-medium text-white">
                あなたのビジネスに最適な補助金を、専門家が無料でご提案します。
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
              <Link
                href="/consult"
                className="inline-flex items-center justify-center rounded-full bg-amber-500 px-7 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-amber-400 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
              >
                無料相談を予約する →
              </Link>
              <Link
                href={partnerHref}
                className="inline-flex items-center justify-center rounded-full border border-white/40 px-7 py-3 text-sm font-medium text-white/80 transition-all hover:border-white/70 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                提携先ページへ
              </Link>
            </div>
          </div>
        </div>

        {/* ── トップへ戻る ── */}
        <div className="relative z-10 w-full bg-[#f8f7f4] py-6 text-center">
          <Link
            href="/"
            className="text-sm text-neutral-400 underline-offset-4 transition hover:text-[#1a2544] hover:underline"
          >
            ← トップへ戻る
          </Link>
        </div>
      </section>
    </>
  );
}

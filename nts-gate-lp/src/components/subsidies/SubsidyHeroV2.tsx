"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { AnimatePresence, motion, type Easing } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Search, MessageCircle, FileText } from "lucide-react";

const JapanNetworkMap = dynamic(() => import("./JapanNetworkMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-2 border-blue-200 border-t-blue-500" />
    </div>
  ),
});

const EASE: Easing = [0.22, 1, 0.36, 1];

type Counts = { grants: number; articles: number; videos: number; lps: number };
type LiveItem = { id: string; title: string; area: string; minutesAgo: number | null };

const FEATURES = [
  {
    title: "公開直後に検知",
    desc: "全国補助金をAIが24h収集。最新情報を即座に確認。",
    href: "/subsidies/list?sort=newest",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9Z" /><path d="M10 21a2 2 0 0 0 4 0" />
      </svg>
    ),
  },
  {
    title: "即座にコンテンツ化",
    desc: "解説記事・活用ガイドで申請前の情報収集をまとめて。",
    href: "/subsidies/articles",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M14 3 4 14h6l-1 7 10-11h-6l1-7Z" />
      </svg>
    ),
  },
  {
    title: "最速でユーザーへ",
    desc: "気になる補助金は専門家へ無料相談。申請前に整理。",
    href: "/consult",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
];

export default function SubsidyHeroV2({
  counts,
  activePrefectureCount,
}: {
  counts: Counts;
  activePrefectureCount: number;
}) {
  // ── Live data ──
  const [liveItems, setLiveItems] = useState<LiveItem[]>([]);
  useEffect(() => {
    fetch("/api/subsidies/hero-live")
      .then((r) => r.json())
      .then((data) => { if (data.items?.length) setLiveItems(data.items); })
      .catch(() => {});
  }, []);

  const [tick, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(timer);
  }, []);

  // ── カウンターアニメーション ──
  const [displayCounts, setDisplayCounts] = useState({ grants: 0, articles: 0, videos: 0 });
  const countRef = useRef(false);
  const badgeRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (countRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        countRef.current = true;
        observer.disconnect();
        const steps = 40;
        let step = 0;
        const timer = setInterval(() => {
          step++;
          const ease = 1 - Math.pow(1 - step / steps, 3);
          setDisplayCounts({
            grants:   Math.round(counts.grants   * ease),
            articles: Math.round(counts.articles * ease),
            videos:   Math.round(counts.videos   * ease),
          });
          if (step >= steps) clearInterval(timer);
        }, 1200 / steps);
      },
      { threshold: 0.3 }
    );
    if (badgeRef.current) observer.observe(badgeRef.current);
    return () => observer.disconnect();
  }, [counts]);

  const formatElapsed = (totalMinutes: number) => {
    if (totalMinutes < 60) return `${totalMinutes}分前`;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours < 24) return minutes === 0 ? `${hours}時間前` : `${hours}時間${minutes}分前`;
    const days = Math.floor(hours / 24);
    const remainHours = hours % 24;
    return remainHours === 0 ? `${days}日前` : `${days}日${remainHours}時間前`;
  };

  return (
    <div
      className="relative overflow-hidden"
      style={{
        background: "#f7f9fc",
        backgroundImage: "radial-gradient(circle, rgba(59,130,246,0.07) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    >
      {/* Floating blur orbs */}
      <div className="pointer-events-none absolute -top-28 left-[14%] h-[480px] w-[480px] rounded-full bg-blue-200/25 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-[4%] h-[400px] w-[400px] rounded-full bg-cyan-200/20 blur-[120px]" />

      {/* ══ HERO SECTION ══ */}
      <section className="relative z-10 w-full pt-10 pb-4 lg:pt-10 lg:pb-4 lg:min-h-[calc(100vh-72px)] flex flex-col">

        {/* ── 2カラム: 左コピー + 右地図 ── */}
        <div className="grid flex-1 items-center gap-6 px-4 lg:grid-cols-[0.92fr_1.35fr] lg:gap-8 lg:px-0 2xl:gap-10">

          {/* ── 左：コピー ── */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: EASE }}
            className="flex flex-col lg:pl-8 2xl:pl-16"
          >
            {/* タグ */}
            <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50 px-4 py-1.5 text-xs font-semibold text-blue-700">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
              </span>
              全国の補助金をAIがリアルタイム解析
            </div>

            {/* キャッチコピー */}
            <h1
              className="font-heading font-black leading-[1.1] tracking-[-0.02em] text-[#0f172a]"
              style={{ fontSize: "clamp(2.1rem, 3.2vw, 3.75rem)" }}
            >
              <span className="block whitespace-nowrap">補助金情報を、</span>
              <span className="block whitespace-nowrap">探す時代を終わらせ</span>
              <span className="block whitespace-nowrap">
                <span
                  style={{
                    background: "linear-gradient(90deg, #2563eb 0%, #22d3ee 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  &ldquo;最速&rdquo;
                </span>
                で届ける
              </span>
            </h1>

            <p className="mt-3 text-sm leading-relaxed text-[#475569] lg:text-base">
              全国の自治体・省庁サイトをAIが24時間クロール。
              <br />
              受付中の補助金を、業種・地域・締切から探せます。
            </p>

            {/* 主CTA・副CTA */}
            <div className="mt-5 flex w-full flex-col gap-3 sm:flex-row">
              <Link
                href="/subsidies/list"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2563eb] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-px hover:bg-blue-600 hover:shadow-xl sm:w-auto"
              >
                <Search className="h-4 w-4" />
                使える補助金を探す
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/consult"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-[#0f172a] shadow-sm transition-all hover:-translate-y-px hover:border-blue-300 hover:shadow-md sm:w-auto"
              >
                <MessageCircle className="h-4 w-4" />
                無料相談する
              </Link>
            </div>

            {/* 補助リンク */}
            <div className="mt-2.5">
              <Link
                href="/subsidies/articles"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#2563eb] hover:underline"
              >
                <FileText className="h-3.5 w-3.5" />
                最新記事を見る →
              </Link>
            </div>

            {/* 統計バッジ */}
            <div ref={badgeRef} className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                掲載補助金 {displayCounts.grants.toLocaleString()} 件
              </span>
              <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                解説記事 {displayCounts.articles.toLocaleString()} 本
              </span>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                動画 {displayCounts.videos.toLocaleString()} 本
              </span>
            </div>
          </motion.div>

          {/* ── 右：日本地図 ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.1 }}
            className="relative hidden overflow-visible md:block md:h-[380px] lg:h-[420px] xl:h-[460px] 2xl:h-[510px]"
          >
            {/* 補助金公募中都道府県バッジ */}
            <div className="absolute left-4 top-6 z-10 rounded-2xl border border-[#dbe4f0] bg-white/90 px-3 py-2 text-xs shadow-sm backdrop-blur">
              <p className="font-mono text-[#94a3b8]">補助金公募中都道府県</p>
              <p className="mt-0.5 font-bold text-[#0f172a]">
                {activePrefectureCount}<span className="ml-1 font-normal text-[#94a3b8]">/47</span>
              </p>
            </div>
            <div
              className="absolute inset-0 origin-center map-scale-wrapper-v2"
              style={{ transform: "scale(1.05) translateX(-4%) translateY(-2%)" }}
            >
              <JapanNetworkMap />
            </div>
            <style>{`
              @media (min-width: 1280px) {
                .map-scale-wrapper-v2 {
                  transform: scale(0.95) translateX(-3%) translateY(-2%) !important;
                }
              }
              @media (min-width: 1536px) {
                .map-scale-wrapper-v2 {
                  transform: scale(0.9) translateX(-2%) translateY(-1%) !important;
                }
              }
              @media (min-width: 1920px) {
                .map-scale-wrapper-v2 {
                  transform: scale(0.86) translateX(-1%) translateY(0%) !important;
                }
              }
            `}</style>
          </motion.div>
        </div>

        {/* ── 横スクロール速報バー ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.25 }}
          className="mx-4 mt-4 flex items-center gap-3 rounded-2xl border border-blue-100 bg-white/80 px-3 py-2.5 shadow-sm backdrop-blur-xl lg:mx-8 2xl:mx-16"
        >
          {/* ラベル */}
          <div className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-[#0B4F8A] px-3 py-1.5 text-xs font-bold text-white">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-300 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-blue-200" />
            </span>
            <span className="hidden sm:inline">最新速報</span>
            <span className="sm:hidden">速報</span>
          </div>

          {/* スクロールエリア */}
          <div className="flex-1 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <AnimatePresence mode="wait">
              {liveItems.length === 0 ? (
                <div key="skeleton" className="flex min-w-max gap-3 py-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-7 w-48 animate-pulse rounded-full bg-slate-100"
                    />
                  ))}
                </div>
              ) : (
                <motion.div
                  key="items"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="flex min-w-max gap-3 py-0.5"
                >
                  {liveItems.slice(0, 12).map((item) => (
                    <Link
                      key={item.id}
                      href={`/subsidies/list/${item.id}`}
                      className="group inline-flex max-w-[360px] items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 shadow-sm transition hover:border-blue-200 hover:shadow-md"
                    >
                      <span className="shrink-0 rounded bg-[#2563eb] px-1.5 py-0.5 text-[10px] font-bold text-white">
                        受付中
                      </span>
                      <span className="shrink-0 text-[11px] text-slate-400">{item.area}</span>
                      <span className="max-w-[200px] truncate font-semibold text-slate-900 sm:max-w-[220px]">
                        {item.title}
                      </span>
                      <span className="shrink-0 font-mono text-[11px] text-slate-400">
                        {item.minutesAgo !== null
                          ? formatElapsed(item.minutesAgo + tick)
                          : "—"}
                      </span>
                      <ArrowRight className="h-3 w-3 shrink-0 text-slate-300 transition group-hover:text-blue-400" />
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* もっと見る */}
          <Link
            href="/subsidies/list?sort=newest"
            className="shrink-0 text-xs font-bold text-blue-600 hover:underline"
          >
            もっと見る →
          </Link>
        </motion.div>

        {/* ── 3機能カード ── */}
        <div className="mt-4 grid gap-3 px-4 pb-4 md:grid-cols-3 lg:mx-8 lg:px-0 2xl:mx-16">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 + i * 0.07, ease: EASE }}
            >
              <Link
                href={f.href}
                className="group flex h-full min-h-[112px] flex-col rounded-[18px] border border-white/50 bg-white/75 p-3.5 shadow-md shadow-slate-200/20 backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-white hover:shadow-lg"
              >
                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100/60 text-[#2563eb] transition group-hover:bg-blue-100">
                  {f.icon}
                </div>
                <h3 className="mb-1 text-sm font-bold text-[#0f172a]">{f.title}</h3>
                <p className="flex-1 text-xs leading-relaxed text-[#475569]">{f.desc}</p>
                <p className="mt-1.5 text-[11px] font-semibold text-blue-500 transition group-hover:underline">
                  確認する →
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}

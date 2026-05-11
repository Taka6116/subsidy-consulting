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

// 特徴カード（リンク付き）
const FEATURES = [
  {
    title: "公開直後に検知",
    desc: "全国の補助金をAIが24時間クロール。最新情報を即座に一覧で確認できます。",
    href: "/subsidies/list?sort=newest",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9Z" /><path d="M10 21a2 2 0 0 0 4 0" />
      </svg>
    ),
  },
  {
    title: "即座にコンテンツ化",
    desc: "制度ごとの解説記事・活用ガイドを確認。申請前の情報収集をまとめて行えます。",
    href: "/subsidies/articles",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M14 3 4 14h6l-1 7 10-11h-6l1-7Z" />
      </svg>
    ),
  },
  {
    title: "最速でユーザーへ",
    desc: "気になる補助金が見つかったら、専門家へ無料で相談できます。",
    href: "/consult",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
];

export default function SubsidyHeroV2({ counts, activePrefectureCount }: { counts: Counts; activePrefectureCount: number }) {
  const [liveItems, setLiveItems] = useState<LiveItem[]>([]);
  useEffect(() => {
    fetch("/api/subsidies/hero-live")
      .then((r) => r.json())
      .then((data) => { if (data.items?.length) setLiveItems(data.items); })
      .catch(() => {});
  }, []);

  const [visibleStart, setVisibleStart] = useState(0);
  useEffect(() => {
    if (liveItems.length === 0) return;
    const timer = setInterval(() => {
      setVisibleStart((prev) => (prev + 1) % liveItems.length);
    }, 10000);
    return () => clearInterval(timer);
  }, [liveItems]);

  const [tick, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(timer);
  }, []);

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

  const visibleItems = liveItems.length > 0
    ? Array.from({ length: Math.min(4, liveItems.length) }, (_, i) =>
        liveItems[(visibleStart + i) % liveItems.length]
      )
    : null;

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
      <div className="pointer-events-none absolute -bottom-28 right-[4%] h-[400px] w-[400px] rounded-full bg-cyan-200/20 blur-[120px]" />

      {/* ══ HERO ══ */}
      <section className="relative z-10 w-full pb-10 pt-20 md:pt-22 lg:pt-16 2xl:pb-20">
        <div className="grid items-center gap-6 lg:grid-cols-[0.9fr_2.6fr_296px] lg:gap-8 2xl:grid-cols-[1fr_2.6fr_320px] 2xl:gap-6">

          {/* ── 左：コピー ── */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: EASE }}
            className="flex flex-col px-4 lg:pl-8 lg:-mt-10 2xl:pl-16"
          >
            {/* タグ */}
            <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
              </span>
              全国の補助金をAIがリアルタイム解析
            </div>

            {/* キャッチコピー */}
            <h1
              className="font-heading font-black leading-[1.1] tracking-[-0.02em] text-[#0f172a]"
              style={{ fontSize: "clamp(2.2rem, 3.5vw, 4rem)" }}
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

            <p className="mt-4 text-base leading-relaxed text-[#475569]">
              全国の自治体・省庁サイトをAIが24時間クロール。
              <br />
              受付中の補助金を、業種・地域・締切から探せます。
            </p>

            {/* 主CTA・副CTA */}
            <div className="mt-6 flex w-full flex-col gap-3 sm:flex-row">
              <Link
                href="/subsidies/list"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2563eb] px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-px hover:bg-blue-600 hover:shadow-xl sm:w-auto"
              >
                <Search className="h-4 w-4" />
                使える補助金を探す
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/consult"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-7 py-3.5 text-sm font-bold text-[#0f172a] shadow-sm transition-all hover:-translate-y-px hover:border-blue-300 hover:shadow-md sm:w-auto"
              >
                <MessageCircle className="h-4 w-4" />
                無料相談する
              </Link>
            </div>

            {/* 補助リンク */}
            <div className="mt-3">
              <Link
                href="/subsidies/articles"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#2563eb] hover:underline"
              >
                <FileText className="h-3.5 w-3.5" />
                最新記事を見る →
              </Link>
            </div>

            {/* 統計バッジ */}
            <div ref={badgeRef} className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700">
                掲載補助金 {displayCounts.grants.toLocaleString()} 件
              </span>
              <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700">
                解説記事 {displayCounts.articles.toLocaleString()} 本
              </span>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
                動画 {displayCounts.videos.toLocaleString()} 本
              </span>
            </div>
          </motion.div>

          {/* ── 中央：日本地図 ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.1 }}
            className="relative hidden h-[440px] overflow-visible md:block md:h-[500px] lg:h-[560px] xl:h-[600px] 2xl:h-[740px]"
          >
            <div className="absolute -left-8 top-4 z-10 rounded-2xl border border-[#dbe4f0] bg-white/90 px-4 py-2.5 text-xs shadow-sm backdrop-blur">
              <p className="font-mono text-[#94a3b8]">補助金公募中都道府県</p>
              <p className="mt-0.5 font-bold text-[#0f172a]">
                {activePrefectureCount}<span className="ml-1 font-normal text-[#94a3b8]">/47</span>
              </p>
            </div>
            <div
              className="absolute inset-0 origin-center map-scale-wrapper-v2"
              style={{ transform: "scale(1.3) translateX(-8%)" }}
            >
              <JapanNetworkMap />
            </div>
            <style>{`
              @media (min-width: 1280px) {
                .map-scale-wrapper-v2 { transform: scale(1.05) translateX(-7%) translateY(4%) !important; }
              }
              @media (min-width: 1536px) {
                .map-scale-wrapper-v2 { transform: scale(0.95) translateX(-5%) translateY(5%) !important; }
              }
              @media (min-width: 1920px) {
                .map-scale-wrapper-v2 { transform: scale(0.88) translateX(-4%) translateY(6%) !important; }
              }
            `}</style>
          </motion.div>

          {/* ── 右：リアルタイム検知（内部回遊カード） ── */}
          <motion.aside
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.75, ease: EASE, delay: 0.15 }}
            className="mx-4 rounded-[28px] border border-[#dbe4f0] bg-white/90 p-5 shadow-xl shadow-slate-200/60 backdrop-blur-xl md:mx-0 2xl:mr-10"
            aria-label="リアルタイム検知"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-base font-bold text-[#0f172a]">リアルタイム検知</h2>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-600">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>
                LIVE
              </span>
            </div>

            <AnimatePresence mode="wait">
              {visibleItems === null ? (
                <ul key="skeleton" className="space-y-2.5 overflow-hidden">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <li key={i} className="animate-pulse rounded-2xl border border-[#dbe4f0] bg-white p-3.5">
                      <div className="mb-2 h-3 w-1/2 rounded bg-slate-100" />
                      <div className="h-4 w-3/4 rounded bg-slate-100" />
                      <div className="mt-2 h-2.5 w-1/4 rounded bg-slate-100" />
                    </li>
                  ))}
                </ul>
              ) : (
                <motion.ul
                  key={`live-${visibleStart}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.65, ease: EASE }}
                  className="space-y-2.5 overflow-hidden"
                >
                  {visibleItems.map((item, i) => (
                    <li
                      key={`${item.id}-${i}`}
                      className={`group rounded-2xl border border-[#dbe4f0] bg-white p-3.5 transition hover:border-blue-200 hover:shadow-md${i === 3 ? " hidden 2xl:block" : ""}`}
                    >
                      <Link
                        href={`/subsidies/list/${item.id}`}
                        className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
                      >
                        <div className="mb-1.5 flex items-center gap-2">
                          <span className="rounded-md bg-[#2563eb] px-1.5 py-0.5 text-[10px] font-bold text-white">
                            受付中
                          </span>
                          <p className="text-xs font-semibold text-[#475569]">{item.area}</p>
                          <span className="ml-auto text-[#cbd5e1] transition group-hover:text-blue-400">›</span>
                        </div>
                        <p className="text-sm font-semibold leading-snug text-[#0f172a]">{item.title}</p>
                        <p className="mt-1.5 font-mono text-[11px] text-[#94a3b8]">
                          {item.minutesAgo !== null
                            ? `公開 ${formatElapsed(item.minutesAgo + tick)}`
                            : "公開情報あり"}
                        </p>
                        <p className="mt-1.5 text-[11px] font-semibold text-blue-500">
                          詳細を見る →
                        </p>
                      </Link>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>

            <Link
              href="/subsidies/list?sort=newest"
              className="mt-4 flex w-full items-center justify-center rounded-2xl border border-[#dbe4f0] py-2.5 text-sm font-semibold text-[#475569] transition hover:border-blue-200 hover:text-blue-600"
            >
              もっと見る →
            </Link>
          </motion.aside>
        </div>

        {/* ── 3特徴カード（クリック可能） ── */}
        <div className="relative z-10 mt-6 grid gap-3 px-4 md:grid-cols-3 lg:-mt-24 lg:pr-80 lg:pl-6 lg:px-0 2xl:-mt-24 2xl:pl-16 2xl:pr-[368px]">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: EASE }}
            >
              <Link
                href={f.href}
                className="group flex h-full flex-col rounded-[20px] border border-white/40 bg-white/70 p-4 shadow-md shadow-slate-200/20 backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-white hover:shadow-lg"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100/60 text-[#2563eb] transition group-hover:bg-blue-100">
                  {f.icon}
                </div>
                <h3 className="mb-1 text-sm font-bold text-[#0f172a]">{f.title}</h3>
                <p className="flex-1 text-xs leading-relaxed text-[#475569]">{f.desc}</p>
                <p className="mt-2 text-[11px] font-semibold text-blue-500 transition group-hover:underline">
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

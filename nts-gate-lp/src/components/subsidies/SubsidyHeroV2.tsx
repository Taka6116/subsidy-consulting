"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, type Easing } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Search, MessageCircle, FileText, Bell, Zap, Target } from "lucide-react";

const EASE: Easing = [0.22, 1, 0.36, 1];

type Counts = { grants: number; articles: number; videos: number; lps: number };
type LiveItem = { id: string; title: string; area: string; minutesAgo: number | null };

const FEATURES = [
  {
    title: "公開直後に検知",
    desc: "全国補助金をAIが24h収集。最新情報を即座に確認。",
    href: "/subsidies/list?sort=newest",
    icon: <Bell className="h-6 w-6" />,
  },
  {
    title: "即座にコンテンツ化",
    desc: "解説記事・活用ガイドで申請前の情報収集をまとめて。",
    href: "/subsidies/articles",
    icon: <Zap className="h-6 w-6" />,
  },
  {
    title: "最速でユーザーへ",
    desc: "気になる補助金は専門家へ無料相談。申請前に整理。",
    href: "/consult",
    icon: <Target className="h-6 w-6" />,
  },
];

/** アイテム1個分のチップ幅の概算（px）— marquee 速度計算用 */
const CHIP_WIDTH_APPROX = 340;

export default function SubsidyHeroV2({
  counts,
  activePrefectureCount,
}: {
  counts: Counts;
  activePrefectureCount: number;
}) {
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

  // marquee: アイテムを2重にして無限ループ
  const marqueeItems = liveItems.length > 0 ? [...liveItems, ...liveItems] : null;
  const trackWidth =
    liveItems.length > 0
      ? liveItems.length * CHIP_WIDTH_APPROX + liveItems.length * 12
      : 4000;
  const marqueeSpeed = Math.max(20, Math.round(trackWidth / 200));

  return (
    <div
      className="relative overflow-hidden"
      style={{
        background:
          "radial-gradient(circle at 63% 44%, rgba(85,164,244,0.26), transparent 34%), linear-gradient(90deg, #f8fbff 0%, #f5fbff 38%, #e9f5ff 100%)",
      }}
    >
      {/* 背景画像（最背面） */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <Image
          src="/images/hero-digital-platform.png"
          alt=""
          fill
          priority
          aria-hidden
          className="object-cover object-right"
        />
        {/* 左→右グラデーションオーバーレイ（画像を馴染ませる） */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgba(248,251,255,0.97) 0%, rgba(248,251,255,0.88) 30%, rgba(248,251,255,0.55) 55%, rgba(248,251,255,0.18) 78%, transparent 100%)",
          }}
        />
      </div>

      {/* dot grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          backgroundImage: "radial-gradient(#bad8f2 1px, transparent 1px)",
          backgroundSize: "22px 22px",
          opacity: 0.26,
        }}
      />

      {/* ══ HERO SECTION ══ */}
      <section
        className="relative z-10 w-full px-[clamp(1.75rem,3.4vw,4rem)] pt-10 pb-4 lg:pt-16 2xl:pt-10"
        aria-labelledby="hero-title"
      >
        {/* ── 3カラムグリッド ── */}
        <div
          ref={badgeRef}
          className="mx-auto grid items-center gap-[clamp(1.25rem,2.8vw,3rem)]"
          style={{
            maxWidth: "1840px",
            minHeight: "clamp(560px, 35vw, 650px)",
            gridTemplateColumns: "minmax(410px, 540px) minmax(520px, 1fr) minmax(170px, 210px)",
          }}
        >
          {/* ── 左：コピー ── */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: EASE }}
            className="relative z-10 max-w-[540px] pb-6"
            style={{ background: "linear-gradient(to right, #f8fbff 60%, rgba(248,251,255,0.0) 100%)" }}
          >
            {/* eyebrow */}
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/86 px-[18px] py-0 text-sm font-black tracking-wide text-blue-700"
              style={{ height: "42px" }}
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-blue-500" />
              </span>
              全国の補助金を最速告知
            </div>

            {/* h1 */}
            <h1
              id="hero-title"
              className="font-heading font-black leading-[1.14] tracking-[0] text-[#101827]"
              style={{ fontSize: "clamp(2.875rem, 4.1vw, 4.5rem)", margin: "30px 0 26px" }}
            >
              <span className="block whitespace-nowrap">補助金情報を、</span>
              <span className="block whitespace-nowrap">探す時代を終わらせ</span>
              <span className="block whitespace-nowrap">
                <span
                  style={{
                    color: "#14b8e6",
                  }}
                >
                  &ldquo;最速&rdquo;
                </span>
                で届ける
              </span>
            </h1>

            {/* lead */}
            <p
              className="font-semibold leading-[1.95] text-[#536174]"
              style={{ maxWidth: "570px", marginBottom: "34px", fontSize: "clamp(1rem, 1.1vw, 1.1875rem)" }}
            >
              全国の自治体・省庁サイトをAIが24時間クロール。受付中の補助金を、業種・地域・締切から確認できます。
            </p>

            {/* CTAs */}
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <Link
                href="/subsidies/list"
                className="inline-flex min-h-[54px] min-w-[230px] items-center justify-center gap-2.5 rounded-[14px] px-6 text-base font-black text-white transition-all hover:-translate-y-px"
                style={{
                  background: "linear-gradient(135deg, #2463eb, #1f6bf0)",
                  boxShadow: "0 16px 30px rgba(37,99,235,0.24)",
                }}
              >
                <Search className="h-5 w-5" strokeWidth={2.4} />
                使える補助金を探す
              </Link>
              <Link
                href="/consult"
                className="inline-flex min-h-[54px] min-w-[168px] items-center justify-center gap-2.5 rounded-[14px] border border-[#c7d6e7] px-6 text-base font-black text-[#111827] transition-all hover:-translate-y-px"
                style={{
                  background: "rgba(255,255,255,0.9)",
                  boxShadow: "0 10px 26px rgba(15,49,96,0.08)",
                }}
              >
                <MessageCircle className="h-5 w-5" strokeWidth={2.4} />
                無料相談する
              </Link>
            </div>

            {/* text link */}
            <Link
              href="/subsidies/articles"
              className="inline-flex min-h-[34px] items-center gap-2 text-sm font-black text-[#1d5fe8]"
            >
              <FileText className="h-4 w-4" />
              最新記事を見る →
            </Link>
          </motion.div>

          {/* ── 中央：ビジュアルゾーン ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}
            className="relative hidden min-h-[520px] self-stretch lg:block"
            aria-label="最新補助金情報のイメージ"
          >
            {/* glow */}
            <div
              className="absolute rounded-[28px]"
              style={{
                inset: "0 -40px 0 -70px",
                background:
                  "linear-gradient(90deg, rgba(248,251,255,0.96) 0%, rgba(248,251,255,0.56) 20%, rgba(143,201,255,0.13) 44%, rgba(27,116,220,0.17) 100%), radial-gradient(circle at 78% 40%, rgba(34,211,238,0.42), transparent 28%), radial-gradient(circle at 58% 22%, rgba(37,99,235,0.16), transparent 23%)",
              }}
            />
            {/* orbit rings */}
            <div
              className="absolute rounded-full"
              style={{
                width: "520px",
                height: "520px",
                right: "36px",
                top: "4px",
                border: "1px solid rgba(37,99,235,0.18)",
              }}
            >
              <div
                className="absolute rounded-full"
                style={{ inset: "58px", border: "1px solid rgba(20,184,230,0.22)" }}
              />
              <div
                className="absolute rounded-full"
                style={{ inset: "118px", border: "1px solid rgba(20,184,230,0.22)" }}
              />
            </div>

            {/* mini pills */}
            <div
              className="absolute inline-flex items-center gap-2 rounded-full border border-[rgba(195,219,244,0.8)] bg-white/76 px-3.5 text-xs font-black text-[#30609f] backdrop-blur-md"
              style={{ height: "38px", top: "18px", right: "232px", boxShadow: "0 10px 24px rgba(15,49,96,0.08)" }}
            >
              <span className="h-2 w-2 rounded-full bg-[#10b981]" />
              24時間クロール
            </div>
            <div
              className="absolute inline-flex items-center gap-2 rounded-full border border-[rgba(195,219,244,0.8)] bg-white/76 px-3.5 text-xs font-black text-[#30609f] backdrop-blur-md"
              style={{ height: "38px", bottom: "20px", right: "198px", boxShadow: "0 10px 24px rgba(15,49,96,0.08)" }}
            >
              <span className="h-2 w-2 rounded-full bg-[#10b981]" />
              最新情報を整理
            </div>

            {/* data-card A */}
            <div
              className="absolute grid gap-2.5 rounded-[18px] border border-[rgba(195,219,244,0.8)] bg-white/84 p-4 backdrop-blur-md"
              style={{ top: "42px", left: "22px", width: "250px", boxShadow: "0 20px 45px rgba(15,49,96,0.12),0 4px 14px rgba(15,49,96,0.06)" }}
            >
              <strong className="text-[15px] text-[#1a2a44]">新着通知</strong>
              <span className="block h-2.5 w-[170px] rounded-full" style={{ background: "linear-gradient(90deg,#c8dbf4,#eef5ff)" }} />
              <span className="block h-2.5 w-[112px] rounded-full" style={{ background: "linear-gradient(90deg,#c8dbf4,#eef5ff)" }} />
            </div>

            {/* data-card B */}
            <div
              className="absolute grid gap-2.5 rounded-[18px] border border-[rgba(195,219,244,0.8)] bg-white/84 p-4 backdrop-blur-md"
              style={{ top: "168px", right: "86px", width: "285px", boxShadow: "0 20px 45px rgba(15,49,96,0.12),0 4px 14px rgba(15,49,96,0.06)" }}
            >
              <strong className="text-[15px] text-[#1a2a44]">受付中の補助金</strong>
              <span className="block h-4 w-[52px] rounded-md bg-[#d9f8f3]" />
              <span className="block h-2.5 w-[170px] rounded-full" style={{ background: "linear-gradient(90deg,#c8dbf4,#eef5ff)" }} />
              <span className="block h-2.5 w-[112px] rounded-full" style={{ background: "linear-gradient(90deg,#c8dbf4,#eef5ff)" }} />
            </div>

            {/* data-card C */}
            <div
              className="absolute grid min-h-[138px] gap-2.5 rounded-[18px] border border-[rgba(195,219,244,0.8)] bg-white/84 p-4 backdrop-blur-md"
              style={{ left: "172px", bottom: "66px", width: "500px", boxShadow: "0 20px 45px rgba(15,49,96,0.12),0 4px 14px rgba(15,49,96,0.06)" }}
            >
              <strong className="text-[15px] text-[#1a2a44]">制度情報を、ユーザーが探せる形へ</strong>
              <span className="block h-2.5 w-[360px] rounded-full" style={{ background: "linear-gradient(90deg,#c8dbf4,#eef5ff)" }} />
              <span className="block h-2.5 w-[210px] rounded-full" style={{ background: "linear-gradient(90deg,#8dbcf6 0 42%,#eef5ff 42% 100%)" }} />
              <span className="block h-2.5 w-[112px] rounded-full" style={{ background: "linear-gradient(90deg,#c8dbf4,#eef5ff)" }} />
            </div>
          </motion.div>

          {/* ── 右：統計カード ── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
            className="relative z-10 hidden grid-cols-1 justify-self-end lg:grid"
            style={{ gap: "14px", width: "min(100%, 205px)" }}
          >
            {[
              { label: "掲載補助金", value: displayCounts.grants.toLocaleString(), unit: "件" },
              { label: "解説記事",   value: displayCounts.articles.toLocaleString(), unit: "本" },
              { label: "対応都道府県", value: activePrefectureCount, unit: "/ 47" },
            ].map((s) => (
              <div
                key={s.label}
                className="flex flex-col justify-center gap-2 rounded-2xl border border-[rgba(195,219,244,0.86)] bg-white px-[18px]"
                style={{ minHeight: "96px", padding: "18px", boxShadow: "0 20px 45px rgba(15,49,96,0.12),0 4px 14px rgba(15,49,96,0.06)" }}
              >
                <p className="text-xs font-black text-[#8ba1b8]">{s.label}</p>
                <p className="text-[27px] font-black leading-none text-[#101827]">
                  {s.value}
                  <small className="ml-1 text-sm font-bold text-[#8ba1b8]">{s.unit}</small>
                </p>
              </div>
            ))}
            <Link
              href="/subsidies/list?sort=newest"
              className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-[14px] border border-[#afd2ff] bg-[#e8f3ff] text-sm font-black text-[#2563eb] transition hover:bg-blue-100"
              style={{ boxShadow: "0 10px 24px rgba(37,99,235,0.12)" }}
            >
              最新を見る <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>

        {/* ── 横スクロール速報バー（CSS marquee）── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.25 }}
          className="mx-auto mt-[-2px] grid items-center gap-[18px] rounded-[18px] border border-[#cfe2f7] bg-white/90 px-[18px] py-3 backdrop-blur-[10px]"
          style={{
            maxWidth: "1840px",
            minHeight: "70px",
            gridTemplateColumns: "auto minmax(0,1fr) auto",
            boxShadow: "0 14px 30px rgba(15,49,96,0.08)",
          }}
          aria-label="最新速報"
        >
          {/* ラベル */}
          <div
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#155c9f] px-[15px] text-sm font-black text-white"
            style={{ height: "38px" }}
          >
            <span className="h-2 w-2 rounded-full bg-[#8ed4ff]" />
            <span className="hidden sm:inline">最新速報</span>
            <span className="sm:hidden">速報</span>
          </div>

          {/* marquee スクロールエリア */}
          <div className="relative min-w-0 overflow-hidden">
            <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-8 bg-gradient-to-r from-white/80 to-transparent" />
            <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-8 bg-gradient-to-l from-white/80 to-transparent" />

            <AnimatePresence mode="wait">
              {marqueeItems === null ? (
                <div key="skeleton" className="flex gap-3 py-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-[42px] w-48 animate-pulse rounded-full bg-slate-100" />
                  ))}
                </div>
              ) : (
                <motion.div
                  key="marquee"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className="marquee-track flex gap-[14px] py-0.5"
                  style={
                    {
                      "--marquee-duration": `${marqueeSpeed}s`,
                      "--marquee-width": `${trackWidth}px`,
                    } as React.CSSProperties
                  }
                >
                  {marqueeItems.map((item, idx) => (
                    <Link
                      key={`${item.id}-${idx}`}
                      href={`/subsidies/list/${item.id}`}
                      className="group inline-flex h-[42px] shrink-0 max-w-[340px] items-center gap-2.5 rounded-full border border-[#d9e7f6] bg-white px-3.5 text-sm font-black text-[#26344a] transition hover:border-blue-200 hover:shadow-md"
                    >
                      <span className="shrink-0 inline-flex h-6 items-center rounded-[7px] bg-[#276cf2] px-2.5 text-xs text-white">
                        受付中
                      </span>
                      <span className="shrink-0 text-xs text-[#9aa8ba]">{item.area}</span>
                      <span className="max-w-[180px] truncate">{item.title}</span>
                      <span className="shrink-0 font-mono text-xs text-slate-400">
                        {item.minutesAgo !== null ? formatElapsed(item.minutesAgo + tick) : "—"}
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
            className="z-10 shrink-0 text-sm font-black text-[#1d5fe8] hover:underline"
          >
            もっと見る →
          </Link>
        </motion.div>

        {/* ── 3機能カード (proof-cards) ── */}
        <div
          className="mx-auto mt-[22px] grid gap-[18px] pb-4"
          style={{ maxWidth: "1840px", gridTemplateColumns: "repeat(3,1fr)" }}
        >
          {FEATURES.map((f, i) => (
            <motion.article
              key={f.title}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 + i * 0.07, ease: EASE }}
              className="grid min-h-[126px] rounded-[18px] border border-[rgba(222,232,244,0.9)] bg-white p-6"
              style={{
                gridTemplateColumns: "50px 1fr",
                gap: "16px",
                boxShadow: "0 10px 26px rgba(15,49,96,0.06)",
              }}
            >
              <div
                className="grid h-[50px] w-[50px] place-items-center rounded-[14px] bg-[#e8f1ff] text-[#2563eb]"
              >
                {f.icon}
              </div>
              <div>
                <h3 className="mb-2.5 text-lg font-black leading-[1.4] text-[#101827]">{f.title}</h3>
                <p className="m-0 text-sm font-semibold leading-[1.8] text-[#66758a]">{f.desc}</p>
                <Link
                  href={f.href}
                  className="mt-3 inline-flex text-[13px] font-black text-[#2563eb] hover:underline"
                >
                  確認する →
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* ── CSS アニメーション (marquee) ── */}
      <style>{`
        @keyframes marquee-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(calc(-1 * var(--marquee-width) / 2 - 7px)); }
        }
        .marquee-track {
          animation: marquee-scroll var(--marquee-duration, 30s) linear infinite;
          will-change: transform;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}

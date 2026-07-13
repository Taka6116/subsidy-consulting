"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, type Easing } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  FileText,
  Newspaper,
  Play,
  PlaySquare,
} from "lucide-react";
import type {
  TopArticleItem,
  TopGuideItem,
  TopLiveItem,
  TopVideoItem,
} from "@/lib/subsidies/topPageContent";

const EASE: Easing = [0.22, 1, 0.36, 1];

function formatDuration(sec: number | null): string {
  if (!sec) return "";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${`${s}`.padStart(2, "0")}`;
}

function formatElapsed(totalMinutes: number): string {
  if (totalMinutes < 60) return `${totalMinutes}分前`;
  const hours = Math.floor(totalMinutes / 60);
  if (hours < 24) return `${hours}時間前`;
  const days = Math.floor(hours / 24);
  const remainHours = hours % 24;
  return remainHours === 0 ? `${days}日前` : `${days}日${remainHours}時間前`;
}

const GUIDE_ICON_STYLES = [
  { bg: "bg-emerald-50", text: "text-emerald-600" },
  { bg: "bg-amber-50", text: "text-amber-600" },
  { bg: "bg-rose-50", text: "text-rose-500" },
];

function CardHeader({
  icon,
  title,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  href: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-[15px] font-black text-[#12233d]">
        <span className="text-[#1d5fe8]">{icon}</span>
        {title}
      </div>
      <Link
        href={href}
        className="inline-flex items-center gap-0.5 text-xs font-bold text-[#1d5fe8] hover:underline"
      >
        すべて見る
        <ChevronRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

function MoreLink({ href }: { href: string }) {
  return (
    <div className="mt-auto pt-3 text-right">
      <Link
        href={href}
        className="text-xs font-bold text-[#1d5fe8] hover:underline"
      >
        もっと見る →
      </Link>
    </div>
  );
}

export default function SubsidyHeroV3({
  articles,
  videos,
  guides,
  liveItems,
}: {
  articles: TopArticleItem[];
  videos: TopVideoItem[];
  guides: TopGuideItem[];
  liveItems: TopLiveItem[];
}) {
  const featuredVideo = videos[0] ?? null;
  const restVideos = videos.slice(1, 3);
  const tickerItems = liveItems.length > 0 ? [...liveItems, ...liveItems] : [];

  return (
    <div
      className="relative overflow-hidden"
      style={{
        background:
          "radial-gradient(circle at 76% 18%, rgba(133,190,248,0.18), transparent 34%), linear-gradient(115deg, #f8fbff 0%, #f3f9ff 46%, #eaf4ff 100%)",
      }}
    >
      <section
        className="relative z-10 mx-auto w-full max-w-[1560px] px-5 pb-5 pt-36 sm:px-8 sm:pt-24 lg:px-10 lg:pt-24"
        aria-labelledby="hero-title"
      >
        {/* ── 上段: コピー + チーム写真 ── */}
        <div className="grid items-stretch gap-6 lg:grid-cols-[minmax(380px,0.92fr)_minmax(0,1.35fr)] lg:gap-9">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="flex flex-col justify-center py-2"
          >
            <h1
              id="hero-title"
              className="font-heading font-black leading-[1.22] tracking-[-0.01em] text-[#0f2246]"
              style={{ fontSize: "clamp(2rem, 3.1vw, 3.1rem)" }}
            >
              <span className="block">補助金情報を、</span>
              <span className="block">探す時代を終わらせ</span>
              <span className="block">
                <span className="text-[#1d5fe8]">&ldquo;最速&rdquo;</span>
                で届ける
              </span>
            </h1>

            <p className="mt-5 max-w-[480px] text-[15px] font-semibold leading-8 text-[#51617a]">
              全国の自治体・省庁サイトの補助金情報をここに集約。
              <br className="hidden sm:block" />
              受付中の補助金を、業種・地域・締切から確認できます。
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href="/subsidies/list"
                className="inline-flex min-h-[52px] min-w-[210px] items-center justify-center gap-2 rounded-[13px] px-6 text-[15px] font-black text-white shadow-[0_14px_28px_rgba(11,78,162,0.22)] transition-all hover:-translate-y-px hover:brightness-110 [background:var(--nts-gradient-primary)]"
              >
                使える補助金を探す
              </Link>
              <Link
                href="/consult"
                className="inline-flex min-h-[52px] min-w-[170px] items-center justify-center rounded-[13px] px-6 text-[15px] font-black text-white shadow-[0_14px_28px_rgba(13,148,136,0.26)] transition-all hover:-translate-y-px hover:brightness-110 [background:var(--nts-gradient-check)]"
              >
                無料相談する
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
            className="relative min-h-[240px] overflow-hidden sm:min-h-[300px] lg:min-h-[360px]"
          >
            <Image
              src="/images/subsidies-top-hero-team.webp"
              alt="日本提携支援のサポートチーム"
              fill
              priority
              sizes="(max-width: 1023px) 100vw, 60vw"
              className="object-cover object-[center_30%] [mask-image:linear-gradient(90deg,transparent_0%,#000_13%,#000_92%,transparent_100%)] [-webkit-mask-image:linear-gradient(90deg,transparent_0%,#000_13%,#000_92%,transparent_100%)]"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(248,251,255,0)_72%,rgba(243,249,255,0.77)_100%)]"
            />
          </motion.div>
        </div>

        {/* ── 最新速報バー ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.3 }}
          className="mt-6 flex items-center gap-3 rounded-[16px] border border-[#cfe2f7] bg-white/92 px-4 py-3 shadow-[0_12px_28px_rgba(15,49,96,0.07)] backdrop-blur-sm"
          aria-label="最新速報"
        >
          <span className="inline-flex h-9 shrink-0 items-center gap-2 rounded-full px-4 text-[13px] font-black text-white shadow-sm [background:var(--nts-gradient-primary)]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#8ed4ff] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#8ed4ff]" />
            </span>
            最新速報
          </span>

          <div className="min-w-0 flex-1 overflow-hidden">
            <div className="top-live-ticker flex w-max gap-2.5">
            {tickerItems.map((item, index) => (
              <Link
                key={`${item.id}-${index}`}
                href={`/subsidies/list/${item.id}`}
                className="group inline-flex h-[38px] shrink-0 items-center gap-2 rounded-full border border-[#d9e7f6] bg-white px-3 text-[13px] font-bold text-[#26344a] transition hover:border-blue-200 hover:shadow-md"
              >
                <span className="inline-flex h-[22px] shrink-0 items-center rounded-md px-2 text-[11px] font-bold text-white [background:var(--nts-gradient-primary)]">
                  受付中
                </span>
                <span className="shrink-0 text-[11px] text-[#9aa8ba]">
                  {item.area}
                </span>
                <span className="max-w-[190px] truncate">{item.name}</span>
                {item.minutesAgo !== null && (
                  <span className="shrink-0 font-mono text-[11px] text-slate-400">
                    {formatElapsed(item.minutesAgo)}
                  </span>
                )}
                <ArrowRight className="h-3 w-3 shrink-0 text-slate-300 transition group-hover:text-blue-400" />
              </Link>
            ))}
            </div>
          </div>

          <Link
            href="/subsidies/list?sort=newest"
            className="hidden shrink-0 text-[13px] font-black text-[#1d5fe8] hover:underline sm:inline"
          >
            もっと見る →
          </Link>
        </motion.div>

        {/* ── 下段: 3カード ── */}
        <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-[1fr_1.08fr_1.08fr]">
          {/* 新着記事 */}
          <motion.article
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: EASE, delay: 0.18 }}
            className="flex flex-col rounded-[18px] border border-[#dbe7f5] bg-white/92 p-5 shadow-[0_14px_34px_rgba(15,49,96,0.09)] backdrop-blur-sm"
          >
            <CardHeader
              icon={<Newspaper className="h-[18px] w-[18px]" />}
              title="新着記事"
              href="/subsidies/articles"
            />
            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4">
              {articles.map((a) => (
                <Link
                  key={a.slug}
                  href={`/subsidies/articles/${a.slug}`}
                  className="group flex gap-2.5"
                >
                  <span className="relative h-[52px] w-[68px] shrink-0 overflow-hidden rounded-lg bg-[#eef4fb]">
                    <Image
                      src={a.imagePath}
                      alt=""
                      fill
                      sizes="68px"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </span>
                  <span className="min-w-0">
                    <span className="line-clamp-2 text-xs font-bold leading-[1.55] text-[#26344a] transition group-hover:text-[#1d5fe8]">
                      {a.title}
                    </span>
                    <span className="mt-1 block text-[10px] font-semibold text-[#93a3b8]">
                      {a.dateLabel}
                    </span>
                  </span>
                </Link>
              ))}
              {articles.length === 0 && (
                <p className="col-span-2 py-6 text-center text-xs text-[#93a3b8]">
                  記事を準備中です
                </p>
              )}
            </div>
            <MoreLink href="/subsidies/articles" />
          </motion.article>

          {/* 動画で学ぶ */}
          <motion.article
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: EASE, delay: 0.24 }}
            className="flex flex-col rounded-[18px] border border-[#dbe7f5] bg-white/92 p-5 shadow-[0_14px_34px_rgba(15,49,96,0.09)] backdrop-blur-sm"
          >
            <CardHeader
              icon={<PlaySquare className="h-[18px] w-[18px]" />}
              title="動画で学ぶ"
              href="/subsidies/videos"
            />
            {featuredVideo ? (
              <>
                <Link
                  href={`/subsidies/videos/${featuredVideo.slug}`}
                  className="group mt-4 block"
                >
                  <span className="relative block aspect-[16/8.4] overflow-hidden rounded-xl bg-gradient-to-br from-[#12325e] to-[#0b1f3d]">
                    {featuredVideo.thumbnailPath && (
                      <Image
                        src={featuredVideo.thumbnailPath}
                        alt=""
                        fill
                        sizes="(max-width: 767px) 100vw, 32vw"
                        className="object-cover opacity-90 transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                    )}
                    <span className="absolute left-2.5 top-2.5 rounded-md bg-[#1d5fe8] px-2 py-0.5 text-[10px] font-black text-white">
                      おすすめ
                    </span>
                    <span className="absolute inset-0 grid place-items-center">
                      <span className="grid h-12 w-12 place-items-center rounded-full bg-white/25 backdrop-blur-sm transition group-hover:scale-105">
                        <Play className="h-5 w-5 fill-white text-white" />
                      </span>
                    </span>
                    {featuredVideo.durationSec && (
                      <span className="absolute bottom-2 right-2.5 rounded-md bg-black/65 px-1.5 py-0.5 font-mono text-[11px] font-bold text-white">
                        {formatDuration(featuredVideo.durationSec)}
                      </span>
                    )}
                  </span>
                  <span className="mt-2.5 line-clamp-2 block text-[13px] font-bold leading-[1.6] text-[#26344a] transition group-hover:text-[#1d5fe8]">
                    {featuredVideo.title}
                  </span>
                </Link>
                <ul className="mt-3 space-y-2">
                  {restVideos.map((v) => (
                    <li key={v.slug}>
                      <Link
                        href={`/subsidies/videos/${v.slug}`}
                        className="group flex items-center gap-2.5"
                      >
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-[#eaf1fb] text-[#1d5fe8]">
                          <Play className="h-3 w-3 fill-current" />
                        </span>
                        <span className="min-w-0 flex-1 truncate text-xs font-bold text-[#3d4e66] transition group-hover:text-[#1d5fe8]">
                          {v.title}
                        </span>
                        <span className="shrink-0 font-mono text-[11px] font-semibold text-[#93a3b8]">
                          {formatDuration(v.durationSec)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="py-10 text-center text-xs text-[#93a3b8]">
                動画を準備中です
              </p>
            )}
            <MoreLink href="/subsidies/videos" />
          </motion.article>

          {/* 人気ガイド・資料 */}
          <motion.article
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: EASE, delay: 0.3 }}
            className="flex flex-col rounded-[18px] border border-[#dbe7f5] bg-white/92 p-5 shadow-[0_14px_34px_rgba(15,49,96,0.09)] backdrop-blur-sm md:col-span-2 xl:col-span-1"
          >
            <CardHeader
              icon={<BookOpen className="h-[18px] w-[18px]" />}
              title="人気ガイド・資料"
              href="/subsidies/lp"
            />
            <ul className="mt-4 space-y-2.5">
              {guides.map((g, i) => {
                const style = GUIDE_ICON_STYLES[i % GUIDE_ICON_STYLES.length];
                return (
                  <li key={g.href}>
                    <Link
                      href={g.href}
                      className="group flex items-center gap-3 rounded-xl border border-transparent px-2 py-2 transition hover:border-[#dbe7f5] hover:bg-[#f7fafe]"
                    >
                      <span
                        className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${style.bg} ${style.text}`}
                      >
                        <FileText className="h-5 w-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="line-clamp-1 text-[13px] font-bold text-[#26344a] transition group-hover:text-[#1d5fe8]">
                          {g.title}
                        </span>
                        <span className="mt-0.5 line-clamp-1 block text-[11px] font-semibold text-[#93a3b8]">
                          {g.description}
                        </span>
                      </span>
                      <span className="inline-flex shrink-0 items-center rounded-md bg-[#eaf1fb] px-2 py-1 text-[10px] font-black text-[#1d5fe8]">
                        ガイド
                      </span>
                      <ChevronRight className="h-4 w-4 shrink-0 text-[#b6c4d6] transition group-hover:text-[#1d5fe8]" />
                    </Link>
                  </li>
                );
              })}
              {guides.length === 0 && (
                <li className="py-10 text-center text-xs text-[#93a3b8]">
                  ガイドを準備中です
                </li>
              )}
            </ul>
            <MoreLink href="/subsidies/lp" />
          </motion.article>
        </div>

      </section>
      <style>{`
        @keyframes top-live-ticker {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .top-live-ticker {
          animation: top-live-ticker ${Math.max(22, liveItems.length * 9)}s linear infinite;
          will-change: transform;
        }
        .top-live-ticker:hover {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .top-live-ticker { animation: none; }
        }
      `}</style>
    </div>
  );
}

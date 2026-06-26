"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import FilterBar, { type StatusTab } from "@/components/subsidies/FilterBar";
import VideosHero, { type HeroVideo } from "./VideosHero";
import VideosTicker from "./VideosTicker";

const ALL = "__all__";
const PAGE_SIZE = 12;
const DEADLINE_MAX = new Date("2050-01-01");

export type VideoCard = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  subsidyName: string;
  maxAmountLabel: string | null;
  deadlineLabel: string | null;
  deadlineIso: string | null;
  prefecture: string | null;
  tags: string[];
  duration: number | null;
  audioPath: string | null;
  videoPath: string | null;
  thumbnailPath: string | null;
};

function visibleTags(tags: string[]): string[] {
  return tags.filter((t) => t !== "お役立ち情報").slice(0, 3);
}

function formatDuration(sec: number | null): string {
  if (!sec) return "";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function isExpired(deadlineIso: string | null): boolean {
  if (!deadlineIso) return false;
  const d = new Date(deadlineIso);
  if (Number.isNaN(d.getTime()) || d > DEADLINE_MAX) return false;
  return d < new Date();
}

type TagOption = { label: string; count: number };

function buildTagOptions(videos: VideoCard[]): TagOption[] {
  const map = new Map<string, number>();
  for (const v of videos) {
    for (const t of v.tags) {
      if (t === "お役立ち情報") continue;
      map.set(t, (map.get(t) ?? 0) + 1);
    }
  }
  return [...map.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

export default function SubsidiesVideosIndex({
  videos,
  heroVideo: heroVideoProp,
}: {
  videos: VideoCard[];
  heroVideo?: HeroVideo | null;
}) {
  const [selectedTag, setSelectedTag] = useState<string>(ALL);
  const [showAllTags, setShowAllTags] = useState(false);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<StatusTab>("all");
  const [heroVideo, setHeroVideo] = useState<HeroVideo | null>(heroVideoProp ?? null);

  const tagOptions = useMemo(() => buildTagOptions(videos), [videos]);
  const TOP_TAG_COUNT = 10;
  const visibleTagOpts = useMemo(
    () => (showAllTags ? tagOptions : tagOptions.slice(0, TOP_TAG_COUNT)),
    [tagOptions, showAllTags],
  );
  const hiddenCount = tagOptions.length - TOP_TAG_COUNT;

  const counts = useMemo(
    () => ({
      all: videos.length,
      open: videos.filter((v) => !isExpired(v.deadlineIso)).length,
      closed: videos.filter((v) => isExpired(v.deadlineIso)).length,
    }),
    [videos],
  );

  const filtered: VideoCard[] = useMemo(() => {
    let list = videos;

    // タブフィルタ
    if (tab === "open") list = list.filter((v) => !isExpired(v.deadlineIso));
    else if (tab === "closed") list = list.filter((v) => isExpired(v.deadlineIso));

    // タグフィルタ
    if (selectedTag !== ALL) list = list.filter((v) => v.tags.includes(selectedTag));

    // キーワード検索
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (v) =>
          v.title.toLowerCase().includes(q) ||
          v.subsidyName.toLowerCase().includes(q) ||
          v.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }

    // 受付終了を末尾へ（同一ステータス内の順序は維持）
    list = [
      ...list.filter((v) => !isExpired(v.deadlineIso)),
      ...list.filter((v) => isExpired(v.deadlineIso)),
    ];

    return list;
  }, [videos, tab, selectedTag, query]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page],
  );

  function selectTag(tag: string) {
    setSelectedTag(tag);
    setPage(1);
  }

  return (
    <>
      {/* FVヒーロー */}
      <VideosHero heroVideo={heroVideo} />

      {/* ティッカー帯 */}
      <VideosTicker
        videos={videos.slice(0, 10)}
        activeVideoId={heroVideo?.videoPath ?? null}
        onVideoSelect={(v) =>
          setHeroVideo({ videoPath: v.videoPath!, title: v.title, duration: v.duration })
        }
      />

      {/* 一覧本体 */}
    <div id="video-list" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
      {/* タブ・検索バー */}
      <div className="mb-8">
        <FilterBar
          query={query}
          onQueryChange={(v) => { setQuery(v); setPage(1); }}
          tab={tab}
          onTabChange={(v) => { setTab(v); setPage(1); }}
          counts={counts}
          placeholder="補助金名・タグで検索"
        />
      </div>

      <div className="flex gap-8 lg:items-start">
        {/* メインコンテンツ */}
        <div className="min-w-0 flex-1">
          <p className="mb-4 text-sm text-neutral-500">
            <span className="font-semibold text-neutral-700">{filtered.length}</span> 件表示
          </p>

          {paginated.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl bg-white py-20 text-center shadow-sm ring-1 ring-neutral-200">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-50">
                <svg className="h-8 w-8 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.868V15.132a1 1 0 01-1.447.937L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-neutral-500">
                {query || tab !== "all" || selectedTag !== ALL
                  ? "条件に一致する動画が見つかりませんでした。"
                  : "動画は現在生成中です。しばらくお待ちください。"}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {paginated.map((v) => (
                <VideoCardItem key={v.id} video={v} />
              ))}
            </div>
          )}

          {/* ページネーション */}
          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-40"
              >
                前へ
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                    n === page
                      ? "bg-primary-700 text-white"
                      : "border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-40"
              >
                次へ
              </button>
            </div>
          )}
        </div>

        {/* サイドバー */}
        <aside className="hidden w-60 shrink-0 lg:block xl:w-64">
          <div className="sticky top-24 rounded-xl bg-white p-5 shadow-sm ring-1 ring-neutral-200">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-neutral-500">
              タグで絞り込む
            </p>
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => selectTag(ALL)}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                    selectedTag === ALL
                      ? "bg-primary-700 font-semibold text-white"
                      : "text-neutral-700 hover:bg-neutral-100"
                  }`}
                >
                  すべて
                  <span className="ml-1 text-xs opacity-60">({videos.length})</span>
                </button>
              </li>
              {visibleTagOpts.map((opt) => (
                <li key={opt.label}>
                  <button
                    onClick={() => selectTag(opt.label)}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                      selectedTag === opt.label
                        ? "bg-primary-700 font-semibold text-white"
                        : "text-neutral-700 hover:bg-neutral-100"
                    }`}
                  >
                    #{opt.label}
                    <span className="ml-1 text-xs opacity-60">({opt.count})</span>
                  </button>
                </li>
              ))}
            </ul>
            {tagOptions.length > TOP_TAG_COUNT && (
              <button
                onClick={() => setShowAllTags((v) => !v)}
                className="mt-2 w-full rounded-lg px-3 py-2 text-left text-xs text-primary-700 transition hover:bg-primary-50"
              >
                {showAllTags
                  ? "▲ 閉じる"
                  : `▼ もっと見る（${hiddenCount}個）`}
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
    </>
  );
}

function VideoCardItem({ video }: { video: VideoCard }) {
  const tags = visibleTags(video.tags);
  const dur = formatDuration(video.duration);
  const hasMedia = !!(video.audioPath || video.videoPath);
  const expired = isExpired(video.deadlineIso);

  return (
    <Link
      href={`/subsidies/videos/${video.slug}`}
      className={`group flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-neutral-200 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${expired ? "opacity-60 grayscale" : ""}`}
    >
      {/* サムネイル / プレースホルダー */}
      <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-primary-700 to-primary-900">
        {video.thumbnailPath ? (
          <Image
            src={video.thumbnailPath}
            alt={video.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center text-white/80">
            {hasMedia ? (
              <>
                <svg className="h-10 w-10 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
                <p className="mt-2 text-xs font-medium">音声解説</p>
              </>
            ) : (
              <>
                <div className="mb-2 h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                <p className="text-xs text-white/70">生成中...</p>
              </>
            )}
          </div>
        )}
        {/* 再生時間バッジ */}
        {dur && (
          <span className="absolute bottom-2 right-2 rounded bg-black/60 px-1.5 py-0.5 text-xs font-medium text-white">
            {dur}
          </span>
        )}
        {/* 受付終了バッジ */}
        {expired && (
          <span className="absolute left-2 top-2 rounded bg-black/60 px-2 py-0.5 text-xs font-medium text-white/80">
            受付終了
          </span>
        )}
        {/* 再生ボタンオーバーレイ */}
        {hasMedia && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
              <svg className="ml-1 h-5 w-5 text-primary-700" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* カード本文 */}
      <div className="flex flex-1 flex-col p-4">
        {/* タグ */}
        {tags.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1">
            {tags.map((t) => (
              <span
                key={t}
                className="rounded-full bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-700 ring-1 ring-primary-100"
              >
                #{t}
              </span>
            ))}
          </div>
        )}
        <h2 className="line-clamp-2 text-sm font-semibold leading-snug text-neutral-800 sm:text-base">
          {video.title}
        </h2>
        {video.subsidyName && (
          <p className="mt-1 line-clamp-1 text-xs text-neutral-500">{video.subsidyName}</p>
        )}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-1 pt-3">
          <div className="flex flex-col gap-0.5">
            {video.deadlineLabel ? (
              <span className={`text-xs ${expired ? "text-neutral-400 line-through" : "text-orange-600 font-medium"}`}>
                締切 {video.deadlineLabel}
              </span>
            ) : (
              <span className="text-xs text-neutral-400">締切 随時</span>
            )}
          </div>
          {video.maxAmountLabel && (
            <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
              {video.maxAmountLabel}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

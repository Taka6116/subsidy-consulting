"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const ALL = "__all__";
const PAGE_SIZE = 12;

export type VideoCard = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  subsidyName: string;
  maxAmountLabel: string | null;
  deadlineLabel: string | null;
  prefecture: string | null;
  tags: string[];
  duration: number | null;
  audioPath: string | null;
  videoPath: string | null;
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
}: {
  videos: VideoCard[];
}) {
  const [selectedTag, setSelectedTag] = useState<string>(ALL);
  const [showAllTags, setShowAllTags] = useState(false);
  const [page, setPage] = useState(1);

  const tagOptions = useMemo(() => buildTagOptions(videos), [videos]);
  const visibleTagOpts = useMemo(
    () => (showAllTags ? tagOptions : tagOptions.filter((o) => o.count >= 2)),
    [tagOptions, showAllTags],
  );
  const hiddenCount = tagOptions.length - visibleTagOpts.length;

  const filtered: VideoCard[] = useMemo(() => {
    if (selectedTag === ALL) return videos;
    return videos.filter((v) => v.tags.includes(selectedTag));
  }, [videos, selectedTag]);

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
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
      {/* ページヘッド */}
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent-600 sm:text-sm">
          Videos
        </p>
        <h1 className="font-heading mt-2 text-2xl font-bold text-primary-900 sm:text-3xl lg:text-4xl">
          補助金解説動画
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-neutral-600 sm:text-base">
          補助金の概要・活用例・申請ポイントをわかりやすく解説した音声付き動画です。
        </p>
      </div>

      <div className="flex gap-8 lg:items-start">
        {/* メインコンテンツ */}
        <div className="min-w-0 flex-1">
          {paginated.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl bg-white py-20 text-center shadow-sm ring-1 ring-neutral-200">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-50">
                <svg className="h-8 w-8 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.868V15.132a1 1 0 01-1.447.937L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-neutral-500">
                {selectedTag === ALL
                  ? "動画は現在生成中です。しばらくお待ちください。"
                  : "このタグの動画はまだありません。"}
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
            {hiddenCount > 0 && (
              <button
                onClick={() => setShowAllTags(true)}
                className="mt-2 w-full rounded-lg px-3 py-2 text-left text-xs text-primary-700 transition hover:bg-primary-50"
              >
                もっと見る（{hiddenCount}個）
              </button>
            )}
            {showAllTags && hiddenCount > 0 && (
              <button
                onClick={() => setShowAllTags(false)}
                className="mt-1 w-full rounded-lg px-3 py-2 text-left text-xs text-neutral-500 transition hover:bg-neutral-50"
              >
                閉じる
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function VideoCardItem({ video }: { video: VideoCard }) {
  const tags = visibleTags(video.tags);
  const dur = formatDuration(video.duration);
  const hasMedia = !!(video.audioPath || video.videoPath);

  return (
    <Link
      href={`/subsidies/videos/${video.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-neutral-200 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
    >
      {/* サムネイル / プレースホルダー */}
      <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-primary-700 to-primary-900">
        {video.videoPath ? (
          <video
            src={video.videoPath}
            className="h-full w-full object-cover"
            preload="none"
            muted
            playsInline
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
        {/* タイトル */}
        <h2 className="font-heading line-clamp-2 text-sm font-bold leading-snug text-neutral-900 group-hover:text-primary-700 sm:text-base">
          {video.title}
        </h2>
        {/* 補助金名 */}
        {video.subsidyName && (
          <p className="mt-1 line-clamp-1 text-xs text-neutral-500">{video.subsidyName}</p>
        )}
        {/* メタ情報 */}
        <div className="mt-auto flex items-center justify-between pt-3 text-xs text-neutral-400">
          <span>{video.publishedAt}</span>
          {video.maxAmountLabel && (
            <span className="font-medium text-accent-600">{video.maxAmountLabel}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

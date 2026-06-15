"use client";

import Link from "next/link";
import Image from "next/image";
import type { VideoCard } from "./SubsidiesVideosIndex";

function formatDuration(sec: number | null): string {
  if (!sec) return "";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function TickerCard({
  video,
  isActive,
  onSelect,
}: {
  video: VideoCard;
  isActive: boolean;
  onSelect?: (video: VideoCard) => void;
}) {
  const dur = formatDuration(video.duration);
  const category = video.tags.find((t) => t !== "お役立ち情報") ?? "";
  const hasVideo = Boolean(video.videoPath);

  const handleClick = (e: React.MouseEvent) => {
    if (hasVideo && onSelect) {
      e.preventDefault();
      onSelect(video);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <Link
      href={`/subsidies/videos/${video.slug}`}
      onClick={handleClick}
      className={`flex w-[220px] shrink-0 items-center gap-2.5 rounded-xl border px-3 py-2.5 shadow-sm transition hover:shadow-md ${
        isActive
          ? "border-[#0e357f] bg-[#eff6ff]"
          : "border-[#dbeafe] bg-white hover:border-[#0e357f]/30"
      }`}
      tabIndex={-1}
      aria-pressed={isActive}
    >
      {/* サムネイル */}
      <div className="relative h-12 w-[84px] shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-[#0e357f] to-[#1a4fa0]">
        {video.thumbnailPath ? (
          <Image
            src={video.thumbnailPath}
            alt={video.title}
            fill
            className="object-cover"
            sizes="84px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <svg viewBox="0 0 24 24" fill="white" className="h-5 w-5 opacity-70">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        )}
        {/* 再生アイコン overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors hover:bg-black/20">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/80">
            <svg viewBox="0 0 24 24" fill="#0e357f" className="ml-0.5 h-3.5 w-3.5">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
        {dur && (
          <span className="absolute bottom-1 right-1 rounded bg-black/60 px-1 py-px text-[9px] font-medium text-white">
            {dur}
          </span>
        )}
        {isActive && (
          <span className="absolute left-1 top-1 rounded bg-[#0e357f] px-1 py-px text-[8px] font-bold text-white">
            再生中
          </span>
        )}
      </div>

      {/* テキスト */}
      <div className="min-w-0 flex-1">
        {category && (
          <p className="mb-0.5 text-[10px] font-bold text-[#0e357f] opacity-70">#{category}</p>
        )}
        <p className="line-clamp-2 text-[11px] font-semibold leading-snug text-[#111827]">
          {video.title}
        </p>
      </div>
    </Link>
  );
}

export default function VideosTicker({
  videos,
  activeVideoId,
  onVideoSelect,
}: {
  videos: VideoCard[];
  activeVideoId?: string | null;
  onVideoSelect?: (video: VideoCard) => void;
}) {
  if (videos.length === 0) return null;

  // 十分な長さにするため最低2ループ分確保
  const items = videos.length < 6 ? [...videos, ...videos] : videos;

  return (
    <div className="border-y border-[#dbeafe] bg-[#eff6ff]">
      <div className="flex items-stretch">
        {/* 固定ラベル */}
        <div className="flex shrink-0 items-center gap-2 border-r border-[#93c5fd]/40 px-4 py-3 shadow-sm sm:px-5 [background:var(--nts-gradient-primary)]">
          <span className="flex h-2 w-2 animate-pulse rounded-full bg-white/90" aria-hidden />
          <p className="whitespace-nowrap text-xs font-bold text-white sm:text-sm">
            よく見られている動画
          </p>
        </div>

        {/* スクロールエリア */}
        <div
          className="relative flex-1 overflow-hidden"
          onMouseEnter={(e) => {
            const track = e.currentTarget.querySelector<HTMLElement>("[data-ticker-track]");
            if (track) track.style.animationPlayState = "paused";
          }}
          onMouseLeave={(e) => {
            const track = e.currentTarget.querySelector<HTMLElement>("[data-ticker-track]");
            if (track) track.style.animationPlayState = "running";
          }}
        >
          {/* 左フェード */}
          <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-8 bg-gradient-to-r from-[#eff6ff] to-transparent" />
          {/* 右フェード */}
          <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-8 bg-gradient-to-l from-[#eff6ff] to-transparent" />

          <div
            data-ticker-track
            className="ticker-track flex items-center gap-3 py-3 pl-4"
            aria-label="注目の補助金解説動画一覧"
          >
            {/* 2ループで途切れなく */}
            {[...items, ...items].map((v, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: ticker loop
              <TickerCard
                key={`${v.id}-${i}`}
                video={v}
                isActive={Boolean(v.videoPath && v.videoPath === activeVideoId)}
                onSelect={v.videoPath ? onVideoSelect : undefined}
              />
            ))}
          </div>
        </div>
      </div>

      {/* CSS animation */}
      <style>{`
        .ticker-track {
          animation: ticker-scroll 40s linear infinite;
        }
        @keyframes ticker-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .ticker-track {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}

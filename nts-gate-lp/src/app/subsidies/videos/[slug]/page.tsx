import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import Header from "@/components/shared/Header";
import LpFooter from "@/components/gate-lp/LpFooter";
import { prisma } from "@/lib/db/prisma";

export const revalidate = 300;

type PageProps = {
  params: Promise<{ slug: string }>;
};

type RawPayloadLike = Record<string, unknown> | null;

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  const rows = await prisma.generatedContent.findMany({
    where: {
      contentType: "video",
      status: "published",
      slug: { not: undefined },
    },
    select: { slug: true },
    take: 200,
  });
  return rows
    .filter((r): r is { slug: string } => typeof r.slug === "string")
    .map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const video = await prisma.generatedContent.findUnique({
    where: { slug },
    select: { title: true, metaDescription: true, excerpt: true },
  });
  if (!video) {
    return { title: "動画が見つかりません | 日本提携支援" };
  }
  return {
    title: `${video.title ?? "補助金解説動画"} | 日本提携支援`,
    description: video.metaDescription ?? video.excerpt ?? undefined,
  };
}

function formatPublishedJP(date: Date | null): string {
  if (!date) return "";
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

function toObj(raw: unknown): RawPayloadLike {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  return raw as Record<string, unknown>;
}

function formatJPY(amount: number): string {
  if (amount >= 100000000) {
    const oku = amount / 100000000;
    return oku % 1 === 0 ? `${oku}億円` : `${oku.toFixed(1)}億円`;
  }
  if (amount >= 10000) {
    const man = amount / 10000;
    return man % 1 === 0 ? `${man.toLocaleString()}万円` : `${man.toFixed(0)}万円`;
  }
  return `${amount.toLocaleString()}円`;
}

function resolveAmountLabel(
  maxAmountLabel: string | null,
  rawPayload: RawPayloadLike,
): string | null {
  const rawAmount = Number(rawPayload?.subsidy_max_limit ?? 0);
  if (Number.isFinite(rawAmount) && rawAmount > 0) return formatJPY(rawAmount);
  if (
    maxAmountLabel &&
    /^[\x20-\x7E\u3000\u3040-\u30ff\u3400-\u9fff,0-9円万億最大\s]+$/u.test(
      maxAmountLabel.trim(),
    )
  ) {
    const asNum = Number(maxAmountLabel.replace(/[^\d]/g, ""));
    if (Number.isFinite(asNum) && asNum > 0) return formatJPY(asNum);
    return maxAmountLabel.trim();
  }
  return null;
}

function resolveDeadlineLabel(
  deadlineLabel: string | null,
  deadline: Date | null,
): string | null {
  const date = deadline
    ? deadline
    : deadlineLabel
      ? new Date(deadlineLabel)
      : null;
  if (date && !Number.isNaN(date.getTime())) {
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  }
  if (deadlineLabel && !/^\s*(?:要確認|—|null)\s*$/i.test(deadlineLabel)) {
    return deadlineLabel;
  }
  return null;
}

function formatDuration(sec: number | null): string {
  if (!sec) return "";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}分${s}秒`;
}

export default async function SubsidyVideoPage({ params }: PageProps) {
  const { slug } = await params;

  const video = await prisma.generatedContent.findUnique({
    where: { slug },
    include: {
      grant: {
        select: {
          id: true,
          name: true,
          maxAmountLabel: true,
          deadlineLabel: true,
          deadline: true,
          rawPayload: true,
        },
      },
    },
  });

  if (!video || video.status !== "published" || video.contentType !== "video") {
    notFound();
  }

  const grantAmount = video.grant
    ? resolveAmountLabel(video.grant.maxAmountLabel, toObj(video.grant.rawPayload))
    : null;
  const grantDeadline = video.grant
    ? resolveDeadlineLabel(video.grant.deadlineLabel, video.grant.deadline)
    : null;
  const dur = formatDuration(video.duration);

  return (
    <>
      <Header />
      <main className="relative z-[2] min-h-[100svh] bg-[#f9f7f2] pt-16 font-body sm:pt-20">
        <article className="mx-auto max-w-3xl px-5 py-10 sm:px-6 lg:py-14">
          {/* パンくず */}
          <nav className="mb-6 text-xs text-neutral-500 sm:text-sm" aria-label="breadcrumb">
            <Link href="/subsidies" className="transition hover:text-neutral-700">
              補助金一覧
            </Link>
            <span className="mx-2 text-neutral-300" aria-hidden>
              /
            </span>
            <Link href="/subsidies/videos" className="transition hover:text-neutral-700">
              解説動画
            </Link>
          </nav>

          {/* ヘッダー */}
          <header className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 p-6 shadow-sm sm:p-8 lg:p-10">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-12 -left-10 h-36 w-36 rounded-full bg-accent-400/20 blur-3xl"
            />
            <div className="relative">
              <p className="text-xs font-medium text-white/60 sm:text-sm">
                {formatPublishedJP(video.publishedAt)}
                {dur && <span className="ml-3">{dur}</span>}
              </p>
              <h1 className="font-heading mt-3 text-2xl font-bold leading-snug text-white sm:text-3xl lg:text-4xl">
                {video.title ?? "補助金解説動画"}
              </h1>
              {video.tags.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {video.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white ring-1 ring-white/30 sm:text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              {(grantAmount || grantDeadline) && (
                <dl className="mt-6 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                  {grantAmount && (
                    <div className="rounded-lg bg-white/10 px-4 py-3 ring-1 ring-white/20 backdrop-blur-sm">
                      <dt className="text-xs text-white/60">上限補助額</dt>
                      <dd className="mt-0.5 font-semibold text-white">
                        最大 {grantAmount}
                      </dd>
                    </div>
                  )}
                  {grantDeadline && (
                    <div className="rounded-lg bg-white/10 px-4 py-3 ring-1 ring-white/20 backdrop-blur-sm">
                      <dt className="text-xs text-white/60">公募期限</dt>
                      <dd className="mt-0.5 font-semibold text-white">
                        {grantDeadline}
                      </dd>
                    </div>
                  )}
                </dl>
              )}
            </div>
          </header>

          {/* 動画 / 音声プレーヤー */}
          <div className="mt-8 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-neutral-200">
            {video.videoPath ? (
              <video
                src={video.videoPath}
                controls
                className="w-full"
                playsInline
              >
                ご利用のブラウザは動画再生に対応していません。
              </video>
            ) : video.audioPath ? (
              <div className="flex flex-col items-center gap-4 p-8">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-50 ring-4 ring-primary-100">
                  <svg className="h-10 w-10 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-neutral-700">音声解説</p>
                <audio
                  src={video.audioPath}
                  controls
                  className="w-full max-w-md"
                >
                  ご利用のブラウザは音声再生に対応していません。
                </audio>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 py-16 text-neutral-400">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-neutral-200 border-t-primary-400" />
                <p className="text-sm">動画を生成中です。しばらくお待ちください。</p>
              </div>
            )}
          </div>

          {/* 概要テキスト */}
          {video.excerpt && (
            <div className="mt-8 rounded-xl bg-white p-6 shadow-sm ring-1 ring-neutral-200">
              <h2 className="font-heading mb-3 text-base font-bold text-neutral-900">
                動画の概要
              </h2>
              <p className="text-sm leading-relaxed text-neutral-700">{video.excerpt}</p>
            </div>
          )}

          {/* 関連補助金 CTA */}
          {video.grant && (
            <section className="mt-8 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-accent-600">
                関連する補助金
              </p>
              <h2 className="font-heading mt-2 text-lg font-bold text-neutral-900 sm:text-xl">
                {video.grant.name ?? "補助金詳細"}
              </h2>
              <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                {grantAmount && (
                  <div className="rounded-lg bg-neutral-50 px-4 py-3">
                    <dt className="text-xs text-neutral-500">上限補助額</dt>
                    <dd className="mt-1 font-semibold text-neutral-900">
                      最大 {grantAmount}
                    </dd>
                  </div>
                )}
                {grantDeadline && (
                  <div className="rounded-lg bg-neutral-50 px-4 py-3">
                    <dt className="text-xs text-neutral-500">公募期限</dt>
                    <dd className="mt-1 font-semibold text-neutral-900">
                      {grantDeadline}
                    </dd>
                  </div>
                )}
              </dl>
              <Link
                href={`/subsidies/list/${video.grant.id}`}
                className="mt-6 inline-flex items-center justify-center rounded-lg bg-primary-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-500"
              >
                この補助金の詳細を見る
              </Link>
            </section>
          )}

          {/* NTS 無料相談 CTA */}
          <section className="mt-10 overflow-hidden rounded-xl bg-gradient-to-br from-primary-700 to-primary-900 p-8 text-white shadow-sm">
            <h2 className="font-heading text-xl font-bold text-white drop-shadow-sm sm:text-2xl">
              補助金活用の戦略設計は、NTS にご相談ください
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/90 sm:text-base">
              申請代行ではなく、採択後 1 年間の伴走まで含めた補助金活用戦略を設計します。
              着手金 15 万円と段階的な成功報酬で、最後まで責任を共有します。
            </p>
            <Link
              href="/#contact"
              className="mt-6 inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 text-sm font-semibold text-primary-900 shadow-sm transition hover:bg-primary-50"
            >
              無料相談を予約する
            </Link>
          </section>

          {/* 戻る */}
          <div className="mt-10 text-center">
            <Link
              href="/subsidies/videos"
              className="text-sm text-neutral-500 transition hover:text-neutral-700"
            >
              ← 解説動画一覧に戻る
            </Link>
          </div>
        </article>
      </main>
      <LpFooter />
    </>
  );
}

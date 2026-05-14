import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import Header from "@/components/shared/Header";
import LpFooter from "@/components/gate-lp/LpFooter";
import { prisma } from "@/lib/db/prisma";
import { pickHeroImage } from "@/lib/content/imagePool";

// ========== [NEW 2026-04-30] 追加コンポーネント ==========
import { LivePublishedBadge } from "@/components/articles/LivePublishedBadge";
import { ArticleToc } from "@/components/articles/ArticleToc";
import { ConsultantComment } from "@/components/articles/ConsultantComment";
import { ArticleCTA } from "@/components/articles/ArticleCTA";
import { RelatedArticles } from "@/components/articles/RelatedArticles";
import { ArticleMarkdownBody } from "@/components/articles/ArticleMarkdownBody";
// ========== [NEW 2026-04-30] 締切カウントダウン ==========
import { ArticleDeadlineCountdown } from "@/components/articles/ArticleDeadlineCountdown";
// ========== /NEW ==========
// ========== 図解ブロック（本文内 H2 連動は ArticleMarkdownBody） ==========
import { SummaryCards, type ArticleVisualData } from "@/components/articles/ArticleVisualBlocks";

// 5 分 ISR（新規生成時は再ビルド不要で切り替わる）
export const revalidate = 300;
export const dynamicParams = true;

type PageProps = {
  params: Promise<{ slug: string }>;
};

type RawPayloadLike = Record<string, unknown> | null;

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  return [];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await prisma.generatedContent.findFirst({
    where: {
      slug,
      status: "published",
      contentType: "article",
      grant: { is: { status: "open" } },
    },
    select: { title: true, metaDescription: true, excerpt: true },
  });
  if (!article) {
    return { title: "記事が見つかりません | 日本提携支援" };
  }
  return {
    title: `${article.title ?? "解説記事"} | 日本提携支援`,
    description: article.metaDescription ?? article.excerpt ?? undefined,
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

// DB の maxAmountLabel が文字化け（??20,000,000?）している可能性があるため、
// rawPayload.subsidy_max_limit を優先して金額を再構築する。
function resolveAmountLabel(
  maxAmountLabel: string | null,
  rawPayload: RawPayloadLike,
): string | null {
  const rawAmount = Number(rawPayload?.subsidy_max_limit ?? 0);
  if (Number.isFinite(rawAmount) && rawAmount > 0) return formatJPY(rawAmount);

  // ラベルが ASCII と数字のみで構成されていれば使う。それ以外は壊れている可能性が高い
  if (maxAmountLabel && /^[\x20-\x7E\u3000\u3040-\u30ff\u3400-\u9fff,0-9円万億最大\s]+$/u.test(maxAmountLabel.trim())) {
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

// ========== [UPDATED] 関連記事取得：同都道府県・同タグ・公募中を優先 ==========
async function getRelatedArticles({
  currentSlug,
  tags,
  prefecture,
  limit,
}: {
  currentSlug: string;
  tags: string[];
  prefecture?: string | null;
  limit: number;
}) {
  const now = new Date();

  // 候補を多めに取得してからスコアリング
  const candidates = await prisma.generatedContent.findMany({
    where: {
      status: "published",
      slug: { not: currentSlug },
      contentType: "article",
      grant: { is: { status: "open" } },
    },
    select: {
      id: true,
      subsidyId: true,
      slug: true,
      title: true,
      publishedAt: true,
      tags: true,
      grant: {
        select: {
          prefecture: true,
          status: true,
          deadline: true,
          name: true,
          maxAmountLabel: true,
          targetIndustries: true,
        },
      },
    },
    orderBy: { publishedAt: "desc" },
    take: 60, // スコアリング母集団
  });

  // スコアリング（高いほど上位）
  const scored = candidates
    .filter((a) => a.slug != null && a.title != null)
    .map((a) => {
      let score = 0;

      // 同都道府県 +3
      if (prefecture && a.grant?.prefecture === prefecture) score += 3;

      // 同タグ +1/件
      const matchedTags = (a.tags ?? []).filter((t) => tags.includes(t));
      score += matchedTags.length;

      // 公募中（status=open かつ deadline が未来 or null）+2
      const isOpen =
        a.grant?.status === "open" &&
        (a.grant?.deadline == null || a.grant.deadline > now);
      if (isOpen) score += 2;

      // 新しい記事 +0.5（最近7日）
      const age = now.getTime() - (a.publishedAt ?? now).getTime();
      if (age < 7 * 24 * 60 * 60 * 1000) score += 0.5;

      return {
        slug: a.slug!,
        title: a.title!,
        publishedAt: (a.publishedAt ?? now).toISOString(),
        tags: a.tags ?? [],
        prefecture: a.grant?.prefecture ?? null,
        isOpen,
        grantName: a.grant?.name ?? null,
        thumbnailUrl: pickHeroImage({
          subsidyId: a.subsidyId,
          seedKey: a.id,
          tags: a.tags ?? [],
          targetIndustries: a.grant?.targetIndustries ?? [],
        }),
        score,
      };
    })
    .sort((a, b) => b.score - a.score || b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, limit);

  return scored;
}
// ========== /UPDATED ==========

export default async function SubsidyArticlePage({ params }: PageProps) {
  const { slug } = await params;

  const article = await prisma.generatedContent.findFirst({
    where: {
      slug,
      status: "published",
      contentType: "article",
      grant: { is: { status: "open" } },
    },
    include: {
      grant: {
        select: {
          id: true,
          name: true,
          maxAmountLabel: true,
          deadlineLabel: true,
          deadline: true,
          rawPayload: true,
          targetIndustries: true,
        },
      },
    },
  });

  if (!article || article.status !== "published" || !article.body) {
    notFound();
  }

  const grantAmount = article.grant
    ? resolveAmountLabel(article.grant.maxAmountLabel, toObj(article.grant.rawPayload))
    : null;
  const grantDeadline = article.grant
    ? resolveDeadlineLabel(article.grant.deadlineLabel, article.grant.deadline)
    : null;

  // ========== 関連記事を取得（同都道府県・同タグ・公募中優先） ==========
  const relatedArticles = await getRelatedArticles({
    currentSlug: slug,
    tags: article.tags ?? [],
    prefecture: article.grant?.rawPayload
      ? (toObj(article.grant.rawPayload)?.prefecture as string | undefined)
      : null,
    limit: 3,
  });
  // ========== /UPDATED ==========

  // ── 図解ブロック用データを組み立て ──────────────────────
  const rawObj = article.grant ? toObj(article.grant.rawPayload) : null;
  const visualData: ArticleVisualData = {
    title: article.title ?? "",
    subsidyName: article.grant?.name ?? null,
    maxAmount: grantAmount,
    deadline: grantDeadline,
    region:
      (rawObj?.prefecture as string | undefined) ??
      (rawObj?.region as string | undefined) ??
      null,
    categories: article.tags ?? [],
    targetIndustries: article.grant?.targetIndustries ?? [],
  };
  // ─────────────────────────────────────────────────────────

  const currentUrl =
    typeof process !== "undefined"
      ? `https://nihon-teikei.co.jp/subsidies/articles/${slug}`
      : "";
  const encodedUrl = encodeURIComponent(currentUrl);
  const encodedTitle = encodeURIComponent(article.title ?? "補助金解説記事");
  const articleHeroImage = pickHeroImage({
    subsidyId: article.subsidyId,
    seedKey: article.id,
    tags: article.tags ?? [],
    targetIndustries: article.grant?.targetIndustries ?? [],
  });

  return (
    <>
      <Header />
      <main className="relative z-[2] min-h-[100svh] bg-white pt-16 font-body sm:pt-20">

        {/* ─── ヒーロー帯 ─── */}
        <div className="bg-[#f5f7fa] border-b border-gray-200">
          <div className="mx-auto max-w-[960px] px-5 py-8 sm:px-6">
            {/* 日付 + カテゴリ */}
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <time className="text-sm text-neutral-500">
                {formatPublishedJP(article.publishedAt)}
              </time>
              {article.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded border border-[#0e357f]/30 px-2.5 py-0.5 text-xs font-medium text-[#0e357f]"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* タイトル */}
            <h1 className="text-2xl font-black leading-snug text-[#111827] sm:text-3xl lg:text-[2rem]"
              style={{ fontFamily: "'Noto Sans JP', sans-serif" }}>
              {article.title ?? "解説記事"}
            </h1>

            {/* 補助上限・締切 */}
            {(grantAmount || grantDeadline || article.grant?.deadline) && (
              <dl className="mt-5 flex flex-wrap gap-4 text-sm">
                {grantAmount && (
                  <div className="rounded-lg bg-white px-4 py-2.5 shadow-sm ring-1 ring-gray-200">
                    <dt className="text-[11px] text-gray-400">補助上限</dt>
                    <dd className="mt-0.5 font-bold text-[#0e357f]">最大 {grantAmount}</dd>
                  </div>
                )}
                {article.grant?.deadline && grantDeadline ? (
                  <ArticleDeadlineCountdown
                    deadline={article.grant.deadline}
                    deadlineLabel={grantDeadline}
                  />
                ) : grantDeadline ? (
                  <div className="rounded-lg bg-white px-4 py-2.5 shadow-sm ring-1 ring-gray-200">
                    <dt className="text-[11px] text-gray-400">公募期限</dt>
                    <dd className="mt-0.5 font-bold text-[#0e357f]">{grantDeadline}</dd>
                  </div>
                ) : null}
              </dl>
            )}

            {/* SNSシェア */}
            <ul className="mt-5 flex items-center gap-2">
              <li>
                <a
                  href={`https://twitter.com/share?text=${encodedTitle}&url=${encodedUrl}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-white text-sm font-bold transition hover:opacity-80"
                  aria-label="Xでシェア"
                >X</a>
              </li>
              <li>
                <a
                  href={`https://www.facebook.com/sharer.php?u=${encodedUrl}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1877f2] text-white text-xs font-bold transition hover:opacity-80"
                  aria-label="Facebookでシェア"
                >f</a>
              </li>
              <li>
                <a
                  href={`https://b.hatena.ne.jp/entry/panel/?url=${encodedUrl}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#008fde] text-white text-xs font-bold transition hover:opacity-80"
                  aria-label="はてなブックマーク"
                >B!</a>
              </li>
              <li>
                <a
                  href={`http://line.me/R/msg/text/?${encodedTitle}%20${encodedUrl}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#00b900] text-white text-xs font-bold transition hover:opacity-80"
                  aria-label="LINEでシェア"
                >LINE</a>
              </li>
            </ul>
          </div>
        </div>

        {/* ─── 記事本体 ─── */}
        <div className="mx-auto max-w-[960px] px-5 py-10 sm:px-6 lg:py-14">

          {/* 速報バッジ */}
          {article.publishedAt && (
            <div className="mb-6">
              <LivePublishedBadge publishedAt={article.publishedAt} />
            </div>
          )}

          {/* 記事サムネイル（一覧と同じロジックで選択） */}
          <div className="mb-6 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
            <div
              className="h-[220px] bg-cover bg-center sm:h-[280px]"
              style={{ backgroundImage: `url(${articleHeroImage})` }}
            />
          </div>

          {/* ── 図解ブロック①: SummaryCards ── */}
          <SummaryCards data={visualData} />

          {/* 目次 */}
          <ArticleToc contentContainerId="article-body" />

          {/* 本文 */}
          <div
            id="article-body"
            className={[
              "prose prose-neutral max-w-none mt-8",
              "prose-headings:font-black prose-headings:text-[#111827]",
              // h2: 参照サイトに合わせた下線スタイル
              "prose-h2:text-[22px] prose-h2:font-black prose-h2:mt-12 prose-h2:mb-4 prose-h2:pb-2",
              "prose-h2:border-b-[3px] prose-h2:border-[#0e357f]",
              "prose-h3:text-[18px] prose-h3:font-bold prose-h3:mt-8",
              "prose-p:leading-[1.9] prose-p:text-[#374151] prose-p:text-[15px]",
              "prose-a:text-[#0e357f] prose-a:font-medium prose-a:no-underline hover:prose-a:underline",
              "prose-strong:text-[#111827]",
              "prose-li:text-[#374151] prose-li:text-[15px]",
            ].join(" ")}
            style={{ fontFamily: "'Noto Sans JP', sans-serif" }}
          >
            <ArticleMarkdownBody body={article.body} visualData={visualData} />
          </div>

          {/* コンサルタントコメント */}
          <ConsultantComment />

          {/* SNSシェア（フッター） */}
          <div className="mt-12 border-t border-gray-100 pt-8">
            <p className="mb-3 text-sm font-bold text-gray-500">この記事をシェアする</p>
            <ul className="flex items-center gap-2">
              <li>
                <a href={`https://twitter.com/share?text=${encodedTitle}&url=${encodedUrl}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white text-sm font-bold transition hover:opacity-80">X</a>
              </li>
              <li>
                <a href={`https://www.facebook.com/sharer.php?u=${encodedUrl}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1877f2] text-white text-xs font-bold transition hover:opacity-80">f</a>
              </li>
              <li>
                <a href={`https://b.hatena.ne.jp/entry/panel/?url=${encodedUrl}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#008fde] text-white text-xs font-bold transition hover:opacity-80">B!</a>
              </li>
              <li>
                <a href={`http://line.me/R/msg/text/?${encodedTitle}%20${encodedUrl}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#00b900] text-white text-xs font-bold transition hover:opacity-80">LINE</a>
              </li>
            </ul>
          </div>

          {/* 関連補助金 */}
          {article.grant && (
            <section className="mt-10 rounded-xl border border-[#0e357f]/20 bg-[#f5f7fa] p-6">
              <p className="mb-1 text-xs font-bold uppercase tracking-wider text-[#0e357f]/70">関連する補助金</p>
              <h2 className="text-lg font-black text-[#111827]">{article.grant.name ?? "補助金詳細"}</h2>
              <dl className="mt-3 flex flex-wrap gap-4 text-sm">
                {grantAmount && (
                  <div className="rounded-lg bg-white px-4 py-2.5 shadow-sm ring-1 ring-gray-200">
                    <dt className="text-[11px] text-gray-400">補助上限</dt>
                    <dd className="mt-0.5 font-bold text-[#0e357f]">最大 {grantAmount}</dd>
                  </div>
                )}
                {grantDeadline && (
                  <div className="rounded-lg bg-white px-4 py-2.5 shadow-sm ring-1 ring-gray-200">
                    <dt className="text-[11px] text-gray-400">公募期限</dt>
                    <dd className="mt-0.5 font-bold text-[#0e357f]">{grantDeadline}</dd>
                  </div>
                )}
              </dl>
              <Link
                href={`/subsidies/list/${article.grant.id}`}
                className="mt-5 inline-flex items-center justify-center rounded-lg bg-[#0e357f] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#1a4fa0]"
              >
                この補助金の詳細を見る →
              </Link>
            </section>
          )}

          {/* CTA */}
          <ArticleCTA diagnosisHref="/diagnosis" subsidyName={article.title ?? undefined} />

          {/* 関連記事 */}
          <RelatedArticles articles={relatedArticles} />

          {/* 戻る */}
          <div className="mt-10 text-center">
            <Link href="/subsidies/articles" className="text-sm text-neutral-500 transition hover:text-neutral-700">
              ← 解説記事一覧に戻る
            </Link>
          </div>
        </div>
      </main>
      <LpFooter />
    </>
  );
}

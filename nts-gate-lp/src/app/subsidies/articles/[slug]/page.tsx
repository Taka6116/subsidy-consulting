import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import Header from "@/components/shared/Header";
import LpFooter from "@/components/gate-lp/LpFooter";
import { prisma } from "@/lib/db/prisma";

// ========== [NEW 2026-04-30] 追加コンポーネント ==========
import { LivePublishedBadge } from "@/components/articles/LivePublishedBadge";
import { ArticleToc } from "@/components/articles/ArticleToc";
import { ConsultantComment } from "@/components/articles/ConsultantComment";
import { ArticleCTA } from "@/components/articles/ArticleCTA";
import { RelatedArticles } from "@/components/articles/RelatedArticles";
// ========== /NEW ==========

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
  const article = await prisma.generatedContent.findUnique({
    where: { slug },
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

// ========== [NEW 2026-04-30] 関連記事取得関数 ==========
async function getRelatedArticles({
  currentSlug,
  tags,
  limit,
}: {
  currentSlug: string;
  tags: string[];
  limit: number;
}) {
  // 同タグの published 記事を取得し、自身を除外して limit 件返す
  // TODO: タグ一致のフィルタリングは tags.length > 0 の場合のみ行う
  const articles = await prisma.generatedContent.findMany({
    where: {
      status: "published",
      slug: { not: currentSlug },
      ...(tags.length > 0 ? { tags: { hasSome: tags } } : {}),
    },
    select: { slug: true, title: true, publishedAt: true, tags: true },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });

  return articles
    .filter((a) => a.slug != null && a.title != null)
    .map((a) => ({
      slug: a.slug!,
      title: a.title!,
      publishedAt: (a.publishedAt ?? new Date()).toISOString(),
      tags: a.tags,
    }));
}
// ========== /NEW ==========

export default async function SubsidyArticlePage({ params }: PageProps) {
  const { slug } = await params;

  const article = await prisma.generatedContent.findUnique({
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

  if (!article || article.status !== "published" || !article.body) {
    notFound();
  }

  const grantAmount = article.grant
    ? resolveAmountLabel(article.grant.maxAmountLabel, toObj(article.grant.rawPayload))
    : null;
  const grantDeadline = article.grant
    ? resolveDeadlineLabel(article.grant.deadlineLabel, article.grant.deadline)
    : null;

  // ========== [NEW 2026-04-30] 関連記事を取得 ==========
  const relatedArticles = await getRelatedArticles({
    currentSlug: slug,
    tags: article.tags ?? [],
    limit: 3,
  });
  // ========== /NEW ==========

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
            <Link href="/subsidies/articles" className="transition hover:text-neutral-700">
              解説記事
            </Link>
          </nav>

          {/* グラデーションバナー型ヘッダー（写真は使わない） */}
          <header className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-100 via-white to-accent-100/60 p-6 shadow-sm ring-1 ring-primary-200/40 sm:p-8 lg:p-10">
            {/* 装飾用ソフトブロブ */}
            <div
              aria-hidden
              className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary-200/40 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-12 -left-10 h-36 w-36 rounded-full bg-accent-100/60 blur-3xl"
            />

            <div className="relative">
              <p className="text-xs font-medium sm:text-sm">
                <span className="text-accent-600">
                  {formatPublishedJP(article.publishedAt)}
                </span>
              </p>

              <h1 className="font-heading mt-3 text-2xl font-bold leading-snug text-primary-900 sm:text-3xl lg:text-4xl">
                {article.title ?? "解説記事"}
              </h1>

              {article.tags.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-primary-700 ring-1 ring-primary-200/60 sm:text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* ミニメタ（補助上限・公募期限） */}
              {(grantAmount || grantDeadline) && (
                <dl className="mt-6 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                  {grantAmount && (
                    <div className="rounded-lg bg-white/80 px-4 py-3 ring-1 ring-primary-200/40 backdrop-blur-sm">
                      <dt className="text-xs text-neutral-500">補助上限</dt>
                      <dd className="mt-0.5 font-semibold text-primary-900">
                        最大 {grantAmount}
                      </dd>
                    </div>
                  )}
                  {grantDeadline && (
                    <div className="rounded-lg bg-white/80 px-4 py-3 ring-1 ring-primary-200/40 backdrop-blur-sm">
                      <dt className="text-xs text-neutral-500">公募期限</dt>
                      <dd className="mt-0.5 font-semibold text-primary-900">
                        {grantDeadline}
                      </dd>
                    </div>
                  )}
                </dl>
              )}
            </div>
          </header>

          {/* ========== [NEW 2026-04-30] 速報バッジ ========== */}
          {/* タイトル直下・本文直前に配置 */}
          {/* TODO: minutesAfterAnnouncement は DB フィールド追加後に渡す */}
          {article.publishedAt && (
            <div className="mt-6">
              <LivePublishedBadge publishedAt={article.publishedAt} />
            </div>
          )}

          {/* ========== [NEW 2026-04-30] 目次 ========== */}
          {/* 本文直前に配置。contentContainerId="article-body" のコンテナを参照する */}
          <ArticleToc contentContainerId="article-body" />
          {/* ========== /NEW ========== */}

          {/* 本文 Markdown */}
          {/* [NEW 2026-04-30] id="article-body" を追加（ArticleToc がh2/h3を収集するため） */}
          {/* 変更前: <div className="prose prose-neutral ..."> */}
          <div
            id="article-body"
            className="prose prose-neutral mt-10 max-w-none prose-headings:font-heading prose-headings:text-neutral-900 prose-h2:mt-10 prose-h2:border-l-4 prose-h2:border-accent-500 prose-h2:pl-3 prose-h2:text-xl prose-h2:font-bold sm:prose-h2:text-2xl prose-h3:mt-6 prose-h3:text-lg prose-h3:font-semibold prose-p:leading-relaxed prose-p:text-neutral-700 prose-a:text-primary-700 prose-a:font-medium prose-a:no-underline hover:prose-a:underline prose-strong:text-neutral-900 prose-li:text-neutral-700"
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{article.body}</ReactMarkdown>
          </div>

          {/* ========== [NEW 2026-04-30] コンサルタントコメント枠 ========== */}
          {/* 本文末尾・CTA直前に配置 */}
          {/* TODO: article.consultantComment が DB に追加されたら comment prop に渡す */}
          <ConsultantComment />
          {/* ========== /NEW ========== */}

          {/* 関連補助金 CTA */}
          {article.grant && (
            <section className="mt-12 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-accent-600">
                関連する補助金
              </p>
              <h2 className="font-heading mt-2 text-lg font-bold text-neutral-900 sm:text-xl">
                {article.grant.name ?? "補助金詳細"}
              </h2>
              <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                {grantAmount && (
                  <div className="rounded-lg bg-neutral-50 px-4 py-3">
                    <dt className="text-xs text-neutral-500">補助上限</dt>
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
                href={`/subsidies/list/${article.grant.id}`}
                className="mt-6 inline-flex items-center justify-center rounded-lg bg-primary-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-500"
              >
                この補助金の詳細を見る
              </Link>
            </section>
          )}

          {/* ========== [LEGACY 2026-04-30] 旧NTS無料相談CTA（1本のみ） ==========
          <section className="mt-10 overflow-hidden rounded-xl bg-gradient-to-br from-primary-700 to-primary-900 p-8 text-white shadow-sm">
            <h2 className="font-heading text-xl font-bold text-white drop-shadow-sm sm:text-2xl">
              補助金活用の戦略設計は、NTS にご相談ください
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/90 sm:text-base">
              申請代行ではなく、採択後 1 年間の伴走まで含めた補助金活用戦略を設計します。
              着手金 15 万円と段階的な成功報酬で、最後まで責任を共有します。
            </p>
            <Link
              href="/consult"
              className="mt-6 inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 text-sm font-semibold text-primary-900 shadow-sm transition hover:bg-primary-50"
            >
              無料相談を予約する
            </Link>
          </section>
          ========== /LEGACY ========== */}

          {/* ========== [NEW 2026-04-30] 温度別マルチCTA ========== */}
          <ArticleCTA
            diagnosisHref="/diagnosis"
            subsidyName={article.title ?? undefined}
          />
          {/* ========== /NEW ========== */}

          {/* ========== [NEW 2026-04-30] 関連記事カード ========== */}
          <RelatedArticles articles={relatedArticles} />
          {/* ========== /NEW ========== */}

          {/* 戻る */}
          <div className="mt-10 text-center">
            <Link
              href="/subsidies/articles"
              className="text-sm text-neutral-500 transition hover:text-neutral-700"
            >
              ← 解説記事一覧に戻る
            </Link>
          </div>
        </article>
      </main>
      <LpFooter />
    </>
  );
}

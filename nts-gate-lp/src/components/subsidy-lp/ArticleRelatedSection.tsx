/**
 * 補助金LP内「この補助金を詳しく知る」セクション。
 * 「活用例（CaseStudiesSection）」直後・「流れ（FlowSection）」前に配置。
 *
 * カードデザインは /subsidies/articles と同一（heroImage・補助上限・公募期限・都道府県）。
 *
 * ─── 検索戦略（優先度順） ────────────────────────────────────
 * 1. subsidyId FK 完全一致（動的LP: /subsidies/lp/[id]）
 * 2. lpSlug 静的マッピング → grant.name OR 検索（静的LP）
 *    src/lib/subsidy-lp/lpArticleKeywords.ts で定義
 * 3. grantNameContains → grant.name 部分一致
 * 4. tags hasSome キーワード
 * 5. title contains キーワード（最終フォールバック）
 * ─────────────────────────────────────────────────────────────
 *
 * 0件時: セクション全体を非表示（null）
 * 開発確認: console.warn で検索ステップ・件数をログ出力
 */

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { LP_ARTICLE_KEYWORDS } from "@/lib/subsidy-lp/lpArticleKeywords";
import { pickHeroImage } from "@/lib/content/imagePool";

// ─── Props ────────────────────────────────────────────────────
type Props =
  | { subsidyId: string; lpSlug?: never; grantNameContains?: never }
  | { subsidyId?: never; lpSlug: string; grantNameContains?: never }
  | { subsidyId?: never; lpSlug?: never; grantNameContains: string };

// ─── DB 取得行の型 ─────────────────────────────────────────────
type RawRow = {
  id: string;
  slug: string | null;
  title: string | null;
  excerpt: string | null;
  publishedAt: Date | null;
  tags: string[];
  subsidyId: string;
  grant: {
    maxAmountLabel: string | null;
    subsidyAmount: bigint | null;
    deadlineLabel: string | null;
    deadline: Date | null;
    rawPayload: unknown;
    prefecture: string | null;
    targetIndustries: string[];
  } | null;
};

// ─── 整形後の記事型 ───────────────────────────────────────────
type ArticleItem = {
  slug: string;
  title: string;
  excerpt: string;
  heroImagePath: string;
  tags: string[];
  publishedAt: string;
  maxAmountLabel: string | null;
  deadlineLabel: string | null;
  prefecture: string | null;
};

// ─── ユーティリティ ───────────────────────────────────────────
const DEADLINE_MAX = new Date("2050-01-01");

function resolveDeadlineLabel(
  deadlineLabel: string | null,
  deadline: Date | null,
  rawPayload: unknown,
): string | null {
  const raw = rawPayload as Record<string, unknown> | null;
  const fromRaw = raw?.application_end_date ? new Date(String(raw.application_end_date)) : null;
  for (const d of [deadline, fromRaw, deadlineLabel ? new Date(deadlineLabel) : null]) {
    if (d instanceof Date && !Number.isNaN(d.getTime()) && d < DEADLINE_MAX) {
      return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
    }
  }
  return null;
}

function resolveMaxAmount(label: string | null, amountYen: bigint | null): string | null {
  if (label) return label.startsWith("最大") ? label : `最大 ${label}`;
  if (amountYen == null) return null;
  const n = Number(amountYen);
  if (!Number.isFinite(n) || n <= 0) return null;
  const man = n / 10_000;
  if (man >= 10_000) return `最大 ${(man / 10_000).toFixed(man / 10_000 >= 10 ? 0 : 1)}億円`;
  return `最大 ${Math.round(man).toLocaleString("ja-JP")}万円`;
}

function formatDate(d: Date | null): string {
  if (!d) return "";
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

function visibleTags(tags: string[]): string[] {
  return tags.filter((t) => t !== "お役立ち情報").slice(0, 1);
}

function toArticleItem(row: RawRow): ArticleItem | null {
  if (!row.slug || !row.title) return null;
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt ?? "",
    heroImagePath: pickHeroImage({
      subsidyId: row.subsidyId,
      seedKey: row.id,
      tags: row.tags,
      targetIndustries: row.grant?.targetIndustries ?? [],
    }),
    tags: row.tags,
    publishedAt: formatDate(row.publishedAt),
    maxAmountLabel: resolveMaxAmount(row.grant?.maxAmountLabel ?? null, row.grant?.subsidyAmount ?? null),
    deadlineLabel: resolveDeadlineLabel(
      row.grant?.deadlineLabel ?? null,
      row.grant?.deadline ?? null,
      row.grant?.rawPayload ?? null,
    ),
    prefecture: row.grant?.prefecture ?? null,
  };
}

// ─── DB クエリ ────────────────────────────────────────────────
const BASE_WHERE = { contentType: "article", status: "published", slug: { not: null } } as const;

const GRANT_SELECT = {
  maxAmountLabel: true,
  subsidyAmount: true,
  deadlineLabel: true,
  deadline: true,
  rawPayload: true,
  prefecture: true,
  targetIndustries: true,
} as const;

const ROW_SELECT = {
  id: true,
  slug: true,
  title: true,
  excerpt: true,
  publishedAt: true,
  tags: true,
  subsidyId: true,
  grant: { select: GRANT_SELECT },
} as const;

async function queryRows(where: Prisma.GeneratedContentWhereInput): Promise<RawRow[]> {
  return prisma.generatedContent.findMany({
    where,
    orderBy: { publishedAt: "desc" },
    take: 3,
    select: ROW_SELECT,
  }) as Promise<RawRow[]>;
}

async function fetchArticles(props: Props): Promise<ArticleItem[]> {
  // ─ 1. FK 直接 ─────────────────────────────────────────────
  if (props.subsidyId) {
    let rows = await queryRows({ ...BASE_WHERE, subsidyId: props.subsidyId });
    if (rows.length > 0) return rows.map(toArticleItem).filter(Boolean) as ArticleItem[];
    const grant = await prisma.subsidyGrant.findUnique({ where: { id: props.subsidyId }, select: { name: true } });
    if (!grant?.name) { console.warn(`[ArticleRelatedSection] subsidyId=${props.subsidyId} → grant not found`); return []; }
    rows = await queryByKeywords([grant.name]);
    console.warn(`[ArticleRelatedSection] subsidyId FK 0件 → keyword fallback count=${rows.length}`);
    return rows.map(toArticleItem).filter(Boolean) as ArticleItem[];
  }

  // ─ 2. lpSlug 静的マッピング ────────────────────────────────
  if (props.lpSlug) {
    const entry = LP_ARTICLE_KEYWORDS[props.lpSlug];
    if (!entry) { console.warn(`[ArticleRelatedSection] lpSlug="${props.lpSlug}" not in mapping`); return []; }
    const rows = await queryByKeywordsWithFallback(entry.keywords, entry.fallbackTitleKeywords);
    if (rows.length === 0) console.warn(`[ArticleRelatedSection] lpSlug="${props.lpSlug}" → 0件 keywords=${JSON.stringify(entry.keywords)}`);
    return rows.map(toArticleItem).filter(Boolean) as ArticleItem[];
  }

  // ─ 3. grantNameContains ───────────────────────────────────
  if (props.grantNameContains) {
    const rows = await queryByKeywordsWithFallback([props.grantNameContains]);
    if (rows.length === 0) console.warn(`[ArticleRelatedSection] grantNameContains="${props.grantNameContains}" → 0件`);
    return rows.map(toArticleItem).filter(Boolean) as ArticleItem[];
  }

  return [];
}

async function queryByKeywords(keywords: string[]): Promise<RawRow[]> {
  const OR = keywords.map((kw) => ({ grant: { name: { contains: kw } } }));
  return queryRows({ ...BASE_WHERE, OR });
}

async function queryByKeywordsWithFallback(keywords: string[], fallback?: string[]): Promise<RawRow[]> {
  // A: grant.name OR 検索
  const byName = await queryRows({ ...BASE_WHERE, OR: keywords.map((kw) => ({ grant: { name: { contains: kw } } })) });
  if (byName.length > 0) return byName;
  // B: tags hasSome
  const byTags = await queryRows({ ...BASE_WHERE, tags: { hasSome: keywords } });
  if (byTags.length > 0) return byTags;
  // C: title OR 検索（フォールバック）
  const titleKws = fallback ?? keywords;
  return queryRows({ ...BASE_WHERE, OR: titleKws.map((kw) => ({ title: { contains: kw } })) });
}

// ─── コンポーネント ───────────────────────────────────────────
export default async function ArticleRelatedSection(props: Props) {
  const articles = await fetchArticles(props);
  if (articles.length === 0) return null;

  return (
    <section className="bg-[#F3F6FA] py-14 md:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* 見出し */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-[#0B173A] md:text-3xl">
            この補助金を詳しく知る
          </h2>
          <p className="mt-2 text-sm text-[#4B5563]">
            活用方法・申請の流れをわかりやすく解説しています。
          </p>
        </div>

        {/* 記事カードグリッド（/articles と同一デザイン） */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3">
          {articles.map((article) => {
            const pills = visibleTags(article.tags);
            return (
              <Link
                key={article.slug}
                href={`/subsidies/articles/${article.slug}`}
                className="group flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                {/* Hero 画像エリア */}
                <div
                  className="relative h-40 bg-cover bg-center"
                  style={{ backgroundImage: `url(${article.heroImagePath})` }}
                >
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="absolute left-3 top-3 flex gap-1.5">
                    {pills.map((t) => (
                      <span
                        key={t}
                        className="rounded bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-neutral-700"
                      >
                        {t}
                      </span>
                    ))}
                    {article.deadlineLabel && (
                      <span className="rounded px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm [background:var(--nts-gradient-check)]">
                        公募中
                      </span>
                    )}
                  </div>
                </div>

                {/* テキストエリア */}
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="line-clamp-2 text-[15px] font-bold leading-snug text-neutral-900 group-hover:text-primary-700">
                    {article.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-neutral-500">
                    {article.excerpt}
                  </p>

                  {/* 補助上限 / 公募期限 */}
                  <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                    <div className="rounded bg-neutral-50 px-2 py-1.5">
                      <p className="text-neutral-400">補助上限</p>
                      <p className="line-clamp-1 font-semibold text-neutral-700">
                        {article.maxAmountLabel ?? "要確認"}
                      </p>
                    </div>
                    <div className="rounded bg-neutral-50 px-2 py-1.5">
                      <p className="text-neutral-400">公募期限</p>
                      <p className="line-clamp-1 font-semibold text-neutral-700">
                        {article.deadlineLabel ?? "要確認"}
                      </p>
                    </div>
                  </div>

                  {/* 公開日 / 都道府県 */}
                  <div className="mt-3 flex items-center justify-between text-[11px] text-neutral-400">
                    <span>{article.publishedAt || "-"}</span>
                    <span className="text-primary-700">{article.prefecture ?? "全国"}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* 記事一覧リンク */}
        <div className="mt-10 text-center">
          <Link
            href="/subsidies/articles"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#FFBE00] via-[#FEA00D] to-[#FF7A00] px-7 py-3 text-sm font-bold text-white shadow-[0_4px_14px_rgba(254,160,13,0.35)] transition-all hover:brightness-110 hover:shadow-[0_6px_20px_rgba(254,160,13,0.45)]"
          >
            すべての解説記事を見る
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

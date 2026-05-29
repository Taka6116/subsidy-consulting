/**
 * 補助金LP内「この補助金を詳しく知る」セクション。
 * 「活用例（CaseStudiesSection）」直後・「流れ（FlowSection）」前に配置する。
 *
 * ─── 検索戦略（優先度順） ─────────────────────────────────
 * 1. subsidyId FK 完全一致（動的LP: /subsidies/lp/[id] 専用）
 * 2. lpSlug 静的マッピング → grant.name OR 検索（静的LP専用）
 *    src/lib/subsidy-lp/lpArticleKeywords.ts で定義
 * 3. grantNameContains → grant.name 部分一致（任意の追加呼び出し用）
 * 4. tags hasSome キーワード（Step 2/3 で0件のフォールバック）
 * 5. title contains キーワード（最終フォールバック）
 * ─────────────────────────────────────────────────────────
 *
 * 0件時: セクション全体を非表示（null を返す）
 * 開発確認: console.warn で検索ステップ・件数をログ出力する
 */

import Link from "next/link";
import { BookOpen, ArrowRight, Calendar } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { LP_ARTICLE_KEYWORDS } from "@/lib/subsidy-lp/lpArticleKeywords";

// ─── Props ────────────────────────────────────────────────
type Props =
  | { subsidyId: string; lpSlug?: never; grantNameContains?: never }
  | { subsidyId?: never; lpSlug: string; grantNameContains?: never }
  | { subsidyId?: never; lpSlug?: never; grantNameContains: string };

// ─── 型定義 ───────────────────────────────────────────────
type ArticleRow = {
  slug: string | null;
  title: string | null;
  excerpt: string | null;
  publishedAt: Date | null;
  tags: string[];
};

const BASE_WHERE = {
  contentType: "article",
  status: "published",
  slug: { not: null },
} as const;

const SELECT = {
  slug: true,
  title: true,
  excerpt: true,
  publishedAt: true,
  tags: true,
} as const;

// ─── 検索関数 ─────────────────────────────────────────────

async function bySubsidyId(id: string): Promise<ArticleRow[]> {
  return prisma.generatedContent.findMany({
    where: { ...BASE_WHERE, subsidyId: id },
    orderBy: { publishedAt: "desc" },
    take: 3,
    select: SELECT,
  });
}

/** grant.name OR 検索（join 利用）＋ tags hasSome フォールバック */
async function byGrantNameKeywords(
  keywords: string[],
  fallbackTitleKeywords?: string[],
): Promise<{ articles: ArticleRow[]; step: string }> {
  // Step A: grant.name に対する OR 検索
  const grantNameOR = keywords.map((kw) => ({
    grant: { name: { contains: kw } },
  }));

  const byName = await prisma.generatedContent.findMany({
    where: { ...BASE_WHERE, OR: grantNameOR },
    orderBy: { publishedAt: "desc" },
    take: 3,
    select: SELECT,
  });
  if (byName.length > 0) return { articles: byName, step: "grant.name OR" };

  // Step B: tags hasSome
  const byTags = await prisma.generatedContent.findMany({
    where: { ...BASE_WHERE, tags: { hasSome: keywords } },
    orderBy: { publishedAt: "desc" },
    take: 3,
    select: SELECT,
  });
  if (byTags.length > 0) return { articles: byTags, step: "tags hasSome" };

  // Step C: title keyword fallback
  const titleKws = fallbackTitleKeywords ?? keywords;
  const titleOR = titleKws.map((kw) => ({ title: { contains: kw } }));
  const byTitle = await prisma.generatedContent.findMany({
    where: { ...BASE_WHERE, OR: titleOR },
    orderBy: { publishedAt: "desc" },
    take: 3,
    select: SELECT,
  });
  if (byTitle.length > 0) return { articles: byTitle, step: "title OR" };

  return { articles: [], step: "no match" };
}

async function fetchArticles(props: Props): Promise<ArticleRow[]> {
  // ─── 1. FK 直接 ──────────────────────────────────────────
  if (props.subsidyId) {
    const rows = await bySubsidyId(props.subsidyId);
    if (rows.length > 0) return rows;
    // FK で0件 → grant name を取得してキーワード検索にフォールバック
    const grant = await prisma.subsidyGrant.findUnique({
      where: { id: props.subsidyId },
      select: { name: true },
    });
    const grantName = grant?.name;
    if (!grantName) {
      console.warn("[ArticleRelatedSection] subsidyId found no grant:", props.subsidyId);
      return [];
    }
    const { articles, step } = await byGrantNameKeywords([grantName]);
    console.warn(
      `[ArticleRelatedSection] subsidyId FK 0件 → fallback step="${step}" count=${articles.length} grantName="${grantName}"`,
    );
    return articles;
  }

  // ─── 2. lpSlug 静的マッピング ────────────────────────────
  if (props.lpSlug) {
    const entry = LP_ARTICLE_KEYWORDS[props.lpSlug];
    if (!entry) {
      console.warn(
        `[ArticleRelatedSection] lpSlug "${props.lpSlug}" はマッピングに未定義です。lpArticleKeywords.ts に追加してください。`,
      );
      return [];
    }
    const { articles, step } = await byGrantNameKeywords(entry.keywords, entry.fallbackTitleKeywords);
    if (articles.length === 0) {
      console.warn(
        `[ArticleRelatedSection] lpSlug="${props.lpSlug}" step="${step}" → 0件。キーワードを見直してください: ${JSON.stringify(entry.keywords)}`,
      );
    }
    return articles;
  }

  // ─── 3. grantNameContains（任意の追加用） ────────────────
  if (props.grantNameContains) {
    const { articles, step } = await byGrantNameKeywords([props.grantNameContains]);
    if (articles.length === 0) {
      console.warn(
        `[ArticleRelatedSection] grantNameContains="${props.grantNameContains}" step="${step}" → 0件。`,
      );
    }
    return articles;
  }

  return [];
}

// ─── 日付フォーマット ─────────────────────────────────────
function formatDate(d: Date | null): string | null {
  if (!d) return null;
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

// ─── コンポーネント ───────────────────────────────────────
export default async function ArticleRelatedSection(props: Props) {
  const articles = await fetchArticles(props);
  const visible = articles.filter((a) => a.slug);
  if (visible.length === 0) return null;

  return (
    <section className="bg-[#F3F6FA] py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* 見出し */}
        <div className="mb-10 text-center">
          <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#E8F0FE] px-4 py-1.5 text-xs font-bold tracking-widest text-[#1a4c8e]">
            <BookOpen className="h-3.5 w-3.5" />
            解説記事
          </span>
          <h2 className="mt-3 text-2xl font-bold text-[#0B173A] md:text-3xl">
            この補助金を詳しく知る
          </h2>
          <p className="mt-2 text-sm text-[#4B5563]">
            活用方法・申請の流れをわかりやすく解説しています。
          </p>
        </div>

        {/* 記事カードグリッド */}
        <div
          className={`grid gap-5 ${
            visible.length === 1
              ? "mx-auto max-w-md grid-cols-1"
              : visible.length === 2
                ? "mx-auto max-w-2xl grid-cols-1 sm:grid-cols-2"
                : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          }`}
        >
          {visible.map((article) => {
            const primaryTag = article.tags.find((t) => t !== "お役立ち情報") ?? article.tags[0];
            const dateStr = formatDate(article.publishedAt);
            return (
              <Link
                key={article.slug}
                href={`/subsidies/articles/${article.slug}`}
                className="group flex flex-col rounded-2xl border border-[#DDE3F0] bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
              >
                {/* カテゴリタグ */}
                {primaryTag && (
                  <span className="mb-3 inline-block rounded-md bg-[#EEF2FF] px-2.5 py-1 text-[11px] font-bold text-[#3B5FC7]">
                    {primaryTag}
                  </span>
                )}

                {/* タイトル */}
                <h3 className="mb-2 line-clamp-3 flex-1 text-[15px] font-bold leading-snug text-[#0B173A] group-hover:text-[#1a4c8e]">
                  {article.title ?? "記事タイトル"}
                </h3>

                {/* 概要 */}
                {article.excerpt && (
                  <p className="mb-3 line-clamp-2 text-[12.5px] leading-relaxed text-[#6B7280]">
                    {article.excerpt}
                  </p>
                )}

                {/* 公開日 + CTA */}
                <div className="mt-auto flex items-center justify-between pt-2">
                  {dateStr ? (
                    <span className="inline-flex items-center gap-1 text-[11px] text-[#9CA3AF]">
                      <Calendar className="h-3 w-3" />
                      {dateStr}
                    </span>
                  ) : (
                    <span />
                  )}
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-[#1a4c8e] transition-all group-hover:gap-2">
                    記事を読む
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
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

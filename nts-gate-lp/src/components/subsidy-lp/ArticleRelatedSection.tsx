/**
 * 補助金LP内に挿入する「この補助金の解説記事」セクション。
 *
 * 検索ロジック（2段階）:
 * 1. subsidyId の FK 完全一致（動的LP）または補助金名で grant を引いて FK 検索（静的LP）
 * 2. 1 で0件の場合、キーワードで記事タイトルを検索（フォールバック）
 *    → DB に FK リンクがなくても、タイトルに補助金名が含まれる記事を表示できる
 *
 * - 最終的に0件の場合はセクション全体を非表示（null を返す）
 */

import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/db/prisma";

type Props =
  | { subsidyId: string; grantNameContains?: never }
  | { subsidyId?: never; grantNameContains: string };

type ArticleRow = {
  slug: string | null;
  title: string | null;
  excerpt: string | null;
};

const ARTICLE_SELECT = { slug: true, title: true, excerpt: true } as const;
const ARTICLE_WHERE_BASE = {
  contentType: "article",
  status: "published",
  slug: { not: null },
} as const;

async function fetchArticles(props: Props): Promise<ArticleRow[]> {
  let resolvedSubsidyId: string | null = null;
  let fallbackKeyword: string | null = null;

  if (props.subsidyId) {
    resolvedSubsidyId = props.subsidyId;
    // フォールバック用に補助金名を取得
    const grant = await prisma.subsidyGrant.findUnique({
      where: { id: props.subsidyId },
      select: { name: true },
    });
    fallbackKeyword = grant?.name ?? null;
  } else if (props.grantNameContains) {
    const grant = await prisma.subsidyGrant.findFirst({
      where: { name: { contains: props.grantNameContains } },
      select: { id: true },
    });
    resolvedSubsidyId = grant?.id ?? null;
    fallbackKeyword = props.grantNameContains;
  }

  // ─── 1st try: subsidyId FK 完全一致 ───────────────────────
  if (resolvedSubsidyId) {
    const articles = await prisma.generatedContent.findMany({
      where: { ...ARTICLE_WHERE_BASE, subsidyId: resolvedSubsidyId },
      orderBy: { publishedAt: "desc" },
      take: 3,
      select: ARTICLE_SELECT,
    });
    if (articles.length > 0) return articles;
  }

  // ─── 2nd try: 記事タイトルのキーワード一致（フォールバック） ──
  if (fallbackKeyword) {
    const articles = await prisma.generatedContent.findMany({
      where: {
        ...ARTICLE_WHERE_BASE,
        title: { contains: fallbackKeyword },
      },
      orderBy: { publishedAt: "desc" },
      take: 3,
      select: ARTICLE_SELECT,
    });
    if (articles.length > 0) return articles;
  }

  return [];
}

export default async function ArticleRelatedSection(props: Props) {
  const articles = await fetchArticles(props);
  if (articles.length === 0) return null;

  return (
    <section className="bg-[#F3F6FA] py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* 見出し */}
        <div className="mb-10 text-center">
          <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#E8F0FE] px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#1a4c8e]">
            <BookOpen className="h-3.5 w-3.5" />
            解説記事
          </span>
          <h2 className="mt-3 text-2xl font-bold text-[#0B173A] md:text-3xl">
            この補助金の解説記事を読む
          </h2>
          <p className="mt-2 text-sm text-[#4B5563]">
            専門家が詳しく解説。活用方法・申請の流れをまとめています。
          </p>
        </div>

        {/* 記事カードグリッド */}
        <div
          className={`grid gap-5 ${
            articles.length === 1
              ? "mx-auto max-w-md grid-cols-1"
              : articles.length === 2
                ? "mx-auto max-w-2xl grid-cols-1 sm:grid-cols-2"
                : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          }`}
        >
          {articles.filter((a) => a.slug).map((article) => (
            <Link
              key={article.slug}
              href={`/subsidies/articles/${article.slug}`}
              className="group flex flex-col rounded-2xl border border-[#DDE3F0] bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
            >
              <div className="mb-3 flex items-center gap-2">
                <span className="rounded-md bg-[#EEF2FF] px-2.5 py-1 text-[11px] font-bold text-[#3B5FC7]">
                  解説
                </span>
              </div>
              <h3 className="mb-2 line-clamp-3 flex-1 text-[15px] font-bold leading-snug text-[#0B173A] group-hover:text-[#1a4c8e]">
                {article.title ?? "記事タイトル"}
              </h3>
              {article.excerpt && (
                <p className="mb-4 line-clamp-2 text-[12.5px] leading-relaxed text-[#6B7280]">
                  {article.excerpt}
                </p>
              )}
              <span className="mt-auto inline-flex items-center gap-1 text-xs font-bold text-[#1a4c8e] group-hover:gap-2 transition-all">
                記事を読む
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          ))}
        </div>

        {/* 記事一覧へのリンク */}
        <div className="mt-10 text-center">
          <Link
            href="/subsidies/articles"
            className="inline-flex items-center gap-2 rounded-full border-2 border-[#0B173A] bg-white px-7 py-3 text-sm font-bold text-[#0B173A] transition-all hover:bg-[#0B173A] hover:text-white"
          >
            すべての解説記事を見る
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

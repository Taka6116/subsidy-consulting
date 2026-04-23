"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const ALL = "__all__";

export type ArticleCard = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  /** 記事が紐づく補助金名（サムネイル中央に先頭 20 文字を表示） */
  subsidyName: string;
  /** 最大補助額ラベル（例: "最大 3,000万円"）。無ければサムネ下部は非表示 */
  maxAmountLabel: string | null;
  tags: string[];
};

const CATEGORY_KEYS = ["補助金基礎", "設備投資", "事業計画", "申請準備"] as const;
type CategoryKey = (typeof CATEGORY_KEYS)[number];

/**
 * カテゴリ別スタイル。タグに含まれる最初のカテゴリキーを採用し、
 * 無ければデフォルトのグレーにフォールバックする。
 */
const CATEGORY_STYLES: Record<CategoryKey | "default", { bg: string; label: string }> = {
  補助金基礎: { bg: "#1B3A5C", label: "補助金基礎" },
  設備投資: { bg: "#185FA5", label: "設備投資" },
  事業計画: { bg: "#0F6E56", label: "事業計画" },
  申請準備: { bg: "#BA7517", label: "申請準備" },
  default: { bg: "#444441", label: "お役立ち情報" },
};

function resolveCategory(tags: string[]): CategoryKey | null {
  for (const t of tags) {
    if ((CATEGORY_KEYS as readonly string[]).includes(t)) {
      return t as CategoryKey;
    }
  }
  return null;
}

/** カードに表示するタグ：カテゴリ兼用タグと "お役立ち情報" を除外し最大 2 件 */
function visibleTags(tags: string[]): string[] {
  return tags
    .filter((t) => t !== "お役立ち情報" && !(CATEGORY_KEYS as readonly string[]).includes(t))
    .slice(0, 2);
}

function truncateSubsidyName(name: string, max = 20): string {
  if (!name) return "";
  const chars = [...name];
  return chars.length > max ? `${chars.slice(0, max).join("")}…` : name;
}

type TagOption = { label: string; count: number };

function buildTagOptions(articles: ArticleCard[]): TagOption[] {
  const map = new Map<string, number>();
  for (const a of articles) {
    for (const t of a.tags) {
      if (t === "お役立ち情報") continue;
      map.set(t, (map.get(t) ?? 0) + 1);
    }
  }
  return [...map.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => a.label.localeCompare(b.label, "ja"));
}

export default function SubsidiesArticlesIndex({
  articles,
}: {
  articles: ArticleCard[];
}) {
  const [selectedTag, setSelectedTag] = useState<string>(ALL);
  const tagOptions = useMemo(() => buildTagOptions(articles), [articles]);

  const filtered: ArticleCard[] = useMemo(() => {
    if (selectedTag === ALL) return articles;
    return articles.filter((a) => a.tags.includes(selectedTag));
  }, [articles, selectedTag]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 lg:py-14">
      <div className="flex flex-col gap-10 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1">
          <h1 className="font-heading text-3xl font-normal text-neutral-900 sm:text-4xl">
            解説記事
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-neutral-600 sm:text-base">
            補助金・支援制度に関する解説を順次公開します。新しい制度が公募されるたびに自動で更新されます。
          </p>

          {articles.length === 0 ? (
            <div className="mt-12 rounded-lg border border-neutral-200 bg-white p-8 text-center">
              <p className="text-sm text-neutral-600">
                現在公開中の記事はありません。新しい補助金制度の公募が解禁され次第、順次追加されます。
              </p>
            </div>
          ) : (
            <>
              <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
                {filtered.map((article) => {
                  const categoryKey = resolveCategory(article.tags);
                  const style = categoryKey
                    ? CATEGORY_STYLES[categoryKey]
                    : CATEGORY_STYLES.default;
                  const tags = visibleTags(article.tags);
                  const shortName = truncateSubsidyName(article.subsidyName);
                  return (
                    <Link
                      key={article.id}
                      href={`/subsidies/articles/${article.slug}`}
                      className="group flex flex-col overflow-hidden rounded-lg border border-neutral-200/90 bg-white shadow-sm transition hover:shadow-md"
                    >
                      {/* サムネイル: カテゴリ別ソリッドカラー + 補助金名 + 最大額 */}
                      <div
                        className="relative aspect-[16/9] w-full shrink-0 overflow-hidden"
                        style={{ backgroundColor: style.bg }}
                      >
                        <div className="relative flex h-full flex-col justify-between p-4 text-white sm:p-5">
                          <p
                            className="font-medium uppercase tracking-wide opacity-80"
                            style={{ fontSize: "0.7rem" }}
                          >
                            {style.label}
                          </p>
                          <p
                            className="font-semibold leading-snug"
                            style={{ fontSize: "1rem", fontWeight: 600 }}
                          >
                            {shortName}
                          </p>
                          {article.maxAmountLabel ? (
                            <p
                              className="opacity-90"
                              style={{ fontSize: "0.85rem" }}
                            >
                              {article.maxAmountLabel}
                            </p>
                          ) : (
                            <span aria-hidden className="block h-[0.85rem]" />
                          )}
                        </div>
                      </div>

                      {/* カード本文 */}
                      <div className="flex flex-1 flex-col p-4 sm:p-5">
                        {/* 1. タグ（最大 2） */}
                        {tags.length > 0 && (
                          <p className="flex flex-wrap gap-x-2 gap-y-1 text-xs text-neutral-700">
                            {tags.map((t) => (
                              <span key={t} className="text-neutral-600">
                                #{t}
                              </span>
                            ))}
                          </p>
                        )}

                        {/* 2. タイトル */}
                        <h2
                          className="mt-2 line-clamp-2 leading-snug text-neutral-900 group-hover:text-primary-700"
                          style={{ fontSize: "1.125rem", fontWeight: 700 }}
                        >
                          {article.title}
                        </h2>

                        {/* 3. 本文抜粋 */}
                        <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-neutral-600">
                          {article.excerpt}
                        </p>

                        {/* 4. 日付（最下部） */}
                        {article.publishedAt && (
                          <p
                            className="mt-3 text-neutral-500"
                            style={{ fontSize: "0.75rem" }}
                          >
                            {article.publishedAt}
                          </p>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>

              {filtered.length === 0 && (
                <p className="mt-8 text-center text-neutral-600">
                  該当する記事がありません。
                </p>
              )}
            </>
          )}
        </div>

        {articles.length > 0 && (
          <aside className="w-full shrink-0 lg:sticky lg:top-28 lg:w-72">
            <div className="rounded-lg border border-neutral-200/80 bg-white p-5 shadow-sm">
              <h2 className="border-b border-neutral-200 pb-2 text-sm font-semibold text-neutral-900">
                タグで絞り込む
              </h2>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTag(ALL)}
                  className={`rounded-full px-3 py-1.5 text-xs transition sm:text-sm ${
                    selectedTag === ALL
                      ? "bg-primary-700 text-white"
                      : "border border-neutral-200 bg-white text-neutral-800 hover:border-neutral-300"
                  }`}
                >
                  全て（{articles.length}）
                </button>
                {tagOptions.map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setSelectedTag(opt.label)}
                    className={`rounded-full px-3 py-1.5 text-xs transition sm:text-sm ${
                      selectedTag === opt.label
                        ? "bg-primary-700 text-white"
                        : "border border-neutral-200 bg-white text-neutral-800 hover:border-neutral-300"
                    }`}
                  >
                    {opt.label}（{opt.count}）
                  </button>
                ))}
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

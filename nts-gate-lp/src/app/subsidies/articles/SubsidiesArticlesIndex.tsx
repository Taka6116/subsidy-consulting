"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";

const ALL = "__all__";
const PAGE_SIZE = 12;

export type ArticleCard = {
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
};

/** カードのタグ pill に表示するタグ（「お役立ち情報」除外・最大3件） */
function visibleTags(tags: string[]): string[] {
  return tags.filter((t) => t !== "お役立ち情報").slice(0, 3);
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
    .sort((a, b) => b.count - a.count);
}

export default function SubsidiesArticlesIndex({
  articles,
}: {
  articles: ArticleCard[];
}) {
  const [selectedTag, setSelectedTag] = useState<string>(ALL);
  const [showAllTags, setShowAllTags] = useState(false);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const inputRef = useRef<HTMLInputElement>(null);

  const tagOptions = useMemo(() => buildTagOptions(articles), [articles]);

  const visibleTagOpts = useMemo(
    () => (showAllTags ? tagOptions : tagOptions.filter((o) => o.count >= 3)),
    [tagOptions, showAllTags],
  );
  const hiddenCount = tagOptions.length - visibleTagOpts.length;

  const filtered: ArticleCard[] = useMemo(() => {
    let list = articles;

    // タグ絞り込み
    if (selectedTag !== ALL) {
      list = list.filter((a) => a.tags.includes(selectedTag));
    }

    // キーワード検索（タイトル・補助金名・excerpt・都道府県・タグ）
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.subsidyName.toLowerCase().includes(q) ||
          a.excerpt.toLowerCase().includes(q) ||
          (a.prefecture ?? "").toLowerCase().includes(q) ||
          a.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }

    return list;
  }, [articles, selectedTag, query]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const paginated = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page],
  );

  function handleTagSelect(tag: string) {
    setSelectedTag(tag);
    setPage(1);
  }

  function handleQueryChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
    setPage(1);
  }

  function clearQuery() {
    setQuery("");
    inputRef.current?.focus();
    setPage(1);
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 lg:py-14">
      <div className="flex flex-col gap-10 lg:flex-row lg:items-start">
        {/* メインコンテンツ */}
        <div className="min-w-0 flex-1">
          <h1 className="font-heading text-3xl font-normal text-neutral-900 sm:text-4xl">
            解説記事
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-neutral-600 sm:text-base">
            補助金・支援制度に関する解説を順次公開します。新しい制度が公募されるたびに自動で更新されます。
          </p>

          {/* キーワード検索窓 */}
          <div className="mt-6 max-w-xl">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                aria-hidden
              />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={handleQueryChange}
                placeholder="記事タイトル・補助金名・キーワードで検索"
                className="w-full rounded-lg border border-neutral-200 bg-white py-3 pl-10 pr-10 text-sm text-neutral-800 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
              {query && (
                <button
                  type="button"
                  onClick={clearQuery}
                  aria-label="検索をクリア"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            {query.trim() && (
              <p className="mt-2 text-xs text-gray-500">
                「<span className="font-medium text-gray-700">{query.trim()}</span>」の検索結果：
                <span className="font-semibold text-gray-800"> {filtered.length}件</span>
              </p>
            )}
          </div>

          {articles.length === 0 ? (
            <div className="mt-12 rounded-lg border border-neutral-200 bg-white p-8 text-center">
              <p className="text-sm text-neutral-600">
                現在公開中の記事はありません。新しい補助金制度の公募が解禁され次第、順次追加されます。
              </p>
            </div>
          ) : (
            <>
              <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {paginated.map((article) => {
                  const pills = visibleTags(article.tags);
                  return (
                    <Link
                      key={article.id}
                      href={`/subsidies/articles/${article.slug}`}
                      className="group flex flex-col overflow-hidden rounded-lg border border-neutral-200/90 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                    >
                      {/* ミニヘッダーエリア（サムネ代替） */}
                      <div className="border-b border-gray-100 bg-white p-4">
                        {/* タグ pill（最大3個） */}
                        {pills.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {pills.map((t) => (
                              <span
                                key={t}
                                className="rounded-full border border-gray-300 px-2.5 py-0.5 text-gray-600"
                                style={{ fontSize: "0.7rem" }}
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* 補助金名 */}
                        <p
                          className="mt-2.5 line-clamp-2 font-bold leading-snug text-gray-900"
                          style={{ fontSize: "0.95rem" }}
                        >
                          {article.subsidyName || article.title}
                        </p>

                        {/* 補助上限 + 公募期限 */}
                        {(article.maxAmountLabel || article.deadlineLabel) && (
                          <div
                            className="mt-2.5 flex items-stretch overflow-hidden rounded-lg bg-gray-50"
                            style={{ padding: "8px 12px" }}
                          >
                            {article.maxAmountLabel && (
                              <div className="flex flex-col">
                                <span
                                  className="text-gray-400"
                                  style={{ fontSize: "0.65rem" }}
                                >
                                  補助上限
                                </span>
                                <span
                                  className="font-semibold text-gray-800"
                                  style={{ fontSize: "0.8rem" }}
                                >
                                  {article.maxAmountLabel}
                                </span>
                              </div>
                            )}
                            {article.maxAmountLabel && article.deadlineLabel && (
                              <div
                                className="mx-3 self-stretch"
                                style={{ borderLeft: "1px solid #e5e7eb" }}
                                aria-hidden
                              />
                            )}
                            {article.deadlineLabel && (
                              <div className="flex flex-col">
                                <span
                                  className="text-gray-400"
                                  style={{ fontSize: "0.65rem" }}
                                >
                                  公募期限
                                </span>
                                <span
                                  className="font-semibold text-gray-800"
                                  style={{ fontSize: "0.8rem" }}
                                >
                                  {article.deadlineLabel}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* カード本体 */}
                      <div className="flex flex-1 flex-col px-4 py-3">
                        {/* 本文抜粋 */}
                        <p
                          className="line-clamp-2 flex-1 leading-relaxed text-gray-500"
                          style={{ fontSize: "0.85rem" }}
                        >
                          {article.excerpt}
                        </p>

                        {/* 日付 + 地域 */}
                        <div className="mt-2 flex items-center justify-between">
                          {article.publishedAt && (
                            <span
                              className="text-gray-400"
                              style={{ fontSize: "0.75rem" }}
                            >
                              {article.publishedAt}
                            </span>
                          )}
                          {article.prefecture && (
                            <span
                              className="text-blue-600"
                              style={{ fontSize: "0.75rem" }}
                            >
                              {article.prefecture}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {paginated.length === 0 && (
                <p className="mt-8 text-center text-neutral-600">
                  該当する記事がありません。
                </p>
              )}

              {/* ページネーション */}
              {totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 transition hover:border-gray-300 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    前へ
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPage(p)}
                      className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                        p === page
                          ? "bg-primary-700 text-white"
                          : "border border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      {p}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 transition hover:border-gray-300 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    次へ
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* サイドバー */}
        {articles.length > 0 && (
          <aside className="w-full shrink-0 lg:sticky lg:top-28 lg:w-72">
            <div className="rounded-lg border border-neutral-200/80 bg-white p-5 shadow-sm">
              <h2 className="border-b border-neutral-200 pb-2 text-sm font-semibold text-neutral-900">
                タグで絞り込む
              </h2>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleTagSelect(ALL)}
                  className={`rounded-full px-3 py-1.5 text-xs transition sm:text-sm ${
                    selectedTag === ALL
                      ? "bg-primary-700 text-white"
                      : "border border-neutral-200 bg-white text-neutral-800 hover:border-neutral-300"
                  }`}
                >
                  全て（{articles.length}）
                </button>
                {visibleTagOpts.map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => handleTagSelect(opt.label)}
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

              {hiddenCount > 0 && (
                <button
                  type="button"
                  onClick={() => setShowAllTags(true)}
                  className="mt-3 text-xs text-blue-600 hover:underline"
                >
                  もっと見る（{hiddenCount}個）
                </button>
              )}
              {showAllTags && hiddenCount > 0 && (
                <button
                  type="button"
                  onClick={() => setShowAllTags(false)}
                  className="mt-2 text-xs text-gray-400 hover:underline"
                >
                  閉じる
                </button>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

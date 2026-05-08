"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import {
  BellRing,
  Search,
  X,
} from "lucide-react";

const ALL = "__all__";
const PAGE_SIZE = 12;

export type ArticleCard = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  publishedAtIso: string | null;
  subsidyName: string;
  maxAmountLabel: string | null;
  deadlineLabel: string | null;
  prefecture: string | null;
  tags: string[];
  heroImagePath: string | null;
};

export type ArticlesPortalData = {
  tickerItems: Array<{
    id: string;
    slug: string;
    title: string;
    isNew: boolean;
    isClosingSoon: boolean;
    publishedAtIso: string | null;
  }>;
  stats: {
    newArticlesCount: number;
    openCount: number;
    closingSoonCount: number;
    totalCount: number;
  };
  popularCategories: Array<{ label: string; count: number }>;
  deadlineRanking: Array<{
    id: string;
    slug: string;
    title: string;
    deadlineLabel: string | null;
    daysLeft: number;
  }>;
  featured: {
    slug: string;
    title: string;
    subsidyName: string;
    imagePath: string | null;
    publishedAtIso: string | null;
  } | null;
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
  portalData,
}: {
  articles: ArticleCard[];
  portalData: ArticlesPortalData;
}) {
  const [selectedTag, setSelectedTag] = useState<string>(ALL);
  const [showAllTags, setShowAllTags] = useState(false);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribeDone, setSubscribeDone] = useState(false);
  const [subscribeError, setSubscribeError] = useState<string | null>(null);
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
  const tickerLoopItems = useMemo(
    () =>
      portalData.tickerItems.length > 0
        ? [...portalData.tickerItems, ...portalData.tickerItems]
        : [],
    [portalData.tickerItems],
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

  async function handleSubscribe(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.trim() || isSubscribing) return;
    setIsSubscribing(true);
    setSubscribeError(null);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          source: "articles-index-sidebar",
        }),
      });
      if (!res.ok) {
        const json = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(json?.error ?? "登録に失敗しました。");
      }
      setSubscribeDone(true);
      setEmail("");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "登録に失敗しました。";
      setSubscribeError(message);
    } finally {
      setIsSubscribing(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1720px] px-3 py-8 sm:px-4 lg:px-6 lg:py-10 xl:px-4 2xl:px-2">
      <section className="mb-4 rounded-xl border border-blue-100 bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-700 px-2.5 py-1 text-xs font-bold text-white">
            <BellRing className="h-3.5 w-3.5" />
            最新速報
          </span>
          <div className="relative min-w-0 flex-1 overflow-hidden">
            {tickerLoopItems.length > 0 ? (
              <div className="ticker-marquee flex w-max items-center gap-3 whitespace-nowrap">
                {tickerLoopItems.map((item, index) => (
                  <Link
                    key={`${item.id}-${index}`}
                    href={`/subsidies/articles/${item.slug}`}
                    className="inline-flex items-center gap-2 text-xs text-neutral-700 hover:text-primary-700"
                  >
                    {item.isNew && (
                      <span className="rounded bg-pink-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                        NEW
                      </span>
                    )}
                    {item.isClosingSoon && (
                      <span className="rounded bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                        締切間近
                      </span>
                    )}
                    <span className="max-w-[320px] truncate">{item.title}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-xs text-neutral-500">
                現在表示できる速報記事はありません。
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-12 lg:items-start">
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm lg:col-span-7 lg:h-[372px]">
          {portalData.featured ? (
            <Link
              href={`/subsidies/articles/${portalData.featured.slug}`}
              className="group block h-full"
            >
              <div
                className="relative h-[250px] bg-cover bg-center sm:h-[300px] lg:h-full"
                style={
                  portalData.featured.imagePath
                    ? { backgroundImage: `url(${portalData.featured.imagePath})` }
                    : undefined
                }
              >
                {!portalData.featured.imagePath && (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#0e357f] to-[#28a4a3]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/45 to-black/20" />
                <div className="absolute bottom-0 left-0 right-0 p-5 text-white sm:p-6">
                  <span className="inline-flex rounded bg-red-500 px-2 py-0.5 text-[10px] font-bold">
                    注目解説
                  </span>
                  <p className="mt-2 text-sm text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]">
                    {portalData.featured.subsidyName}
                  </p>
                  <h2 className="mt-1 line-clamp-2 text-xl font-black leading-snug text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] sm:text-2xl">
                    {portalData.featured.title}
                  </h2>
                </div>
              </div>
            </Link>
          ) : (
            <div className="flex h-[250px] items-center justify-center text-sm text-neutral-500 sm:h-[300px] lg:h-full">
              注目記事を準備中です
            </div>
          )}
        </div>

        <div className="space-y-4 lg:col-span-5">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-900">最新の補助金動向</h3>
              <span className="text-xs text-neutral-400">今週更新</span>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <div className="rounded-lg bg-neutral-50 p-2.5 sm:p-3">
                <p className="text-xs text-neutral-500">新着記事</p>
                <p className="mt-1 text-xl font-black text-primary-700">
                  {portalData.stats.newArticlesCount}件
                </p>
              </div>
              <div className="rounded-lg bg-neutral-50 p-2.5 sm:p-3">
                <p className="text-xs text-neutral-500">公募中補助金</p>
                <p className="mt-1 text-xl font-black text-primary-700">
                  {portalData.stats.openCount}件
                </p>
              </div>
              <div className="rounded-lg bg-neutral-50 p-2.5 sm:p-3">
                <p className="text-xs text-neutral-500">締切間近</p>
                <p className="mt-1 text-xl font-black text-amber-600">
                  {portalData.stats.closingSoonCount}件
                </p>
              </div>
              <div className="rounded-lg bg-neutral-50 p-2.5 sm:p-3">
                <p className="text-xs text-neutral-500">総記事数</p>
                <p className="mt-1 text-xl font-black text-primary-700">
                  {portalData.stats.totalCount}件
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-bold text-neutral-900">人気カテゴリ</h3>
            <div className="grid grid-cols-2 gap-2">
              {portalData.popularCategories.map((c) => (
                <button
                  key={c.label}
                  type="button"
                  onClick={() => handleTagSelect(c.label)}
                  className="rounded-lg border border-neutral-200 px-3 py-2 text-left text-xs text-neutral-700 transition hover:border-primary-300 hover:bg-primary-50"
                >
                  <p className="line-clamp-1 font-semibold">{c.label}</p>
                  <p className="mt-0.5 text-[11px] text-neutral-400">{c.count}記事</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-4 grid gap-4 md:grid-cols-2">
        <section className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-5 shadow-sm">
          <h3 className="text-sm font-bold text-neutral-900">
            あなたに合う補助金を無料診断
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-neutral-600">
            かんたん質問に答えるだけで、申請可能性の高い補助金を判定します。
          </p>
          <Link
            href="/check"
            className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-primary-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-primary-600"
          >
            無料で診断してみる
          </Link>
        </section>

        <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-bold text-neutral-900">最新情報をメールで受け取る</h3>
          <p className="mt-1 text-xs text-neutral-500">
            新着記事や公募情報をまとめてお届けします。
          </p>
          <form onSubmit={handleSubscribe} className="mt-3 space-y-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="メールアドレスを入力"
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              required
            />
            <button
              type="submit"
              disabled={isSubscribing}
              className="w-full rounded-lg bg-primary-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-primary-600 disabled:opacity-50"
            >
              {isSubscribing ? "登録中..." : "登録する"}
            </button>
          </form>
          {subscribeDone && (
            <p className="mt-2 text-xs text-emerald-600">登録が完了しました。</p>
          )}
          {subscribeError && (
            <p className="mt-2 text-xs text-red-500">{subscribeError}</p>
          )}
        </section>
      </section>

      <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1">
          <section className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
            <div className="grid gap-3 lg:grid-cols-[2fr_1fr]">
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
                  className="w-full rounded-lg border border-neutral-200 bg-white py-2.5 pl-10 pr-10 text-sm text-neutral-800 outline-none transition placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
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
              <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap">
                <button
                  type="button"
                  onClick={() => handleTagSelect(ALL)}
                  className={`rounded-full px-3 py-1.5 text-xs transition ${
                    selectedTag === ALL
                      ? "bg-primary-700 text-white"
                      : "border border-neutral-200 bg-white text-neutral-800 hover:border-neutral-300"
                  }`}
                >
                  すべてのタグ
                </button>
                {visibleTagOpts.slice(0, 5).map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => handleTagSelect(opt.label)}
                    className={`rounded-full px-3 py-1.5 text-xs transition ${
                      selectedTag === opt.label
                        ? "bg-primary-700 text-white"
                        : "border border-neutral-200 bg-white text-neutral-800 hover:border-neutral-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-neutral-500">
              <span>
                全{articles.length}件中 <span className="font-semibold text-neutral-800">{filtered.length}</span>件表示
              </span>
              {hiddenCount > 0 && (
                <button
                  type="button"
                  onClick={() => setShowAllTags((v) => !v)}
                  className="text-primary-700 hover:underline"
                >
                  {showAllTags ? "タグを閉じる" : `タグをもっと見る（${hiddenCount}個）`}
                </button>
              )}
            </div>

            {showAllTags && (
              <div className="mt-3 flex flex-wrap gap-2">
                {tagOptions.map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => handleTagSelect(opt.label)}
                    className={`rounded-full px-3 py-1.5 text-xs transition ${
                      selectedTag === opt.label
                        ? "bg-primary-700 text-white"
                        : "border border-neutral-200 bg-white text-neutral-800 hover:border-neutral-300"
                    }`}
                  >
                    {opt.label}（{opt.count}）
                  </button>
                ))}
              </div>
            )}
          </section>

          {articles.length === 0 ? (
            <div className="mt-8 rounded-lg border border-neutral-200 bg-white p-8 text-center">
              <p className="text-sm text-neutral-600">
                現在公開中の記事はありません。新しい補助金制度の公募が解禁され次第、順次追加されます。
              </p>
            </div>
          ) : (
            <>
              <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3">
                {paginated.map((article) => {
                  const pills = visibleTags(article.tags);
                  return (
                    <Link
                      key={article.id}
                      href={`/subsidies/articles/${article.slug}`}
                      className="group flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                    >
                      <div
                        className="relative h-40 bg-cover bg-center"
                        style={
                          article.heroImagePath
                            ? { backgroundImage: `url(${article.heroImagePath})` }
                            : undefined
                        }
                      >
                        {!article.heroImagePath && (
                          <div className="absolute inset-0 bg-gradient-to-br from-[#0e357f] to-[#28a4a3]" />
                        )}
                        <div className="absolute inset-0 bg-black/20" />
                        <div className="absolute left-3 top-3 flex gap-1.5">
                          {pills.slice(0, 1).map((t) => (
                            <span
                              key={t}
                              className="rounded bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-neutral-700"
                            >
                              {t}
                            </span>
                          ))}
                          {article.deadlineLabel && (
                            <span className="rounded bg-emerald-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                              公募中
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-1 flex-col p-4">
                        <h3 className="line-clamp-2 text-[15px] font-bold leading-snug text-neutral-900 group-hover:text-primary-700">
                          {article.title}
                        </h3>
                        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-neutral-500">
                          {article.excerpt}
                        </p>
                        <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                          <div className="rounded bg-neutral-50 px-2 py-1.5">
                            <p className="text-neutral-400">補助上限</p>
                            <p className="font-semibold text-neutral-700 line-clamp-1">
                              {article.maxAmountLabel ?? "要確認"}
                            </p>
                          </div>
                          <div className="rounded bg-neutral-50 px-2 py-1.5">
                            <p className="text-neutral-400">公募期限</p>
                            <p className="font-semibold text-neutral-700 line-clamp-1">
                              {article.deadlineLabel ?? "要確認"}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between text-[11px] text-neutral-400">
                          <span>{article.publishedAt || "-"}</span>
                          <span className="text-primary-700">{article.prefecture ?? "全国"}</span>
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

        <aside className="w-full shrink-0 space-y-4 lg:sticky lg:top-24 lg:w-[360px]">
          <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-bold text-neutral-900">公募締め切り間近の補助金</h2>
            <ol className="space-y-2">
              {portalData.deadlineRanking.map((item, index) => (
                <li key={item.id}>
                  <Link
                    href={`/subsidies/articles/${item.slug}`}
                    className="group flex items-start gap-2 rounded-lg border border-neutral-100 px-3 py-2 hover:border-primary-200 hover:bg-primary-50"
                  >
                    <span className="mt-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 text-[10px] font-bold text-white">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="line-clamp-2 text-xs font-semibold text-neutral-800 group-hover:text-primary-700">
                        {item.title}
                      </p>
                      <p className="mt-0.5 text-[11px] text-neutral-500">
                        締切まであと{item.daysLeft}日
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        </aside>
      </div>

      <style jsx>{`
        .ticker-marquee {
          animation: tickerScroll 36s linear infinite;
        }

        @keyframes tickerScroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}

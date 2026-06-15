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

/** ページ数が多いときも 1 ページ目と現在ページ周辺が必ず見えるよう省略表示用の配列を返す */
function getVisiblePageNumbers(
  current: number,
  total: number,
): Array<number | "ellipsis"> {
  if (total <= 9) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const set = new Set<number>([1, total]);
  for (let p = current - 2; p <= current + 2; p++) {
    if (p >= 1 && p <= total) set.add(p);
  }

  const sorted = [...set].sort((a, b) => a - b);
  const out: Array<number | "ellipsis"> = [];
  for (let i = 0; i < sorted.length; i++) {
    const n = sorted[i]!;
    if (i > 0 && n - sorted[i - 1]! > 1) out.push("ellipsis");
    out.push(n);
  }
  return out;
}

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
    isNew?: boolean;
    isDeadlineSoon?: boolean;
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
  const gridRef = useRef<HTMLDivElement>(null);

  const tagOptions = useMemo(() => buildTagOptions(articles), [articles]);

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
    // カテゴリーカードからのクリック時はグリッドまでスムーズスクロール
    requestAnimationFrame(() => {
      gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
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
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold text-white shadow-sm [background:var(--nts-gradient-primary)]">
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
                      <span className="rounded px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm [background:var(--nts-gradient-new)]">
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
        <div className="space-y-4 lg:col-span-7">
          <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm lg:h-[372px]">
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
                  {/* 選定理由バッジ（左上） */}
                  <div className="absolute left-3 top-3 flex gap-1.5">
                    {portalData.featured.isDeadlineSoon && (
                      <span className="rounded bg-orange-500 px-2 py-1 text-[10px] font-bold text-white">
                        締切間近
                      </span>
                    )}
                    <span className="rounded bg-blue-700 px-2 py-1 text-[10px] font-bold text-white">
                      注目解説
                    </span>
                    {portalData.featured.isNew && (
                      <span className="rounded bg-green-600 px-2 py-1 text-[10px] font-bold text-white">
                        新着
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-5 text-white sm:p-6">
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

          {/* 注目解説直下（左カラム）にCTA2ボックス — グリッドで同じ高さにし、主ボタンを下端で揃える */}
          <section className="grid gap-4 md:grid-cols-2 md:items-stretch">
            <section className="flex h-full min-h-0 flex-col rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-5 shadow-sm">
              <h3 className="text-sm font-bold text-neutral-900">
                あなたに合う補助金を無料診断
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-neutral-600">
                かんたん質問に答えるだけで、申請可能性の高い補助金を判定します。
              </p>
              <div className="mt-auto pt-4">
                <Link
                  href="/check"
                  className="inline-flex h-11 w-full items-center justify-center rounded-lg px-4 text-sm font-bold text-white transition hover:brightness-110 [background:linear-gradient(135deg,#0d9488_0%,#10b981_52%,#34d399_100%)]"
                >
                  無料で診断してみる
                </Link>
              </div>
            </section>

            <section className="flex h-full min-h-0 flex-col rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-bold text-neutral-900">最新情報をメールで受け取る</h3>
              <p className="mt-1 text-xs text-neutral-500">
                新着記事や公募情報をまとめてお届けします。
              </p>
              <form
                onSubmit={handleSubscribe}
                className="mt-3 flex min-h-0 flex-1 flex-col gap-2"
              >
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
                  className="mt-auto inline-flex h-11 w-full shrink-0 items-center justify-center rounded-lg px-4 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-50 [background:linear-gradient(135deg,#0d9488_0%,#10b981_52%,#34d399_100%)]"
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
        </div>

        <div className="space-y-4 lg:col-span-5">
          {/* ── 最新の補助金動向 ── */}
          <div
            className="rounded-[20px] p-5"
            style={{
              background:
                "radial-gradient(circle at top right, rgba(56,189,248,0.06), transparent 26%), linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)",
              border: "1px solid rgba(15,39,71,0.08)",
              boxShadow: "0 16px 40px rgba(15,23,42,0.05), 0 2px 8px rgba(15,23,42,0.02)",
            }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold tracking-wide" style={{ color: "#0f2747" }}>
                最新の補助金動向
              </h3>
              {portalData.stats.newArticlesCount > 0 && (
                <span
                  className="rounded-full px-3 py-[3px] text-[11px] font-semibold"
                  style={{
                    background: "linear-gradient(180deg, #f2fffc 0%, #ecfbff 100%)",
                    border: "1px solid rgba(45,212,191,0.22)",
                    color: "#2a7c78",
                    boxShadow: "0 4px 12px rgba(15,23,42,0.04)",
                  }}
                >
                  今週更新
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              {/* 新着記事 */}
              <div
                className="rounded-[16px] p-2.5 transition-all duration-[220ms] hover:-translate-y-0.5 sm:p-3"
                style={{
                  background: "linear-gradient(180deg, #ffffff 0%, #fbfdff 100%)",
                  border: "1px solid rgba(15,39,71,0.06)",
                  boxShadow: "0 6px 18px rgba(15,23,42,0.03), 0 1px 4px rgba(15,23,42,0.02)",
                }}
              >
                <p className="text-xs font-medium" style={{ color: "#5f6f86" }}>最新記事</p>
                <p className="mt-1 text-xl font-black" style={{ color: "#1d4ed8" }}>
                  {portalData.stats.newArticlesCount > 0
                    ? `${portalData.stats.newArticlesCount}件`
                    : "随時更新中"}
                </p>
              </div>
              {/* 公募中補助金 */}
              <div
                className="rounded-[16px] p-2.5 transition-all duration-[220ms] hover:-translate-y-0.5 sm:p-3"
                style={{
                  background: "linear-gradient(180deg, #ffffff 0%, #fbfdff 100%)",
                  border: "1px solid rgba(15,39,71,0.06)",
                  boxShadow: "0 6px 18px rgba(15,23,42,0.03), 0 1px 4px rgba(15,23,42,0.02)",
                }}
              >
                <p className="text-xs font-medium" style={{ color: "#5f6f86" }}>公募中補助金</p>
                <p className="mt-1 text-xl font-black" style={{ color: "#1e40af" }}>
                  {portalData.stats.openCount}件
                </p>
              </div>
              {/* 締切間近 */}
              <div
                className="rounded-[16px] p-2.5 transition-all duration-[220ms] hover:-translate-y-0.5 sm:p-3"
                style={{
                  background:
                    "radial-gradient(circle at top right, rgba(245,158,11,0.08), transparent 24%), linear-gradient(180deg, #ffffff 0%, #fffcf6 100%)",
                  border: "1px solid rgba(15,39,71,0.06)",
                  boxShadow: "0 6px 18px rgba(15,23,42,0.03), 0 1px 4px rgba(15,23,42,0.02)",
                }}
              >
                <p className="text-xs font-medium" style={{ color: "#5f6f86" }}>締切間近</p>
                <p className="mt-1 text-xl font-black" style={{ color: "#c98900" }}>
                  {portalData.stats.closingSoonCount}件
                </p>
              </div>
              {/* 総記事数 */}
              <div
                className="rounded-[16px] p-2.5 transition-all duration-[220ms] hover:-translate-y-0.5 sm:p-3"
                style={{
                  background: "linear-gradient(180deg, #ffffff 0%, #fbfdff 100%)",
                  border: "1px solid rgba(15,39,71,0.06)",
                  boxShadow: "0 6px 18px rgba(15,23,42,0.03), 0 1px 4px rgba(15,23,42,0.02)",
                }}
              >
                <p className="text-xs font-medium" style={{ color: "#5f6f86" }}>総記事数</p>
                <p className="mt-1 text-xl font-black" style={{ color: "#0f3b7a" }}>
                  {portalData.stats.totalCount}件
                </p>
              </div>
            </div>
          </div>

          {/* ── 人気カテゴリ ── */}
          <div
            className="rounded-[20px] p-5"
            style={{
              background:
                "radial-gradient(circle at top right, rgba(59,130,246,0.05), transparent 24%), linear-gradient(180deg, #ffffff 0%, #f9fbff 100%)",
              border: "1px solid rgba(15,39,71,0.08)",
              boxShadow: "0 14px 36px rgba(15,23,42,0.05), 0 2px 8px rgba(15,23,42,0.02)",
            }}
          >
            <h3 className="mb-4 text-sm font-semibold tracking-wide" style={{ color: "#0f2747" }}>
              カテゴリー
            </h3>
            <div className="grid grid-cols-2 gap-1.5">
              {portalData.popularCategories.map((c, i) => {
                const accents = ["#5da8ff", "#6c8fef", "#63c7e8", "#8b7cf6", "#4d8cff", "#58cfa0", "#f59e0b", "#10b981", "#ef4444", "#f97316"];
                const accent = accents[i % accents.length];
                return (
                  <button
                    key={c.label}
                    type="button"
                    onClick={() => handleTagSelect(c.label)}
                    className="group rounded-[12px] px-3 py-2 text-left transition-all duration-[220ms] hover:-translate-y-0.5"
                    style={{
                      background: "linear-gradient(180deg, #ffffff 0%, #fbfdff 100%)",
                      border: "1px solid rgba(15,39,71,0.06)",
                      boxShadow: "0 8px 22px rgba(15,23,42,0.04), 0 1px 4px rgba(15,23,42,0.02)",
                      borderBottom: `2px solid ${accent}33`,
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget;
                      el.style.background = "linear-gradient(135deg, rgba(239,248,255,0.96), rgba(255,255,255,0.98))";
                      el.style.borderColor = "rgba(37,99,235,0.18)";
                      el.style.boxShadow = "0 14px 32px rgba(15,23,42,0.08), 0 2px 8px rgba(15,23,42,0.03)";
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget;
                      el.style.background = "linear-gradient(180deg, #ffffff 0%, #fbfdff 100%)";
                      el.style.borderColor = "rgba(15,39,71,0.06)";
                      el.style.boxShadow = "0 8px 22px rgba(15,23,42,0.04), 0 1px 4px rgba(15,23,42,0.02)";
                    }}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <p className="line-clamp-1 text-xs font-semibold" style={{ color: "#0f2747" }}>
                        {c.label}
                      </p>
                      <svg
                        className="h-3 w-3 shrink-0 transition-transform duration-[220ms] group-hover:translate-x-0.5"
                        viewBox="0 0 12 12"
                        fill="none"
                        aria-hidden
                        style={{ color: "#8a97aa" }}
                      >
                        <path
                          d="M4 2l4 4-4 4"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
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
              {/* タグフィルタ：折りたたみ表示（件数上位10個を常時表示） */}
              <div className="flex flex-wrap gap-2">
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
                {tagOptions.slice(0, 10).map((opt) => (
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
                {showAllTags && tagOptions.slice(10).map((opt) => (
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
              {tagOptions.length > 10 && (
                <button
                  type="button"
                  onClick={() => setShowAllTags((v) => !v)}
                  className="mt-2 text-sm text-primary-700 hover:underline"
                >
                  {showAllTags ? "▲ 閉じる" : `▼ タグをもっと見る（${tagOptions.length - 10}個）`}
                </button>
              )}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-neutral-500">
              <span>
                全{articles.length}件中 <span className="font-semibold text-neutral-800">{filtered.length}</span>件表示
              </span>
            </div>
          </section>

          {articles.length === 0 ? (
            <div className="mt-8 rounded-lg border border-neutral-200 bg-white p-8 text-center">
              <p className="text-sm text-neutral-600">
                現在公開中の記事はありません。新しい補助金制度の公募が解禁され次第、順次追加されます。
              </p>
            </div>
          ) : (
            <>
              <div ref={gridRef} className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3">
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
                            <span className="rounded px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm [background:var(--nts-gradient-check)]">
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
                <div className="mt-10 flex flex-wrap items-center justify-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 transition hover:border-gray-300 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    前へ
                  </button>

                  {getVisiblePageNumbers(page, totalPages).map((item, idx) =>
                    item === "ellipsis" ? (
                      <span
                        key={`ellipsis-${idx}`}
                        className="px-1 text-sm text-gray-400"
                        aria-hidden
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setPage(item)}
                        aria-current={item === page ? "page" : undefined}
                        className={`min-w-[2.25rem] rounded-md px-3 py-1.5 text-sm font-medium transition ${
                          item === page
                            ? "bg-primary-700 text-white"
                            : "border border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        {item}
                      </button>
                    ),
                  )}

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

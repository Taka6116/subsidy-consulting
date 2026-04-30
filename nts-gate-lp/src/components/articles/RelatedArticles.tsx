// ========== [NEW 2026-04-30] 関連記事カード ==========

type Article = {
  slug: string;
  title: string;
  publishedAt: string;
  tags?: string[];
  /** サムネ画像URL（なければ省略） */
  thumbnailUrl?: string;
};

type Props = {
  articles: Article[];
};

export function RelatedArticles({ articles }: Props) {
  if (articles.length === 0) return null;

  return (
    <section className="mt-12">
      <div className="mb-5 flex items-center gap-4">
        <span className="text-sm font-semibold text-slate-700">次に読む</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {articles.slice(0, 3).map((article) => (
          <a
            key={article.slug}
            href={`/subsidies/articles/${article.slug}`}
            className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:shadow-md"
          >
            {/* タグ */}
            {article.tags && article.tags.length > 0 && (
              <span className="mb-2 inline-block self-start rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-500">
                {article.tags[0]}
              </span>
            )}

            {/* タイトル */}
            <p className="mb-3 flex-1 text-sm font-semibold leading-relaxed text-slate-800 group-hover:text-slate-900">
              {article.title}
            </p>

            {/* 日付 */}
            <p className="text-[11px] text-slate-400">
              {new Date(article.publishedAt).toLocaleDateString("ja-JP", {
                year: "numeric",
                month: "numeric",
                day: "numeric",
              })}
            </p>
          </a>
        ))}
      </div>
    </section>
  );
}

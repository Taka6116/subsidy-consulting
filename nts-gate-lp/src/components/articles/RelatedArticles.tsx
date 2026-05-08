import Link from "next/link";

type Article = {
  slug: string;
  title: string;
  publishedAt: string;
  tags?: string[];
  prefecture?: string | null;
  isOpen?: boolean;
  grantName?: string | null;
};

type Props = {
  articles: Article[];
};

const PLACEHOLDER_COLORS = [
  "from-[#0e357f] to-[#28a4a3]",
  "from-[#28a4a3] to-[#0e357f]",
  "from-[#1a4fa0] to-[#28a4a3]",
];

export function RelatedArticles({ articles }: Props) {
  if (articles.length === 0) return null;

  return (
    <section className="mt-14 border-t border-gray-200 pt-10">
      {/* セクションヘッダー */}
      <div className="mb-6 flex items-center gap-3">
        <span className="text-[11px] font-bold uppercase tracking-widest text-[#0e357f]">
          LATEST NEWS
        </span>
        <div className="h-px flex-1 bg-gray-200" />
        <span className="text-sm font-bold text-gray-600">最新・関連記事</span>
      </div>

      {/* 3カラムカード */}
      <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
        {articles.slice(0, 3).map((article, i) => {
          const date = new Date(article.publishedAt);
          const dateStr = `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
          const colorClass = PLACEHOLDER_COLORS[i % PLACEHOLDER_COLORS.length];

          return (
            <Link
              key={article.slug}
              href={`/subsidies/articles/${article.slug}`}
              className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:border-gray-300 hover:shadow-lg"
            >
              {/* サムネイル（グラデーションプレースホルダー） */}
              <div
                className={`relative h-[140px] w-full bg-gradient-to-br ${colorClass} flex items-center justify-center overflow-hidden`}
              >
                {/* 公募中バッジ */}
                {article.isOpen && (
                  <span className="absolute left-3 top-3 rounded bg-[#28a4a3] px-2 py-0.5 text-[10px] font-bold text-white shadow">
                    公募中
                  </span>
                )}
                {/* 都道府県バッジ */}
                {article.prefecture && (
                  <span className="absolute right-3 top-3 rounded bg-white/20 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                    {article.prefecture}
                  </span>
                )}
                {/* タイトルを画像内にも薄く表示 */}
                <p className="px-4 text-center text-xs font-bold leading-snug text-white/80 line-clamp-3">
                  {article.title}
                </p>
              </div>

              {/* カード本文 */}
              <div className="flex flex-1 flex-col p-4">
                {/* 日付 + タグ */}
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <time className="text-[11px] text-gray-400">{dateStr}</time>
                  {article.tags && article.tags[0] && (
                    <span className="rounded border border-[#0e357f]/25 px-2 py-0.5 text-[10px] font-medium text-[#0e357f]">
                      {article.tags[0]}
                    </span>
                  )}
                </div>

                {/* タイトル */}
                <p className="flex-1 text-sm font-bold leading-snug text-gray-800 line-clamp-3 group-hover:text-[#0e357f]">
                  {article.title}
                </p>

                {/* 補助金名（あれば） */}
                {article.grantName && (
                  <p className="mt-2 text-[11px] text-gray-400 line-clamp-1">
                    {article.grantName}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* 記事一覧へ */}
      <div className="mt-6 text-right">
        <Link
          href="/subsidies/articles"
          className="inline-flex items-center gap-1 text-sm font-bold text-[#0e357f] transition hover:underline"
        >
          VIEW ALL →
        </Link>
      </div>
    </section>
  );
}

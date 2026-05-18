import Link from "next/link";
import Image from "next/image";

const VIDEO_FALLBACK_TITLE = "補助金制度のポイント解説";

// 制度別LPプレビュー用カード（添付2枚目 LpResultCard スタイル）
// 画像は実在する /api/article-pictures の事業計画系を使用
const LP_PREVIEW_CARD = {
  url: "/api/article-pictures/%E4%BA%8B%E6%A5%AD%E8%A8%88%E7%94%BB/business-share-planing-strategy-brainstroming-concept.webp",
  alt: "事業計画・新規事業補助金LP",
  category: "事業計画・新規事業",
  name: "ものづくり・商業・サービス補助金（21次締切）",
  targetLine: "新規事業・事業再構築を検討する企業向け",
  copy: "新製品開発・生産プロセス改善・販路拡大など、事業計画の実現を最大4,000万円で支援...",
  learnPoints: ["対象になる事業", "補助対象経費の範囲", "申請前の注意点"],
  amountLabel: "最大4,000万円",
  deadlineLabel: "2027年3月23日",
  badge: "★ 専門LP",
  status: "受付中" as const,
};

type PreviewArticle = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  subsidyName: string;
  tags: string[];
  heroImagePath: string | null;
  maxAmountLabel: string | null;
  deadlineLabel: string | null;
  publishedAt: string | null;
  prefecture: string | null;
};

export type FeaturedVideoHub = {
  slug: string;
  thumbnailPath: string | null;
  title: string | null;
};

type Props = {
  articles: PreviewArticle[];
  featuredVideos: FeaturedVideoHub[];
};

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" className="ml-0.5 h-6 w-6" fill="currentColor" aria-hidden>
      <path d="M8 5v14l11-7L8 5z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="mt-0.5 h-3 w-3 shrink-0 text-[#0B4F8A]" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

export default function ArticlesCtaBar({ articles, featuredVideos }: Props) {

  const previewArticles = articles.slice(0, 2);

  return (
    <section
      className="section-block w-full"
      style={{ background: "linear-gradient(165deg,#eef4fb 0%,#f4f8fc 50%,#e8f2fa 100%)" }}
      aria-labelledby="home-information-hub-heading"
    >
      <div className="section-inner">
        {/* 見出しブロック */}
        <header className="mb-10 text-center md:mb-12">
          <h2
            id="home-information-hub-heading"
            className="font-heading text-[1.9rem] font-bold leading-snug text-[var(--text-primary)] md:text-[2.6rem]"
          >
            補助金情報を最速で届けます。
          </h2>
        </header>

        {/* 情報ハブパネル */}
        <div className="overflow-hidden rounded-2xl border border-[#d6e6f4] bg-white shadow-[0_6px_40px_rgba(18,56,110,0.09)]">
          {/* 上部バー */}
          <div className="border-b border-[#e2edf8] px-6 py-4 text-center md:px-8 md:py-5">
            <p className="text-sm leading-relaxed text-[var(--text-secondary)] md:text-base">
              記事・制度別LP・動画で、申請前に知っておきたい情報をすばやく確認できます。
            </p>
          </div>

          {/* ─── 3カラム（lg で高さ揃え） ─── */}
          <div className="grid grid-cols-1 divide-y divide-[#eaf1f8] lg:grid-cols-3 lg:items-stretch lg:divide-x lg:divide-y-0">

            {/* ━━━ 記事 ━━━（添付1枚目スタイル） */}
            <div className="flex min-w-0 flex-col p-6 lg:h-full md:p-8">
              <p className="text-xs font-bold text-[#5a80a0]">記事</p>

              {/* 縦積みカード（各カードが個別記事へリンク） */}
              <div className="mt-4 flex min-w-0 flex-1 flex-col gap-3">
                {previewArticles.length > 0 ? (
                  previewArticles.map((article) => {
                    const tag = article.tags.find((t) => t !== "お役立ち情報") ?? article.tags[0];
                    return (
                      <Link
                        key={article.id}
                        href={`/subsidies/articles/${article.slug}`}
                        className="group/card flex min-w-0 flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                      >
                        {/* 画像エリア（添付1枚目と同じ縦型） */}
                        <div className="relative h-[120px] w-full shrink-0 overflow-hidden bg-[#eef4fb]">
                          {article.heroImagePath ? (
                            <Image
                              src={article.heroImagePath}
                              alt={article.title}
                              fill
                              className="object-cover object-center transition duration-300 group-hover/card:scale-[1.03]"
                              sizes="(max-width:1024px) 92vw, 320px"
                            />
                          ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-[#0e357f] to-[#28a4a3]" />
                          )}
                          <div className="absolute inset-0 bg-black/20" />
                          {/* バッジ */}
                          <div className="absolute left-2 top-2 flex gap-1.5">
                            {tag && (
                              <span className="rounded bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-neutral-700">
                                {tag}
                              </span>
                            )}
                            {article.deadlineLabel && (
                              <span className="rounded bg-emerald-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                                公募中
                              </span>
                            )}
                          </div>
                        </div>

                        {/* テキストエリア */}
                        <div className="flex flex-1 flex-col p-3">
                          <h3 className="line-clamp-2 text-[13px] font-bold leading-snug text-neutral-900 group-hover/card:text-[#1d6fe8]">
                            {article.title}
                          </h3>
                          <p className="mt-1 line-clamp-1 text-[11px] leading-relaxed text-neutral-500">
                            {article.excerpt}
                          </p>
                          <div className="mt-2 grid grid-cols-2 gap-1.5 text-[11px]">
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
                          <div className="mt-2 flex items-center justify-between text-[11px] text-neutral-400">
                            <span>{article.publishedAt ?? "-"}</span>
                            <span className="text-[#0B4F8A]">{article.prefecture ?? "全国"}</span>
                          </div>
                        </div>
                      </Link>
                    );
                  })
                ) : (
                  /* フォールバック */
                  <Link
                    href="/subsidies/articles"
                    className="group/card flex min-w-0 flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition hover:shadow-md"
                  >
                    <div className="relative h-[120px] w-full overflow-hidden bg-[#eef4fb]">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#0e357f] to-[#28a4a3]" />
                      <span className="absolute left-2 top-2 rounded bg-emerald-500 px-2 py-0.5 text-[10px] font-semibold text-white">公募中</span>
                    </div>
                    <div className="p-3">
                      <p className="text-[13px] font-bold text-neutral-900">補助金解説記事</p>
                    </div>
                  </Link>
                )}
              </div>

              <div className="mt-5 min-w-0">
                <h3 className="font-heading text-[1.15rem] font-bold leading-snug text-[#0c2a48]">
                  公募中の補助金を整理
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#4a6a82]">
                  制度のポイントや活用のヒントを、読み物形式でわかりやすく解説しています。
                </p>
                <Link href="/subsidies/articles" className="mt-3 inline-block text-[13px] font-semibold text-[#1d6fe8] hover:underline">
                  記事を読む →
                </Link>
              </div>
            </div>

            {/* ━━━ 制度別LP ━━━（添付2枚目 LpResultCard スタイル） */}
            <div className="flex min-w-0 flex-col p-6 lg:h-full md:p-8">
              <p className="text-xs font-bold text-[#5a80a0]">制度別LP</p>

              <div className="mt-4 flex min-w-0 flex-1 flex-col gap-3">
                  <Link
                    href="/subsidies/lp"
                    className="group/lpcard flex flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    {/* 画像（16/9） */}
                    <div className="relative aspect-[16/9] shrink-0 overflow-hidden bg-slate-100">
                      <Image
                        src={LP_PREVIEW_CARD.url}
                        alt={LP_PREVIEW_CARD.alt}
                        fill
                        className="object-cover transition duration-300 group-hover/lpcard:scale-[1.03]"
                        sizes="(max-width:1024px) 92vw, 320px"
                      />
                      <div
                        aria-hidden
                        className="absolute inset-0 bg-gradient-to-t from-slate-950/30 via-transparent to-transparent"
                      />
                      {/* カテゴリバッジ */}
                      <div className="absolute left-2.5 top-2.5 flex flex-wrap items-center gap-1.5">
                        <span className="inline-flex items-center rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-bold text-[#0B4F8A] shadow-sm">
                          {LP_PREVIEW_CARD.category}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-[#0B4F8A] px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                          {LP_PREVIEW_CARD.badge}
                        </span>
                      </div>
                      {/* ステータスバッジ */}
                      <div className="absolute right-2.5 top-2.5">
                        <span className="inline-flex items-center rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                          受付中
                        </span>
                      </div>
                    </div>

                    {/* 本文 */}
                    <div className="flex flex-1 flex-col p-4">
                      <h3 className="line-clamp-2 text-sm font-bold leading-snug text-slate-900">
                        {LP_PREVIEW_CARD.name}
                      </h3>
                      <p className="mt-1.5 line-clamp-1 text-xs font-semibold text-[#0B4F8A]">
                        {LP_PREVIEW_CARD.targetLine}
                      </p>
                      <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-600">
                        {LP_PREVIEW_CARD.copy}
                      </p>

                      {/* このLPで分かること */}
                      <div className="mt-3">
                        <p className="text-[10px] font-bold uppercase tracking-normal text-slate-500">
                          このLPで分かること
                        </p>
                        <ul className="mt-1 space-y-0.5">
                          {LP_PREVIEW_CARD.learnPoints.map((p) => (
                            <li key={p} className="flex items-start gap-1">
                              <CheckIcon />
                              <span className="line-clamp-1 text-[11px] text-slate-600">{p}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* 補助上限・公募期限 */}
                      <dl className="mt-3 grid grid-cols-2 gap-1.5">
                        <div className="rounded-xl border border-slate-100 bg-slate-50 p-2">
                          <dt className="text-[10px] font-bold text-slate-500">補助上限</dt>
                          <dd className="mt-0.5 text-xs font-bold text-slate-900">{LP_PREVIEW_CARD.amountLabel}</dd>
                        </div>
                        <div className="rounded-xl border border-slate-100 bg-slate-50 p-2">
                          <dt className="text-[10px] font-bold text-slate-500">公募期限</dt>
                          <dd className="mt-0.5 text-xs font-bold text-slate-900">{LP_PREVIEW_CARD.deadlineLabel}</dd>
                        </div>
                      </dl>

                      {/* CTA */}
                      <div className="mt-auto pt-3">
                        <span className="inline-flex h-9 w-full items-center justify-center gap-1 rounded-xl bg-[#0B4F8A] text-xs font-bold text-white transition group-hover/lpcard:bg-[#083D6D]">
                          専門LPを見る →
                        </span>
                      </div>
                      <div className="mt-2 text-center">
                        <span className="text-[11px] text-[#0B4F8A]">この補助金について相談する →</span>
                      </div>
                    </div>
                  </Link>
              </div>

              <div className="mt-5 min-w-0">
                <h3 className="font-heading text-[1.15rem] font-bold leading-snug text-[#0c2a48]">
                  目的別に詳しく確認
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#4a6a82]">
                  制度の概要・対象要件・活用事例まで、目的別に整理した制度別LPで詳しく確認できます。
                </p>
                <Link href="/subsidies/lp" className="mt-3 inline-block text-[13px] font-semibold text-[#1d6fe8] hover:underline">
                  LPを見る →
                </Link>
              </div>
            </div>

            {/* ━━━ 動画 ━━━ */}
            <div className="flex min-w-0 flex-col p-6 lg:h-full md:p-8">
              <p className="text-xs font-bold text-[#5a80a0]">動画</p>

              {/* 大サムネイル3枚縦積み（記事カードと同じ高さ構成） */}
              <div className="mt-4 flex min-w-0 flex-1 flex-col gap-3">
                {featuredVideos.length > 0 ? (
                  featuredVideos.map((v, i) => (
                    <Link
                      key={v.slug}
                      href={`/subsidies/videos/${v.slug}`}
                      className="group/vcard flex min-w-0 flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      {/* サムネイル（記事カードと同じ h-[120px]） */}
                      <div className="relative h-[120px] w-full shrink-0 overflow-hidden bg-[#0a1a2e]">
                        {v.thumbnailPath ? (
                          <Image
                            src={v.thumbnailPath}
                            alt={v.title ?? "補助金解説動画"}
                            fill
                            className="object-cover object-center opacity-90 transition duration-300 group-hover/vcard:scale-[1.03]"
                            sizes="(max-width:1024px) 92vw, 320px"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-[#0e357f] to-[#1a6fe8]" />
                        )}
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050f1d]/50 via-transparent to-transparent" aria-hidden />
                        {/* 再生ボタン */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-white/85 text-[#1a4c8e] shadow-md transition-transform duration-200 group-hover/vcard:scale-110">
                            <PlayIcon />
                          </span>
                        </div>
                        {/* 時間ラベル（先頭のみ） */}
                        {i === 0 && (
                          <div className="absolute bottom-2 right-2 rounded bg-black/60 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-white/90">
                            03:00
                          </div>
                        )}
                      </div>
                      {/* タイトル */}
                      <div className="flex flex-1 flex-col p-3">
                        <p className="line-clamp-2 text-[13px] font-bold leading-snug text-neutral-900 group-hover/vcard:text-[#1d6fe8]">
                          {v.title ?? VIDEO_FALLBACK_TITLE}
                        </p>
                      </div>
                    </Link>
                  ))
                ) : (
                  /* フォールバック */
                  <Link
                    href="/subsidies/videos"
                    className="group/vcard flex min-w-0 flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition hover:shadow-md"
                  >
                    <div className="relative h-[120px] w-full overflow-hidden bg-[#0a1a2e]">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#0e357f] to-[#1a6fe8]" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/85 text-[#1a4c8e]">
                          <PlayIcon />
                        </span>
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-[13px] font-bold text-neutral-900">補助金解説動画</p>
                    </div>
                  </Link>
                )}
              </div>

              <div className="mt-5 min-w-0">
                <h3 className="font-heading text-[1.15rem] font-bold leading-snug text-[#0c2a48]">
                  3分でわかる補助金解説
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#4a6a82]">
                  専門家が制度のポイントを短尺で解説。要点を短時間で理解できる動画を多数ご用意しています。
                </p>
                <Link href="/subsidies/videos" className="mt-3 inline-block text-[13px] font-semibold text-[#1d6fe8] hover:underline">
                  動画を見る →
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

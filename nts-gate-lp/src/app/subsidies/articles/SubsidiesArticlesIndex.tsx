"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  buildTagOptions,
  MOCK_ARTICLES,
  type SubsidyArticle,
} from "./mockArticles";

const ALL = "__all__";

export default function SubsidiesArticlesIndex() {
  const [selectedTag, setSelectedTag] = useState<string>(ALL);
  const tagOptions = useMemo(() => buildTagOptions(MOCK_ARTICLES), []);

  const filtered: SubsidyArticle[] = useMemo(() => {
    if (selectedTag === ALL) return MOCK_ARTICLES;
    return MOCK_ARTICLES.filter((a) => a.tags.includes(selectedTag));
  }, [selectedTag]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 lg:py-14">
      <div className="flex flex-col gap-10 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1">
          <h1 className="font-heading text-3xl font-normal text-neutral-900 sm:text-4xl">
            解説記事
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-neutral-600 sm:text-base">
            補助金・支援制度に関する解説を順次公開します。投稿は今後連携予定のアプリから行います。
          </p>

          <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((article) => (
              <article
                key={article.id}
                className="flex flex-col overflow-hidden rounded-lg border border-neutral-200/90 bg-white shadow-sm"
              >
                <div className="relative aspect-[16/10] w-full shrink-0 bg-neutral-100">
                  <Image
                    src={article.imageSrc}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width:768px) 100vw, (max-width:1280px) 50vw, 33vw"
                  />
                </div>
                <div className="flex flex-1 flex-col p-4 sm:p-5">
                  <p className="text-xs sm:text-sm">
                    <span className="font-medium text-primary-600">
                      {article.publishedAt}
                    </span>
                    <span className="mx-2 text-neutral-300" aria-hidden>
                      |
                    </span>
                    <span className="text-neutral-600">
                      {article.categoryLabel}
                    </span>
                  </p>
                  <h2 className="mt-2 line-clamp-2 text-base font-bold leading-snug text-neutral-900 sm:text-lg">
                    {article.title}
                  </h2>
                  <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-neutral-600">
                    {article.excerpt}
                  </p>
                  <p className="mt-3 text-xs text-neutral-700 sm:text-sm">
                    {article.tags.slice(0, 1).map((t) => (
                      <span key={t}>#{t}</span>
                    ))}
                  </p>
                </div>
              </article>
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="mt-8 text-center text-neutral-600">
              該当する記事がありません。
            </p>
          )}
        </div>

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
                全て（{MOCK_ARTICLES.length}）
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
      </div>
    </div>
  );
}

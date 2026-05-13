'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRef, useEffect, useState } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { ArrowRight, BookOpen, ChevronRight } from 'lucide-react'

const EASE_OUT = [0.22, 1, 0.36, 1] as const
const ROTATE_INTERVAL = 4000
const CARDS_PER_PAGE = 3

type PreviewArticle = {
  id: string
  slug: string
  title: string
  excerpt: string
  subsidyName: string
  tags: string[]
  heroImagePath: string | null
}

type Props = {
  articles: PreviewArticle[]
}

export default function ArticlesCtaBar({ articles }: Props) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const [page, setPage] = useState(0)

  const totalPages = Math.max(1, Math.ceil(articles.length / CARDS_PER_PAGE))
  const visibleArticles = articles.slice(
    page * CARDS_PER_PAGE,
    page * CARDS_PER_PAGE + CARDS_PER_PAGE,
  )

  // 4秒ごとに次の3枚に切り替え
  useEffect(() => {
    if (articles.length <= CARDS_PER_PAGE) return
    const timer = setInterval(() => {
      setPage((p) => (p + 1) % totalPages)
    }, ROTATE_INTERVAL)
    return () => clearInterval(timer)
  }, [articles.length, totalPages])

  return (
    <section
      ref={ref}
      className="w-full overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #EBF4FF 0%, #F0F9FF 50%, #EEF7FF 100%)' }}
    >
      <motion.div
        className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-14 lg:flex-row lg:items-center lg:gap-12 lg:px-10"
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: EASE_OUT }}
      >
        {/* ── 左：コピー ── */}
        <div className="flex shrink-0 flex-col gap-5 lg:w-[300px]">
          <div>
            <h2 className="text-xl font-black leading-snug text-[#0f172a]">
              補助金の活用方法を、
              <br />
              記事で最速で確認できます。
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#536174]">
              制度解説・申請ノウハウ・活用事例を専門家が執筆。申請前に知っておくべき情報を網羅。
            </p>
          </div>

          <Link
            href="/subsidies/articles"
            className="inline-flex w-fit items-center gap-2 rounded-full bg-[#2563eb] px-6 py-3 text-sm font-bold text-white shadow-md shadow-blue-200 transition-all hover:-translate-y-px hover:bg-blue-600 hover:shadow-lg"
          >
            すべての記事を読む
            <ArrowRight className="h-4 w-4" />
          </Link>

          {/* ページインジケーター */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === page ? 'w-5 bg-[#2563eb]' : 'w-1.5 bg-blue-200'
                  }`}
                  aria-label={`${i + 1}ページ目`}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── 右：記事カード3枚（ローテーション） ── */}
        <div className="relative flex-1 overflow-hidden">
          {articles.length > 0 ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={page}
                className="grid grid-cols-1 gap-4 sm:grid-cols-3"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.4, ease: EASE_OUT }}
              >
                {visibleArticles.map((article) => (
                  <Link
                    key={article.id}
                    href={`/subsidies/articles/${article.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/80 bg-white shadow-sm shadow-blue-100/40 transition-all hover:-translate-y-0.5 hover:shadow-md"
                  >
                    {/* サムネイル */}
                    <div className="relative h-[130px] w-full overflow-hidden bg-[#EBF4FF]">
                      {article.heroImagePath ? (
                        <Image
                          src={article.heroImagePath}
                          alt={article.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, 33vw"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <BookOpen className="h-10 w-10 text-blue-200" />
                        </div>
                      )}
                      {article.tags[0] && (
                        <span className="absolute left-3 top-3 rounded-md bg-[#2563eb] px-2 py-0.5 text-[11px] font-bold text-white">
                          {article.tags[0]}
                        </span>
                      )}
                    </div>

                    {/* テキスト */}
                    <div className="flex flex-1 flex-col gap-1.5 p-4">
                      <p className="line-clamp-2 text-sm font-bold leading-snug text-[#0f172a]">
                        {article.title}
                      </p>
                      {article.subsidyName && (
                        <p className="line-clamp-1 text-[11px] text-[#8ba1b8]">
                          {article.subsidyName}
                        </p>
                      )}
                      <p className="mt-auto flex items-center gap-1 text-[12px] font-bold text-[#2563eb]">
                        続きを読む
                        <ChevronRight className="h-3.5 w-3.5" />
                      </p>
                    </div>
                  </Link>
                ))}
              </motion.div>
            </AnimatePresence>
          ) : (
            /* フォールバック */
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex h-[220px] flex-col overflow-hidden rounded-2xl border border-white/80 bg-white/60 shadow-sm"
                >
                  <div className="h-[130px] w-full animate-pulse bg-blue-50" />
                  <div className="flex flex-col gap-2 p-4">
                    <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />
                    <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </section>
  )
}

"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { motion, type Easing } from "framer-motion";
import { getPartnerUrl } from "@/lib/partnerUrl";
import IntroOverlay from "@/components/subsidies/IntroOverlay";

const EASE_OUT: Easing = [0.22, 1, 0.36, 1];

type Counts = { grants: number; articles: number; videos: number; lps: number };
type Props = { counts: Counts };

/* ── 日本地図ネットワーク ────────────────────── */
const NODES: { x: number; y: number; r: number; hue: "blue" | "cyan" }[] = [
  { x: 470, y: 68,  r: 5.5, hue: "cyan"  }, // 北海道（札幌）
  { x: 432, y: 128, r: 4,   hue: "blue"  }, // 北海道（函館）
  { x: 410, y: 178, r: 4,   hue: "blue"  }, // 青森
  { x: 395, y: 218, r: 3.5, hue: "blue"  }, // 岩手
  { x: 365, y: 244, r: 3.5, hue: "blue"  }, // 仙台
  { x: 360, y: 284, r: 5.5, hue: "cyan"  }, // 東京
  { x: 335, y: 304, r: 3,   hue: "blue"  }, // 横浜
  { x: 290, y: 304, r: 4,   hue: "blue"  }, // 名古屋
  { x: 245, y: 318, r: 3.5, hue: "blue"  }, // 京都
  { x: 220, y: 329, r: 5,   hue: "cyan"  }, // 大阪
  { x: 180, y: 340, r: 3.5, hue: "blue"  }, // 神戸
  { x: 130, y: 364, r: 3.5, hue: "blue"  }, // 広島
  { x: 80,  y: 394, r: 3.5, hue: "blue"  }, // 福岡
  { x: 60,  y: 428, r: 5,   hue: "cyan"  }, // 熊本
  { x: 90,  y: 468, r: 3,   hue: "blue"  }, // 鹿児島
];

const LINKS: [number, number][] = [
  [0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,10],
  [10,11],[11,12],[12,13],[13,14],[5,7],[5,9],[9,12],[0,5],
];

function JapanNetworkMap() {
  return (
    <svg
      viewBox="0 0 640 520"
      className="h-full w-full"
      aria-label="全国補助金情報のAIリアルタイム解析ネットワーク"
    >
      <defs>
        <radialGradient id="glowBlue" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(59,130,246,0.55)" />
          <stop offset="100%" stopColor="rgba(59,130,246,0)" />
        </radialGradient>
        <radialGradient id="glowCyan" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(34,211,238,0.55)" />
          <stop offset="100%" stopColor="rgba(34,211,238,0)" />
        </radialGradient>
        <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(59,130,246,0.18)" />
          <stop offset="100%" stopColor="rgba(59,130,246,0)" />
        </radialGradient>
      </defs>

      {/* 中央グロー */}
      <ellipse cx="300" cy="280" rx="240" ry="200" fill="url(#centerGlow)" />

      {/* 接続ライン */}
      <g fill="none" strokeLinecap="round">
        {LINKS.map(([a, b], i) => {
          const na = NODES[a], nb = NODES[b];
          const midX = (na.x + nb.x) / 2;
          const midY = (na.y + nb.y) / 2;
          return (
            <motion.line
              key={i}
              x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
              stroke={midX < 200 ? "rgba(34,211,238,0.45)" : "rgba(96,165,250,0.50)"}
              strokeWidth="1"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.6, ease: "easeOut", delay: 0.3 + i * 0.055 }}
            />
          );
        })}
      </g>

      {/* ノード */}
      {NODES.map((n, i) => {
        const fill = n.hue === "cyan" ? "#22d3ee" : "#3b82f6";
        const glowId = n.hue === "cyan" ? "glowCyan" : "glowBlue";
        return (
          <g key={i}>
            <circle cx={n.x} cy={n.y} r={n.r * 4.5} fill={`url(#${glowId})`} />
            <motion.circle
              cx={n.x} cy={n.y} r={n.r}
              fill={fill}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, delay: 0.6 + i * 0.065, ease: EASE_OUT }}
            />
            <motion.circle
              cx={n.x} cy={n.y} r={n.r}
              fill="none" stroke={fill} strokeWidth="1.2"
              animate={{ r: [n.r, n.r * 3.4, n.r * 3.4], opacity: [0.55, 0, 0] }}
              transition={{
                duration: 2.6, ease: "easeOut",
                delay: i * 0.28, repeat: Infinity, repeatDelay: 1.4,
              }}
            />
          </g>
        );
      })}
    </svg>
  );
}

/* ── リアルタイム検知カード ─────────────────── */
const REALTIME_ITEMS = [
  { area: "北海道 札幌市",  title: "中小企業DX推進補助金",     time: "公開 3分前" },
  { area: "東京都 渋谷区",  title: "スタートアップ支援補助金", time: "公開 5分前" },
  { area: "大阪府 大阪市",  title: "省エネ設備導入補助金",     time: "公開 7分前" },
  { area: "愛知県 名古屋市",title: "カーボンニュートラル補助金",time: "公開 9分前" },
];

/* ── 4特徴 ──────────────────────────────────── */
const FEATURES = [
  {
    title: "全国を24時間監視",
    desc: "自治体・省庁サイトをリアルタイムで監視",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
      </svg>
    ),
  },
  {
    title: "公開直後に検知",
    desc: "リリースされた瞬間にAIが情報を取得",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9Z" /><path d="M10 21a2 2 0 0 0 4 0" />
      </svg>
    ),
  },
  {
    title: "AIで自動コンテンツ化",
    desc: "記事・LP・動画・SNSまで自動で生成",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <path d="M14 3 4 14h6l-1 7 10-11h-6l1-7Z" />
      </svg>
    ),
  },
  {
    title: "最速でユーザーへ",
    desc: "欲しい人に、最速で情報を届ける",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
];

/* ── メインコンポーネント ────────────────────── */
export default function SubsidiesGalaxyClient({ counts }: Props) {
  const partnerHref = getPartnerUrl();
  const [introComplete, setIntroComplete] = useState(false);
  const handleIntroComplete = useCallback(() => setIntroComplete(true), []);

  // イントロ完了後のフェードイン
  useEffect(() => {
    if (!introComplete) return;
    const run = async () => {
      const { gsap } = await import("gsap");
      const targets = document.querySelectorAll("[data-intro-reveal]");
      gsap.fromTo(
        targets,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.1, clearProps: "transform" }
      );
    };
    run();
  }, [introComplete]);

  return (
    <>
      {!introComplete && <IntroOverlay onComplete={handleIntroComplete} />}

      <div className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-100 text-slate-900">
        {/* 背景グロー */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 left-[18%] h-[520px] w-[520px] rounded-full bg-blue-200/30 blur-3xl" />
          <div className="absolute -bottom-32 right-[8%] h-[440px] w-[440px] rounded-full bg-cyan-200/25 blur-3xl" />
        </div>

        {/* ══ HERO ══════════════════════════════════════════════════════════ */}
        <section
          data-intro-reveal
          style={{ opacity: 0 }}
          className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-12 pt-14 md:pt-16"
          aria-label="補助金AIプラットフォーム ヒーロー"
        >
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_1fr_320px]">

            {/* 左：キャッチコピー */}
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200/70 bg-blue-50/80 px-4 py-2 text-xs font-medium text-blue-700 backdrop-blur md:text-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
                </span>
                全国の補助金をAIがリアルタイム解析
              </div>

              <h1 className="font-heading text-[2.6rem] font-black leading-[1.08] tracking-tight text-slate-900 md:text-[3.5rem] lg:text-[4rem]">
                補助金情報を、
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                  &ldquo;探す時代&rdquo;
                </span>
                を終わらせる。
              </h1>

              <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-600 md:text-lg">
                全国の自治体・省庁サイトをAIが24時間クロール。
                <br className="hidden md:block" />
                公開直後に記事・LP・動画まで自動で生成します。
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/consult"
                  className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:-translate-y-px hover:shadow-xl hover:shadow-blue-500/35 md:text-base"
                >
                  無料で始める
                </Link>
                <Link
                  href="/check"
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white/80 px-7 py-3.5 text-sm font-semibold text-slate-700 backdrop-blur transition-all hover:border-slate-400 hover:bg-white md:text-base"
                >
                  デモを予約する
                </Link>
              </div>

              {/* 統計ミニバッジ */}
              <div className="mt-8 flex flex-wrap gap-3 text-xs">
                <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 font-medium text-amber-700">
                  掲載補助金 {counts.grants.toLocaleString()} 件
                </span>
                <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 font-medium text-blue-700">
                  解説記事 {counts.articles.toLocaleString()} 本
                </span>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 font-medium text-emerald-700">
                  解説動画 {counts.videos.toLocaleString()} 本
                </span>
              </div>
            </div>

            {/* 中央：日本地図ネットワーク */}
            <div className="relative h-[400px] md:h-[460px] lg:h-[510px]">
              <div className="absolute inset-0 rounded-[40px] border border-white bg-white/60 shadow-2xl shadow-slate-200/60 backdrop-blur-xl" />
              <div className="pointer-events-none absolute inset-0 rounded-[40px] bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.16),transparent_65%)]" />
              <div className="absolute inset-0">
                <JapanNetworkMap />
              </div>
              {/* 装飾バッジ 左上 */}
              <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-blue-200/60 bg-white/85 px-3 py-1.5 text-[11px] font-medium text-blue-700 shadow-sm backdrop-blur">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-blue-500" />
                </span>
                AI Crawling Network
              </div>
              {/* 装飾バッジ 右下 */}
              <div className="absolute bottom-4 right-4 rounded-2xl border border-slate-200 bg-white/90 px-4 py-2 text-xs shadow-sm backdrop-blur">
                <p className="font-mono text-slate-400">Active nodes</p>
                <p className="font-bold text-slate-900">{NODES.length}<span className="ml-1 text-slate-400">/47</span></p>
              </div>
            </div>

            {/* 右：リアルタイム検知カード */}
            <aside
              className="rounded-[28px] border border-slate-200 bg-white/85 p-5 shadow-2xl shadow-slate-200/70 backdrop-blur-xl"
              aria-label="リアルタイム検知"
            >
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">リアルタイム検知</h2>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-600">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  </span>
                  LIVE
                </span>
              </div>

              <ul className="space-y-3">
                {REALTIME_ITEMS.map((item, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 + i * 0.09, ease: EASE_OUT }}
                    className="group flex cursor-pointer items-start justify-between rounded-2xl border border-slate-200 bg-white p-3.5 transition hover:border-slate-300 hover:shadow-md"
                  >
                    <div className="min-w-0">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="rounded-md bg-blue-600 px-1.5 py-0.5 text-[10px] font-bold text-white">NEW</span>
                        <p className="text-xs font-semibold text-slate-600">{item.area}</p>
                      </div>
                      <p className="text-sm font-semibold leading-snug text-slate-900">{item.title}</p>
                      <p className="mt-1 font-mono text-[11px] text-slate-500">{item.time}</p>
                    </div>
                    <span className="ml-2 mt-1 shrink-0 text-slate-300 transition group-hover:text-blue-400">›</span>
                  </motion.li>
                ))}
              </ul>

              <Link
                href="/subsidies/list"
                className="mt-5 flex w-full items-center justify-center rounded-2xl border border-slate-300 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                もっと見る
              </Link>
            </aside>
          </div>

          {/* ── 4特徴カード ── */}
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: EASE_OUT }}
                className="rounded-[24px] border border-white bg-white/75 p-5 shadow-xl shadow-slate-200/40 backdrop-blur-xl"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  {f.icon}
                </div>
                <h3 className="mb-1.5 text-base font-bold text-slate-900">{f.title}</h3>
                <p className="text-sm leading-relaxed text-slate-600">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ══ カテゴリナビ ══════════════════════════════════════════════════ */}
        <section
          data-intro-reveal
          style={{ opacity: 0 }}
          className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-16 pt-4"
          aria-label="カテゴリ一覧"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
            <p className="text-[10px] font-semibold tracking-[0.3em] text-slate-400">EXPLORE CATEGORIES</p>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { href: "/subsidies/list",     label: "補助金一覧",   sub: "GRANT DATABASE",   desc: "省庁・jGrantsから自動収集した最新補助金を検索。締切・上限額・対象業種を確認。", badge: "最速更新",         badgeClass: "bg-amber-50 text-amber-700 ring-amber-200" },
              { href: "/subsidies/articles", label: "解説記事",     sub: "EXPERT ARTICLES",  desc: "補助金ごとの詳しい解説・申請ポイントをまとめた専門記事。",                     badge: "補助金記事",       badgeClass: "bg-blue-50 text-blue-700 ring-blue-200"   },
              { href: "/subsidies/lp",       label: "活用ガイド",   sub: "ACTION GUIDE",     desc: "制度ごとの対象課題・活用例・申請の流れをLP形式で整理。",                         badge: "webページ",         badgeClass: "bg-teal-50 text-teal-700 ring-teal-200"   },
              { href: "/subsidies/videos",   label: "解説動画",     sub: "VIDEO GUIDE",      desc: "音声ナレーション付きの動画で補助金の概要を手軽に理解。通勤中にも。",             badge: "補助金解説動画",   badgeClass: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
            ].map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="group relative flex flex-col rounded-2xl border border-white/60 bg-white/75 p-6 shadow-md backdrop-blur-sm transition-all duration-150 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="mb-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ring-1 ${card.badgeClass}`}>
                    {card.badge}
                  </span>
                </div>
                <p className="mb-0.5 text-[9px] font-semibold tracking-[0.25em] text-slate-400">{card.sub}</p>
                <h2 className="font-heading text-xl font-semibold text-slate-900">{card.label}</h2>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">{card.desc}</p>
                <div className="mt-5 flex items-center gap-1 text-xs font-semibold text-blue-600 transition-all duration-150 group-hover:gap-2">
                  詳しく見る
                  <span aria-hidden="true" className="transition-transform duration-150 group-hover:translate-x-0.5">→</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ══ CTAバー ══════════════════════════════════════════════════════ */}
        <div
          data-intro-reveal
          style={{ opacity: 0 }}
          className="relative z-10 w-full border-t border-slate-200 bg-slate-900 backdrop-blur-sm"
        >
          <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-6 py-10 sm:flex-row sm:justify-between">
            <div>
              <p className="text-[10px] tracking-[0.2em] text-white/50">FREE CONSULTATION</p>
              <p className="mt-1 text-base font-medium text-white">あなたのビジネスに最適な補助金を、専門家が無料でご提案します。</p>
            </div>
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
              <Link
                href="/consult"
                className="inline-flex items-center justify-center rounded-2xl bg-blue-500 px-7 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-blue-400"
              >
                無料相談を予約する →
              </Link>
              <Link
                href={partnerHref}
                className="inline-flex items-center justify-center rounded-2xl border border-white/30 px-7 py-3 text-sm font-medium text-white/80 transition hover:border-white/60 hover:text-white"
              >
                提携先ページへ
              </Link>
            </div>
          </div>
        </div>

        {/* トップへ */}
        <div className="relative z-10 w-full bg-slate-100 py-6 text-center">
          <Link href="/" className="text-sm text-slate-400 underline-offset-4 transition hover:text-slate-700 hover:underline">
            ← トップへ戻る
          </Link>
        </div>
      </div>
    </>
  );
}

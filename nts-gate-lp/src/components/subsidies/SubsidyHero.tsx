"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, type Easing } from "framer-motion";

/* 地図はSSRなしで読み込む（react-simple-mapsがブラウザ専用） */
const JapanNetworkMap = dynamic(() => import("./JapanNetworkMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-2 border-blue-200 border-t-blue-500" />
    </div>
  ),
});

const EASE: Easing = [0.22, 1, 0.36, 1];

type Counts = { grants: number; articles: number; videos: number; lps: number };

const REALTIME_ITEMS = [
  { area: "北海道 札幌市",   title: "中小企業DX推進補助金",      time: "公開 3分前" },
  { area: "東京都 渋谷区",   title: "スタートアップ支援補助金",  time: "公開 5分前" },
  { area: "大阪府 大阪市",   title: "省エネ設備導入補助金",      time: "公開 7分前" },
  { area: "愛知県 名古屋市", title: "カーボンニュートラル補助金", time: "公開 9分前" },
];

const FEATURES = [
  {
    title: "全国を24時間監視",
    desc: "自治体・省庁サイトをリアルタイムで監視",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
      </svg>
    ),
  },
  {
    title: "公開直後に検知",
    desc: "リリースされた瞬間にAIが情報を取得",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9Z" /><path d="M10 21a2 2 0 0 0 4 0" />
      </svg>
    ),
  },
  {
    title: "AIで自動コンテンツ化",
    desc: "記事・LP・動画・SNSまで自動で生成",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M14 3 4 14h6l-1 7 10-11h-6l1-7Z" />
      </svg>
    ),
  },
  {
    title: "最速でユーザーへ",
    desc: "欲しい人に最速で情報を届ける",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
];

export default function SubsidyHero({ counts }: { counts: Counts }) {
  return (
    <div
      className="relative overflow-hidden"
      style={{
        background: "#f7f9fc",
        backgroundImage:
          "radial-gradient(circle, rgba(59,130,246,0.07) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    >
      {/* Floating blur orbs */}
      <div className="pointer-events-none absolute -top-28 left-[14%] h-[480px] w-[480px] rounded-full bg-blue-200/25 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-28 right-[4%] h-[400px] w-[400px] rounded-full bg-cyan-200/20 blur-[120px]" />

      {/* ══ HERO ══ */}
      <section className="relative z-10 mx-auto w-full max-w-[1400px] px-6 pb-10 pt-24 md:pt-28">
        <div className="grid items-center gap-6 lg:grid-cols-[0.9fr_1.3fr_296px] lg:gap-8">

          {/* ── 左：コピー ── */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: EASE }}
            className="flex flex-col"
          >
            {/* 上部タグ */}
            <div className="mb-7 inline-flex w-fit items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
              </span>
              全国の補助金をAIがリアルタイム解析
            </div>

            {/* キャッチコピー */}
            <h1
              className="font-heading font-black leading-[1.08] tracking-[-0.02em] text-[#0f172a]"
              style={{ fontSize: "clamp(2.6rem, 4vw, 4.2rem)" }}
            >
              <span className="block">補助金情報を、</span>
              <span
                className="block"
                style={{
                  background: "linear-gradient(90deg, #2563eb 0%, #22d3ee 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                &ldquo;探す時代&rdquo;を
              </span>
              <span className="block">終わらせる。</span>
            </h1>

            {/* 説明文 */}
            <p className="mt-6 text-base leading-relaxed text-[#475569]">
              全国の自治体・省庁サイトをAIが24時間クロール。
              <br />
              公開直後に記事・LP・動画まで自動生成します。
            </p>

            {/* CTAボタン */}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/consult"
                className="inline-flex items-center justify-center rounded-2xl bg-[#2563eb] px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-px hover:bg-blue-600 hover:shadow-xl"
              >
                無料で始める
              </Link>
              <Link
                href="/check"
                className="inline-flex items-center justify-center rounded-2xl border border-[#dbe4f0] bg-white/90 px-7 py-3.5 text-sm font-semibold text-[#0f172a] backdrop-blur transition-all hover:border-blue-200 hover:bg-white"
              >
                デモを予約する
              </Link>
            </div>

            {/* 統計バッジ */}
            <div className="mt-8 flex flex-wrap gap-2">
              <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700">
                掲載補助金 {counts.grants.toLocaleString()} 件
              </span>
              <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700">
                解説記事 {counts.articles.toLocaleString()} 本
              </span>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
                動画 {counts.videos.toLocaleString()} 本
              </span>
            </div>
          </motion.div>

          {/* ── 中央：日本地図 ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.1 }}
            className="relative h-[440px] md:h-[500px] lg:h-[560px]"
          >
            {/* glassmorphism card */}
            <div className="absolute inset-0 overflow-hidden rounded-[40px] border border-white bg-white/55 shadow-2xl shadow-slate-200/50 backdrop-blur-xl" />

            {/* 地図本体 */}
            <div className="absolute inset-0 overflow-hidden rounded-[40px]">
              <JapanNetworkMap />
            </div>

            {/* AI Crawling バッジ */}
            <div className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-full border border-blue-200/70 bg-white/90 px-3 py-1.5 text-[11px] font-semibold text-blue-700 shadow-sm backdrop-blur">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-blue-500" />
              </span>
              AI Crawling Network
            </div>

            {/* Active nodes バッジ */}
            <div className="absolute bottom-4 right-4 z-10 rounded-2xl border border-[#dbe4f0] bg-white/90 px-4 py-2.5 text-xs shadow-sm backdrop-blur">
              <p className="font-mono text-[#94a3b8]">Active nodes</p>
              <p className="mt-0.5 font-bold text-[#0f172a]">
                16<span className="ml-1 font-normal text-[#94a3b8]">/47</span>
              </p>
            </div>
          </motion.div>

          {/* ── 右：リアルタイム検知 ── */}
          <motion.aside
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.75, ease: EASE, delay: 0.15 }}
            className="rounded-[28px] border border-[#dbe4f0] bg-white/90 p-5 shadow-xl shadow-slate-200/60 backdrop-blur-xl"
            aria-label="リアルタイム検知"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-base font-bold text-[#0f172a]">リアルタイム検知</h2>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-600">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>
                LIVE
              </span>
            </div>

            <ul className="space-y-2.5">
              {REALTIME_ITEMS.map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.35 + i * 0.09, ease: EASE }}
                  className="group cursor-pointer rounded-2xl border border-[#dbe4f0] bg-white p-3.5 transition hover:border-blue-200 hover:shadow-md"
                >
                  <div className="mb-1.5 flex items-center gap-2">
                    <span className="rounded-md bg-[#2563eb] px-1.5 py-0.5 text-[10px] font-bold text-white">
                      NEW
                    </span>
                    <p className="text-xs font-semibold text-[#475569]">{item.area}</p>
                    <span className="ml-auto text-[#cbd5e1] transition group-hover:text-blue-400">›</span>
                  </div>
                  <p className="text-sm font-semibold leading-snug text-[#0f172a]">{item.title}</p>
                  <p className="mt-1.5 font-mono text-[11px] text-[#94a3b8]">{item.time}</p>
                </motion.li>
              ))}
            </ul>

            <Link
              href="/subsidies/list"
              className="mt-4 flex w-full items-center justify-center rounded-2xl border border-[#dbe4f0] py-2.5 text-sm font-semibold text-[#475569] transition hover:border-blue-200 hover:text-blue-600"
            >
              もっと見る
            </Link>
          </motion.aside>
        </div>

        {/* ── 4特徴カード ── */}
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: EASE }}
              className="rounded-[22px] border border-[#dbe4f0] bg-white/80 p-5 shadow-lg shadow-slate-100/60 backdrop-blur"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#2563eb]">
                {f.icon}
              </div>
              <h3 className="mb-1.5 text-sm font-bold text-[#0f172a]">{f.title}</h3>
              <p className="text-xs leading-relaxed text-[#475569]">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}

"use client";

import Link from "next/link";
import { motion, type Easing } from "framer-motion";

const EASE_OUT: Easing = [0.22, 1, 0.36, 1];

type RealtimeItem = {
  area: string;
  title: string;
  time: string;
};

type SubsidyDetailHeroProps = {
  realtimeItems?: RealtimeItem[];
};

const DEFAULT_ITEMS: RealtimeItem[] = [
  {
    area: "北海道 札幌市",
    title: "中小企業DX推進補助金",
    time: "公開 3分前",
  },
  {
    area: "東京都 渋谷区",
    title: "スタートアップ支援補助金",
    time: "公開 5分前",
  },
  {
    area: "大阪府 大阪市",
    title: "省エネ設備導入補助金",
    time: "公開 7分前",
  },
  {
    area: "愛知県 名古屋市",
    title: "カーボンニュートラル補助金",
    time: "公開 9分前",
  },
];

const FEATURES: { title: string; desc: string; icon: React.ReactNode }[] = [
  {
    title: "全国を24時間監視",
    desc: "自治体・省庁サイトをリアルタイムで監視",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    ),
  },
  {
    title: "公開直後に検知",
    desc: "リリースされた瞬間にAIが情報取得",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9Z" />
        <path d="M10 21a2 2 0 0 0 4 0" />
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
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
];

/* シンプル化した日本列島ノード座標（viewBox: 0 0 640 520） */
const JAPAN_NODES: { x: number; y: number; size: number; hue: "blue" | "cyan" }[] = [
  { x: 470, y: 70, size: 5, hue: "cyan" },     // 北海道（札幌）
  { x: 432, y: 130, size: 4, hue: "blue" },    // 北海道（函館）
  { x: 410, y: 180, size: 4, hue: "blue" },    // 青森
  { x: 395, y: 220, size: 3, hue: "blue" },    // 岩手
  { x: 365, y: 245, size: 3, hue: "blue" },    // 仙台
  { x: 360, y: 285, size: 4, hue: "cyan" },    // 東京
  { x: 335, y: 305, size: 3, hue: "blue" },    // 横浜
  { x: 290, y: 305, size: 3, hue: "blue" },    // 名古屋
  { x: 245, y: 320, size: 3, hue: "blue" },    // 京都
  { x: 220, y: 330, size: 4, hue: "cyan" },    // 大阪
  { x: 180, y: 340, size: 3, hue: "blue" },    // 神戸
  { x: 130, y: 365, size: 3, hue: "blue" },    // 広島
  { x: 80, y: 395, size: 3, hue: "blue" },     // 福岡
  { x: 60, y: 430, size: 4, hue: "cyan" },     // 熊本
  { x: 90, y: 470, size: 3, hue: "blue" },     // 鹿児島
];

const JAPAN_LINKS: Array<[number, number]> = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5],
  [5, 6], [6, 7], [7, 8], [8, 9], [9, 10],
  [10, 11], [11, 12], [12, 13], [13, 14],
  [5, 7], [5, 9], [9, 12], [0, 5],
];

export default function SubsidyDetailHero({ realtimeItems }: SubsidyDetailHeroProps = {}) {
  const items = realtimeItems && realtimeItems.length > 0 ? realtimeItems : DEFAULT_ITEMS;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-100 pb-20 pt-10 text-slate-900 md:pb-28 md:pt-14">
      {/* 背景グロー */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-[18%] h-[520px] w-[520px] rounded-full bg-blue-200/30 blur-3xl" />
        <div className="absolute -bottom-32 right-[8%] h-[440px] w-[440px] rounded-full bg-cyan-200/25 blur-3xl" />
        <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-gradient-to-r from-transparent via-blue-200/40 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_1fr_320px]">
          {/* === 左：キャッチコピー === */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE_OUT }}
          >
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-blue-200/70 bg-blue-50/80 px-4 py-2 text-xs font-medium text-blue-700 backdrop-blur md:text-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
              </span>
              全国の補助金をAIがリアルタイム解析
            </div>

            <h1 className="font-heading text-[2.5rem] font-black leading-[1.1] tracking-tight text-slate-900 md:text-[3.4rem] lg:text-[3.8rem]">
              補助金情報を、
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                &ldquo;探す時代&rdquo;
              </span>
              を終わらせる。
            </h1>

            <p className="mt-7 max-w-xl text-base leading-relaxed text-slate-600 md:text-lg">
              全国の自治体・省庁サイトをAIが24時間クロール。
              <br className="hidden md:block" />
              公開直後に記事・LP・動画まで自動で生成します。
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href="/consult"
                className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:translate-y-[-1px] hover:shadow-xl hover:shadow-blue-500/35 md:text-base"
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
          </motion.div>

          {/* === 中央：日本地図ネットワーク === */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: EASE_OUT, delay: 0.1 }}
            className="relative h-[420px] md:h-[480px] lg:h-[520px]"
          >
            {/* 背面のガラスカード */}
            <div className="absolute inset-0 rounded-[40px] border border-white bg-white/60 shadow-2xl shadow-slate-200/60 backdrop-blur-xl" />

            {/* 中央のラジアルグラデ */}
            <div className="pointer-events-none absolute inset-0 rounded-[40px] bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.18),transparent_65%)]" />

            {/* 日本地図SVG */}
            <svg
              viewBox="0 0 640 520"
              className="absolute inset-0 h-full w-full"
              role="img"
              aria-label="全国の補助金情報をAIがリアルタイムに解析しているイメージ"
            >
              <defs>
                <radialGradient id="nodeGlowBlue" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(59,130,246,0.55)" />
                  <stop offset="100%" stopColor="rgba(59,130,246,0)" />
                </radialGradient>
                <radialGradient id="nodeGlowCyan" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(34,211,238,0.55)" />
                  <stop offset="100%" stopColor="rgba(34,211,238,0)" />
                </radialGradient>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(96,165,250,0.0)" />
                  <stop offset="50%" stopColor="rgba(96,165,250,0.6)" />
                  <stop offset="100%" stopColor="rgba(34,211,238,0.0)" />
                </linearGradient>
              </defs>

              {/* 接続ライン */}
              <g stroke="url(#lineGradient)" strokeWidth="1" strokeLinecap="round" fill="none" opacity={0.7}>
                {JAPAN_LINKS.map(([a, b], i) => {
                  const na = JAPAN_NODES[a];
                  const nb = JAPAN_NODES[b];
                  return (
                    <motion.line
                      key={i}
                      x1={na.x}
                      y1={na.y}
                      x2={nb.x}
                      y2={nb.y}
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 1.6, ease: "easeOut", delay: 0.3 + i * 0.05 }}
                    />
                  );
                })}
              </g>

              {/* ノード */}
              <g>
                {JAPAN_NODES.map((node, i) => {
                  const glowId = node.hue === "cyan" ? "nodeGlowCyan" : "nodeGlowBlue";
                  const fill = node.hue === "cyan" ? "#22d3ee" : "#3b82f6";
                  return (
                    <g key={i}>
                      <circle cx={node.x} cy={node.y} r={node.size * 4.5} fill={`url(#${glowId})`} />
                      <motion.circle
                        cx={node.x}
                        cy={node.y}
                        r={node.size}
                        fill={fill}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.6 + i * 0.06, ease: EASE_OUT }}
                      />
                      <motion.circle
                        cx={node.x}
                        cy={node.y}
                        r={node.size}
                        fill="none"
                        stroke={fill}
                        strokeWidth="1.4"
                        animate={{
                          r: [node.size, node.size * 3.2, node.size * 3.2],
                          opacity: [0.6, 0, 0],
                        }}
                        transition={{
                          duration: 2.4,
                          ease: "easeOut",
                          delay: i * 0.25,
                          repeat: Infinity,
                          repeatDelay: 1.2,
                        }}
                      />
                    </g>
                  );
                })}
              </g>
            </svg>

            {/* 装飾ラベル（左上） */}
            <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-blue-200/60 bg-white/80 px-3 py-1.5 text-[11px] font-medium text-blue-700 shadow-sm backdrop-blur">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-blue-500" />
              </span>
              AI Crawling Network
            </div>

            {/* 装飾ラベル（右下） */}
            <div className="absolute bottom-5 right-5 rounded-2xl border border-slate-200 bg-white/85 px-4 py-2 text-xs shadow-sm backdrop-blur">
              <p className="font-mono text-slate-500">Active nodes</p>
              <p className="font-bold text-slate-900">
                {JAPAN_NODES.length}
                <span className="ml-1 text-slate-400">/47</span>
              </p>
            </div>
          </motion.div>

          {/* === 右：リアルタイム検知カード === */}
          <motion.aside
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: EASE_OUT, delay: 0.15 }}
            className="rounded-[28px] border border-slate-200 bg-white/85 p-5 shadow-2xl shadow-slate-200/70 backdrop-blur-xl"
            aria-label="リアルタイム検知"
          >
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">リアルタイム検知</h3>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-600">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>
                LIVE
              </span>
            </div>

            <ul className="space-y-3">
              {items.map((item, i) => (
                <motion.li
                  key={`${item.area}-${i}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.25 + i * 0.08, ease: EASE_OUT }}
                  className="rounded-2xl border border-slate-200 bg-white p-3.5 transition hover:border-slate-300 hover:shadow-md"
                >
                  <div className="mb-1.5 flex items-center gap-2">
                    <span className="rounded-md bg-blue-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                      NEW
                    </span>
                    <p className="text-xs font-semibold text-slate-600">{item.area}</p>
                  </div>
                  <p className="text-sm font-semibold leading-snug text-slate-900">{item.title}</p>
                  <p className="mt-1 font-mono text-[11px] text-slate-500">{item.time}</p>
                </motion.li>
              ))}
            </ul>

            <Link
              href="/subsidies/list"
              className="mt-5 flex w-full items-center justify-center rounded-2xl border border-slate-300 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              もっと見る
            </Link>
          </motion.aside>
        </div>

        {/* === 4特徴カード === */}
        <div className="mt-12 grid gap-4 md:mt-16 md:grid-cols-2 lg:grid-cols-4">
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
              <h4 className="mb-1.5 text-base font-bold text-slate-900">{f.title}</h4>
              <p className="text-sm leading-relaxed text-slate-600">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

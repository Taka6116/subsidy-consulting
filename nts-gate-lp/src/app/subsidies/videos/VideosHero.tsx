"use client";

import Link from "next/link";

// ────────────────────────────────────────────────────────────
// PCモニター内のフェイク動画プレイヤー
// ────────────────────────────────────────────────────────────
function VideoPlayer() {
  return (
    <div
      className="relative overflow-hidden rounded-lg"
      style={{ background: "linear-gradient(135deg,#0b2a6a 0%,#0e3a8a 60%,#0a2557 100%)" }}
    >
      {/* 字幕風テキスト */}
      <div className="absolute bottom-10 left-0 right-0 flex justify-center px-4">
        <p className="rounded bg-black/70 px-3 py-1 text-center text-[11px] leading-snug text-white/90 sm:text-xs">
          海外で特許・商標を守りたい企業向けに、対象・金額・申請前の注意点を整理します。
        </p>
      </div>

      {/* 進捗バー */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
        <div className="h-full w-[38%] bg-[#60a5fa]" />
      </div>

      {/* 再生中ラベル + 時間 */}
      <div className="absolute left-3 top-3 flex items-center gap-1.5">
        <span className="flex h-5 items-center gap-1 rounded bg-red-600/90 px-2 text-[10px] font-bold uppercase text-white">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
          再生中
        </span>
        <span className="text-[10px] text-white/70">1:04 / 2:44</span>
      </div>

      {/* 中央 再生ボタン（半透明）*/}
      <div className="flex aspect-video items-center justify-center">
        <button
          type="button"
          aria-label="動画を再生する"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 ring-2 ring-white/40 backdrop-blur-sm transition hover:bg-white/30 sm:h-16 sm:w-16"
        >
          <svg viewBox="0 0 24 24" fill="white" className="ml-1 h-6 w-6 sm:h-7 sm:w-7">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// PCモニターフレーム
// ────────────────────────────────────────────────────────────
function MonitorFrame() {
  return (
    <div className="relative mx-auto w-full">
      {/* モニター外枠 */}
      <div
        className="rounded-2xl p-1.5 shadow-2xl"
        style={{ background: "linear-gradient(160deg,#1e3a6a 0%,#0f2248 100%)", boxShadow: "0 24px 60px rgba(10,37,103,0.45)" }}
      >
        {/* ブラウザ風タブバー */}
        <div className="flex items-center gap-1.5 rounded-t-xl px-3 py-2" style={{ background: "#162040" }}>
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          <div className="mx-3 flex-1 rounded-md bg-[#0d1830] px-3 py-1 text-center text-[10px] text-white/40">
            NTS Video Library
          </div>
          <span className="rounded bg-[#0d1830] px-2 py-0.5 text-[10px] text-white/50">Auto playing 1:04</span>
        </div>

        {/* 画面本体 */}
        <div className="rounded-b-xl p-3" style={{ background: "#0e1f45" }}>
          <div className="grid grid-cols-[1fr_auto] gap-3">
            {/* 左: 動画エリア */}
            <div className="flex min-w-0 flex-col gap-2">
              <VideoPlayer />
              {/* 動画タイトル */}
              <div className="px-0.5">
                <p className="text-[10px] font-bold text-white/90 leading-snug sm:text-xs">
                  海外出願支援補助金<br />
                  最大300万円の活用ポイント
                </p>
                <div className="mt-1 flex items-center gap-1.5 text-[9px] text-white/50">
                  <span className="rounded bg-white/10 px-1.5 py-0.5">専門家による制度解説</span>
                  <span>NTS補助金活用アドバイザー 桜庭</span>
                </div>
              </div>
            </div>

            {/* 右: この動画でわかることパネル */}
            <div
              className="hidden w-[130px] shrink-0 flex-col rounded-xl p-3 sm:flex xl:w-[148px]"
              style={{ background: "#0a1730", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <p className="mb-2.5 text-[9px] font-bold uppercase tracking-wider text-white/50">
                この動画でわかること
              </p>
              {/* 補助上限 */}
              <div className="mb-2 flex flex-col gap-0.5">
                <span className="text-[9px] text-white/40">補助上限</span>
                <span className="text-[11px] font-bold text-[#60a5fa]">最大300万円</span>
              </div>
              {/* 申請期限 */}
              <div className="mb-3 flex flex-col gap-0.5">
                <span className="text-[9px] text-white/40">申請期限</span>
                <span className="text-[11px] font-bold text-white/90">2026/5/29</span>
              </div>
              {/* チェックリスト */}
              {[
                "対象になりやすい企業",
                "特許・商標出願の活用例",
                "申請前に確認する注意点",
              ].map((item) => (
                <div key={item} className="mb-1.5 flex items-start gap-1.5">
                  <svg viewBox="0 0 12 12" fill="none" className="mt-0.5 h-3 w-3 shrink-0">
                    <circle cx="6" cy="6" r="6" fill="#22c55e" />
                    <path d="M3.5 6l1.8 1.8L8.5 4.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="text-[9px] leading-snug text-white/75">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* モニタースタンド */}
      <div className="mx-auto mt-1.5 h-4 w-20 rounded-b-lg" style={{ background: "#1e3a6a" }} />
      <div className="mx-auto h-2 w-32 rounded-b-xl" style={{ background: "#162040" }} />
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// メインヒーローコンポーネント
// ────────────────────────────────────────────────────────────
export default function VideosHero() {
  return (
    <section
      aria-labelledby="videos-hero-heading"
      className="relative overflow-hidden"
      style={{
        background: "linear-gradient(160deg,#dbeafe 0%,#eff6ff 45%,#f0f9ff 100%)",
      }}
    >

      <div className="relative mx-auto w-full max-w-[1780px] px-[clamp(1.75rem,3.4vw,4rem)] py-14 sm:py-16 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.46fr)_minmax(0,0.54fr)] lg:gap-10 xl:gap-12">

          {/* ── 左: テキスト（大画面でも幅を確保） ── */}
          <div className="w-full min-w-0 lg:max-w-[600px] xl:max-w-[640px] 2xl:max-w-[680px]">
            {/* H1 */}
            <h1
              id="videos-hero-heading"
              className="font-heading text-[clamp(2.875rem,3.5vw,4rem)] font-black leading-[1.14] tracking-tight text-[#081C44]"
            >
              使える補助金を、
              <br />
              <span className="bg-gradient-to-r from-[#0EA5E9] to-[#006FE6] bg-clip-text text-transparent">
                1分で要点確認。
              </span>
            </h1>

            {/* サブコピー */}
            <p className="font-body mt-5 max-w-[560px] text-[clamp(1rem,1.1vw,1.1875rem)] font-semibold leading-[1.95] tracking-wide text-[#102C54]">
              金額、対象企業、活用方法、申請前の注意点まで。
              <br className="hidden sm:block" />
              忙しい中小企業の経営者が、まず見るべきポイントだけを
              専門家の解説動画で確認できます。
            </p>

            {/* CTA */}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="#video-list"
                className="inline-flex h-[52px] items-center justify-center gap-2 rounded-xl px-6 text-sm font-black text-white shadow-[0_20px_42px_rgba(7,91,216,.30)] transition hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#075BD8] [background:var(--nts-gradient-primary)] sm:text-base"
              >
                <svg viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4">
                  <path d="M8 0C3.58 0 0 3.58 0 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm-1 11.5V4.5l5 3.5-5 3.5z" />
                </svg>
                注目動画を見る
              </Link>
              <Link
                href="/consult"
                className="inline-flex h-[52px] items-center justify-center gap-2 rounded-xl px-6 text-sm font-black text-white shadow-[0_20px_42px_rgba(13,148,136,.28)] transition hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d9488] [background:var(--nts-gradient-check)] sm:text-base"
              >
                自社に合う補助金を相談
              </Link>
            </div>
          </div>

          {/* ── 右: PCモニタービジュアル（右カラム幅いっぱいに近いサイズまで拡大） ── */}
          <div className="flex w-full min-w-0 justify-center lg:justify-end">
            <div className="w-full max-w-[560px] sm:max-w-[620px] lg:max-w-[min(100%,760px)] xl:max-w-[min(100%,860px)] 2xl:max-w-[min(100%,960px)]">
              <MonitorFrame />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { useRef, useState } from "react";

// ────────────────────────────────────────────────────────────
// PCモニター内の動画プレイヤー（HeyGen 生成動画）
// ────────────────────────────────────────────────────────────
const HERO_VIDEO_URL =
  "https://files2.heygen.ai/aws_pacific/avatar_tmp/d3fd9697697e4c37a6ac077b210511e5/a2e5a50ed8144740b3ac0060ffb74abe.mp4?Expires=1780891017&Signature=btj5YyoJm35S7BGvpfLIct~Xebv04T79fC9KL1KqZwBD8~DTzO121buS72A-hLdL3rZUe93buVhX-Irm~v39e3wm7g6FpYr9Y7yyzSI7Pwz~R30XSoi~sCNXP8dJAAXzOf5J~gkMQsIRuzPU29B57raF2q63Qg-x1h1oLquCA2dTd4R62R-FhtWG0yo2kjo-j0fXuaKQxWlYfzEdHiTGScHlPbEvnAAvbWa9eCC8I6TlvNYSPgDMq5GgTUHGiDcxxgkDqJYIGPvFEg0LUlpNOaxTtM7AyAtonQE1VSjWf8QJyjytsck2OAFKiryi6e6-R8-SHWLOEYu24vhaOtewIA__&Key-Pair-Id=K38HBHX5LX3X2H";

function VideoPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  function toggleMute() {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  }

  return (
    <div className="relative overflow-hidden rounded-lg bg-black">
      <video
        ref={videoRef}
        src={HERO_VIDEO_URL}
        autoPlay
        muted
        playsInline
        loop
        className="aspect-video w-full rounded-lg object-cover"
      />

      {/* ミュート切替ボタン */}
      <button
        type="button"
        onClick={toggleMute}
        aria-label={muted ? "音声をオンにする" : "音声をオフにする"}
        className="absolute bottom-2.5 right-2.5 flex h-7 w-7 items-center justify-center rounded-full transition hover:scale-110"
        style={{
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(4px)",
          border: "1px solid rgba(255,255,255,0.2)",
        }}
      >
        {muted ? (
          /* ミュート中: スラッシュ付きスピーカー */
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <line x1="23" y1="9" x2="17" y2="15"/>
            <line x1="17" y1="9" x2="23" y2="15"/>
          </svg>
        ) : (
          /* 音あり: スピーカー＋波形 */
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
          </svg>
        )}
      </button>

      {/* ミュート中の視覚的ヒント（初回のみ） */}
      {muted && (
        <div
          className="absolute bottom-2.5 right-11 flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold text-white/80 pointer-events-none"
          style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
        >
          タップで音声ON
        </div>
      )}
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
            subsidy-consulting-nts.vercel.app/subsidies/videos
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
                  資格取得サポート助成金
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
                <span className="text-[11px] font-bold text-[#60a5fa]">補助上限</span>
              </div>
              {/* 申請期限 */}
              <div className="mb-3 flex flex-col gap-0.5">
                <span className="text-[11px] font-bold text-white/90">申請期限</span>
              </div>
              {/* チェックリスト */}
              {[
                "資格取得費用の助成内容",
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
      className="videos-hero-gradient overflow-hidden"
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
                href="/consult"
                className="inline-flex h-[52px] items-center justify-center gap-2 rounded-xl px-6 text-sm font-black text-white shadow-[0_20px_42px_rgba(7,91,216,.30)] transition hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#075BD8] [background:var(--nts-gradient-primary)] sm:text-base"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <path d="M8 2H5a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8l-6-6z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
                無料相談予約する
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

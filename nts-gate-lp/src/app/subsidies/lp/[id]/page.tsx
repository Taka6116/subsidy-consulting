/**
 * /subsidies/lp/[id]
 *
 * 補助金 1 件に対して自動生成される魅力的な LP ページ。
 * SubsidyGrant の rawPayload + DB カラムからデータを組み立て、
 * GeneratedContent（contentType="lp"）が存在すればその AI コピーを使う。
 * ISR 5 分で再検証。
 */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import Header from "@/components/shared/Header";
import { TemperatureCTA } from "@/components/shared/CTAButton";
import LpFooter from "@/components/gate-lp/LpFooter";
import SubsidyLpHero from "@/components/subsidy-lp/SubsidyLpHero";
import SubsidyLpStats from "@/components/subsidy-lp/SubsidyLpStats";
import SubsidyLpChecker from "@/components/subsidy-lp/SubsidyLpChecker";
// ========== [LEGACY 2026-04-30] 中間CTA import - Phase 3では非表示 ==========
// import SubsidyLpMatchCta from "@/components/subsidy-lp/SubsidyLpMatchCta";
import SubsidyLpPainSection from "@/components/subsidy-lp/SubsidyLpPainSection";
import SubsidyLpUseCases from "@/components/subsidy-lp/SubsidyLpUseCases";
import SubsidyLpHowSection from "@/components/subsidy-lp/SubsidyLpHowSection";
import SubsidyLpCtaBottom from "@/components/subsidy-lp/SubsidyLpCtaBottom";
import SubsidyLpFaq from "@/components/subsidy-lp/SubsidyLpFaq";
import DeadlineCountdown from "@/components/subsidy-lp/DeadlineCountdown";
import LiveStatusBar from "@/components/subsidy-lp/LiveStatusBar";
import SideFloatingCTA from "@/components/subsidy-lp/SideFloatingCTA";
import SubscribeSection from "@/components/subsidy-lp/SubscribeSection";
// ========== [NEW 2026-04-30] Phase 7: Exit Intent モーダル ==========
import ExitIntentModal from "@/components/subsidy-lp/ExitIntentModal";
import { buildSubsidyLpData } from "@/lib/subsidy-lp/buildSubsidyLpData";
import { subsidyLpAsset } from "@/lib/subsidy-lp/assets";

export const revalidate = 300; // 5分ISR
export const dynamicParams = true;

type Props = { params: Promise<{ id: string }> };

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const grant = await prisma.subsidyGrant.findUnique({
    where: { id },
    select: { name: true, maxAmountLabel: true, deadlineLabel: true },
  });
  if (!grant) return { title: "補助金LP | 日本提携支援" };

  const name = grant.name ?? "補助金制度";
  return {
    title: `${name} | 活用ガイド・無料相談 — 日本提携支援`,
    description: `${name}の補助額・補助率・申請方法をわかりやすく解説。自社に使えるか無料で相談できます。`,
    openGraph: {
      title: `${name} — 補助金活用ガイド`,
      description: "中小企業の経営課題解決に活用できる補助金制度の詳細と、無料相談のご案内。",
      type: "website",
    },
  };
}

function parseDateOrNull(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  const date = typeof value === "string" ? new Date(value) : value;
  return Number.isNaN(date.getTime()) ? null : date;
}

export default async function SubsidyLpPage({ params }: Props) {
  const { id } = await params;

  const grant = await prisma.subsidyGrant.findUnique({
    where: { id },
    include: {
      contents: {
        where: { contentType: "lp", status: "published" },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!grant) notFound();

  // ========== [LEGACY 2026-04-30] 動画セクション用データ取得 - Phase 3では表示のみ非表示 ==========
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const video = await prisma.generatedContent.findFirst({
    where: {
      subsidyId: id,
      contentType: "video",
      status: "published",
      videoPath: { not: null },
    },
    orderBy: { publishedAt: "desc" },
    select: {
      slug: true,
      title: true,
      excerpt: true,
      videoPath: true,
      thumbnailPath: true,
      duration: true,
    },
  });

  const lpContent = grant.contents[0] ?? null;
  const data = buildSubsidyLpData(grant, lpContent);
  const livePublishedAt =
    lpContent?.publishedAt ??
    lpContent?.createdAt ??
    grant.syncedAt ??
    new Date("2026-04-28T14:00:00+09:00");
  const liveUpdatedAt = grant.updatedAt ?? new Date();
  const liveApplicationDeadline =
    grant.deadline ??
    parseDateOrNull(grant.deadlineLabel) ??
    // TODO: subsidy.deadline が必ず入るようにDB同期処理を見直す。欠損時は速報バー用の仮値。
    new Date("2026-10-12T23:59:59+09:00");

  return (
    <>
      <Header />
      <main className="relative min-h-screen bg-[var(--bg-base)] font-body">
        {/* ========== [NEW 2026-04-30] 速報ステータスバー - ヘッダー直下に常駐 ========== */}
        {/* TODO: subsidy.publishedAt フィールドをDBスキーマに追加したら livePublishedAt を差し替える */}
        {/* TODO: subsidy.updatedAt が速報LPの最終更新時刻として正しく更新されるよう、コンテンツ生成Lambda側も確認する */}
        <LiveStatusBar
          publishedAt={livePublishedAt}
          updatedAt={liveUpdatedAt}
          applicationDeadline={liveApplicationDeadline}
        />

        <SubsidyLpHero data={data} />

        {/* ========== [REORDERED 2026-04-30] 3問チェックをFV直下に移動 ========== */}
        <div id="checker">
          <SubsidyLpChecker />
        </div>

        {/* § 数字で見る制度規模 */}
        <SubsidyLpStats data={data} />

        {/* ========== [LEGACY 2026-04-30] LP連動の解説動画 - Phase 3運用では非表示 ========== */}
        {/*
        <SubsidyLpVideoSection video={video} />
        */}

        {/* ========== [LEGACY 2026-04-30] 中間CTA - Phase 5のマルチCTAへ統合予定 ========== */}
        {/*
        <SubsidyLpMatchCta />
        */}

        {/* § こんな課題がある企業に */}
        <SubsidyLpPainSection data={data} />
        {/* § 活用イメージ（ペルソナ） */}
        <SubsidyLpUseCases data={data} />
        {/* ========== [NEW 2026-04-30] 次回公募メアド登録CTA ========== */}
        <SubscribeSection subsidyId={data.id} />
        {/* ========== [NEW 2026-04-30] 締切カウントダウン - 申請の流れ直前 ========== */}
        <DeadlineCountdown deadline={liveApplicationDeadline} />
        {/* § 申請タイムライン */}
        <SubsidyLpHowSection />
        {/* § よくある不安 + FAQ */}
        <SubsidyLpFaq data={data} />
        {/* § 最終CTA */}
        <FinalCtaSection subsidyId={data.id} grantName={data.name} remainingDays={data.remainingDays} />
        {/* § 関連記事 */}
        <ArticleLinkSection grantId={id} grantName={data.name} />

        {/* モバイル スティッキー CTA */}
        <SubsidyLpCtaBottom data={data} />
        {/* ========== [NEW 2026-04-30] サイドフローティングCTA - PDF持ち帰り ========== */}
        <SideFloatingCTA subsidyId={data.id} />
        {/* ========== [NEW 2026-04-30] Phase 7: Exit Intent モーダル ========== */}
        {/* マウスがビューポート上部を抜けたときに表示。モバイルでは mouseleave が発火しないため自然に無効 */}
        <ExitIntentModal subsidyId={data.id} />
      </main>
      <LpFooter />
    </>
  );
}

function formatDurationLabel(duration: number | null): string {
  if (!duration) return "約1分";
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;
  if (minutes <= 0) return `${seconds}秒`;
  return seconds > 0 ? `${minutes}分${seconds}秒` : `${minutes}分`;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function SubsidyLpVideoSection({
  video,
}: {
  video: {
    slug: string | null;
    title: string | null;
    excerpt: string | null;
    videoPath: string | null;
    thumbnailPath: string | null;
    duration: number | null;
  } | null;
}) {
  if (!video?.videoPath) return null;

  return (
    <section className="bg-[var(--bg-section-alt)] py-16 md:py-24">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
            Movie Guide
          </p>
          <h2 className="text-2xl font-black tracking-[-0.02em] text-[#172033] sm:text-3xl">
            この補助金のポイントを動画で確認できます。
          </h2>
          <p className="mt-4 text-sm font-medium leading-7 text-[#526173]">
            LPの内容と同じ情報をもとに、制度概要・数字・活用イメージ・申請の流れを音声付きで整理しています。
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm font-bold text-[#526173]">
            <span className="rounded-full bg-white px-4 py-2 shadow-sm ring-1 ring-[#dce6ef]">
              {formatDurationLabel(video.duration)}
            </span>
            <span className="rounded-full bg-white px-4 py-2 shadow-sm ring-1 ring-[#dce6ef]">
              音声ナレーション付き
            </span>
          </div>
          {video.slug && (
            <Link
              href={`/subsidies/videos/${video.slug}`}
              className="mt-7 inline-flex min-h-12 items-center justify-center rounded-full bg-[#10233f] px-7 text-sm font-extrabold text-white transition hover:brightness-110"
            >
              動画ページで詳しく見る
              <span aria-hidden className="ml-2">→</span>
            </Link>
          )}
        </div>
        <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-[#dce6ef]">
          <video
            src={video.videoPath}
            poster={video.thumbnailPath ?? undefined}
            controls
            playsInline
            preload="metadata"
            className="aspect-video w-full bg-[#10233f]"
          >
            ご利用のブラウザは動画再生に対応していません。
          </video>
        </div>
      </div>
    </section>
  );
}

function FinalCtaSection({
  subsidyId,
  grantName,
  remainingDays,
}: {
  subsidyId: string;
  grantName: string;
  remainingDays: number | null;
}) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const teamImage = subsidyLpAsset("team.png");

  const urgentDays = remainingDays !== null && remainingDays >= 0 && remainingDays <= 30;

  return (
    <section className="relative overflow-hidden bg-slate-900 py-20 text-white md:py-28">
      {/* ========== [LEGACY 2026-04-30] 旧最終CTA - ロールバック時は下のコメントアウトを解除 ========== */}
      {/*
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:grid lg:grid-cols-[1fr_300px]">
        <div className="px-8 py-20 sm:px-12 md:py-28">
          {remainingDays !== null && remainingDays >= 0 && (
            <span>締切まで残り {remainingDays} 日</span>
          )}
          <p>Free Consultation</p>
          <h2>自社で使えるか、まずは確認から。</h2>
          <p>{grantName}の対象範囲・補助率・必要書類は、無料相談で個別に整理できます。</p>
          <Link href="/consult">無料相談を予約する</Link>
          <Link href="/subsidies/list">対象補助金を確認する</Link>
        </div>
        <img src={teamImage} alt="" aria-hidden="true" />
      </div>
      */}

      {/* ========== [NEW 2026-04-30] 温度別マルチCTA ========== */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full blur-3xl"
        style={{ background: "rgba(14,165,164,0.18)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full blur-3xl"
        style={{ background: "rgba(251,146,60,0.12)" }}
      />

      <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6">
        {remainingDays !== null && remainingDays >= 0 && (
          <div className="mb-5">
            <span
              className={[
                "inline-flex items-center rounded-full px-4 py-1.5 text-sm font-extrabold",
                urgentDays
                  ? "ring-1 ring-[rgba(251,146,60,0.35)]"
                  : "ring-1 ring-white/15",
              ].join(" ")}
              style={
                urgentDays
                  ? { background: "rgba(251,146,60,0.15)", color: "var(--nts-accent-orange)" }
                  : { background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.85)" }
              }
            >
              締切まで残り {remainingDays} 日
            </span>
          </div>
        )}

        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          Next Action
        </p>
        <h2 className="text-3xl font-black leading-tight tracking-[-0.03em] text-white md:text-5xl">
          最初の一歩は、軽くて構いません。
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-sm font-medium leading-7 text-slate-300 md:text-base">
          {grantName}が使えるかは、動き出してみないと分からない部分もあります。まずは情報を持ち帰る、1分で診断する、相談する。今の温度感に合わせて選べます。
        </p>

        <div className="mt-12 grid gap-4 md:grid-cols-3 md:gap-6">
          <div className="flex flex-col items-center gap-3 rounded-3xl bg-white/5 p-6 ring-1 ring-white/10 backdrop-blur">
            <p className="text-sm text-slate-400">情報だけ欲しい</p>
            <TemperatureCTA
              temperature="cold"
              href={`/subsidies/lp/${subsidyId}/pdf`}
              label="PDFで概要をDL"
            />
            <p className="text-xs text-slate-500">
              メアド不要・30秒
            </p>
          </div>

          <div className="flex flex-col items-center gap-3 rounded-3xl bg-white/10 p-6 ring-2 ring-amber-500/50 backdrop-blur">
            <p className="text-sm font-semibold text-amber-300">対象か知りたい</p>
            <TemperatureCTA
              temperature="warm"
              href={`/check?from=grant_${subsidyId}`}
              label="1分で診断する"
              size="large"
              className="text-[#172033]"
            />
            <p className="text-xs text-slate-400">個人情報入力なし</p>
          </div>

          <div className="flex flex-col items-center gap-3 rounded-3xl bg-white/5 p-6 ring-1 ring-white/10 backdrop-blur">
            <p className="text-sm text-slate-400">じっくり相談したい</p>
            <TemperatureCTA
              temperature="hot"
              href="/consult"
              label="無料相談を予約"
            />
            <p className="text-xs text-slate-500">30分・オンライン可</p>
          </div>
        </div>

        {/* TODO: /subsidies/lp/[id]/pdf のRoute Handlerを作る。今はPhase 6以降で実装予定 */}
      </div>
    </section>
  );
}

/** 関連記事へのリンク（記事が存在する場合のみ表示） */
async function ArticleLinkSection({
  grantId,
  grantName,
}: {
  grantId: string;
  grantName: string;
}) {
  const articles = await prisma.generatedContent.findMany({
    where: { subsidyId: grantId, contentType: "article", status: "published" },
    orderBy: { publishedAt: "desc" },
    take: 3,
    select: { slug: true, title: true, publishedAt: true },
  });

  if (articles.length === 0) return null;

  return (
    <section className="bg-slate-50 py-12 md:py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
          関連解説記事
        </p>
        <h2 className="text-xl font-black text-[#172033]">
          {grantName} をもっと詳しく
        </h2>
        <ul className="mt-4 space-y-2">
          {articles.map((a) => (
            <li key={a.slug}>
              <Link
                href={`/subsidies/articles/${a.slug}`}
                className="flex items-center justify-between rounded-2xl border border-[#dce6ef] bg-white px-4 py-3 text-sm transition hover:border-[#b9d8ee] hover:bg-[#f8fbfe] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e9bdb]"
              >
                <span className="font-bold text-[#172033]">
                  {a.title ?? "解説記事"}
                </span>
                <span className="ml-3 shrink-0 text-xs text-neutral-400">→</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

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
import LpFooter from "@/components/gate-lp/LpFooter";
import SubsidyLpHero from "@/components/subsidy-lp/SubsidyLpHero";
import SubsidyLpStats from "@/components/subsidy-lp/SubsidyLpStats";
import SubsidyLpChecker from "@/components/subsidy-lp/SubsidyLpChecker";
import SubsidyLpMatchCta from "@/components/subsidy-lp/SubsidyLpMatchCta";
import SubsidyLpPainSection from "@/components/subsidy-lp/SubsidyLpPainSection";
import SubsidyLpUseCases from "@/components/subsidy-lp/SubsidyLpUseCases";
import SubsidyLpHowSection from "@/components/subsidy-lp/SubsidyLpHowSection";
import SubsidyLpCtaBottom from "@/components/subsidy-lp/SubsidyLpCtaBottom";
import SubsidyLpFaq from "@/components/subsidy-lp/SubsidyLpFaq";
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

  const data = buildSubsidyLpData(grant, grant.contents[0] ?? null);

  return (
    <>
      <Header />
      <main className="relative min-h-screen bg-[var(--bg-base)] font-body">
        <SubsidyLpHero data={data} />

        {/* § 数字で見る制度規模 */}
        <SubsidyLpStats data={data} />
        {/* § LP連動の解説動画 */}
        <SubsidyLpVideoSection video={video} />
        {/* § 30秒対象診断 */}
        <div id="checker">
          <SubsidyLpChecker />
        </div>
        {/* § 補助金照会 */}
        <SubsidyLpMatchCta />
        {/* § こんな課題がある企業に */}
        <SubsidyLpPainSection data={data} />
        {/* § 活用イメージ（ペルソナ） */}
        <SubsidyLpUseCases data={data} />
        {/* § 申請タイムライン */}
        <SubsidyLpHowSection />
        {/* § よくある不安 + FAQ */}
        <SubsidyLpFaq data={data} />
        {/* § 最終CTA */}
        <FinalCtaSection grantName={data.name} remainingDays={data.remainingDays} />
        {/* § 関連記事 */}
        <ArticleLinkSection grantId={id} grantName={data.name} />

        {/* モバイル スティッキー CTA */}
        <SubsidyLpCtaBottom data={data} />
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
  grantName,
  remainingDays,
}: {
  grantName: string;
  remainingDays: number | null;
}) {
  const teamImage = subsidyLpAsset("team.png");

  const urgentDays = remainingDays !== null && remainingDays >= 0 && remainingDays <= 30;

  return (
    <section
      className="relative overflow-hidden text-white"
      style={{
        background: "var(--nts-bg-base)",
      }}
    >
      {/* 装飾グロー */}
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

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:grid lg:grid-cols-[1fr_300px]">
        {/* テキスト側 */}
        <div className="px-8 py-20 sm:px-12 md:py-28">
          {/* 残日数バッジ */}
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
            Free Consultation
          </p>
          <h2
            className="text-2xl font-black leading-tight tracking-[-0.02em] text-white sm:text-3xl"
          >
            自社で使えるか、まずは確認から。
          </h2>
          <p
            className="mt-4 max-w-xl text-sm font-medium leading-7"
            style={{ color: "var(--nts-text-secondary-dark)" }}
          >
            {grantName}の対象範囲・補助率・必要書類は、無料相談で個別に整理できます。制度名だけでは判断しにくい要件を、専門家が一緒に確認します。
          </p>

          {/* メイン巨大ボタン */}
          <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <Link
              href="/consult"
              className="group inline-flex min-h-[64px] items-center justify-center rounded-full px-10 text-base font-extrabold text-[#0F172A] transition hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--nts-accent-orange)] motion-safe:duration-200"
              style={{
                background: "var(--nts-accent-orange)",
                boxShadow: "var(--nts-glow-orange)",
              }}
            >
              無料相談を予約する
              <span aria-hidden className="ml-2 motion-safe:transition motion-safe:duration-200 group-hover:translate-x-1">→</span>
            </Link>
            <Link
              href="/subsidies/list"
              className="text-sm font-bold underline underline-offset-4 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--nts-accent-cyan)] motion-safe:duration-200 hover:opacity-80"
              style={{ color: "var(--nts-accent-cyan)" }}
            >
              対象補助金を確認する
            </Link>
          </div>
        </div>

        {/* イメージ側 */}
        <div className="relative hidden items-end justify-center px-5 pt-8 lg:flex" style={{ background: "rgba(255,255,255,0.04)" }}>
          <img
            src={teamImage}
            alt=""
            aria-hidden="true"
            className="h-72 w-auto object-contain drop-shadow-[0_20px_34px_rgba(0,0,0,0.22)]"
          />
        </div>
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

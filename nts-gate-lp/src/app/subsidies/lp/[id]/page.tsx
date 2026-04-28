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

  const data = buildSubsidyLpData(grant, grant.contents[0] ?? null);

  return (
    <>
      <Header />
      <main className="relative min-h-screen bg-[#eef4f9] font-body">
        <SubsidyLpHero data={data} />

        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:py-16">
          <div className="space-y-12">
            <SubsidyLpStats data={data} />
            <SubsidyLpPainSection data={data} />
            <SubsidyLpUseCases data={data} />
            <SubsidyLpHowSection />
            <SubsidyLpFaq data={data} />
            <FinalCtaSection grantName={data.name} />
            <ArticleLinkSection grantId={id} grantName={data.name} />
          </div>
        </div>

        {/* モバイル スティッキー CTA */}
        <SubsidyLpCtaBottom data={data} />
      </main>
      <LpFooter />
    </>
  );
}

function FinalCtaSection({ grantName }: { grantName: string }) {
  const teamImage = subsidyLpAsset("team.png");

  return (
    <section className="relative grid overflow-hidden rounded-[32px] bg-[#071525] text-white shadow-[0_24px_60px_rgba(23,32,51,0.18)] lg:grid-cols-[1fr_320px]">
      <div
        aria-hidden
        className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#1e9bdb]/25 blur-2xl"
      />
      <div className="relative px-6 py-10 sm:px-10">
        <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-[#8fd3ff]">
          Free Consultation
        </p>
        <h2 className="mt-3 text-2xl font-black leading-tight tracking-[-0.02em] text-white sm:text-3xl">
          {grantName}が自社に使えるか、無料で確認できます。
        </h2>
        <p className="mt-4 text-sm font-medium leading-7 text-white">
          補助金は制度名だけでは判断しにくいものです。対象要件、投資内容、申請までの準備を一緒に整理します。
        </p>
        <Link
          href="/consult"
          className="mt-7 inline-flex items-center justify-center rounded-full bg-[#fd9f1b] px-8 py-3.5 text-sm font-extrabold text-[#172033] shadow-[0_10px_30px_rgba(253,159,27,0.3)] transition hover:-translate-y-0.5 hover:bg-[#ffb64c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#fd9f1b] active:translate-y-0"
        >
          無料相談する
        </Link>
      </div>
      <div className="relative hidden items-end justify-center bg-white/5 px-5 pt-8 lg:flex">
        <img
          src={teamImage}
          alt=""
          aria-hidden="true"
          className="h-72 w-auto object-contain drop-shadow-[0_20px_34px_rgba(0,0,0,0.22)]"
        />
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
    <section className="rounded-[28px] border border-[#dce6ef] bg-white p-6 shadow-[0_18px_45px_rgba(23,32,51,0.08)] sm:p-8">
      <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-[#1e9bdb]">
        関連解説記事
      </p>
      <h2 className="mt-2 text-xl font-black text-[#172033]">
        {grantName} をもっと詳しく
      </h2>
      <ul className="mt-4 space-y-2">
        {articles.map((a) => (
          <li key={a.slug}>
            <Link
              href={`/subsidies/articles/${a.slug}`}
              className="flex items-center justify-between rounded-2xl border border-[#dce6ef] bg-[#f8fbfe] px-4 py-3 text-sm transition hover:border-[#b9d8ee] hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e9bdb]"
            >
              <span className="font-bold text-[#172033]">
                {a.title ?? "解説記事"}
              </span>
              <span className="ml-3 shrink-0 text-xs text-neutral-400">→</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

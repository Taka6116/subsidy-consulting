/**
 * /subsidies/lp/[id]
 *
 * 補助金 1 件に対して自動生成される LP ページ。
 * construction-electrification と同じセクション構成を使用する。
 * ISR 5 分で再検証。
 */

import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import Header from "@/components/shared/Header";
import LpFooter from "@/components/gate-lp/LpFooter";
import HeroSection from "@/components/subsidy-lp/HeroSection";
import CheckerSection from "@/components/subsidy-lp/CheckerSection";
import TargetIndustriesSection from "@/components/subsidy-lp/TargetIndustriesSection";
import BeforeAfterSection from "@/components/subsidy-lp/BeforeAfterSection";
import CaseStudiesSection from "@/components/subsidy-lp/CaseStudiesSection";
import ArticleRelatedSection from "@/components/subsidy-lp/ArticleRelatedSection";
import FlowSection from "@/components/subsidy-lp/FlowSection";
import FinalCtaSection from "@/components/subsidy-lp/FinalCtaSection";
import ContactSection from "@/components/subsidy-lp/ContactSection";
import { buildSubsidyLpData } from "@/lib/subsidy-lp/buildSubsidyLpData";
import { adaptToLpData } from "@/lib/subsidy-lp/adaptToLpData";
import { pickLpHeroImage } from "@/lib/content/lpImagePool";

export const revalidate = 300;
export const dynamicParams = true;

type Props = { params: Promise<{ id: string }> };

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const grant = await prisma.subsidyGrant.findUnique({
    where: { id },
    select: { name: true, maxAmountLabel: true },
  });
  if (!grant) return { title: "補助金LP | 日本提携支援" };
  const name = grant.name ?? "補助金制度";
  return {
    title: `${name} | 活用ガイド・無料相談 — 日本提携支援`,
    description: `${name}の補助額・申請方法をわかりやすく解説。自社に使えるか無料で相談できます。`,
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

  // 専用設計の個別LPへリダイレクト
  const name = grant.name ?? "";
  if (
    name.includes("商用車等の電動化促進事業（建設機械）") ||
    name.includes("高用車等の電動化促進事業（建設機械）")
  ) {
    redirect("/subsidies/construction-electrification");
  }
  if (name.includes("デジタル技術導入")) {
    redirect("/subsidies/dx-support");
  }
  if (name.includes("賃上げ環境整備")) {
    redirect("/subsidies/wage-support");
  }
  if (name.includes("ものづくり・商業・サービス生産性向上促進補助金")) {
    redirect("/subsidies/monodukuri-business");
  }

  const lpContent = grant.contents[0] ?? null;
  const oldData = buildSubsidyLpData(grant, lpContent);
  const adapted = adaptToLpData(
    oldData,
    grant.name ?? "補助金制度",
    grant.targetIndustries ?? [],
  );
  const data = {
    ...adapted,
    heroImagePath: pickLpHeroImage({
      category: adapted.category,
      targetIndustries: grant.targetIndustries ?? [],
    }),
  };

  return (
    <>
      <Header />
      <main className="bg-white pt-16 sm:pt-20">
        <HeroSection data={data} />
        <CheckerSection data={data} />
        <TargetIndustriesSection data={data} />
        <BeforeAfterSection data={data} />
        <CaseStudiesSection data={data} />
        <ArticleRelatedSection subsidyId={id} />
        <FlowSection data={data} />
        <FinalCtaSection />
        <ContactSection source={`lp-${id}`} grantName={grant.name ?? undefined} />
      </main>
      <LpFooter />
    </>
  );
}

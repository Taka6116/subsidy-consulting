import Header from "@/components/shared/Header";
import LpFooter from "@/components/gate-lp/LpFooter";
import ScrollDepthTracker from "@/components/shared/ScrollDepthTracker";
import HomeEntrance from "@/components/gate-lp/HomeEntrance";
import HeroSection from "@/components/gate-lp/hero-three/HeroSection";
import HeroPartnerStrip from "@/components/gate-lp/HeroPartnerStrip";
import AwarenessSection from "@/components/sections/AwarenessSection";
import NtsWarmIntroMergedSection from "@/components/sections/NtsWarmIntroMergedSection";
import SubsidyMatchCtaSection from "@/components/sections/SubsidyMatchCtaSection";
import SubsidyExamplesSection from "@/components/sections/SubsidyExamplesSection";
import WhatIsNtsSection from "@/components/sections/WhatIsNtsSection";
import NtsAiGapSection from "@/components/sections/NtsAiGapSection";
import SubsidyCaseStudySection from "@/components/sections/SubsidyCaseStudySection";
import RootIssueCaseSection from "@/components/sections/RootIssueCaseSection";
import ArticlesCtaBar from "@/components/sections/ArticlesCtaBar";
import PartnerNarrowSection from "@/components/sections/PartnerNarrowSection";
import FaqSection from "@/components/sections/FaqSection";
import FinalCtaSection from "@/components/sections/FinalCtaSection";
import { prisma } from "@/lib/db/prisma";
import { pickHeroImage } from "@/lib/content/imagePool";
// import CheckLeadSection from "@/components/sections/CheckLeadSection";
// import NewSubsidySection from "@/components/sections/NewSubsidySection";
// import NtsAboutSection from "@/components/sections/NtsAboutSection";

export const revalidate = 300;

async function getPreviewArticles() {
  try {
    const rows = await prisma.generatedContent.findMany({
      where: {
        contentType: "article",
        status: "published",
        slug: { not: undefined },
        grant: { is: { status: "open" } },
      },
      orderBy: { publishedAt: "desc" },
      take: 9,
      include: {
        grant: {
          select: {
            name: true,
            targetIndustries: true,
            maxAmountLabel: true,
            deadlineLabel: true,
            prefecture: true,
          },
        },
      },
    });
    return rows
      .filter((r) => r.slug && r.title)
      .map((r) => ({
        id: r.id,
        slug: r.slug as string,
        title: r.title as string,
        excerpt: r.excerpt ?? "",
        subsidyName: r.grant?.name ?? "",
        tags: r.tags ?? [],
        heroImagePath: pickHeroImage({
          subsidyId: r.subsidyId,
          seedKey: r.id,
          tags: r.tags ?? [],
          targetIndustries: r.grant?.targetIndustries ?? [],
        }),
        maxAmountLabel: r.grant?.maxAmountLabel ?? null,
        deadlineLabel: r.grant?.deadlineLabel ?? null,
        publishedAt: r.publishedAt
          ? r.publishedAt.toLocaleDateString("ja-JP", { year: "numeric", month: "numeric", day: "numeric" })
          : null,
        prefecture: r.grant?.prefecture ?? null,
      }));
  } catch {
    return [];
  }
}

async function getFeaturedVideosHub() {
  try {
    const rows = await prisma.generatedContent.findMany({
      where: {
        contentType: "video",
        status: "published",
      },
      orderBy: { publishedAt: "desc" },
      take: 3,
      select: { slug: true, thumbnailPath: true, title: true },
    });
    return rows
      .filter((r) => r.slug)
      .map((r) => ({
        slug: r.slug as string,
        thumbnailPath: r.thumbnailPath,
        title: r.title,
      }));
  } catch {
    return [];
  }
}

export default async function Home() {
  const previewArticles = await getPreviewArticles();
  const featuredVideos = await getFeaturedVideosHub();

  return (
    <HomeEntrance>
      <ScrollDepthTracker />
      <Header />
      <main className="relative z-[2]">
        {/*
          トップ LP セクション順
          ①FV ②ロゴ帯 ③情報ハブ ④課題共感 ⑤視点の違い ⑥制度例 ⑦事例
          ⑧AIギャップ ⑨フロー・料金 ⑩伴走統合 ⑪パートナー ⑫診断CTA ⑬FAQ ⑭最終CTA
        */}
        {/* ① FV（変更なし） */}
        <div>
          <div className="relative">
            <HeroSection />
          </div>
          {/* ② 対応可能な補助金制度一覧（FV直後の信頼づけ） */}
          <div
            id="partner-lp"
            className="relative scroll-mt-20 sm:scroll-mt-24"
          >
            <HeroPartnerStrip />
          </div>
        </div>
        {/* ③ 補助金情報ハブ（記事・LP・動画） */}
        <ArticlesCtaBar articles={previewArticles} featuredVideos={featuredVideos} />
        {/* ④ あなたの経営課題、補助金で動かせるかもしれません */}
        <AwarenessSection />
        {/* ⑤ しかし、より最適な補助金制度があるかもしれません */}
        <RootIssueCaseSection />
        {/* ⑥ 例えばこんな補助金もあります。 */}
        <SubsidyExamplesSection />
        {/* ⑦ 実際の事例で見る、補助金の使い方 */}
        <SubsidyCaseStudySection />
        {/* ⑧ AIで書類は作れる時代。それでも、採択には届きません。 */}
        <NtsAiGapSection />
        {/* ⑨ 申請が、ゴールではありません。（フロー説明） */}
        <WhatIsNtsSection />
        {/* ⑩ 「補助金が使えます」。その先に、1年間の伴走があります。（統合セクション） */}
        <NtsWarmIntroMergedSection />
        {/* ⑪ パートナー企業の方へ。補助金を、御社の営業の武器に。 */}
        <PartnerNarrowSection />
        {/* ⑫ まず、自社に使える制度を確認してみてください。（診断CTA） */}
        <SubsidyMatchCtaSection />
        {/* ⑬ よくあるご質問 */}
        <FaqSection />
        {/* ⑭ まず、話を聞かせてください。（最終CTA） */}
        <FinalCtaSection />
      </main>
      <LpFooter />
    </HomeEntrance>
  );
}

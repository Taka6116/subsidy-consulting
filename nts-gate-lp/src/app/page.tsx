import Header from "@/components/shared/Header";
import LpFooter from "@/components/gate-lp/LpFooter";
import ScrollDepthTracker from "@/components/shared/ScrollDepthTracker";
import HomeEntrance from "@/components/gate-lp/HomeEntrance";
import HeroSection from "@/components/gate-lp/hero-three/HeroSection";
import HeroPartnerStrip from "@/components/gate-lp/HeroPartnerStrip";
import AwarenessSection from "@/components/sections/AwarenessSection";
import NtsWarmIntroSection from "@/components/sections/NtsWarmIntroSection";
import SubsidyKindsSection from "@/components/sections/SubsidyKindsSection";
import SubsidyMatchCtaSection from "@/components/sections/SubsidyMatchCtaSection";
import SubsidyExamplesSection from "@/components/sections/SubsidyExamplesSection";
import WhatIsNtsSection from "@/components/sections/WhatIsNtsSection";
import NtsAiGapSection from "@/components/sections/NtsAiGapSection";
import ComparisonDiagram from "@/components/sections/ComparisonDiagram";
import CtaBar from "@/components/sections/CtaBar";
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
      }));
  } catch {
    return [];
  }
}

export default async function Home() {
  const previewArticles = await getPreviewArticles();

  return (
    <HomeEntrance>
      <ScrollDepthTracker />
      <Header />
      <main className="relative z-[2]">
        {/*
          トップ LP セクション順
          ①FV ②ロゴ帯 ③課題共感 ④視点の違い ⑤制度例 ⑥事例
          ⑦AIギャップ ⑧フロー・料金 ⑨伴走1年 ⑩伴走図 ⑪CTAバー
          ⑫建設運送 ⑬パートナー ⑭診断CTA ⑮記事 ⑯FAQ ⑰最終CTA
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
        {/* ③ その経営課題、補助金で動かせるかもしれません */}
        <AwarenessSection />
        {/* ④ しかし、より最適な補助金制度があるかもしれません */}
        <RootIssueCaseSection />
        {/* ⑤ 例えばこんな補助金もあります。 */}
        <SubsidyExamplesSection />
        {/* ⑥ 実際の事例で見る、補助金の使い方 */}
        <SubsidyCaseStudySection />
        {/* ⑦ AIで書類は作れる時代。それでも、採択には届きません。 */}
        <NtsAiGapSection />
        {/* ⑧ 申請が、ゴールではありません。（フロー説明） */}
        <WhatIsNtsSection />
        {/* ⑨ 「補助金が使えます」。その先に、1年間の伴走があります。 */}
        <NtsWarmIntroSection />
        {/* ⑩ 採択後の伴走支援（NTSが目指す支援） */}
        <ComparisonDiagram />
        {/* ⑪ CTA（まず、話を聞かせてください。） */}
        <CtaBar />
        {/* ⑫ 建設業・運送業の経営者に、特化してサポートしています。 */}
        <SubsidyKindsSection />
        {/* ⑬ パートナー企業の方へ。補助金を、御社の営業の武器に。 */}
        <PartnerNarrowSection />
        {/* ⑭ まず、自社に使える制度を確認してみてください。（診断CTA） */}
        <SubsidyMatchCtaSection />
        {/* ⑮ 補助金の活用方法を、記事で最速で確認できます。 */}
        <ArticlesCtaBar articles={previewArticles} />
        {/* ⑯ よくあるご質問 */}
        <FaqSection />
        {/* ⑰ まず、話を聞かせてください。（最終CTA） */}
        <FinalCtaSection />
      </main>
      <LpFooter />
    </HomeEntrance>
  );
}

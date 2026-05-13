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
        <div>
          <div className="relative">
            <HeroSection />
          </div>
          <div
            id="partner-lp"
            className="relative scroll-mt-20 sm:scroll-mt-24"
          >
            <HeroPartnerStrip />
          </div>
        </div>
        <RootIssueCaseSection />
        <NtsAiGapSection />
        <NtsWarmIntroSection />
        <AwarenessSection />
        <CtaBar />
        <WhatIsNtsSection />
        <SubsidyExamplesSection />
        <SubsidyCaseStudySection />
        <SubsidyMatchCtaSection />
        <ArticlesCtaBar articles={previewArticles} />
        <ComparisonDiagram />
        <SubsidyKindsSection />
        <PartnerNarrowSection />
        <FaqSection />
        <FinalCtaSection />
      </main>
      <LpFooter />
    </HomeEntrance>
  );
}

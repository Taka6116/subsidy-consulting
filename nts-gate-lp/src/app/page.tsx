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
import PartnerNarrowSection from "@/components/sections/PartnerNarrowSection";
import FaqSection from "@/components/sections/FaqSection";
import FinalCtaSection from "@/components/sections/FinalCtaSection";
// import CheckLeadSection from "@/components/sections/CheckLeadSection";
// import NewSubsidySection from "@/components/sections/NewSubsidySection";
// import NtsAboutSection from "@/components/sections/NtsAboutSection";

export default function Home() {
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
        <NtsAiGapSection />
        <NtsWarmIntroSection />
        <AwarenessSection />
        <WhatIsNtsSection />
        <SubsidyExamplesSection />
        <SubsidyMatchCtaSection />
        <ComparisonDiagram />
        <CtaBar />
        <SubsidyKindsSection />
        <PartnerNarrowSection />
        <FaqSection />
        <FinalCtaSection />
      </main>
      <LpFooter />
    </HomeEntrance>
  );
}

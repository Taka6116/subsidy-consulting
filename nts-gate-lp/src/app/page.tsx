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
import WhatIsNtsSection from "@/components/sections/WhatIsNtsSection";
import NtsServicesSection from "@/components/sections/NtsServicesSection";
import FeeStructureSection from "@/components/sections/FeeStructureSection";
import BenefitSection from "@/components/sections/BenefitSection";
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
        <div className="flex min-h-[100svh] flex-col">
          <div className="relative min-h-0 flex-1 basis-0">
            <HeroSection />
          </div>
          <div
            id="partner-lp"
            className="relative z-[6] shrink-0 scroll-mt-20 sm:scroll-mt-24"
          >
            <HeroPartnerStrip />
          </div>
        </div>
        <AwarenessSection />
        <NtsWarmIntroSection />
        <SubsidyKindsSection />
        <SubsidyMatchCtaSection />
        <WhatIsNtsSection />
        <NtsServicesSection />
        <FeeStructureSection />
        <BenefitSection />
        <PartnerNarrowSection />
        <FaqSection />
        <FinalCtaSection />
      </main>
      <LpFooter />
    </HomeEntrance>
  );
}

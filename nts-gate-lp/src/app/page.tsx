import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import ScrollDepthTracker from "@/components/shared/ScrollDepthTracker";
import HomeEntrance from "@/components/gate-lp/HomeEntrance";
import HeroSection from "@/components/gate-lp/hero-three/HeroSection";
import HeroPartnerStrip from "@/components/gate-lp/HeroPartnerStrip";
import AwarenessSection from "@/components/sections/AwarenessSection";
import SubsidyKindsSection from "@/components/sections/SubsidyKindsSection";
import CheckLeadSection from "@/components/sections/CheckLeadSection";
import HowItWorksSection from "@/components/sections/HowItWorksSection";
import NewSubsidySection from "@/components/sections/NewSubsidySection";
import PartnerNarrowSection from "@/components/sections/PartnerNarrowSection";
import NtsAboutSection from "@/components/sections/NtsAboutSection";
import FaqSection from "@/components/sections/FaqSection";
import FinalCtaSection from "@/components/sections/FinalCtaSection";

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
        <SubsidyKindsSection />
        <CheckLeadSection />
        <HowItWorksSection />
        <NewSubsidySection />
        <PartnerNarrowSection />
        <NtsAboutSection />
        <FaqSection />
        <FinalCtaSection />
      </main>
      <Footer />
    </HomeEntrance>
  );
}

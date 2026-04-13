import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import ScrollDepthTracker from "@/components/shared/ScrollDepthTracker";
import HomeEntrance from "@/components/gate-lp/HomeEntrance";
import HeroSection from "@/components/gate-lp/hero-three/HeroSection";
import HeroPartnerStrip from "@/components/gate-lp/HeroPartnerStrip";
import ImpactNumber from "@/components/gate-lp/ImpactNumber";
import ProfessionalPartnerSection from "@/components/gate-lp/ProfessionalPartnerSection";
import TrustSection from "@/components/gate-lp/TrustSection";

export default function Home() {
  return (
    <HomeEntrance>
      <ScrollDepthTracker />
      <Header />
      <main>
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
        <ImpactNumber />
        <ProfessionalPartnerSection />
        <TrustSection />
      </main>
      <Footer />
    </HomeEntrance>
  );
}

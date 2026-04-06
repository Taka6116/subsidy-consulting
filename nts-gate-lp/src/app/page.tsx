import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import ScrollDepthTracker from "@/components/shared/ScrollDepthTracker";
import HomeEntrance from "@/components/gate-lp/HomeEntrance";
import Hero from "@/components/gate-lp/Hero";
import ImpactNumber from "@/components/gate-lp/ImpactNumber";
import HowItWorks from "@/components/gate-lp/HowItWorks";
import TrustSection from "@/components/gate-lp/TrustSection";
import FinalCTA from "@/components/gate-lp/FinalCTA";

export default function Home() {
  return (
    <HomeEntrance>
      <ScrollDepthTracker />
      <Header />
      <main>
        <Hero />
        <ImpactNumber />
        <HowItWorks />
        <TrustSection />
        <FinalCTA />
      </main>
      <Footer />
    </HomeEntrance>
  );
}

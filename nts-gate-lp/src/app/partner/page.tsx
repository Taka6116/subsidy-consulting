import type { Metadata } from "next";
import Header from "@/components/shared/Header";
import PartnerLpWebGLBackground from "@/components/partner-lp/PartnerLpWebGLBackground";
import HeroSection from "@/components/partner-lp/HeroSection";
import PartnerAgitationSection from "@/components/gate-lp/partner/PartnerAgitationSection";
import PartnerMeritSection from "@/components/gate-lp/partner/PartnerMeritSection";
import PartnerUseCasesSection from "@/components/gate-lp/partner/PartnerUseCasesSection";
import PartnerSubsidySection from "@/components/gate-lp/partner/PartnerSubsidySection";
import PartnerFlowSection from "@/components/gate-lp/partner/PartnerFlowSection";
import PartnerFaqSection from "@/components/gate-lp/partner/PartnerFaqSection";
import FinalCtaSection from "@/components/sections/FinalCtaSection";
import LpFooter from "@/components/gate-lp/LpFooter";

export const metadata: Metadata = {
  title: "パートナー・提案企業の方へ | 日本提携支援",
  description:
    "補助金を御社の営業の武器に。NTSパートナープログラムで、顧客の意思決定を後押しする提案が可能になります。",
};

export default function PartnerPage() {
  return (
    <div className="relative min-h-screen bg-[var(--bg-base)] font-body text-[var(--text-primary)]">
      <PartnerLpWebGLBackground />
      <div className="partner-lp-light-overlay" aria-hidden />

      <Header />

      <main className="relative z-[2] pt-20">
        <HeroSection />
        <PartnerAgitationSection />
        <PartnerMeritSection />
        <PartnerUseCasesSection />
        <PartnerSubsidySection />
        <PartnerFlowSection />
        <PartnerFaqSection />
        <FinalCtaSection variant="partner" />
      </main>

      <LpFooter />
    </div>
  );
}

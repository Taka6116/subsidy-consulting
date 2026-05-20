import type { Metadata } from "next";
import Header from "@/components/shared/Header";
import PartnerLpWebGLBackground from "@/components/partner-lp/PartnerLpWebGLBackground";
import HeroSection from "@/components/partner-lp/HeroSection";
import PartnerAgitationSection from "@/components/gate-lp/partner/PartnerAgitationSection";
import PartnerMeritSection from "@/components/gate-lp/partner/PartnerMeritSection";
import PartnerUseCasesSection from "@/components/gate-lp/partner/PartnerUseCasesSection";
import PartnerSubsidySection from "@/components/gate-lp/partner/PartnerSubsidySection";
import SubsidyCaseStudySection from "@/components/sections/SubsidyCaseStudySection";
import PartnerFlowSection from "@/components/gate-lp/partner/PartnerFlowSection";
import PartnerHandoffSection from "@/components/gate-lp/partner/PartnerHandoffSection";
import PartnerConsultValueSection from "@/components/gate-lp/partner/PartnerConsultValueSection";
import PartnerFaqSection from "@/components/gate-lp/partner/PartnerFaqSection";
import RootIssueCaseSection from "@/components/sections/RootIssueCaseSection";
import PartnerAboutSection from "@/components/gate-lp/partner/PartnerAboutSection";
import NtsAiGapSection from "@/components/sections/NtsAiGapSection";
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
        {/*
          パートナーLP セクション順（ナラティブ調整版）
          ①FV ②見送り/補助金 ③提携企業像 ④営業メリット（3本柱）
          ⑤補助金事例カード ⑥NTS支援事例の実績 ⑦制度選定の差別化（RootIssue）⑧課題深掘り価値
          ⑨AI限界 ⑩紹介後フロー ⑪チーム・伴走 ⑫FAQ ⑬CTA
        */}
        <HeroSection />
        <PartnerAgitationSection />
        <PartnerUseCasesSection />
        <PartnerMeritSection />
        <PartnerSubsidySection />
        <SubsidyCaseStudySection />
        <RootIssueCaseSection />
        <PartnerConsultValueSection />
        <NtsAiGapSection />
        <PartnerFlowSection />
        <PartnerHandoffSection />
        <PartnerAboutSection />
        <PartnerFaqSection />
        <FinalCtaSection variant="partner" />
      </main>

      <LpFooter />
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import PartnerLpWebGLBackground from "@/components/partner-lp/PartnerLpWebGLBackground";
import HeroSection from "@/components/partner-lp/HeroSection";
import PartnerAgitationSection from "@/components/gate-lp/partner/PartnerAgitationSection";
import PartnerMeritSection from "@/components/gate-lp/partner/PartnerMeritSection";
import PartnerSubsidySection from "@/components/gate-lp/partner/PartnerSubsidySection";
import PartnerFlowSection from "@/components/gate-lp/partner/PartnerFlowSection";
import PartnerAboutSection from "@/components/gate-lp/partner/PartnerAboutSection";
import PartnerCtaSection from "@/components/gate-lp/partner/PartnerCtaSection";
import LpFooter from "@/components/gate-lp/LpFooter";

export const metadata: Metadata = {
  title: "パートナー・提案企業の方へ | 日本提携支援",
  description:
    "補助金を御社の営業の武器に。NTSパートナープログラムで、顧客の意思決定を後押しする提案が可能になります。",
};

export default function PartnerPage() {
  return (
    <div
      className="relative min-h-screen font-body text-white"
      style={{ background: "#041e42" }}
    >
      <PartnerLpWebGLBackground />

      <header className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between bg-transparent px-6 py-5 sm:px-8">
        <Link
          href="/"
          className="flex shrink-0 items-center rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <img
            src="/nts-logo.svg"
            alt="日本提携支援"
            className="h-7 w-auto brightness-0 invert sm:h-8"
            width={200}
            height={29}
          />
        </Link>
        <Link
          href="/"
          className="text-sm font-medium text-white transition hover:text-white/90"
        >
          ← エンドユーザー向けはこちら
        </Link>
      </header>

      <main className="relative pt-20" style={{ zIndex: 2 }}>
        <HeroSection />
        <PartnerAgitationSection />
        <PartnerMeritSection />
        <PartnerSubsidySection />
        <PartnerFlowSection />
        <PartnerAboutSection />
        <PartnerCtaSection />
      </main>

      <LpFooter />
    </div>
  );
}

import type { Metadata } from "next";
import Header from "@/components/shared/Header";
import LpFooter from "@/components/gate-lp/LpFooter";
import HeroSection from "@/components/subsidy-lp/HeroSection";
import CheckerSection from "@/components/subsidy-lp/CheckerSection";
import TargetIndustriesSection from "@/components/subsidy-lp/TargetIndustriesSection";
import BeforeAfterSection from "@/components/subsidy-lp/BeforeAfterSection";
import CaseStudiesSection from "@/components/subsidy-lp/CaseStudiesSection";
import ArticleRelatedSection from "@/components/subsidy-lp/ArticleRelatedSection";
import FlowSection from "@/components/subsidy-lp/FlowSection";
import FinalCtaSection from "@/components/subsidy-lp/FinalCtaSection";
import ContactSection from "@/components/subsidy-lp/ContactSection";
import { dxSubsidy as data } from "@/lib/subsidy-data/dx-subsidy";

export const metadata: Metadata = {
  title: "中小企業DX支援補助金 最大300万円 | NTS補助金サポート",
  description:
    "デジタル技術導入・IT化を支援する補助金の活用ポイントをわかりやすく整理。業務効率化・競争力強化を国の支援で実現するための相談を受け付けています。",
};

export default function DxSupportLP() {
  return (
    <>
      <Header />
      <main className="bg-white pt-16 sm:pt-20">
        <HeroSection data={data} />
        <CheckerSection data={data} />
        <TargetIndustriesSection data={data} />
        <BeforeAfterSection data={data} />
        <CaseStudiesSection data={data} />
        <ArticleRelatedSection lpSlug="dx-support" />
        <FlowSection data={data} />
        <FinalCtaSection />
        <ContactSection source="dx-support" grantName="中小・小規模企業デジタル技術導入支援" />

      </main>
      <LpFooter />
    </>
  );
}

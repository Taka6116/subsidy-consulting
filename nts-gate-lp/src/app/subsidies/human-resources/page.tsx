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
import { humanResourcesSubsidy as data } from "@/lib/subsidy-data/human-resources-subsidy";

export const metadata: Metadata = {
  title: "人材確保・賃上げ支援補助金 最大300万円 | NTS補助金サポート",
  description:
    "中小企業の人材確保・賃上げ・研修投資を支援する補助金の活用ポイントを整理。採用コスト削減・職場環境整備・人材育成を国の支援で実現するための無料相談を受け付けています。",
};

export default function HumanResourcesLP() {
  return (
    <>
      <Header />
      <main className="bg-white pt-16 sm:pt-20">
        <HeroSection data={data} />
        <CheckerSection data={data} />
        <TargetIndustriesSection data={data} />
        <BeforeAfterSection data={data} />
        <CaseStudiesSection data={data} />
        <ArticleRelatedSection lpSlug="human-resources" />
        <FlowSection data={data} />
        <FinalCtaSection />
        <ContactSection source="human-resources" grantName="中小・小規模事業者賃上げ環境整備支援補助金" />
      </main>
      <LpFooter />
    </>
  );
}

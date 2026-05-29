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
import { constructionElectrificationSubsidy as data } from "@/lib/subsidy-data/construction-electrification";

export const metadata: Metadata = {
  title: "建設機械の電動化で最大14.3億円の補助金 | NTS補助金サポート",
  description:
    "高用車等の電動化促進事業（建設機械）の活用ポイントをわかりやすく整理。燃料費削減・脱炭素・生産性向上を国の支援で実現するための相談を受け付けています。",
};

export default function ConstructionElectrificationLP() {
  return (
    <>
      <Header />
      <main className="bg-white pt-16 sm:pt-20">
        <HeroSection data={data} />
        <CheckerSection data={data} />
        <TargetIndustriesSection data={data} />
        <BeforeAfterSection data={data} />
        <CaseStudiesSection data={data} />
        <ArticleRelatedSection lpSlug="construction-electrification" />
        <FlowSection data={data} />
        <FinalCtaSection />
        <ContactSection source="construction-electrification" grantName={data.category} />
      </main>
      <LpFooter />
    </>
  );
}

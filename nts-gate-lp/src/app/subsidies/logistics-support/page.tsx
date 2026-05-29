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
import { logisticsSubsidy as data } from "@/lib/subsidy-data/logistics-subsidy";

export const metadata: Metadata = {
  title: "物流・運送効率化補助金 最大500万円 | NTS補助金サポート",
  description:
    "2024年問題・ドライバー不足・燃料費高騰に対応する物流効率化補助金の活用ポイントを整理。配送ルート最適化・WMS導入・省力化投資を補助金で実現するための無料相談を受け付けています。",
};

export default function LogisticsSupportLP() {
  return (
    <>
      <Header />
      <main className="bg-white pt-16 sm:pt-20">
        <HeroSection data={data} />
        <CheckerSection data={data} />
        <TargetIndustriesSection data={data} />
        <BeforeAfterSection data={data} />
        <CaseStudiesSection data={data} />
        <ArticleRelatedSection lpSlug="logistics-support" />
        <FlowSection data={data} />
        <FinalCtaSection />
        <ContactSection source="logistics-support" grantName="物流・運送効率化補助金" />
      </main>
      <LpFooter />
    </>
  );
}

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
import { equipmentInvestmentSubsidy as data } from "@/lib/subsidy-data/equipment-investment-subsidy";

export const metadata: Metadata = {
  title: "設備投資・生産性向上補助金 最大2億円 | NTS補助金サポート",
  description:
    "老朽設備の更新・省力化・自動化投資を支援する補助金の活用ポイントを整理。人手不足・設備老朽化・コスト削減を国の補助金で一気に解決するための無料相談を受け付けています。",
};

export default function EquipmentInvestmentLP() {
  return (
    <>
      <Header />
      <main className="bg-white pt-16 sm:pt-20">
        <HeroSection data={data} />
        <CheckerSection data={data} />
        <TargetIndustriesSection data={data} />
        <BeforeAfterSection data={data} />
        <CaseStudiesSection data={data} />
        <ArticleRelatedSection grantNameContains="設備投資・生産性向上" />
        <FlowSection data={data} />
        <FinalCtaSection />
        <ContactSection source="equipment-investment" grantName={data.headline + data.headlineAccent} />
      </main>
      <LpFooter />
    </>
  );
}

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
import { equipmentSubsidy as data } from "@/lib/subsidy-data/equipment-subsidy";

export const metadata: Metadata = {
  title: "設備投資・生産性向上補助金 最大4,000万円 | NTS補助金サポート",
  description:
    "中小企業の設備投資・生産性向上を支援する補助金の活用ポイントをわかりやすく整理。老朽設備更新・省力化投資を国の支援で実現するための相談を受け付けています。",
};

export default function EquipmentProductivityLP() {
  return (
    <>
      <Header />
      <main className="bg-white pt-16 sm:pt-20">
        <HeroSection data={data} />
        <CheckerSection data={data} />
        <TargetIndustriesSection data={data} />
        <BeforeAfterSection data={data} />
        <CaseStudiesSection data={data} />
        <ArticleRelatedSection grantNameContains="設備投資・生産性向上促進補助金" />
        <FlowSection data={data} />
        <FinalCtaSection />
        <ContactSection source="equipment-productivity" grantName="中小企業設備投資・生産性向上促進補助金" />

      </main>
      <LpFooter />
    </>
  );
}

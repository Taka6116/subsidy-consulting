import type { Metadata } from "next";
import Header from "@/components/shared/Header";
import LpFooter from "@/components/gate-lp/LpFooter";
import HeroSection from "@/components/subsidy-lp/HeroSection";
import CheckerSection from "@/components/subsidy-lp/CheckerSection";
import TargetIndustriesSection from "@/components/subsidy-lp/TargetIndustriesSection";
import BeforeAfterSection from "@/components/subsidy-lp/BeforeAfterSection";
import CaseStudiesSection from "@/components/subsidy-lp/CaseStudiesSection";
import FlowSection from "@/components/subsidy-lp/FlowSection";
import FinalCtaSection from "@/components/subsidy-lp/FinalCtaSection";
import ContactSection from "@/components/subsidy-lp/ContactSection";
import { monodukuriSubsidy as data } from "@/lib/subsidy-data/monodukuri-subsidy";

export const metadata: Metadata = {
  title: "ものづくり補助金 最大4,000万円 | NTS補助金サポート",
  description:
    "新製品開発・生産プロセス改善・販路開拓など、中小企業の事業計画実現を支援するものづくり補助金の活用ガイド。21次締切対応、無料相談受付中。",
};

export default function MonodukuriBusinessLP() {
  return (
    <>
      <Header />
      <main className="bg-white pt-16 sm:pt-20">
        <HeroSection data={data} />
        <CheckerSection data={data} />
        <TargetIndustriesSection data={data} />
        <BeforeAfterSection data={data} />
        <CaseStudiesSection data={data} />
        <FlowSection data={data} />
        <FinalCtaSection />
        <ContactSection source="monodukuri-business" grantName="ものづくり・商業・サービス生産性向上促進補助金" />
      </main>
      <LpFooter />
    </>
  );
}

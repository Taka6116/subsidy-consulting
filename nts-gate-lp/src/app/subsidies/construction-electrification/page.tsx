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
import PartnerConsultValueSection from "@/components/gate-lp/partner/PartnerConsultValueSection";
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
        <FlowSection data={data} />
        <FinalCtaSection />
        <PartnerConsultValueSection />

        <section id="contact" className="bg-[#F3F6FA] py-14">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <p className="text-sm text-gray-500">お問い合わせ</p>
            <h2 className="mt-2 text-2xl font-bold text-[#0B173A]">
              無料相談フォーム（準備中）
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              詳細フォームは次フェーズで実装予定です。先行相談をご希望の場合は
              <a className="mx-1 text-[#1E40AF] underline" href="/consult">
                こちら
              </a>
              からご連絡ください。
            </p>
          </div>
        </section>
      </main>
      <LpFooter />
    </>
  );
}

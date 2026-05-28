"use client";

import AuroraText from "@/components/shared/AuroraText";
import ScrollTextReveal from "@/components/shared/ScrollTextReveal";
import PartnerJointFlowDiagram from "./PartnerJointFlowDiagram";

export default function PartnerConsultValueSection() {
  return (
    <section
      className="relative overflow-hidden py-12 md:py-16"
      style={{
        background:
          "radial-gradient(circle at 50% 20%, rgba(59,130,246,0.08), transparent 36%), linear-gradient(180deg, #f8fbff 0%, #ffffff 52%, #f3f7fc 100%)",
      }}
      aria-labelledby="partner-consult-value-heading"
    >
      <div className="mx-auto max-w-[1240px] px-5 sm:px-6 lg:max-w-[1380px] lg:px-6 xl:max-w-[1440px] xl:px-8">
        <div className="mb-6 text-center md:mb-10">
          <h2
            id="partner-consult-value-heading"
            className="font-heading text-[clamp(1.8rem,3vw,3rem)] font-bold leading-[1.45] text-[var(--text-primary,#111827)]"
          >
            <ScrollTextReveal as="span" className="block">
              紹介だけで終わりません
            </ScrollTextReveal>
            <AuroraText className="block" animated={false}>
              経営課題を一緒に深掘り、伴走します。
            </AuroraText>
          </h2>

          <p className="font-body mx-auto mt-4 max-w-2xl text-[0.95rem] leading-[1.9] text-[var(--text-secondary,#4b5563)]">
            机上の情報だけでなく、対話や現場理解を通じて本質的な課題を見極め、
            最適な解決策をご提案します。
          </p>
        </div>

        <PartnerJointFlowDiagram />
      </div>
    </section>
  );
}

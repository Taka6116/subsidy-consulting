"use client";

import { motion, useReducedMotion } from "framer-motion";
import CTAButton from "@/components/shared/CTAButton";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";
import { getPartnerUrl } from "@/lib/partnerUrl";
import { trackPartnerLinkClick } from "@/lib/analytics";
import {
  fadeInUpInitial,
  fadeInUpInView,
  fadeInUpReduced,
  fadeInUpTransition,
  fadeInUpViewport,
} from "@/components/sections/sectionStyles";

export default function PartnerNarrowSection() {
  const reduce = useReducedMotion();
  const partnerHref = getPartnerUrl();

  return (
    <section className="section-block bg-section-gray" aria-labelledby="home-partner-heading">
      <div className="section-inner">
        <motion.div
          initial={reduce ? fadeInUpReduced : fadeInUpInitial}
          whileInView={reduce ? fadeInUpReduced : fadeInUpInView}
          viewport={fadeInUpViewport}
          transition={fadeInUpTransition}
          className="two-col img-left"
        >
          <div className="col-img w-full max-w-md justify-self-center lg:max-w-lg">
            <ImagePlaceholder label="パートナー・提携プログラム（ビジュアル）" aspectRatio="4/3" />
          </div>

          <div className="col-text space-y-6 text-center lg:text-left">
            <p className="sec-label mb-3">税理士・士業・ベンダーの方へ</p>
            <h2
              id="home-partner-heading"
              className="font-heading text-[1.75rem] font-bold leading-snug text-[var(--text-primary)] md:text-[2.25rem]"
            >
              クライアントに、
              <br />
              補助金の提案ができていますか？
            </h2>
            <p className="mx-auto max-w-xl text-base leading-loose text-[var(--text-secondary)] md:mx-0 md:text-lg">
              取引先の設備投資やDX・人手不足の解消が、
              <br className="hidden md:inline" />
              補助金で前に進むケースは少なくありません。
              <br />
              提案の幅を広げたいパートナー企業様向けに、
              <br className="hidden md:inline" />
              制度の整理から申請サポートまでご案内しています。
            </p>
            <div className="flex justify-center lg:justify-start">
              <div className="w-full max-w-sm sm:w-auto">
                <CTAButton
                  text="提携プログラムの詳細を見る"
                  href={partnerHref}
                  variant="secondary"
                  size="large"
                  onClick={() => trackPartnerLinkClick("professional_section")}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

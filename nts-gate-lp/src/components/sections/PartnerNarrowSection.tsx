"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import CTAButton from "@/components/shared/CTAButton";
import isometric08 from "../../../icon-assets/isometric_08.webp";
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
            <div className="relative min-h-[280px] overflow-hidden max-md:h-[200px]">
              <Image
                src={isometric08}
                alt="パートナー企業と顧客をつなぐイラスト"
                width={640}
                height={640}
                className="absolute bottom-0 left-1/2 h-[85%] w-auto -translate-x-1/2 object-contain"
              />
            </div>
          </div>

          <div className="col-text space-y-6 text-center lg:text-left">
            <p className="sec-label mb-3">税理士・士業・ベンダーの方へ</p>
            <h2
              id="home-partner-heading"
              className="font-heading text-[1.75rem] font-bold leading-snug text-[var(--text-primary)] md:text-[2.25rem]"
            >
              パートナー企業の方へ。
              <br />
              補助金を、御社の営業の武器に。
            </h2>
            <p className="mx-auto max-w-xl text-base leading-loose text-[var(--text-secondary)] md:mx-0 md:text-lg">
              税理士・ベンダー・士業の方々と提携しています。「補助金が使えますよ」その一言が、顧客との関係を深めます。
              <br />
              紹介いただいた案件は、私たちが責任を持って対応します。
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

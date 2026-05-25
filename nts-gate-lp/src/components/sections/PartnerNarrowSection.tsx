"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import ScrollTextReveal from "@/components/shared/ScrollTextReveal";
import CTAButton from "@/components/shared/CTAButton";
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
      <div className="mx-auto w-full max-w-[1640px] px-5 sm:px-8 xl:px-10 2xl:px-12">
        <motion.div
          initial={reduce ? fadeInUpReduced : fadeInUpInitial}
          whileInView={reduce ? fadeInUpReduced : fadeInUpInView}
          viewport={fadeInUpViewport}
          transition={fadeInUpTransition}
          className="two-col img-left lg:gap-[96px]"
        >
          <div className="col-img w-full justify-self-center">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl">
              <Image
                src="/images/NTS everybody-picture.webp"
                alt="NTSチームの集合写真"
                fill
                className="object-cover object-center"
                sizes="(max-width: 1024px) 92vw, 560px"
              />
            </div>
          </div>

          <div className="col-text space-y-6 text-center lg:text-left">
            <ScrollTextReveal
              as="h2"
              id="home-partner-heading"
              className="font-heading text-3xl font-bold leading-tight text-[var(--text-primary)] md:text-4xl"
            >
              パートナー企業の方へ。
              <br />
              補助金を、御社の営業の武器に。
            </ScrollTextReveal>
            <p className="mx-auto max-w-xl text-base leading-loose text-[var(--text-secondary)] md:mx-0 md:text-lg">
              税理士・ベンダー・士業の方々と提携しています。「補助金が使えますよ」その一言が、顧客との関係を深めます。
              <br />
              紹介いただいた案件は、私たちが責任を持って対応します。
            </p>
            <div className="flex justify-center lg:justify-start">
              <div className="w-full max-w-sm sm:w-auto">
                <CTAButton
                  text="提携パートナーの詳細を見る"
                  href={partnerHref}
                  variant="primary"
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

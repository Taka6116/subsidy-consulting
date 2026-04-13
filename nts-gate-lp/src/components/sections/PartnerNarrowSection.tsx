"use client";

import { motion, useReducedMotion } from "framer-motion";
import CTAButton from "@/components/shared/CTAButton";
import { getPartnerUrl } from "@/lib/partnerUrl";
import { trackPartnerLinkClick } from "@/lib/analytics";
import {
  fadeInUpInitial,
  fadeInUpInView,
  fadeInUpReduced,
  fadeInUpTransition,
  fadeInUpViewport,
  glassShellClass,
  sectionContainerClass,
  sectionStackClass,
} from "@/components/sections/sectionStyles";

export default function PartnerNarrowSection() {
  const reduce = useReducedMotion();
  const partnerHref = getPartnerUrl();

  return (
    <section className={sectionStackClass} aria-labelledby="home-partner-heading">
      <div className={sectionContainerClass}>
        <motion.div
          initial={reduce ? fadeInUpReduced : fadeInUpInitial}
          whileInView={reduce ? fadeInUpReduced : fadeInUpInView}
          viewport={fadeInUpViewport}
          transition={fadeInUpTransition}
          className={glassShellClass}
        >
          <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-12">
            <div className="text-center md:text-left">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-white/55">
                税理士・士業・ベンダーの方へ
              </p>
              <h2
                id="home-partner-heading"
                className="font-heading text-3xl font-bold leading-tight text-white md:text-4xl lg:text-h1"
              >
                クライアントに、
                <br />
                補助金の提案ができていますか？
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-base leading-loose text-white/80 md:mx-0 md:text-lg">
                取引先の設備投資やDX・人手不足の解消が、
                <br className="hidden md:inline" />
                補助金で前に進むケースは少なくありません。
                <br />
                提案の幅を広げたいパートナー企業様向けに、
                <br className="hidden md:inline" />
                制度の整理から申請サポートまでご案内しています。
              </p>
            </div>
            <div className="flex justify-center md:justify-end">
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

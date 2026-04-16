"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import {
  fadeInUpInitial,
  fadeInUpInView,
  fadeInUpReduced,
  fadeInUpTransition,
  fadeInUpViewport,
} from "@/components/sections/sectionStyles";

export default function FinalCtaSection() {
  const reduce = useReducedMotion();

  return (
    <section className="section-block section-cta" aria-labelledby="home-final-cta-heading">
      <div className="section-inner text-center">
        <motion.div
          initial={reduce ? fadeInUpReduced : fadeInUpInitial}
          whileInView={reduce ? fadeInUpReduced : fadeInUpInView}
          viewport={fadeInUpViewport}
          transition={fadeInUpTransition}
          className="mx-auto max-w-2xl py-4 md:py-6"
        >
          <h2
            id="home-final-cta-heading"
            className="font-heading text-[1.75rem] font-bold leading-snug text-[var(--text-primary)] md:text-[2.25rem]"
          >
            まず、話を聞かせてください。
          </h2>
          <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-white/80 md:text-lg">
            補助金が使えるかどうか、
            <br />
            あなたの会社の状況から一緒に確認します。
            <br />
            無料相談、30分から。
          </p>
          <div className="mt-10 flex justify-center">
            <Link
              href="/consult"
              className="inline-flex items-center gap-2 rounded-[10px] bg-white px-12 py-[18px] text-base font-bold text-[#1A4C8E] shadow-[0_4px_24px_rgba(0,0,0,0.2)] transition hover:bg-white/95"
            >
              無料で相談する
            </Link>
          </div>
          <p className="mt-6 text-xs text-white/70">
            建設業・運送業の経営者からのご相談、歓迎します。
          </p>
        </motion.div>
      </div>
    </section>
  );
}

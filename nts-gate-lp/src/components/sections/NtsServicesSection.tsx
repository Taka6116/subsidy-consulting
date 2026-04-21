"use client";

import Image from "next/image";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  fadeInUpInitial,
  fadeInUpInView,
  fadeInUpReduced,
  fadeInUpTransition,
  fadeInUpViewport,
} from "@/components/sections/sectionStyles";

type ServiceTab = {
  number: string;
  label: string;
  body: string;
  note?: { title: string; body: string };
  imageSrc: string;
  imageAlt: string;
};

const SERVICES: ServiceTab[] = [
  {
    number: "01",
    label: "経営課題を起点に、戦略を設計する",
    body: "一般的な補助金コンサルは「使える補助金ありき」で話が進みます。私たちは逆で、まずあなたの会社の経営課題を聞くところから始めます。「どの補助金を、いつ、何のために使うか」——戦略を一緒に設計するのが、私たちの最初の仕事です。",
    imageSrc: "/images/PANA3362.jpg",
    imageAlt: "経営課題のヒアリング・戦略整理のイメージ",
  },
  {
    number: "02",
    label: "提携行政書士と連携し、申請プロセスを管理する",
    body: "補助金申請書類の作成は、今やAIでも対応できる時代になりつつあります。私たちは、提携する行政書士と連携しながら申請プロセス全体を管理し、「何のために使うか」という申請の上流設計に責任を持ちます。",
    imageSrc: "/images/PANA3202-2.jpg",
    imageAlt: "申請書類・行政書士連携のイメージ",
  },
  {
    number: "03",
    label: "採択後1年間、伴走し続ける",
    body: "従来のコンサルは、採択が決まれば関係が終わります。私たちの仕事はその先にあります。補助金を使って設備を入れ、現場に定着させ、1年後に効果を検証する——そこまで一緒に動き続けるのが、私たちの提供価値です。",
    imageSrc: "/images/PANA3955.jpg",
    imageAlt: "採択後の伴走・経営支援のイメージ",
  },
];

export default function NtsServicesSection() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const current = SERVICES[active];

  return (
    <section
      className="section-block bg-section-gray text-[var(--text-primary)]"
      style={{ zIndex: 10 }}
      aria-labelledby="home-nts-services-heading"
    >
      <div className="section-inner">
        <motion.div
          className="mb-12 text-center md:mb-16"
          initial={reduce ? fadeInUpReduced : fadeInUpInitial}
          whileInView={reduce ? fadeInUpReduced : fadeInUpInView}
          viewport={fadeInUpViewport}
          transition={fadeInUpTransition}
        >
          <p className="sec-label mb-4">DIFFERENCE</p>
          <h2
            id="home-nts-services-heading"
            className="font-heading text-[1.75rem] font-bold leading-snug text-[var(--text-primary)] md:text-[2.25rem]"
          >
            申請が、ゴールではありません。
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[var(--text-secondary)] md:text-lg">
            従来の補助金コンサルとの違い——私たちが提供するのは、書類ではなく「伴走」です。
          </p>
        </motion.div>

        <motion.div
          initial={reduce ? fadeInUpReduced : fadeInUpInitial}
          whileInView={reduce ? fadeInUpReduced : fadeInUpInView}
          viewport={fadeInUpViewport}
          transition={{ ...fadeInUpTransition, delay: 0.08 }}
          className="overflow-hidden rounded-[20px] shadow-[0_8px_40px_rgba(26,76,142,0.1)] lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]"
          aria-label="NTSの支援内容"
        >
          <div className="flex flex-col gap-1 bg-[#1A4C8E] p-2 lg:flex-col" role="tablist" aria-label="支援メニュー">
            {SERVICES.map((s, i) => {
              const isActive = active === i;
              return (
                <button
                  key={s.number}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  id={`nts-service-tab-${i}`}
                  aria-controls={`nts-service-panel-${i}`}
                  onClick={() => setActive(i)}
                  className="w-full rounded-xl border-0 px-5 py-5 text-left transition-colors md:px-7 md:py-6"
                  style={{
                    backgroundColor: isActive ? "rgba(255,255,255,0.12)" : "transparent",
                  }}
                >
                  <div
                    className="font-heading text-[0.7rem] font-bold uppercase tracking-[0.1em]"
                    style={{ color: isActive ? "#00B894" : "rgba(255,255,255,0.5)" }}
                  >
                    {s.number}
                  </div>
                  <div
                    className="mt-1.5 text-[0.95rem] font-bold leading-snug tracking-[0.04em] md:text-base"
                    style={{ color: isActive ? "#FFFFFF" : "rgba(255,255,255,0.65)" }}
                  >
                    {s.label}
                  </div>
                </button>
              );
            })}
          </div>

          <div
            role="tabpanel"
            id={`nts-service-panel-${active}`}
            aria-labelledby={`nts-service-tab-${active}`}
            className="bg-white px-6 py-8 md:px-10 md:py-12"
          >
            <div className="relative mb-6 aspect-video w-full overflow-hidden rounded-xl">
              <Image
                src={current.imageSrc}
                alt={current.imageAlt}
                fill
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 58vw"
                priority={active === 0}
              />
            </div>
            <h3 className="mb-4 font-heading text-[1.3rem] font-bold text-[var(--text-primary)] md:text-xl">
              {current.label}
            </h3>
            <p className="text-[0.9rem] leading-[1.95] text-[var(--text-secondary)] md:text-base">
              {current.body}
            </p>
            {current.note ? (
              <div className="mt-6 rounded-xl border border-[var(--border-subtle)] bg-[#f0f4fa] p-5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  {current.note.title}
                </p>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[var(--text-secondary)] md:text-base">
                  {current.note.body}
                </p>
              </div>
            ) : null}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

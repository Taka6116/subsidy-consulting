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
    label: "補助金活用戦略の設計から始める",
    body: "いきなり申請書類に入りません。まずヒアリングで、あなたの会社の課題・投資計画・タイミングを整理します。「どの補助金を、いつ、どう使うか」という戦略を最初に設計します。",
    imageSrc: "/images/PANA3362.jpg",
    imageAlt: "経営課題のヒアリング・戦略整理のイメージ",
  },
  {
    number: "02",
    label: "提携行政書士と連携し、採択まで伴走する",
    body: "申請書類の作成は提携行政書士と連携して進めます。NTSは申請の上流にある「何のために使うか」の設計と、申請プロセス全体の進行管理を担当します。",
    imageSrc: "/images/PANA3202-2.jpg",
    imageAlt: "申請書類・行政書士連携のイメージ",
  },
  {
    number: "03",
    label: "採択後も1年間、経営に関わり続ける",
    body: "採択がゴールではありません。補助金を使って設備を入れ、現場に定着させ、効果を検証するまでが私たちの仕事です。採択後も継続的にお客様の経営に関わり続けます。",
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
          <p className="label-section mb-4">NTSの支援の特長</p>
          <h2
            id="home-nts-services-heading"
            className="font-heading text-3xl font-bold leading-tight text-[var(--text-primary)] md:text-[2.6rem]"
          >
            「申請して終わり」ではない、
            <br />
            NTSの補助金活用支援。
          </h2>
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

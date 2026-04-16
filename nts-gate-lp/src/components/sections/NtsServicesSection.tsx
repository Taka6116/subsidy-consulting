"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import {
  fadeInUpInitial,
  fadeInUpInView,
  fadeInUpReduced,
  fadeInUpTransition,
  fadeInUpViewport,
} from "@/components/sections/sectionStyles";

type MeritLayout = "text-left" | "text-right";

type MeritBlock = {
  layout: MeritLayout;
  stepMark: string;
  meritLabel?: "MERIT";
  title: string;
  body: string;
  note?: { title: string; body: string };
  image: { src: string; alt: string };
};

const MERITS: MeritBlock[] = [
  {
    layout: "text-left",
    stepMark: "①",
    title: "補助金活用戦略の設計から始める",
    body: "いきなり申請書類に入りません。まずヒアリングで、あなたの会社の課題・投資計画・タイミングを整理します。「どの補助金を、いつ、どう使うか」という戦略を最初に設計します。",
    note: {
      title: "活用例",
      body: "建設業：主力重機の更新 × 省力化補助金の組み合わせを設計\n運送業：デジタコ・Gマーク取得 × 複数補助金の活用順序を整理",
    },
    image: {
      src: "/images/PANA3061.jpg",
      alt: "経営課題のヒアリング・戦略整理のイメージ",
    },
  },
  {
    layout: "text-right",
    stepMark: "②",
    meritLabel: "MERIT",
    title: "提携行政書士と連携し、採択まで伴走する",
    body: "申請書類の作成は提携行政書士と連携して進めます。NTSは申請の上流にある「何のために使うか」の設計と、申請プロセス全体の進行管理を担当します。",
    image: {
      src: "/images/PANA3202-2.jpg",
      alt: "申請書類・行政書士連携のイメージ",
    },
  },
  {
    layout: "text-left",
    stepMark: "③",
    title: "採択後も1年間、経営に関わり続ける",
    body: "採択がゴールではありません。補助金を使って設備を入れ、現場に定着させ、効果を検証するまでが私たちの仕事です。採択後も継続的にお客様の経営に関わり続けます。",
    note: {
      title: "補足",
      body: "「1年後の効果検証の時点」で最後の成果報酬が発生するのは、NTSが結果まで責任を持つためです。",
    },
    image: {
      src: "/images/PANA3955.jpg",
      alt: "採択後の伴走・経営支援のイメージ",
    },
  },
];

function MeritImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div
      className="relative w-full max-w-xl justify-self-center overflow-hidden rounded-2xl shadow-[0_14px_48px_-12px_rgba(26,76,142,0.18)] ring-1 ring-[rgba(26,76,142,0.08)] sm:rounded-[1.35rem] lg:max-w-none"
      style={{ aspectRatio: "4 / 3" }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover object-center"
        sizes="(max-width: 1024px) 100vw, 44vw"
      />
    </div>
  );
}

function MeritTextColumn({
  stepMark,
  meritLabel,
  title,
  body,
  note,
  titleId,
}: Pick<MeritBlock, "stepMark" | "meritLabel" | "title" | "body" | "note"> & {
  titleId: string;
}) {
  return (
    <div className="col-text flex flex-col justify-center space-y-5 text-center lg:text-left">
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 lg:justify-start">
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[rgba(26,76,142,0.1)] font-heading text-lg font-bold text-[var(--accent-navy)]"
          aria-hidden
        >
          {stepMark}
        </span>
        {meritLabel ? (
          <p className="font-heading text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--accent-teal)]">
            {meritLabel}
          </p>
        ) : null}
      </div>
      <h3
        id={titleId}
        className="font-heading text-2xl font-bold leading-snug text-[var(--text-primary)] md:text-3xl"
      >
        {title}
      </h3>
      <p className="text-base leading-relaxed text-[var(--text-secondary)] md:text-lg md:leading-relaxed">
        {body}
      </p>
      {note ? (
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[#f0f4fa] p-5 text-left">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            {note.title}
          </p>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[var(--text-secondary)] md:text-base">
            {note.body}
          </p>
        </div>
      ) : null}
    </div>
  );
}

export default function NtsServicesSection() {
  const reduce = useReducedMotion();

  return (
    <section
      className="section-block bg-section-gray text-[var(--text-primary)]"
      style={{ zIndex: 10 }}
      aria-labelledby="home-nts-services-heading"
    >
      <div className="section-inner">
        <motion.div
          className="mb-16 text-center md:mb-20"
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

        <div className="flex flex-col gap-20 md:gap-24 lg:gap-28">
          {MERITS.map((merit, i) => {
            const isTextLeft = merit.layout === "text-left";
            const twoColClass = isTextLeft ? "two-col img-right" : "two-col img-left";

            return (
              <motion.article
                key={merit.stepMark}
                initial={reduce ? fadeInUpReduced : fadeInUpInitial}
                whileInView={reduce ? fadeInUpReduced : fadeInUpInView}
                viewport={fadeInUpViewport}
                transition={{ ...fadeInUpTransition, delay: i * 0.06 }}
                className={twoColClass}
                aria-labelledby={`home-nts-merit-${i}-title`}
              >
                {isTextLeft ? (
                  <>
                    <MeritTextColumn
                      titleId={`home-nts-merit-${i}-title`}
                      stepMark={merit.stepMark}
                      meritLabel={merit.meritLabel}
                      title={merit.title}
                      body={merit.body}
                      note={merit.note}
                    />
                    <div className="col-img w-full">
                      <MeritImage src={merit.image.src} alt={merit.image.alt} />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="col-img w-full">
                      <MeritImage src={merit.image.src} alt={merit.image.alt} />
                    </div>
                    <MeritTextColumn
                      titleId={`home-nts-merit-${i}-title`}
                      stepMark={merit.stepMark}
                      meritLabel={merit.meritLabel}
                      title={merit.title}
                      body={merit.body}
                      note={merit.note}
                    />
                  </>
                )}
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

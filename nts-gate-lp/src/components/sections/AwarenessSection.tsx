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
import imgIsometric07 from "../../../icon-assets/isometric_07.png";
import imgIsometric10 from "../../../icon-assets/isometric_10.png";
import imgIsometric11 from "../../../icon-assets/isometric_11.png";

const CARD_STYLES = [
  { labelClass: "text-[0.75rem] font-bold tracking-[0.1em] text-[var(--accent-teal)]" },
  { labelClass: "text-[0.75rem] font-bold tracking-[0.1em] text-[var(--accent-navy)]" },
  { labelClass: "text-[0.75rem] font-bold tracking-[0.1em] text-[var(--accent-gold)]" },
] as const;

const IMAGE_ASSETS = [
  {
    src: imgIsometric10,
    alt: "建設業の職人不足を表すイメージ",
  },
  {
    src: imgIsometric07,
    alt: "運送業のドライバー不足を表すイメージ",
  },
  {
    src: imgIsometric11,
    alt: "後継者への引き継ぎ課題を表すイメージ",
  },
] as const;

const CARDS = [
  {
    label: "建設業の現場では",
    title: "「職人が\nいない」",
    body: "元請・下請を問わず、人が足りない。主力重機も更新時期を過ぎている。省力化補助金を使えば、IoT機器やロボット導入の費用を最大半額以下に抑えられます。ただし申請して終わりでは、設備が現場に定着しません。",
  },
  {
    label: "運送業の経営では",
    title: "「ドライバーが\n足りない」",
    body: "主要荷主への依存リスクを抱えながら、人とコストの問題が増し続けている。デジタコ導入やGマーク取得と併せて補助金を活用し、設備投資に踏み切っても、定着・活用まで伴走する人間が必要です。",
  },
  {
    label: "両業種で共通して",
    title: "「後継者に\nどう引き継ぐか」",
    body: "事業承継補助金を使って設備を整え、引き継ぎやすい会社にする。その設計から一緒に考えます。",
  },
] as const;

function AwarenessCard({
  card,
  style,
  image,
}: {
  card: (typeof CARDS)[number];
  style: (typeof CARD_STYLES)[number];
  image: (typeof IMAGE_ASSETS)[number];
}) {
  return (
    <div className="nts-card relative overflow-hidden p-8 md:p-10">
      <div className="pointer-events-none absolute right-4 top-4 z-[1] w-[min(42%,11rem)] sm:right-5 sm:top-5 sm:w-[min(40%,12.5rem)]">
        <div className="overflow-hidden rounded-lg">
          <Image
            src={image.src}
            alt={image.alt}
            className="h-auto w-full object-contain"
            sizes="(max-width: 640px) 42vw, 180px"
            priority={false}
          />
        </div>
      </div>
      <div className="relative z-[2] pr-[min(46%,12rem)] sm:pr-[min(44%,13rem)]">
        <p className={`mb-3 ${style.labelClass}`}>{card.label}</p>
        <h3 className="mb-4 whitespace-pre-line font-heading text-2xl font-extrabold leading-snug text-[var(--text-primary)] md:text-[1.5rem]">
          {card.title}
        </h3>
        <p className="text-[0.9rem] leading-[1.9] text-[var(--text-secondary)] md:text-base">{card.body}</p>
      </div>
    </div>
  );
}

export default function AwarenessSection() {
  const reduce = useReducedMotion();

  return (
    <section
      className="section-block bg-section-white"
      aria-labelledby="home-awareness-heading"
    >
      <div className="section-inner">
        <motion.div
          initial={reduce ? fadeInUpReduced : fadeInUpInitial}
          whileInView={reduce ? fadeInUpReduced : fadeInUpInView}
          viewport={fadeInUpViewport}
          transition={fadeInUpTransition}
        >
          <div className="mb-12 text-center md:mb-16">
            <span className="sec-label">課題共感</span>
            <h2
              id="home-awareness-heading"
              className="font-heading mt-3 text-[1.75rem] font-bold leading-snug text-[var(--text-primary)] md:text-[2.25rem]"
            >
              その「とりあえず申請」が、
              <br />
              会社の機会損失になっていませんか。
            </h2>
            <div className="mx-auto mt-4 max-w-2xl space-y-3 text-base leading-loose text-[var(--text-secondary)] md:mt-4 md:text-lg">
              <p>補助金を取った後、何も変わらなかった——そういう会社が、実はたくさんあります。</p>
              <p>採択はスタートです。使い切って、初めて意味がある。</p>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-6">
            {CARDS.slice(0, 2).map((card, i) => (
              <AwarenessCard
                key={card.label}
                card={card}
                style={CARD_STYLES[i]}
                image={IMAGE_ASSETS[i]}
              />
            ))}
          </div>

          <div className="flex justify-center">
            <div className="w-full max-w-[620px]">
              <AwarenessCard
                card={CARDS[2]}
                style={CARD_STYLES[2]}
                image={IMAGE_ASSETS[2]}
              />
            </div>
          </div>

        </motion.div>
      </div>
    </section>
  );
}

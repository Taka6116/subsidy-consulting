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
  {
    labelClass: "text-[0.75rem] font-bold tracking-[0.1em] text-[var(--accent-teal)]",
    imgBg: "#EEF6FF",
  },
  {
    labelClass: "text-[0.75rem] font-bold tracking-[0.1em] text-[var(--accent-navy)]",
    imgBg: "#E8F9F4",
  },
  {
    labelClass: "text-[0.75rem] font-bold tracking-[0.1em] text-[var(--accent-gold)]",
    imgBg: "#FFF4E8",
  },
] as const;

const IMAGE_ASSETS = [
  {
    src: imgIsometric10,
    alt: "人手不足に悩む経営者のイメージ",
  },
  {
    src: imgIsometric07,
    alt: "設備更新の先送りを表すイメージ",
  },
  {
    src: imgIsometric11,
    alt: "次の一手を一人で考える経営者のイメージ",
  },
] as const;

const CARDS = [
  {
    label: "止まらない現場の課題",
    title: "「人手不足が、\n止まらない」",
    body: "職人やドライバーが集まらない。育てる前に辞めていく。この問題を根本から動かすには、設備投資や体制づくりへの踏み込みが必要です。",
  },
  {
    label: "先送りにしている決断",
    title: "「設備の更新を、\n先送りにしている」",
    body: "古い機械や車両を使い続けている。でも投資に踏み切れない。補助金という選択肢を知らないまま、機会を逃している会社が多くあります。",
  },
  {
    label: "ひとりで抱える経営判断",
    title: "「次の一手を、\n一人で考えている」",
    body: "事業承継、組織の将来、競合との差——重要な意思決定を、誰かと一緒に考えられる環境がない。それが、多くの経営者の本音です。",
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
    <div className="nts-card overflow-hidden">
      {/* 上部イラストエリア */}
      <div
        className="relative h-44 w-full overflow-hidden"
        style={{ background: style.imgBg }}
      >
        <Image
          src={image.src}
          alt={image.alt}
          className="absolute bottom-0 left-1/2 h-[90%] w-auto -translate-x-1/2 object-contain"
          sizes="(max-width: 768px) 100vw, 400px"
          priority={false}
        />
      </div>

      {/* 下部テキストエリア */}
      <div className="p-7 md:p-8">
        <p className={`mb-2 ${style.labelClass}`}>{card.label}</p>
        <h3 className="mb-4 whitespace-pre-line font-heading text-[1.35rem] font-bold leading-snug text-[var(--text-primary)] md:text-[1.45rem]">
          {card.title}
        </h3>
        <p className="text-[0.9rem] leading-[1.9] text-[var(--text-secondary)]">
          {card.body}
        </p>
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
            <span className="sec-label">ISSUES</span>
            <h2
              id="home-awareness-heading"
              className="font-heading mt-3 text-[1.75rem] font-bold leading-snug text-[var(--text-primary)] md:text-[2.25rem]"
            >
              「申請できればいい」だけでは、
              <br />
              もったいない。
            </h2>
            <div className="mx-auto mt-4 max-w-2xl space-y-3 text-base leading-loose text-[var(--text-secondary)] md:mt-4 md:text-lg">
              <p>補助金は、取ることがゴールではありません。</p>
              <p>採択後の1年間をどう動くかで、会社の未来が変わります。</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {CARDS.map((card, i) => (
              <AwarenessCard
                key={card.label}
                card={card}
                style={CARD_STYLES[i]}
                image={IMAGE_ASSETS[i]}
              />
            ))}
          </div>

        </motion.div>
      </div>
    </section>
  );
}

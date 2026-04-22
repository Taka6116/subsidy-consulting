"use client";

import Image, { type StaticImageData } from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import imgNtsGap from "../../../icon-assets/isometric23.webp";
import imgPit01 from "../../../icon-assets/isometric_24.webp";
import imgPit02 from "../../../icon-assets/isometric_12.webp";
import imgPit03 from "../../../icon-assets/isometric_09.webp";
import {
  fadeInUpInitial,
  fadeInUpInView,
  fadeInUpReduced,
  fadeInUpTransition,
  fadeInUpViewport,
} from "@/components/sections/sectionStyles";

type Pitfall = {
  num: string;
  textLead: string;
  textHighlight: string;
  image: StaticImageData;
  alt: string;
};

const PITFALLS: readonly Pitfall[] = [
  {
    num: "01",
    textLead: "AIで書類は作れても、",
    textHighlight: "通過率は下がる時代。",
    image: imgPit01,
    alt: "AI生成の書類で通過率が下がるイメージ",
  },
  {
    num: "02",
    textLead: "審査視点を知らないと、",
    textHighlight: "対策は徒労に終わる。",
    image: imgPit02,
    alt: "審査側の視点が抜けて書類づくりが徒労に終わるイメージ",
  },
  {
    num: "03",
    textLead: "書類が出来ても、",
    textHighlight: "事務局対応で時間が削られる。",
    image: imgPit03,
    alt: "事務局対応で社長の時間が削られるイメージ",
  },
] as const;

const NTS_CHIPS = [
  "審査側視点で設計",
  "事務局対応を代行",
  "採択後1年間伴走",
] as const;

export default function NtsAiGapSection() {
  const reduce = useReducedMotion();

  return (
    <section
      className="section-block bg-[#f0f4fa] text-[var(--text-primary)]"
      style={{ zIndex: 10 }}
      aria-labelledby="home-nts-aigap-heading"
    >
      <div className="section-inner">
        {/* ===== Header ===== */}
        <motion.div
          className="mb-12 text-center md:mb-16"
          initial={reduce ? fadeInUpReduced : fadeInUpInitial}
          whileInView={reduce ? fadeInUpReduced : fadeInUpInView}
          viewport={fadeInUpViewport}
          transition={fadeInUpTransition}
        >
          <p className="sec-label mb-4">AI ERA</p>
          <h2
            id="home-nts-aigap-heading"
            className="font-heading text-[1.75rem] font-bold leading-snug text-[var(--text-primary)] md:text-[2.25rem]"
          >
            AIで書類は作れる時代。
            <br className="md:hidden" />
            それでも、採択には届きません。
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[var(--text-secondary)] md:text-lg">
            申請件数が増え、採択は“中身”で差がつく時代に。
            <br className="hidden md:inline" />
            書類の先にある実務を、誰に任せるか。
          </p>
        </motion.div>

        {/* ===== 3 pitfall cards (illustration-led pastel style) ===== */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-7 pt-5">
          {PITFALLS.map((p, i) => (
            <motion.article
              key={p.num}
              initial={reduce ? fadeInUpReduced : fadeInUpInitial}
              whileInView={reduce ? fadeInUpReduced : fadeInUpInView}
              viewport={fadeInUpViewport}
              transition={{
                ...fadeInUpTransition,
                delay: 0.06 + i * 0.06,
              }}
              className="relative flex flex-col items-center rounded-[28px] bg-[#e4ecf5] px-5 pb-6 pt-10 shadow-[0_4px_18px_rgba(26,76,142,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_34px_rgba(26,76,142,0.10)] md:px-6 md:pb-7 md:pt-11"
            >
              {/* Pill label */}
              <span className="absolute -top-4 left-1/2 inline-flex -translate-x-1/2 items-center rounded-full bg-[var(--text-primary)] px-4 py-1.5 font-heading text-[0.78rem] font-bold tracking-[0.06em] text-white shadow-[0_6px_16px_rgba(26,43,60,0.25)] md:text-[0.82rem]">
                落とし穴 {p.num}
              </span>

              {/* Title with highlight */}
              <h3 className="mt-1 mb-5 text-center font-heading text-[1.02rem] font-bold leading-[1.7] text-[var(--text-primary)] md:mb-6 md:text-[1.08rem] md:leading-[1.75]">
                {p.textLead}
                <br />
                <span className="text-[var(--accent-teal)]">
                  {p.textHighlight}
                </span>
              </h3>

              {/* Illustration */}
              <div className="relative mt-auto aspect-[4/3] w-full max-w-[280px]">
                <Image
                  src={p.image}
                  alt={p.alt}
                  fill
                  sizes="(max-width: 768px) 80vw, 280px"
                  className="object-contain"
                />
              </div>
            </motion.article>
          ))}
        </div>

        {/* ===== Bridge: pattern interrupt "so, NTS handles it" (enlarged) ===== */}
        <motion.div
          initial={reduce ? fadeInUpReduced : fadeInUpInitial}
          whileInView={reduce ? fadeInUpReduced : fadeInUpInView}
          viewport={fadeInUpViewport}
          transition={{ ...fadeInUpTransition, delay: 0.15 }}
          className="relative flex flex-col items-center py-12 md:py-16"
          aria-hidden={false}
        >
          <span
            aria-hidden
            className="h-12 w-px bg-[var(--border-subtle)] md:h-16"
          />
          <span className="my-4 inline-flex items-center gap-2.5 rounded-full border border-[rgba(0,184,148,0.4)] bg-white px-6 py-2.5 font-heading text-[0.95rem] font-bold tracking-[0.04em] text-[var(--accent-teal)] shadow-[0_8px_22px_rgba(0,184,148,0.18)] md:px-8 md:py-3.5 md:text-[1.1rem]">
            <span
              aria-hidden
              className="inline-block h-2 w-2 rounded-full bg-[var(--accent-teal)]"
            />
            だから、NTSが担います
          </span>
          <span
            aria-hidden
            className="h-12 w-px bg-gradient-to-b from-[var(--accent-teal)] to-transparent md:h-16"
          />
        </motion.div>

        {/* ===== NTS closing block ===== */}
        <motion.div
          initial={reduce ? fadeInUpReduced : fadeInUpInitial}
          whileInView={reduce ? fadeInUpReduced : fadeInUpInView}
          viewport={fadeInUpViewport}
          transition={{ ...fadeInUpTransition, delay: 0.22 }}
          className="relative overflow-hidden rounded-[28px] border border-[rgba(0,184,148,0.28)] bg-[linear-gradient(135deg,rgba(0,184,148,0.12)_0%,rgba(26,76,142,0.07)_100%)] shadow-[0_16px_48px_rgba(26,76,142,0.10)]"
        >
          {/* Decorative radial blobs */}
          <span
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(closest-side,rgba(0,184,148,0.22),transparent_70%)]"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute -left-20 bottom-0 h-56 w-56 rounded-full bg-[radial-gradient(closest-side,rgba(26,76,142,0.10),transparent_70%)]"
          />
          <span
            aria-hidden
            className="absolute left-0 top-0 h-full w-[5px] bg-[var(--accent-teal)]"
          />

          <div className="relative grid grid-cols-1 items-center gap-8 p-7 md:grid-cols-[1.1fr_1fr] md:gap-12 md:p-12 lg:p-14">
            {/* Text */}
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent-teal)] px-3 py-1 font-heading text-[0.7rem] font-bold uppercase tracking-[0.14em] text-white shadow-[0_2px_10px_rgba(0,184,148,0.4)]">
                NTS DOES
              </span>
              <h3 className="mt-5 font-heading text-[1.6rem] font-bold leading-[1.25] text-[var(--text-primary)] md:text-[2rem] lg:text-[2.2rem]">
                社長の時間を使わず、
                <br />
                <span className="text-[var(--accent-teal)]">採択まで</span>
                届ける。
              </h3>
              <p className="mt-5 text-[0.95rem] leading-[1.95] text-[var(--text-secondary)] md:text-base">
                AIに任せられる領域はAIに。でも、
                <strong className="font-bold text-[var(--text-primary)]">
                  人と会社が動いて初めて成り立つ領域
                </strong>
                があります。審査側の視点での設計、事務局対応、採択後1年間の伴走——
                <strong className="font-bold text-[var(--text-primary)]">
                  AIでは出来ないサポート
                </strong>
                で、社長の時間を守ります。
              </p>
              <ul className="mt-6 flex flex-wrap gap-2">
                {NTS_CHIPS.map((chip) => (
                  <li key={chip}>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--accent-teal)] bg-white px-3.5 py-1.5 font-heading text-[0.78rem] font-bold text-[var(--accent-teal)] shadow-[0_2px_8px_rgba(0,184,148,0.08)] md:text-[0.82rem]">
                      <span
                        aria-hidden
                        className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent-teal)]"
                      />
                      {chip}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Image with soft frame */}
            <div className="relative mx-auto w-full max-w-[420px] md:max-w-none">
              <span
                aria-hidden
                className="absolute inset-0 translate-x-3 translate-y-3 rounded-[24px] bg-white/50"
              />
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[24px] border border-white/60 bg-white/70 p-3 shadow-[0_10px_30px_rgba(26,76,142,0.08)] backdrop-blur-[2px] md:p-5">
                <Image
                  src={imgNtsGap}
                  alt="社長の時間を守り、採択まで伴走するNTSのイメージ"
                  fill
                  sizes="(max-width: 768px) 80vw, 460px"
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

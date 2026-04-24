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
  line1: string;
  line2: string;
  line3: string;
  image: StaticImageData;
  alt: string;
};

const PITFALLS: readonly Pitfall[] = [
  {
    num: "01",
    line1: "AIで書類は作れても、",
    line2: "テンプレ生成では",
    line3: "通過率が下がります。",
    image: imgPit01,
    alt: "AI生成の書類で通過率が下がるイメージ",
  },
  {
    num: "02",
    line1: "審査側の視点がないと、",
    line2: "設計が甘くなり",
    line3: "対策は徒労に終わります。",
    image: imgPit02,
    alt: "審査側の視点が抜けて書類づくりが徒労に終わるイメージ",
  },
  {
    num: "03",
    line1: "書類ができても、",
    line2: "事務局対応が残り",
    line3: "経営者の時間が削られます。",
    image: imgPit03,
    alt: "事務局対応で経営者の時間が削られるイメージ",
  },
] as const;

const NTS_CHIPS = [
  "審査側視点で設計",
  "各種対応サポート",
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

        {/* ===== Mini heading with slash ornaments ===== */}
        <motion.div
          className="mb-10 mt-4 flex items-center justify-center gap-3 md:mb-14 md:mt-8 md:gap-5"
          initial={reduce ? fadeInUpReduced : fadeInUpInitial}
          whileInView={reduce ? fadeInUpReduced : fadeInUpInView}
          viewport={fadeInUpViewport}
          transition={{ ...fadeInUpTransition, delay: 0.05 }}
        >
          <span
            aria-hidden
            className="inline-block h-[1.5px] w-10 rotate-[65deg] bg-[var(--text-primary)] md:w-16"
          />
          <h3 className="font-heading text-[1.1rem] font-bold tracking-[0.02em] text-[var(--text-primary)] md:text-[1.4rem]">
            こんな落とし穴、思い当たりませんか？
          </h3>
          <span
            aria-hidden
            className="inline-block h-[1.5px] w-10 -rotate-[65deg] bg-[var(--text-primary)] md:w-16"
          />
        </motion.div>

        {/* ===== 3 pitfall cards (ProfitOps-style: inner pill, 3-line title, large illustration with ground shadow) ===== */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-7">
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
              className="relative flex flex-col items-center overflow-hidden rounded-[24px] bg-[#eef1f7] px-5 pb-10 pt-6 shadow-[0_4px_18px_rgba(26,76,142,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_34px_rgba(26,76,142,0.10)] md:px-6 md:pb-12 md:pt-7"
            >
              {/* Pill label (inside card, top center) */}
              <div className="mb-5 md:mb-6">
                <span className="inline-flex items-center rounded-full bg-[var(--text-primary)] px-4 py-1.5 font-heading text-[0.78rem] font-bold tracking-[0.06em] text-white md:text-[0.82rem]">
                  例 {p.num}
                </span>
              </div>

              {/* 3-line title with teal highlight on last line */}
              <h3 className="mb-6 text-center font-heading text-[1.05rem] font-bold leading-[1.85] text-[var(--text-primary)] md:mb-7 md:text-[1.15rem]">
                {p.line1}
                <br />
                {p.line2}
                <br />
                <span className="text-[var(--accent-teal)]">{p.line3}</span>
              </h3>

              {/* Large illustration with ground ellipse shadow */}
              <div className="relative mx-auto mt-auto w-full max-w-[300px] md:max-w-[340px]">
                <div className="relative aspect-square w-full">
                  <Image
                    src={p.image}
                    alt={p.alt}
                    fill
                    sizes="(max-width: 768px) 85vw, 340px"
                    className="object-contain"
                  />
                </div>
                {/* Ground shadow (ellipse) */}
                <span
                  aria-hidden
                  className="absolute -bottom-2 left-1/2 h-3 w-[68%] -translate-x-1/2 rounded-[50%] bg-[rgba(26,43,60,0.18)] blur-[10px]"
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

          <div className="relative grid grid-cols-1 items-center gap-8 p-7 md:grid-cols-[1.1fr_1fr] md:gap-12 md:p-12 lg:p-14">
            {/* Text */}
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent-teal)] px-3 py-1 font-heading text-[0.7rem] font-bold uppercase tracking-[0.14em] text-white shadow-[0_2px_10px_rgba(0,184,148,0.4)]">
                NTS DOES
              </span>
              <h3 className="mt-5 font-heading text-[1.6rem] font-bold leading-[1.25] text-[var(--text-primary)] md:text-[2rem] lg:text-[2.2rem]">
                経営者の時間を使わず、
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
                で、経営者の時間を守ります。
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
                  alt="経営者の時間を守り、採択まで伴走するNTSのイメージ"
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

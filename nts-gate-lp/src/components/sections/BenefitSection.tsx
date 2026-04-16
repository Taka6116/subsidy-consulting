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
import imgIsometric10 from "../../../icon-assets/isometric_10.webp";
import imgIsometric13 from "../../../icon-assets/isometric_13.webp";
import imgIsometric14 from "../../../icon-assets/isometric_14.webp";

const HIGHLIGHTS = [
  { main: "最大半額以下", sub: "" },
  { main: "1年間", sub: "の伴走" },
  { main: "ROI", sub: "を数字で" },
] as const;

const BENEFIT_IMAGES = [
  { src: imgIsometric13, alt: "導入効果1を表す設備投資イメージ" },
  { src: imgIsometric10, alt: "導入効果2を表す運用定着イメージ" },
  { src: imgIsometric14, alt: "導入効果3を表す投資判断イメージ" },
] as const;

const BENEFITS = [
  {
    num: "01",
    title: "設備投資コストが半分以下に",
    body: (
      <>
        省力化補助金を使えば、IoT機器やロボット導入の費用を最大半額以下に抑えられます。
        <br />
        自己資金だけでは踏み出せなかった投資が、現実的な選択肢になります。
      </>
    ),
  },
  {
    num: "02",
    title: "設備が現場に根付く",
    body: (
      <>
        申請して終わりでは、設備は現場に定着しません。
        <br />
        NTSは導入後の運用フォローまで伴走し、投資効果が出る状態をつくります。
      </>
    ),
  },
  {
    num: "03",
    title: "「次の投資」の判断軸ができる",
    body: (
      <>
        1年間の伴走を通じて、設備投資のROIを数字で確認できます。
        <br />
        次の経営判断を、勘ではなく実績で下せるようになります。
      </>
    ),
  },
] as const;

export default function BenefitSection() {
  const reduce = useReducedMotion();

  return (
    <section className="section-block bg-section-gray" aria-labelledby="home-benefit-heading">
      <div className="section-inner">
        <motion.div
          initial={reduce ? fadeInUpReduced : fadeInUpInitial}
          whileInView={reduce ? fadeInUpReduced : fadeInUpInView}
          viewport={fadeInUpViewport}
          transition={fadeInUpTransition}
        >
          <div className="mb-12 text-center md:mb-16">
            <p className="sec-label mb-3">導入効果</p>
            <h2
              id="home-benefit-heading"
              className="font-heading text-[1.75rem] font-bold leading-snug text-[var(--text-primary)] md:text-[2.25rem]"
            >
              補助金が「使える」と、経営はこう変わります。
            </h2>
          </div>

          <div className="mb-14 grid grid-cols-1 gap-x-6 gap-y-2 md:mb-16 md:grid-cols-3">
            {BENEFITS.map(({ num, title, body }, idx) => {
              const hi = HIGHLIGHTS[idx];
              const image = BENEFIT_IMAGES[idx];
              return (
                <div key={num} className="flex flex-col">
                  {/* カード外・上部 — 全カード共通 h-36 で高さを揃える */}
                  <div className="flex h-36 w-full items-end justify-center pb-3">
                    <Image
                      src={image.src}
                      alt={image.alt}
                      className="max-h-full w-auto object-contain drop-shadow-sm"
                      sizes="160px"
                      priority={false}
                    />
                  </div>
                  {/* カード本体 */}
                  <div className="nts-card flex flex-1 flex-col p-9 md:p-10">
                    <p className="mb-3 font-heading text-[0.7rem] font-bold tracking-[0.12em] text-[var(--accent-teal)]">
                      {num}
                    </p>
                    <h3 className="mb-4 font-heading text-xl font-extrabold leading-snug text-[var(--text-primary)] md:text-[1.25rem]">
                      {title}
                    </h3>
                    <div
                      className="mb-4 rounded-[10px] px-4 py-3"
                      style={{ backgroundColor: "rgba(0, 184, 148, 0.06)" }}
                    >
                      <span className="font-heading text-2xl font-extrabold leading-none text-[var(--accent-teal)] md:text-[1.5rem]">
                        {hi.main}
                      </span>
                      {hi.sub ? (
                        <span className="ml-2 text-[0.8rem] text-[var(--text-secondary)]">{hi.sub}</span>
                      ) : null}
                    </div>
                    <p className="flex-1 text-sm leading-[1.9] text-[var(--text-secondary)] md:text-base">{body}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

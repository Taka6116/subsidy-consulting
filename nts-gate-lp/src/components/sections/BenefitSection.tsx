"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Settings, TrendingUp, Wrench } from "lucide-react";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";
import {
  fadeInUpInitial,
  fadeInUpInView,
  fadeInUpReduced,
  fadeInUpTransition,
  fadeInUpViewport,
} from "@/components/sections/sectionStyles";

const HIGHLIGHTS = [
  { main: "最大半額以下", sub: "" },
  { main: "1年間", sub: "の伴走" },
  { main: "ROI", sub: "を数字で" },
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
    Icon: Wrench,
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
    Icon: Settings,
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
    Icon: TrendingUp,
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
          <div className="mb-14 text-center">
            <p className="label-section mb-3">導入効果</p>
            <h2
              id="home-benefit-heading"
              className="font-heading text-3xl font-bold leading-tight text-[var(--text-primary)] md:text-4xl"
            >
              補助金を「使い切る」と、経営はこう変わります。
            </h2>
          </div>

          <div className="mb-14 grid grid-cols-1 gap-6 md:mb-16 md:grid-cols-3">
            {BENEFITS.map(({ num, title, body, Icon }, idx) => {
              const hi = HIGHLIGHTS[idx];
              return (
              <div key={num} className="nts-card flex flex-col p-9 md:p-10">
                <div
                  className="mb-6 flex h-[52px] w-[52px] items-center justify-center rounded-[14px] text-[var(--accent-teal)]"
                  style={{ backgroundColor: "rgba(0, 184, 148, 0.1)" }}
                >
                  <Icon className="h-7 w-7" strokeWidth={2} aria-hidden />
                </div>
                <p className="mb-2 font-heading text-[0.7rem] font-bold tracking-[0.12em] text-[var(--accent-teal)]">
                  {num}
                </p>
                <h3 className="mb-4 font-heading text-xl font-extrabold leading-snug text-[var(--text-primary)] md:text-[1.25rem]">
                  {title}
                </h3>
                <div
                  className="mb-4 rounded-[10px] border-l-[3px] border-[var(--accent-teal)] px-4 py-3"
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
            );
            })}
          </div>

          <div className="mx-auto max-w-[280px]">
            <ImagePlaceholder label="握手・成立イラスト" aspectRatio="4/3" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

"use client";

import { Bus, GitMerge, HardHat } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import {
  fadeInUpInitial,
  fadeInUpInView,
  fadeInUpReduced,
  fadeInUpTransition,
  fadeInUpViewport,
} from "@/components/sections/sectionStyles";

const CARD_ICONS = [HardHat, Bus, GitMerge] as const;

const CARD_STYLES = [
  {
    borderTop: "4px solid #00B894",
    numColor: "rgba(0, 184, 148, 0.07)",
    labelClass: "text-[0.75rem] font-bold tracking-[0.1em] text-[var(--accent-teal)]",
  },
  {
    borderTop: "4px solid #1A4C8E",
    numColor: "rgba(26, 76, 142, 0.07)",
    labelClass: "text-[0.75rem] font-bold tracking-[0.1em] text-[var(--accent-navy)]",
  },
  {
    borderTop: "4px solid #F5A623",
    numColor: "rgba(245, 166, 35, 0.07)",
    labelClass: "text-[0.75rem] font-bold tracking-[0.1em] text-[var(--accent-gold)]",
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
          <div className="mb-12 text-center md:mb-[72px]">
            <span className="sec-label">課題共感</span>
            <h2
              id="home-awareness-heading"
              className="font-heading mt-3 text-3xl font-bold leading-snug text-[var(--text-primary)] md:text-5xl"
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

          {/* 1段目：2カード */}
          <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-6">
            {CARDS.slice(0, 2).map((card, i) => {
              const Icon = CARD_ICONS[i];
              const style = CARD_STYLES[i];
              const num = String(i + 1).padStart(2, "0");
              return (
                <div
                  key={card.label}
                  className="nts-card relative overflow-hidden p-8 md:p-10"
                  style={{ borderTop: style.borderTop }}
                >
                  <span
                    className="pointer-events-none absolute right-5 top-3 font-heading text-[6rem] font-extrabold leading-none select-none"
                    style={{ color: style.numColor }}
                    aria-hidden
                  >
                    {num}
                  </span>
                  <div className="relative z-[1]">
                    <div className="mb-4 flex items-center gap-2.5">
                      <div
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-[var(--accent-teal)]"
                        style={{ backgroundColor: "rgba(0, 184, 148, 0.1)" }}
                      >
                        <Icon className="h-6 w-6" strokeWidth={2} aria-hidden />
                      </div>
                      <span className={style.labelClass}>{card.label}</span>
                    </div>
                    <h3 className="mb-4 whitespace-pre-line font-heading text-2xl font-extrabold leading-snug text-[var(--text-primary)] md:text-[1.5rem]">
                      {card.title}
                    </h3>
                    <p className="text-[0.9rem] leading-[1.9] text-[var(--text-secondary)] md:text-base">
                      {card.body}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 2段目：中央1カード */}
          <div className="flex justify-center">
            {(() => {
              const card = CARDS[2];
              const Icon = CARD_ICONS[2];
              const style = CARD_STYLES[2];
              return (
                <div
                  key={card.label}
                  className="nts-card relative w-full max-w-[620px] overflow-hidden p-8 md:p-10"
                  style={{ borderTop: style.borderTop }}
                >
                  <span
                    className="pointer-events-none absolute right-5 top-3 font-heading text-[6rem] font-extrabold leading-none select-none"
                    style={{ color: style.numColor }}
                    aria-hidden
                  >
                    03
                  </span>
                  <div className="relative z-[1]">
                    <div className="mb-4 flex items-center gap-2.5">
                      <div
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-[var(--accent-teal)]"
                        style={{ backgroundColor: "rgba(0, 184, 148, 0.1)" }}
                      >
                        <Icon className="h-6 w-6" strokeWidth={2} aria-hidden />
                      </div>
                      <span className={style.labelClass}>{card.label}</span>
                    </div>
                    <h3 className="mb-4 whitespace-pre-line font-heading text-2xl font-extrabold leading-snug text-[var(--text-primary)] md:text-[1.5rem]">
                      {card.title}
                    </h3>
                    <p className="text-[0.9rem] leading-[1.9] text-[var(--text-secondary)] md:text-base">
                      {card.body}
                    </p>
                  </div>
                </div>
              );
            })()}
          </div>

          <div
            className="mt-10 rounded-r-xl border-l-4 border-[var(--accent-teal)] px-6 py-5 md:mt-12"
            style={{ backgroundColor: "rgba(0, 184, 148, 0.04)" }}
          >
            <p className="text-[0.95rem] font-medium leading-[1.9] text-[var(--text-primary)] md:text-base">
              「補助金が使えます」——その一言の先に、1年間の伴走があります。
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

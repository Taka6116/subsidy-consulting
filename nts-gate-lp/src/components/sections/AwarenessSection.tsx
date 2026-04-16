"use client";

import { Bus, GitMerge, HardHat } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";
import {
  fadeInUpInitial,
  fadeInUpInView,
  fadeInUpReduced,
  fadeInUpTransition,
  fadeInUpViewport,
} from "@/components/sections/sectionStyles";

const CARD_ICONS = [HardHat, Bus, GitMerge] as const;

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
          <div className="mb-16 text-center">
            <p className="label-section mb-3">課題共感</p>
            <h2
              id="home-awareness-heading"
              className="font-heading text-3xl font-bold leading-snug text-[var(--text-primary)] md:text-5xl"
            >
              その「とりあえず申請」が、
              <br />
              会社の機会損失になっていませんか。
            </h2>
            <div className="mx-auto mt-8 max-w-2xl space-y-3 text-base leading-loose text-[var(--text-secondary)] md:text-lg">
              <p>補助金を取った後、何も変わらなかった——そういう会社が、実はたくさんあります。</p>
              <p>採択はスタートです。使い切って、初めて意味がある。</p>
            </div>
          </div>

          <div className="two-col img-right">
            <div className="col-text flex flex-col gap-5">
              {CARDS.map((card, i) => {
                const Icon = CARD_ICONS[i];
                return (
                  <div
                    key={card.label}
                    className="nts-card flex gap-5 p-7"
                    style={{ alignItems: "flex-start" }}
                  >
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-[var(--accent-teal)]"
                      style={{ backgroundColor: "rgba(0, 184, 148, 0.1)" }}
                    >
                      <Icon className="h-6 w-6" strokeWidth={2} aria-hidden />
                    </div>
                    <div className="min-w-0 text-left">
                      <p className="text-xs font-bold tracking-wide text-[var(--text-muted)]">
                        {card.label}
                      </p>
                      <h3 className="font-heading mt-2 whitespace-pre-line text-xl font-bold leading-tight text-[var(--text-primary)] md:text-2xl">
                        {card.title}
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)] md:text-base">
                        {card.body}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div className="rounded-xl border border-[var(--accent-teal)]/30 bg-[var(--accent-teal)]/10 px-5 py-4 text-sm font-medium leading-relaxed text-[var(--text-primary)] md:text-base">
                「補助金が使えます」——その一言の先に、1年間の伴走があります。
              </div>
            </div>

            <div className="col-img w-full max-w-md justify-self-center lg:max-w-none">
              <ImagePlaceholder label="課題共感イラスト（考え込む人物）" aspectRatio="1/1" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

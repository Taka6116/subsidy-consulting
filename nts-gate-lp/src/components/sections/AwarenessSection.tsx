"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  fadeInUpInitial,
  fadeInUpInView,
  fadeInUpReduced,
  fadeInUpTransition,
  fadeInUpViewport,
  glassShellClass,
  sectionContainerClass,
  sectionStackClass,
} from "@/components/sections/sectionStyles";

export default function AwarenessSection() {
  const reduce = useReducedMotion();

  return (
    <section className={sectionStackClass} aria-labelledby="home-awareness-heading">
      <div className={sectionContainerClass}>
        <motion.div
          initial={reduce ? fadeInUpReduced : fadeInUpInitial}
          whileInView={reduce ? fadeInUpReduced : fadeInUpInView}
          viewport={fadeInUpViewport}
          transition={fadeInUpTransition}
          className={`${glassShellClass} text-center`}
        >
          <p className="mb-6 text-xs font-bold uppercase tracking-[0.2em] text-white/60">課題共感</p>
          <h2
            id="home-awareness-heading"
            className="font-heading text-3xl font-bold leading-snug text-white md:text-5xl"
          >
            その「とりあえず申請」が、
            <br />
            会社の機会損失になっていませんか。
          </h2>
          <div className="mt-8 space-y-3 text-base leading-loose text-white/80 md:text-lg">
            <p>補助金を取った後、何も変わらなかった——そういう会社が、実はたくさんあります。</p>
            <p>採択はスタートです。使い切って、初めて意味がある。</p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 text-left md:grid-cols-3">
            {[
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
            ].map((card) => (
              <div
                key={card.label}
                className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur-[12px] [-webkit-backdrop-filter:blur(12px)]"
              >
                <p className="text-xs font-bold tracking-wide text-white/60">{card.label}</p>
                <h3 className="font-heading mt-3 whitespace-pre-line text-2xl font-bold leading-tight text-white">
                  {card.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-white/75">{card.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-xl border border-[#1A7B6F]/50 bg-[#1A7B6F]/20 px-5 py-4 text-sm font-medium leading-relaxed text-white md:text-base">
            「補助金が使えます」——その一言の先に、1年間の伴走があります。
          </div>
        </motion.div>
      </div>
    </section>
  );
}

"use client";

import { motion, useReducedMotion } from "framer-motion";

export default function NtsServicesSection() {
  const shouldReduceMotion = useReducedMotion();

  const fadeUp = (delay: number) =>
    shouldReduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 28 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.15 },
          transition: {
            duration: 0.55,
            ease: [0.22, 1, 0.36, 1] as const,
            delay,
          },
        };

  return (
    <section
      className="relative py-28 md:py-36 text-white"
      style={{ zIndex: 10 }}
      aria-labelledby="home-nts-services-heading"
    >
      <div className="mx-auto max-w-6xl px-6 md:px-8">
        {/* ヘッダー */}
        <motion.div className="mb-16 text-center" {...fadeUp(0)}>
          <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.25em] text-white/70">
            NTSの支援の特長
          </p>
          <h2
            id="home-nts-services-heading"
            className="font-heading text-3xl font-bold leading-tight text-white md:text-[2.6rem]"
          >
            「申請して終わり」ではない、
            <br />
            NTSの補助金活用支援。
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            {
              number: "01",
              title: "補助金活用戦略の設計から始める",
              body: "いきなり申請書類に入りません。まずヒアリングで、あなたの会社の課題・投資計画・タイミングを整理します。「どの補助金を、いつ、どう使うか」という戦略を最初に設計します。",
              boxTitle: "活用例",
              boxBody:
                "建設業：主力重機の更新 × 省力化補助金の組み合わせを設計\n運送業：デジタコ・Gマーク取得 × 複数補助金の活用順序を整理",
            },
            {
              number: "02",
              title: "提携行政書士と連携し、採択まで伴走する",
              body: "申請書類の作成は提携行政書士と連携して進めます。NTSは申請の上流にある「何のために使うか」の設計と、申請プロセス全体の進行管理を担当します。",
            },
            {
              number: "03",
              title: "採択後も1年間、経営に関わり続ける",
              body: "採択がゴールではありません。補助金を使って設備を入れ、現場に定着させ、効果を検証するまでが私たちの仕事です。採択後も継続的にお客様の経営に関わり続けます。",
              boxTitle: "補足",
              boxBody:
                "「1年後の効果検証の時点」で最後の成果報酬が発生するのは、NTSが結果まで責任を持つためです。",
            },
          ].map((card, i) => (
              <motion.div
                key={card.number}
                {...fadeUp(i * 0.08)}
                className="rounded-2xl border border-white/[0.08] bg-white/[0.05] p-7 text-white backdrop-blur-[14px] [-webkit-backdrop-filter:blur(14px)]"
              >
                <div className="mb-5 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/[0.08] font-heading text-sm font-bold text-white">
                    {card.number}
                  </span>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/55">MERIT</p>
                </div>
                <h3 className="font-heading text-2xl font-bold leading-snug text-white md:text-3xl">
                  {card.title}
                </h3>
                <p className="mt-4 text-base leading-relaxed text-white/80">{card.body}</p>
                {card.boxTitle && card.boxBody ? (
                  <div className="mt-6 rounded-xl border border-white/[0.08] bg-white/[0.04] p-5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-white/40">
                      {card.boxTitle}
                    </p>
                    <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-white/75">
                      {card.boxBody}
                    </p>
                  </div>
                ) : null}
              </motion.div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}

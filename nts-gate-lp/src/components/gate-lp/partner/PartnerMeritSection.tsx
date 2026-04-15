"use client";

import { motion } from "framer-motion";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 },
  transition: { duration: 0.6, ease: EASE_OUT, delay },
});

export default function PartnerMeritSection() {
  return (
    <section id="merit" className="relative py-32 md:py-40" style={{ zIndex: 10 }}>
      <div className="mx-auto max-w-5xl px-6 md:px-8">
        <motion.div className="mb-20 text-center" {...fadeUp(0)}>
          <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.25em] text-white/35">
            Partner Benefits
          </p>
          <h2 className="font-heading text-3xl font-bold leading-tight text-white md:text-4xl lg:text-5xl">
            あなたの営業が、
            <br />
            補助金で変わります。
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <motion.div
            {...fadeUp(0.1)}
            className="rounded-2xl border border-white/[0.08] bg-white/[0.05] p-8 backdrop-blur-[12px] [-webkit-backdrop-filter:blur(12px)] md:p-10"
          >
            <div className="mb-6 flex items-center gap-4">
              <div
                className="flex h-12 w-12 flex-none items-center justify-center rounded-full border border-white/15 text-lg font-bold text-white"
                style={{ background: "rgba(245,166,35,0.12)" }}
              >
                01
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">
                Merit
              </p>
            </div>
            <h3 className="font-heading text-2xl font-bold leading-snug text-white md:text-3xl">
              成約率が上がる
            </h3>
            <p className="mt-4 text-base leading-relaxed text-white/60">
              「補助金が使えるので、自己負担を抑えて導入できます」——
              この一言が、価格交渉を不要にします。
              値下げではなく、制度の活用として話が進むため、
              あなたの提案の質が根本から変わります。
            </p>
            <div className="mt-6 rounded-xl border border-white/[0.08] bg-white/[0.04] p-5">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-white/30">
                活用例
              </p>
              <p className="text-sm leading-relaxed text-white/[0.65]">
                600万円の省力化設備 → 補助金で最大300万円をカバー。
                顧客の自己負担は半額以下に。
                「費用がネック」で止まっていた商談が動き始めます。
              </p>
            </div>
          </motion.div>

          <motion.div
            {...fadeUp(0.2)}
            className="rounded-2xl border border-white/[0.08] bg-white/[0.05] p-8 backdrop-blur-[12px] [-webkit-backdrop-filter:blur(12px)] md:p-10"
          >
            <div className="mb-6 flex items-center gap-4">
              <div
                className="flex h-12 w-12 flex-none items-center justify-center rounded-full border border-white/15 text-lg font-bold text-white"
                style={{ background: "rgba(245,166,35,0.12)" }}
              >
                02
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">
                Merit
              </p>
            </div>
            <h3 className="font-heading text-2xl font-bold leading-snug text-white md:text-3xl">
              紹介フィーで
              <br />
              新しい収益が生まれる
            </h3>
            <p className="mt-4 text-base leading-relaxed text-white/60">
              紹介いただいた案件が採択された場合、NTSから紹介フィー（キックバック）をお支払いします。
              申請業務はすべてNTSが担当するため、御社の工数はほぼゼロ。
              「紹介するだけ」で、新しい収益の柱が生まれます。
            </p>
            <div
              className="mt-6 rounded-xl p-5"
              style={{
                background: "rgba(245,166,35,0.07)",
                border: "1px solid rgba(245,166,35,0.18)",
              }}
            >
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-white/30">
                フィーの仕組み
              </p>
              <p className="text-sm leading-relaxed text-white/[0.65]">
                顧客を紹介 → NTSが申請サポート → 採択 → 紹介フィーをお支払い。
                申請業務はすべてNTSが担当するため、
                御社の工数はほぼゼロです。
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

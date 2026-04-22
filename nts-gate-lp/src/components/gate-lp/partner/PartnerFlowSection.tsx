"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import isometric13 from "../../../../icon-assets/isometric_13.webp";
import isometric16 from "../../../../icon-assets/isometric_16.webp";
import isometric21 from "../../../../icon-assets/isometric_21.png";
import isometric14 from "../../../../icon-assets/isometric_14.webp";

const steps = [
  {
    number: "01",
    title: "顧客をご紹介",
    body: "「補助金が使えるか相談してみては」と一言お伝えください。それだけで構いません。",
    image: isometric16,
    bg: "#EEF6FF",
  },
  {
    number: "02",
    title: "補助金活用戦略の設計",
    body: "NTSが顧客にヒアリングを行い、課題に合った補助金と活用戦略をご提案します。",
    image: isometric13,
    bg: "#E8F9F4",
  },
  {
    number: "03",
    title: "申請・採択のサポート",
    body: "提携行政書士と連携しながら申請プロセスをサポート。採択まで責任を持って動きます。",
    image: isometric21,
    bg: "#EEF6FF",
  },
  {
    number: "04",
    title: "採択後の伴走＋紹介フィーのお支払い",
    body: "採択後も1年間、顧客の経営に伴走し続けます。紹介フィーは採択確定後にお支払いします。",
    image: isometric14,
    bg: "#E8F9F4",
  },
];

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 },
  transition: { duration: 0.6, ease: EASE_OUT, delay },
});

export default function PartnerFlowSection() {
  return (
    <section
      className="section-alt relative py-32 md:py-40"
      style={{ zIndex: 10 }}
    >
      <div className="mx-auto max-w-5xl px-6 md:px-8">
        <motion.div className="mb-16 text-center" {...fadeUp(0)}>
          <p className="label-section mb-4">How It Works</p>
          <h2 className="font-heading text-3xl font-bold text-[var(--text-primary)] md:text-4xl">
            お客様をご紹介いただいたら、
            <br />
            あとは我々が伴走します。
          </h2>
          <p className="mt-6 text-base leading-relaxed text-[var(--text-secondary)] md:text-lg">
            ヒアリングから補助金の活用戦略の設計、提携行政書士との連携を通じた申請のサポート、採択後の伴走まで、NTSが段階を追って進めます。
            <br className="hidden md:inline" />
            制度の細部まで御社で説明いただく必要はありません。まずはお声がけをお願いします。
          </p>
        </motion.div>

        <div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-4 lg:gap-5">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                {...fadeUp(i * 0.08)}
                className="card group relative overflow-hidden p-0 transition-all duration-300"
              >
                <div
                  className="relative h-[120px] w-full overflow-hidden rounded-t-xl md:h-[130px]"
                  style={{ background: step.bg }}
                  data-placeholder={`flow-step-${i + 1}`}
                >
                  <Image
                    src={step.image}
                    alt="（後から差し替え）紹介後の流れイラスト"
                    width={640}
                    height={640}
                    className={`absolute bottom-0 left-1/2 w-auto -translate-x-1/2 object-contain ${i === 1 || i === 3 ? "h-[88%]" : "h-[85%]"}`}
                  />
                </div>
                <div className="px-6 py-5">
                  <div className="mb-3 flex items-center gap-3">
                    <div
                      className="flex h-[3.2rem] w-[3.2rem] items-center justify-center rounded-full border text-lg font-bold text-[var(--accent-navy)]"
                      style={{
                        borderColor: "rgba(245, 166, 35, 0.4)",
                        background: "rgba(245, 166, 35, 0.12)",
                      }}
                    >
                      {step.number}
                    </div>
                  </div>
                  <h3 className="mb-2 text-base font-bold text-[var(--text-primary)]">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{step.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

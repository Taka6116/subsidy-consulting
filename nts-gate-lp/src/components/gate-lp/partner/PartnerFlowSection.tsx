"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import isometric13 from "../../../../icon-assets/isometric_13.webp";
import isometric16 from "../../../../icon-assets/isometric_16.webp";
import isometric20 from "../../../../icon-assets/isometric_20.png";
import isometric21 from "../../../../icon-assets/isometric_21.png";

const steps = [
  {
    number: "01",
    title: "顧客を紹介",
    body: "御社 → NTS。1分で完了",
    image: isometric16,
    bg: "#EEF6FF",
  },
  {
    number: "02",
    title: "補助金マッチング",
    body: "NTSが戦略設計・最適制度を選定",
    image: isometric13,
    bg: "#E8F9F4",
  },
  {
    number: "03",
    title: "申請〜採択後1年間",
    body: "全てNTSが一貫対応",
    image: isometric21,
    bg: "#EEF6FF",
  },
  {
    number: "04",
    title: "紹介フィー受取",
    body: "採択額の一定割合をお支払い",
    image: isometric20,
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
            紹介するだけ。
            <br />
            あとはNTSが動きます。
          </h2>
        </motion.div>

        <div className="relative">
          <div
            className="absolute top-[2.6rem] hidden lg:block"
            style={{
              left: "calc(12.5% + 1.6rem)",
              right: "calc(12.5% + 1.6rem)",
              height: "1px",
              background:
                "linear-gradient(to right, rgba(245,166,35,0.0), rgba(245,166,35,0.25) 20%, rgba(245,166,35,0.25) 80%, rgba(245,166,35,0.0))",
            }}
            aria-hidden="true"
          />
          <div
            className="absolute left-[2.4rem] top-10 block lg:hidden"
            style={{
              height: "calc(100% - 5rem)",
              width: "1px",
              background:
                "linear-gradient(to bottom, rgba(245,166,35,0.0), rgba(245,166,35,0.2) 10%, rgba(245,166,35,0.2) 90%, rgba(245,166,35,0.0))",
            }}
            aria-hidden="true"
          />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-4 lg:gap-5">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                {...fadeUp(i * 0.08)}
                className="card group relative flex items-start gap-5 p-6 transition-all duration-300 lg:flex-col"
              >
                <div
                  className="relative hidden h-[120px] w-full overflow-hidden rounded-xl md:block"
                  style={{ background: step.bg }}
                  data-placeholder={`flow-step-${i + 1}`}
                >
                  <Image
                    src={step.image}
                    alt="（後から差し替え）紹介後の流れイラスト"
                    width={640}
                    height={640}
                    className="absolute bottom-0 left-1/2 h-[88%] w-auto -translate-x-1/2 object-contain"
                  />
                </div>
                <div className="relative flex-none">
                  <div
                    className="flex h-[3.2rem] w-[3.2rem] items-center justify-center rounded-full border text-lg font-bold text-[var(--accent-navy)]"
                    style={{
                      borderColor: "rgba(245, 166, 35, 0.4)",
                      background: "rgba(245, 166, 35, 0.12)",
                    }}
                  >
                    {step.number}
                  </div>
                  <div
                    className="absolute inset-0 rounded-full opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100"
                    style={{ background: "rgba(245, 166, 35, 0.2)" }}
                  />
                </div>
                <div className="flex-1 lg:pt-4">
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

"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import isometric09 from "../../../../icon-assets/isometric_09.webp";
import isometric14 from "../../../../icon-assets/isometric_14.webp";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 },
  transition: { duration: 0.6, ease: EASE_OUT, delay },
});

export default function PartnerMeritSection() {
  return (
    <section
      id="merit"
      className="section-alt relative py-32 md:py-40"
      style={{ zIndex: 10 }}
    >
      <div className="mx-auto max-w-5xl px-6 md:px-8">
        <motion.div className="mb-20 text-center" {...fadeUp(0)}>
          <p className="label-section mb-4">Partner Benefits</p>
          <h2 className="font-heading text-3xl font-bold leading-tight text-[var(--text-primary)] md:text-4xl lg:text-5xl">
            あなたの営業が、
            <br />
            補助金で変わります。
          </h2>
        </motion.div>

        <div className="flex flex-col gap-20">
          {/* Merit 01: テキスト左 / 画像右 */}
          <motion.div
            {...fadeUp(0.1)}
            className="flex flex-col items-center gap-10 lg:flex-row lg:gap-16"
          >
            {/* テキスト */}
            <div className="flex-1">
              <div className="mb-6 flex items-center gap-4">
                <div
                  className="flex h-12 w-12 flex-none items-center justify-center rounded-full border border-[var(--border-card)] text-lg font-bold text-[var(--accent-navy)]"
                  style={{ background: "rgba(245, 166, 35, 0.12)" }}
                >
                  01
                </div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                  Merit
                </p>
              </div>
              <h3 className="font-heading text-2xl font-bold leading-snug text-[var(--text-primary)] md:text-3xl">
                成約率が上がる
              </h3>
              <p className="mt-4 text-base leading-relaxed text-[var(--text-secondary)]">
                「補助金が使えるので、自己負担を抑えて導入できます」——この一言が、価格交渉を不要にします。
                値下げではなく、制度の活用として話が進むため、あなたの提案の質が根本から変わります。
                NTSが採択後も1年間伴走するので、顧客への責任も果たせます。
              </p>
              <div className="mt-6 rounded-lg bg-[#F5F8FF] px-4 py-3">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  活用例
                </p>
                <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                  600万円の省力化設備 → 補助金で最大300万円をカバー。
                  <br />
                  顧客の自己負担は半額以下に。「費用がネック」で止まっていた商談が動き始めます。
                </p>
              </div>
            </div>

            {/* 画像 */}
            <div className="flex w-full items-end justify-center lg:w-[40%] lg:flex-none">
              <Image
                src={isometric14}
                alt="成約率が上がるイラスト"
                width={640}
                height={640}
                className="h-[280px] w-auto object-contain"
              />
            </div>
          </motion.div>

          {/* Merit 02: 画像左 / テキスト右 */}
          <motion.div
            {...fadeUp(0.2)}
            className="flex flex-col items-center gap-10 lg:flex-row lg:gap-16"
          >
            {/* 画像（モバイルでは先・PCでは左） */}
            <div className="flex w-full items-end justify-center lg:order-first lg:w-[40%] lg:flex-none">
              <Image
                src={isometric09}
                alt="紹介フィーで新しい収益が生まれるイラスト"
                width={640}
                height={640}
                className="h-[280px] w-auto object-contain"
              />
            </div>

            {/* テキスト */}
            <div className="flex-1">
              <div className="mb-6 flex items-center gap-4">
                <div
                  className="flex h-12 w-12 flex-none items-center justify-center rounded-full border border-[var(--border-card)] text-lg font-bold text-[var(--accent-navy)]"
                  style={{ background: "rgba(245, 166, 35, 0.12)" }}
                >
                  02
                </div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                  Merit
                </p>
              </div>
              <h3 className="font-heading text-2xl font-bold leading-snug text-[var(--text-primary)] md:text-3xl">
                紹介フィーで
                <br />
                新しい収益が生まれる
              </h3>
              <p className="mt-4 text-base leading-relaxed text-[var(--text-secondary)]">
                紹介いただいた案件が採択された場合、NTSから紹介フィーをお支払いします。
                申請サポートから採択後の1年間の伴走まで、すべてNTSが担当します。
                御社の工数はほぼゼロ。「紹介するだけ」で、新しい収益の柱が生まれます。
              </p>
              <div className="mt-6 rounded-lg bg-[#F5F8FF] px-4 py-3">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  フィーの仕組み
                </p>
                <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                  顧客を紹介 → NTSが戦略設計・申請サポート・採択後1年伴走 → 採択で紹介フィーをお支払い。
                  <br />
                  申請から効果検証まですべてNTSが担当するため、御社の工数はほぼゼロです。
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

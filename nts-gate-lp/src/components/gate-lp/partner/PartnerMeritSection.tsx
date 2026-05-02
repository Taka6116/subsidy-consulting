"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import isometric09 from "../../../../icon-assets/isometric_09.webp";
import isometric14 from "../../../../icon-assets/isometric_14.webp";
import isometric23 from "../../../../icon-assets/isometric23.webp";

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
          <h2 className="font-heading text-3xl font-bold leading-tight text-[var(--text-primary)] md:text-4xl lg:text-5xl">
            御社の営業に、
            <br />
            補助金という選択肢を加えてください。
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
              <h3 className="font-heading text-2xl font-bold leading-snug text-[var(--text-primary)] md:text-3xl">
                成約率が上がる
              </h3>
              <p className="mt-4 text-base leading-relaxed text-[var(--text-secondary)]">
                「補助金が使えます」と添えるだけで、価格交渉の土俵が変わります。顧客が「やれるかもしれない」と感じるきっかけになります。
                補助金に関する知識は不要です。NTSが必要な情報をすべて提供します。
              </p>
              <div className="mt-6 rounded-lg bg-[#F5F8FF] px-4 py-3">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  こんな場面で効きます
                </p>
                <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                  「費用がネックで…」で止まっていた商談に、「この設備、補助金の対象です」と一言。
                  <br />
                  値下げ交渉ではなく、制度活用として話が進みます。
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
              <h3 className="font-heading text-2xl font-bold leading-snug text-[var(--text-primary)] md:text-3xl">
                紹介フィーで
                <br />
                新しい収益が生まれる
              </h3>
              <p className="mt-4 text-base leading-relaxed text-[var(--text-secondary)]">
                顧客を紹介いただいた場合、紹介フィーをお支払いします。
                ヒアリングから採択後の対応まで、すべてNTSが担当します。
                御社の手間はご紹介の一言だけです。
              </p>
              <div className="mt-6 rounded-lg bg-[#F5F8FF] px-4 py-3">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  御社の動きはこれだけ
                </p>
                <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                  「補助金が使えるか相談してみては」と一言お伝えいただくだけ。
                  <br />
                  ヒアリング・申請・採択後の伴走まで、すべてNTSが対応します。
                </p>
              </div>
            </div>
          </motion.div>

          {/* Merit 03: テキスト左 / 画像右 */}
          <motion.div
            {...fadeUp(0.3)}
            className="flex flex-col items-center gap-10 lg:flex-row lg:gap-16"
          >
            {/* テキスト */}
            <div className="flex-1">
              <h3 className="font-heading text-2xl font-bold leading-snug text-[var(--text-primary)] md:text-3xl">
                申請から採択まで、
                <br />
                専門家が一貫サポート
              </h3>
              <p className="mt-4 text-base leading-relaxed text-[var(--text-secondary)]">
                補助金は「知っている」だけでは採択されません。要件の確認・書類の作成・審査対応まで、専門コンサルタントが伴走します。
                御社はご紹介だけ。面倒な手続きはすべてNTSが引き受けます。
              </p>
              <div className="mt-6 rounded-lg bg-[#F5F8FF] px-4 py-3">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  サポート範囲
                </p>
                <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                  対象制度の選定・申請書類の作成・審査機関とのやり取り・採択後の実績報告まで、一気通貫でNTSが対応します。
                </p>
              </div>
            </div>

            {/* 画像 */}
            <div className="flex w-full items-end justify-center lg:w-[40%] lg:flex-none">
              <Image
                src={isometric23}
                alt="専門家が一貫サポートするイラスト"
                width={640}
                height={640}
                className="h-[280px] w-auto object-contain"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

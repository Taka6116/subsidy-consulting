"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const VIEWPORT = { once: true, margin: "-100px" } as const;

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
} as const;

export default function PartnerFeeSection() {
  return (
    <section
      id="fee-flow"
      className="section-white relative overflow-hidden px-6 py-24 md:py-32"
      style={{ zIndex: 10 }}
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          className="mb-14 text-center md:mb-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
        >
          <motion.h2
            variants={itemVariants}
            className="font-heading mb-4 text-4xl font-bold leading-tight text-[var(--text-primary)] md:text-5xl"
          >
            紹介するだけで、
            <br />
            収益が生まれる仕組み。
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="mx-auto max-w-2xl text-base leading-relaxed text-[var(--text-secondary)] md:text-lg"
          >
            申請準備支援・採択後の伴走まで、NTSが一貫してサポートします。
            <br className="hidden sm:block" />
            採択が決まったとき、御社に紹介フィーをお支払いします。
          </motion.p>
        </motion.div>

        <p className="mt-4 text-center text-sm text-[var(--text-secondary)]">
          採択されなければ、御社への費用請求も紹介フィーの義務も一切発生しません。
          <br className="hidden sm:block" />
            成果連動フィー型だから、紹介することにリスクはありません。
        </p>

        <motion.div
          className="relative mt-12 h-[200px] w-full overflow-hidden rounded-2xl"
          style={{ background: "linear-gradient(135deg, #EEF6FF, #E8F9F4)" }}
          data-placeholder="flow-main"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT}
          transition={{ duration: 0.5, delay: 0.12 }}
        >
          <div
            className="absolute bottom-0 left-8 text-sm text-[#B0C4D8]"
            data-placeholder="flow-illustration"
          >
            画像を入れる場所
          </div>
        </motion.div>

        <motion.div
          className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <a
            href="#contact"
            className="btn-teal inline-flex w-full max-w-xs items-center justify-center text-sm font-bold transition-all sm:w-auto sm:text-base"
          >
            まず話を聞く →
          </a>
          <Link
            href="#merit"
            className="btn-secondary inline-flex w-full max-w-xs items-center justify-center text-sm sm:w-auto"
          >
            提携のメリットを見る
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

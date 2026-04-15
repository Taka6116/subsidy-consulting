"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, DollarSign, FileText, Search, UserPlus } from "lucide-react";

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

const steps = [
  {
    step: "01",
    title: "顧客を紹介",
    body: "御社→NTSへ。1分で完了",
    Icon: UserPlus,
  },
  {
    step: "02",
    title: "NTSが診断・マッチング",
    body: "最適な補助金を選定",
    Icon: Search,
  },
  {
    step: "03",
    title: "申請〜採択まで全対応",
    body: "御社の工数はゼロ",
    Icon: FileText,
  },
  {
    step: "04",
    title: "紹介フィー受取",
    body: "採択額の10%",
    Icon: DollarSign,
  },
] as const;

export default function PartnerFeeSection() {
  return (
    <section
      id="fee-flow"
      className="relative overflow-hidden py-24 px-6 md:py-32"
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
          <motion.p
            variants={itemVariants}
            className="mb-6 text-xs uppercase tracking-[0.3em] text-[#1A7B6F]"
          >
            HOW IT WORKS
          </motion.p>
          <motion.h2
            variants={itemVariants}
            className="font-heading mb-4 text-4xl font-bold leading-tight text-white md:text-5xl"
          >
            紹介するだけで、
            <br />
            収益が生まれる仕組み。
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="mx-auto max-w-2xl text-base leading-relaxed text-white/70 md:text-lg"
          >
            補助金の申請・採択はすべてNTSが対応します。
            <br className="hidden sm:block" />
            採択が決まったとき、御社に紹介フィーをお支払いします。
          </motion.p>
        </motion.div>

        <div className="flex flex-col items-center md:flex-row md:items-stretch md:justify-center md:gap-0">
          {steps.flatMap((s, i) => {
            const Icon = s.Icon;
            const card = (
              <motion.div
                key={`fee-card-${s.step}`}
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={VIEWPORT}
                transition={{ delay: i * 0.15 }}
                className="w-full max-w-sm flex-1 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm [-webkit-backdrop-filter:blur(12px)] md:max-w-none md:min-w-0 md:flex-[1_1_0%]"
              >
                <div className="mb-4 flex items-center gap-3">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 text-[#1A7B6F]"
                    style={{ background: "rgba(26, 123, 111, 0.15)" }}
                    aria-hidden
                  >
                    <Icon className="h-5 w-5" strokeWidth={2} />
                  </div>
                  <span className="text-xs font-bold tabular-nums tracking-wider text-white/40">
                    {s.step}
                  </span>
                </div>
                <h3 className="font-heading text-lg font-bold text-white md:text-xl">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/65">{s.body}</p>
              </motion.div>
            );

            if (i >= steps.length - 1) {
              return [card];
            }

            const arrow = (
              <motion.div
                key={`fee-arrow-${i}`}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={VIEWPORT}
                transition={{
                  duration: 0.45,
                  delay: i * 0.15 + 0.3,
                }}
                className="flex shrink-0 items-center justify-center py-3 md:px-1.5 md:py-0 lg:px-2"
                aria-hidden
              >
                <ArrowRight
                  className="h-8 w-8 rotate-90 text-[#1A7B6F] md:rotate-0"
                  strokeWidth={2.25}
                />
              </motion.div>
            );

            return [card, arrow];
          })}
        </div>

        <motion.div
          className="mx-auto mt-14 w-full max-w-[80%] md:mt-16"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div
            className="rounded-r-xl border-y border-r border-white/10 py-6 pl-5 pr-5 md:pl-6 md:pr-8"
            style={{
              background: "rgba(26, 123, 111, 0.1)",
              borderLeft: "3px solid #1A7B6F",
            }}
          >
            <p className="mb-4 text-xs font-bold uppercase tracking-wider text-white/45">
              活用例
            </p>
            <p className="text-sm font-medium text-white/90 md:text-base">
              省力化補助金で600万円の設備が採択された場合
            </p>
            <div className="mt-5 space-y-3 text-sm text-white/80 md:text-base">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-3">
                <span className="shrink-0 text-white/55">顧客の自己負担</span>
                <span className="hidden text-[#1A7B6F] sm:inline" aria-hidden>
                  →
                </span>
                <span>最大300万円以下に（半額以下）</span>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <span className="shrink-0 text-white/55">御社の紹介フィー</span>
                <span className="hidden text-[#1A7B6F] sm:inline" aria-hidden>
                  →
                </span>
                <span className="flex flex-wrap items-baseline gap-2">
                  <span className="text-3xl font-bold text-[#1A7B6F]">60万円</span>
                  <span className="text-white/70">（採択額600万円の10%）</span>
                </span>
              </div>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-white/50 md:text-sm">
              ※紹介フィーは成功報酬型のため、採択されなかった場合は発生しません。
            </p>
          </div>
        </motion.div>

        <p className="mt-4 text-center text-sm text-white/60">
          採択されなければ、御社への費用請求も紹介フィーの義務も一切発生しません。
          <br className="hidden sm:block" />
          完全成功報酬型だから、紹介することにリスクはありません。
        </p>

        <motion.div
          className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <a
            href="#contact"
            className="inline-flex w-full max-w-xs items-center justify-center rounded px-8 py-3.5 text-sm font-bold text-white transition-all sm:w-auto sm:px-10 sm:text-base"
            style={{
              background: "#F5A623",
              boxShadow: "0 4px 24px rgba(245,166,35,0.35)",
            }}
          >
            まず話を聞く →
          </a>
          <Link
            href="#merit"
            className="inline-flex w-full max-w-xs items-center justify-center rounded border border-white/25 bg-white/[0.06] px-6 py-3.5 text-sm text-white/70 transition hover:border-white/45 hover:bg-white/[0.10] sm:w-auto"
          >
            提携のメリットを見る
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

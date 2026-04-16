"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, DollarSign, FileText, Search, UserPlus } from "lucide-react";
import isometric09 from "../../../icon-assets/isometric_09.webp";
import isometric12 from "../../../icon-assets/isometric_12.webp";

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
    body: "御社 → NTSへ。1分で完了",
    Icon: UserPlus,
  },
  {
    step: "02",
    title: "NTSが戦略設計・申請サポート",
    body: "補助金の選定から書類準備まで対応",
    Icon: Search,
  },
  {
    step: "03",
    title: "採択後も1年間伴走",
    body: "設備定着・効果検証までNTSが継続関与",
    Icon: FileText,
  },
  {
    step: "04",
    title: "紹介フィー受取",
    body: "採択額の10%を御社にお支払い",
    Icon: DollarSign,
  },
] as const;

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
          <motion.p
            variants={itemVariants}
            className="label-section mb-6"
          >
            HOW IT WORKS
          </motion.p>
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
            申請・採択から採択後の1年間まで、すべてNTSが対応します。
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
                className="card w-full max-w-sm flex-1 p-6 md:max-w-none md:min-w-0 md:flex-[1_1_0%]"
              >
                <div className="mb-4 flex items-center gap-3">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--border-card)] text-[var(--accent-teal)]"
                    style={{ background: "rgba(0, 184, 148, 0.12)" }}
                    aria-hidden
                  >
                    <Icon className="h-5 w-5" strokeWidth={2} />
                  </div>
                  <span className="text-xs font-bold tabular-nums tracking-wider text-[var(--text-muted)]">
                    {s.step}
                  </span>
                </div>
                <h3 className="font-heading text-lg font-bold text-[var(--text-primary)] md:text-xl">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">{s.body}</p>
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
                  className="h-8 w-8 rotate-90 text-[var(--accent-teal)] md:rotate-0"
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
          <div className="rounded-xl border border-[var(--accent-teal)]/30 bg-[var(--accent-teal)]/10 py-6 pl-5 pr-5 md:pl-6 md:pr-8">
            <p className="mb-4 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              活用例
            </p>
            <p className="text-sm font-medium text-[var(--text-primary)] md:text-base">
              省力化補助金で600万円の設備投資が採択された場合
            </p>
            <div className="mt-5 space-y-3 text-sm text-[var(--text-secondary)] md:text-base">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-3">
                <span className="shrink-0 text-[var(--text-muted)]">顧客の自己負担</span>
                <span className="hidden text-[var(--accent-teal)] sm:inline" aria-hidden>
                  →
                </span>
                <span>最大 300万円以下（半額以下）</span>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <span className="shrink-0 text-[var(--text-muted)]">御社の紹介フィー</span>
                <span className="hidden text-[var(--accent-teal)] sm:inline" aria-hidden>
                  →
                </span>
                <span className="flex flex-wrap items-baseline gap-2">
                  <span className="text-3xl font-bold text-[var(--accent-teal)]">60万円</span>
                  <span className="text-[var(--text-secondary)]">（採択額600万円の10%）</span>
                </span>
              </div>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-[var(--text-muted)] md:text-sm">
              ※採択されなかった場合、紹介フィーは発生しません。
              <br />
              御社はゼロリスクで、新しい収益の柱を持てます。
            </p>
          </div>
        </motion.div>

        <p className="mt-4 text-center text-sm text-[var(--text-secondary)]">
          採択されなければ、御社への費用請求も紹介フィーの義務も一切発生しません。
          <br className="hidden sm:block" />
          完全成功報酬型だから、紹介することにリスクはありません。
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
          <Image
            src={isometric09}
            alt="（後から差し替え）仕組み説明イラスト"
            width={640}
            height={640}
            className="absolute bottom-0 right-[220px] h-[70%] w-auto object-contain opacity-85"
          />
          <Image
            src={isometric12}
            alt="（後から差し替え）仕組み説明イラスト"
            width={640}
            height={640}
            className="absolute bottom-0 right-10 h-[85%] w-auto object-contain"
          />
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

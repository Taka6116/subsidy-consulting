'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, type Easing } from 'framer-motion'
import { CheckCircle2, ChevronRight, Compass, FileCheck2, TrendingUp, Users } from 'lucide-react'
import isometric11 from '../../../icon-assets/isometric_11.png'
import isometric20 from '../../../icon-assets/isometric_20.png'
import isometric21 from '../../../icon-assets/isometric_21.png'
import isometric04 from '../../../icon-assets/isometric_04.png'

const EASE_OUT: Easing = [0.22, 1, 0.36, 1]

const beforeItems = [
  '採択後、何をすればいいかわからない',
  '計画どおりに進められない',
  '実績報告の準備に時間がかかる',
  '次の施策につながらない',
]

const afterItems = [
  '採択後の計画設計まで支援',
  '進捗管理と課題解決を伴走',
  '実績報告までスムーズに支援',
  '次の補助金・成長戦略まで見据える',
]

const values = [
  {
    title: '迷わない計画設計',
    desc: '現状分析から最適な活用プランを一緒に設計します。',
    icon: Compass,
  },
  {
    title: '進捗管理サポート',
    desc: '進捗に合わせて課題を整理し、解決まで伴走します。',
    icon: Users,
  },
  {
    title: 'スムーズな実績報告',
    desc: '必要書類の準備から提出まで効率的にサポートします。',
    icon: FileCheck2,
  },
  {
    title: '次の成長戦略',
    desc: '補助金の次も見据えた継続的な成長をご支援します。',
    icon: TrendingUp,
  },
]

export default function ComparisonDiagram() {
  return (
    <section className="w-full bg-[#F7FAFC] px-6 py-24 md:py-28">
      <div className="mx-auto w-full max-w-[1200px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: EASE_OUT }}
          className="mb-14 text-center md:mb-16"
        >
          <p className="mb-5 text-sm font-medium tracking-[0.06em] text-[#4b5f76]">
            「申請して終わり」を、終わらせる。
          </p>
          <h2 className="font-heading mx-auto max-w-[1000px] text-[2rem] font-extrabold leading-[1.5] tracking-[0.02em] text-[#163D73] md:text-[2.7rem]">
            <span className="text-[#19C2B3]">成果</span>につながる、その先まで伴走します。
          </h2>
        </motion.div>

        <div className="grid items-center gap-5 lg:grid-cols-[1fr_auto_1fr] lg:gap-8">
          <motion.article
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, ease: EASE_OUT }}
            className="rounded-[24px] border border-[#DCE8F2] bg-[#EEF2F7] p-6 shadow-[0_14px_40px_-34px_rgba(22,61,115,0.35)] transition hover:-translate-y-0.5 md:p-8"
          >
            <p className="mb-1 text-xs font-semibold tracking-[0.08em] text-[#6d7d91]">これまでの支援</p>
            <h3 className="font-heading mb-5 text-[1.8rem] font-bold text-[#1f3856]">申請して終わり。</h3>

            <ul className="space-y-2.5 text-[0.95rem] text-[#4f5f73]">
              {beforeItems.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#d8dfe8] text-[12px] font-bold text-[#7a8797]">
                    ×
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex justify-end">
              <div className="relative h-[140px] w-[130px] opacity-80">
                <Image src={isometric11} alt="従来の支援イメージ" fill className="object-contain" />
              </div>
            </div>
          </motion.article>

          <div className="flex justify-center">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#DCE8F2] bg-white text-[#163D73] shadow-sm">
              <ChevronRight className="h-6 w-6" />
            </span>
          </div>

          <motion.article
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, ease: EASE_OUT, delay: 0.08 }}
            className="rounded-[24px] border border-[#cbe9e4] bg-gradient-to-br from-white to-[#E8FAF7] p-6 shadow-[0_18px_48px_-34px_rgba(25,194,179,0.38)] transition hover:-translate-y-0.5 md:p-8"
          >
            <span className="mb-4 inline-block rounded-full border border-[#19C2B3]/35 bg-white px-3 py-1 text-xs font-semibold tracking-[0.06em] text-[#0f7f73]">
              NTSが伴走する支援
            </span>
            <h3 className="font-heading mb-5 text-[1.7rem] font-bold leading-snug text-[#163D73]">
              成果につながる、次の一歩へ。
            </h3>

            <ul className="space-y-2.5 text-[0.95rem] text-[#264b67]">
              {afterItems.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#19C2B3]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="relative h-[110px] rounded-2xl bg-white/75">
                <Image src={isometric21} alt="伴走支援イメージ" fill className="object-contain p-2" />
              </div>
              <div className="relative h-[110px] rounded-2xl bg-white/75">
                <Image src={isometric20} alt="成長イメージ" fill className="object-contain p-2" />
              </div>
            </div>
          </motion.article>
        </div>

        <div className="my-12 h-px w-full bg-[#DCE8F2] md:my-14" />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {values.map((value, index) => {
            const Icon = value.icon
            return (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, ease: EASE_OUT, delay: index * 0.07 }}
                className="rounded-2xl border border-[#DCE8F2] bg-white px-5 py-4 transition hover:-translate-y-0.5"
              >
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8FAF7] text-[#19C2B3]">
                  <Icon className="h-5 w-5" />
                </div>
                <h4 className="mb-1.5 text-base font-bold text-[#163D73]">{value.title}</h4>
                <p className="text-sm leading-relaxed text-[#4f647b]">{value.desc}</p>
              </motion.div>
            )
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
          className="mt-8 flex flex-col items-center justify-between gap-5 rounded-[24px] border border-[#d4ece8] bg-gradient-to-r from-[#f3fbfa] to-[#e9f8f6] p-5 md:flex-row md:px-6 md:py-5"
        >
          <div className="relative h-[78px] w-[120px] shrink-0">
            <Image src={isometric04} alt="伴走支援イメージ" fill className="object-contain" />
          </div>
          <p className="text-center text-[0.97rem] leading-relaxed text-[#20435f] md:text-left">
            「申請して終わり」ではなく、「成果が続く未来」へ。<br />
            NTSが最後まで伴走し、貴社の挑戦を支えます。
          </p>
          <Link
            href="/consult"
            className="inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#19C2B3] to-[#12a89b] px-7 py-3 text-sm font-bold text-white shadow-[0_10px_24px_-14px_rgba(18,168,155,0.72)] transition hover:-translate-y-0.5 hover:brightness-105"
          >
            無料で相談してみる
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

'use client'

import Link from 'next/link'
import { motion, type Easing } from 'framer-motion'

const EASE_OUT: Easing = [0.22, 1, 0.36, 1]

const ROADMAP_STEPS = [
  {
    num: 1,
    title: '採択後の計画設計',
    desc: '制度要件と事業計画を整理し、実行順序を明確にします。',
  },
  {
    num: 2,
    title: '設備導入・実行支援',
    desc: '導入時期、見積、社内準備の抜け漏れを確認します。',
  },
  {
    num: 3,
    title: '実績報告の準備',
    desc: '報告に必要な資料や証跡を、早い段階から整理します。',
  },
  {
    num: 4,
    title: '次年度の戦略',
    desc: '次の補助金や投資計画まで見据えて、継続活用を支援します。',
  },
]

const PROOF_ITEMS = [
  {
    abbr: '計',
    title: '迷わない計画設計',
    desc: '対象制度から採択後の動きまで、必要な順番を整理。',
  },
  {
    abbr: '専',
    title: '専門家と連携',
    desc: '必要に応じて士業・専門家との確認につなぎます。',
  },
  {
    abbr: '次',
    title: '次の成長戦略へ',
    desc: '単発の申請ではなく、事業投資の流れとして活用。',
  },
]

export default function ComparisonDiagram() {
  return (
    <section
      className="relative w-full overflow-hidden px-6 py-20 md:py-24"
      aria-label="採択後の伴走支援"
      style={{
        background: 'linear-gradient(180deg, #f1f9ff 0%, #eef8ff 46%, #f8fcff 100%)',
      }}
    >
      {/* ドットグリッド背景 */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(#bcd9e7 1px, transparent 1px)',
          backgroundSize: '22px 22px',
          opacity: 0.22,
          maskImage:
            'linear-gradient(90deg, transparent 0%, #000 15%, #000 85%, transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(90deg, transparent 0%, #000 15%, #000 85%, transparent 100%)',
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-[1200px]">
        {/* ── 見出し ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: EASE_OUT }}
          className="mb-12 text-center md:mb-14"
        >
          <p className="mb-4 text-sm font-medium tracking-[0.06em] text-[#51708a]">
            申請して終わりを、終わらせる。
          </p>
          <h2 className="font-heading mx-auto text-[2rem] font-extrabold leading-tight tracking-tight text-[#102a4c] md:text-[2.6rem]">
            <span className="text-[#0fc8aa]">採択は、スタートです。</span>
            <br />
            1年後の成果まで、計画と実行を整えます。
          </h2>
          <p className="mx-auto mt-5 max-w-[680px] text-[1.0625rem] leading-[2] text-[#58718a]">
            AIで見つけた制度を、専門家とともに事業で使える計画へ。<br />
            採択後の設備導入、実績報告、次年度の補助金戦略まで、迷いやすいポイントを整理します。
          </p>
        </motion.div>

        {/* ── 比較グリッド ── */}
        <div className="grid items-stretch gap-6 lg:grid-cols-[0.78fr_1.22fr]">
          {/* 左：これまでの支援 */}
          <motion.article
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, ease: EASE_OUT }}
            className="relative min-h-[320px] rounded-xl border border-[#d8e8f3] bg-[rgba(245,249,252,0.9)] p-8 shadow-[rgba(16,42,76,0.08)_0_18px_44px,rgba(16,42,76,0.04)_0_4px_12px]"
          >
            <span className="inline-flex items-center rounded px-2.5 py-1 text-[13px] font-bold text-[#60798f] ring-1 ring-[#d8e8f3]" style={{ background: '#eef5fa' }}>
              これまでの支援
            </span>
            <h3 className="font-heading mb-5 mt-5 text-[1.75rem] font-bold text-[#3c5063]">
              申請して終わり。
            </h3>
            <ul className="space-y-3">
              {[
                '採択後、何をすればいいか分からない',
                '設備導入や報告準備が後回しになる',
                '次の補助金につながらない',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-[15px] text-[#718497]">
                  <span className="mt-0.5 inline-flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border border-[#cbd9e3] text-[12px] font-bold text-[#a7b7c5]">
                    ×
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            {/* 右下：ドキュメントアイコン風装飾 */}
            <div
              className="absolute bottom-6 right-7 flex h-[104px] w-[104px] items-center justify-center rounded-lg border border-[#dce9f2] bg-white"
              aria-hidden
            >
              <svg width="42" height="58" viewBox="0 0 42 58" fill="none">
                <rect x="1" y="1" width="40" height="56" rx="4" fill="url(#docGrad)" stroke="#86a7c4" strokeWidth="2"/>
                <circle cx="21" cy="34" r="10" stroke="#0fc8aa" strokeWidth="3" strokeDasharray="22 44" strokeLinecap="round"/>
                <defs>
                  <linearGradient id="docGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop stopColor="#eff7ff"/>
                    <stop offset="1" stopColor="#ffffff"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </motion.article>

          {/* 右：ロードマップ */}
          <motion.article
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, ease: EASE_OUT, delay: 0.08 }}
            className="rounded-xl border border-[#bfeee4] bg-gradient-to-br from-white to-[rgba(238,255,250,0.9)] p-8 shadow-[rgba(16,42,76,0.08)_0_18px_44px,rgba(16,42,76,0.04)_0_4px_12px]"
          >
            <span className="inline-flex items-center rounded px-2.5 py-1 text-[13px] font-bold text-[#087f72] ring-1 ring-[#bfeee4]" style={{ background: '#e1fbf5' }}>
              NTSが目指す支援
            </span>
            <h3 className="font-heading mb-6 mt-5 max-w-[560px] text-[1.75rem] font-bold leading-snug text-[#102a4c]">
              成果につながる、<br />次の一歩まで。
            </h3>

            {/* 4ステップタイムライン */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {ROADMAP_STEPS.map((step, i) => (
                <div
                  key={step.num}
                  className="relative min-h-[160px] rounded-lg border border-[#d8efe9] bg-white p-4"
                >
                  {/* ステップ間矢印 */}
                  {i < ROADMAP_STEPS.length - 1 && (
                    <div className="absolute -right-[7px] top-1/2 z-10 hidden h-0.5 w-3.5 -translate-y-1/2 bg-[#9dded3] md:block" aria-hidden />
                  )}
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0fc8aa] text-[13px] font-extrabold text-white">
                    {step.num}
                  </div>
                  <h4 className="font-heading mt-3 mb-2 text-[1.0625rem] font-bold leading-snug text-[#102a4c]">
                    {step.title}
                  </h4>
                  <p className="text-[13px] leading-relaxed text-[#657b8f]">{step.desc}</p>
                </div>
              ))}
            </div>
          </motion.article>
        </div>

        {/* 矢印ブリッジ（lg以上） */}
        <div className="relative h-0 lg:block">
          <div
            className="absolute hidden -translate-y-1/2 lg:flex"
            style={{ left: 'calc(39% - 22px)', top: '-30px' }}
            aria-hidden
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[#d8e8f3] bg-white text-[24px] font-bold text-[#1f5f9f] shadow-[rgba(16,42,76,0.12)_0_12px_26px]">
              ›
            </span>
          </div>
        </div>

        {/* ── 3つのポイント ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
          className="mt-7 grid gap-4 md:grid-cols-3"
        >
          {PROOF_ITEMS.map((item) => (
            <div
              key={item.title}
              className="flex items-center gap-3 rounded-lg border border-[#d8e8f3] bg-[rgba(255,255,255,0.86)] p-[18px] shadow-sm"
            >
              <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-lg border border-[#bfeee4] bg-[#e7fbf7] text-[17px] font-black text-[#0fc8aa]">
                {item.abbr}
              </div>
              <div>
                <p className="mb-1 text-[15px] font-bold text-[#102a4c]">{item.title}</p>
                <p className="text-[12px] leading-relaxed text-[#657b8f]">{item.desc}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* ── CTAバンド ── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: EASE_OUT, delay: 0.08 }}
          className="mt-7 flex flex-col items-start justify-between gap-5 rounded-lg border border-[#bfeee4] bg-[rgba(231,251,247,0.78)] px-6 py-5 md:flex-row md:items-center"
        >
          <p className="text-[15px] leading-[1.8] text-[#48667d]">
            <strong className="text-[#102a4c]">「申請して終わり？」ではなく、「成果が続く未来」へ。</strong>
            <br />
            自社で使える制度と、採択後に必要な準備をまず確認できます。
          </p>
          <Link
            href="/consult"
            className="inline-flex h-12 shrink-0 items-center justify-center rounded-md bg-[#0fc8aa] px-6 text-[15px] font-extrabold text-white shadow-[rgba(15,200,170,0.28)_0_14px_30px] transition hover:-translate-y-px hover:brightness-105"
          >
            無料で相談してみる
          </Link>
        </motion.div>

        <p className="mt-5 text-center text-[12px] leading-relaxed text-[#8093a5]">
          ※ NTSは補助金活用支援・申請準備支援を行います。官公署提出書類作成等が必要な場合は、提携専門家と連携します。
        </p>
      </div>
    </section>
  )
}

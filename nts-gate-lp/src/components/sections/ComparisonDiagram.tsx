'use client'

import { useRef } from 'react'
import { motion, useInView, type Variants, type Easing } from 'framer-motion'

// --- SVGアイコン（インライン定義） ---

const IconDoc = ({ color }: { color: string }) => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <rect x="3" y="2" width="12" height="14" rx="2" stroke={color} strokeWidth="1.4" />
    <path d="M6 6h6M6 9h4" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
  </svg>
)

const IconClock = ({ color }: { color: string }) => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <circle cx="9" cy="9" r="6" stroke={color} strokeWidth="1.4" />
    <path d="M9 6v3l2 2" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
  </svg>
)

const IconPerson = ({ color }: { color: string }) => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M4 14s0-4 5-4 5 4 5 4" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
    <circle cx="9" cy="7" r="3" stroke={color} strokeWidth="1.4" />
  </svg>
)

const IconCheckBox = ({ color }: { color: string }) => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M5 9l3 3 5-5" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="3" y="3" width="12" height="12" rx="2" stroke={color} strokeWidth="1.4" />
  </svg>
)

const ArrowRight = ({ color }: { color: string }) => (
  <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
    <path d="M0 5h11M8 1l4 4-4 4" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

// --- フローノード ---

interface FlowNodeProps {
  icon: React.ReactNode
  label: string
  dimmed?: boolean
  labelColor?: string
}

function FlowNode({ icon, label, dimmed = false, labelColor = '#6a7a90' }: FlowNodeProps) {
  return (
    <div
      className="flex flex-col items-center gap-1"
      style={{ width: 52, opacity: dimmed ? 0.35 : 1 }}
    >
      <div
        className="w-[38px] h-[38px] rounded-full flex items-center justify-center"
        style={{ background: dimmed ? '#eef0f4' : undefined }}
      >
        {icon}
      </div>
      <span
        className="text-center leading-snug block"
        style={{ fontSize: 10, color: labelColor, fontWeight: labelColor === '#0a6b52' ? 500 : 400, minHeight: '2.4em' }}
      >
        {label.split('・').map((t, i, arr) => (
          <span key={i}>{t}{i < arr.length - 1 ? '・' : ''}<br /></span>
        ))}
      </span>
    </div>
  )
}

// --- メインコンポーネント ---

export default function ComparisonDiagram() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  const easeOut: Easing = [0.0, 0.0, 0.2, 1.0]

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: easeOut, delay: i * 0.12 },
    }),
  }

  return (
    <section
      ref={ref}
      className="w-full py-20 px-6"
      style={{ background: '#EEF2F7', fontFamily: "'Zen Kaku Gothic New', sans-serif", letterSpacing: '0.05em' }}
    >
      {/* ── 上部：全幅見出し ── */}
      <motion.div
        className="text-center mb-14"
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
        custom={0}
        variants={fadeUp}
      >
        <h2 className="text-3xl font-bold mb-3" style={{ color: '#1a2740', lineHeight: 1.5 }}>
          「申請して終わり」を、
          <span
            className="inline-block px-2 py-0.5 rounded"
            style={{ background: '#1B4E8B', color: '#fff' }}
          >
            終わらせる。
          </span>
        </h2>
        <p className="text-sm" style={{ color: '#6a7a8a', lineHeight: 2 }}>
          補助金パートナー選びで本当に見るべきは、「採択の先で何をしてくれるか」です。
        </p>
      </motion.div>

      {/* ── 下部：2カラム ── */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

        {/* 左：説明テキスト */}
        <motion.div
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          custom={1}
          variants={fadeUp}
        >
          <p className="text-sm mb-6 text-[var(--text-secondary)]" style={{ lineHeight: 2.3 }}>
            補助金パートナーの多くは、採択をゴールにしています。申請が終わった瞬間、関係も終わる。その先は経営者ひとりで対応しなければなりません。
            <br /><br />
            実績報告・精算・効果検証——採択後にこそ、本当の経営支援が必要です。NTSは採択後も責任を持って1年間伴走します。
          </p>
          <div
            className="text-sm font-bold pt-4 inline-block"
            style={{
              color: '#1B4E8B',
              lineHeight: 1.9,
              borderTop: '1.5px solid #1B4E8B',
            }}
          >
            採択がゴールではない。<br />
            経営が動き出してからが、本番です。
          </div>
        </motion.div>

        {/* 右：図解カード */}
        <div className="flex flex-col gap-3">

          {/* 通常ケース */}
          <motion.div
            className="rounded-xl p-4"
            style={{ background: '#fff', border: '0.5px solid #d0d8e4' }}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            custom={2}
            variants={fadeUp}
          >
            <div className="flex flex-col items-center text-center mb-3">
              <span
                className="inline-block text-xs font-medium rounded-full px-3 py-0.5 mb-2"
                style={{ background: '#eef0f4', color: '#6a7a90', letterSpacing: '0.08em' }}
              >
                通常の補助金会社・FAの場合
              </span>
              <p className="text-xs font-bold" style={{ color: '#1a2740' }}>
                申請が終わると、関係も終わる
              </p>
            </div>
            <div className="flex items-center justify-center">
              <FlowNode
                icon={<div className="w-[38px] h-[38px] rounded-full flex items-center justify-center" style={{ background: '#dce8f7' }}><IconDoc color="#1B4E8B" /></div>}
                label="相談・書類作成"
              />
              <div className="flex items-center pb-5 w-4 flex-shrink-0">
                <ArrowRight color="#8a9ab0" />
              </div>
              <FlowNode
                icon={<div className="w-[38px] h-[38px] rounded-full flex items-center justify-center" style={{ background: '#dce8f7' }}><IconClock color="#1B4E8B" /></div>}
                label="申請・採択"
              />
              {/* 終了マーク */}
              <div className="flex flex-col items-center justify-center pb-5 w-6 flex-shrink-0">
                <span className="font-bold leading-none" style={{ fontSize: 14, color: '#c94040' }}>×</span>
                <span style={{ fontSize: 8, color: '#c94040' }}>終了</span>
              </div>
              <FlowNode
                icon={<div className="w-[38px] h-[38px] rounded-full flex items-center justify-center" style={{ background: '#eef0f4' }}><IconPerson color="#8a9ab0" /></div>}
                label="採択後の活用"
                dimmed
              />
              <div className="flex items-center pb-5 w-4 flex-shrink-0" style={{ opacity: 0.2 }}>
                <ArrowRight color="#8a9ab0" />
              </div>
              <FlowNode
                icon={<div className="w-[38px] h-[38px] rounded-full flex items-center justify-center" style={{ background: '#eef0f4' }}><IconCheckBox color="#8a9ab0" /></div>}
                label="効果検証"
                dimmed
              />
            </div>
          </motion.div>

          {/* NTSケース */}
          <motion.div
            className="rounded-xl p-4"
            style={{ background: '#f0f5fc', border: '2px solid #1B4E8B' }}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            custom={3}
            variants={fadeUp}
          >
            <div className="flex flex-col items-center text-center mb-3">
              <span
                className="inline-block text-xs font-medium rounded-full px-3 py-0.5 mb-2"
                style={{ background: '#1B4E8B', color: '#fff', letterSpacing: '0.08em' }}
              >
                日本提携支援の場合
              </span>
              <p className="text-xs font-bold" style={{ color: '#1B4E8B' }}>
                採択の先まで、一緒に走る
              </p>
            </div>
            <div className="flex items-center justify-center">
              <FlowNode
                icon={<div className="w-[38px] h-[38px] rounded-full flex items-center justify-center" style={{ background: '#dce8f7' }}><IconDoc color="#1B4E8B" /></div>}
                label="相談・書類作成"
                labelColor="#1B4E8B"
              />
              <div className="flex items-center pb-5 w-4 flex-shrink-0">
                <ArrowRight color="#1B4E8B" />
              </div>
              <FlowNode
                icon={<div className="w-[38px] h-[38px] rounded-full flex items-center justify-center" style={{ background: '#dce8f7' }}><IconClock color="#1B4E8B" /></div>}
                label="申請・採択"
                labelColor="#1B4E8B"
              />
              <div className="flex items-center pb-5 w-4 flex-shrink-0">
                <ArrowRight color="#1B4E8B" />
              </div>
              <FlowNode
                icon={<div className="w-[38px] h-[38px] rounded-full flex items-center justify-center" style={{ background: '#dce8f7' }}><IconPerson color="#1B4E8B" /></div>}
                label="採択後の活用"
                labelColor="#1B4E8B"
              />
              <div className="flex items-center pb-5 w-4 flex-shrink-0">
                <ArrowRight color="#1B4E8B" />
              </div>
              <FlowNode
                icon={<div className="w-[38px] h-[38px] rounded-full flex items-center justify-center" style={{ background: '#dce8f7' }}><IconCheckBox color="#1B4E8B" /></div>}
                label="効果検証"
                labelColor="#1B4E8B"
              />
            </div>
            {/* 伴走バー */}
            <div className="flex items-center mt-3 gap-2">
              <div className="flex-1 h-[3px] rounded-full" style={{ background: '#1B4E8B' }} />
              <span className="text-xs font-medium whitespace-nowrap" style={{ color: '#1B4E8B' }}>
                採択後も1年間伴走
              </span>
              <div className="flex-1 h-[3px] rounded-full" style={{ background: '#1B4E8B' }} />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}

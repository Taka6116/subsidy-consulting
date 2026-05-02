'use client'

import Link from 'next/link'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { trackCTAClick } from '@/lib/analytics'

const EASE_OUT = [0.22, 1, 0.36, 1] as const

export default function CtaBar() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section
      ref={ref}
      className="w-full py-14"
      style={{ background: '#1B4E8B' }}
    >
      <motion.div
        className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6"
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: EASE_OUT }}
        style={{ fontFamily: "var(--font-body)", letterSpacing: '0.05em' }}
      >
        {/* 左：コピー */}
        <div>
          <p className="text-white font-bold text-xl leading-relaxed mb-1">
            まず、話を聞かせてください。
          </p>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.65)', lineHeight: 1.8 }}>
            相談は無料。採択後の成功報酬のみ。
          </p>
        </div>

        {/* 右：CTAボタン */}
        <Link
          href="/consult"
          onClick={() => trackCTAClick("mid_cta_consult")}
          className="flex-shrink-0 inline-flex items-center gap-2 font-bold rounded-full px-8 py-4 text-sm transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          style={{
            background: '#00B38A',
            color: '#fff',
            letterSpacing: '0.08em',
            whiteSpace: 'nowrap',
          }}
        >
          無料相談を予約する
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
      </motion.div>
    </section>
  )
}

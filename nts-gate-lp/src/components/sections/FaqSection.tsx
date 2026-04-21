"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import {
  fadeInUpInitial,
  fadeInUpInView,
  fadeInUpReduced,
  fadeInUpTransition,
  fadeInUpViewport,
} from "@/components/sections/sectionStyles";

const FAQ_ITEMS = [
  {
    id: "documents",
    q: "補助金の申請書類は作ってもらえますか？",
    a: "弊社は行政書士事務所ではないため、申請書類の作成代行は行っていません。提携している行政書士と連携しながら、申請プロセス全体をサポートします。日本提携支援は申請の上流にある「何のために使うか」の戦略設計と、採択後の経営伴走を担当します。",
  },
  {
    id: "guarantee",
    q: "採択される保証はありますか？",
    a: "採択の保証はできません。ただし、課題に合った補助金の選定から戦略設計、書類の質向上まで、採択可能性を高めるために全力で動きます。",
  },
  {
    id: "fee",
    q: "費用はいつ発生しますか？",
    a: "着手金15万円のみ最初にいただきます。その後は採択時・実績報告完了時・1年後の効果検証時の3回、それぞれ補助額の5%を成果報酬としていただきます。採択されなかった場合、成果報酬は発生しません。",
  },
  {
    id: "industry",
    q: "建設業・運送業以外でも相談できますか？",
    a: "はい、対応可能です。ただし建設業・運送業については業界特有の課題と補助金制度の知見が特に深く、よりきめ細かいご提案ができます。",
  },
] as const;

export default function FaqSection() {
  const reduce = useReducedMotion();
  const baseId = useId();
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section className="section-block bg-section-white" aria-labelledby={`${baseId}-faq-title`}>
      <div className="section-inner">
        <motion.div
          initial={reduce ? fadeInUpReduced : fadeInUpInitial}
          whileInView={reduce ? fadeInUpReduced : fadeInUpInView}
          viewport={fadeInUpViewport}
          transition={fadeInUpTransition}
          className="mb-12 text-center md:mb-16"
        >
          <p className="sec-label mb-3">FAQ</p>
          <h2
            id={`${baseId}-faq-title`}
            className="font-heading text-[1.75rem] font-bold leading-snug text-[var(--text-primary)] md:text-[2.25rem]"
          >
            よくあるご質問
          </h2>
        </motion.div>

        <motion.ul
          initial={reduce ? fadeInUpReduced : fadeInUpInitial}
          whileInView={reduce ? fadeInUpReduced : fadeInUpInView}
          viewport={fadeInUpViewport}
          transition={{ ...fadeInUpTransition, delay: 0.06 }}
          className="space-y-4"
          role="list"
        >
          {FAQ_ITEMS.map((item) => {
            const qId = `${baseId}-faq-q-${item.id}`;
            const aId = `${baseId}-faq-a-${item.id}`;
            const open = openId === item.id;
            return (
              <li key={item.id} className="nts-card overflow-hidden text-[var(--text-primary)]">
                <button
                  type="button"
                  id={qId}
                  aria-expanded={open}
                  aria-controls={aId}
                  onClick={() => setOpenId(open ? null : item.id)}
                  className="flex w-full items-start justify-between gap-4 px-6 py-5 text-left sm:px-8 sm:py-6"
                >
                  <span className="text-base font-bold leading-snug md:text-lg">
                    Q. {item.q}
                  </span>
                  <ChevronDown
                    className={`mt-0.5 h-5 w-5 shrink-0 text-[var(--text-muted)] transition-transform duration-200 ${
                      open ? "rotate-180" : ""
                    }`}
                    aria-hidden
                  />
                </button>
                <AnimatePresence initial={false}>
                  {open ? (
                    <motion.div
                      id={aId}
                      role="region"
                      aria-labelledby={qId}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden px-6 pb-6 sm:px-8 sm:pb-8"
                    >
                      <p className="mt-4 border-t border-[var(--border-subtle)] pt-4 text-sm leading-relaxed text-[var(--text-secondary)] md:text-base">
                        A. {item.a}
                      </p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </li>
            );
          })}
        </motion.ul>
      </div>
    </section>
  );
}

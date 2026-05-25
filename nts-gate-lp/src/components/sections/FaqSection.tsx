"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import ScrollTextReveal from "@/components/shared/ScrollTextReveal";
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
    id: "agency",
    q: "NTSが補助金申請を代行してくれますか？",
    a: "NTSは、補助金情報の整理、対象制度の確認、事業計画・投資内容の整理など、申請前の準備支援を行います。官公署に提出する申請書類の作成・提出等、行政書士法その他法令により資格者が行うべき業務については、必要に応じて提携行政書士法人等が対応します。",
  },
  {
    id: "guarantee",
    q: "相談すれば必ず採択されますか？",
    a: "いいえ。補助金の採択は各制度の審査により決定されるため、採択を保証するものではありません。NTSでは、制度要件や事業内容を整理し、申請に向けた準備を支援します。",
  },
  {
    id: "consult",
    q: "無料相談では何を確認できますか？",
    a: "事業内容、投資予定、対象地域、業種、補助対象経費などをもとに、活用できる可能性のある補助金や申請前に整理すべきポイントを確認できます。",
  },
  {
    id: "documents",
    q: "申請書類の作成が必要な場合はどうなりますか？",
    a: "行政書士法その他法令により資格者が行うべき業務が必要な場合は、提携行政書士法人等をご案内します。",
  },
  {
    id: "fee",
    q: "費用はいつ発生しますか？",
    a: "着手金15万円のみ最初にいただきます。その後は採択時・実績報告完了時・1年後の効果検証時の3回、それぞれ補助額の5%をコンサルティングフィーとしていただきます。採択されなかった場合、コンサルティングフィーは発生しません。",
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
          <ScrollTextReveal
            as="h2"
            id={`${baseId}-faq-title`}
            className="font-heading text-3xl font-bold leading-tight text-[var(--text-primary)] md:text-4xl"
          >
            よくあるご質問
          </ScrollTextReveal>
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


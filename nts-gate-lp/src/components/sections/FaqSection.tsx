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
  glassCardClass,
  sectionContainerClass,
  sectionStackClass,
} from "@/components/sections/sectionStyles";

const FAQ_ITEMS = [
  {
    id: "free",
    q: "照会・相談は本当に無料ですか？",
    a: "はい、完全無料です。照会・ご相談に費用は一切かかりません。費用が発生するのは、補助金申請のサポートをご依頼いただいた場合のみです（手付金15万円＋採択時成功報酬）。",
  },
  {
    id: "judge",
    q: "自社が対象かどうか、自分で判断できません。",
    a: "ご安心ください。企業名と業種を入力していただくだけで、NTSの担当者が対象制度を確認してご案内します。難しい判断は不要です。",
  },
  {
    id: "self",
    q: "申請は自分でもできますか？",
    a: "制度によっては自己申請も可能ですが、書類の要件が複雑で採択率に差が出るケースがほとんどです。NTSでは書類作成から申請・採択後の報告まで一貫してサポートします。",
  },
  {
    id: "industry",
    q: "どのような業種・規模の企業が対象ですか？",
    a: "中小企業・小規模事業者が主な対象です。業種によって対象となる補助金が異なりますが、製造業・サービス業・小売業・建設業など幅広い業種に対応する制度があります。まずは照会してみてください。",
  },
  {
    id: "timeline",
    q: "相談してから申請までどのくらいかかりますか？",
    a: "補助金の種類や公募スケジュールによって異なりますが、ご相談から申請まで通常1〜2ヶ月程度です。締切が迫っている場合はお早めにご連絡ください。",
  },
] as const;

export default function FaqSection() {
  const reduce = useReducedMotion();
  const baseId = useId();
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section className={sectionStackClass} aria-labelledby={`${baseId}-faq-title`}>
      <div className={sectionContainerClass}>
        <motion.h2
          id={`${baseId}-faq-title`}
          initial={reduce ? fadeInUpReduced : fadeInUpInitial}
          whileInView={reduce ? fadeInUpReduced : fadeInUpInView}
          viewport={fadeInUpViewport}
          transition={fadeInUpTransition}
          className="text-center font-heading text-3xl font-bold text-white md:text-4xl"
        >
          よくあるご質問
        </motion.h2>

        <motion.ul
          initial={reduce ? fadeInUpReduced : fadeInUpInitial}
          whileInView={reduce ? fadeInUpReduced : fadeInUpInView}
          viewport={fadeInUpViewport}
          transition={{ ...fadeInUpTransition, delay: 0.06 }}
          className="mt-12 space-y-4"
          role="list"
        >
          {FAQ_ITEMS.map((item) => {
            const qId = `${baseId}-faq-q-${item.id}`;
            const aId = `${baseId}-faq-a-${item.id}`;
            const open = openId === item.id;
            return (
              <li key={item.id} className={`text-white ${glassCardClass}`}>
                <button
                  type="button"
                  id={qId}
                  aria-expanded={open}
                  aria-controls={aId}
                  onClick={() => setOpenId(open ? null : item.id)}
                  className="flex w-full items-start justify-between gap-4 text-left"
                >
                  <span className="text-base font-bold leading-snug md:text-lg">
                    Q. {item.q}
                  </span>
                  <ChevronDown
                    className={`mt-0.5 h-5 w-5 shrink-0 text-white/60 transition-transform duration-200 ${
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
                      className="overflow-hidden"
                    >
                      <p className="mt-4 border-t border-white/10 pt-4 text-sm leading-relaxed text-white/70 md:text-base">
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

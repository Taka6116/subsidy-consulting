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
    q: "補助金の知識がなくても相談できますか？",
    a: "はい。補助金の知識は一切不要です。「設備を入れたい」「人手が足りない」「事業を引き継ぎたい」——そうした経営の課題をお聞かせください。どの補助金が活用できるかは、私たちが一緒に整理します。",
  },
  {
    id: "judge",
    q: "申請書類の作成はどこが担当しますか？",
    a: "申請書類の作成は、NTSが提携する行政書士と連携して進めます。NTSは申請の上流にある「何のために使うか」の戦略設計と、採択後の経営伴走を担当します。",
  },
  {
    id: "self",
    q: "費用はいつ、どれくらいかかりますか？",
    a: "ご契約時に着手金15万円をいただきます。その後は補助金額の5%を、採択時・精算時・1年後の効果検証時の3段階でお支払いいただく成果報酬型です。採択されなかった場合、成果報酬は発生しません。",
  },
  {
    id: "industry",
    q: "どの補助金が対象になりますか？",
    a: "現在、中小企業省力化投資補助金・IT導入補助金・事業承継引継ぎ補助金の3制度を中心にご支援しています。お客様の業種・課題に合わせて最適な制度をご提案します。",
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

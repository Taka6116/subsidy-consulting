"use client";

import { FileText, HeartHandshake, Target } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";
import {
  fadeInUpInitial,
  fadeInUpInView,
  fadeInUpReduced,
  fadeInUpTransition,
  fadeInUpViewport,
} from "@/components/sections/sectionStyles";

const ABOUT_ICONS = [Target, FileText, HeartHandshake] as const;

const ABOUT_CARDS = [
  {
    label: "戦略設計",
    body: "補助金を使う目的と順序を、経営計画と照らし合わせながら設計します。",
  },
  {
    label: "申請サポート",
    body: "提携行政書士と連携し、書類準備から採択まで伴走します。",
  },
  {
    label: "採択後の伴走",
    body: "設備の導入定着・効果検証・次の一手の設計まで、1年間関わり続けます。",
  },
] as const;

const TARGET_SUBSIDIES = [
  "中小企業省力化投資補助金",
  "IT導入補助金",
  "事業承継・引継ぎ補助金",
] as const;

export default function WhatIsNtsSection() {
  const reduce = useReducedMotion();

  return (
    <section className="section-block bg-section-white" aria-labelledby="home-what-is-nts-heading">
      <div className="section-inner">
        <motion.div
          initial={reduce ? fadeInUpReduced : fadeInUpInitial}
          whileInView={reduce ? fadeInUpReduced : fadeInUpInView}
          viewport={fadeInUpViewport}
          transition={fadeInUpTransition}
        >
          <div className="two-col img-right mb-16 lg:mb-20">
            <div className="col-text space-y-5 text-center lg:text-left">
              <p className="label-section mb-1">NTSとは</p>
              <h2
                id="home-what-is-nts-heading"
                className="font-heading text-3xl font-bold leading-tight text-[var(--text-primary)] md:text-4xl"
              >
                補助金活用を、戦略から効果検証まで一貫して担う専門チームです。
              </h2>
              <p className="text-base leading-relaxed text-[var(--text-secondary)] md:text-lg">
                申請サポートにとどまらず、採択後の1年間もお客様の経営に寄り添います。
              </p>
              <div className="mt-6">
                <p className="mb-3 text-sm font-semibold text-[var(--text-primary)]">対象制度：</p>
                <ul className="flex list-none flex-col gap-2.5 p-0 text-sm leading-relaxed text-[var(--text-secondary)] md:text-base">
                  {TARGET_SUBSIDIES.map((name) => (
                    <li key={name} className="flex items-center justify-center gap-2.5 lg:justify-start">
                      <span
                        className="inline-block h-2 w-2 shrink-0 rounded-full bg-[var(--accent-teal)]"
                        aria-hidden
                      />
                      {name}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="col-img w-full max-w-lg justify-self-center lg:max-w-none">
              <ImagePlaceholder label="NTSサービスイラスト（書類・相談）" aspectRatio="4/3" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {ABOUT_CARDS.map((card, i) => {
              const Icon = ABOUT_ICONS[i];
              return (
                <div key={card.label} className="nts-card flex flex-col p-8">
                <div
                  className="mb-5 flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[14px] text-[var(--accent-teal)]"
                  style={{ backgroundColor: "rgba(0, 184, 148, 0.1)" }}
                >
                  <Icon className="h-6 w-6" strokeWidth={2} aria-hidden />
                </div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                  {card.label}
                </p>
                <p className="text-sm leading-relaxed text-[var(--text-secondary)] md:text-base">
                  {card.body}
                </p>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

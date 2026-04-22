"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import {
  fadeInUpInitial,
  fadeInUpInView,
  fadeInUpReduced,
  fadeInUpTransition,
  fadeInUpViewport,
} from "@/components/sections/sectionStyles";
import imgCraftswoman from "../../../icon-assets/craftswoman.webp";
import imgDelivery from "../../../icon-assets/delivery.webp";

const CARDS = [
  {
    industry: "建設業",
    title: "職人不足・設備更新・事業承継",
    imageSrc: imgCraftswoman,
    imageAlt: "建設業の職人不足と現場課題のイメージ",
    keywords: [
      "省力化補助金",
      "事業承継補助金",
      "2024年問題",
      "主力重機の更新",
      "建設業許可",
      "後継者不在",
    ],
    body: "2024年問題による工期制約、主力重機の老朽化、後継者問題——建設業が今抱える課題に直結する補助金活用を、業界の実情を理解した視点でご提案します。",
    useCase:
      "現場の人手不足や主力重機の更新タイミングが重なり、投資判断を迫られている元請・下請の経営者。許可更新や事業承継を見据え、補助金の枠に沿った投資順序を整理したいケースに合います。",
  },
  {
    industry: "運送業",
    title: "ドライバー不足・デジタル化・2代目承継",
    imageSrc: imgDelivery,
    imageAlt: "運送業の配送現場とドライバー不足のイメージ",
    keywords: [
      "省力化補助金",
      "事業承継補助金",
      "Gマーク",
      "デジタコ",
      "2024年問題",
      "主要荷主への依存",
    ],
    body: "ドライバー不足、デジタコ・Gマーク対応、荷主依存からの脱却——運送業が直面する経営課題を補助金で動かすための戦略を、一緒に設計します。",
    useCase:
      "荷主依存やドライバー確保、デジタコ・車両更新のコストが同時に押し寄せている運送会社。省力化投資や2代目への引き継ぎを、補助金を組み込んだ計画で進めたい経営者向けです。",
  },
] as const;

export default function SubsidyKindsSection() {
  const reduce = useReducedMotion();
  const skip = !!reduce;

  return (
    <section className="section-block bg-section-gray" aria-labelledby="home-subsidy-kinds-heading">
      <div className="section-inner">
        <motion.div
          initial={skip ? fadeInUpReduced : fadeInUpInitial}
          whileInView={skip ? fadeInUpReduced : fadeInUpInView}
          viewport={fadeInUpViewport}
          transition={fadeInUpTransition}
        >
          <div className="mb-12 text-center md:mb-16">
            <p className="sec-label mb-3">対象業種</p>
            <h2
              id="home-subsidy-kinds-heading"
              className="font-heading text-[1.75rem] font-bold leading-snug text-[var(--text-primary)] md:text-[2.25rem]"
            >
              建設業・運送業の経営者に、
              <br />
              特化してサポートしています。
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[var(--text-secondary)] md:text-lg">
              業界の構造と現場の悩みを理解した上で、あなたの会社に合った補助金活用戦略を一緒に設計します。
            </p>
          </div>

          <ul
            className="grid list-none gap-6 p-0"
            style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))" }}
          >
            {CARDS.map((c) => (
              <li key={c.title} className="nts-card p-8 md:p-10">
                {/* 画像はアスペクト比を固定して上部にクロップ。
                    2枚のサイズを完全に揃えつつ、縦を詰めて情報密度を上げる */}
                <div className="relative mx-auto mb-6 aspect-[16/7] w-[94%] overflow-hidden rounded-xl">
                  <Image
                    src={c.imageSrc}
                    alt={c.imageAlt}
                    fill
                    className="object-cover object-[center_32%]"
                    sizes="(max-width: 768px) 100vw, 540px"
                    priority={false}
                  />
                </div>
                <p className="text-highlight-teal mb-1 text-xs font-bold uppercase tracking-[0.18em]">
                  WORKS FOR
                </p>
                <p className="mb-2 text-xs font-semibold text-[var(--text-primary)]">{c.industry}</p>
                <h3 className="font-heading text-xl font-bold text-[var(--text-primary)] md:text-2xl">
                  {c.title}
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {c.keywords.map((k) => (
                    <span
                      key={k}
                      className="rounded-full border border-[var(--border-subtle)] bg-[#f0f4fa] px-2.5 py-1 text-[11px] text-[var(--text-secondary)]"
                    >
                      {k}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)] md:text-base">
                  {c.body}
                </p>
                <p className="mt-4 border-t border-[var(--border-subtle)] pt-4 text-sm leading-relaxed text-[var(--text-secondary)] md:text-base">
                  <span className="font-semibold text-[var(--text-primary)]">ユースケース：</span>
                  {c.useCase}
                </p>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}

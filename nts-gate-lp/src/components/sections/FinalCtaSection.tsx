"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { BookOpen, FileText, Handshake, Mail, Search } from "lucide-react";
import { trackCTAClick, trackPartnerLinkClick } from "@/lib/analytics";
import { getPartnerUrl } from "@/lib/partnerUrl";
import {
  fadeInUpInitial,
  fadeInUpInView,
  fadeInUpReduced,
  fadeInUpTransition,
  fadeInUpViewport,
} from "@/components/sections/sectionStyles";

export type FinalCtaVariant = "home" | "partner";

type CtaCard = {
  title: string;
  body: string;
  ctaLabel: string;
  href: string;
  icon: LucideIcon;
  external?: boolean;
  onClick: () => void;
};

function FinalCtaCard({ card }: { card: CtaCard }) {
  const Icon = card.icon;
  return (
    <div className="final-cta-card flex flex-col items-center gap-4 rounded-2xl bg-white p-6 text-center shadow-[0_8px_32px_rgba(0,0,0,0.12)] md:p-8">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#EEF6FF]">
        <Icon className="h-7 w-7 text-[var(--accent-navy)]" aria-hidden />
      </div>
      <h3 className="font-heading text-lg font-bold leading-snug !text-[var(--text-primary)] md:text-xl">
        {card.title}
      </h3>
      <p className="min-h-[4.5rem] text-sm leading-relaxed !text-[var(--text-secondary)] md:min-h-[5rem] md:text-[15px]">
        {card.body}
      </p>
      <Link
        href={card.href}
        {...(card.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        onClick={card.onClick}
        className="mt-auto inline-flex w-full max-w-[240px] items-center justify-center gap-1 rounded-full bg-[var(--accent-gold)] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        {card.ctaLabel}
        <span className="text-lg leading-none" aria-hidden>
          ›
        </span>
      </Link>
    </div>
  );
}

type FinalCtaSectionProps = {
  variant?: FinalCtaVariant;
};

export default function FinalCtaSection({ variant = "home" }: FinalCtaSectionProps) {
  const reduce = useReducedMotion();
  const partnerHref = getPartnerUrl();
  const partnerIsExternal = partnerHref.startsWith("http");

  const cards: CtaCard[] =
    variant === "partner"
      ? [
          {
            title: "無料相談",
            body: "提携の詳細や条件について、まずお話しします。",
            ctaLabel: "相談を申し込む",
            href: "/consult",
            icon: Mail,
            onClick: () => trackCTAClick("final_cta_consult"),
          },
          {
            title: "商材の補助金適性を確認",
            body: "御社の商材・サービスが補助金の対象になるか確認します。",
            ctaLabel: "無料で確認する",
            href: "/check",
            icon: Search,
            onClick: () => trackCTAClick("final_cta_check"),
          },
          {
            title: "提携プログラムの詳細を受け取る",
            body: "提携プログラムの詳細・対象補助金・紹介フローを個別にご案内します。まずはお問い合わせください。",
            ctaLabel: "資料を請求する",
            href: "/consult?intent=partner_document",
            icon: FileText,
            onClick: () => trackCTAClick("partner_final_cta_document"),
          },
          {
            title: "補助金情報を見る",
            body: "現在公募中の補助金一覧を確認できます。",
            ctaLabel: "補助金一覧を見る",
            href: "/subsidies",
            icon: BookOpen,
            onClick: () => trackCTAClick("final_cta_subsidies"),
          },
        ]
      : [
          {
            title: "無料相談",
            body: "経営課題と補助金の可能性について、まずお話しします。",
            ctaLabel: "相談を予約する",
            href: "/consult",
            icon: Mail,
            onClick: () => trackCTAClick("final_cta_consult"),
          },
          {
            title: "補助金診断",
            body: "会社名・URLを入力するだけで、使える可能性のある補助金をご案内します。",
            ctaLabel: "無料で診断する",
            href: "/check",
            icon: Search,
            onClick: () => trackCTAClick("final_cta_check"),
          },
          {
            title: "提携について",
            body: "税理士・士業・ベンダーの方は、パートナープログラムをご覧ください。",
            ctaLabel: "提携内容を確認する",
            href: partnerHref,
            icon: Handshake,
            external: partnerIsExternal,
            onClick: () => trackPartnerLinkClick("final_cta"),
          },
          {
            title: "補助金情報",
            body: "現在公募中の補助金一覧を確認できます。",
            ctaLabel: "補助金を検索する",
            href: "/subsidies",
            icon: BookOpen,
            onClick: () => trackCTAClick("final_cta_subsidies"),
          },
        ];

  const headingId =
    variant === "partner" ? "partner-final-cta-heading" : "home-final-cta-heading";
  const footerNote =
    variant === "partner"
      ? "紹介フィーの詳細・提携条件は個別にご案内します。"
      : "建設業・運送業の経営者からのご相談、歓迎します。";
  const subCopy =
    variant === "partner"
      ? "「うちの商材は対象になりますか？」だけでも構いません。提携の可能性についてお気軽にご相談ください。"
      : "補助金のことを相談したい。自社が対象かどうか知りたい。それだけで構いません。";

  return (
    <section
      className="section-block section-cta"
      aria-labelledby={headingId}
      id={variant === "partner" ? "contact" : undefined}
    >
      <div className="section-inner px-4 text-center sm:px-6 md:px-8">
        <motion.div
          initial={reduce ? fadeInUpReduced : fadeInUpInitial}
          whileInView={reduce ? fadeInUpReduced : fadeInUpInView}
          viewport={fadeInUpViewport}
          transition={fadeInUpTransition}
          className="py-8 md:py-12"
        >
          <h2
            id={headingId}
            className="font-heading text-[1.75rem] font-bold leading-snug text-white md:text-[2.25rem]"
          >
            まず、話を聞かせてください。
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/85 md:mt-6 md:text-lg">
            {subCopy}
          </p>

          <div className="mx-auto mt-10 grid max-w-6xl grid-cols-1 gap-5 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4 lg:gap-6">
            {cards.map((card) => (
              <FinalCtaCard key={card.title + variant} card={card} />
            ))}
          </div>

          <p className="mt-10 text-xs text-white/70 md:mt-12">{footerNote}</p>
        </motion.div>
      </div>
    </section>
  );
}

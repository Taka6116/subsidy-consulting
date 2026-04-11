"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import {
  DIAGNOSIS_STORAGE_KEY,
  parseStoredDiagnosis,
} from "@/lib/diagnosis-logic";
import {
  computeResult,
  END_USER_HERO_FALLBACK_PHRASE,
  SUBSIDY_CARD_CONTEXT_FALLBACK,
} from "@/lib/scoring";
import { wizardAnswersToScoringInput } from "@/lib/wizardToScoring";
import type { DiagnosisResult } from "@/types/diagnosis";
import SubsidyBentoGrid from "@/components/result/SubsidyBentoGrid";
import TopSubsidyReportCard, {
  HeroSubsidyEmptyCard,
} from "@/components/result/TopSubsidyReportCard";
import HorizontalProcessSteps from "@/components/result/HorizontalProcessSteps";

const BRAND_PRIMARY = "#2c5364";
const BRAND_PRIMARY_DARK = "#0f2027";
const BRAND_HEADING = "#0f2027";
const ACCENT_MUTED = "#d9f0f8";
const SURFACE = "#f0f9fc";
const SURFACE_LOW = "#e5eef4";

const fade = (delay: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: "easeOut" as const, delay },
});

function emptyEndUserResult(): DiagnosisResult {
  return computeResult({ mode: "end_user" });
}

function Inner() {
  const router = useRouter();
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [hasStoredWizard, setHasStoredWizard] = useState(false);

  useEffect(() => {
    const raw =
      typeof window !== "undefined"
        ? sessionStorage.getItem(DIAGNOSIS_STORAGE_KEY)
        : null;
    const parsed = parseStoredDiagnosis(raw);
    if (!parsed) {
      setResult(emptyEndUserResult());
      setHasStoredWizard(false);
      return;
    }

    const { savedAt, ...wizard } = parsed;
    void savedAt;

    if (wizard.q1 === "partner_sales") {
      router.replace("/result/partner");
      return;
    }

    const scoringInput = wizardAnswersToScoringInput(wizard);
    setResult(computeResult(scoringInput));
    setHasStoredWizard(true);
  }, [router]);

  if (!result) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: SURFACE }}>
        <p className="text-slate-400">読み込み中…</p>
      </div>
    );
  }

  const matches = result.matchedSubsidies;
  const topMatch = matches[0];
  const gridMatches = matches.length > 0 ? matches.slice(1) : matches;
  const heroProgressPhrase =
    result.endUserHeroProgressPhrase ?? END_USER_HERO_FALLBACK_PHRASE;
  const cardContextLabel =
    result.subsidyCardContextLabel ?? SUBSIDY_CARD_CONTEXT_FALLBACK;

  return (
      <main className="min-h-screen font-body text-neutral-900" style={{ backgroundColor: SURFACE }}>
        <motion.section
          {...fade(0)}
          className="relative overflow-hidden py-16 md:py-24"
        >
          <Image
            src="/images/team-meeting.webp"
            alt=""
            fill
            priority
            className="object-cover"
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(105deg, rgba(15,32,39,0.88) 0%, rgba(15,32,39,0.72) 45%, rgba(44,83,100,0.35) 70%, rgba(0,198,255,0.14) 100%)",
            }}
            aria-hidden
          />

          <Link
            href="/"
            className="absolute right-4 top-4 z-30 rounded-md border border-white/25 bg-slate-950/45 px-3 py-2 text-sm font-medium text-white shadow-sm backdrop-blur-sm transition-colors hover:border-white/40 hover:bg-slate-950/60 sm:right-6 sm:top-5 md:right-8 md:top-6"
          >
            トップに戻る
          </Link>

          <div className="relative z-10 mx-auto max-w-[1536px] px-6 md:px-8">
            <div className="grid items-center gap-12 md:grid-cols-2 md:gap-16">
            <div>
              <span
                className="mb-6 inline-block rounded-sm px-4 py-1.5 text-xs font-bold tracking-wide text-white/90"
                style={{ backgroundColor: BRAND_PRIMARY }}
              >
                診断完了
              </span>
              <h1 className="mb-8 font-heading text-h1 font-bold leading-tight text-white">
                御社の{heroProgressPhrase}、
                <br />
                補助金で動かせます。
              </h1>
              <p className="mb-10 max-w-lg text-lg leading-loose text-white/75">
                ご回答いただいた経営課題をもとに、活用できる可能性のある制度と、具体的な次の一手をご提案します。
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/#footer-contact"
                  className="flex items-center gap-2 rounded px-8 py-4 text-base font-bold text-white shadow-sm transition-all hover:shadow-lg active:scale-[0.98]"
                  style={{ backgroundColor: BRAND_PRIMARY }}
                >
                  提携プログラムを見る
                  <ArrowRight className="h-5 w-5" aria-hidden />
                </Link>
                <Link
                  href="/check"
                  className="rounded border border-white/30 bg-white/10 px-8 py-4 text-base font-bold text-white backdrop-blur-sm transition-all hover:bg-white/20 active:scale-[0.98]"
                >
                  制度の詳細を確認する
                </Link>
              </div>
            </div>
            <div className="relative">
              {topMatch ? (
                <TopSubsidyReportCard
                  match={topMatch}
                  primary={BRAND_PRIMARY}
                  headingColor={BRAND_HEADING}
                  accentMuted={ACCENT_MUTED}
                  matchLabel="マッチ度"
                  detailHref="/#footer-contact"
                  contextLabel={cardContextLabel}
                />
              ) : (
                <HeroSubsidyEmptyCard
                  headingColor={BRAND_HEADING}
                  message="優先度の高い候補を表示できませんでした"
                  subMessage="診断の回答がないか、条件に合致する制度が見つかりませんでした。診断をやり直すか、お問い合わせください。"
                />
              )}
            </div>
            </div>
          </div>
        </motion.section>

        <motion.section {...fade(0.15)} className="py-20 md:py-24" style={{ backgroundColor: SURFACE }}>
          <div className="mx-auto max-w-[1536px] px-6 md:px-8">
            {!hasStoredWizard && (
              <p className="py-6 text-sm text-slate-600">
                診断の回答が見つかりませんでした。
                <Link
                  href="/check"
                  className="ml-1 font-bold text-[#00a8cc] underline underline-offset-4 hover:text-[#0f2027]"
                >
                  診断からやり直す
                </Link>
              </p>
            )}
            {hasStoredWizard && result.matchedSubsidies.length === 0 && (
              <p className="py-6 text-sm text-slate-600">
                条件に合う制度の候補が見つかりませんでした。お気軽にご相談ください。
              </p>
            )}
            <SubsidyBentoGrid
              matches={gridMatches}
              primary={BRAND_PRIMARY}
              primaryContainer={BRAND_PRIMARY_DARK}
              headingColor={BRAND_HEADING}
              accentMuted={ACCENT_MUTED}
              matchLabel="マッチ度"
              detailHref="/#footer-contact"
              cardContextLabel={cardContextLabel}
            />
          </div>
        </motion.section>

        <motion.section
          {...fade(0.25)}
          className="py-20 md:py-24"
          style={{ backgroundColor: SURFACE_LOW }}
        >
          <div className="mx-auto max-w-[1536px] px-6 md:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <p className="font-heading text-h2 font-bold italic leading-snug text-[#0f2027]">
                「ただの申請代行ではありません。
                <br />
                <span className="inline-block whitespace-nowrap">
                  経営課題から一緒に考えます。」
                </span>
              </p>
              <p className="mt-8 text-base leading-[1.75] text-slate-600 md:text-lg">
                補助金はゴールではなく、経営課題を前進させるための手段です。
                どの制度を、いつ、どう使うか——御社の状況を一緒に整理し、
                申請から採択後の実行まで、伴走パートナーとして支援します。
              </p>
            </div>
          </div>
        </motion.section>

        <motion.section {...fade(0.3)} className="py-20 md:py-24" style={{ backgroundColor: SURFACE }}>
          <div className="mx-auto max-w-[1536px] px-6 md:px-8">
            <h2 className="mb-12 text-center text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
              次のステップ
            </h2>
            <HorizontalProcessSteps
              steps={result.nextSteps}
              outlineColor={BRAND_HEADING}
              activeStepBg={BRAND_PRIMARY}
              titleColor={BRAND_HEADING}
            />
          </div>
        </motion.section>

        <motion.section
          {...fade(0.4)}
          className="relative overflow-hidden py-24 md:py-32"
        >
          <Image
            src="/images/subsidy-footer.jpg"
            alt=""
            fill
            className="object-cover"
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(15,32,39,0.55) 0%, rgba(44,83,100,0.42) 50%, rgba(15,32,39,0.52) 100%)",
            }}
            aria-hidden
          />

          <div className="relative z-10 mx-auto mt-[2cm] max-w-3xl px-6 text-center md:px-8">
            <h2 className="mb-8 font-heading text-h2 font-bold leading-tight text-white drop-shadow-md md:text-h1">
              その課題、一緒に動かしませんか。
            </h2>
            <p className="mx-auto mb-12 max-w-2xl text-lg leading-loose text-white/85 drop-shadow-sm">
              補助金は手段です。御社の経営課題を起点に、
              <br className="hidden sm:block" />
              使える制度の選定から採択後の実行まで、伴走パートナーとして支援します。
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row sm:gap-6">
              <Link
                href="/#footer-contact"
                className="rounded px-10 py-5 text-base font-bold text-[#0f2027] shadow-lg transition-all hover:bg-cyan-50 active:scale-[0.98]"
                style={{ backgroundColor: "#ffffff" }}
              >
                提携プログラムを見る
              </Link>
              <Link
                href="/check"
                className="rounded border-2 border-white/40 px-10 py-5 text-base font-bold text-white backdrop-blur-sm transition-all hover:bg-white/15 active:scale-[0.98]"
              >
                制度の詳細を確認する
              </Link>
            </div>
          </div>
        </motion.section>
      </main>
  );
}

export default function EndUserResultClient() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f0f9fc]">
          <p className="text-slate-400">読み込み中…</p>
        </div>
      }
    >
      <Inner />
    </Suspense>
  );
}

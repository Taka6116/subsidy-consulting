"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  DIAGNOSIS_STORAGE_KEY,
  type DiagnosisAnswers,
  parseStoredDiagnosis,
  summarizeAnswersForDisplay,
} from "@/lib/diagnosis-logic";

type Variant = "end-user" | "partner";

const EMOTIONAL_COPY_END_USER = {
  lead: "補助金・助成の活用が、一歩前に進むきっかけになるかもしれません。",
  main: "制度の情報だけでは、動き出しにくい——そんなときこそ、伴走できるパートナーがいると安心です。まずは御社の状況を一緒に整理しませんか。",
  support:
    "申請書類の準備や提出に加え、採択後の手続きや進め方についても、継続的に伴走いたします。",
} as const;

const EMOTIONAL_COPY_PARTNER = {
  main: "お客様の課題に、補助金という選択肢を添えられるかもしれません。提案資料の観点整理から、必要に応じた連携までご相談ください。",
  support:
    "制度の要点整理や、お客様向け説明の観点づくりなど、パートナー様の提案活動を後押しします。",
} as const;

export default function DiagnosisResultSummary({ variant }: { variant: Variant }) {
  const [data, setData] = useState<DiagnosisAnswers | null>(null);

  useEffect(() => {
    const raw =
      typeof window !== "undefined"
        ? sessionStorage.getItem(DIAGNOSIS_STORAGE_KEY)
        : null;
    const parsed = parseStoredDiagnosis(raw);
    if (parsed) {
      const { savedAt: _s, ...rest } = parsed;
      setData(rest);
    }
  }, []);

  const mismatchPartner = variant === "partner" && data && data.q1 !== "partner_sales";
  const mismatchEndUser = variant === "end-user" && data && data.q1 === "partner_sales";

  const lines = data ? summarizeAnswersForDisplay(data).lines : [];
  const showSummaryBlock = Boolean(data && !mismatchPartner && !mismatchEndUser && lines.length > 0);

  return (
    <div className="mx-auto max-w-container px-4 py-10 sm:px-6 md:px-8">
      {mismatchPartner && (
        <div className="mb-8 rounded-card border border-amber-200 bg-amber-50 px-4 py-3 text-small text-neutral-800">
          診断では「自社・顧客の両方」またはエンドユーザー向けの回答でした。一般向けの結果は
          <Link
            href="/result/end-user"
            className="mx-1 font-medium text-primary-700 underline hover:text-primary-500"
          >
            こちら
          </Link>
          をご確認ください。
        </div>
      )}

      {mismatchEndUser && (
        <div className="mb-8 rounded-card border border-primary-200 bg-primary-50 px-4 py-3 text-small text-neutral-800">
          診断では「取引先・顧客への提案」が近い回答でした。パートナー向けの案内は
          <Link
            href="/result/partner"
            className="mx-1 font-medium text-primary-700 underline hover:text-primary-500"
          >
            こちら
          </Link>
          をご覧ください。
        </div>
      )}

      {showSummaryBlock && variant === "end-user" && (
        <section
          className="mb-10 rounded-2xl border border-accent-200/60 bg-gradient-to-br from-accent-50 via-white to-primary-50 px-6 py-7 shadow-sm sm:px-8 sm:py-8"
          aria-labelledby="result-emotional-heading"
        >
          <h2 id="result-emotional-heading" className="sr-only">
            ご案内メッセージ
          </h2>
          <p className="mb-3 text-body font-medium text-primary-900">{EMOTIONAL_COPY_END_USER.lead}</p>
          <p className="text-body leading-loose text-neutral-800">{EMOTIONAL_COPY_END_USER.main}</p>
          <p className="mt-4 text-small leading-relaxed text-neutral-600">{EMOTIONAL_COPY_END_USER.support}</p>
        </section>
      )}

      {showSummaryBlock && variant === "partner" && (
        <section
          className="mb-10 rounded-2xl border border-primary-200/60 bg-gradient-to-br from-primary-50 via-white to-accent-50/80 px-6 py-7 shadow-sm sm:px-8 sm:py-8"
          aria-labelledby="result-emotional-heading-partner"
        >
          <h2 id="result-emotional-heading-partner" className="sr-only">
            ご案内メッセージ
          </h2>
          <p className="text-body leading-loose text-neutral-800">{EMOTIONAL_COPY_PARTNER.main}</p>
          <p className="mt-4 text-small leading-relaxed text-neutral-600">{EMOTIONAL_COPY_PARTNER.support}</p>
        </section>
      )}

      {showSummaryBlock && (
        <section className="mb-10 rounded-card border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-heading text-h3 font-bold text-primary-900">入力内容の要約</h2>
          <ul className="space-y-3 text-body text-neutral-700">
            {lines.map((row) => (
              <li key={row.label}>
                <span className="font-medium text-neutral-900">{row.label}</span>
                <span className="mx-2 text-neutral-400">:</span>
                {row.value}
              </li>
            ))}
          </ul>
        </section>
      )}

      {!data && (
        <p className="mb-8 text-body text-neutral-600">
          診断の回答が見つかりませんでした。はじめからお試しください。
        </p>
      )}

      <p className="mb-10 text-caption leading-loose text-neutral-500">
        本診断は目安であり、申請可否・採択可否は各制度の公募要領および審査によります。
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Link
          href="/#footer-contact"
          className="inline-flex justify-center rounded-card bg-accent-500 px-6 py-3 text-center text-body font-medium text-white shadow-sm hover:bg-accent-600"
        >
          お問い合わせ・ご相談
        </Link>
        <Link
          href="/diagnosis"
          className="inline-flex justify-center rounded-card border-2 border-neutral-200 bg-white px-6 py-3 text-center text-body font-medium text-neutral-800 hover:bg-neutral-50"
        >
          もう一度診断する
        </Link>
        <Link
          href="/"
          className="inline-flex justify-center rounded-card border-2 border-neutral-200 bg-white px-6 py-3 text-center text-body font-medium text-neutral-800 hover:bg-neutral-50"
        >
          トップへ戻る
        </Link>
      </div>
    </div>
  );
}

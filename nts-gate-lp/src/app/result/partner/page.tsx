import type { Metadata } from "next";
import DiagnosisResultSummary from "@/components/diagnosis/DiagnosisResultSummary";

export const metadata: Metadata = {
  title: "診断結果（パートナー・提案企業向け）| 日本提携支援",
  description:
    "取引先・顧客への補助金提案を検討されている企業様向けのご案内です。",
};

export default function PartnerResultPage() {
  return (
    <main className="min-h-screen bg-[#faf8f6]">
      <div className="border-b border-neutral-200/80 bg-white/90 px-4 py-8 sm:px-6 md:px-8">
        <div className="mx-auto max-w-container">
          <h1 className="font-heading text-h1 font-bold text-primary-900">
            診断結果
          </h1>
          <p className="mt-3 max-w-2xl text-body leading-relaxed text-neutral-600">
            <strong className="font-medium text-neutral-800">お客様への提案・提携</strong>
            に補助金・助成の視点を組み込めるかもしれません。回答の要約と、次のご検討のヒントをご覧ください。
          </p>
        </div>
      </div>
      <DiagnosisResultSummary variant="partner" />
    </main>
  );
}

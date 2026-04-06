import type { Metadata } from "next";
import DiagnosisResultSummary from "@/components/diagnosis/DiagnosisResultSummary";

export const metadata: Metadata = {
  title: "診断結果（ご利用者向け）| 日本提携支援",
  description:
    "無料診断の結果に基づくご案内です。申請可否は各制度の公募要領によります。",
};

export default function EndUserResultPage() {
  return (
    <main className="min-h-screen bg-[#faf8f6]">
      <div className="border-b border-neutral-200/80 bg-white/90 px-4 py-8 sm:px-6 md:px-8">
        <div className="mx-auto max-w-container">
          <h1 className="font-heading text-h1 font-bold text-primary-900">
            診断結果
          </h1>
          <p className="mt-3 max-w-2xl text-body leading-relaxed text-neutral-600">
            補助金・助成金を<strong className="font-medium text-neutral-800">御社の課題解決に活かせる可能性</strong>
            があります。以下に回答の要約と、次の一歩のご案内をまとめました。
          </p>
        </div>
      </div>
      <DiagnosisResultSummary variant="end-user" />
    </main>
  );
}

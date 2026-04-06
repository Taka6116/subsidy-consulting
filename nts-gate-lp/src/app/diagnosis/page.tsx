import type { Metadata } from "next";
import DiagnosisWizard from "@/components/diagnosis/DiagnosisWizard";

export const metadata: Metadata = {
  title: "無料診断（4問）| 経営課題と補助金のご利用イメージ — 日本提携支援",
  description:
    "約1分の4つの質問で、補助金の活用イメージと関心テーマを整理します。個人情報の入力は不要です。",
};

export default function DiagnosisPage() {
  return (
    <main className="min-h-screen bg-[#faf8f6]">
      <DiagnosisWizard />
    </main>
  );
}

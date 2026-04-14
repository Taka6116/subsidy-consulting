import type { Metadata } from "next";
import Link from "next/link";
import CheckPortalHeader from "@/components/check/CheckPortalHeader";
import ConsultForm from "./ConsultForm";

export const metadata: Metadata = {
  title: "専門家への相談（デモ） | 日本提携支援",
  description: "補助金・支援制度に関するご相談フォーム（デモ）です。",
};

export default function ConsultPage() {
  return (
    <div className="check-portal min-h-screen font-body text-portal-on-surface">
      <CheckPortalHeader audience="end_user" />
      <main className="min-h-[calc(100vh-5rem)] px-6 pb-16 pt-24">
        <div className="mx-auto max-w-2xl">
          <h1 className="font-heading text-h1 font-bold leading-tight text-white">
            無料相談・お問い合わせ
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-white">
            ご希望の内容をご記入ください。担当者よりご連絡いたします。
          </p>
          <div className="mt-10">
            <ConsultForm />
          </div>
        </div>
      </main>
      <footer className="border-t border-[rgba(0,198,255,0.1)] bg-[rgba(0,0,0,0.2)] py-8">
        <div className="mx-auto max-w-5xl px-6 text-center text-caption">
          <Link
            href="/"
            className="font-medium text-[#7ed9f5] underline-offset-4 hover:text-[#00c6ff] hover:underline"
          >
            日本提携支援 トップへ戻る
          </Link>
        </div>
      </footer>
    </div>
  );
}

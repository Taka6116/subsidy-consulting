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
    <div
      className="min-h-screen font-body"
      style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}
    >
      <CheckPortalHeader audience="end_user" />
      <main className="min-h-[calc(100vh-5rem)] px-6 pb-24 pt-28 md:pt-32">
        <div className="mx-auto max-w-2xl">
          <p className="label-section mb-3">Contact</p>
          <h1 className="font-heading text-3xl font-bold leading-tight text-[var(--text-primary)] md:text-4xl">
            無料相談・お問い合わせ
          </h1>
          <p className="mt-4 text-base leading-relaxed text-[var(--text-secondary)]">
            ご希望の内容をご記入ください。担当者よりご連絡いたします。
          </p>
          <div className="mt-10">
            <ConsultForm />
          </div>
        </div>
      </main>
      <footer className="border-t border-[var(--border-subtle)] bg-white py-8">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <Link
            href="/"
            className="text-sm font-medium text-[var(--accent-navy)] underline-offset-4 transition hover:underline"
          >
            日本提携支援 トップへ戻る
          </Link>
        </div>
      </footer>
    </div>
  );
}

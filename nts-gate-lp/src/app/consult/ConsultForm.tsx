"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}
import SubsidyLegalDisclaimer from "@/components/shared/SubsidyLegalDisclaimer";

const INPUT_CLASSES =
  "mt-2 w-full rounded-lg border border-[var(--border-subtle)] bg-white px-4 py-3 text-base text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--accent-navy)] focus:ring-2 focus:ring-[rgba(26,76,142,0.15)]";

const LABEL_CLASSES = "block text-sm font-bold text-[var(--text-primary)]";

export default function ConsultForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      company: (form.elements.namedItem("company") as HTMLInputElement).value || undefined,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value,
      source: "consult",
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        setErrorMsg(json.error ?? "送信に失敗しました。しばらく後でお試しください。");
        return;
      }
      if (typeof window !== "undefined") {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ event: "consult_complete" });
      }
      router.push("/thanks");
    } catch {
      setErrorMsg("通信エラーが発生しました。しばらく後でお試しください。");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {/* 相談範囲の注意書き */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="mb-2 text-sm font-bold text-slate-800">ご相談範囲について</p>
        <p className="text-sm leading-relaxed text-slate-600">
          初回相談では、補助金の対象可能性、活用方針、申請前に整理すべき情報を確認します。
          申請書類の作成・提出等、資格者が行うべき業務が必要な場合は、提携行政書士法人等をご案内します。
          補助金の採択を保証するものではありません。
        </p>
      </div>

    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-2xl border border-[var(--border-subtle)] bg-white p-6 shadow-[var(--shadow-card)] sm:p-8"
    >
      <div>
        <label htmlFor="consult-name" className={LABEL_CLASSES}>
          お名前<span className="ml-1 text-[#d94a4a]">*</span>
        </label>
        <input
          id="consult-name"
          name="name"
          type="text"
          required
          autoComplete="name"
          className={INPUT_CLASSES}
        />
      </div>
      <div>
        <label htmlFor="consult-email" className={LABEL_CLASSES}>
          メールアドレス<span className="ml-1 text-[#d94a4a]">*</span>
        </label>
        <input
          id="consult-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={INPUT_CLASSES}
        />
      </div>
      <div>
        <label htmlFor="consult-company" className={LABEL_CLASSES}>
          会社名（任意）
        </label>
        <input
          id="consult-company"
          name="company"
          type="text"
          autoComplete="organization"
          className={INPUT_CLASSES}
        />
      </div>
      <div>
        <label htmlFor="consult-message" className={LABEL_CLASSES}>
          お問い合わせ内容<span className="ml-1 text-[#d94a4a]">*</span>
        </label>
        <textarea
          id="consult-message"
          name="message"
          rows={5}
          required
          className={`${INPUT_CLASSES} resize-y`}
        />
      </div>
      {errorMsg && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMsg}
        </p>
      )}
      <div className="flex justify-center">
        <button
          type="submit"
          disabled={submitting}
          className="min-w-[220px] rounded-full bg-gradient-to-r from-[#1a56db] via-[#1368d8] to-[#0e4fb5] px-8 py-4 text-base font-bold text-white shadow-[0_4px_16px_rgba(26,86,219,0.35)] transition-all hover:brightness-110 hover:shadow-[0_6px_22px_rgba(26,86,219,0.45)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a56db] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? "送信中…" : "補助金活用について相談する"}
        </button>
      </div>
    </form>

      <SubsidyLegalDisclaimer variant="short" className="mt-4" />
    </>
  );
}

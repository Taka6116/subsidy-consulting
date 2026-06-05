"use client";

import { useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import SubsidyLegalDisclaimer from "@/components/shared/SubsidyLegalDisclaimer";

const INPUT_CLASSES =
  "mt-2 w-full rounded-lg border border-[var(--border-subtle)] bg-white px-4 py-3 text-base text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--accent-navy)] focus:ring-2 focus:ring-[rgba(26,76,142,0.15)]";

const LABEL_CLASSES = "block text-sm font-bold text-[var(--text-primary)]";

export default function ConsultForm() {
  const params = useSearchParams();
  const [sent, setSent] = useState(params.get("preview") === "thanks");
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
      setSent(true);
    } catch {
      setErrorMsg("通信エラーが発生しました。しばらく後でお試しください。");
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="space-y-6">
        {/* ── サンクスカード ── */}
        <div className="relative overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-white p-8 shadow-[0_4px_24px_rgba(26,76,142,0.08)] sm:p-10">
          {/* Aurora 背景 */}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-20 blur-3xl"
            style={{ background: "radial-gradient(circle, #60a5fa 0%, #3b82f6 60%, transparent 100%)" }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full opacity-10 blur-2xl"
            style={{ background: "radial-gradient(circle, #818cf8 0%, #6366f1 60%, transparent 100%)" }}
          />

          <div className="relative flex flex-col items-center text-center">
            {/* チェックアイコン */}
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 ring-4 ring-emerald-100">
              <svg className="h-7 w-7 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>

            <p className="font-heading text-2xl font-bold text-[var(--text-primary)]">
              ありがとうございます！
            </p>
            <p className="mt-1 text-base font-medium text-[var(--accent-navy)]">
              無料相談のお申し込みを受け付けました
            </p>
            <p className="mt-4 text-sm leading-relaxed text-[var(--text-secondary)]">
              ご入力いただいた内容を確認のうえ、担当者より数日以内にご連絡いたします。<br />
              確認メールもお送りしていますので、あわせてご確認ください。
            </p>
          </div>
        </div>

        {/* ── 補助金プラットフォーム CTA ── */}
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_4px_24px_rgba(26,76,142,0.07)]">
          {/* プラットフォーム画像 */}
          <div className="group relative cursor-pointer overflow-hidden">
            <Link href="/subsidies" tabIndex={-1} aria-hidden>
              <Image
                src="/platform-preview.png"
                alt="補助金プラットフォームのスクリーンショット"
                width={1200}
                height={630}
                className="w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
                priority
              />
              {/* オーバーレイ */}
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,30,80,0.55)] via-transparent to-transparent" />
              {/* 画像上バッジ */}
              <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 shadow-sm backdrop-blur-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="text-xs font-semibold text-slate-700">200件以上の補助金を随時更新中</span>
              </div>
              {/* 画像下テキスト */}
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-lg font-bold text-white drop-shadow">
                  補助金情報を、探す時代を終わらせ"最速"で届ける
                </p>
              </div>
            </Link>
          </div>

          {/* テキスト＋ CTA エリア */}
          <div className="flex flex-col items-center p-6 text-center sm:p-8">
            <h2 className="font-heading text-lg font-bold text-[var(--text-primary)]">
              担当者を待つ間に、使える補助金を探してみませんか？
            </h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-[var(--text-secondary)]">
              業種・地域・規模から絞り込めるプラットフォームで、
              あなたに合った補助金をすぐに見つけられます。
              申請中の補助金や締切カレンダーも一目で確認できます。
            </p>

            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/subsidies"
                className="inline-flex min-w-[180px] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#1a56db] via-[#1368d8] to-[#0e4fb5] px-6 py-3 text-sm font-bold text-white shadow-[0_4px_16px_rgba(26,86,219,0.35)] transition hover:brightness-110"
              >
                補助金プラットフォームへ
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <Link
                href="https://subsidy-consulting-nts.vercel.app/check"
                className="inline-flex min-w-[180px] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#059669] via-[#10b981] to-[#34d399] px-6 py-3 text-sm font-bold text-white shadow-[0_4px_16px_rgba(16,185,129,0.35)] transition hover:brightness-110"
              >
                無料診断を試す
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
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

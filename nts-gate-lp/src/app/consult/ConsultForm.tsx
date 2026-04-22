"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

const INPUT_CLASSES =
  "mt-2 w-full rounded-lg border border-[var(--border-subtle)] bg-white px-4 py-3 text-base text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--accent-navy)] focus:ring-2 focus:ring-[rgba(26,76,142,0.15)]";

const LABEL_CLASSES = "block text-sm font-bold text-[var(--text-primary)]";

export default function ConsultForm() {
  const [sent, setSent] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSent(true);
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-[var(--border-subtle)] bg-white p-6 shadow-[var(--shadow-card)] sm:p-8">
        <p className="font-heading text-lg font-bold text-[var(--text-primary)]">
          お問い合わせ内容を受け付けました
        </p>
        <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
          内容は保存されました（デモ表示）。本番ではメール送信やCRM連携などに接続できます。
        </p>
        <Link
          href="/check"
          className="mt-6 inline-flex items-center justify-center rounded-full border-2 border-[var(--accent-navy)] bg-white px-6 py-3 text-sm font-bold text-[var(--accent-navy)] transition hover:bg-[var(--accent-navy)] hover:text-white"
        >
          補助金照会に戻る
        </Link>
      </div>
    );
  }

  return (
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
      <button
        type="submit"
        className="w-full rounded-full bg-[var(--accent-navy)] px-6 py-4 text-base font-bold text-white shadow-sm transition-all hover:bg-[#1557a8] hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-navy)] sm:w-auto sm:min-w-[220px]"
      >
        送信する
      </button>
    </form>
  );
}

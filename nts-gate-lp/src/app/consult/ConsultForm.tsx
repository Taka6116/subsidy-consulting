"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

export default function ConsultForm() {
  const [sent, setSent] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSent(true);
  }

  if (sent) {
    return (
      <div className="rounded-xl border border-white/10 bg-white p-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)] sm:p-8">
        <p className="font-heading text-lg font-bold text-[#0F2027]">お問い合わせ内容を受け付けました</p>
        <p className="mt-3 text-sm leading-relaxed text-[#5a7080]">
          内容は保存されました（デモ表示）。本番ではメール送信やCRM連携などに接続できます。
        </p>
        <Link
          href="/check"
          className="mt-6 inline-flex rounded-full border-2 border-[rgba(0,198,255,0.35)] bg-white/5 px-6 py-3 text-sm font-bold text-[#7ed9f5] backdrop-blur-sm transition-colors hover:border-[#00c6ff] hover:bg-white/10 hover:text-[#00c6ff]"
        >
          補助金照会に戻る
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-xl border border-white/10 bg-white p-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)] sm:p-8"
    >
      <div>
        <label htmlFor="consult-name" className="block text-sm font-bold text-[#1a3a4a]">
          お名前<span className="ml-1 text-portal-error">*</span>
        </label>
        <input
          id="consult-name"
          name="name"
          type="text"
          required
          autoComplete="name"
          className="mt-2 w-full rounded-lg border border-[#d0dde5] bg-[#f8fbfd] px-4 py-3 text-body text-[#0F2027] outline-none transition-colors focus:border-[#00a0cc] focus:ring-2 focus:ring-[#00a0cc]/20"
        />
      </div>
      <div>
        <label htmlFor="consult-email" className="block text-sm font-bold text-[#1a3a4a]">
          メールアドレス<span className="ml-1 text-portal-error">*</span>
        </label>
        <input
          id="consult-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mt-2 w-full rounded-lg border border-[#d0dde5] bg-[#f8fbfd] px-4 py-3 text-body text-[#0F2027] outline-none transition-colors focus:border-[#00a0cc] focus:ring-2 focus:ring-[#00a0cc]/20"
        />
      </div>
      <div>
        <label htmlFor="consult-company" className="block text-sm font-bold text-[#1a3a4a]">
          会社名（任意）
        </label>
        <input
          id="consult-company"
          name="company"
          type="text"
          autoComplete="organization"
          className="mt-2 w-full rounded-lg border border-[#d0dde5] bg-[#f8fbfd] px-4 py-3 text-body text-[#0F2027] outline-none transition-colors focus:border-[#00a0cc] focus:ring-2 focus:ring-[#00a0cc]/20"
        />
      </div>
      <div>
        <label htmlFor="consult-message" className="block text-sm font-bold text-[#1a3a4a]">
          お問い合わせ内容<span className="ml-1 text-portal-error">*</span>
        </label>
        <textarea
          id="consult-message"
          name="message"
          rows={5}
          required
          className="mt-2 w-full resize-y rounded-lg border border-[#d0dde5] bg-[#f8fbfd] px-4 py-3 text-body text-[#0F2027] outline-none transition-colors focus:border-[#00a0cc] focus:ring-2 focus:ring-[#00a0cc]/20"
        />
      </div>
      <button
        type="submit"
        className="w-full rounded-full bg-[#00c6ff] px-6 py-4 text-base font-bold text-[#0b1a22] shadow-sm transition-all hover:bg-[#00b0e6] hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00c6ff] sm:w-auto"
      >
        送信する
      </button>
    </form>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import CheckPortalHeader from "@/components/check/CheckPortalHeader";
import Image from "next/image";

export const metadata: Metadata = {
  title: "お申し込みありがとうございます | 日本提携支援",
  description: "無料相談のお申し込みを受け付けました。担当者よりご連絡いたします。",
  robots: { index: false },
};

export default function ThanksPage() {
  return (
    <div
      className="min-h-screen font-body"
      style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}
    >
      <CheckPortalHeader audience="end_user" />
      <main className="min-h-[calc(100vh-5rem)] px-6 pb-24 pt-28 md:pt-32">
        <div className="mx-auto max-w-2xl space-y-6">

          {/* サンクスカード */}
          <div className="relative overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-white p-8 shadow-[0_4px_24px_rgba(26,76,142,0.08)] sm:p-10">
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
                ご入力いただいた内容を確認のうえ、担当者より数日以内にご連絡いたします。
              </p>
            </div>
          </div>

          {/* 補助金プラットフォーム CTA */}
          <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_4px_24px_rgba(26,76,142,0.07)]">
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
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,30,80,0.55)] via-transparent to-transparent" />
                <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 shadow-sm backdrop-blur-sm">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span className="text-xs font-semibold text-slate-700">200件以上の補助金を随時更新中</span>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-lg font-bold text-white drop-shadow">
                    補助金情報を、探す時代を終わらせ&quot;最速&quot;で届ける
                  </p>
                </div>
              </Link>
            </div>

            <div className="flex flex-col items-center p-6 text-center sm:p-8">
              <h2 className="font-heading text-lg font-bold text-[var(--text-primary)]">
                担当者を待つ間に、使える補助金を探してみませんか？
              </h2>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-[var(--text-secondary)]">
                業種・地域・規模から絞り込めるプラットフォームで、
                あなたに合った補助金をすぐに見つけられます。
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
                  href="https://subsidy.nihon-teikei.co.jp/check"
                  className="inline-flex min-w-[180px] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#059669] via-[#10b981] to-[#34d399] px-6 py-3 text-sm font-bold text-white shadow-[0_4px_16px_rgba(16,185,129,0.35)] transition hover:brightness-110"
                >
                  無料診断を試す
                </Link>
              </div>
            </div>
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

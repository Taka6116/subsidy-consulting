"use client";

import Link from "next/link";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ja">
      <body className="flex min-h-screen flex-col items-center justify-center bg-[#f8faff] px-4 font-sans">
        <div className="text-center">
          <p className="text-6xl font-black text-[#0e357f]">500</p>
          <h1 className="mt-4 text-xl font-bold text-[#111827]">
            エラーが発生しました
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-neutral-500">
            申し訳ありません。一時的なエラーが発生しました。
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={reset}
              className="rounded-xl bg-[#0e357f] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#1a4fa0]"
            >
              再試行する
            </button>
            <Link
              href="/"
              className="rounded-xl border border-[#0e357f]/30 bg-white px-6 py-3 text-sm font-bold text-[#0e357f] transition hover:bg-[#eff6ff]"
            >
              トップページへ
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}

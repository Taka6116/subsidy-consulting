// ========== [NEW 2026-04-30] Exit Intent モーダル ==========
"use client";

import { useEffect, useState } from "react";

export default function ExitIntentModal({ subsidyId }: { subsidyId: string }) {
  const [show, setShow] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    // セッション内で一度表示済みなら出さない
    if (sessionStorage.getItem("exit-intent-shown")) {
      setShown(true);
      return;
    }

    const onMouseLeave = (e: MouseEvent) => {
      if (e.clientY < 0 && !shown) {
        setShow(true);
        setShown(true);
        sessionStorage.setItem("exit-intent-shown", "1");
      }
    };

    document.addEventListener("mouseleave", onMouseLeave);
    return () => document.removeEventListener("mouseleave", onMouseLeave);
  }, [shown]);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) setShow(false); }}
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl md:p-10">
        <button
          onClick={() => setShow(false)}
          className="absolute right-4 top-4 text-slate-400 transition hover:text-slate-600"
          aria-label="閉じる"
        >
          ✕
        </button>

        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          Wait
        </p>
        <h2 className="mt-2 text-2xl font-bold leading-tight text-slate-900 md:text-3xl">
          対象か分からないまま、
          <br />
          閉じてしまいますか？
        </h2>
        <p className="mt-4 text-sm text-slate-600">
          1分の診断で、自社が対象になり得るか確認できます。
          メアド登録だけ残して去ることもできます。
        </p>

        <div className="mt-6 space-y-3">
          <a
            href={`/check?from=grant_${subsidyId}_exit`}
            className="block w-full rounded-full bg-amber-500 px-6 py-3 text-center font-semibold text-white shadow-lg shadow-amber-500/30 transition hover:bg-amber-600"
          >
            1分で診断する
          </a>

          <form action="/api/subscribe" method="POST" className="flex gap-2">
            <input type="hidden" name="source" value="exit-intent" />
            <input type="hidden" name="subsidyId" value={subsidyId} />
            <input
              type="email"
              name="email"
              required
              placeholder="email@example.com"
              className="flex-1 rounded-full border border-slate-300 px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              登録
            </button>
          </form>

          <button
            onClick={() => setShow(false)}
            className="block w-full text-center text-xs text-slate-400 transition hover:text-slate-600"
          >
            もう一度読む
          </button>
        </div>
      </div>
    </div>
  );
}

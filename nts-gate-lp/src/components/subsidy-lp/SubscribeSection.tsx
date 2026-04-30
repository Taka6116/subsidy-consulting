export default function SubscribeSection({ subsidyId }: { subsidyId: string }) {
  return (
    <section className="bg-slate-100 py-16 md:py-20">
      {/* ========== [NEW 2026-04-30] 次回公募メアド登録CTA ========== */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200 md:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Newsletter
          </p>
          <h2 className="mt-2 text-2xl font-black leading-tight tracking-[-0.02em] text-slate-900 md:text-3xl">
            次回の補助金情報、
            <br />
            業界最速でお届けします。
          </h2>
          <p className="mt-4 text-sm font-medium leading-7 text-slate-600 md:text-base">
            新しい補助金が公募開始した瞬間、要点をまとめて配信。該当する可能性のある制度だけを選んでお送りします。
          </p>

          {/* TODO: /api/subscribe のRoute Handlerを実装。SES経由で送信、Subscribers テーブルにinsert */}
          <form
            action="/api/subscribe"
            method="POST"
            className="mt-6 flex flex-col gap-3 sm:flex-row"
          >
            <input type="hidden" name="source" value={`subsidy_lp_${subsidyId}`} />
            <input
              type="email"
              name="email"
              required
              placeholder="email@example.com"
              className="min-h-12 flex-1 rounded-full border border-slate-300 px-5 py-3 text-sm focus:border-slate-900 focus:outline-none"
            />
            <button
              type="submit"
              className="min-h-12 rounded-full bg-slate-900 px-6 py-3 text-sm font-extrabold text-white transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
            >
              登録する（無料）
            </button>
          </form>

          <p className="mt-3 text-xs text-slate-400">
            ※ いつでも配信停止できます。営業メールは送りません。
          </p>
        </div>
      </div>
    </section>
  );
}

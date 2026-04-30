// ========== [NEW 2026-04-30] 記事下部 温度別マルチCTA ==========

type Props = {
  /** 記事に紐づく補助金の診断ページURL。未指定の場合は /diagnosis */
  diagnosisHref?: string;
  /** 補助金名（メール登録文言に使う） */
  subsidyName?: string;
};

export function ArticleCTA({
  diagnosisHref = "/diagnosis",
  subsidyName,
}: Props) {
  return (
    <section className="my-12 overflow-hidden rounded-2xl bg-slate-900 px-8 py-10 text-white">
      <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-slate-400">
        Next Step
      </p>
      <h2 className="mb-2 text-xl font-bold leading-tight md:text-2xl">
        最初の一歩は、軽くて構いません。
      </h2>
      <p className="mb-8 text-sm leading-relaxed text-slate-300">
        対象かどうかの確認だけでも、1分でできます。
      </p>

      {/* CTA 3択 */}
      <div className="flex flex-col gap-3 sm:flex-row">
        {/* 温：診断（メイン） */}
        <a
          href={diagnosisHref}
          className="flex-1 rounded-full bg-amber-500 px-6 py-3.5 text-center text-sm font-semibold text-white shadow-lg shadow-amber-500/30 transition hover:bg-amber-400 active:scale-[0.98]"
        >
          1分で対象か診断する
        </a>

        {/* 冷：一覧に戻る */}
        <a
          href="/subsidies"
          className="flex-1 rounded-full border border-white/20 px-6 py-3.5 text-center text-sm font-semibold text-white transition hover:bg-white/10 active:scale-[0.98]"
        >
          補助金一覧に戻る
        </a>

        {/* 熱：相談 */}
        <a
          href="/contact"
          className="flex-1 rounded-full bg-white px-6 py-3.5 text-center text-sm font-semibold text-slate-900 transition hover:bg-slate-100 active:scale-[0.98]"
        >
          無料相談を予約する
        </a>
      </div>

      {/* メアド登録 */}
      <div className="mt-8 border-t border-white/10 pt-6">
        <p className="mb-3 text-xs text-slate-400">
          {subsidyName ? `「${subsidyName}」` : "この補助金"}
          の次回公募開始を、メールでお知らせします。
        </p>
        <form
          action="/api/subscribe"
          method="POST"
          className="flex flex-col gap-2 sm:flex-row"
        >
          {/* TODO: subsidyId を props で受け取り、実際の値を入れる */}
          <input type="hidden" name="source" value="article-cta" />

          <input
            type="email"
            name="email"
            required
            placeholder="email@example.com"
            className="flex-1 rounded-full border border-white/20 bg-white/5 px-5 py-3 text-sm text-white placeholder:text-slate-500 focus:border-white/40 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-full bg-slate-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-600"
          >
            登録する（無料）
          </button>
        </form>
        <p className="mt-2 text-[11px] text-slate-500">
          ※ いつでも配信停止できます。
        </p>
      </div>
    </section>
  );
}

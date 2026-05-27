"use client";

// ========== 記事下部 Next Step CTA (リデザイン 2026-05) ==========

type Props = {
  diagnosisHref?: string;
};

export function ArticleCTA({
  diagnosisHref = "/diagnosis",
}: Props) {
  return (
    <section
      className="next-step-box relative my-12 overflow-hidden"
      style={{
        background: `
          radial-gradient(circle at 85% 10%, rgba(129, 140, 248, 0.35), transparent 34%),
          linear-gradient(135deg, #061B3A 0%, #123A6B 52%, #2F4FA3 100%)
        `,
        borderRadius: "20px",
        padding: "48px 56px",
        boxShadow: "0 24px 60px rgba(15, 23, 42, 0.18)",
        border: "1px solid rgba(255, 255, 255, 0.12)",
      }}
    >
      {/* 右上の光のにじみ */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          width: "420px",
          height: "420px",
          right: "-120px",
          top: "-160px",
          background: "radial-gradient(circle, rgba(147, 197, 253, 0.32), transparent 65%)",
          pointerEvents: "none",
        }}
      />
      {/* 左上グロス */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 26%, transparent 100%)",
          pointerEvents: "none",
          borderRadius: "20px",
        }}
      />

      {/* 内容 */}
      <div className="relative z-10">
        {/* 小見出し */}
        <p
          className="mb-2 text-xs font-bold uppercase"
          style={{ color: "#9CCBFF", letterSpacing: "0.16em" }}
        >
          NEXT STEP
        </p>

        {/* タイトル */}
        <h2
          className="mb-2 text-xl font-bold leading-tight md:text-2xl"
          style={{ color: "#FFFFFF" }}
        >
          最後の一歩は、怖くて構いません。
        </h2>
        <p
          className="mb-8 text-sm leading-relaxed"
          style={{ color: "rgba(255,255,255,0.82)" }}
        >
          あなたの不安や疑問が、きっと解消できます。
        </p>

        {/* CTA 3択 */}
        <div className="next-step-cta-list flex flex-col gap-3 sm:flex-row">
          {/* Primary: 無料相談 */}
          <a
            href="/consult"
            className="next-step-button flex-1 rounded-full px-6 py-3.5 text-center text-sm font-bold text-white shadow-lg transition hover:-translate-y-px hover:brightness-110 active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, #F6C343 0%, #F59E0B 48%, #EA580C 100%)",
              boxShadow: "0 12px 28px rgba(245, 158, 11, 0.32)",
            }}
          >
            今すぐ無料相談する &rsaquo;
          </a>

          {/* Secondary: 一覧に戻る */}
          <a
            href="/subsidies"
            className="next-step-button flex-1 rounded-full px-6 py-3.5 text-center text-sm font-bold transition hover:-translate-y-px hover:brightness-95 active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, #FFFFFF 0%, #F3F7FB 100%)",
              color: "#0B2A4A",
              boxShadow: "0 6px 18px rgba(15, 23, 42, 0.14)",
            }}
          >
            補助金一覧へ戻る
          </a>

          {/* Tertiary: 診断 */}
          <a
            href={diagnosisHref}
            className="next-step-button flex-1 rounded-full px-6 py-3.5 text-center text-sm font-bold text-white transition hover:-translate-y-px hover:brightness-110 active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, #60A5FA 0%, #2563EB 52%, #1E3A8A 100%)",
              boxShadow: "0 8px 22px rgba(37, 99, 235, 0.28)",
            }}
          >
            自社対象の補助金を調べる
          </a>
        </div>

        {/* まずは気軽に相談エリア */}
        <div
          className="mt-8 pt-6"
          style={{ borderTop: "1px solid rgba(255,255,255,0.12)" }}
        >
          <p
            className="mb-3 text-center text-xs"
            style={{ color: "rgba(255,255,255,0.58)" }}
          >
            まずは気軽に相談したい方へ
          </p>
          <form
            action="/api/subscribe"
            method="POST"
            className="flex flex-col gap-2 sm:flex-row"
          >
            <input type="hidden" name="source" value="article-cta" />
            <input
              type="text"
              name="message"
              placeholder="ご相談内容や気になることを入力してください"
              className="flex-1 rounded-full px-5 py-3 text-sm text-white placeholder:text-white/48 focus:outline-none focus:ring-2 focus:ring-white/30"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.16)",
                color: "#FFFFFF",
              }}
            />
            <button
              type="submit"
              className="rounded-full px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-px hover:brightness-110"
              style={{
                background: "linear-gradient(135deg, #315EA8 0%, #123A6B 100%)",
                boxShadow: "0 6px 18px rgba(18, 58, 107, 0.36)",
              }}
            >
              相談する（無料）
            </button>
          </form>
          <p
            className="mt-2 flex items-center gap-1 text-[11px]"
            style={{ color: "rgba(255,255,255,0.48)" }}
          >
            <svg viewBox="0 0 16 16" className="h-3 w-3 shrink-0" fill="currentColor" aria-hidden>
              <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 3a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm0 4.5a4 4 0 0 1 3.272 1.694.75.75 0 0 1-.61 1.18H5.34a.75.75 0 0 1-.613-1.178A4 4 0 0 1 8 8.5z" />
            </svg>
            ご入力いただいた内容は、適切に管理・保護いたします。
          </p>
        </div>
      </div>

      {/* SP 対応スタイル */}
      <style>{`
        @media (max-width: 768px) {
          .next-step-box {
            padding: 32px 20px !important;
            border-radius: 18px !important;
          }
          .next-step-cta-list {
            flex-direction: column !important;
            gap: 12px !important;
          }
          .next-step-button {
            width: 100% !important;
          }
        }
      `}</style>
    </section>
  );
}

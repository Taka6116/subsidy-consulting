// ========== [NEW 2026-04-30] コンサルタントコメント枠 ==========

type Props = {
  /** AI生成 or 手入力のコメントテキスト。未指定の場合はデフォルトを表示 */
  comment?: string;
  /** 担当者名。未指定の場合は「NTS 補助金サポートチーム」 */
  author?: string;
};

const DEFAULT_COMMENT =
  "この補助金は申請書の事業計画の記載内容が採否を大きく左右します。" +
  "「自社が対象か分からない」という段階でも、まずご相談ください。" +
  "対象可否の確認から、申請書の設計まで、無料でサポートします。";

export function ConsultantComment({
  comment = DEFAULT_COMMENT,
  author = "NTS 補助金サポートチーム",
}: Props) {
  return (
    <aside className="my-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <span className="rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold tracking-wide text-white">
          NTS
        </span>
        <span className="text-sm font-semibold text-slate-700">
          コンサルタントからひとこと
        </span>
      </div>

      <blockquote className="border-l-2 border-slate-300 pl-4">
        <p className="text-sm leading-relaxed text-slate-600">「{comment}」</p>
      </blockquote>

      <p className="mt-4 text-xs text-slate-400">{author}</p>
    </aside>
  );
}

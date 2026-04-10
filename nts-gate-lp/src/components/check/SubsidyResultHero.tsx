import Link from "next/link";
import { Lightbulb, ListChecks, TrendingUp } from "lucide-react";
import type { SubsidyInsightCard } from "@/lib/ai/bedrockSubsidyMatch";
import type { MatchedSubsidyPreview } from "@/lib/subsidyCheckMocks";

type Props = {
  item: MatchedSubsidyPreview;
};

function eligibilityPair(item: MatchedSubsidyPreview): { label: string; text: string }[] {
  const industries =
    item.targetIndustries && item.targetIndustries.length > 0
      ? item.targetIndustries.slice(0, 4).join("、")
      : "";
  const regionLine = item.targetArea
    ? item.targetArea.split(" / ")[0] + (item.targetArea.includes(" / ") ? " ほか" : "")
    : "";
  const rate = item.subsidyRate?.trim() ?? "";

  const cards: { label: string; text: string }[] = [];
  if (industries) {
    cards.push({ label: "対象業種（参考）", text: industries });
  }
  const secondParts: string[] = [];
  if (rate) secondParts.push(`補助率: ${rate}`);
  if (regionLine) secondParts.push(`対象地域: ${regionLine}`);
  if (secondParts.length > 0) {
    cards.push({ label: "条件・地域", text: secondParts.join(" / ") });
  } else if (item.deadlineLabel && item.deadlineLabel !== "—") {
    cards.push({ label: "申請期限", text: item.deadlineLabel });
  }

  const fallback =
    "詳細は公募要領および jGrants の掲載内容でご確認ください。";
  if (cards.length === 0) {
    cards.push(
      {
        label: "対象業種（参考）",
        text: "一覧に業種の明示がない場合があります。公募要領でご確認ください。",
      },
      { label: "補足", text: fallback },
    );
  } else if (cards.length === 1) {
    cards.push({ label: "補足", text: fallback });
  }
  return cards.slice(0, 2);
}

export default function SubsidyResultHero({ item }: Props) {
  const d = item.decision;
  const factBody = item.description ?? item.summary;
  const criteria = eligibilityPair(item);
  const insightCards = d?.insightCards ?? [];
  const hasInsightCards = insightCards.length > 0;

  const resultCtaBlock = (
    <div className="mt-8 w-full space-y-4 border-t border-[#d0dde5] pt-8">
      <Link
        href="/consult"
        className="inline-flex w-full items-center justify-center rounded-full bg-[#00c6ff] px-6 py-4 text-base font-bold text-[#0b1a22] shadow-sm transition-all hover:bg-[#00b0e6] hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00c6ff] sm:w-auto"
      >
        無料相談を申し込む
      </Link>
      <div className="flex w-full flex-col items-stretch gap-1 sm:max-w-md">
        <Link
          href="#"
          scroll={false}
          className="inline-flex w-full items-center justify-center rounded-full border-2 border-[#00c6ff] bg-transparent px-5 py-3 text-center text-sm font-semibold text-[#00c6ff] transition-colors hover:bg-[#00c6ff]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00c6ff]"
        >
          この補助金の詳細を見る
        </Link>
        <p className="text-center text-xs leading-snug text-[#00c6ff]/80 sm:text-left">
          ※詳細ページは準備中です
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* ── 1. ヘッダー: 制度名 + 金額 + 期限（ユーザーが最初に知りたい3点） ── */}
      <section className="mb-10 md:mb-12" aria-labelledby="check-hero-heading">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-3xl">
            <span className="mb-4 inline-block rounded-full border border-[rgba(0,198,255,0.3)] bg-[rgba(0,198,255,0.12)] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#00a0cc]">
              優先候補（デモ）
            </span>
            <h1
              id="check-hero-heading"
              className="font-heading text-2xl font-bold leading-tight text-portal-primary-container md:text-3xl lg:text-[clamp(1.5rem,3vw,2.25rem)]"
            >
              {item.name}
            </h1>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-8">
          {/* ── 金額 + 期限バー ── */}
          <div className="relative overflow-hidden rounded-xl border border-white/10 bg-white p-6 shadow-[0_8px_32px_rgba(0,0,0,0.35)] sm:p-8">
            <div
              className="pointer-events-none absolute right-0 top-0 opacity-[0.06]"
              aria-hidden
            >
              <span className="font-heading text-[7rem] font-bold text-portal-primary">¥</span>
            </div>

            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
              <div>
                <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-portal-on-surface-card-sub">
                  補助上限（参照）
                </h2>
                <p className="max-w-md font-heading text-3xl font-bold leading-tight text-portal-primary sm:text-4xl md:text-5xl">
                  {item.maxAmountLabel}
                </p>
              </div>
              <div>
                <h2 className="mb-1 text-xs font-semibold uppercase tracking-widest text-portal-on-surface-card-sub">
                  公募期限
                </h2>
                <p className="text-sm font-medium text-portal-on-surface-card">
                  {item.deadlineLabel && item.deadlineLabel !== "—"
                    ? item.deadlineLabel
                    : "制度により異なります"}
                </p>
              </div>
            </div>
          </div>

          {/* ── 2. 洞察カード（ユーザーの「何ができる？何が変わる？」に答える主役） ── */}
          {hasInsightCards ? (
            <div className="rounded-xl border border-white/10 bg-white p-6 shadow-[0_8px_32px_rgba(0,0,0,0.35)] sm:p-8">
              <div className="mb-6 flex items-center gap-3">
                <Lightbulb
                  className="h-6 w-6 text-portal-primary"
                  strokeWidth={1.5}
                  aria-hidden
                />
                <h3 className="font-heading text-lg font-bold text-portal-primary-container">
                  この補助金で御社に何ができるか
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {insightCards.map((card: SubsidyInsightCard, idx: number) => (
                  <div
                    key={`${card.title}-${idx}`}
                    className="rounded-xl border border-[#d0dde5] bg-gradient-to-br from-[#f8fafb] to-white p-5 shadow-sm"
                  >
                    <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#00a0cc]">
                      {card.title}
                    </h4>
                    <p className="text-sm leading-relaxed text-portal-on-surface-card">{card.body}</p>
                  </div>
                ))}
              </div>
              {resultCtaBlock}
            </div>
          ) : d?.summary ? (
            <div className="flex flex-col gap-4 rounded-xl border border-white/10 bg-white p-6 shadow-[0_8px_32px_rgba(0,0,0,0.35)] sm:p-8">
              <div className="flex items-center gap-4">
                <TrendingUp
                  className="h-8 w-8 shrink-0 text-portal-primary-container opacity-80"
                  aria-hidden
                />
                <p className="text-sm font-medium leading-relaxed text-portal-on-surface-card">
                  {d.summary}
                </p>
              </div>
              {resultCtaBlock}
            </div>
          ) : (
            resultCtaBlock
          )}

          {/* ── 3. 条件・裏付けゾーン（スコアの根拠） ── */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.2)]">
              <h3 className="mb-4 font-heading font-semibold text-portal-on-surface-card">
                事実ベースの条件（抜粋）
              </h3>
              <div className="space-y-3">
                {criteria.map((c) => (
                  <div key={c.label} className="rounded-lg bg-[#f0f5f8] p-3">
                    <span className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-[#00a0cc]">
                      {c.label}
                    </span>
                    <p className="text-sm leading-relaxed text-portal-on-surface-card">{c.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.2)]">
              <ListChecks
                className="mb-4 h-8 w-8 text-portal-tertiary-fixed-dim"
                strokeWidth={1.5}
                aria-hidden
              />
              <h3 className="mb-2 font-heading font-semibold text-portal-on-surface-card">適合理由（要約）</h3>
              {d?.matchReason && d.matchReason.length > 0 ? (
                <ul className="list-inside list-disc space-y-1.5 text-sm leading-relaxed text-portal-on-surface-card-sub">
                  {d.matchReason.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm leading-relaxed text-portal-on-surface-card-sub">
                  自動評価の理由文がありません。要約は右欄および下記を参照してください。
                </p>
              )}
            </div>
          </div>

          {/* ── 4. 制度原文（折りたたみ） ── */}
          {factBody ? (
            <div className="rounded-xl border border-white/10 bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.2)]">
              <details className="group">
                <summary className="cursor-pointer list-none text-xs font-semibold uppercase tracking-widest text-portal-on-surface-card-sub marker:content-none [&::-webkit-details-marker]:hidden">
                  <span className="inline-flex items-center gap-2">
                    <span>制度原文（参考・抜粋）</span>
                    <span className="text-[10px] font-normal normal-case tracking-normal text-portal-on-surface-card-sub group-open:hidden">
                      タップして表示
                    </span>
                    <span className="hidden text-[10px] font-normal normal-case tracking-normal text-portal-on-surface-card-sub group-open:inline">
                      閉じる
                    </span>
                  </span>
                </summary>
                <p className="mt-4 text-sm leading-relaxed text-portal-on-surface-card">{factBody}</p>
              </details>
            </div>
          ) : null}
        </div>

        {/* ── サイドバー ── */}
        <aside className="space-y-6 lg:col-span-4" aria-label="評価サマリー">
          <div className="check-portal-editorial-gradient rounded-xl p-8 text-white shadow-xl">
            <h3 className="mb-6 font-heading text-xl font-bold">評価サマリー</h3>
            <div className="space-y-5 border-b border-white/15 pb-5">
              <div className="flex items-end justify-between gap-2">
                <span className="text-sm opacity-80">公募期限</span>
                <span className="text-sm font-medium">
                  {item.deadlineLabel && item.deadlineLabel !== "—"
                    ? item.deadlineLabel
                    : "要確認"}
                </span>
              </div>
            </div>
            {item.detailUrl ? (
              <p className="mt-6 text-xs leading-relaxed opacity-90">
                公式情報:{" "}
                <a
                  href={item.detailUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all underline underline-offset-2 hover:opacity-100"
                >
                  {item.detailUrl}
                </a>
              </p>
            ) : null}
          </div>

          {item.institutionName ? (
            <div className="rounded-xl border border-white/10 bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.2)]">
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-portal-on-surface-card-sub">
                実施主体（参考）
              </h4>
              <p className="font-semibold text-portal-primary-container">{item.institutionName}</p>
            </div>
          ) : null}
        </aside>
      </div>

      <p className="mt-10 text-xs leading-relaxed text-portal-on-surface-variant">
        要約・理由は参考用の自動評価です。採択条件・手続きは公募要領および担当窓口の情報を優先してください。
      </p>
    </>
  );
}

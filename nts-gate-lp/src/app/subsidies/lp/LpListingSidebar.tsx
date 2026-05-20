import Link from "next/link";
import { ArrowRight } from "lucide-react";

export type LpSidebarStats = {
  published: number;
  open: number;
  soon: number;
  newCount: number;
};

export type LpClosingSoonItem = {
  key: string;
  href: string;
  name: string;
  prefecture: string;
  daysUntil: number | null;
  deadlineLabel: string;
};

type Props = {
  stats: LpSidebarStats;
  closingSoon: LpClosingSoonItem[];
};

function StatBox({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number;
  tone?: "default" | "open" | "soon" | "new";
}) {
  const toneClass =
    tone === "open"
      ? "border-emerald-100 bg-emerald-50/60"
      : tone === "soon"
        ? "border-amber-100 bg-amber-50/60"
        : tone === "new"
          ? "border-[#dbe5fa] bg-[#eef3ff]"
          : "border-[#e2e8f4] bg-[#f7faff]";

  const labelClass =
    tone === "open"
      ? "text-emerald-700"
      : tone === "soon"
        ? "text-amber-700"
        : tone === "new"
          ? "text-[#1f3f85]"
          : "text-[#5b6b8c]";

  const valueClass =
    tone === "open"
      ? "text-emerald-700"
      : tone === "soon"
        ? "text-amber-700"
        : "text-[#0d2640]";

  return (
    <div className={`rounded-xl border px-3 py-2.5 text-center ${toneClass}`}>
      <p className={`text-[10px] font-medium ${labelClass}`}>{label}</p>
      <p className={`text-lg font-black tabular-nums ${valueClass}`}>{value.toLocaleString("ja-JP")}</p>
    </div>
  );
}

export default function LpListingSidebar({ stats, closingSoon }: Props) {
  return (
    <aside className="hidden xl:block">
      <div className="space-y-4 xl:sticky xl:top-24 xl:self-start">
        {/* A. 補助金最新動向 */}
        <div className="rounded-2xl border border-[#e2e8f4] bg-white p-4 shadow-sm">
          <h4 className="text-sm font-bold text-[#1e3878]">補助金最新動向</h4>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <StatBox label="公開中" value={stats.published} />
            <StatBox label="受付中" value={stats.open} tone="open" />
            <StatBox label="締切間近" value={stats.soon} tone="soon" />
            <StatBox label="新着" value={stats.newCount} tone="new" />
          </div>
        </div>

        {/* B. 締切が近い補助金 */}
        <div className="rounded-2xl border border-[#e2e8f4] bg-white p-4 shadow-sm">
          <h4 className="text-sm font-bold text-[#1e3878]">締切が近い補助金</h4>
          {closingSoon.length === 0 ? (
            <p className="mt-3 text-xs text-[#6b7a99]">締切間近の案件はありません。</p>
          ) : (
            <div className="mt-3 space-y-2">
              {closingSoon.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  className="block rounded-xl border border-[#e8edf7] px-3 py-2.5 transition hover:bg-[#f7faff]"
                >
                  <p className="line-clamp-2 text-[13px] font-semibold leading-snug text-[#243862]">
                    {item.name}
                  </p>
                  <p className="mt-1 text-[11px] text-[#6b7a99]">{item.prefecture}</p>
                  <p className="mt-1 text-[11px] font-bold text-amber-700">
                    {item.daysUntil !== null ? `残り${item.daysUntil}日` : "随時"} / {item.deadlineLabel}
                  </p>
                </Link>
              ))}
            </div>
          )}
          <Link
            href="/subsidies/list?sort=deadline"
            className="mt-3 inline-flex text-xs font-semibold text-[#1248b7] underline-offset-2 hover:underline"
          >
            すべての締切情報を見る
          </Link>
        </div>

        {/* C. 無料診断CTA */}
        <div className="rounded-2xl border border-[#d7e2f7] bg-[#f6f9ff] p-4 shadow-sm">
          <h4 className="text-sm font-bold text-[#1f3f85]">「何が使えるか」を1分で診断</h4>
          <p className="mt-2 text-xs leading-relaxed text-[#5e6f95]">
            業種・規模・目的に答えるだけで、対象になりそうな補助金を無料で絞り込みます。
          </p>
          <Link
            href="/subsidies/check"
            className="group/check-cta mt-3 inline-flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-xl bg-[#1f4dab] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#173d8c]"
          >
            無料診断をはじめる
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover/check-cta:translate-x-0.5 motion-reduce:transform-none" />
          </Link>
          <Link
            href="/consult"
            className="mt-2 inline-flex min-h-[44px] w-full items-center justify-center rounded-xl border border-[#c7d8f0] bg-white px-4 py-2.5 text-xs font-semibold text-[#1f4dab] transition hover:bg-[#f7faff]"
          >
            専門家に無料で相談する
          </Link>
        </div>
      </div>
    </aside>
  );
}

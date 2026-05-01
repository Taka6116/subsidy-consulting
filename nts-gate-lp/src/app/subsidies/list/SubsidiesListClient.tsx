"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import FilterBar, { type StatusTab } from "@/components/subsidies/FilterBar";

const DEADLINE_MAX = new Date("2050-01-01");

function parseDeadlineDate(deadline: string | null): Date | null {
  if (!deadline) return null;
  const date = new Date(deadline);
  if (Number.isNaN(date.getTime()) || date > DEADLINE_MAX) return null;
  return date;
}

function isExpiredDeadline(deadline: string | null): boolean {
  const d = parseDeadlineDate(deadline);
  return !!d && d < new Date();
}

function isDeadlineSoon(deadline: string | null): boolean {
  const d = parseDeadlineDate(deadline);
  if (!d) return false;
  const diff = (d.getTime() - Date.now()) / 86400000;
  return diff >= 0 && diff <= 30;
}

function formatDeadlineLabel(grant: SubsidyCard): string {
  const raw = grant.deadlineLabel ?? grant.deadline;
  if (!raw) return "公募中";
  const d = parseDeadlineDate(raw);
  if (!d) return "公募中";
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

function formatAmountLabel(grant: SubsidyCard): string {
  const current = grant.maxAmountLabel?.trim() ?? "";
  if (/^最大\s*[\d,]+\s*円$/.test(current)) return current.replace(/\s+/g, "");
  const candidate = Number(grant.rawPayload?.subsidy_max_limit ?? 0);
  if (!Number.isFinite(candidate) || candidate <= 0) return "-";
  return `最大 ${candidate.toLocaleString("ja-JP")} 円`;
}

export type SubsidyCard = {
  id: string;
  name: string | null;
  description: string | null;
  maxAmountLabel: string | null;
  rawPayload?: { subsidy_max_limit?: number | string } | null;
  deadlineLabel: string | null;
  deadline: string | null;
  targetIndustries: string[];
  prefecture: string | null;
  status: string;
  source: string;
  updatedAt: string;
};

export default function SubsidiesListClient({
  grants,
  total,
}: {
  grants: SubsidyCard[];
  total: number;
}) {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<StatusTab>("open");

  const filtered = useMemo(() => {
    let list = grants;

    // タブフィルタ
    if (tab === "open") list = list.filter((g) => !isExpiredDeadline(g.deadline));
    else if (tab === "closed") list = list.filter((g) => isExpiredDeadline(g.deadline));

    // キーワード検索
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (g) =>
          (g.name ?? "").toLowerCase().includes(q) ||
          (g.description ?? "").toLowerCase().includes(q) ||
          (g.targetIndustries ?? []).some((i) => i.toLowerCase().includes(q)),
      );
    }
    return list;
  }, [grants, tab, query]);

  const counts = useMemo(
    () => ({
      all: grants.length,
      open: grants.filter((g) => !isExpiredDeadline(g.deadline)).length,
      closed: grants.filter((g) => isExpiredDeadline(g.deadline)).length,
    }),
    [grants],
  );

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4">
        <p className="text-sm text-neutral-600">
          全 <span className="font-semibold text-[#2f2e2b]">{total}</span> 件中{" "}
          <span className="font-semibold text-[#2f2e2b]">{filtered.length}</span> 件表示
        </p>
      </div>

      <div className="mb-8">
        <FilterBar
          query={query}
          onQueryChange={(v) => setQuery(v)}
          tab={tab}
          onTabChange={(v) => setTab(v)}
          counts={counts}
        />
      </div>

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-sm text-[#6a6760]">
          条件に一致する補助金が見つかりませんでした。
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((grant) => {
            const isExpired = isExpiredDeadline(grant.deadline);
            const isSoon = isDeadlineSoon(grant.deadline);
            return (
              <Link
                key={grant.id}
                href={`/subsidies/list/${grant.id}`}
                aria-disabled={isExpired}
                tabIndex={isExpired ? -1 : 0}
                className={`group rounded-2xl border border-[#e4e1da] bg-white p-6 shadow-sm transition hover:border-[#d7b785] hover:shadow-md ${
                  isExpired ? "pointer-events-none opacity-50 grayscale" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="line-clamp-2 text-lg font-semibold leading-snug text-[#2f2e2b]">
                    {grant.name ?? "名称未設定"}
                  </h2>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    {isExpired && (
                      <span className="rounded-full bg-gray-200 px-2.5 py-1 text-xs font-medium text-gray-700">
                        締切済み
                      </span>
                    )}
                    {grant.source === "manual" && (
                      <span className="rounded-full bg-[#1A7B6F]/10 px-2.5 py-1 text-xs font-medium text-[#1A7B6F]">
                        NTS取扱
                      </span>
                    )}
                    {isSoon && !isExpired && (
                      <span className="rounded-full bg-[#c94834]/10 px-2.5 py-1 text-xs font-medium text-[#c94834]">
                        締切迫る
                      </span>
                    )}
                  </div>
                </div>

                <dl className="mt-5 space-y-2 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <dt className="text-[#77746d]">上限金額</dt>
                    <dd className="text-right font-medium text-[#2f2e2b]">
                      {formatAmountLabel(grant)}
                    </dd>
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <dt className="text-[#77746d]">締切</dt>
                    <dd className="text-right font-medium text-[#2f2e2b]">
                      {formatDeadlineLabel(grant)}
                    </dd>
                  </div>
                </dl>

                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="rounded-full bg-[#e8f0fb] px-2.5 py-1 text-xs font-medium text-[#1a4c8e]">
                    {grant.prefecture == null ||
                    grant.prefecture === "全国" ||
                    grant.prefecture.includes("全国") ||
                    grant.prefecture.length > 10
                      ? "全国"
                      : grant.prefecture}
                  </span>
                  {(grant.targetIndustries ?? []).slice(0, 3).map((industry) => (
                    <span
                      key={`${grant.id}-${industry}`}
                      className="rounded-full bg-[#f4f2ee] px-2.5 py-1 text-xs text-[#5f5c55]"
                    >
                      {industry}
                    </span>
                  ))}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

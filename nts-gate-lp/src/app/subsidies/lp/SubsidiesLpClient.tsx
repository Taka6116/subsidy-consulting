"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import FilterBar, { type StatusTab } from "@/components/subsidies/FilterBar";

const DEADLINE_MAX = new Date("2050-01-01");

function parseDeadlineDate(d: Date | string | null | undefined): Date | null {
  if (!d) return null;
  const date = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(date.getTime()) || date > DEADLINE_MAX) return null;
  return date;
}

function isExpired(deadline: Date | string | null | undefined): boolean {
  const d = parseDeadlineDate(deadline);
  return !!d && d < new Date();
}

export type LpRow = {
  id: string;
  title: string | null;
  body: string | null;
  publishedAt: string | null;
  grant: {
    id: string;
    name: string | null;
    maxAmountLabel: string | null;
    subsidyAmount: string | null;
    deadlineLabel: string | null;
    deadline: string | null;
    prefecture: string | null;
    targetIndustries: string[];
    status: string;
  };
};

export type FeaturedLp = {
  href: string;
  name: string;
  copy: string;
  amount: string;
  deadline: string;
  badge: string;
};

function formatPublishedAt(date: string | null): string {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`;
}

function formatDeadlineLabel(
  deadlineLabel: string | null | undefined,
  deadline: string | null | undefined,
): string | null {
  const candidates = [
    deadline ? new Date(deadline) : null,
    deadlineLabel ? new Date(deadlineLabel) : null,
  ];
  for (const d of candidates) {
    if (d && !Number.isNaN(d.getTime()) && d < DEADLINE_MAX) {
      return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
    }
  }
  return null;
}

function formatMaxAmount(
  label: string | null | undefined,
  amountStr: string | null | undefined,
): string | null {
  const raw = label?.trim();
  if (raw) return raw.startsWith("最大") ? raw : `最大 ${raw}`;
  if (!amountStr) return null;
  const yen = Number(amountStr);
  if (!Number.isFinite(yen) || yen <= 0) return null;
  const man = yen / 10000;
  if (man >= 10000) {
    const oku = man / 10000;
    return `最大 ${oku.toFixed(oku >= 10 ? 0 : 1)}億円`;
  }
  return `最大 ${Math.round(man).toLocaleString("ja-JP")}万円`;
}

function parseHeroCopy(body: string | null): string | null {
  if (!body) return null;
  try {
    const parsed = JSON.parse(body) as { heroCopy?: unknown };
    return typeof parsed.heroCopy === "string" && parsed.heroCopy.trim()
      ? parsed.heroCopy.trim()
      : null;
  } catch {
    return null;
  }
}

export default function SubsidiesLpClient({
  rows,
  featuredLps = [],
}: {
  rows: LpRow[];
  featuredLps?: readonly FeaturedLp[];
}) {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<StatusTab>("all");

  const filtered = useMemo(() => {
    let list = rows;

    if (tab === "open") list = list.filter((r) => !isExpired(r.grant.deadline));
    else if (tab === "closed") list = list.filter((r) => isExpired(r.grant.deadline));

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (r) =>
          (r.grant.name ?? "").toLowerCase().includes(q) ||
          (r.title ?? "").toLowerCase().includes(q) ||
          (r.grant.targetIndustries ?? []).some((i) => i.toLowerCase().includes(q)),
      );
    }
    return list;
  }, [rows, tab, query]);

  const counts = useMemo(
    () => ({
      all: rows.length,
      open: rows.filter((r) => !isExpired(r.grant.deadline)).length,
      closed: rows.filter((r) => isExpired(r.grant.deadline)).length,
    }),
    [rows],
  );

  // 特集LPはタブ・検索に関わらず常に先頭に表示
  // ただし検索クエリがある場合は名前・コピーでフィルタリング
  const filteredFeatured = useMemo(() => {
    if (!query.trim()) return featuredLps;
    const q = query.trim().toLowerCase();
    return featuredLps.filter(
      (lp) =>
        lp.name.toLowerCase().includes(q) ||
        lp.copy.toLowerCase().includes(q) ||
        lp.badge.toLowerCase().includes(q),
    );
  }, [featuredLps, query]);

  // タブが「受付終了」の場合は特集LPを非表示
  const showFeatured = tab !== "closed" && filteredFeatured.length > 0;

  const totalDisplayCount = (showFeatured ? filteredFeatured.length : 0) + filtered.length;

  return (
    <div>
      <div className="mb-6">
        <FilterBar
          query={query}
          onQueryChange={setQuery}
          tab={tab}
          onTabChange={setTab}
          counts={counts}
          placeholder="補助金名・キーワードで検索"
        />
      </div>

      <p className="mb-6 text-sm text-white/60">
        <span className="font-semibold text-white">{totalDisplayCount}</span> 件表示
      </p>

      {totalDisplayCount === 0 ? (
        <div className="rounded-[16px] border border-white/10 bg-[rgba(15,24,42,0.6)] p-8 text-center shadow-[0_4px_16px_rgba(0,0,0,0.25)]">
          <p className="text-sm text-white/70">条件に一致するページが見つかりませんでした。</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* 特集LP固定カード（先頭） */}
          {showFeatured && filteredFeatured.map((lp) => (
            <Link
              key={lp.href}
              href={lp.href}
              className={[
                "group flex min-h-[300px] flex-col overflow-hidden",
                "rounded-[16px] border border-[#7DD3FC]/30",
                "bg-[rgba(15,32,70,0.7)]",
                "shadow-[0_4px_16px_rgba(125,211,252,0.08)]",
                "motion-safe:transition motion-safe:duration-[240ms] motion-safe:ease-out",
                "hover:-translate-y-0.5 hover:border-[#7DD3FC]/60 hover:shadow-[0_8px_24px_rgba(125,211,252,0.18)]",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7DD3FC]",
              ].join(" ")}
            >
              <div className="relative overflow-hidden px-6 pt-6 pb-4">
                <div
                  className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-[#7DD3FC]/10"
                  aria-hidden
                />
                <div className="relative">
                  <span className="mb-2 inline-block rounded-full bg-[#7DD3FC]/15 px-2.5 py-0.5 text-[11px] font-semibold text-[#7DD3FC]">
                    {lp.badge} ★ 専門LP
                  </span>
                  <h2 className="mt-1 line-clamp-2 text-lg font-bold leading-[1.4] text-white sm:text-[20px]">
                    {lp.name}
                  </h2>
                </div>
              </div>

              <div className="flex flex-1 flex-col px-6 pb-6">
                <p className="line-clamp-3 text-sm font-normal leading-[1.7] text-white/70">
                  {lp.copy}
                </p>

                <dl className="mt-4 grid grid-cols-2 gap-2">
                  <div className="rounded-[10px] bg-white/[0.04] p-3">
                    <dt className="text-[11px] font-medium uppercase text-white/50">補助上限</dt>
                    <dd className="mt-1 text-sm font-semibold text-white">{lp.amount}</dd>
                  </div>
                  <div className="rounded-[10px] bg-white/[0.04] p-3">
                    <dt className="text-[11px] font-medium uppercase text-white/50">公募期限</dt>
                    <dd className="mt-1 text-sm font-semibold text-white">{lp.deadline}</dd>
                  </div>
                </dl>

                <div className="mt-auto flex items-end justify-between gap-3 pt-5">
                  <span className="text-sm font-semibold text-[#7DD3FC] underline-offset-4 group-hover:underline">
                    専門LPを見る{" "}
                    <span
                      className="inline-block motion-safe:transition motion-safe:duration-200 group-hover:translate-x-1"
                      aria-hidden
                    >
                      →
                    </span>
                  </span>
                </div>
              </div>
            </Link>
          ))}

          {/* DBから生成された動的LPカード */}
          {filtered.map((row) => {
            const grant = row.grant;
            const heroCopy =
              parseHeroCopy(row.body) ??
              "この補助金を、自社の投資判断に活かすためのガイドです。";
            const amountLabel = formatMaxAmount(grant.maxAmountLabel, grant.subsidyAmount);
            const deadlineLabel = formatDeadlineLabel(grant.deadlineLabel, grant.deadline);
            const publishedAt = formatPublishedAt(row.publishedAt);
            const expired = isExpired(grant.deadline);

            return (
              <Link
                key={row.id}
                href={`/subsidies/lp/${grant.id}`}
                aria-label={`${grant.name ?? "補助金活用ガイド"} のガイドを見る`}
                className={[
                  "group flex min-h-[300px] flex-col overflow-hidden",
                  "rounded-[16px] border border-white/[0.08]",
                  "bg-[rgba(15,24,42,0.6)]",
                  "shadow-[0_4px_16px_rgba(0,0,0,0.25)]",
                  "motion-safe:transition motion-safe:duration-[240ms] motion-safe:ease-out",
                  "hover:-translate-y-0.5 hover:border-white/[0.18] hover:shadow-[0_8px_24px_rgba(0,0,0,0.35)]",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7DD3FC]",
                  expired ? "opacity-60 grayscale" : "",
                ].join(" ")}
              >
                <div className="relative overflow-hidden px-6 pt-6 pb-4">
                  <div
                    className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-[#7DD3FC]/10"
                    aria-hidden
                  />
                  <div className="relative flex items-start justify-between gap-2">
                    <h2 className="line-clamp-2 text-lg font-bold leading-[1.4] text-white sm:text-[20px]">
                      {grant.name ?? row.title ?? "補助金活用ガイド"}
                    </h2>
                    {expired && (
                      <span className="mt-0.5 shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-medium text-white/60">
                        受付終了
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-1 flex-col px-6 pb-6">
                  <p className="line-clamp-3 text-sm font-normal leading-[1.7] text-white/70">
                    {heroCopy}
                  </p>

                  <dl className="mt-4 grid grid-cols-2 gap-2">
                    <div className="rounded-[10px] bg-white/[0.04] p-3">
                      <dt className="text-[11px] font-medium uppercase text-white/50">補助上限</dt>
                      <dd className="mt-1 text-sm font-semibold text-white">
                        {amountLabel ?? "要確認"}
                      </dd>
                    </div>
                    <div className="rounded-[10px] bg-white/[0.04] p-3">
                      <dt className="text-[11px] font-medium uppercase text-white/50">公募期限</dt>
                      <dd className="mt-1 text-sm font-semibold text-white">
                        {deadlineLabel ?? "要確認"}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-auto flex items-end justify-between gap-3 pt-5">
                    <span className="text-sm font-semibold text-[#7DD3FC] underline-offset-4 group-hover:underline">
                      ガイドを見る{" "}
                      <span
                        className="inline-block motion-safe:transition motion-safe:duration-200 group-hover:translate-x-1"
                        aria-hidden
                      >
                        →
                      </span>
                    </span>
                    {publishedAt && (
                      <span className="shrink-0 text-[11px] text-white/40">{publishedAt}</span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

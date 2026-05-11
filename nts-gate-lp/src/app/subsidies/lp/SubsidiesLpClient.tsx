"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, X, ArrowRight } from "lucide-react";
import type { LpCategory } from "@/lib/lp-pictures/pickLpCategoryImage";

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

function daysUntil(deadline: string | null | undefined): number | null {
  const d = parseDeadlineDate(deadline);
  if (!d) return null;
  return Math.ceil((d.getTime() - Date.now()) / 86400000);
}

export type LpRow = {
  id: string;
  title: string | null;
  body: string | null;
  publishedAt: string | null;
  category: LpCategory;
  imageUrl: string;
  imageAlt: string;
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
  category: LpCategory;
  imageUrl: string;
  imageAlt: string;
};

function formatDeadlineLabel(
  deadlineLabel: string | null | undefined,
  deadline: string | null | undefined,
): string {
  const candidates = [
    deadline ? new Date(deadline) : null,
    deadlineLabel ? new Date(deadlineLabel) : null,
  ];
  for (const d of candidates) {
    if (d && !Number.isNaN(d.getTime()) && d < DEADLINE_MAX) {
      return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
    }
  }
  return "要確認";
}

function formatYen(yen: number): string {
  if (yen >= 100_000_000) {
    const oku = yen / 100_000_000;
    return `最大${oku % 1 === 0 ? oku.toFixed(0) : oku.toFixed(1)}億円`;
  }
  const man = yen / 10_000;
  return `最大${Math.round(man).toLocaleString("ja-JP")}万円`;
}

function formatMaxAmount(
  label: string | null | undefined,
  amountStr: string | null | undefined,
): string {
  const raw = label?.trim();
  if (raw) {
    const numericMatch = raw.match(/最大([0-9,]+)円/);
    if (numericMatch) {
      const yen = Number(numericMatch[1].replace(/,/g, ""));
      if (Number.isFinite(yen) && yen > 0) return formatYen(yen);
    }
    return raw.startsWith("最大") ? raw : `最大${raw}`;
  }
  if (!amountStr) return "要確認";
  const yen = Number(amountStr);
  if (!Number.isFinite(yen) || yen <= 0) return "要確認";
  return formatYen(yen);
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

const CATEGORY_BADGE: Record<LpCategory, { label: string; className: string }> = {
  DX: { label: "DX・デジタル化", className: "bg-violet-50 text-violet-700 ring-violet-200" },
  IT: { label: "IT導入", className: "bg-blue-50 text-blue-700 ring-blue-200" },
  人材: { label: "人材・賃上げ", className: "bg-amber-50 text-amber-700 ring-amber-200" },
  建設: { label: "建設・施工", className: "bg-stone-100 text-stone-700 ring-stone-200" },
  運送: { label: "物流・運送", className: "bg-sky-50 text-sky-700 ring-sky-200" },
  設備: { label: "設備投資", className: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  事業計画: { label: "事業計画・再構築", className: "bg-orange-50 text-orange-700 ring-orange-200" },
  その他: { label: "補助金", className: "bg-slate-100 text-slate-600 ring-slate-200" },
};

type StatusTab = "all" | "open" | "closed";

export default function SubsidiesLpClient({
  rows,
  featuredLps = [],
}: {
  rows: LpRow[];
  featuredLps?: readonly FeaturedLp[];
}) {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<StatusTab>("all");

  const filteredRows = useMemo(() => {
    let list = rows;
    if (tab === "open") list = list.filter((r) => !isExpired(r.grant.deadline));
    else if (tab === "closed") list = list.filter((r) => isExpired(r.grant.deadline));
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (r) =>
          (r.grant.name ?? "").toLowerCase().includes(q) ||
          (r.title ?? "").toLowerCase().includes(q) ||
          (r.grant.targetIndustries ?? []).some((i) => i.toLowerCase().includes(q)) ||
          r.category.toLowerCase().includes(q),
      );
    }
    return list;
  }, [rows, tab, query]);

  const filteredFeatured = useMemo(() => {
    if (tab === "closed") return [];
    if (!query.trim()) return featuredLps;
    const q = query.trim().toLowerCase();
    return featuredLps.filter(
      (lp) =>
        lp.name.toLowerCase().includes(q) ||
        lp.copy.toLowerCase().includes(q) ||
        lp.category.toLowerCase().includes(q),
    );
  }, [featuredLps, query, tab]);

  const counts = useMemo(
    () => ({
      all: rows.length + featuredLps.length,
      open: rows.filter((r) => !isExpired(r.grant.deadline)).length + featuredLps.length,
      closed: rows.filter((r) => isExpired(r.grant.deadline)).length,
    }),
    [rows, featuredLps],
  );

  const totalCount = filteredFeatured.length + filteredRows.length;

  return (
    <div>
      {/* 検索・タブバー */}
      <div className="mb-6 rounded-2xl border border-[#dbe3f0] bg-white p-4 shadow-sm md:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex flex-1 items-center rounded-xl border border-[#d6e1f4] bg-[#f9fbff] px-3 py-2.5 shadow-inner">
            <Search className="mr-2 h-4 w-4 shrink-0 text-[#8193bc]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="制度名・業種・キーワードで検索"
              className="w-full bg-transparent text-sm outline-none placeholder:text-[#9aa6c4]"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="ml-2 rounded p-1 text-[#8193bc] hover:bg-white hover:text-[#0d2640]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>
          <div className="flex gap-1.5">
            {(["all", "open", "closed"] as const).map((t) => {
              const label = t === "all" ? "すべて" : t === "open" ? "受付中" : "受付終了";
              const count = counts[t];
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                    tab === t
                      ? "border-[#1f4dab] bg-[#1f4dab] text-white"
                      : "border-[#d6e1f4] bg-white text-[#2a3f72] hover:bg-[#f1f5fb]"
                  }`}
                >
                  {label}
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-extrabold ${
                      tab === t ? "bg-white/20 text-white" : "bg-[#eef3ff] text-[#1f4dab]"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 件数 */}
      <p className="mb-5 text-sm text-[#5b6b8c]">
        <span className="font-bold text-[#0d2640]">{totalCount}</span> 件の専門LPを表示中
      </p>

      {totalCount === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#cdd6e6] bg-white p-12 text-center">
          <p className="text-sm font-semibold text-[#4f5b73]">条件に一致するページが見つかりませんでした。</p>
          <button
            type="button"
            onClick={() => { setQuery(""); setTab("all"); }}
            className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#1f4dab] px-4 py-2 text-xs font-bold text-white"
          >
            <X className="h-3.5 w-3.5" />
            条件をクリア
          </button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {/* 特集LP固定カード */}
          {filteredFeatured.map((lp) => (
            <FeaturedLpCard key={lp.href} lp={lp} />
          ))}
          {/* DB生成の動的LPカード */}
          {filteredRows.map((row) => (
            <DynamicLpCard key={row.id} row={row} />
          ))}
        </div>
      )}
    </div>
  );
}

function FeaturedLpCard({ lp }: { lp: FeaturedLp }) {
  const badge = CATEGORY_BADGE[lp.category];
  return (
    <Link
      href={lp.href}
      className="group flex flex-col overflow-hidden rounded-2xl border border-[#c9d7ef] bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-[#1f4dab]/40 hover:shadow-md"
    >
      {/* サムネイル */}
      <div className="relative aspect-[16/9] overflow-hidden bg-[#e8edf7]">
        <Image
          src={lp.imageUrl}
          alt={lp.imageAlt}
          fill
          className="object-cover transition duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        {/* カテゴリバッジ */}
        <div className="absolute left-2.5 top-2.5 flex flex-wrap gap-1.5">
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ring-inset ${badge.className}`}
          >
            {badge.label}
          </span>
          <span className="inline-flex items-center rounded-full bg-[#1f4dab] px-2 py-0.5 text-[10px] font-bold text-white">
            ★ 専門LP
          </span>
        </div>
        {/* バッジ（令和〇年度） */}
        <div className="absolute right-2.5 top-2.5">
          <span className="rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
            {lp.badge}
          </span>
        </div>
      </div>

      {/* コンテンツ */}
      <div className="flex flex-1 flex-col p-4">
        <h2 className="line-clamp-2 min-h-[2.8rem] text-[15px] font-bold leading-snug text-[#0d2640]">
          {lp.name}
        </h2>
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[#5f6f90]">{lp.copy}</p>

        <dl className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-[#eef2f8] bg-[#fafcff] p-2.5 text-center">
            <dt className="text-[10px] font-medium text-[#6b7a99]">補助上限</dt>
            <dd className="mt-0.5 text-xs font-bold text-[#0d2640]">{lp.amount}</dd>
          </div>
          <div className="rounded-xl border border-[#eef2f8] bg-[#fafcff] p-2.5 text-center">
            <dt className="text-[10px] font-medium text-[#6b7a99]">公募期限</dt>
            <dd className="mt-0.5 text-xs font-bold text-[#0d2640]">{lp.deadline}</dd>
          </div>
        </dl>

        <div className="mt-auto flex items-center gap-1.5 pt-3">
          <span className="flex-1 text-sm font-bold text-[#1f4dab] group-hover:underline underline-offset-2">
            専門LPを見る
          </span>
          <ArrowRight className="h-4 w-4 text-[#1f4dab] transition group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}

function DynamicLpCard({ row }: { row: LpRow }) {
  const grant = row.grant;
  const expired = isExpired(grant.deadline);
  const days = daysUntil(grant.deadline);
  const amountLabel = formatMaxAmount(grant.maxAmountLabel, grant.subsidyAmount);
  const deadlineLabel = formatDeadlineLabel(grant.deadlineLabel, grant.deadline);
  const heroCopy =
    parseHeroCopy(row.body) ?? "この補助金を、自社の投資判断に活かすためのガイドです。";
  const badge = CATEGORY_BADGE[row.category];
  const isSoon = days !== null && days >= 0 && days <= 30;

  return (
    <Link
      href={`/subsidies/lp/${grant.id}`}
      aria-label={`${grant.name ?? "補助金活用ガイド"} のガイドを見る`}
      className={`group flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        expired
          ? "border-[#e2e8f4] opacity-70 grayscale"
          : "border-[#e2e8f4] hover:border-[#c9d7ef]"
      }`}
    >
      {/* サムネイル */}
      <div className="relative aspect-[16/9] overflow-hidden bg-[#e8edf7]">
        <Image
          src={row.imageUrl}
          alt={row.imageAlt}
          fill
          className="object-cover transition duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        {/* カテゴリバッジ */}
        <div className="absolute left-2.5 top-2.5 flex flex-wrap gap-1.5">
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ring-inset ${badge.className}`}
          >
            {badge.label}
          </span>
          {expired ? (
            <span className="rounded-full bg-neutral-500/70 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
              受付終了
            </span>
          ) : isSoon ? (
            <span className="rounded-full bg-amber-500/90 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
              締切間近
            </span>
          ) : (
            <span className="rounded-full bg-emerald-500/85 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
              受付中
            </span>
          )}
        </div>
        {/* 地域バッジ */}
        {grant.prefecture ? (
          <div className="absolute right-2.5 top-2.5">
            <span className="rounded-full bg-black/45 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
              {grant.prefecture}
            </span>
          </div>
        ) : null}
      </div>

      {/* コンテンツ */}
      <div className="flex flex-1 flex-col p-4">
        <h2 className="line-clamp-2 min-h-[2.8rem] text-[15px] font-bold leading-snug text-[#0d2640]">
          {grant.name ?? row.title ?? "補助金活用ガイド"}
        </h2>
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[#5f6f90]">{heroCopy}</p>

        {/* 業種タグ（最大2件） */}
        {grant.targetIndustries.length > 0 ? (
          <div className="mt-2.5 flex flex-wrap gap-1">
            {grant.targetIndustries.slice(0, 2).map((i) => (
              <span
                key={i}
                className="rounded-md border border-[#dbe5fa] bg-[#eef3ff] px-1.5 py-0.5 text-[10px] font-semibold text-[#1f4dab]"
              >
                {i}
              </span>
            ))}
            {grant.targetIndustries.length > 2 ? (
              <span className="rounded-md border border-[#e2e8f4] bg-white px-1.5 py-0.5 text-[10px] text-[#6b7a99]">
                +{grant.targetIndustries.length - 2}
              </span>
            ) : null}
          </div>
        ) : null}

        <dl className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-[#eef2f8] bg-[#fafcff] p-2.5 text-center">
            <dt className="text-[10px] font-medium text-[#6b7a99]">補助上限</dt>
            <dd className="mt-0.5 text-xs font-bold text-[#0d2640]">{amountLabel}</dd>
          </div>
          <div className="rounded-xl border border-[#eef2f8] bg-[#fafcff] p-2.5 text-center">
            <dt className="text-[10px] font-medium text-[#6b7a99]">公募期限</dt>
            <dd
              className={`mt-0.5 text-xs font-bold ${
                expired ? "text-neutral-400" : isSoon ? "text-amber-700" : "text-[#0d2640]"
              }`}
            >
              {deadlineLabel}
              {isSoon && days !== null ? (
                <span className="ml-1 text-amber-600">（残{days}日）</span>
              ) : null}
            </dd>
          </div>
        </dl>

        <div className="mt-auto flex items-center gap-1.5 border-t border-[#f0f4fb] pt-3">
          <span className="flex-1 text-sm font-bold text-[#1f4dab] group-hover:underline underline-offset-2">
            ガイドを見る
          </span>
          <ArrowRight className="h-4 w-4 text-[#1f4dab] transition group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}

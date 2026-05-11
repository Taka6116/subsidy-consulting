"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, X, ArrowRight, Check } from "lucide-react";
import type {
  LpCategory,
  PurposeKey,
  IndustryKey,
  AmountBucket,
} from "@/lib/lp-pictures/pickLpCategoryImage";
import {
  PURPOSE_LABELS,
  INDUSTRY_LABELS,
  AMOUNT_LABELS,
} from "@/lib/lp-pictures/pickLpCategoryImage";

const DEADLINE_MAX = new Date("2050-01-01");
const SOON_DAYS = 30;

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

function isSoon(deadline: string | null | undefined): boolean {
  const days = daysUntil(deadline);
  return days !== null && days >= 0 && days <= SOON_DAYS;
}

// =============================================================
// 型
// =============================================================

export type LpRow = {
  id: string;
  title: string | null;
  body: string | null;
  publishedAt: string | null;
  category: LpCategory;
  categoryLabel: string;
  targetLine: string;
  learnPoints: string[];
  imageUrl: string;
  imageAlt: string;
  purposes: PurposeKey[];
  industries: IndustryKey[];
  amountYen: number | null;
  amountBucket: AmountBucket | null;
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
  categoryLabel: string;
  targetLine: string;
  learnPoints: string[];
  imageUrl: string;
  imageAlt: string;
  purposes: PurposeKey[];
  industries: IndustryKey[];
  amountYen: number | null;
  amountBucket: AmountBucket | null;
};

type UnifiedCard = {
  key: string;
  href: string;
  isFeatured: boolean;
  name: string;
  category: LpCategory;
  categoryLabel: string;
  targetLine: string;
  learnPoints: string[];
  copy: string;
  imageUrl: string;
  imageAlt: string;
  badge: string | null;
  amountLabel: string;
  deadlineLabel: string;
  deadline: string | null;
  prefecture: string | null;
  expired: boolean;
  soon: boolean;
  alwaysOpen: boolean;
  purposes: PurposeKey[];
  industries: IndustryKey[];
  amountYen: number | null;
  amountBucket: AmountBucket | null;
  publishedAt: string | null;
};

// =============================================================
// フォーマッタ
// =============================================================

function formatDeadlineLabel(
  deadlineLabel: string | null | undefined,
  deadline: string | null | undefined,
): string {
  if (deadlineLabel && /^\d{4}年/.test(deadlineLabel.trim())) return deadlineLabel.trim();
  const candidates = [
    deadline ? new Date(deadline) : null,
    deadlineLabel ? new Date(deadlineLabel) : null,
  ];
  for (const d of candidates) {
    if (d && !Number.isNaN(d.getTime()) && d < DEADLINE_MAX) {
      return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
    }
  }
  return deadlineLabel?.trim() || "随時受付";
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

// =============================================================
// 統一カード化
// =============================================================

function toUnifiedFromFeatured(lp: FeaturedLp): UnifiedCard {
  return {
    key: `featured:${lp.href}`,
    href: lp.href,
    isFeatured: true,
    name: lp.name,
    category: lp.category,
    categoryLabel: lp.categoryLabel,
    targetLine: lp.targetLine,
    learnPoints: lp.learnPoints,
    copy: lp.copy,
    imageUrl: lp.imageUrl,
    imageAlt: lp.imageAlt,
    badge: lp.badge,
    amountLabel: lp.amount,
    deadlineLabel: lp.deadline,
    deadline: null,
    prefecture: null,
    expired: false,
    soon: false,
    alwaysOpen: lp.deadline === "要確認",
    purposes: lp.purposes,
    industries: lp.industries,
    amountYen: lp.amountYen,
    amountBucket: lp.amountBucket,
    publishedAt: null,
  };
}

function toUnifiedFromRow(row: LpRow): UnifiedCard {
  const grant = row.grant;
  const expired = isExpired(grant.deadline);
  const soon = !expired && isSoon(grant.deadline);
  const amountLabel = formatMaxAmount(grant.maxAmountLabel, grant.subsidyAmount);
  const deadlineLabel = formatDeadlineLabel(grant.deadlineLabel, grant.deadline);
  const copy = parseHeroCopy(row.body) ?? "この補助金を、自社の投資判断に活かすためのガイドです。";

  return {
    key: `row:${row.id}`,
    href: `/subsidies/lp/${grant.id}`,
    isFeatured: false,
    name: grant.name ?? row.title ?? "補助金活用ガイド",
    category: row.category,
    categoryLabel: row.categoryLabel,
    targetLine: row.targetLine,
    learnPoints: row.learnPoints,
    copy,
    imageUrl: row.imageUrl,
    imageAlt: row.imageAlt,
    badge: null,
    amountLabel,
    deadlineLabel,
    deadline: grant.deadline,
    prefecture: grant.prefecture,
    expired,
    soon,
    alwaysOpen: !grant.deadline && !grant.deadlineLabel,
    purposes: row.purposes,
    industries: row.industries,
    amountYen: row.amountYen,
    amountBucket: row.amountBucket,
    publishedAt: row.publishedAt,
  };
}

// =============================================================
// フィルター定義
// =============================================================

type StatusTab = "all" | "open" | "soon" | "closed";

const STATUS_TABS: { key: StatusTab; label: string }[] = [
  { key: "all", label: "すべて" },
  { key: "open", label: "受付中" },
  { key: "soon", label: "締切間近" },
  { key: "closed", label: "受付終了" },
];

type SortKey = "recommend" | "deadline" | "amount";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "recommend", label: "おすすめ順" },
  { key: "deadline", label: "締切が近い順" },
  { key: "amount", label: "補助上限が大きい順" },
];

const PURPOSE_CHIPS: PurposeKey[] = [
  "equipment",
  "it_dx",
  "labor_saving",
  "hr",
  "wage",
  "new_business",
  "logistics",
];

const INDUSTRY_CHIPS: IndustryKey[] = [
  "construction",
  "manufacturing",
  "logistics",
  "it",
  "retail_service",
];

const AMOUNT_CHIPS: AmountBucket[] = ["lt300", "gte1000", "gte10000"];

// =============================================================
// メインコンポーネント
// =============================================================

export default function SubsidiesLpClient({
  rows,
  featuredLps = [],
}: {
  rows: LpRow[];
  featuredLps?: readonly FeaturedLp[];
}) {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<StatusTab>("all");
  const [purposes, setPurposes] = useState<Set<PurposeKey>>(new Set());
  const [industries, setIndustries] = useState<Set<IndustryKey>>(new Set());
  const [amountBucket, setAmountBucket] = useState<AmountBucket | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("recommend");

  // 全カードを統一形式に変換
  const allCards: UnifiedCard[] = useMemo(() => {
    return [
      ...featuredLps.map((lp) => toUnifiedFromFeatured(lp)),
      ...rows.map((r) => toUnifiedFromRow(r)),
    ];
  }, [rows, featuredLps]);

  // フィルター適用
  const filtered = useMemo<UnifiedCard[]>(() => {
    let list = allCards;

    // ステータスタブ
    if (tab === "open") list = list.filter((c) => !c.expired);
    else if (tab === "soon") list = list.filter((c) => c.soon);
    else if (tab === "closed") list = list.filter((c) => c.expired);

    // 目的チップ（OR）
    if (purposes.size > 0) {
      list = list.filter((c) => c.purposes.some((p) => purposes.has(p)));
    }

    // 業種チップ（OR）
    if (industries.size > 0) {
      list = list.filter((c) => c.industries.some((i) => industries.has(i)));
    }

    // 金額チップ
    if (amountBucket) {
      list = list.filter((c) => c.amountBucket === amountBucket);
    }

    // キーワード検索
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((c) => {
        const blob = [c.name, c.copy, c.categoryLabel, c.targetLine, c.category]
          .join(" ")
          .toLowerCase();
        return blob.includes(q);
      });
    }

    // 並び替え
    const copied = [...list];
    if (sortKey === "deadline") {
      copied.sort((a, b) => {
        const ad = parseDeadlineDate(a.deadline)?.getTime() ?? Number.MAX_SAFE_INTEGER;
        const bd = parseDeadlineDate(b.deadline)?.getTime() ?? Number.MAX_SAFE_INTEGER;
        return ad - bd;
      });
    } else if (sortKey === "amount") {
      copied.sort((a, b) => (b.amountYen ?? 0) - (a.amountYen ?? 0));
    } else {
      // おすすめ順：特集LP優先 → 受付中 → 締切近い → 金額大
      copied.sort((a, b) => {
        if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
        if (a.expired !== b.expired) return a.expired ? 1 : -1;
        const aSoonPriority = a.soon ? 0 : 1;
        const bSoonPriority = b.soon ? 0 : 1;
        if (aSoonPriority !== bSoonPriority) return aSoonPriority - bSoonPriority;
        return (b.amountYen ?? 0) - (a.amountYen ?? 0);
      });
    }
    return copied;
  }, [allCards, tab, purposes, industries, amountBucket, query, sortKey]);

  // ステータス件数
  const counts = useMemo(() => {
    let open = 0;
    let soon = 0;
    let closed = 0;
    for (const c of allCards) {
      if (c.expired) closed += 1;
      else {
        open += 1;
        if (c.soon) soon += 1;
      }
    }
    return { all: allCards.length, open, soon, closed };
  }, [allCards]);

  const hasAnyFilter =
    !!query.trim() ||
    purposes.size > 0 ||
    industries.size > 0 ||
    amountBucket !== null ||
    tab !== "all";

  const clearAll = () => {
    setQuery("");
    setTab("all");
    setPurposes(new Set());
    setIndustries(new Set());
    setAmountBucket(null);
  };

  const togglePurpose = (key: PurposeKey) => {
    setPurposes((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleIndustry = (key: IndustryKey) => {
    setIndustries((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div>
      {/* ============ 検索・フィルター ============ */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        {/* 上段：検索バー + 並び替え */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex flex-1 items-center rounded-xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-[#0B4F8A] focus-within:bg-white">
            <Search className="mr-2 h-4 w-4 shrink-0 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="制度名・業種・キーワードで検索"
              className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              aria-label="補助金活用ガイドを検索"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="ml-2 rounded p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="検索条件をクリア"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>
          <label className="flex shrink-0 items-center gap-2 md:w-auto">
            <span className="text-xs font-bold text-slate-500">並び替え</span>
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="h-12 min-w-[180px] rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 focus:border-[#0B4F8A] focus:outline-none"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.key} value={opt.key}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* ステータスタブ */}
        <div className="mt-4 -mx-1 flex gap-1.5 overflow-x-auto whitespace-nowrap px-1 pb-1">
          {STATUS_TABS.map((t) => {
            const active = tab === t.key;
            const count =
              t.key === "all"
                ? counts.all
                : t.key === "open"
                  ? counts.open
                  : t.key === "soon"
                    ? counts.soon
                    : counts.closed;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B4F8A] ${
                  active
                    ? "border-[#0B4F8A] bg-[#0B4F8A] text-white"
                    : "border-transparent bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {t.label}
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-extrabold ${
                    active ? "bg-white/20 text-white" : "bg-white text-[#0B4F8A]"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* 目的チップ */}
        <ChipRow
          label="目的で絞り込む"
          chips={PURPOSE_CHIPS.map((k) => ({
            key: k,
            label: PURPOSE_LABELS[k],
            active: purposes.has(k),
            onToggle: () => togglePurpose(k),
          }))}
        />

        {/* 業種チップ */}
        <ChipRow
          label="業種で絞り込む"
          chips={INDUSTRY_CHIPS.map((k) => ({
            key: k,
            label: INDUSTRY_LABELS[k],
            active: industries.has(k),
            onToggle: () => toggleIndustry(k),
          }))}
        />

        {/* 金額チップ */}
        <ChipRow
          label="補助上限で絞り込む"
          chips={AMOUNT_CHIPS.map((k) => ({
            key: k,
            label: AMOUNT_LABELS[k],
            active: amountBucket === k,
            onToggle: () => setAmountBucket((prev) => (prev === k ? null : k)),
          }))}
        />

        {/* 条件クリア */}
        {hasAnyFilter ? (
          <div className="mt-4 flex items-center justify-end">
            <button
              type="button"
              onClick={clearAll}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
            >
              <X className="h-3 w-3" />
              条件をすべてクリア
            </button>
          </div>
        ) : null}
      </div>

      {/* ============ 相談ミニバナー ============ */}
      <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-blue-100 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <p className="text-base font-bold text-slate-900 sm:text-lg">
            どの補助金が自社に合うか分からない方へ
          </p>
          <p className="mt-1 text-sm text-slate-600">
            条件を確認し、対象になりそうな補助金を無料で整理します。
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Link
            href="/consult"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-[#0B4F8A] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#083D6D] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B4F8A]"
          >
            無料相談する
          </Link>
          <Link
            href="/subsidies/check"
            className="inline-flex h-11 items-center justify-center rounded-xl px-3 text-sm font-bold text-[#0B4F8A] transition hover:underline"
          >
            対象補助金を確認する →
          </Link>
        </div>
      </div>

      {/* ============ セクション見出し ============ */}
      <div className="mt-10">
        <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
          公開中の補助金活用ガイド
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          用途や業種に合わせて、申請前に確認すべきポイントを専門LPに整理しています。
        </p>
        <p className="mt-3 text-sm text-slate-500">
          <span className="font-bold text-slate-900">{filtered.length}</span> 件の専門LPを表示中
        </p>
      </div>

      {/* ============ カードグリッド ============ */}
      {filtered.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-sm font-semibold text-slate-700">
            条件に一致するガイドが見つかりませんでした。
          </p>
          <p className="mt-1 text-xs text-slate-500">
            条件を緩めるか、キーワードを変えてお試しください。
          </p>
          <button
            type="button"
            onClick={clearAll}
            className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#0B4F8A] px-4 py-2 text-xs font-bold text-white"
          >
            <X className="h-3.5 w-3.5" />
            条件をすべてクリア
          </button>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((card) => (
            <LpResultCard key={card.key} card={card} />
          ))}
        </div>
      )}
    </div>
  );
}

// =============================================================
// チップ行
// =============================================================

function ChipRow({
  label,
  chips,
}: {
  label: string;
  chips: { key: string; label: string; active: boolean; onToggle: () => void }[];
}) {
  return (
    <div className="mt-4">
      <p className="text-xs font-bold uppercase tracking-normal text-slate-500">{label}</p>
      <div className="-mx-1 mt-2 flex gap-1.5 overflow-x-auto whitespace-nowrap px-1 pb-1">
        {chips.map((chip) => (
          <button
            key={chip.key}
            type="button"
            onClick={chip.onToggle}
            aria-pressed={chip.active}
            className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-3 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B4F8A] ${
              chip.active
                ? "border-[#0B4F8A] bg-[#0B4F8A] text-white"
                : "border-transparent bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {chip.active ? <Check className="h-3 w-3" /> : null}
            {chip.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// =============================================================
// カード（共通）
// =============================================================

function LpResultCard({ card }: { card: UnifiedCard }) {
  const isExternal = card.isFeatured;
  return (
    <article
      className={`group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        card.expired ? "opacity-75" : ""
      }`}
    >
      <Link
        href={card.href}
        className="flex h-full flex-col focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B4F8A]"
        aria-label={`${card.name} の専門LPを見る`}
      >
        {/* 画像 */}
        <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
          <Image
            src={card.imageUrl}
            alt={card.imageAlt}
            fill
            className="object-cover transition duration-300 group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {/* 軽いオーバーレイ（読みやすさのため） */}
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-slate-950/30 via-transparent to-transparent"
          />
          {/* 左上：カテゴリバッジ + 特集LPバッジ */}
          <div className="absolute left-3 top-3 flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-[#0B4F8A] shadow-sm">
              {card.categoryLabel}
            </span>
            {card.isFeatured ? (
              <span className="inline-flex items-center rounded-full bg-[#0B4F8A] px-2.5 py-1 text-[10px] font-bold text-white shadow-sm">
                ★ 専門LP
              </span>
            ) : null}
          </div>
          {/* 右上：ステータス */}
          <div className="absolute right-3 top-3">
            {card.expired ? (
              <span className="inline-flex items-center rounded-full bg-slate-500/90 px-2.5 py-1 text-xs font-bold text-white shadow-sm backdrop-blur-sm">
                受付終了
              </span>
            ) : card.soon ? (
              <span className="inline-flex items-center rounded-full bg-amber-500 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
                締切間近
              </span>
            ) : card.alwaysOpen ? (
              <span className="inline-flex items-center rounded-full bg-slate-600/85 px-2.5 py-1 text-xs font-bold text-white shadow-sm backdrop-blur-sm">
                随時受付
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-emerald-500 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
                受付中
              </span>
            )}
          </div>
        </div>

        {/* 本文 */}
        <div className="flex flex-1 flex-col p-5">
          {/* 制度名 */}
          <h3 className="line-clamp-2 min-h-[2.8rem] text-base font-bold leading-snug text-slate-900 sm:text-lg">
            {card.name}
          </h3>

          {/* 対象企業/用途 */}
          <p className="mt-2 line-clamp-1 text-sm font-semibold text-[#0B4F8A]">
            {card.targetLine}
          </p>

          {/* 説明 */}
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{card.copy}</p>

          {/* このLPで分かること */}
          {card.learnPoints.length > 0 ? (
            <div className="mt-4">
              <p className="text-[11px] font-bold uppercase tracking-normal text-slate-500">
                このLPで分かること
              </p>
              <ul className="mt-1.5 space-y-1 text-xs text-slate-600">
                {card.learnPoints.slice(0, 3).map((p) => (
                  <li key={p} className="flex items-start gap-1.5">
                    <Check className="mt-0.5 h-3 w-3 shrink-0 text-[#0B4F8A]" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {/* メタ情報（補助上限・公募期限） */}
          <dl className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
              <dt className="text-[11px] font-bold text-slate-500">補助上限</dt>
              <dd className="mt-1 text-sm font-bold text-slate-900">{card.amountLabel}</dd>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
              <dt className="text-[11px] font-bold text-slate-500">公募期限</dt>
              <dd
                className={`mt-1 text-sm font-bold ${
                  card.expired
                    ? "text-slate-400"
                    : card.soon
                      ? "text-amber-700"
                      : "text-slate-900"
                }`}
              >
                {card.deadlineLabel}
              </dd>
            </div>
          </dl>

          {/* 主CTA */}
          <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-4">
            <span className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#0B4F8A] px-4 text-sm font-bold text-white transition group-hover:bg-[#083D6D]">
              専門LPを見る
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              {isExternal ? <span className="sr-only">（特集LP）</span> : null}
            </span>
          </div>
        </div>
      </Link>

      {/* 副CTA：相談する（カード本体のリンクから独立させる） */}
      <div className="border-t border-slate-100 px-5 py-3">
        <Link
          href={`/consult?subsidyName=${encodeURIComponent(card.name)}`}
          className="inline-flex items-center gap-1 text-sm font-bold text-[#0B4F8A] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B4F8A]"
        >
          この補助金について相談する →
        </Link>
      </div>
    </article>
  );
}

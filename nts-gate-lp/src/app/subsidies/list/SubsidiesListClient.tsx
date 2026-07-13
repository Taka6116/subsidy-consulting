"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Search, X } from "lucide-react";
import SubsidyAmountHeroRow from "@/components/subsidies/SubsidyAmountHeroRow";
import SubsidyDeadlineRail, {
  type DeadlineRailItem,
} from "@/components/subsidies/SubsidyDeadlineRail";
import Pagination from "@/components/shared/Pagination";
import SubsidiesListHero from "./SubsidiesListHero";

type StatusTab = "all" | "open" | "soon" | "closed";
type SortKey = "newest" | "deadline" | "amount";

const DEADLINE_MAX = new Date("2050-01-01");
const NEW_DAYS = 7;
const SOON_DAYS = 30;
const PAGE_SIZE = 20;

export type SubsidyCard = {
  id: string;
  name: string | null;
  description: string | null;
  cardImagePath: string | null;
  maxAmountLabel: string | null;
  rawPayload?: { subsidy_max_limit?: number | string } | null;
  deadlineLabel: string | null;
  deadline: string | null;
  targetIndustries: string[];
  prefecture: string | null;
  institutionName: string | null;
  subsidyRate: number | null;
  status: string;
  source: string;
  syncedAt: string;
  updatedAt: string;
  articleSlug: string | null;
  hasLp?: boolean;
};

const NATIONWIDE_LABEL = "全国";

const PREFECTURE_GROUPS: { label: string; prefectures: string[] }[] = [
  { label: "全国", prefectures: ["全国"] },
  { label: "北海道・東北", prefectures: ["北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県"] },
  { label: "関東", prefectures: ["茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県"] },
  { label: "中部", prefectures: ["新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県", "静岡県", "愛知県"] },
  { label: "近畿", prefectures: ["三重県", "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県"] },
  { label: "中国", prefectures: ["鳥取県", "島根県", "岡山県", "広島県", "山口県"] },
  { label: "四国", prefectures: ["徳島県", "香川県", "愛媛県", "高知県"] },
  { label: "九州・沖縄", prefectures: ["福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"] },
];

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

function daysUntilDeadline(deadline: string | null): number | null {
  const d = parseDeadlineDate(deadline);
  if (!d) return null;
  return Math.ceil((d.getTime() - Date.now()) / 86400000);
}

function isDeadlineSoon(deadline: string | null): boolean {
  const diff = daysUntilDeadline(deadline);
  return diff !== null && diff >= 0 && diff <= SOON_DAYS;
}

// syncedAt（初回登録日）を基準にしてNEW判定する
// updatedAt は jGrants 同期のたびに更新されるため全件 NEW になってしまう
function isNewGrant(syncedAt: string): boolean {
  return Date.now() - new Date(syncedAt).getTime() < NEW_DAYS * 86400000;
}

function formatDeadlineLabel(grant: SubsidyCard): string {
  const raw = grant.deadlineLabel ?? grant.deadline;
  if (!raw) return "随時";
  const d = parseDeadlineDate(raw);
  if (!d) return "随時";
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
}

function parseAmountYen(grant: SubsidyCard): number {
  const raw = `${grant.maxAmountLabel ?? ""}`;
  const numOnly = raw.replace(/[^\d]/g, "");
  if (numOnly) return Number(numOnly);
  const candidate = Number(grant.rawPayload?.subsidy_max_limit ?? 0);
  return Number.isFinite(candidate) ? candidate : 0;
}

function formatAmountShort(grant: SubsidyCard): string {
  const yen = parseAmountYen(grant);
  if (!yen || !Number.isFinite(yen) || yen <= 0) return "要確認";
  if (yen >= 100_000_000) {
    const oku = yen / 100_000_000;
    return oku % 1 === 0 ? `${oku}億円` : `${oku.toFixed(1)}億円`;
  }
  if (yen >= 10_000) {
    const man = yen / 10_000;
    return man % 1 === 0 ? `${man.toLocaleString("ja-JP")}万円` : `${man.toFixed(0)}万円`;
  }
  return `${yen.toLocaleString("ja-JP")}円`;
}

function formatSubsidyRate(rate: number | null): string {
  if (rate == null || !Number.isFinite(rate) || rate <= 0) return "要確認";
  if (rate <= 1) return `${Math.round(rate * 100)}%`;
  return `${Math.round(rate)}%`;
}

function formatPrefecture(prefecture: string | null): string {
  if (!prefecture) return NATIONWIDE_LABEL;
  const trimmed = prefecture.trim();
  if (!trimmed) return NATIONWIDE_LABEL;
  if (trimmed.includes(NATIONWIDE_LABEL)) return NATIONWIDE_LABEL;
  return trimmed;
}

function formatInstitution(grant: SubsidyCard): string {
  const name = grant.institutionName?.trim();
  if (name) return name;
  switch (grant.source) {
    case "jgrants":
      return "jGrants公開";
    case "manual":
      return "NTS取扱";
    case "municipality":
      return "自治体公式";
    case "meti":
    case "chusho":
    case "maff":
    case "mlit":
    case "ministry":
      return "省庁公式";
    default:
      return "要確認";
  }
}

function statusBadgeFor(grant: SubsidyCard): {
  label: string;
  className: string;
} {
  const days = daysUntilDeadline(grant.deadline);
  if (days !== null && days < 0) {
    return { label: "受付終了", className: "bg-neutral-100 text-neutral-600 ring-neutral-200" };
  }
  if (days !== null && days <= SOON_DAYS) {
    return { label: "締切間近", className: "bg-amber-50 text-amber-700 ring-amber-200" };
  }
  return { label: "受付中", className: "bg-emerald-50 text-emerald-700 ring-emerald-200" };
}

function daysLeftDisplay(deadline: string | null): {
  text: string;
  tone: "expired" | "soon" | "normal" | "always";
} {
  const days = daysUntilDeadline(deadline);
  if (days === null) return { text: "随時受付", tone: "always" };
  if (days < 0) return { text: "受付終了", tone: "expired" };
  if (days <= SOON_DAYS) return { text: `残り${days}日`, tone: "soon" };
  return { text: `残り${days}日`, tone: "normal" };
}

const SORT_OPTIONS: Array<{ value: SortKey; label: string }> = [
  { value: "newest", label: "新着順" },
  { value: "deadline", label: "締切が近い順" },
  { value: "amount", label: "補助上限が大きい順" },
];

const FALLBACK_INDUSTRIES = [
  "製造業", "建設業", "小売・サービス業", "IT・情報通信",
  "物流・運輸", "農林水産業", "医療・福祉", "飲食業", "観光・宿泊", "その他",
];

const STATUS_TABS: Array<{ key: StatusTab; label: string }> = [
  { key: "all", label: "すべて" },
  { key: "open", label: "受付中" },
  { key: "soon", label: "締切間近" },
  { key: "closed", label: "受付終了" },
];

export default function SubsidiesListClient({
  grants,
}: {
  grants: SubsidyCard[];
}) {
  const [query, setQuery] = useState("");
  const [statusTab, setStatusTab] = useState<StatusTab>("open");
  const [prefectureFilter, setPrefectureFilter] = useState<string>("");
  const [industryFilter, setIndustryFilter] = useState<string>("");
  const [sortKey, setSortKey] = useState<SortKey>("newest");
  const [page, setPage] = useState(1);
  const listTopRef = useRef<HTMLDivElement>(null);

  const industryOptions = useMemo(() => {
    const set = new Set<string>();
    for (const g of grants) {
      for (const i of g.targetIndustries ?? []) {
        const trimmed = i?.trim();
        if (trimmed) set.add(trimmed);
      }
    }
    const dynamic = Array.from(set).sort((a, b) => a.localeCompare(b, "ja")).slice(0, 60);
    return dynamic.length > 0 ? dynamic : FALLBACK_INDUSTRIES;
  }, [grants]);

  const counts = useMemo(() => {
    let open = 0;
    let soon = 0;
    let closed = 0;
    for (const g of grants) {
      const days = daysUntilDeadline(g.deadline);
      if (days === null) {
        open += 1;
        continue;
      }
      if (days < 0) closed += 1;
      else {
        open += 1;
        if (days <= SOON_DAYS) soon += 1;
      }
    }
    return { all: grants.length, open, soon, closed };
  }, [grants]);

  const filtered = useMemo<SubsidyCard[]>(() => {
    let list = grants;

    if (statusTab === "open") {
      list = list.filter((g) => !isExpiredDeadline(g.deadline));
    } else if (statusTab === "soon") {
      list = list.filter((g) => isDeadlineSoon(g.deadline));
    } else if (statusTab === "closed") {
      list = list.filter((g) => isExpiredDeadline(g.deadline));
    }

    if (prefectureFilter) {
      list = list.filter((g) => formatPrefecture(g.prefecture) === prefectureFilter);
    }

    if (industryFilter) {
      list = list.filter((g) =>
        (g.targetIndustries ?? []).some((i) => i?.trim() === industryFilter),
      );
    }

    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((g) => {
        const blob = [
          g.name ?? "",
          g.description ?? "",
          g.institutionName ?? "",
          (g.targetIndustries ?? []).join(" "),
        ]
          .join(" ")
          .toLowerCase();
        return blob.includes(q);
      });
    }

    const copied = [...list];
    if (sortKey === "deadline") {
      copied.sort((a, b) => {
        const ad = parseDeadlineDate(a.deadline)?.getTime() ?? Number.MAX_SAFE_INTEGER;
        const bd = parseDeadlineDate(b.deadline)?.getTime() ?? Number.MAX_SAFE_INTEGER;
        return ad - bd;
      });
    } else if (sortKey === "amount") {
      copied.sort((a, b) => parseAmountYen(b) - parseAmountYen(a));
    } else {
      copied.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
    }
    return copied;
  }, [grants, statusTab, prefectureFilter, industryFilter, query, sortKey]);

  // フィルター変更時にページをリセット
  useEffect(() => {
    setPage(1);
  }, [filtered]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const safePage = Math.min(Math.max(1, page), totalPages || 1);
  const visibleGrants = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const closingSoon = useMemo(() => {
    return [...grants]
      .filter((g) => {
        const d = daysUntilDeadline(g.deadline);
        return d !== null && d >= 0 && d <= SOON_DAYS;
      })
      .sort((a, b) => {
        const ad = parseDeadlineDate(a.deadline)?.getTime() ?? 0;
        const bd = parseDeadlineDate(b.deadline)?.getTime() ?? 0;
        return ad - bd;
      })
      .slice(0, 5);
  }, [grants]);

  const closingSoonRailItems = useMemo<DeadlineRailItem[]>(
    () =>
      closingSoon.map((item) => ({
        id: item.id,
        name: item.name ?? "名称未設定",
        meta: `${formatPrefecture(item.prefecture)} · ${formatInstitution(item)}`,
        daysLeft: daysUntilDeadline(item.deadline),
        deadlineDate: formatDeadlineLabel(item),
      })),
    [closingSoon],
  );

  const hasAnyFilter =
    !!query.trim() || !!prefectureFilter || !!industryFilter || statusTab !== "open";

  const clearAllFilters = () => {
    setQuery("");
    setPrefectureFilter("");
    setIndustryFilter("");
    setStatusTab("open");
  };

  return (
    <div>
      <SubsidiesListHero counts={counts} />

      <div className="relative z-20 mx-auto -mt-3 w-full max-w-[1720px] space-y-6 px-3 pb-7 md:-mt-5 md:px-5 md:pb-8 lg:px-6">
        {/* 検索・フィルター */}
        <section
          id="subsidy-search"
          className="scroll-mt-24 rounded-2xl border border-[#dbe3f0] bg-white p-4 shadow-[0_10px_30px_rgba(28,70,117,0.08)] md:p-5"
        >
        <div className="grid gap-3 md:grid-cols-[1.6fr_1fr_1fr_auto] md:items-center">
          <div className="flex items-center rounded-xl border border-[#d6e1f4] bg-[#f9fbff] px-3 py-2.5 shadow-inner">
            <Search className="mr-2 h-4 w-4 shrink-0 text-[#8193bc]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="制度名・機関名・キーワードで検索"
              className="w-full bg-transparent text-sm outline-none placeholder:text-[#9aa6c4]"
              aria-label="補助金を検索"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="ml-2 rounded p-1 text-[#8193bc] transition hover:bg-white hover:text-[#0d2640]"
                aria-label="検索条件をクリア"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>
          <select
            value={prefectureFilter}
            onChange={(e) => setPrefectureFilter(e.target.value)}
            className="w-full appearance-none rounded-xl border border-[#d6e1f4] bg-white px-3 py-2.5 text-sm text-[#2a3f72] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1f4dab]/25"
            aria-label="対象地域で絞り込み"
          >
            <option value="">対象地域：すべて</option>
            {PREFECTURE_GROUPS.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.prefectures.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </optgroup>
            ))}
          </select>
          <select
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value)}
            className="w-full appearance-none rounded-xl border border-[#d6e1f4] bg-white px-3 py-2.5 text-sm text-[#2a3f72] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1f4dab]/25"
            aria-label="業種で絞り込み"
          >
            <option value="">業種：すべて</option>
            {industryOptions.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="w-full min-w-[180px] appearance-none rounded-xl border border-[#d6e1f4] bg-white px-3 py-2.5 text-sm text-[#2a3f72] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1f4dab]/25"
            aria-label="並び替え"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                並び替え：{o.label}
              </option>
            ))}
          </select>
        </div>

        {/* ステータスタブ */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {STATUS_TABS.map((tab) => {
            const active = statusTab === tab.key;
            const count =
              tab.key === "all"
                ? counts.all
                : tab.key === "open"
                  ? counts.open
                  : tab.key === "soon"
                    ? counts.soon
                    : counts.closed;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusTab(tab.key)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-bold transition ${
                  active
                    ? tab.key === "soon"
                      ? "border-transparent text-white shadow-sm [background:linear-gradient(135deg,#b91c1c_0%,#ef4444_55%,#f97316_100%)]"
                      : tab.key === "closed"
                        ? "border-transparent text-white shadow-sm [background:linear-gradient(135deg,#374151_0%,#6b7280_55%,#9ca3af_100%)]"
                        : "border-transparent text-white shadow-sm [background:var(--nts-gradient-primary)]"
                    : "border-[#d6e1f4] bg-white text-[#2a3f72] hover:bg-[#f1f5fb]"
                }`}
              >
                {tab.label}
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-extrabold ${
                    active ? "bg-white/20 text-white" : "bg-[#eef3ff] text-[#1f4dab]"
                  }`}
                >
                  {count.toLocaleString("ja-JP")}
                </span>
              </button>
            );
          })}
          {hasAnyFilter ? (
            <button
              type="button"
              onClick={clearAllFilters}
              className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-[#1248b7] underline-offset-2 hover:underline"
            >
              <X className="h-3 w-3" />
              条件をすべてクリア
            </button>
          ) : null}
        </div>

        {/* アクティブ条件チップ */}
        {prefectureFilter || industryFilter || query.trim() ? (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-[#6b7a99]">適用中：</span>
            {query.trim() ? (
              <FilterChip onClear={() => setQuery("")}>キーワード「{query.trim()}」</FilterChip>
            ) : null}
            {prefectureFilter ? (
              <FilterChip onClear={() => setPrefectureFilter("")}>地域：{prefectureFilter}</FilterChip>
            ) : null}
            {industryFilter ? (
              <FilterChip onClear={() => setIndustryFilter("")}>業種：{industryFilter}</FilterChip>
            ) : null}
          </div>
        ) : null}
        </section>

        {/* 件数表示 */}
        <div ref={listTopRef} className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-[#4f5b73]">
          <span className="font-extrabold text-[#0d2640]">{filtered.length.toLocaleString("ja-JP")}</span>
          <span className="ml-1">件中</span>
          <span className="mx-1 font-bold text-[#0d2640]">{Math.min(visibleGrants.length, filtered.length).toLocaleString("ja-JP")}</span>
          <span>件を表示</span>
          {totalPages > 1 ? (
            <span className="ml-2 text-[11px] text-[#6b7a99]">
              （{safePage} / {totalPages} ページ）
            </span>
          ) : null}
        </p>
        {closingSoon.length > 0 ? (
          <p className="text-xs font-semibold text-amber-700">
            締切間近 {closingSoon.length}件あり
          </p>
        ) : null}
        </div>

        {/* リスト本体 */}
        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div>
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#cdd6e6] bg-white px-6 py-16 text-center">
              <p className="text-sm font-semibold text-[#4f5b73]">条件に一致する補助金が見つかりませんでした。</p>
              <p className="mt-1 text-xs text-[#6b7a99]">条件を緩めるか、キーワードを変えて再度お試しください。</p>
              <button
                type="button"
                onClick={clearAllFilters}
                className="mt-4 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:brightness-110 nts-cta-primary"
              >
                <X className="h-3.5 w-3.5" />
                条件をすべてクリア
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {visibleGrants.map((grant) => (
                  <SubsidyResultCard key={grant.id} grant={grant} />
                ))}
              </div>

              {/* ページネーション */}
              <Pagination
                currentPage={safePage}
                totalPages={totalPages}
                onPageChange={(p) => {
                  setPage(p);
                  listTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
              />
            </>
          )}
        </div>

        {/* 補助サイド */}
        <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          <SubsidyDeadlineRail items={closingSoonRailItems} />

          <div className="rounded-2xl border border-[#d7e2f7] bg-[#f6f9ff] p-4 shadow-sm">
            <h4 className="text-sm font-bold text-[#1f3f85]">自社に合う制度を診断</h4>
            <p className="mt-2 text-xs leading-relaxed text-[#5e6f95]">
              業種・規模・目的を選ぶだけで、対象の補助金候補を絞り込めます（無料・1分）。
            </p>
            <Link
              href="/subsidies/check"
              className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 [background:var(--nts-gradient-primary)]"
            >
              無料診断をはじめる
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/consult"
              className="mt-2 inline-flex w-full items-center justify-center rounded-xl border border-[#c7d8f0] bg-white px-4 py-2.5 text-xs font-semibold text-[#1f4dab] transition hover:bg-[#f7faff]"
            >
              専門家に無料で相談する
            </Link>
          </div>
        </aside>
        </section>
      </div>
    </div>
  );
}

function FilterChip({
  children,
  onClear,
}: {
  children: React.ReactNode;
  onClear: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-[#d6e1f4] bg-[#f7faff] px-2.5 py-1 text-[11px] font-semibold text-[#2a3f72]">
      {children}
      <button
        type="button"
        onClick={onClear}
        className="rounded-full p-0.5 text-[#8193bc] transition hover:bg-white hover:text-[#0d2640]"
        aria-label="この条件を解除"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

function SubsidyResultCard({ grant }: { grant: SubsidyCard }) {
  const status = statusBadgeFor(grant);
  const daysInfo = daysLeftDisplay(grant.deadline);
  const isExpired = daysInfo.tone === "expired";
  const industries = (grant.targetIndustries ?? []).filter(Boolean);
  const visibleIndustries = industries.slice(0, 3);
  const remainingIndustries = Math.max(0, industries.length - visibleIndustries.length);
  const amount = formatAmountShort(grant);
  const rate = formatSubsidyRate(grant.subsidyRate);
  const deadlineLabel = formatDeadlineLabel(grant);
  const deadlinePrimary =
    deadlineLabel === "随時"
      ? "随時"
      : daysInfo.tone === "expired"
        ? "受付終了"
        : daysInfo.text.replace("残り", "");
  const deadlineSecondary =
    deadlineLabel !== "随時" && daysInfo.tone !== "always"
      ? `締切日：${deadlineLabel}`
      : null;
  const prefectureLabel = formatPrefecture(grant.prefecture);
  const institution = formatInstitution(grant);
  const description = grant.description?.trim();

  return (
    <article
      className={`group flex h-full flex-col overflow-hidden rounded-2xl border border-[#e2e8f4] bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-[#c9d7ef] hover:shadow-md ${
        isExpired ? "opacity-75" : ""
      }`}
    >
      {/* カードヘッダー */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-[#eef2f8] bg-[#fafcff] px-4 py-2.5">
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ring-inset ${status.className}`}
        >
          {status.label}
        </span>
        {isNewGrant(grant.syncedAt) ? (
          <span className="inline-flex items-center rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white">
            NEW
          </span>
        ) : null}
        {/* 出典種別バッジ（自治体のみ表示） */}
        {grant.source === "municipality" ? (
          <span className="inline-flex items-center rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-semibold text-teal-700 ring-1 ring-inset ring-teal-200">
            自治体
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col px-4 py-4">
        <h3 className="line-clamp-2 min-h-[2.8rem] text-base font-bold leading-snug text-[#0d2640]">
          {grant.name ?? "名称未設定"}
        </h3>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#5b6b8c]">
          <span>{institution}</span>
          <span>·</span>
          <span>{prefectureLabel}</span>
        </div>

        {description ? (
          <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-[#5f6f90]">
            {description}
          </p>
        ) : null}

        {visibleIndustries.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {visibleIndustries.map((i) => (
              <span
                key={i}
                className="inline-flex items-center rounded-md border border-[#dbe5fa] bg-[#eef3ff] px-1.5 py-0.5 text-[10px] font-semibold text-[#1f4dab]"
              >
                {i}
              </span>
            ))}
            {remainingIndustries > 0 ? (
              <span className="inline-flex items-center rounded-md border border-[#e2e8f4] bg-white px-1.5 py-0.5 text-[10px] font-semibold text-[#5b6b8c]">
                +{remainingIndustries}
              </span>
            ) : null}
          </div>
        ) : null}

        <SubsidyAmountHeroRow
          amountLabel={amount}
          rateLabel={rate}
          deadlinePrimary={deadlinePrimary}
          deadlineSecondary={deadlineSecondary}
          deadlineTone={daysInfo.tone}
        />

        {/* アクションボタン */}
        <div className="mt-4 flex items-stretch gap-2 border-t border-[#eef2f8] pt-3">
          {/* 主CTA: 解説記事を見る（articleSlugあり） / 詳細を見る（なし） */}
          <Link
            href={
              grant.articleSlug
                ? `/subsidies/articles/${grant.articleSlug}`
                : `/subsidies/list/${grant.id}`
            }
            aria-disabled={isExpired}
            tabIndex={isExpired ? -1 : 0}
            className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:brightness-110 [background:var(--nts-gradient-primary)] ${
              isExpired ? "pointer-events-none opacity-60" : ""
            }`}
          >
            {grant.articleSlug ? "解説記事を見る →" : "詳細を見る →"}
          </Link>
          {/* サブCTA群：右側に縦並び（全件で活用ガイド＋無料相談を表示） */}
          <div className="flex flex-col gap-1">
            <Link
              href={`/subsidies/lp/${grant.id}`}
              className="inline-flex items-center justify-center rounded-xl border border-[#d6e1f4] bg-white px-3 py-1.5 text-xs font-semibold text-[#5b6b8c] transition hover:bg-[#f7faff] whitespace-nowrap"
            >
              活用ガイド
            </Link>
            <Link
              href={`/consult?subsidyId=${grant.id}`}
              className="inline-flex items-center justify-center rounded-xl border border-[#d6e1f4] bg-white px-3 py-1.5 text-xs font-semibold text-[#1a7b6f] transition hover:bg-[#f3faf8] whitespace-nowrap"
            >
              無料相談
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

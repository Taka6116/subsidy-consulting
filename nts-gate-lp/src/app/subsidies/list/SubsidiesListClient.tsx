"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Bell,
  CalendarClock,
  Cpu,
  GitMerge,
  HardHat,
  Leaf,
  Search,
  Truck,
  Trophy,
  Users,
} from "lucide-react";
import type { StaticImageData } from "next/image";
import listHeroIsometric from "../../../../icon-assets/list-hero-isometric.png";
import expertPhoto from "../../../../icon-assets/craftswoman.webp";

type StatusTab = "all" | "open" | "closed";

const DEADLINE_MAX = new Date("2050-01-01");
const NEW_DAYS = 7;

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

function isNewGrant(updatedAt: string): boolean {
  return Date.now() - new Date(updatedAt).getTime() < NEW_DAYS * 86400000;
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

function parseAmountYen(grant: SubsidyCard): number {
  const raw = `${grant.maxAmountLabel ?? ""}`;
  const numOnly = raw.replace(/[^\d]/g, "");
  if (numOnly) return Number(numOnly);
  const candidate = Number(grant.rawPayload?.subsidy_max_limit ?? 0);
  return Number.isFinite(candidate) ? candidate : 0;
}

function daysLeftLabel(deadline: string | null): string {
  const d = parseDeadlineDate(deadline);
  if (!d) return "公募中";
  const diff = Math.ceil((d.getTime() - Date.now()) / 86400000);
  if (diff < 0) return "締切済";
  return `あと ${diff}日`;
}

function grantSubtitle(grant: SubsidyCard): string {
  const d = grant.description?.trim();
  if (d) return d.length > 140 ? `${d.slice(0, 140)}…` : d;
  const ind = grant.targetIndustries?.filter(Boolean) ?? [];
  if (ind.length) return `${ind.slice(0, 2).join("・")}向けの支援制度です。`;
  const pref =
    grant.prefecture && grant.prefecture !== "全国" && !grant.prefecture.includes("全国")
      ? grant.prefecture
      : "全国";
  return `${pref}の公募情報・活用ポイントをまとめました。`;
}

function resolveLpBadges(grant: SubsidyCard): string[] {
  const badges: string[] = [];
  if (isNewGrant(grant.updatedAt)) badges.push("NEW");
  if (isDeadlineSoon(grant.deadline)) badges.push("締切間近");
  if (grant.source === "manual") badges.push("人気");
  else if (parseAmountYen(grant) >= 50_000_000) badges.push("注目");
  return badges.slice(0, 2);
}

function newsRibbon(item: SubsidyCard, idx: number): { label: string; className: string } {
  if (idx === 0) return { label: "NEW", className: "bg-red-500 text-white" };
  if (isDeadlineSoon(item.deadline)) return { label: "締切間近", className: "bg-amber-500 text-white" };
  if (isNewGrant(item.updatedAt)) return { label: "更新", className: "bg-[#edf4ff] text-[#2453b8]" };
  const age = Date.now() - new Date(item.updatedAt).getTime();
  if (age < 14 * 86400000) return { label: "速報", className: "bg-violet-100 text-violet-800" };
  return { label: "注目", className: "bg-slate-100 text-slate-700" };
}

type CardVisual = {
  title: string;
  subtitle: string;
  image: StaticImageData;
  badge: string;
};

const VISUAL_RULES: Array<{
  keywords: string[];
  visual: CardVisual;
}> = [
  {
    keywords: ["環境", "省エネ", "再エネ", "脱炭素", "co2"],
    visual: {
      title: "環境・省エネ",
      subtitle: "脱炭素投資",
      image: listHeroIsometric,
      badge: "環境・省エネ",
    },
  },
  {
    keywords: ["運送", "物流", "配送"],
    visual: {
      title: "物流・運送",
      subtitle: "効率化支援",
      image: listHeroIsometric,
      badge: "物流・運送",
    },
  },
  {
    keywords: ["建設", "設備", "土木", "重機"],
    visual: {
      title: "建設・設備",
      subtitle: "省力化投資",
      image: listHeroIsometric,
      badge: "建設・設備",
    },
  },
  {
    keywords: ["DX", "IT", "デジタル", "システム"],
    visual: {
      title: "DX・IT",
      subtitle: "導入支援",
      image: listHeroIsometric,
      badge: "DX・IT",
    },
  },
  {
    keywords: ["人材", "採用", "賃上げ"],
    visual: {
      title: "人材・採用",
      subtitle: "賃上げ支援",
      image: listHeroIsometric,
      badge: "人材・採用",
    },
  },
  {
    keywords: ["事業承継", "m&a", "承継", "買収"],
    visual: {
      title: "事業承継・M&A",
      subtitle: "継続と成長",
      image: listHeroIsometric,
      badge: "事業承継",
    },
  },
  {
    keywords: ["事業計画", "創業", "スタートアップ"],
    visual: {
      title: "事業計画",
      subtitle: "成長加速",
      image: listHeroIsometric,
      badge: "事業計画",
    },
  },
  {
    keywords: ["機械", "製造", "更新"],
    visual: {
      title: "設備投資",
      subtitle: "生産性向上",
      image: listHeroIsometric,
      badge: "設備投資",
    },
  },
];

const DEFAULT_VISUAL: CardVisual = {
  title: "補助金LP",
  subtitle: "最新制度",
  image: listHeroIsometric,
  badge: "公募中",
};

function resolveVisual(grant: SubsidyCard): CardVisual {
  const text = `${grant.name ?? ""} ${(grant.targetIndustries ?? []).join(" ")}`.toLowerCase();
  const matched = VISUAL_RULES.find((rule) =>
    rule.keywords.some((keyword) => text.includes(keyword.toLowerCase())),
  );
  return matched?.visual ?? DEFAULT_VISUAL;
}

type CategoryDef = {
  id: string;
  label: string;
  keywords: string[];
  chipClass: string;
  icon: LucideIcon;
};

const CATEGORY_ITEMS: CategoryDef[] = [
  {
    id: "logistics",
    label: "物流・運送",
    keywords: ["運送", "物流", "配送"],
    chipClass: "text-sky-800 bg-sky-50 border-sky-100",
    icon: Truck,
  },
  {
    id: "construction",
    label: "建設・設備",
    keywords: ["建設", "設備", "土木"],
    chipClass: "text-amber-800 bg-amber-50 border-amber-100",
    icon: HardHat,
  },
  {
    id: "dx",
    label: "DX・IT化",
    keywords: ["DX", "IT", "デジタル"],
    chipClass: "text-indigo-800 bg-indigo-50 border-indigo-100",
    icon: Cpu,
  },
  {
    id: "hr",
    label: "人材・採用・賃上げ",
    keywords: ["人材", "採用", "賃上げ"],
    chipClass: "text-emerald-800 bg-emerald-50 border-emerald-100",
    icon: Users,
  },
  {
    id: "green",
    label: "環境・省エネ",
    keywords: ["環境", "省エネ", "再エネ", "脱炭素"],
    chipClass: "text-teal-800 bg-teal-50 border-teal-100",
    icon: Leaf,
  },
  {
    id: "mna",
    label: "事業承継・M&A",
    keywords: ["事業承継", "M&A", "承継", "買収"],
    chipClass: "text-violet-800 bg-violet-50 border-violet-100",
    icon: GitMerge,
  },
];

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
  const [sortKey, setSortKey] = useState<"recommended" | "deadline" | "amount">("recommended");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = useMemo<SubsidyCard[]>(() => {
    let list = grants;

    if (tab === "open") list = list.filter((g) => !isExpiredDeadline(g.deadline));
    else if (tab === "closed") list = list.filter((g) => isExpiredDeadline(g.deadline));

    if (activeCategory) {
      const cat = CATEGORY_ITEMS.find((c) => c.id === activeCategory);
      if (cat) {
        list = list.filter((g) => {
          const blob = `${g.name ?? ""} ${g.description ?? ""} ${(g.targetIndustries ?? []).join(" ")}`.toLowerCase();
          return cat.keywords.some((k) => blob.includes(k.toLowerCase()));
        });
      }
    }

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (g) =>
          (g.name ?? "").toLowerCase().includes(q) ||
          (g.description ?? "").toLowerCase().includes(q) ||
          (g.targetIndustries ?? []).some((i) => i.toLowerCase().includes(q)),
      );
    }
    const copied = [...list];
    if (sortKey === "deadline") {
      copied.sort((a, b) => {
        const ad = parseDeadlineDate(a.deadline)?.getTime() ?? Number.MAX_SAFE_INTEGER;
        const bd = parseDeadlineDate(b.deadline)?.getTime() ?? Number.MAX_SAFE_INTEGER;
        return ad - bd;
      });
      return copied;
    }
    if (sortKey === "amount") {
      copied.sort((a, b) => parseAmountYen(b) - parseAmountYen(a));
      return copied;
    }
    copied.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return copied;
  }, [grants, tab, query, sortKey, activeCategory]);

  const counts = useMemo(
    () => ({
      all: grants.length,
      open: grants.filter((g) => !isExpiredDeadline(g.deadline)).length,
      closed: grants.filter((g) => isExpiredDeadline(g.deadline)).length,
    }),
    [grants],
  );

  const latestUpdated = useMemo(() => {
    if (grants.length === 0) return "-";
    const latest = [...grants].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )[0];
    const d = new Date(latest.updatedAt);
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
  }, [grants]);

  const categorySummary = useMemo(
    () =>
      CATEGORY_ITEMS.map((item) => ({
        ...item,
        count: grants.filter((g) => {
          const text = `${g.name ?? ""} ${g.description ?? ""} ${(g.targetIndustries ?? []).join(" ")}`.toLowerCase();
          return item.keywords.some((k) => text.includes(k.toLowerCase()));
        }).length,
      })),
    [grants],
  );

  const newsItems = useMemo(
    () =>
      [...grants]
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 4),
    [grants],
  );

  const deadlineRanking = useMemo(
    () =>
      [...grants]
        .filter((g) => !isExpiredDeadline(g.deadline))
        .sort((a, b) => {
          const ad = parseDeadlineDate(a.deadline)?.getTime() ?? Number.MAX_SAFE_INTEGER;
          const bd = parseDeadlineDate(b.deadline)?.getTime() ?? Number.MAX_SAFE_INTEGER;
          return ad - bd;
        })
        .slice(0, 5),
    [grants],
  );

  return (
    <div className="space-y-8">
      {/* Hero + LIVE */}
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="overflow-hidden rounded-2xl border border-[#dbe3f0] bg-white shadow-sm">
          <div className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(200px,320px)_minmax(160px,200px)] lg:items-center lg:gap-8 lg:p-8">
            <div>
              <p className="text-xs font-semibold tracking-wide text-[#3f5790]">補助金LPライブラリ</p>
              <h2 className="mt-3 text-3xl font-extrabold leading-tight text-[#1b2f66] md:text-4xl">
                あなたの経営課題に、
                <br />
                使える補助金があります。
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-[#5c6578]">
                業界・課題ごとの専用LPをご用意しました。
                <br />
                自社に合った制度を見つけて、次の一歩へつなげましょう。
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/subsidies/check"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#1248b7] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0f3d99]"
                >
                  今すぐ自社に合う制度を診断する
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/subsidies/articles"
                  className="inline-flex items-center gap-2 rounded-xl border border-[#c7d3eb] bg-white px-5 py-3 text-sm font-semibold text-[#2b4685] shadow-sm transition hover:bg-[#f7faff]"
                >
                  補助金の基礎を知る
                </Link>
              </div>
            </div>

            <div className="relative flex min-h-[220px] items-center justify-center overflow-hidden rounded-2xl bg-[#060a14] lg:min-h-[280px]">
              <Image
                src={listHeroIsometric}
                alt=""
                width={420}
                height={280}
                className="relative z-10 h-auto max-h-[240px] w-full max-w-[320px] object-contain"
                sizes="(max-width: 1024px) 90vw, 320px"
                priority
              />
            </div>

            <div className="flex flex-col gap-3">
              <div className="rounded-xl border border-[#e2ebf7] bg-[#f8fbff] p-4 text-center shadow-sm">
                <p className="text-[11px] font-medium text-[#5f6d90]">掲載LP数</p>
                <p className="mt-1 text-2xl font-extrabold text-[#1f3c81]">{total}件</p>
              </div>
              <div className="rounded-xl border border-[#e2ebf7] bg-[#f8fbff] p-4 text-center shadow-sm">
                <p className="text-[11px] font-medium text-[#5f6d90]">カテゴリ</p>
                <p className="mt-1 text-2xl font-extrabold text-[#1f3c81]">{categorySummary.length}</p>
              </div>
              <div className="rounded-xl border border-[#e2ebf7] bg-[#f8fbff] p-4 text-center shadow-sm">
                <p className="text-[11px] font-medium text-[#5f6d90]">最終更新</p>
                <p className="mt-1 text-lg font-extrabold leading-tight text-[#1f3c81]">{latestUpdated}</p>
              </div>
            </div>
          </div>
        </div>

        <aside className="rounded-2xl border border-[#dbe3f0] bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#1b2f66]">今見るべき最新情報</h3>
            <Bell className="h-4 w-4 text-[#5372b7]" />
          </div>
          <p className="mt-1 text-[11px] text-[#8b95ae]">更新・締切・速報をチェック</p>
          <div className="mt-3 space-y-2">
            {newsItems.map((item, idx) => {
              const ribbon = newsRibbon(item, idx);
              return (
                <Link
                  key={item.id}
                  href={`/subsidies/list/${item.id}`}
                  className="block rounded-xl border border-[#e7edf8] p-3 transition hover:border-[#c7d5f1] hover:bg-[#f7faff]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className={`rounded px-2 py-0.5 text-[11px] font-bold ${ribbon.className}`}>{ribbon.label}</span>
                    <span className="text-[11px] text-[#6f7b97]">
                      {new Date(item.updatedAt).toLocaleDateString("ja-JP")}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm font-semibold leading-5 text-[#1f2f56]">
                    {item.name ?? "名称未設定"}
                  </p>
                </Link>
              );
            })}
          </div>
        </aside>
      </section>

      {/* 経営課題から探す */}
      <section className="rounded-2xl border border-[#e4eaf4] bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-[#1b2f66]">経営課題から探す</h3>
            <p className="mt-1 text-sm text-[#627091]">業種・課題別にLPを絞り込みできます。</p>
          </div>
          {activeCategory ? (
            <button
              type="button"
              onClick={() => setActiveCategory(null)}
              className="text-sm font-semibold text-[#1248b7] underline-offset-2 hover:underline"
            >
              条件をクリア
            </button>
          ) : null}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {categorySummary.map((category) => {
            const Icon = category.icon;
            const selected = activeCategory === category.id;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveCategory((c) => (c === category.id ? null : category.id))}
                className={`group flex flex-col rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${
                  selected ? "border-[#1248b7] ring-2 ring-[#1248b7]/25" : "border-[#e8edf7]"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-xl border ${category.chipClass}`}
                  >
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-[#8aa0d1] opacity-0 transition group-hover:opacity-100" />
                </div>
                <p className="mt-3 text-sm font-bold text-[#1f355f]">{category.label}</p>
                <p className="mt-1 text-xs font-semibold text-[#5a6d94]">
                  {category.count}件のLP <span className="text-[#1248b7]">→</span>
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* メインギャラリー + サイド */}
      <section className="rounded-2xl border border-[#dbe3f0] bg-white p-5 shadow-sm md:p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-[#1b2f66]">LPカードギャラリー</h3>
            <p className="mt-1 text-sm text-[#627091]">ビジュアルと概要で制度を選べます。</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-xl border border-[#d6e1f4] bg-[#f7faff] p-1">
              {(["open", "all", "closed"] as StatusTab[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTab(key)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    tab === key ? "bg-white text-[#234d9f] shadow-sm" : "text-[#5d6f96]"
                  }`}
                >
                  {key === "open"
                    ? `公募中 (${counts.open})`
                    : key === "closed"
                      ? `締切済 (${counts.closed})`
                      : `すべて (${counts.all})`}
                </button>
              ))}
            </div>
            <div className="flex items-center rounded-xl border border-[#d6e1f4] bg-white px-3 py-2 shadow-sm">
              <Search className="mr-2 h-4 w-4 text-[#8193bc]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="補助金名・業種で検索"
                className="w-44 bg-transparent text-sm outline-none md:w-52"
              />
            </div>
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as "recommended" | "deadline" | "amount")}
              className="rounded-xl border border-[#d6e1f4] bg-white px-3 py-2 text-sm text-[#2a3f72] shadow-sm"
            >
              <option value="recommended">表示順: おすすめ順</option>
              <option value="deadline">表示順: 締切が近い順</option>
              <option value="amount">表示順: 金額が高い順</option>
            </select>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
          <div>
            {filtered.length === 0 ? (
              <p className="py-16 text-center text-sm text-[#6a6760]">
                条件に一致する補助金が見つかりませんでした。
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {filtered.map((grant) => {
                  const isExpired = isExpiredDeadline(grant.deadline);
                  const isSoon = isDeadlineSoon(grant.deadline);
                  const visual = resolveVisual(grant);
                  const lpBadges = resolveLpBadges(grant);

                  return (
                    <Link
                      key={grant.id}
                      href={`/subsidies/list/${grant.id}`}
                      aria-disabled={isExpired}
                      tabIndex={isExpired ? -1 : 0}
                      className={`group flex flex-col overflow-hidden rounded-2xl border border-[#e2e8f4] bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-[#c9d7ef] hover:shadow-lg ${
                        isExpired ? "pointer-events-none opacity-55 grayscale" : ""
                      }`}
                    >
                      <div className="relative aspect-video w-full overflow-hidden">
                        <Image
                          src={visual.image}
                          alt=""
                          fill
                          className="object-cover transition duration-300 group-hover:scale-[1.03]"
                          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                        <div className="absolute left-3 top-3 flex max-w-[calc(100%-1.5rem)] flex-wrap gap-1.5">
                          {lpBadges.map((b) => (
                            <span
                              key={b}
                              className={`rounded-md px-2 py-0.5 text-[10px] font-bold shadow-sm ${
                                b === "NEW"
                                  ? "bg-red-500 text-white"
                                  : b === "締切間近"
                                    ? "bg-amber-500 text-white"
                                    : b === "人気"
                                      ? "bg-rose-600 text-white"
                                      : "bg-white/95 text-[#1b2f66]"
                              }`}
                            >
                              {b}
                            </span>
                          ))}
                          <span className="rounded-md bg-[#113f9f]/95 px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm">
                            {visual.badge}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-1 flex-col p-4">
                        <h4 className="line-clamp-2 min-h-[3rem] text-base font-bold leading-snug text-[#1f2f57]">
                          {grant.name ?? "名称未設定"}
                        </h4>
                        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[#5f6f90]">
                          {grantSubtitle(grant)}
                        </p>

                        <div className="mt-4 flex items-end justify-between gap-2 border-t border-[#edf1f8] pt-4">
                          <div>
                            <p className="text-[11px] font-medium text-[#6f7b96]">最大補助額</p>
                            <p className="text-xl font-extrabold tracking-tight text-[#2154b8] md:text-2xl">
                              {formatAmountLabel(grant).replace(/^最大\s*/, "").replace(/\s*円$/, "")}
                              <span className="ml-0.5 text-sm font-semibold text-[#5f6f93]">円</span>
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[11px] text-[#627091]">締切まで</p>
                            <p className={`text-sm font-bold ${isSoon ? "text-[#d12d2d]" : "text-[#203b79]"}`}>
                              {daysLeftLabel(grant.deadline)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between text-[11px] text-[#5f7097]">
                          <span>
                            {grant.prefecture == null ||
                            grant.prefecture === "全国" ||
                            grant.prefecture.includes("全国")
                              ? "全国対象"
                              : grant.prefecture}
                          </span>
                          <span>{formatDeadlineLabel(grant)}</span>
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t border-[#edf1f8] pt-3">
                          <span className="text-sm font-bold text-[#1248b7] transition group-hover:text-[#0f3d99]">
                            LPを詳しく見る <span aria-hidden>→</span>
                          </span>
                          <ArrowRight className="h-4 w-4 text-[#1248b7] transition group-hover:translate-x-0.5" />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
            <div className="rounded-2xl border border-[#e2e8f4] bg-white p-4 shadow-sm">
              <h4 className="flex items-center gap-2 text-sm font-bold text-[#1e3878]">
                <Trophy className="h-4 w-4 text-[#e7a62c]" />
                締切が近いLP
              </h4>
              <div className="mt-3 space-y-2">
                {deadlineRanking.map((item) => (
                  <Link
                    key={item.id}
                    href={`/subsidies/list/${item.id}`}
                    className="block rounded-xl border border-[#e8edf7] px-3 py-2.5 transition hover:bg-[#f7faff]"
                  >
                    <p className="line-clamp-2 text-sm font-semibold leading-snug text-[#243862]">
                      {item.name ?? "名称未設定"}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-[#cf2f2f]">{daysLeftLabel(item.deadline)}</p>
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[#d7e2f7] bg-[#f6f9ff] p-4 shadow-sm">
              <h4 className="text-sm font-bold text-[#1f3f85]">比較リスト</h4>
              <p className="mt-2 text-xs leading-relaxed text-[#5e6f95]">
                気になるLPを最大3件まで比較できる機能を準備中です（現在は診断から候補を絞り込めます）。
              </p>
              <p className="mt-2 text-center text-sm font-bold text-[#1f3f85]">比較リスト（0件）</p>
              <Link
                href="/subsidies/check"
                className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-[#c7d8f0] bg-white px-4 py-2.5 text-sm font-semibold text-[#1f4dab] shadow-sm transition hover:bg-[#f7faff]"
              >
                比較・診断へ進む
              </Link>
            </div>

            <div className="overflow-hidden rounded-2xl border border-[#dce4f7] bg-white shadow-sm">
              <div className="relative h-40 w-full">
                <Image
                  src={expertPhoto}
                  alt="補助金・申請支援に詳しい専門スタッフ"
                  fill
                  className="object-cover object-top"
                  sizes="300px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d2640]/90 to-transparent" />
              </div>
              <div className="p-4">
                <h4 className="text-sm font-bold text-[#1f3f85]">専門家に相談</h4>
                <p className="mt-2 text-xs leading-relaxed text-[#617199]">
                  診断結果をもとに、申請の可否や準備の進め方を無料でご案内します。
                </p>
                <Link
                  href="/contact"
                  className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-[#1a7b6f] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#16665c]"
                >
                  無料で相談予約する
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* 下部CTA帯 */}
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-[#dce4f7] bg-white p-5 shadow-sm">
          <h4 className="flex items-center gap-2 text-sm font-bold text-[#1d3c80]">
            <Search className="h-4 w-4" />
            自社に合う補助金が30秒でわかる
          </h4>
          <p className="mt-2 text-xs leading-relaxed text-[#5f719a]">
            いくつかの質問に答えるだけで、候補制度を提案します。
          </p>
          <Link
            href="/subsidies/check"
            className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#1e4fab]"
          >
            無料診断をはじめる
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="rounded-2xl border border-[#dce4f7] bg-white p-5 shadow-sm">
          <h4 className="flex items-center gap-2 text-sm font-bold text-[#1d3c80]">
            <CalendarClock className="h-4 w-4" />
            補助金の基礎を知りたい方へ
          </h4>
          <p className="mt-2 text-xs leading-relaxed text-[#5f719a]">
            制度の理解や申請の流れを、初心者向けにわかりやすく解説します。
          </p>
          <Link
            href="/subsidies/articles"
            className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#1e4fab]"
          >
            補助金ガイドを見る
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="rounded-2xl border border-[#dce4f7] bg-white p-5 shadow-sm">
          <h4 className="flex items-center gap-2 text-sm font-bold text-[#1d3c80]">
            <Bell className="h-4 w-4" />
            最新情報をお届け
          </h4>
          <p className="mt-2 text-xs leading-relaxed text-[#5f719a]">
            新しい公募や更新情報をメールで受け取り、見逃しを防げます。
          </p>
          <div className="mt-4 flex gap-2">
            <input
              type="email"
              placeholder="メールアドレス"
              className="min-w-0 flex-1 rounded-xl border border-[#d6dff2] px-3 py-2 text-sm shadow-sm"
            />
            <button
              type="button"
              className="shrink-0 rounded-xl bg-[#1248b7] px-4 py-2 text-sm font-semibold text-white shadow-sm"
            >
              登録する
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

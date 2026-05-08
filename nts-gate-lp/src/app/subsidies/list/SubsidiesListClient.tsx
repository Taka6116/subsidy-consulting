"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BookOpen,
  CirclePlay,
  CalendarClock,
  Cpu,
  FileText,
  GitMerge,
  HardHat,
  LayoutGrid,
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
      {/* Hero */}
      <section className="mx-auto w-full max-w-[1500px]">
        <div className="rounded-[28px] border border-slate-200/70 bg-gradient-to-b from-white to-[#f6f9ff] p-5 shadow-sm md:p-8 xl:p-10">
          <div className="grid items-center gap-8 xl:grid-cols-[1.05fr_1.25fr_0.85fr]">
            <div>
              <span className="inline-flex items-center rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-[#0e357f] ring-1 ring-blue-100">
                補助金LPライブラリ
              </span>
              <h1 className="mt-6 text-[32px] font-black leading-[1.22] tracking-tight text-slate-950 md:text-[40px] xl:text-[42px]">
                あなたの経営課題に、
                <br />
                使える<span className="text-[#0e57d8]">補助金</span>があります。
              </h1>
              <p className="mt-5 text-[15px] leading-7 text-slate-600 md:text-base">
                全国の自治体・省庁サイトをAIが24時間クロール。
                <br />
                最新の補助金情報を、わかりやすくお届けします。
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href="/subsidies/check"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#0f4db8] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#0d419a]"
                >
                  今すぐ自社に合う制度を診断する（無料・1分）
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/subsidies/articles"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#c7d3eb] bg-white px-6 py-3 text-sm font-bold text-[#23458a] shadow-sm transition hover:bg-[#f7faff]"
                >
                  <BookOpen className="h-4 w-4" />
                  補助金の基礎を知る
                </Link>
              </div>
            </div>

            <div className="relative flex min-h-[300px] items-center justify-center md:min-h-[360px] xl:min-h-[380px]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.14),transparent_62%)]" />
              <Image
                src="/images/subsidy-hero-isometric.webp"
                alt="補助金情報を分析するビジネスチームのイラスト"
                width={760}
                height={520}
                priority
                className="relative z-10 w-full max-w-[680px] object-contain drop-shadow-[0_24px_50px_rgba(15,23,42,0.12)]"
              />
              <div className="absolute bottom-5 left-3 z-20 rounded-2xl bg-white/90 px-5 py-3 shadow-lg ring-1 ring-slate-200 backdrop-blur md:bottom-8 md:left-8 md:px-6 md:py-4">
                <p className="text-sm font-black text-slate-900">リアルタイム検知</p>
                <p className="mt-1 text-xs text-slate-500">
                  全国の公募情報を24時間更新中 <span className="ml-2 font-semibold text-emerald-500">● LIVE</span>
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-[#1f54c0]">
                    <FileText className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-500">掲載LP数</p>
                    <p className="mt-1 text-4xl font-black leading-none text-[#1f3c81]">{total}件</p>
                    <p className="mt-2 text-xs font-medium text-slate-500">最新の補助金LPを掲載中</p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <LayoutGrid className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-500">カテゴリ</p>
                    <p className="mt-1 text-4xl font-black leading-none text-[#1f3c81]">{categorySummary.length}</p>
                    <p className="mt-2 text-xs font-medium text-slate-500">業種・課題別に分類</p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-violet-50 text-violet-600">
                    <CalendarClock className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-500">最終更新</p>
                    <p className="mt-1 text-3xl font-black leading-none text-[#1f3c81]">{latestUpdated}</p>
                    <p className="mt-2 text-xs font-medium text-slate-500">最新情報に自動更新</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="grid gap-px bg-slate-200 md:grid-cols-2 xl:grid-cols-4">
              <Link href="/subsidies/list" className="bg-white p-6 transition hover:bg-[#f8fbff]">
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#edf4ff] text-[#2453b8]">
                  <Search className="h-7 w-7" />
                </span>
                <h3 className="mt-4 text-[30px] font-black leading-none text-[#1b2f66]">探す</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">業種・課題・地域から使える補助金を検索</p>
                <p className="mt-4 text-sm font-bold text-[#1f4dab]">補助金一覧を見る →</p>
              </Link>
              <Link href="/subsidies/articles" className="bg-white p-6 transition hover:bg-[#f8fbff]">
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <BookOpen className="h-7 w-7" />
                </span>
                <h3 className="mt-4 text-[30px] font-black leading-none text-[#1b2f66]">学ぶ</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">制度の解説や申請のポイントを記事でわかりやすく解説</p>
                <p className="mt-4 text-sm font-bold text-[#1f4dab]">解説記事を読む →</p>
              </Link>
              <Link href="/subsidies/videos" className="bg-white p-6 transition hover:bg-[#f8fbff]">
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-violet-50 text-violet-600">
                  <CirclePlay className="h-7 w-7" />
                </span>
                <h3 className="mt-4 text-[30px] font-black leading-none text-[#1b2f66]">理解する</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">動画で制度のポイントや成功事例をチェック</p>
                <p className="mt-4 text-sm font-bold text-[#1f4dab]">動画を見る →</p>
              </Link>
              <Link href="/contact" className="bg-white p-6 transition hover:bg-[#f8fbff]">
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                  <Users className="h-7 w-7" />
                </span>
                <h3 className="mt-4 text-[30px] font-black leading-none text-[#1b2f66]">相談する</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">専門家に無料で相談。伴走支援でサポート</p>
                <p className="mt-4 text-sm font-bold text-[#1f4dab]">無料相談を予約する →</p>
              </Link>
            </div>
          </div>
        </div>
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

    </div>
  );
}

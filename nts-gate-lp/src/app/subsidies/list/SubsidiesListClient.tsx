"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  Crown,
  Cpu,
  FileText,
  GitMerge,
  HardHat,
  Leaf,
  Search,
  Truck,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import type { StaticImageData } from "next/image";
import logisticsHero from "../../../../icon-assets/logistics-hero.webp";
import constructionHero from "../../../../icon-assets/construction-hero.webp";
import dxHero from "../../../../icon-assets/dx-hero.webp";
import hrHero from "../../../../icon-assets/human-resources-hero.webp";
import equipmentHero from "../../../../icon-assets/equipment-hero.webp";
import businessPlanHero from "../../../../icon-assets/business-plan-hero.webp";
import generalHero from "../../../../icon-assets/general-hero.webp";
import oldFacilityHero from "../../../../icon-assets/old-facility.webp";
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
  image: string | StaticImageData;
  badge: string;
};

function articlePictureUrl(folder: string, file: string): string {
  return `/api/article-pictures/${encodeURIComponent(folder)}/${encodeURIComponent(file)}`;
}

const VISUAL_RULES: Array<{
  keywords: string[];
  visual: CardVisual;
}> = [
  {
    keywords: ["環境", "省エネ", "再エネ", "脱炭素", "co2"],
    visual: {
      title: "環境・省エネ",
      subtitle: "脱炭素投資",
      image: oldFacilityHero,
      badge: "環境・省エネ",
    },
  },
  {
    keywords: ["運送", "物流", "配送"],
    visual: {
      title: "物流・運送",
      subtitle: "効率化支援",
      image: logisticsHero,
      badge: "物流・運送",
    },
  },
  {
    keywords: ["建設", "設備", "土木", "重機"],
    visual: {
      title: "建設・設備",
      subtitle: "省力化投資",
      image: constructionHero,
      badge: "建設・設備",
    },
  },
  {
    keywords: ["DX", "IT", "デジタル", "システム"],
    visual: {
      title: "DX・IT",
      subtitle: "導入支援",
      image: dxHero,
      badge: "DX・IT",
    },
  },
  {
    keywords: ["人材", "採用", "賃上げ"],
    visual: {
      title: "人材・採用",
      subtitle: "賃上げ支援",
      image: hrHero,
      badge: "人材・採用",
    },
  },
  {
    keywords: ["事業承継", "m&a", "承継", "買収"],
    visual: {
      title: "事業承継・M&A",
      subtitle: "継続と成長",
      image: generalHero,
      badge: "事業承継",
    },
  },
  {
    keywords: ["事業計画", "創業", "スタートアップ"],
    visual: {
      title: "事業計画",
      subtitle: "成長加速",
      image: businessPlanHero,
      badge: "事業計画",
    },
  },
  {
    keywords: ["機械", "製造", "更新"],
    visual: {
      title: "設備投資",
      subtitle: "生産性向上",
      image: equipmentHero,
      badge: "設備投資",
    },
  },
];

const DEFAULT_VISUAL: CardVisual = {
  title: "補助金LP",
  subtitle: "最新制度",
  image: generalHero,
  badge: "公募中",
};

function resolveVisual(grant: SubsidyCard): CardVisual {
  const text = `${grant.name ?? ""} ${(grant.targetIndustries ?? []).join(" ")}`.toLowerCase();
  const matched = VISUAL_RULES.find((rule) =>
    rule.keywords.some((keyword) => text.includes(keyword.toLowerCase())),
  );
  const visual = matched?.visual ?? DEFAULT_VISUAL;
  if (!grant.cardImagePath) return visual;
  return { ...visual, image: grant.cardImagePath };
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
  cardImagePath: string | null;
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
}: {
  grants: SubsidyCard[];
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
      } else if (activeCategory === "other") {
        list = list.filter((g) => {
          const blob = `${g.name ?? ""} ${g.description ?? ""} ${(g.targetIndustries ?? []).join(" ")}`.toLowerCase();
          return !CATEGORY_ITEMS.some((item) =>
            item.keywords.some((k) => blob.includes(k.toLowerCase())),
          );
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
  const featuredLps = useMemo(
    () =>
      [...grants]
        .filter((g) => !isExpiredDeadline(g.deadline))
        .sort((a, b) => {
          const amountDiff = parseAmountYen(b) - parseAmountYen(a);
          if (amountDiff !== 0) return amountDiff;
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        })
        .slice(0, 4),
    [grants],
  );
  const newestLps = useMemo(
    () =>
      [...grants]
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 6),
    [grants],
  );
  const heroCategoryCards = useMemo(() => {
    const cardMeta: Record<string, { label: string; imagePath: string }> = {
      logistics: {
        label: "物流・運送",
        imagePath: articlePictureUrl("運送", "運送系.webp"),
      },
      construction: {
        label: "建設・設備",
        imagePath: articlePictureUrl("建設", "建設系4.webp"),
      },
      dx: {
        label: "DX・IT化",
        imagePath: articlePictureUrl("DX・IT", "DX・IT系2.webp"),
      },
      hr: {
        label: "人材・採用・賃上げ",
        imagePath: articlePictureUrl("人材・採用", "人材・採用2.webp"),
      },
      green: {
        label: "環境・省エネ",
        imagePath: articlePictureUrl(
          "設備・設備投資",
          "investors-examine-solar-panel-surface-using-tablet-discussing-design-efficiency.webp",
        ),
      },
      mna: {
        label: "その他",
        imagePath: articlePictureUrl("事業計画", "hr-managers-interviewing-job-applicant.webp"),
      },
    };
    const cards = CATEGORY_ITEMS.map((item) => {
      const count = grants.filter((g) => {
        const text = `${g.name ?? ""} ${g.description ?? ""} ${(g.targetIndustries ?? []).join(" ")}`.toLowerCase();
        return item.keywords.some((k) => text.includes(k.toLowerCase()));
      }).length;
      const meta = cardMeta[item.id];
      return {
        id: item.id,
        label: meta?.label ?? item.label,
        count,
        icon: item.icon,
        chipClass: item.chipClass,
        imagePath: meta?.imagePath ?? null,
      };
    });
    return cards;
  }, [grants]);

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="-mx-3 overflow-hidden bg-[#061a3d] md:-mx-5 lg:-mx-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_76%_45%,rgba(37,99,235,0.38),transparent_44%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.06)_0%,transparent_42%)] opacity-40" />
        <div className="relative mx-auto grid max-w-[1500px] gap-8 px-4 py-8 md:px-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:py-10">
          <div className="relative z-10">
            <div className="inline-flex rounded-full border border-cyan-300/50 bg-white/5 px-4 py-1.5 text-sm font-bold text-cyan-100 backdrop-blur">
              LPライブラリ
            </div>
            <h1 className="mt-6 text-[34px] font-black leading-[1.18] tracking-tight text-white md:text-[44px]">
              あなたの課題に近い
              <br />
              <span className="text-cyan-300">補助金ページ</span>を
              <br />
              探せます。
            </h1>
            <p className="mt-5 max-w-[560px] text-[15px] leading-7 text-blue-50/90 md:text-[16px] md:leading-8">
              設備投資・DX・人材採用・省エネなど、
              <br />
              経営課題ごとに使える可能性のある補助金をわかりやすく整理しました。
            </p>
            <div className="mt-6">
              <Link
                href="/subsidies/check"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#0f4db8] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#0d419a]"
              >
                対象の補助金を診断する
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-6 grid max-w-[720px] grid-cols-2 gap-3 md:grid-cols-4">
              {[
                { icon: Zap, title: "最新情報に更新", text: "毎日チェック" },
                { icon: BookOpen, title: "活用事例も確認", text: "成功事例を紹介" },
                { icon: FileText, title: "申請の流れも解説", text: "初めてでも安心" },
                { icon: Crown, title: "専門家が監修", text: "信頼できる情報" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="rounded-xl border border-white/15 bg-white/[0.07] px-4 py-3 backdrop-blur"
                  >
                    <Icon className="h-5 w-5 text-amber-400" />
                    <p className="mt-2 text-sm font-bold text-white">{item.title}</p>
                    <p className="mt-1 text-xs text-blue-100/80">{item.text}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative h-[250px] overflow-hidden rounded-xl md:h-[315px]">
            <Image
              src="/images/lp-library-hero-mosaic.png"
              alt="業界・課題別の補助金LPライブラリ"
              width={1100}
              height={520}
              priority
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-y-0 left-0 w-36 bg-gradient-to-r from-[#061a3d] to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#061a3d]/30 via-transparent to-transparent" />
          </div>
        </div>
      </section>

      {/* 経営課題から探す */}
      <section className="rounded-xl border border-[#dbe3f0] bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-black text-slate-900">経営課題から探す</h2>
          {activeCategory ? (
            <button
              type="button"
              onClick={() => setActiveCategory(null)}
              className="text-sm font-semibold text-[#1248b7] underline-offset-2 hover:underline"
            >
              条件をクリア
            </button>
          ) : (
            <Link href="/subsidies/lp" className="text-sm font-bold text-[#0e357f]">
              すべてのカテゴリを見る →
            </Link>
          )}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7">
          {heroCategoryCards.map((category) => {
            const Icon = category.icon;
            const selected = activeCategory === category.id;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveCategory((c) => (c === category.id ? null : category.id))}
                className={`group overflow-hidden rounded-xl border text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                  selected ? "border-[#1248b7] ring-2 ring-[#1248b7]/20" : "border-slate-200"
                } bg-white`}
              >
                <div className="relative aspect-[16/7] w-full overflow-hidden">
                  {category.imagePath ? (
                    <Image
                      src={category.imagePath}
                      alt={`${category.label}のイメージ`}
                      fill
                      className="object-cover transition duration-300 group-hover:scale-[1.03]"
                      sizes="(max-width: 1280px) 50vw, 220px"
                    />
                  ) : (
                    <div className={`h-full w-full ${category.chipClass}`} />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
                </div>
                <div className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border ${category.chipClass}`}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-black leading-tight text-[#1f355f]">{category.label}</p>
                      <p className="mt-0.5 text-xs text-[#5a6d94]">{category.count}件のLP</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[#8aa0d1] transition group-hover:translate-x-1" />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 注目LP + 新着LP */}
      <section className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-xl border border-[#dbe3f0] bg-white p-5 shadow-sm">
          <h3 className="text-sm font-black text-[#1b2f66]">注目LP（今見られています）</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {featuredLps.map((item) => (
              <Link
                key={item.id}
                href={`/subsidies/list/${item.id}`}
                className="rounded-xl border border-[#e6ecf8] bg-[#fbfdff] p-3 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <p className="line-clamp-2 text-sm font-bold leading-snug text-[#1f2f57]">{item.name ?? "名称未設定"}</p>
                <p className="mt-3 text-2xl font-black text-[#2154b8]">
                  {formatAmountLabel(item).replace(/^最大\s*/, "").replace(/\s*円$/, "")}
                  <span className="ml-0.5 text-sm font-semibold text-[#5f6f93]">円</span>
                </p>
                <p className="mt-1 text-xs font-bold text-[#d12d2d]">{daysLeftLabel(item.deadline)}</p>
              </Link>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-[#dbe3f0] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-[#1b2f66]">新着LP</h3>
            <Link href="/subsidies/lp" className="text-xs font-bold text-[#0e357f]">
              すべての新着LPを見る
            </Link>
          </div>
          <div className="mt-3 space-y-2">
            {newestLps.map((item) => (
              <Link
                key={item.id}
                href={`/subsidies/list/${item.id}`}
                className="block rounded-lg border border-[#e8edf7] px-3 py-2.5 transition hover:bg-[#f7faff]"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded bg-pink-500 px-1.5 py-0.5 text-[10px] font-bold text-white">NEW</span>
                  <span className="text-[11px] text-[#6f7b97]">{new Date(item.updatedAt).toLocaleDateString("ja-JP")}</span>
                </div>
                <p className="mt-1 line-clamp-2 text-sm font-semibold text-[#243862]">{item.name ?? "名称未設定"}</p>
                <p className="mt-1 text-xs text-[#5f7097]">{formatAmountLabel(item)}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA帯 */}
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-[#dbe3f0] bg-white p-5 shadow-sm">
          <p className="text-sm font-black text-[#1b2f66]">どの補助金が自社に合うか迷っていませんか？</p>
          <Link
            href="/subsidies/check"
            className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#1f4dab]"
          >
            無料で診断してみる（1分） <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="rounded-xl border border-[#dbe3f0] bg-white p-5 shadow-sm">
          <p className="text-sm font-black text-[#1b2f66]">LPを比較したい方へ</p>
          <Link href="/subsidies/check" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#1f4dab]">
            比較リストを見る <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="rounded-xl border border-[#113f9f] bg-[#113f9f] p-5 text-white shadow-sm">
          <p className="text-sm font-black">専門家に相談したい方へ</p>
          <Link href="/contact" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-white">
            無料相談を予約する <ArrowRight className="h-4 w-4" />
          </Link>
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

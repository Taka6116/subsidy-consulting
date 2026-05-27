import type { Metadata } from "next";
import Header from "@/components/shared/Header";
import LpFooter from "@/components/gate-lp/LpFooter";
import { prisma } from "@/lib/db/prisma";
import { pickHeroImage } from "@/lib/content/imagePool";
import SubsidiesArticlesIndex, {
  type ArticleCard,
  type ArticlesPortalData,
} from "./SubsidiesArticlesIndex";

export const metadata: Metadata = {
  title: "解説記事 | 日本提携支援",
  description: "補助金・支援制度に関する解説記事をまとめてお届けします。",
};

// 5 分 ISR（Bedrock で新規生成されたら次回アクセス時に反映）
export const revalidate = 300;

function formatPublishedAt(date: Date | null): string {
  if (!date) return "";
  return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
}

const DEADLINE_MAX = new Date("2050-01-01");
const DAY_MS = 24 * 60 * 60 * 1000;

function formatDeadlineLabelForCard(
  deadlineLabel: string | null | undefined,
  deadline: Date | null | undefined,
  rawPayload: unknown,
): string | null {
  const raw = rawPayload as Record<string, unknown> | null;
  const dateFromRaw = raw?.application_end_date
    ? new Date(String(raw.application_end_date))
    : null;

  const candidates = [
    deadline instanceof Date ? deadline : null,
    dateFromRaw,
    deadlineLabel ? new Date(deadlineLabel) : null,
  ];

  for (const d of candidates) {
    if (d && !Number.isNaN(d.getTime()) && d < DEADLINE_MAX) {
      return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
    }
  }
  return null;
}

function resolveDeadlineDate(
  deadlineLabel: string | null | undefined,
  deadline: Date | null | undefined,
  rawPayload: unknown,
): Date | null {
  const raw = rawPayload as Record<string, unknown> | null;
  const dateFromRaw = raw?.application_end_date
    ? new Date(String(raw.application_end_date))
    : null;

  const candidates = [
    deadline instanceof Date ? deadline : null,
    dateFromRaw,
    deadlineLabel ? new Date(deadlineLabel) : null,
  ];

  for (const d of candidates) {
    if (d && !Number.isNaN(d.getTime()) && d < DEADLINE_MAX) {
      return d;
    }
  }
  return null;
}

/**
 * 最大補助額ラベルを整形する。
 * - maxAmountLabel が設定されていれば、それに "最大" を補って返す。
 * - 無ければ subsidyAmount（円）から 万円 / 億円 で自動算出する。
 */
function formatMaxAmount(
  label: string | null | undefined,
  amountYen: bigint | null | undefined,
): string | null {
  const pick = (s: string | null | undefined) => (s ? s.trim() : "");
  const raw = pick(label);
  if (raw) {
    return raw.startsWith("最大") ? raw : `最大 ${raw}`;
  }
  if (amountYen == null) return null;
  const yen = Number(amountYen);
  if (!Number.isFinite(yen) || yen <= 0) return null;
  const man = yen / 10000;
  if (man >= 10000) {
    const oku = man / 10000;
    return `最大 ${oku.toFixed(oku >= 10 ? 0 : 1)}億円`;
  }
  return `最大 ${Math.round(man).toLocaleString("ja-JP")}万円`;
}

export default async function SubsidiesArticlesPage() {
  const now = new Date();
  const rows = await prisma.generatedContent.findMany({
    where: {
      contentType: "article",
      status: "published",
      slug: { not: undefined },
      grant: {
        is: { status: "open" },
      },
    },
    orderBy: { publishedAt: "desc" },
    take: 500,
    include: {
      grant: {
        select: {
          id: true,
          name: true,
          maxAmountLabel: true,
          subsidyAmount: true,
          deadlineLabel: true,
          deadline: true,
          rawPayload: true,
          prefecture: true,
          targetIndustries: true,
        },
      },
    },
  });

  const articles: ArticleCard[] = rows
    .filter((r) => r.slug && r.title)
    .map((r) => ({
      id: r.id,
      slug: r.slug as string,
      title: r.title as string,
      excerpt: r.excerpt ?? "",
      publishedAt: formatPublishedAt(r.publishedAt),
      publishedAtIso: r.publishedAt ? r.publishedAt.toISOString() : null,
      subsidyName: r.grant?.name ?? "",
      maxAmountLabel: formatMaxAmount(
        r.grant?.maxAmountLabel,
        r.grant?.subsidyAmount,
      ),
      deadlineLabel: formatDeadlineLabelForCard(
        r.grant?.deadlineLabel,
        r.grant?.deadline,
        r.grant?.rawPayload,
      ),
      prefecture: r.grant?.prefecture ?? null,
      tags: r.tags ?? [],
      // 既存記事でも、ジャンル別フォルダ画像があれば優先的に反映
      heroImagePath: pickHeroImage({
        subsidyId: r.subsidyId,
        seedKey: r.id,
        tags: r.tags ?? [],
        targetIndustries: r.grant?.targetIndustries ?? [],
      }),
    }));

  const validRows = rows.filter((r) => r.slug && r.title);

  const tickerItems = validRows.slice(0, 8).map((r) => {
    const deadlineDate = resolveDeadlineDate(
      r.grant?.deadlineLabel,
      r.grant?.deadline,
      r.grant?.rawPayload,
    );
    const isClosingSoon = deadlineDate
      ? deadlineDate.getTime() - now.getTime() <= 14 * DAY_MS &&
        deadlineDate.getTime() >= now.getTime()
      : false;
    const isNew = r.publishedAt
      ? now.getTime() - r.publishedAt.getTime() <= 2 * DAY_MS
      : false;
    return {
      id: r.id,
      slug: r.slug as string,
      title: r.title as string,
      isNew,
      isClosingSoon,
      publishedAtIso: r.publishedAt ? r.publishedAt.toISOString() : null,
    };
  });

  const newArticlesCount = validRows.filter(
    (r) =>
      r.publishedAt &&
      now.getTime() - r.publishedAt.getTime() <= 7 * DAY_MS,
  ).length;

  const openCount = validRows.filter((r) => {
    const d = resolveDeadlineDate(
      r.grant?.deadlineLabel,
      r.grant?.deadline,
      r.grant?.rawPayload,
    );
    return Boolean(d && d.getTime() > now.getTime());
  }).length;

  const closingSoonCount = validRows.filter((r) => {
    const d = resolveDeadlineDate(
      r.grant?.deadlineLabel,
      r.grant?.deadline,
      r.grant?.rawPayload,
    );
    if (!d) return false;
    const diff = d.getTime() - now.getTime();
    return diff >= 0 && diff <= 14 * DAY_MS;
  }).length;

  const tagCounter = new Map<string, number>();
  for (const row of validRows) {
    for (const tag of row.tags ?? []) {
      if (tag === "お役立ち情報") continue;
      tagCounter.set(tag, (tagCounter.get(tag) ?? 0) + 1);
    }
  }
  const popularCategories = [...tagCounter.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 9)
    .map(([label, count]) => ({ label, count }));

  const deadlineRanking = validRows
    .map((r) => {
      const deadlineDate = resolveDeadlineDate(
        r.grant?.deadlineLabel,
        r.grant?.deadline,
        r.grant?.rawPayload,
      );
      if (!deadlineDate || deadlineDate.getTime() <= now.getTime()) return null;
      const daysLeft = Math.ceil((deadlineDate.getTime() - now.getTime()) / DAY_MS);
      return {
        id: r.id,
        slug: r.slug as string,
        title: r.title as string,
        deadlineLabel: formatDeadlineLabelForCard(
          r.grant?.deadlineLabel,
          r.grant?.deadline,
          r.grant?.rawPayload,
        ),
        daysLeft,
      };
    })
    .filter((v): v is NonNullable<typeof v> => Boolean(v))
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 5);

  const featuredSource = validRows[0] ?? null;
  const featured = featuredSource
    ? {
        slug: featuredSource.slug as string,
        title: featuredSource.title as string,
        subsidyName: featuredSource.grant?.name ?? "注目の補助金",
        imagePath: pickHeroImage({
          subsidyId: featuredSource.subsidyId,
          seedKey: featuredSource.id,
          tags: featuredSource.tags ?? [],
          targetIndustries: featuredSource.grant?.targetIndustries ?? [],
        }),
        publishedAtIso: featuredSource.publishedAt
          ? featuredSource.publishedAt.toISOString()
          : null,
      }
    : null;

  const portalData: ArticlesPortalData = {
    tickerItems,
    stats: {
      newArticlesCount,
      openCount,
      closingSoonCount,
      totalCount: validRows.length,
    },
    popularCategories,
    deadlineRanking,
    featured,
  };

  return (
    <>
      <Header />
      <main className="relative z-[2] min-h-[100svh] bg-[#f9f7f2] pt-16 font-body sm:pt-20">
        <SubsidiesArticlesIndex articles={articles} portalData={portalData} />
      </main>
      <LpFooter />
    </>
  );
}

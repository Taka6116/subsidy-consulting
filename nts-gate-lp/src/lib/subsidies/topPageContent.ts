/**
 * 補助金TOP（/subsidies）ファーストビュー用のコンテンツ一括取得。
 * 新着記事・解説動画・活用ガイド・新着補助金（速報）をサーバー側でまとめて取得する。
 */
import { prisma } from "@/lib/db/prisma";
import { pickHeroImage } from "@/lib/content/imagePool";

export type TopArticleItem = {
  slug: string;
  title: string;
  dateLabel: string;
  imagePath: string;
};

export type TopVideoItem = {
  slug: string;
  title: string;
  durationSec: number | null;
  thumbnailPath: string | null;
};

export type TopGuideItem = {
  href: string;
  title: string;
  description: string;
};

export type TopLiveItem = {
  id: string;
  name: string;
  area: string;
  minutesAgo: number | null;
};

export type TopPageContent = {
  articles: TopArticleItem[];
  videos: TopVideoItem[];
  guides: TopGuideItem[];
  liveItems: TopLiveItem[];
};

function formatDateLabel(date: Date | null): string {
  if (!date) return "";
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}.${m}.${d}`;
}

type RawPayloadLike = {
  target_area_search?: string;
  targetAreaSearch?: string;
};

function extractArea(rawPayload: unknown): string {
  const raw = (rawPayload ?? {}) as RawPayloadLike;
  const areaRaw = raw.target_area_search ?? raw.targetAreaSearch ?? "全国";
  return areaRaw.split(" / ")[0].trim();
}

export async function getTopPageContent(): Promise<TopPageContent> {
  const [articleRows, videoRows, guideRows, liveGrants] = await Promise.all([
    prisma.generatedContent.findMany({
      where: {
        contentType: "article",
        status: "published",
        slug: { not: null },
        title: { not: null },
        grant: { is: { status: "open" } },
      },
      orderBy: { publishedAt: "desc" },
      take: 4,
      select: {
        id: true,
        subsidyId: true,
        slug: true,
        title: true,
        tags: true,
        publishedAt: true,
        grant: { select: { targetIndustries: true } },
      },
    }),
    prisma.generatedContent.findMany({
      where: {
        contentType: "video",
        status: "published",
        slug: { not: null },
        title: { not: null },
      },
      orderBy: { publishedAt: "desc" },
      take: 3,
      select: {
        slug: true,
        title: true,
        duration: true,
        thumbnailPath: true,
      },
    }),
    prisma.generatedContent.findMany({
      where: {
        contentType: "lp",
        status: "published",
        title: { not: null },
        grant: { is: { status: "open" } },
      },
      orderBy: { publishedAt: "desc" },
      take: 3,
      select: {
        title: true,
        excerpt: true,
        grant: { select: { id: true, name: true } },
      },
    }),
    prisma.subsidyGrant.findMany({
      where: {
        status: "open",
        name: { not: null },
        source: { in: ["jgrants", "municipality"] },
      },
      orderBy: { syncedAt: "desc" },
      take: 3,
      select: {
        id: true,
        name: true,
        rawPayload: true,
        syncedAt: true,
      },
    }),
  ]);

  const articles: TopArticleItem[] = articleRows
    .filter((r) => r.slug && r.title)
    .map((r) => ({
      slug: r.slug as string,
      title: r.title as string,
      dateLabel: formatDateLabel(r.publishedAt),
      imagePath: pickHeroImage({
        subsidyId: r.subsidyId,
        seedKey: r.id,
        tags: r.tags ?? [],
        targetIndustries: r.grant?.targetIndustries ?? [],
      }),
    }));

  const videos: TopVideoItem[] = videoRows
    .filter((r) => r.slug && r.title)
    .map((r) => ({
      slug: r.slug as string,
      title: r.title as string,
      durationSec: r.duration ?? null,
      thumbnailPath: r.thumbnailPath ?? null,
    }));

  const guides: TopGuideItem[] = guideRows
    .filter((r) => r.grant?.id && (r.grant?.name || r.title))
    .map((r) => ({
      href: `/subsidies/lp/${r.grant!.id}`,
      title: r.grant?.name ?? (r.title as string),
      description: r.excerpt?.trim() || "対象・活用例・申請の流れを整理",
    }));

  const liveItems: TopLiveItem[] = liveGrants.map((g) => ({
    id: g.id,
    name: g.name ?? "補助金情報",
    area: extractArea(g.rawPayload),
    minutesAgo: g.syncedAt
      ? Math.max(1, Math.floor((Date.now() - new Date(g.syncedAt).getTime()) / 60000))
      : null,
  }));

  return { articles, videos, guides, liveItems };
}

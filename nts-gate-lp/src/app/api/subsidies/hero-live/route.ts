import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const revalidate = 300;

type RawPayloadLike = {
  target_area_search?: string;
  targetAreaSearch?: string;
  title?: string;
  name?: string;
};

const MIN_ARTICLE_BODY = 100;

export async function GET() {
  try {
    const grants = await prisma.subsidyGrant.findMany({
      take: 12,
      orderBy: { syncedAt: "desc" },
      where: {
        contents: {
          some: {
            contentType: "article",
            status: "published",
            slug: { not: null },
            body: { not: null },
          },
        },
      },
      select: {
        id: true,
        rawPayload: true,
        syncedAt: true,
        name: true,
        contents: {
          where: {
            contentType: "article",
            status: "published",
            slug: { not: null },
            body: { not: null },
          },
          orderBy: { publishedAt: "desc" },
          take: 1,
          select: { slug: true, body: true },
        },
      },
    });

    const items = grants
      .map((g) => {
        const article = g.contents[0];
        const slug =
          article?.slug && article.body && article.body.length >= MIN_ARTICLE_BODY
            ? article.slug
            : null;
        if (!slug) return null;

        const raw = (g.rawPayload ?? {}) as RawPayloadLike;
        const areaRaw = raw.target_area_search ?? raw.targetAreaSearch ?? "全国";
        const area = areaRaw.split(" / ")[0].trim();
        const minutesAgo = g.syncedAt
          ? Math.max(1, Math.floor((Date.now() - new Date(g.syncedAt).getTime()) / 60000))
          : null;

        return {
          id: g.id,
          articleSlug: slug,
          title: raw.title ?? raw.name ?? g.name ?? "補助金情報",
          area,
          minutesAgo,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item != null)
      .slice(0, 8);

    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ items: [] }, { status: 500 });
  }
}

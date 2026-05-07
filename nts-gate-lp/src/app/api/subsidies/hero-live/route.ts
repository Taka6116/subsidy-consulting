import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const revalidate = 300;

type RawPayloadLike = {
  target_area_search?: string;
  targetAreaSearch?: string;
  title?: string;
  name?: string;
};

export async function GET() {
  try {
    const grants = await prisma.subsidyGrant.findMany({
      take: 8,
      orderBy: { syncedAt: "desc" },
      select: {
        id: true,
        rawPayload: true,
        syncedAt: true,
        name: true,
      },
    });

    const items = grants.map((g) => {
      const raw = (g.rawPayload ?? {}) as RawPayloadLike;
      const areaRaw = raw.target_area_search ?? raw.targetAreaSearch ?? "全国";
      const area = areaRaw.split(" / ")[0].trim();
      const minutesAgo = g.syncedAt
        ? Math.max(1, Math.floor((Date.now() - new Date(g.syncedAt).getTime()) / 60000))
        : null;

      return {
        id: g.id,
        title: raw.title ?? raw.name ?? g.name ?? "補助金情報",
        area,
        minutesAgo,
      };
    });

    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ items: [] }, { status: 500 });
  }
}

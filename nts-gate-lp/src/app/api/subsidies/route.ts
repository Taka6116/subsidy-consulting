import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { buildSmeSubsidyWhere } from "@/lib/subsidies/smeFilter";

export const revalidate = 3600;
export const dynamic = "force-dynamic";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function parseLimit(raw: string | null): number {
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return DEFAULT_LIMIT;
  return Math.min(MAX_LIMIT, Math.floor(n));
}

function parseOffset(raw: string | null): number {
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.floor(n);
}

function parseSource(raw: string | null): "jgrants" | "manual" | "municipality" | "ministry" | undefined {
  if (raw === "jgrants" || raw === "manual" || raw === "municipality" || raw === "ministry") return raw;
  return undefined;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseLimit(searchParams.get("limit"));
    const offset = parseOffset(searchParams.get("offset"));
    const source = parseSource(searchParams.get("source"));
    const sourceRaw = searchParams.get("source");
    const municipalityCode = searchParams.get("municipalityCode")?.trim() || null;
    /** 都道府県フィルター。"全国" を渡すと prefecture が null のものを含む全件。それ以外は完全一致 */
    const prefecture = searchParams.get("prefecture")?.trim() || null;

    if (sourceRaw && !source) {
      return NextResponse.json(
        { error: "Invalid source. Use 'jgrants' | 'manual' | 'municipality' | 'ministry'." },
        { status: 400 },
      );
    }

    const now = new Date();
    // 締切超過分を closed に寄せる（null deadline は対象外）
    await prisma.subsidyGrant.updateMany({
      where: {
        status: "open",
        deadline: { lt: now },
      },
      data: { status: "closed" },
    });

    const exclusionAnd = [
      { name: { not: { contains: "練習" } } },
      { name: { not: { contains: "テスト" } } },
      { name: { not: { contains: "サンプル" } } },
      { name: { not: { contains: "支払いはありません" } } },
    ];

    // 都道府県フィルター: 特定県を指定した場合は その県 OR null(全国) を返す
    const prefectureFilter =
      prefecture && prefecture !== "全国"
        ? { OR: [{ prefecture }, { prefecture: null }] }
        : {};

    const where = buildSmeSubsidyWhere({
      status: "open" as const,
      ...(source === "ministry"
        ? { source: { in: ["meti", "chusho", "maff", "mlit", "ministry"] } }
        : source
          ? { source }
          : {}),
      ...(municipalityCode ? { municipalityCode } : {}),
      AND: exclusionAnd,
      ...prefectureFilter,
    });

    const [grants, total] = await Promise.all([
      prisma.subsidyGrant.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip: offset,
        take: limit,
        select: {
          id: true,
          name: true,
          description: true,
          maxAmountLabel: true,
          rawPayload: true,
          deadlineLabel: true,
          deadline: true,
          targetIndustries: true,
          prefecture: true,
          status: true,
          source: true,
          municipalityCode: true,
          officialPageUrl: true,
          institutionName: true,
          fetchedAt: true,
          updatedAt: true,
        },
      }),
      prisma.subsidyGrant.count({ where }),
    ]);

    return NextResponse.json({
      grants,
      total,
      limit,
      offset,
      source: source ?? null,
      municipalityCode,
    });
  } catch (error) {
    console.error("[api/subsidies] failed to query database:", error);
    return NextResponse.json(
      {
        grants: [],
        total: 0,
        limit: DEFAULT_LIMIT,
        offset: 0,
        warning: "Database is currently unavailable.",
      },
      { status: 200 },
    );
  }
}

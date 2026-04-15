import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

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

function parseSource(raw: string | null): "jgrants" | "manual" | undefined {
  if (raw === "jgrants" || raw === "manual") return raw;
  return undefined;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = parseLimit(searchParams.get("limit"));
  const offset = parseOffset(searchParams.get("offset"));
  const source = parseSource(searchParams.get("source"));
  const sourceRaw = searchParams.get("source");

  if (sourceRaw && !source) {
    return NextResponse.json(
      { error: "Invalid source. Use 'jgrants' or 'manual'." },
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

  const where = source
    ? { status: "open" as const, source }
    : { status: "open" as const };

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
        deadlineLabel: true,
        deadline: true,
        targetIndustries: true,
        status: true,
        source: true,
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
  });
}

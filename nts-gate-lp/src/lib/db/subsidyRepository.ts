import type { SubsidyGrant } from "@prisma/client";
import { prisma } from "./prisma";
import { buildSmeSubsidyWhere } from "@/lib/subsidies/smeFilter";

const VALID_INDUSTRIES = ["manufacturing", "it", "construction"];

/**
 * 補助金の一覧取得。有効な industry のときのみ targetIndustries に has で絞り込み。
 * 未指定・空・型不正・ホワイトリスト外は全件対象（take のみ）。
 */
export async function findSubsidiesByIndustry(industry?: string): Promise<SubsidyGrant[]> {
  const trimmed = typeof industry === "string" ? industry.trim() : "";

  const baseWhere =
    trimmed && VALID_INDUSTRIES.includes(trimmed)
      ? { targetIndustries: { has: trimmed } }
      : undefined;

  return prisma.subsidyGrant.findMany({
    where: buildSmeSubsidyWhere(baseWhere),
    take: 10,
    orderBy: { updatedAt: "desc" },
  });
}

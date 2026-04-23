/**
 * 既存の SubsidyGrant に prefecture を一括バックフィル。
 * rawPayload.target_area_search → prefecture にコピーする。
 * "全国" は prefecture = null（全国対象は特定県ではない）。
 */
import { prisma } from "@/lib/db/prisma";

async function main() {
  const rows = await prisma.subsidyGrant.findMany({
    where: { prefecture: null },
    select: { id: true, rawPayload: true, targetIndustryNote: true },
  });

  console.log("対象件数:", rows.length);

  let updated = 0;
  for (const row of rows) {
    const payload = row.rawPayload as Record<string, unknown> | null;
    const area =
      (payload?.target_area_search as string | undefined) ??
      row.targetIndustryNote ??
      null;

    // "全国" は null 扱い（フィルターで「全国」を選んだときに全件表示）
    const prefecture =
      area && area !== "全国" && area.trim() !== "" ? area.trim() : null;

    if (prefecture !== null) {
      await prisma.subsidyGrant.update({
        where: { id: row.id },
        data: { prefecture },
      });
      updated++;
    }
  }

  console.log("更新件数:", updated);
  const dist = await prisma.subsidyGrant.groupBy({
    by: ["prefecture"],
    _count: { prefecture: true },
    orderBy: { _count: { prefecture: "desc" } },
    take: 20,
  });
  console.log("\n都道府県分布 (上位20):");
  dist.forEach((d) =>
    console.log(`  ${d.prefecture ?? "（全国）"}: ${d._count.prefecture}件`),
  );
}

main().catch(console.error).finally(() => process.exit(0));

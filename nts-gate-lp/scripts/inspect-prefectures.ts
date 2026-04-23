import { prisma } from "@/lib/db/prisma";

async function main() {
  const rows = await prisma.subsidyGrant.findMany({
    select: {
      id: true,
      name: true,
      targetIndustryNote: true,
      targetIndustries: true,
      rawPayload: true,
    },
    take: 20,
  });

  rows.forEach((r) => {
    const payload = r.rawPayload as Record<string, unknown> | null;
    console.log("---");
    console.log("name:", r.name?.slice(0, 40));
    console.log("targetIndustries:", r.targetIndustries);
    console.log("targetIndustryNote:", r.targetIndustryNote?.slice(0, 60));
    // jGrantsの地域フィールドを探す
    if (payload) {
      const areaKeys = Object.keys(payload).filter(k =>
        k.toLowerCase().includes("area") ||
        k.toLowerCase().includes("pref") ||
        k.toLowerCase().includes("region") ||
        k.toLowerCase().includes("都道府県")
      );
      areaKeys.forEach(k => console.log(`  payload.${k}:`, payload[k]));
    }
  });
}

main().catch(console.error).finally(() => process.exit(0));

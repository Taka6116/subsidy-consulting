import { prisma } from "@/lib/db/prisma";

async function main() {
  const grants = await prisma.subsidyGrant.findMany({
    where: { status: "open" },
    select: {
      id: true,
      name: true,
      targetIndustries: true,
      maxAmountLabel: true,
      deadlineLabel: true,
    },
    orderBy: { syncedAt: "desc" },
    take: 50,
  });
  for (const g of grants) {
    console.log(
      [
        g.id,
        (g.name ?? "").slice(0, 55),
        JSON.stringify(g.targetIndustries).slice(0, 40),
        g.maxAmountLabel ?? "",
        g.deadlineLabel ?? "",
      ].join(" | "),
    );
  }
  await prisma.$disconnect();
}

main().catch(console.error);

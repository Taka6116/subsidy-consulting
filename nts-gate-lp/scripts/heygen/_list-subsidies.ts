import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
import { prisma } from "@/lib/db/prisma";

async function main() {
  const grants = await prisma.subsidyGrant.findMany({
    where: { status: { in: ["open", "upcoming"] } },
    orderBy: [{ deadline: "asc" }, { syncedAt: "desc" }],
    select: {
      id: true, name: true, maxAmountLabel: true,
      subsidyAmount: true, deadlineLabel: true, deadline: true,
      description: true,
    },
    take: 20,
  });

  grants.forEach((g, i) => {
    const desc = (g.description ?? "").slice(0, 50).replace(/\n/g, " ");
    console.log(`\n[${i}] ${(g.name ?? "").slice(0, 60)}`);
    console.log(`    amount  : ${g.maxAmountLabel ?? (g.subsidyAmount ? String(g.subsidyAmount) : "なし")}`);
    console.log(`    deadline: ${g.deadlineLabel ?? g.deadline}`);
    console.log(`    desc    : ${desc}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());

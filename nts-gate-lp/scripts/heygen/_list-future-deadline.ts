import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
import { prisma } from "@/lib/db/prisma";

async function main() {
  const grants = await prisma.subsidyGrant.findMany({
    where: {
      status: { in: ["open", "upcoming"] },
      NOT: [{ maxAmountLabel: null }, { description: null }],
      deadline: { gte: new Date("2026-09-01"), lte: new Date("2049-01-01") },
    },
    orderBy: [{ deadline: "asc" }],
    select: {
      id: true, name: true, maxAmountLabel: true, subsidyRate: true,
      deadlineLabel: true, deadline: true, description: true,
      targetIndustries: true, targetIndustryNote: true,
    },
    take: 15,
  });
  grants.forEach((g, i) => {
    console.log(`[${i}] ${(g.name ?? "").slice(0, 60)}`);
    console.log(`    id      : ${g.id}`);
    console.log(`    amount  : ${g.maxAmountLabel}  rate: ${g.subsidyRate}`);
    console.log(`    deadline: ${g.deadline ? g.deadline.toISOString().slice(0, 10) : g.deadlineLabel}`);
    console.log(`    target  : ${g.targetIndustryNote ?? (g.targetIndustries ?? []).slice(0, 3).join("/")}`);
    console.log(`    desc    : ${(g.description ?? "").slice(0, 70).replace(/\n/g, " ")}`);
    console.log("");
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());

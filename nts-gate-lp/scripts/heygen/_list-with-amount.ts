import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
import { prisma } from "@/lib/db/prisma";

async function main() {
  const grants = await prisma.subsidyGrant.findMany({
    where: {
      status: { in: ["open", "upcoming"] },
      NOT: [{ maxAmountLabel: null }, { description: null }],
    },
    orderBy: [{ deadline: "asc" }],
    select: {
      id: true, name: true, maxAmountLabel: true,
      subsidyAmount: true, deadlineLabel: true, deadline: true,
      description: true, targetIndustryNote: true, targetIndustries: true,
    },
    take: 15,
  });

  grants.forEach((g, i) => {
    const desc = (g.description ?? "").slice(0, 60).replace(/\n/g, " ");
    console.log(`\n[${i}] ${(g.name ?? "").slice(0, 60)}`);
    console.log(`    id        : ${g.id}`);
    console.log(`    amount    : ${g.maxAmountLabel}`);
    console.log(`    deadline  : ${g.deadlineLabel ?? g.deadline}`);
    console.log(`    industries: ${(g.targetIndustries ?? []).slice(0, 3).join(" / ")}`);
    console.log(`    desc      : ${desc}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());

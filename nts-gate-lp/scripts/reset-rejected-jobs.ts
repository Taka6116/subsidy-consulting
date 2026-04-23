import { prisma } from "@/lib/db/prisma";

async function main() {
  const rejected = await prisma.generatedContent.findMany({
    where: { status: "rejected", contentType: "article" },
    select: { subsidyId: true },
  });
  console.log("rejected contents:", rejected.length);

  const ids = rejected.map((r) => r.subsidyId);
  const updated = await prisma.contentJob.updateMany({
    where: { subsidyId: { in: ids }, jobType: "article" },
    data: { status: "pending", completedAt: null },
  });
  console.log("reset to pending:", updated.count);
  await prisma.$disconnect();
}

main().catch(console.error);

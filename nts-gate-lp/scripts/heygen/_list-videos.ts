import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
import { prisma } from "@/lib/db/prisma";

async function main() {
  const rows = await prisma.generatedContent.findMany({
    where: { contentType: "video", status: "published" },
    select: { subsidyId: true, title: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  console.log(`公開済み動画: ${rows.length}件\n`);
  rows.forEach((r, i) => {
    console.log(`[${i}] ${r.subsidyId}  ${(r.title ?? "").slice(0, 40)}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());

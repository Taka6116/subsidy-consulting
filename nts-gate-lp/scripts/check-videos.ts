import dotenv from "dotenv";
import path from "node:path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function main() {
  const { prisma } = await import("../src/lib/db/prisma");
  const rows = await prisma.generatedContent.findMany({
    where: { contentType: "video", status: "published" },
    select: { slug: true, videoPath: true, audioPath: true, duration: true },
    orderBy: { publishedAt: "desc" },
    take: 10,
  });
  console.log(JSON.stringify(rows, null, 2));
  await prisma.$disconnect();
}
main();

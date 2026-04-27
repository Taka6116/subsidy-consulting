/**
 * thumbnailPath が null の動画レコードを force 再生成する。
 */
import dotenv from "dotenv";
import path from "node:path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function main() {
  const { prisma } = await import("../src/lib/db/prisma");
  const { runVideoJob } = await import("../src/lib/content/runVideoJob");

  const targets = await prisma.generatedContent.findMany({
    where: {
      contentType: "video",
      status: "published",
      thumbnailPath: null,
    },
    select: { subsidyId: true, slug: true },
    orderBy: { publishedAt: "asc" },
  });

  console.log(`[fix-thumbnails] found ${targets.length} records without thumbnailPath`);

  let ok = 0;
  let failed = 0;
  for (const t of targets) {
    try {
      console.log(`[fix-thumbnails] processing subsidyId=${t.subsidyId}`);
      const result = await runVideoJob({ subsidyId: t.subsidyId, force: true });
      console.log(`[fix-thumbnails] done => status=${result.status} slug=${result.slug}`);
      ok++;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(`[fix-thumbnails] FAILED subsidyId=${t.subsidyId}: ${msg}`);
      failed++;
    }
  }

  console.log(JSON.stringify({ ok, failed }));
  await prisma.$disconnect();
}

main();

/**
 * videoPath が null で audioPath がある既存レコードを MP4 動画に変換する CLI。
 *
 * 使い方:
 *   npx tsx scripts/upgrade-audio-to-video.ts [--limit 5]
 */
import dotenv from "dotenv";
import path from "node:path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function main() {
  const args = process.argv.slice(2);
  const limitIdx = args.indexOf("--limit");
  const limit = limitIdx >= 0 ? Number(args[limitIdx + 1]) || 5 : 5;

  const { prisma } = await import("../src/lib/db/prisma");
  const { runVideoJob } = await import("../src/lib/content/runVideoJob");

  // videoPath が null のレコードを取得
  const targets = await prisma.generatedContent.findMany({
    where: {
      contentType: "video",
      status: "published",
      videoPath: null,
      audioPath: { not: null },
    },
    select: { subsidyId: true, slug: true },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });

  console.log(`[upgrade] found ${targets.length} audio-only records (limit=${limit})`);

  let ok = 0;
  let failed = 0;

  for (const t of targets) {
    try {
      console.log(`[upgrade] processing subsidyId=${t.subsidyId} slug=${t.slug}`);
      const result = await runVideoJob({ subsidyId: t.subsidyId, force: true });
      console.log(`[upgrade] done => status=${result.status} slug=${result.slug}`);
      ok++;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(`[upgrade] FAILED subsidyId=${t.subsidyId}: ${msg}`);
      failed++;
    }
  }

  console.log(JSON.stringify({ ok, failed, total: targets.length }));
  await prisma.$disconnect();
}

main();

/**
 * content_jobs の pending 動画ジョブをローカルで 1〜2 件ずつ処理する（Vercel CPU 節約）。
 *
 * 使い方:
 *   npx tsx scripts/drain-pending-videos.ts
 *   npx tsx scripts/drain-pending-videos.ts --limit 2 --force
 *
 * 前提: ffmpeg が PATH にあること（scripts/generate-videos.ts と同様）
 */
import dotenv from "dotenv";
import path from "node:path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

type Summary = {
  ok: boolean;
  picked: number;
  published: number;
  audio_only: number;
  script_only: number;
  failed: number;
  details: Array<{
    subsidyId: string;
    result: "published" | "audio_only" | "script_only" | "failed";
    slug?: string;
    error?: string;
  }>;
};

async function main() {
  const args = process.argv.slice(2);
  const limitArgIndex = args.indexOf("--limit");
  const limit = limitArgIndex >= 0 ? Math.max(1, Number(args[limitArgIndex + 1]) || 1) : 1;
  const force = args.includes("--force");

  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set");
    process.exit(2);
  }

  const { prisma } = await import("../src/lib/db/prisma");
  const { runVideoJob } = await import("../src/lib/content/runVideoJob");

  const summary: Summary = {
    ok: true,
    picked: 0,
    published: 0,
    audio_only: 0,
    script_only: 0,
    failed: 0,
    details: [],
  };

  try {
    const jobs = await prisma.contentJob.findMany({
      where: { jobType: "video", status: "pending" },
      orderBy: { triggeredAt: "asc" },
      take: limit,
      select: { subsidyId: true },
    });

    summary.picked = jobs.length;
    console.log(`[drain-pending-videos] picked=${jobs.length} limit=${limit} force=${force}`);

    if (jobs.length === 0) {
      console.log("[drain-pending-videos] No pending video jobs.");
      console.log(JSON.stringify(summary));
      return;
    }

    for (const job of jobs) {
      try {
        console.log(`[drain-pending-videos] processing subsidyId=${job.subsidyId}`);
        const result = await runVideoJob({ subsidyId: job.subsidyId, force });
        if (result.status === "published") summary.published += 1;
        else if (result.status === "audio_only") summary.audio_only += 1;
        else summary.script_only += 1;

        summary.details.push({
          subsidyId: job.subsidyId,
          result: result.status,
          slug: result.slug,
        });
        console.log(
          `[drain-pending-videos] done subsidyId=${job.subsidyId} status=${result.status} slug=${result.slug}`,
        );
      } catch (e) {
        summary.failed += 1;
        const msg = e instanceof Error ? e.message : String(e);
        summary.details.push({
          subsidyId: job.subsidyId,
          result: "failed",
          error: msg,
        });
        console.error(`[drain-pending-videos] failed subsidyId=${job.subsidyId}: ${msg}`);
      }
    }

    console.log(JSON.stringify(summary));
  } catch (e) {
    summary.ok = false;
    const msg = e instanceof Error ? e.message : String(e);
    console.error(JSON.stringify({ ...summary, error: msg }));
    process.exit(1);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
}

main();

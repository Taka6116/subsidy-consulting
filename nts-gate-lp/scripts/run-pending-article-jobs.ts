/**
 * ContentJob テーブルの pending / 古い failed を拾って記事生成する Worker。
 *
 * 使い方:
 *   npx tsx scripts/run-pending-article-jobs.ts [--limit 5] [--include-failed]
 *
 * - デフォルトは pending の article ジョブだけを 1 回分消化
 * - `--include-failed` で「failed かつ 30 分以上経過」も拾って再試行
 * - 1 回の実行で最大 `--limit` 件（デフォルト 5）。Bedrock スロットリング回避
 * - 失敗しても次の件に進む（1 件の失敗で全体停止しない）
 * - 終了時に JSON サマリを stdout に 1 行で出力（Lambda で parse する）
 */

import dotenv from "dotenv";
import path from "node:path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

type JobRow = {
  subsidyId: string;
  status: string;
  triggeredAt: Date;
};

type RunSummary = {
  ok: boolean;
  picked: number;
  published: number;
  rejected: number;
  failed: number;
  details: Array<{
    subsidyId: string;
    result: "published" | "rejected" | "failed";
    slug?: string;
    violations?: string[];
    error?: string;
  }>;
};

const FAILED_RETRY_COOLDOWN_MS = 30 * 60 * 1000; // 30 分

async function main() {
  const args = process.argv.slice(2);
  const limitArgIndex = args.indexOf("--limit");
  const limit =
    limitArgIndex >= 0 ? Number(args[limitArgIndex + 1]) || 5 : 5;
  const includeFailed = args.includes("--include-failed");

  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set");
    process.exit(2);
  }
  if (!process.env.BEDROCK_MODEL_ID || !process.env.AWS_REGION) {
    console.error("BEDROCK_MODEL_ID / AWS_REGION is not set");
    process.exit(2);
  }

  const { prisma } = await import("../src/lib/db/prisma");
  const { runContentJob } = await import("../src/lib/content/runContentJob");

  const summary: RunSummary = {
    ok: true,
    picked: 0,
    published: 0,
    rejected: 0,
    failed: 0,
    details: [],
  };

  try {
    const cutoff = new Date(Date.now() - FAILED_RETRY_COOLDOWN_MS);
    const statuses = includeFailed ? ["pending", "failed"] : ["pending"];

    const jobs = await prisma.contentJob.findMany({
      where: {
        jobType: "article",
        status: { in: statuses },
        // failed の場合のみ cooldown を要求、pending は即時対象
        OR: [
          { status: "pending" },
          ...(includeFailed
            ? [{ status: "failed", triggeredAt: { lt: cutoff } }]
            : []),
        ],
      },
      orderBy: { triggeredAt: "asc" },
      take: limit,
      select: { subsidyId: true, status: true, triggeredAt: true },
    });

    summary.picked = jobs.length;
    console.log(
      `[worker] picked=${jobs.length} limit=${limit} includeFailed=${includeFailed}`,
    );

    for (const job of jobs as JobRow[]) {
      try {
        const result = await runContentJob({ subsidyId: job.subsidyId });
        if (result.status === "published") {
          summary.published += 1;
          summary.details.push({
            subsidyId: job.subsidyId,
            result: "published",
            slug: result.slug,
          });
        } else {
          summary.rejected += 1;
          summary.details.push({
            subsidyId: job.subsidyId,
            result: "rejected",
            slug: result.slug,
            violations: result.violations,
          });
        }
      } catch (e) {
        summary.failed += 1;
        const msg = e instanceof Error ? e.message : String(e);
        summary.details.push({
          subsidyId: job.subsidyId,
          result: "failed",
          error: msg,
        });
        console.error(
          `[worker] failed subsidyId=${job.subsidyId}: ${msg}`,
        );
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

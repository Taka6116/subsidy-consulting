/**
 * content_jobs の pending / running を on_hold に一時停止、または on_hold を pending に復帰する。
 *
 * 使い方:
 *   npx tsx scripts/pause-content-pipeline.ts pause [--types video,article]
 *   npx tsx scripts/pause-content-pipeline.ts resume [--types video,article]
 *   npx tsx scripts/pause-content-pipeline.ts status
 */
import dotenv from "dotenv";
import path from "node:path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const ALL_TYPES = ["video", "article", "lp"] as const;
type JobType = (typeof ALL_TYPES)[number];

function parseTypes(args: string[]): JobType[] {
  const idx = args.indexOf("--types");
  if (idx < 0) return ["video", "article"];
  const raw = args[idx + 1] ?? "";
  const picked = raw
    .split(",")
    .map((s) => s.trim())
    .filter((s): s is JobType => ALL_TYPES.includes(s as JobType));
  return picked.length > 0 ? picked : ["video", "article"];
}

async function printStatus(prisma: Awaited<ReturnType<typeof importPrisma>>) {
  const rows = await prisma.contentJob.groupBy({
    by: ["jobType", "status"],
    _count: { _all: true },
    orderBy: [{ jobType: "asc" }, { status: "asc" }],
  });
  console.log("content_jobs status:");
  for (const r of rows) {
    console.log(`  ${r.jobType.padEnd(8)} ${r.status.padEnd(10)} ${r._count._all}`);
  }
}

async function importPrisma() {
  const { prisma } = await import("../src/lib/db/prisma");
  return prisma;
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const types = parseTypes(args);

  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set");
    process.exit(2);
  }

  const prisma = await importPrisma();

  try {
    if (command === "status") {
      await printStatus(prisma);
      return;
    }

    if (command === "pause") {
      const fromStatuses = ["pending", "running"];
      const result = await prisma.contentJob.updateMany({
        where: {
          jobType: { in: types },
          status: { in: fromStatuses },
        },
        data: { status: "on_hold", completedAt: null },
      });
      console.log(`Paused ${result.count} job(s): types=${types.join(",")} (${fromStatuses.join("|")} -> on_hold)`);
      await printStatus(prisma);
      return;
    }

    if (command === "resume") {
      const result = await prisma.contentJob.updateMany({
        where: {
          jobType: { in: types },
          status: "on_hold",
        },
        data: { status: "pending", completedAt: null },
      });
      console.log(`Resumed ${result.count} job(s): types=${types.join(",")} (on_hold -> pending)`);
      await printStatus(prisma);
      return;
    }

    console.error("Usage: pause | resume | status [--types video,article,lp]");
    process.exit(1);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

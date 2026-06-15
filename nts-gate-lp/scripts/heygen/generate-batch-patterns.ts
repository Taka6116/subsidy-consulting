/**
 * Pattern A/B/C/D を各1本ずつ、公募中の補助金4件にランダム割り当てで連続生成
 *
 * 実行:
 *   npx tsx --tsconfig tsconfig.json scripts/heygen/generate-batch-patterns.ts
 *   npx tsx ... generate-batch-patterns.ts --dry-run      # 選定のみ
 *   npx tsx ... generate-batch-patterns.ts --no-publish   # 生成のみ（公開なし）
 *   npx tsx ... generate-batch-patterns.ts --stop-on-error # 失敗時に中断
 */

import * as dotenv from "dotenv";
import * as path from "path";
import { spawn } from "node:child_process";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import { prisma } from "@/lib/db/prisma";

const PATTERNS = ["A", "B", "C", "D"] as const;
const POOL_SIZE = 30;
const PICK_COUNT = 4;
const DEADLINE_MAX = new Date("2050-01-01");

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function isFutureDeadline(deadline: Date | null): boolean {
  if (!deadline) return true;
  if (Number.isNaN(deadline.getTime()) || deadline > DEADLINE_MAX) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(deadline);
  d.setHours(0, 0, 0, 0);
  return d >= today;
}

async function fetchCandidates() {
  const now = new Date();
  const grants = await prisma.subsidyGrant.findMany({
    where: {
      status: { in: ["open", "upcoming"] },
      NOT: [{ maxAmountLabel: null }, { description: null }],
      OR: [{ deadline: { gte: now } }, { deadline: null }],
    },
    orderBy: [{ syncedAt: "desc" }],
    select: {
      id: true,
      name: true,
      maxAmountLabel: true,
      deadline: true,
      deadlineLabel: true,
      description: true,
    },
    take: POOL_SIZE,
  });

  return grants.filter(
    (g) =>
      (g.description?.trim().length ?? 0) >= 20 &&
      isFutureDeadline(g.deadline),
  );
}

function runOne(subsidyId: string, pattern: string, publish: boolean): Promise<number> {
  const script = path.join(process.cwd(), "scripts", "heygen", "generate-heygen-agent.ts");
  const args = [
    "tsx",
    "--tsconfig",
    "tsconfig.json",
    script,
    subsidyId,
    `--pattern=${pattern}`,
  ];
  if (publish) args.push("--publish");

  return new Promise((resolve, reject) => {
    const child = spawn("npx", args, {
      cwd: process.cwd(),
      stdio: "inherit",
      shell: true,
    });
    child.on("error", reject);
    child.on("close", (code) => resolve(code ?? 1));
  });
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const noPublish = process.argv.includes("--no-publish");
  const stopOnError = process.argv.includes("--stop-on-error");

  console.log("╔══════════════════════════════════════════════════════╗");
  console.log("║   Pattern A〜D バッチ動画生成（公募中×4件）         ║");
  console.log("╚══════════════════════════════════════════════════════╝\n");

  const candidates = await fetchCandidates();
  if (candidates.length < PICK_COUNT) {
    throw new Error(
      `候補が ${candidates.length} 件しかありません（${PICK_COUNT} 件必要）。DB を確認してください。`,
    );
  }

  const picked = shuffle(candidates).slice(0, PICK_COUNT);
  const jobs = PATTERNS.map((pattern, i) => ({
    pattern,
    grant: picked[i],
  }));

  console.log("📋 選定結果:\n");
  for (const { pattern, grant } of jobs) {
    const dl = grant.deadline
      ? grant.deadline.toISOString().slice(0, 10)
      : grant.deadlineLabel ?? "—";
    console.log(`  Pattern ${pattern} | ${(grant.name ?? "").slice(0, 50)}`);
    console.log(`    id: ${grant.id}`);
    console.log(`    上限: ${grant.maxAmountLabel}  期限: ${dl}\n`);
  }

  if (dryRun) {
    console.log("🔍 --dry-run のため生成はスキップしました。");
    return;
  }

  const results: { pattern: string; id: string; name: string; slug: string | null; ok: boolean }[] = [];

  for (let i = 0; i < jobs.length; i++) {
    const { pattern, grant } = jobs[i];
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`▶ [${i + 1}/${jobs.length}] Pattern ${pattern}: ${grant.name?.slice(0, 40)}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    const code = await runOne(grant.id, pattern, !noPublish);
    const content = !noPublish && code === 0
      ? await prisma.generatedContent.findFirst({
          where: { subsidyId: grant.id, contentType: "video", status: "published" },
          select: { slug: true },
          orderBy: { publishedAt: "desc" },
        })
      : null;

    results.push({
      pattern,
      id: grant.id,
      name: grant.name ?? "",
      slug: content?.slug ?? null,
      ok: code === 0,
    });

    if (code !== 0) {
      console.error(`\n❌ Pattern ${pattern} 失敗 (exit ${code})`);
      if (stopOnError) break;
    } else {
      const slugMsg = content?.slug ? ` → /subsidies/videos/${content.slug}` : "";
      console.log(`\n✅ Pattern ${pattern} 完了${slugMsg}`);
    }
  }

  console.log("\n╔══════════════════════════════════════════════════════╗");
  console.log("║   バッチ結果サマリー                                  ║");
  console.log("╚══════════════════════════════════════════════════════╝");
  for (const r of results) {
    const slugPart = r.slug ? ` | /subsidies/videos/${r.slug}` : "";
    console.log(`  ${r.ok ? "✅" : "❌"} Pattern ${r.pattern} | ${r.name.slice(0, 40)} | ${r.id}${slugPart}`);
  }
  const ok = results.filter((r) => r.ok).length;
  console.log(`\n成功: ${ok}/${results.length}`);

  if (ok < results.length) process.exit(1);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

/**
 * 記事（GeneratedContent）が存在しない、またはbodyが空の公開補助金に対して
 * 記事を一括生成する。
 *
 * 使い方:
 *   npx tsx scripts/generate-all-missing-articles.ts [--limit 20] [--force]
 *
 * オプション:
 *   --limit N   一度に処理する最大件数（デフォルト 20）
 *   --force     既存記事がある場合も強制再生成
 *
 * 対象:
 *   - SubsidyGrant.status = "open"
 *   - 公開済み記事（contentType=article, status=published）が存在しない、
 *     または body が 500 字未満
 */

import dotenv from "dotenv";
import path from "node:path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function main() {
  const args = process.argv.slice(2);
  const limitArgIndex = args.indexOf("--limit");
  const limit = limitArgIndex >= 0 ? Number(args[limitArgIndex + 1]) || 20 : 20;
  const force = args.includes("--force");

  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set (.env.local / .env を確認)");
    process.exit(2);
  }
  if (!process.env.BEDROCK_MODEL_ID || !process.env.AWS_REGION) {
    console.error("BEDROCK_MODEL_ID / AWS_REGION is not set");
    process.exit(2);
  }

  const { prisma } = await import("../src/lib/db/prisma");
  const { runContentJob } = await import("../src/lib/content/runContentJob");

  // ── 対象補助金を取得 ──────────────────────────────────
  // open な補助金と、その公開済み記事（あれば）を JOIN
  const grants = await prisma.subsidyGrant.findMany({
    where: { status: "open" },
    select: {
      id: true,
      name: true,
      contents: {
        where: { contentType: "article", status: "published" },
        orderBy: { publishedAt: "desc" },
        take: 1,
        select: { id: true, body: true, slug: true },
      },
    },
  });

  const BODY_MIN = 500;

  // 記事なし、またはbodyが短いものを対象に
  const targets = grants.filter((g) => {
    const article = g.contents[0];
    if (!article) return true; // 記事レコード自体なし
    if (!article.body || article.body.length < BODY_MIN) return true; // bodyが空/短い
    if (force) return true; // --force 時は全件
    return false;
  });

  console.log(`\n対象: ${targets.length}件 / 全${grants.length}件 (open補助金)`);
  console.log(`処理上限: ${limit}件 / force=${force}\n`);

  const queue = targets.slice(0, limit);

  let success = 0;
  let rejected = 0;
  let failed = 0;

  for (const g of queue) {
    const article = g.contents[0];
    const label = `${g.name?.slice(0, 30) ?? g.id} (body=${article?.body?.length ?? 0}字)`;
    process.stdout.write(`▶ ${label} ... `);

    try {
      const result = await runContentJob({ subsidyId: g.id, force: true });
      if (result.status === "published") {
        process.stdout.write(`✓ published  slug=${result.slug}\n`);
        success++;
      } else {
        process.stdout.write(`△ rejected   violations=${result.violations?.join(",")}\n`);
        rejected++;
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      process.stdout.write(`✗ failed: ${msg}\n`);
      failed++;
    }

    // Bedrock レート制限回避（3秒インターバル）
    await new Promise((r) => setTimeout(r, 3000));
  }

  console.log(`\n── 完了 ──`);
  console.log(`成功(published): ${success}`);
  console.log(`品質却下(rejected): ${rejected}`);
  console.log(`エラー(failed): ${failed}`);
  console.log(`残り未処理: ${Math.max(0, targets.length - limit)}件`);
  console.log(`（残りは --limit を増やして再実行してください）`);

  await prisma.$disconnect();
}

main();

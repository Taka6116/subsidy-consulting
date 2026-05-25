/**
 * body が短い記事を直接 API 経由で再生成する。
 * devサーバーではなく本番Vercel URLに叩く。
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const TOKEN = "Lwz7nsB05WHM8Vol4PTYRcKSX2IhpuJQ";
// Vercel 本番 URL を使う（devサーバーはタイムアウトするため）
const BASE_URL = "https://subsidy-consulting-nts.vercel.app";

const rows = await prisma.generatedContent.findMany({
  where: {
    contentType: "article",
    status: "published",
    grant: { is: { status: "open" } },
  },
  orderBy: { publishedAt: "desc" },
  take: 60,
  select: {
    id: true,
    subsidyId: true,
    slug: true,
    body: true,
  },
});

const targets = rows.filter((r) => !r.body || r.body.length < 3000);
console.log(`対象: ${targets.length}件 / 全${rows.length}件`);
console.log("slugs:", targets.map((r) => r.slug));

let success = 0;
let failed = 0;

for (const row of targets) {
  process.stdout.write(`\n▶ ${row.slug} (${row.body?.length ?? 0}字) ... `);
  try {
    const res = await fetch(`${BASE_URL}/api/articles/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-token": TOKEN,
      },
      body: JSON.stringify({ subsidyId: row.subsidyId, force: true }),
    });
    const data = await res.json();
    if (data.ok) {
      process.stdout.write(`✓ slug=${data.slug}\n`);
      success++;
    } else {
      process.stdout.write(`✗ ${data.error}\n`);
      failed++;
    }
  } catch (e) {
    process.stdout.write(`✗ ${e.message}\n`);
    failed++;
  }
  // レート制限回避
  await new Promise((r) => setTimeout(r, 3000));
}

console.log(`\n完了: 成功=${success} 失敗=${failed}`);
await prisma.$disconnect();

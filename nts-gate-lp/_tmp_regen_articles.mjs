/**
 * 一覧ページに表示されている補助金の記事を再生成する。
 * body が短い（3000字未満）ものを対象にする。
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const TOKEN = "Lwz7nsB05WHM8Vol4PTYRcKSX2IhpuJQ";
const BASE_URL = "http://localhost:3001";

// grant.status=open の published 記事で body が短いものを取得
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
    title: true,
    body: true,
  },
});

const targets = rows.filter((r) => !r.body || r.body.length < 3000);
console.log(`対象: ${targets.length}件 / 全${rows.length}件`);

let success = 0;
let failed = 0;

for (const row of targets) {
  console.log(`\n▶ 生成中: ${row.slug} (${row.body?.length ?? 0}字)`);
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
      console.log(`  ✓ OK slug=${data.slug} status=${data.status}`);
      success++;
    } else {
      console.log(`  ✗ NG error=${data.error}`);
      failed++;
    }
  } catch (e) {
    console.log(`  ✗ fetch error: ${e.message}`);
    failed++;
  }
  // Bedrock レート制限を避けるため2秒待機
  await new Promise((r) => setTimeout(r, 2000));
}

console.log(`\n完了: 成功=${success} 失敗=${failed}`);
await prisma.$disconnect();

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const total = await prisma.subsidyGrant.count({ where: { status: "open" } });

const articles = await prisma.generatedContent.findMany({
  where: {
    contentType: "article",
    status: "published",
    grant: { is: { status: "open" } },
  },
  select: { body: true, slug: true },
});

const withBody = articles.filter(r => r.body && r.body.length >= 500).length;
const shortBody = articles.filter(r => !r.body || r.body.length < 500).length;

// 記事レコードなしの補助金数
const grantsWithArticle = await prisma.subsidyGrant.count({
  where: {
    status: "open",
    contents: {
      some: { contentType: "article", status: "published" }
    }
  }
});

console.log("=== 記事生成状況 ===");
console.log("open補助金 総数:", total);
console.log("記事(published)あり:", grantsWithArticle);
console.log("記事なし:", total - grantsWithArticle);
console.log("body >= 500字 (正常):", withBody);
console.log("body < 500字 (要再生成):", shortBody);

await prisma.$disconnect();

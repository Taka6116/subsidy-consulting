import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// 一覧と同じ条件で記事を取得し、最初の10件のslugを確認
const rows = await prisma.generatedContent.findMany({
  where: {
    contentType: "article",
    status: "published",
    grant: { is: { status: "open" } },
  },
  orderBy: { publishedAt: "desc" },
  take: 10,
  select: {
    id: true,
    slug: true,
    title: true,
    body: true,
    grant: { select: { status: true, name: true } },
  },
});

console.log(`total found: ${rows.length}`);
for (const r of rows) {
  console.log(JSON.stringify({
    slug: r.slug,
    hasBody: !!(r.body && r.body.length > 0),
    bodyLen: r.body?.length ?? 0,
    grantStatus: r.grant?.status,
  }));
}

await prisma.$disconnect();

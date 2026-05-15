import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const slug = "kishiwada-jissho-jigyo-hojo-2025-ddtoc3";

const r = await prisma.generatedContent.findFirst({
  where: { slug },
  select: {
    id: true,
    slug: true,
    status: true,
    contentType: true,
    body: true,
    grant: { select: { id: true, name: true, status: true } },
  },
});

console.log(JSON.stringify({
  found: !!r,
  status: r?.status,
  contentType: r?.contentType,
  bodyLength: r?.body?.length ?? 0,
  grantStatus: r?.grant?.status,
  grantName: r?.grant?.name,
}, null, 2));

await prisma.$disconnect();

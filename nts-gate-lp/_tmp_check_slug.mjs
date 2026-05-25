import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
const slug = process.argv[2] || "shigen-junkan-datsutanso-sokushin-r8";
const a = await p.generatedContent.findFirst({
  where: { slug, contentType: "article" },
  include: { grant: { select: { id: true, name: true, deadline: true, rawPayload: true, targetIndustries: true } } },
});
if (!a) {
  console.log("NOT FOUND");
} else {
  console.log({
    status: a.status,
    bodyLen: a.body?.length ?? 0,
    tags: a.tags,
    tagsIsNull: a.tags === null,
    title: a.title?.slice(0, 60),
    grantId: a.grant?.id,
    deadline: a.grant?.deadline,
  });
}
await p.$disconnect();

import dotenv from "dotenv";
import path from "node:path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import { prisma } from "./src/lib/db/prisma";
import { pickHeroImage } from "./src/lib/content/imagePool";
import { splitArticleBodyByH2 } from "./src/lib/articles/splitArticleBodyByH2";

const slug = process.argv[2] || "shigen-junkan-datsutanso-sokushin-r8";

async function main() {
  const article = await prisma.generatedContent.findFirst({
    where: { slug, status: "published", contentType: "article" },
    include: {
      grant: {
        select: {
          id: true,
          name: true,
          maxAmountLabel: true,
          deadlineLabel: true,
          deadline: true,
          rawPayload: true,
          targetIndustries: true,
        },
      },
    },
  });

  if (!article?.body) {
    console.log("not found or no body");
    return;
  }

  console.log("1. pickHeroImage...");
  const hero = pickHeroImage({
    subsidyId: article.subsidyId,
    seedKey: article.id,
    tags: article.tags ?? [],
    targetIndustries: article.grant?.targetIndustries ?? [],
  });
  console.log("   hero:", hero);

  console.log("2. splitArticleBodyByH2...");
  const sections = splitArticleBodyByH2(article.body);
  console.log("   sections:", sections.length);

  console.log("3. related pickHeroImage x60...");
  const candidates = await prisma.generatedContent.findMany({
    where: { status: "published", slug: { not: slug }, contentType: "article" },
    select: { id: true, subsidyId: true, tags: true, grant: { select: { targetIndustries: true } } },
    take: 60,
  });
  for (const a of candidates) {
    pickHeroImage({
      subsidyId: a.subsidyId,
      seedKey: a.id,
      tags: a.tags ?? [],
      targetIndustries: a.grant?.targetIndustries ?? [],
    });
  }
  console.log("   ok");

  console.log("ALL OK");
}

main()
  .catch((e) => {
    console.error("FAILED:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

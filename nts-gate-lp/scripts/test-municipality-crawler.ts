import * as dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { crawlMunicipality } from "@/lib/crawler";
import { classifySubsidy } from "@/lib/crawler/llm/classify-subsidy";
import { fetchWithRetry, decodeBufferToUtf8 } from "@/lib/crawler";
import { load } from "cheerio";

dotenv.config({ path: ".env.local" });
dotenv.config();

function toPlainText(html: string): string {
  const $ = load(html);
  $("script,style,noscript").remove();
  return $.text().replace(/\s+/g, " ").trim();
}

async function main() {
  const prisma = new PrismaClient();
  try {
    const tokyo = await prisma.municipality.findUnique({
      where: { code: "130000" },
      select: {
        id: true,
        code: true,
        name: true,
        officialUrl: true,
        subsidyPageUrl: true,
        feedUrl: true,
        crawlStrategy: true,
        crawlConfig: true,
      },
    });

    if (!tokyo) {
      throw new Error("東京都（code=130000）が municipalities に存在しません。Step2 seed を実行してください。");
    }

    console.log(`[test] municipality=${tokyo.name} code=${tokyo.code}`);
    const result = await crawlMunicipality(tokyo);
    console.log(`[test] strategy=${result.metadata.strategy} pagesFetched=${result.metadata.pagesFetched}`);
    console.log(`[test] discoveredLinks=${result.links.length} errors=${result.errors.length}`);

    const sample = result.links.slice(0, 3);
    for (const [index, link] of sample.entries()) {
      try {
        const res = await fetchWithRetry(link.url, { timeoutMs: 20000, retries: 1 });
        if (!res.ok) {
          console.log(`[test] [${index + 1}] ${link.url} -> HTTP ${res.status}`);
          continue;
        }
        const html = decodeBufferToUtf8(Buffer.from(await res.arrayBuffer()), res.headers.get("content-type"));
        const pageText = toPlainText(html).slice(0, 12000);
        const classified = await classifySubsidy({ pageText, pageUrl: link.url });
        console.log(
          `[test] [${index + 1}] ${link.title} -> classified=${!!classified} confidence=${classified?.confidence ?? "-"} name=${classified?.name ?? "-"}`
        );
      } catch (error) {
        console.log(`[test] [${index + 1}] classify error: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

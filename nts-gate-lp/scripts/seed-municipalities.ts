import * as dotenv from "dotenv";
import { Prisma, PrismaClient } from "@prisma/client";
import { readFile } from "node:fs/promises";
import path from "node:path";

dotenv.config({ path: ".env.local" });
dotenv.config();

type MunicipalitySeedRow = {
  code: string;
  name: string;
  prefectureName: string;
  type: "prefecture" | "designated_city" | "city" | "ward" | "town" | "village";
  officialUrl?: string;
  subsidyPageUrl?: string;
  feedUrl?: string;
};

const PRIORITY_BY_TYPE: Record<MunicipalitySeedRow["type"], number> = {
  prefecture: 300,
  designated_city: 200,
  city: 100,
  ward: 80,
  town: 60,
  village: 50,
};

async function loadRows(): Promise<MunicipalitySeedRow[]> {
  const filePath = path.resolve(process.cwd(), "scripts/data/municipality-codes.json");
  const raw = await readFile(filePath, "utf-8");
  const parsed = JSON.parse(raw) as MunicipalitySeedRow[];

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error("scripts/data/municipality-codes.json が空、または配列ではありません。");
  }

  for (const row of parsed) {
    if (!row.code || !row.name || !row.prefectureName || !row.type) {
      throw new Error(`必須項目不足: ${JSON.stringify(row)}`);
    }
  }

  return parsed;
}

async function main() {
  const prisma = new PrismaClient();
  const dryRun = process.argv.includes("--dry-run");

  try {
    const rows = await loadRows();
    console.log(`Loaded ${rows.length} municipality rows`);
    console.log(dryRun ? "Mode: dry-run (DB更新なし)" : "Mode: apply");

    let inserted = 0;
    let updated = 0;

    for (const row of rows) {
      const data = {
        name: row.name,
        prefectureName: row.prefectureName,
        type: row.type,
        officialUrl: row.officialUrl ?? null,
        subsidyPageUrl: row.subsidyPageUrl ?? null,
        feedUrl: row.feedUrl ?? null,
        crawlStrategy: "html_list",
        crawlConfig: Prisma.JsonNull,
        crawlStatus: "active",
        errorMessage: null,
        priority: PRIORITY_BY_TYPE[row.type],
      };

      if (dryRun) {
        console.log(`[dry-run] upsert ${row.code} ${row.name}`);
        continue;
      }

      const existing = await prisma.municipality.findUnique({
        where: { code: row.code },
        select: { id: true },
      });

      await prisma.municipality.upsert({
        where: { code: row.code },
        create: { code: row.code, ...data },
        update: data,
      });

      if (existing) updated += 1;
      else inserted += 1;
    }

    if (!dryRun) {
      console.log(`Done. inserted=${inserted}, updated=${updated}`);
    } else {
      console.log("Dry-run completed.");
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

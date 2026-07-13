/**
 * 既存の SubsidyGrant で targetIndustries が空の行に対して、
 * name/description/institutionName からキーワード推定でタグ付けするバックフィル。
 * 実行: node scripts/backfill-industries.mjs
 */
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const prisma = new PrismaClient();

const INDUSTRY_KEYWORD_RULES = [
  { label: "農林水産業", keywords: ["農業", "林業", "漁業", "水産", "畜産", "農園", "農地", "酪農"] },
  { label: "製造業", keywords: ["製造業", "製造", "工場", "ものづくり", "モノづくり", "生産設備", "金属加工", "食品加工", "町工場"] },
  { label: "建設業", keywords: ["建設業", "建設", "建築", "土木", "解体工事", "リフォーム", "住宅工事", "工事業"] },
  { label: "物流・運輸", keywords: ["物流", "運輸業", "運送業", "倉庫業", "トラック運送", "配送業"] },
  { label: "IT・情報通信", keywords: ["IT導入", "情報通信業", "ソフトウェア", "システム開発", "デジタル化", "情報サービス業", "アプリ開発"] },
  { label: "小売・サービス業", keywords: ["小売業", "商店街", "商店", "小売店", "サービス業", "卸売業", "EC事業", "美容業"] },
  { label: "医療・福祉", keywords: ["医療機関", "病院", "診療所", "クリニック", "介護", "福祉施設", "薬局", "訪問看護"] },
  { label: "飲食業", keywords: ["飲食店", "飲食業", "レストラン", "居酒屋", "カフェ", "食堂"] },
  { label: "観光・宿泊", keywords: ["観光", "宿泊業", "ホテル", "旅館", "民泊", "旅行業"] },
];
const BROAD_INDUSTRY_KEYWORDS = ["中小企業全般", "業種を問わず", "全業種", "全ての事業者", "すべての事業者", "業種問わず"];

function inferIndustriesFromText(text) {
  if (!text) return [];
  const matched = new Set();
  for (const rule of INDUSTRY_KEYWORD_RULES) {
    if (rule.keywords.some((k) => text.includes(k))) matched.add(rule.label);
  }
  if (matched.size === 0 && BROAD_INDUSTRY_KEYWORDS.some((k) => text.includes(k))) {
    matched.add("全業種");
  }
  return [...matched];
}

async function main() {
  const targets = await prisma.subsidyGrant.findMany({
    where: { targetIndustries: { isEmpty: true } },
    select: { id: true, name: true, description: true, institutionName: true },
  });

  console.log(`対象: ${targets.length}件（targetIndustries空）`);

  let tagged = 0;
  let stillEmpty = 0;
  for (const g of targets) {
    const text = [g.name, g.description, g.institutionName]
      .filter((v) => typeof v === "string" && v.trim())
      .join(" ");
    const industries = inferIndustriesFromText(text);
    if (industries.length === 0) {
      stillEmpty += 1;
      continue;
    }
    await prisma.subsidyGrant.update({
      where: { id: g.id },
      data: { targetIndustries: industries },
    });
    tagged += 1;
  }

  console.log(`タグ付け完了: ${tagged}件`);
  console.log(`推定できず未タグ: ${stillEmpty}件`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

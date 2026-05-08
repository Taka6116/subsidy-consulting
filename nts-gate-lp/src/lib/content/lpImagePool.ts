import fs from "node:fs";
import path from "node:path";

const LP_PICTURES_DIR = path.join(process.cwd(), "LP_pictures");
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"] as const);

type FolderRule = {
  keywords: string[];
  folders: string[];
};

const FOLDER_RULES: FolderRule[] = [
  { keywords: ["運送", "物流", "配送", "輸送", "トラック", "運輸"], folders: ["運送"] },
  { keywords: ["建設", "土木", "建築", "重機", "電動化"], folders: ["建設"] },
  { keywords: ["人材", "採用", "雇用", "賃上げ", "研修", "育成"], folders: ["人材"] },
  { keywords: ["DX", "デジタル", "IT導入", "システム", "クラウド"], folders: ["DX", "IT"] },
];

function normalizeSegment(name: string): string {
  return name.replace(/[\\/]/g, "").trim();
}

function listImagesInFolder(folderName: string): string[] {
  const normalized = normalizeSegment(folderName);
  if (!normalized) return [];

  const folderPath = path.join(LP_PICTURES_DIR, normalized);
  if (!fs.existsSync(folderPath)) return [];

  return fs
    .readdirSync(folderPath, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((fileName) => IMAGE_EXTENSIONS.has(path.extname(fileName).toLowerCase() as ".jpg"));
}

function pickRandom<T>(items: T[]): T | null {
  if (items.length === 0) return null;
  const idx = Math.floor(Math.random() * items.length);
  return items[idx] ?? null;
}

function buildImageUrl(folderName: string, fileName: string): string {
  return `/api/lp-pictures/${encodeURIComponent(folderName)}/${encodeURIComponent(fileName)}`;
}

export function pickLpHeroImage(params: {
  category?: string;
  targetIndustries?: string[];
}): string | null {
  if (!fs.existsSync(LP_PICTURES_DIR)) return null;

  const haystack = [params.category ?? "", ...(params.targetIndustries ?? [])]
    .map((v) => v.trim())
    .filter(Boolean);

  for (const rule of FOLDER_RULES) {
    const matched = haystack.some((h) => rule.keywords.some((k) => h.includes(k)));
    if (!matched) continue;

    for (const folderName of rule.folders) {
      const files = listImagesInFolder(folderName);
      const picked = pickRandom(files);
      if (!picked) continue;
      return buildImageUrl(folderName, picked);
    }
  }

  // フォルダ一致がない場合は、配置済みフォルダ全体からランダムに選ぶ。
  const allFolders = fs
    .readdirSync(LP_PICTURES_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
  const folder = pickRandom(allFolders);
  if (!folder) return null;
  const files = listImagesInFolder(folder);
  const file = pickRandom(files);
  if (!file) return null;
  return buildImageUrl(folder, file);
}

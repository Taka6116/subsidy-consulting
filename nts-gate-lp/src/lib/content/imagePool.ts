/**
 * 補助金記事の hero 画像を public/images 配下の固定プールから決定論的に割り当てる。
 * Bedrock で画像生成はせず、既存ストック画像を tags / 業種で分配する。
 */
import fs from "node:fs";
import path from "node:path";

const IMAGE_POOL = [
  "/images/PANA2232.jpg",
  "/images/PANA2394.jpg",
  "/images/PANA2664.jpg",
  "/images/PANA2822-2.jpg",
  "/images/PANA3061.jpg",
  "/images/PANA3202-2.jpg",
  "/images/PANA3362.jpg",
  "/images/PANA3446.jpg",
  "/images/PANA3907.jpg",
  "/images/PANA3955.jpg",
] as const;

/** タグ / 業種キーワードから優先画像を指定するマップ（先頭一致の優先順） */
const TAG_PREFERENCE: Array<{ keywords: string[]; image: string }> = [
  { keywords: ["人材", "採用", "雇用", "キャリア"], image: "/images/PANA2822-2.jpg" },
  { keywords: ["設備投資", "ものづくり", "製造"], image: "/images/PANA3061.jpg" },
  { keywords: ["DX", "IT導入", "デジタル", "システム"], image: "/images/PANA2664.jpg" },
  { keywords: ["事業承継", "M&A", "承継"], image: "/images/PANA2394.jpg" },
  { keywords: ["事業計画", "申請準備", "書類"], image: "/images/PANA3202-2.jpg" },
  { keywords: ["補助金基礎", "基礎", "入門"], image: "/images/PANA2232.jpg" },
  { keywords: ["省エネ", "環境", "エネルギー"], image: "/images/PANA3907.jpg" },
  { keywords: ["建設", "運送", "物流"], image: "/images/PANA3362.jpg" },
  { keywords: ["中小企業", "小規模"], image: "/images/PANA3446.jpg" },
];

/**
 * ユーザー配置のジャンル別画像プール。
 * 例: article_pictures/運送/*.jpg
 *
 * NOTE:
 * - 画像自体は projectRoot/article_pictures に配置
 * - 表示は /api/article-pictures/{folder}/{file} で配信する
 */
const CUSTOM_ARTICLE_PICTURES_DIR = path.join(process.cwd(), "article_pictures");
const IMAGE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
] as const);

type GenreFolderRule = {
  keywords: string[];
  folders: string[];
};

const GENRE_FOLDER_RULES: GenreFolderRule[] = [
  { keywords: ["運送", "物流", "配送", "トラック"], folders: ["運送"] },
  { keywords: ["人材", "採用", "雇用", "賃上げ"], folders: ["人材", "人材・採用"] },
  { keywords: ["DX", "IT導入", "デジタル", "システム"], folders: ["DX・IT", "DX", "IT"] },
  { keywords: ["設備投資", "設備", "省力化", "機械"], folders: ["設備投資"] },
  { keywords: ["ものづくり", "製造", "工場", "生産"], folders: ["ものづくり"] },
  { keywords: ["事業計画", "計画", "申請準備"], folders: ["事業計画"] },
  { keywords: ["建設", "建築", "工事", "電化"], folders: ["建設"] },
  { keywords: ["観光", "インバウンド"], folders: ["観光"] },
  { keywords: ["省エネ", "脱炭素", "環境", "エネルギー"], folders: ["省エネ"] },
];

const folderImagesCache = new Map<string, string[]>();

/** FNV-1a 風の単純ハッシュ（外部依存なし・決定論的） */
function hashString(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = (hash * 16777619) >>> 0;
  }
  return hash;
}

function normalizePathSegment(name: string): string {
  return name.replace(/[\\/]/g, "").trim();
}

function listImagesInFolder(folderName: string): string[] {
  const normalized = normalizePathSegment(folderName);
  if (!normalized) return [];
  if (folderImagesCache.has(normalized)) {
    return folderImagesCache.get(normalized) ?? [];
  }

  const folderPath = path.join(CUSTOM_ARTICLE_PICTURES_DIR, normalized);
  if (!fs.existsSync(folderPath)) {
    folderImagesCache.set(normalized, []);
    return [];
  }

  const images = fs
    .readdirSync(folderPath, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((fileName) =>
      IMAGE_EXTENSIONS.has(path.extname(fileName).toLowerCase() as ".jpg"),
    );

  folderImagesCache.set(normalized, images);
  return images;
}

function pickRandom<T>(items: T[]): T | null {
  if (items.length === 0) return null;
  const idx = Math.floor(Math.random() * items.length);
  return items[idx] ?? null;
}

function pickCustomArticlePicture(params: {
  subsidyId: string;
  tags?: string[];
  targetIndustries?: string[];
}): string | null {
  const haystack = [...(params.tags ?? []), ...(params.targetIndustries ?? [])]
    .map((s) => s.trim())
    .filter(Boolean);

  for (const rule of GENRE_FOLDER_RULES) {
    const matched = haystack.some((h) => rule.keywords.some((k) => h.includes(k)));
    if (!matched) continue;
    for (const folderName of rule.folders) {
      const files = listImagesInFolder(folderName);
      if (files.length === 0) continue;
      // subsidyId ベースで疑似ランダム化（記事ごとに安定）
      const idx = hashString(`${params.subsidyId}:${folderName}`) % files.length;
      const picked = files[idx] ?? pickRandom(files);
      if (picked) {
        const folder = encodeURIComponent(folderName);
        const fileName = encodeURIComponent(picked);
        return `/api/article-pictures/${folder}/${fileName}`;
      }
    }
  }

  return null;
}

export function pickHeroImage(params: {
  subsidyId: string;
  tags?: string[];
  targetIndustries?: string[];
}): string {
  // ユーザー配置画像（article_pictures/{ジャンル}）がある場合はこちらを優先
  const custom = pickCustomArticlePicture(params);
  if (custom) return custom;

  const haystack = [...(params.tags ?? []), ...(params.targetIndustries ?? [])]
    .map((s) => s.trim())
    .filter(Boolean);

  for (const pref of TAG_PREFERENCE) {
    if (haystack.some((h) => pref.keywords.some((k) => h.includes(k)))) {
      return pref.image;
    }
  }

  const idx = hashString(params.subsidyId) % IMAGE_POOL.length;
  return IMAGE_POOL[idx];
}

import fs from "node:fs";
import path from "node:path";

const CARDGRID_DIR = path.join(process.cwd(), "LP_cardgrid_pictures");
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

const KEYWORD_ALIASES: Array<{ keywords: string[]; fileHints: string[] }> = [
  { keywords: ["リース", "レンタル"], fileHints: ["リース", "レンタル"] },
  { keywords: ["介護", "福祉"], fileHints: ["介護", "福祉"] },
  { keywords: ["医療", "クリニック", "診療所", "病院"], fileHints: ["医療", "クリニック"] },
  { keywords: ["印刷"], fileHints: ["印刷"] },
  { keywords: ["小売", "卸売"], fileHints: ["小売", "卸売"] },
  { keywords: ["食品加工", "食品", "食品工場"], fileHints: ["食品加工"] },
  { keywords: ["飲食", "レストラン", "料理", "食堂"], fileHints: ["飲食"] },
  { keywords: ["製造", "工場", "機械", "加工業"], fileHints: ["製造"] },
  { keywords: ["サービス"], fileHints: ["サービス"] },
  // 建設画像が LP_cardgrid_pictures に追加された場合は自動で拾う。
  { keywords: ["建設", "建築", "土木", "施工", "重機"], fileHints: ["建設", "建築", "土木", "施工", "重機"] },
];

function normalize(value: string): string {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[・、。，.。()\[\]（）\s_-]/g, "");
}

function listImageFiles(): string[] {
  if (!fs.existsSync(CARDGRID_DIR)) return [];

  return fs
    .readdirSync(CARDGRID_DIR, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((file) => IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase()));
}

function toUrl(fileName: string): string {
  return `/api/lp-cardgrid-pictures/${encodeURIComponent(fileName)}`;
}

export function resolveLpCardGridImage(text: string): string | null {
  const files = listImageFiles();
  if (files.length === 0) return null;

  const normalizedText = normalize(text);

  for (const rule of KEYWORD_ALIASES) {
    const matchesText = rule.keywords.some((keyword) => normalizedText.includes(normalize(keyword)));
    if (!matchesText) continue;

    const matchedFile = files.find((file) => {
      const normalizedFile = normalize(file);
      return rule.fileHints.some((hint) => normalizedFile.includes(normalize(hint)));
    });

    if (matchedFile) return toUrl(matchedFile);
  }

  const matchedByFileName = files.find((file) => {
    const normalizedFile = normalize(file);
    return normalizedFile && (normalizedText.includes(normalizedFile) || normalizedFile.includes(normalizedText));
  });

  return matchedByFileName ? toUrl(matchedByFileName) : null;
}

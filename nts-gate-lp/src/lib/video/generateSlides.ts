/**
 * SVG → sharp で各セクションのスライドPNGを生成する。
 *
 * デザイントークン:
 *   背景: ネイビーグラデーション #1a2544→#0f1a35（タイトル・奇数）/ オフホワイト #f8f7f4（偶数）
 *   アクセント: アンバー #d97706
 *   解像度: 1280×720 (16:9 HD)
 *
 * レイアウト方針:
 *   - highlight あり → 左ブロック（大数値）＋右ブロック（テキスト）の2カラム
 *   - highlight なし → 見出し下に箇条書きを中央エリアに広く配置
 *   - タイトルスライド → 中央揃え・フルスクリーン演出
 */

import sharp from "sharp";
import path from "node:path";
import fs from "node:fs/promises";

export type SlideInput = {
  index: number;
  heading: string;
  lines: string[];
  highlight?: string;
  isTitle?: boolean;
};

const W = 1280;
const H = 720;
const FONT = "Noto Sans JP, Hiragino Kaku Gothic ProN, sans-serif";

function escapeSvg(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** 1行あたり最大文字数で折り返す */
function wrapText(text: string, maxChars: number): string[] {
  const result: string[] = [];
  let line = "";
  for (const ch of text) {
    line += ch;
    if (line.length >= maxChars) {
      result.push(line);
      line = "";
    }
  }
  if (line) result.push(line);
  return result;
}

// ──────────────────────────────────────────────────────────────────
// タイトルスライド（index=0）
// ──────────────────────────────────────────────────────────────────
function buildTitleSlide(slide: SlideInput): string {
  const heading = escapeSvg(slide.heading);
  const sub = slide.lines.map(escapeSvg).join("　");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1a2544"/>
      <stop offset="100%" stop-color="#0d1830"/>
    </linearGradient>
    <linearGradient id="accent-line" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#f59e0b"/>
    </linearGradient>
  </defs>

  <!-- 背景 -->
  <rect width="${W}" height="${H}" fill="url(#bg)"/>

  <!-- 装飾: 右上の大きな円 -->
  <circle cx="${W + 80}" cy="-80" r="360" fill="rgba(217,119,6,0.08)"/>
  <!-- 装飾: 左下の円 -->
  <circle cx="-60" cy="${H + 60}" r="300" fill="rgba(255,255,255,0.03)"/>
  <!-- 装飾: 中央右の小円 -->
  <circle cx="${W - 200}" cy="${H / 2}" r="120" fill="rgba(217,119,6,0.05)"/>

  <!-- 左アクセントバー -->
  <rect x="80" y="200" width="6" height="320" rx="3" fill="url(#accent-line)" opacity="0.9"/>

  <!-- メイン見出し -->
  <text
    x="128"
    y="310"
    font-size="72"
    font-weight="700"
    fill="#ffffff"
    font-family="${FONT}"
    letter-spacing="2"
  >${heading}</text>

  <!-- アクセントライン（見出し下） -->
  <rect x="128" y="336" width="480" height="4" rx="2" fill="url(#accent-line)" opacity="0.8"/>

  <!-- サブテキスト -->
  <text
    x="130"
    y="400"
    font-size="28"
    font-weight="400"
    fill="rgba(248,247,244,0.70)"
    font-family="${FONT}"
    letter-spacing="1"
  >${sub}</text>

  <!-- ブランドマーク -->
  <text
    x="${W - 48}"
    y="${H - 32}"
    text-anchor="end"
    font-size="18"
    font-weight="600"
    fill="rgba(248,247,244,0.35)"
    font-family="${FONT}"
    letter-spacing="3"
  >NTS 日本提携支援</text>
</svg>`;
}

// ──────────────────────────────────────────────────────────────────
// 通常スライド（2カラムレイアウト: highlight あり）
// ──────────────────────────────────────────────────────────────────
function buildTwoColumnSlide(slide: SlideInput, isDark: boolean): string {
  const textColor = isDark ? "#f8f7f4" : "#1a2544";
  const subColor = isDark ? "rgba(248,247,244,0.60)" : "rgba(26,37,68,0.55)";
  const accentColor = "#d97706";
  const badgeNum = String(slide.index + 1).padStart(2, "0");

  const heading = escapeSvg(slide.heading);
  const highlight = escapeSvg(slide.highlight ?? "");

  // 右カラムのテキスト行（最大5行、各24文字で折り返し）
  const allLines: string[] = [];
  for (const line of slide.lines) {
    allLines.push(...wrapText(line, 22));
  }
  const displayLines = allLines.slice(0, 5);

  const lineH = 58;
  const textBlockY = 310;
  const linesHtml = displayLines
    .map((l, i) => {
      const y = textBlockY + i * lineH;
      return `<text x="720" y="${y}" font-size="34" font-weight="400" fill="${textColor}" font-family="${FONT}" opacity="0.92">${escapeSvg(l)}</text>`;
    })
    .join("\n");

  // highlight のフォントサイズを文字数で調整
  const hlLen = slide.highlight?.length ?? 0;
  const hlSize = hlLen <= 6 ? 88 : hlLen <= 10 ? 72 : 58;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg${slide.index}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${isDark ? "#1d2847" : "#faf9f6"}"/>
      <stop offset="100%" stop-color="${isDark ? "#111e3a" : "#f0ede8"}"/>
    </linearGradient>
    <linearGradient id="hl-panel${slide.index}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${isDark ? "rgba(217,119,6,0.18)" : "rgba(217,119,6,0.12)"}"/>
      <stop offset="100%" stop-color="${isDark ? "rgba(217,119,6,0.06)" : "rgba(217,119,6,0.04)"}"/>
    </linearGradient>
  </defs>

  <!-- 背景 -->
  <rect width="${W}" height="${H}" fill="url(#bg${slide.index})"/>

  <!-- 右カラム区切り線 -->
  <line x1="680" y1="100" x2="680" y2="${H - 60}" stroke="${isDark ? "rgba(255,255,255,0.10)" : "rgba(26,37,68,0.10)"}" stroke-width="1"/>

  <!-- 装飾: 右上円 -->
  <circle cx="${W - 60}" cy="60" r="200" fill="${isDark ? "rgba(217,119,6,0.06)" : "rgba(26,37,68,0.04)"}"/>

  <!-- バッジ -->
  <rect x="60" y="36" width="76" height="38" rx="19" fill="${accentColor}"/>
  <text x="98" y="62" text-anchor="middle" font-size="19" font-weight="700" fill="#fff" font-family="${FONT}">${badgeNum}</text>

  <!-- 見出し -->
  <text x="160" y="72" font-size="38" font-weight="700" fill="${textColor}" font-family="${FONT}" letter-spacing="1">${heading}</text>

  <!-- 見出し下ライン -->
  <rect x="60" y="90" width="${W - 120}" height="2" rx="1" fill="${isDark ? "rgba(255,255,255,0.10)" : "rgba(26,37,68,0.08)"}"/>

  <!-- 左パネル: highlight -->
  <rect x="60" y="120" width="580" height="${H - 180}" rx="16" fill="url(#hl-panel${slide.index})"/>
  <rect x="60" y="120" width="4" height="${H - 180}" rx="2" fill="${accentColor}" opacity="0.9"/>

  <!-- highlight テキスト -->
  <text
    x="350"
    y="${H / 2 + hlSize * 0.35}"
    text-anchor="middle"
    font-size="${hlSize}"
    font-weight="700"
    fill="${accentColor}"
    font-family="${FONT}"
    letter-spacing="2"
  >${highlight}</text>

  <!-- highlight ラベル -->
  <text
    x="350"
    y="${H / 2 + hlSize * 0.35 + 48}"
    text-anchor="middle"
    font-size="20"
    font-weight="400"
    fill="${subColor}"
    font-family="${FONT}"
  >詳細は公募要領をご確認ください</text>

  <!-- 右カラム: テキスト行 -->
  ${linesHtml}

  <!-- ブランドマーク -->
  <text x="${W - 48}" y="${H - 28}" text-anchor="end" font-size="17" font-weight="600" fill="${isDark ? "rgba(248,247,244,0.28)" : "rgba(26,37,68,0.25)"}" font-family="${FONT}" letter-spacing="3">NTS 日本提携支援</text>
</svg>`;
}

// ──────────────────────────────────────────────────────────────────
// 通常スライド（シングルカラムレイアウト: highlight なし）
// ──────────────────────────────────────────────────────────────────
function buildSingleColumnSlide(slide: SlideInput, isDark: boolean): string {
  const textColor = isDark ? "#f8f7f4" : "#1a2544";
  const accentColor = "#d97706";
  const badgeNum = String(slide.index + 1).padStart(2, "0");
  const heading = escapeSvg(slide.heading);

  // テキスト行（各24文字で折り返し）
  const allLines: string[] = [];
  for (const line of slide.lines) {
    allLines.push(...wrapText(line, 26));
  }
  const displayLines = allLines.slice(0, 6);

  // 行数に応じてフォントサイズと行間を調整
  const lineCount = displayLines.length;
  const fontSize = lineCount <= 3 ? 44 : lineCount <= 5 ? 38 : 34;
  const lineH = fontSize * 1.7;

  // テキストブロックの縦中央
  const totalTextH = lineCount * lineH;
  const contentAreaTop = 130;
  const contentAreaH = H - contentAreaTop - 80;
  const startY = contentAreaTop + (contentAreaH - totalTextH) / 2 + fontSize;

  const linesHtml = displayLines
    .map((l, i) => {
      const y = startY + i * lineH;
      // 箇条書き記号（・）行か判定してインデント
      const isItem = l.startsWith("・") || l.startsWith("•");
      const x = isItem ? 140 : 120;
      return `<text x="${x}" y="${y}" font-size="${fontSize}" font-weight="${isItem ? "400" : "500"}" fill="${textColor}" font-family="${FONT}" opacity="0.93">${escapeSvg(l)}</text>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg${slide.index}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${isDark ? "#1d2847" : "#faf9f6"}"/>
      <stop offset="100%" stop-color="${isDark ? "#111e3a" : "#f0ede8"}"/>
    </linearGradient>
  </defs>

  <!-- 背景 -->
  <rect width="${W}" height="${H}" fill="url(#bg${slide.index})"/>

  <!-- 装飾: 右上円 -->
  <circle cx="${W + 40}" cy="-40" r="280" fill="${isDark ? "rgba(217,119,6,0.06)" : "rgba(26,37,68,0.04)"}"/>
  <!-- 装飾: 左下円 -->
  <circle cx="-40" cy="${H + 40}" r="220" fill="${isDark ? "rgba(255,255,255,0.03)" : "rgba(217,119,6,0.04)"}"/>

  <!-- 左アクセントバー（全高） -->
  <rect x="60" y="100" width="5" height="${H - 160}" rx="3" fill="${accentColor}" opacity="0.85"/>

  <!-- バッジ -->
  <rect x="80" y="36" width="76" height="38" rx="19" fill="${accentColor}"/>
  <text x="118" y="62" text-anchor="middle" font-size="19" font-weight="700" fill="#fff" font-family="${FONT}">${badgeNum}</text>

  <!-- 見出し -->
  <text x="180" y="72" font-size="40" font-weight="700" fill="${textColor}" font-family="${FONT}" letter-spacing="1">${heading}</text>

  <!-- 見出し下ライン -->
  <rect x="80" y="92" width="${W - 140}" height="2" rx="1" fill="${isDark ? "rgba(255,255,255,0.10)" : "rgba(26,37,68,0.08)"}"/>

  <!-- 本文テキスト -->
  ${linesHtml}

  <!-- ブランドマーク -->
  <text x="${W - 48}" y="${H - 28}" text-anchor="end" font-size="17" font-weight="600" fill="${isDark ? "rgba(248,247,244,0.28)" : "rgba(26,37,68,0.25)"}" font-family="${FONT}" letter-spacing="3">NTS 日本提携支援</text>
</svg>`;
}

// ──────────────────────────────────────────────────────────────────
// CTAスライド（最終スライド専用: NTS へのご相談）
// ──────────────────────────────────────────────────────────────────
function buildCtaSlide(slide: SlideInput): string {
  const badgeNum = String(slide.index + 1).padStart(2, "0");
  const heading = escapeSvg(slide.heading);
  const highlight = escapeSvg(slide.highlight ?? "無料相談受付中");

  const allLines: string[] = [];
  for (const line of slide.lines) {
    allLines.push(...wrapText(line, 26));
  }
  const displayLines = allLines.slice(0, 4);
  const lineH = 52;
  const linesHtml = displayLines
    .map((l, i) => {
      const y = 350 + i * lineH;
      return `<text x="${W / 2}" y="${y}" text-anchor="middle" font-size="30" font-weight="400" fill="rgba(248,247,244,0.80)" font-family="${FONT}">${escapeSvg(l)}</text>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="cta-bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1a2544"/>
      <stop offset="100%" stop-color="#0d1830"/>
    </linearGradient>
    <linearGradient id="cta-panel" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(217,119,6,0.22)"/>
      <stop offset="100%" stop-color="rgba(217,119,6,0.08)"/>
    </linearGradient>
  </defs>

  <!-- 背景 -->
  <rect width="${W}" height="${H}" fill="url(#cta-bg)"/>

  <!-- 装飾円 -->
  <circle cx="${W / 2}" cy="${H / 2}" r="400" fill="rgba(217,119,6,0.05)"/>
  <circle cx="${W / 2}" cy="${H / 2}" r="260" fill="rgba(217,119,6,0.06)"/>

  <!-- 中央パネル -->
  <rect x="160" y="100" width="${W - 320}" height="${H - 200}" rx="24" fill="url(#cta-panel)"/>
  <rect x="160" y="100" width="${W - 320}" height="4" rx="2" fill="#d97706" opacity="0.8"/>

  <!-- バッジ -->
  <rect x="180" y="130" width="76" height="38" rx="19" fill="#d97706"/>
  <text x="218" y="156" text-anchor="middle" font-size="19" font-weight="700" fill="#fff" font-family="${FONT}">${badgeNum}</text>

  <!-- 見出し -->
  <text x="${W / 2}" y="220" text-anchor="middle" font-size="42" font-weight="700" fill="#ffffff" font-family="${FONT}" letter-spacing="1">${heading}</text>

  <!-- highlight -->
  <text x="${W / 2}" y="300" text-anchor="middle" font-size="64" font-weight="700" fill="#d97706" font-family="${FONT}" letter-spacing="2">${highlight}</text>

  <!-- テキスト行 -->
  ${linesHtml}

  <!-- ブランドマーク -->
  <text x="${W - 48}" y="${H - 28}" text-anchor="end" font-size="17" font-weight="600" fill="rgba(248,247,244,0.30)" font-family="${FONT}" letter-spacing="3">NTS 日本提携支援</text>
</svg>`;
}

// ──────────────────────────────────────────────────────────────────
// メインディスパッチャー
// ──────────────────────────────────────────────────────────────────
function buildSlideSvg(slide: SlideInput): string {
  if (slide.isTitle) {
    return buildTitleSlide(slide);
  }

  // 最終スライド（NTS CTA）判定: heading に "相談" または "NTS" を含む
  const isCtaSlide = /相談|NTS/i.test(slide.heading);
  if (isCtaSlide) {
    return buildCtaSlide(slide);
  }

  const isDark = slide.index % 2 === 0;
  const hasHighlight = !!(slide.highlight && slide.highlight.trim());

  if (hasHighlight) {
    return buildTwoColumnSlide(slide, isDark);
  } else {
    return buildSingleColumnSlide(slide, isDark);
  }
}

export async function renderSlideToPng(slide: SlideInput): Promise<Buffer> {
  const svg = buildSlideSvg(slide);
  return await sharp(Buffer.from(svg))
    .png({ compressionLevel: 6 })
    .toBuffer();
}

export async function renderSlidesToDir(
  slides: SlideInput[],
  outputDir: string
): Promise<string[]> {
  await fs.mkdir(outputDir, { recursive: true });
  const paths: string[] = [];

  for (const slide of slides) {
    const buf = await renderSlideToPng(slide);
    const filename = `slide-${String(slide.index).padStart(2, "0")}.png`;
    const filepath = path.join(outputDir, filename);
    await fs.writeFile(filepath, buf);
    paths.push(filepath);
  }

  return paths;
}

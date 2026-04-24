/**
 * SVG → sharp で各セクションのスライドPNGを生成する。
 *
 * デザイントークン:
 *   背景: ネイビー #1a2544（奇数スライド）/ オフホワイト #f8f7f4（偶数スライド）
 *   アクセント: アンバー #d97706
 *   解像度: 1280×720 (16:9 HD)
 */

import sharp from "sharp";
import path from "node:path";
import fs from "node:fs/promises";

export type SlideInput = {
  index: number;       // 0始まり
  heading: string;     // セクション見出し（例: "イントロ"）
  lines: string[];     // 表示テキスト（箇条書き or 段落、最大5行）
  highlight?: string;  // 大きく強調する数字・キーワード（任意）
  isTitle?: boolean;   // 最初のタイトルスライドか
};

const W = 1280;
const H = 720;
const FONT_SANS = "Noto Sans JP, Hiragino Kaku Gothic ProN, sans-serif";

// SVGで使うtspan行折り返しヘルパー（長い文字列を折り返す）
function wrapLines(text: string, maxChars = 26): string[] {
  const words = text.split("");
  const result: string[] = [];
  let line = "";
  for (const ch of words) {
    line += ch;
    if (line.length >= maxChars) {
      result.push(line);
      line = "";
    }
  }
  if (line) result.push(line);
  return result;
}

function escapeSvg(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildSlideSvg(slide: SlideInput): string {
  const isDark = slide.isTitle || slide.index % 2 === 0;
  const bg = isDark ? "#1a2544" : "#f8f7f4";
  const textColor = isDark ? "#f8f7f4" : "#1a2544";
  const accentColor = "#d97706";
  const subtleColor = isDark ? "rgba(248,247,244,0.45)" : "rgba(26,37,68,0.40)";

  // セクション番号バッジ（タイトルスライドは非表示）
  const badgeNum = slide.isTitle ? "" : String(slide.index + 1).padStart(2, "0");

  // 見出し
  const headingEsc = escapeSvg(slide.heading);

  // テキスト行を折り返してtspanに変換
  const allLines: string[] = [];
  for (const line of slide.lines) {
    const wrapped = wrapLines(line, 28);
    allLines.push(...wrapped);
  }
  // 最大6行まで
  const displayLines = allLines.slice(0, 6);

  const lineHeight = 52;
  const startY = slide.isTitle ? 340 : 300;
  const linesHtml = displayLines
    .map(
      (l, i) =>
        `<tspan x="${slide.isTitle ? W / 2 : 100}" dy="${i === 0 ? 0 : lineHeight}" ${slide.isTitle ? 'text-anchor="middle"' : ""}>${escapeSvg(l)}</tspan>`
    )
    .join("\n");

  // ハイライト（大きな数字・キーワード）
  const highlightSvg = slide.highlight
    ? `<text
        x="${W / 2}"
        y="${H - 80}"
        text-anchor="middle"
        font-size="64"
        font-weight="700"
        fill="${accentColor}"
        font-family="${FONT_SANS}"
        opacity="0.9"
      >${escapeSvg(slide.highlight)}</text>`
    : "";

  // 左アクセントライン（タイトル以外）
  const accentLine = slide.isTitle
    ? ""
    : `<rect x="60" y="100" width="5" height="520" rx="3" fill="${accentColor}" opacity="0.9"/>`;

  // セクションバッジ
  const badge = badgeNum
    ? `<rect x="60" y="40" width="72" height="36" rx="18" fill="${accentColor}"/>
       <text x="96" y="64" text-anchor="middle" font-size="18" font-weight="700" fill="#fff" font-family="${FONT_SANS}">${badgeNum}</text>`
    : "";

  // 見出しのY位置
  const headingY = slide.isTitle ? 280 : 140;
  const headingSize = slide.isTitle ? "72" : "42";
  const headingAnchor = slide.isTitle ? `text-anchor="middle" x="${W / 2}"` : `x="100"`;

  // ロゴ的なブランド文字（右下）
  const brandMark = `<text x="${W - 40}" y="${H - 30}" text-anchor="end" font-size="18" font-weight="600" fill="${subtleColor}" font-family="${FONT_SANS}" letter-spacing="2">NTS 日本提携支援</text>`;

  // 装飾円
  const deco = isDark
    ? `<circle cx="${W - 60}" cy="60" r="180" fill="rgba(217,119,6,0.07)"/>
       <circle cx="-20" cy="${H + 20}" r="220" fill="rgba(248,247,244,0.04)"/>`
    : `<circle cx="${W - 40}" cy="40" r="160" fill="rgba(26,37,68,0.05)"/>
       <circle cx="0" cy="${H}" r="200" fill="rgba(217,119,6,0.04)"/>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <!-- 背景 -->
  <rect width="${W}" height="${H}" fill="${bg}"/>
  ${deco}
  <!-- アクセントライン -->
  ${accentLine}
  <!-- バッジ -->
  ${badge}
  <!-- 見出し -->
  <text
    ${headingAnchor}
    y="${headingY}"
    font-size="${headingSize}"
    font-weight="700"
    fill="${textColor}"
    font-family="${FONT_SANS}"
  >${headingEsc}</text>
  <!-- 区切り線 -->
  ${slide.isTitle ? `<line x1="${W / 2 - 80}" y1="${headingY + 24}" x2="${W / 2 + 80}" y2="${headingY + 24}" stroke="${accentColor}" stroke-width="3" stroke-linecap="round"/>` : ""}
  <!-- 本文 -->
  <text
    y="${startY}"
    font-size="32"
    font-weight="400"
    fill="${textColor}"
    font-family="${FONT_SANS}"
    opacity="0.92"
  >${linesHtml}</text>
  <!-- ハイライト -->
  ${highlightSvg}
  <!-- ブランドマーク -->
  ${brandMark}
</svg>`;
}

/**
 * スライド1枚分のSVGをsharpでPNGに変換してBufferで返す。
 */
export async function renderSlideToPng(slide: SlideInput): Promise<Buffer> {
  const svg = buildSlideSvg(slide);
  const buf = await sharp(Buffer.from(svg))
    .png({ compressionLevel: 6 })
    .toBuffer();
  return buf;
}

/**
 * 複数スライドをPNGファイルとして指定ディレクトリに書き出す。
 * ファイル名: slide-00.png, slide-01.png, ...
 * 返り値: 書き出したファイルパスの配列
 */
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

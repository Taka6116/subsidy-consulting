/**
 * SVG → sharp で各セクションのスライドPNGを生成する。
 *
 * デザイントークン:
 *   背景: ネイビーグラデーション #1a2544→#0f1a35（タイトル・奇数）/ オフホワイト #f8f7f4（偶数）
 *   アクセント: アンバー #d97706
 *   解像度: 1280×720 (16:9 HD)
 *
 * v2: type/layout フィールドによるディスパッチャー対応。
 *   - hook      : 全画面テキスト・大フォント・最小要素
 *   - problem   : 左アイコン列＋右テキストリスト
 *   - solution  : 補助金名を中央大きく
 *   - numbers   : 数字を96px超で表示
 *   - story     : 左右分割・Before/After
 *   - cta       : 期限強調＋NTS相談誘導
 */

import sharp from "sharp";
import path from "node:path";
import fs from "node:fs/promises";
import { svgFontFaceStyle, VIDEO_FONT_FAMILY } from "@/lib/video/fonts";
import type { VideoSlideType, VideoSlideLayout } from "@/lib/ai/bedrockVideoScriptGenerate";

export type SlideInput = {
  index: number;
  heading: string;
  lines: string[];
  highlight?: string;
  isTitle?: boolean;
  type?: VideoSlideType;
  layout?: VideoSlideLayout;
};

const W = 1280;
const H = 720;
const FONT = `${VIDEO_FONT_FAMILY}, Noto Sans JP, Hiragino Kaku Gothic ProN, sans-serif`;
const FONT_FACE_STYLE = svgFontFaceStyle();

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
  ${FONT_FACE_STYLE}
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
// HOOK スライド: 全画面テキスト・最小要素・大フォント
// ──────────────────────────────────────────────────────────────────
function buildHookSlide(slide: SlideInput): string {
  const allLines: string[] = [];
  for (const line of slide.lines) {
    allLines.push(...wrapText(line, 20));
  }
  const displayLines = allLines.slice(0, 3);
  const highlight = escapeSvg(slide.highlight ?? "");

  const lineH = 80;
  const totalH = displayLines.length * lineH;
  const startY = (H - totalH) / 2;

  const linesHtml = displayLines
    .map((l, i) => {
      const y = startY + i * lineH + 56;
      return `<text x="${W / 2}" y="${y}" text-anchor="middle" font-size="56" font-weight="700" fill="#ffffff" font-family="${FONT}" letter-spacing="1">${escapeSvg(l)}</text>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${FONT_FACE_STYLE}
  <defs>
    <linearGradient id="hook-bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f1e3a"/>
      <stop offset="100%" stop-color="#1a2e54"/>
    </linearGradient>
    <linearGradient id="hook-accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#f59e0b"/>
    </linearGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#hook-bg)"/>

  <!-- 装飾: 中央グロー -->
  <circle cx="${W / 2}" cy="${H / 2}" r="380" fill="rgba(217,119,6,0.06)"/>
  <circle cx="${W / 2}" cy="${H / 2}" r="200" fill="rgba(217,119,6,0.04)"/>

  <!-- アクセントライン（上） -->
  <rect x="0" y="0" width="${W}" height="6" fill="url(#hook-accent)" opacity="0.9"/>
  <!-- アクセントライン（下） -->
  <rect x="0" y="${H - 6}" width="${W}" height="6" fill="url(#hook-accent)" opacity="0.9"/>

  <!-- メインテキスト -->
  ${linesHtml}

  <!-- highlight (強調キーワード) -->
  ${highlight ? `<text x="${W / 2}" y="${startY + displayLines.length * lineH + 100}" text-anchor="middle" font-size="32" font-weight="600" fill="#d97706" font-family="${FONT}" letter-spacing="2">${highlight}</text>` : ""}

  <!-- ブランドマーク -->
  <text x="${W - 48}" y="${H - 28}" text-anchor="end" font-size="17" font-weight="600" fill="rgba(248,247,244,0.28)" font-family="${FONT}" letter-spacing="3">NTS 日本提携支援</text>
</svg>`;
}

// ──────────────────────────────────────────────────────────────────
// PROBLEM スライド: 左アクセント＋箇条書き一覧（やや暗めトーン）
// ──────────────────────────────────────────────────────────────────
function buildProblemSlide(slide: SlideInput): string {
  const heading = escapeSvg(slide.heading);
  const highlight = escapeSvg(slide.highlight ?? "");

  const allLines: string[] = [];
  for (const line of slide.lines) {
    allLines.push(...wrapText(line, 22));
  }
  const displayLines = allLines.slice(0, 4);

  const lineH = 76;
  const startY = 200;

  const linesHtml = displayLines
    .map((l, i) => {
      const y = startY + i * lineH;
      const isItem = l.startsWith("・") || l.startsWith("•");
      return `
  <rect x="96" y="${y - 46}" width="${W - 192}" height="64" rx="12" fill="rgba(255,255,255,0.04)"/>
  <text x="130" y="${y}" font-size="38" font-weight="${isItem ? "500" : "600"}" fill="#f0ede8" font-family="${FONT}" opacity="0.95">${escapeSvg(l)}</text>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${FONT_FACE_STYLE}
  <defs>
    <linearGradient id="prob-bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1c2640"/>
      <stop offset="100%" stop-color="#111e34"/>
    </linearGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#prob-bg)"/>

  <!-- 装飾: 右下の円 -->
  <circle cx="${W}" cy="${H}" r="300" fill="rgba(217,119,6,0.05)"/>

  <!-- 左アクセントバー -->
  <rect x="60" y="60" width="6" height="${H - 120}" rx="3" fill="#d97706" opacity="0.8"/>

  <!-- 見出し -->
  <text x="100" y="100" font-size="44" font-weight="700" fill="#ffffff" font-family="${FONT}" letter-spacing="1">${heading}</text>
  <!-- highlight サブ -->
  ${highlight ? `<text x="100" y="148" font-size="26" font-weight="500" fill="#d97706" font-family="${FONT}">${highlight}</text>` : ""}

  <!-- 区切り線 -->
  <rect x="96" y="160" width="${W - 192}" height="2" rx="1" fill="rgba(255,255,255,0.10)"/>

  <!-- 課題リスト -->
  ${linesHtml}

  <!-- ブランドマーク -->
  <text x="${W - 48}" y="${H - 28}" text-anchor="end" font-size="17" font-weight="600" fill="rgba(248,247,244,0.28)" font-family="${FONT}" letter-spacing="3">NTS 日本提携支援</text>
</svg>`;
}

// ──────────────────────────────────────────────────────────────────
// SOLUTION スライド: 補助金名を中央大きく・上下に文脈テキスト
// ──────────────────────────────────────────────────────────────────
function buildSolutionSlide(slide: SlideInput): string {
  const heading = escapeSvg(slide.heading);
  const highlight = escapeSvg(slide.highlight ?? "");
  const allLines: string[] = [];
  for (const line of slide.lines) {
    allLines.push(...wrapText(line, 24));
  }
  const displayLines = allLines.slice(0, 4);
  const lineH = 52;
  const startY = 390;

  const linesHtml = displayLines
    .map((l, i) => {
      const y = startY + i * lineH;
      return `<text x="${W / 2}" y="${y}" text-anchor="middle" font-size="30" font-weight="400" fill="rgba(26,37,68,0.75)" font-family="${FONT}">${escapeSvg(l)}</text>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${FONT_FACE_STYLE}
  <defs>
    <linearGradient id="sol-bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#faf9f6"/>
      <stop offset="100%" stop-color="#edf0f7"/>
    </linearGradient>
    <linearGradient id="sol-accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#f59e0b"/>
    </linearGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#sol-bg)"/>
  <!-- 装飾: 中央円 -->
  <circle cx="${W / 2}" cy="${H / 2}" r="340" fill="rgba(26,37,68,0.03)"/>

  <!-- 上部アクセントバー -->
  <rect x="0" y="0" width="${W}" height="8" fill="url(#sol-accent)"/>

  <!-- 見出し -->
  <text x="${W / 2}" y="90" text-anchor="middle" font-size="38" font-weight="600" fill="rgba(26,37,68,0.55)" font-family="${FONT}" letter-spacing="1">${heading}</text>

  <!-- 補助金名（中央大表示） -->
  <text x="${W / 2}" y="260" text-anchor="middle" font-size="60" font-weight="700" fill="#1a2544" font-family="${FONT}" letter-spacing="2">${highlight}</text>

  <!-- アクセントライン -->
  <rect x="${W / 2 - 200}" y="280" width="400" height="4" rx="2" fill="url(#sol-accent)" opacity="0.8"/>

  <!-- 説明テキスト -->
  ${linesHtml}

  <!-- ブランドマーク -->
  <text x="${W - 48}" y="${H - 28}" text-anchor="end" font-size="17" font-weight="600" fill="rgba(26,37,68,0.25)" font-family="${FONT}" letter-spacing="3">NTS 日本提携支援</text>
</svg>`;
}

// ──────────────────────────────────────────────────────────────────
// NUMBERS スライド: 数字を96px超で大きく表示
// ──────────────────────────────────────────────────────────────────
function buildNumberSlide(slide: SlideInput): string {
  const heading = escapeSvg(slide.heading);
  const highlight = escapeSvg(slide.highlight ?? "");

  const allLines: string[] = [];
  for (const line of slide.lines) {
    allLines.push(...wrapText(line, 22));
  }
  const displayLines = allLines.slice(0, 4);
  const lineH = 64;
  const startY = 310;

  const linesHtml = displayLines
    .map((l, i) => {
      const y = startY + i * lineH;
      return `<text x="720" y="${y}" font-size="36" font-weight="400" fill="rgba(248,247,244,0.85)" font-family="${FONT}">${escapeSvg(l)}</text>`;
    })
    .join("\n");

  // highlight サイズ調整
  const hlLen = slide.highlight?.length ?? 0;
  const hlSize = hlLen <= 5 ? 104 : hlLen <= 8 ? 88 : hlLen <= 12 ? 72 : 58;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${FONT_FACE_STYLE}
  <defs>
    <linearGradient id="num-bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1a2544"/>
      <stop offset="100%" stop-color="#0f1e3a"/>
    </linearGradient>
    <linearGradient id="num-panel" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(217,119,6,0.20)"/>
      <stop offset="100%" stop-color="rgba(217,119,6,0.06)"/>
    </linearGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#num-bg)"/>

  <!-- 装飾 -->
  <circle cx="340" cy="${H / 2}" r="260" fill="rgba(217,119,6,0.06)"/>

  <!-- 縦区切り線 -->
  <line x1="680" y1="80" x2="680" y2="${H - 60}" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>

  <!-- 見出し -->
  <text x="96" y="72" font-size="38" font-weight="700" fill="#ffffff" font-family="${FONT}" letter-spacing="1">${heading}</text>
  <rect x="80" y="90" width="${W - 160}" height="2" rx="1" fill="rgba(255,255,255,0.10)"/>

  <!-- 左パネル: 巨大数値 -->
  <rect x="80" y="120" width="560" height="${H - 180}" rx="16" fill="url(#num-panel)"/>
  <rect x="80" y="120" width="4" height="${H - 180}" rx="2" fill="#d97706" opacity="0.9"/>

  <!-- 巨大 highlight 数値 -->
  <text
    x="360"
    y="${H / 2 + hlSize * 0.36}"
    text-anchor="middle"
    font-size="${hlSize}"
    font-weight="700"
    fill="#f59e0b"
    font-family="${FONT}"
    letter-spacing="1"
  >${highlight}</text>

  <!-- 右カラム: 詳細行 -->
  ${linesHtml}

  <!-- ブランドマーク -->
  <text x="${W - 48}" y="${H - 28}" text-anchor="end" font-size="17" font-weight="600" fill="rgba(248,247,244,0.28)" font-family="${FONT}" letter-spacing="3">NTS 日本提携支援</text>
</svg>`;
}

// ──────────────────────────────────────────────────────────────────
// STORY スライド: 左右分割・左=課題色(グレー)・右=解決色(ブルー系)
// ──────────────────────────────────────────────────────────────────
function buildStorySlide(slide: SlideInput): string {
  const heading = escapeSvg(slide.heading);
  const highlight = escapeSvg(slide.highlight ?? "");
  const allLines: string[] = [];
  for (const line of slide.lines) {
    allLines.push(...wrapText(line, 20));
  }

  // "架空の事例です" はラベルとして上部に配置
  const noteIdx = allLines.findIndex((l) => l.includes("架空") || l.includes("事例"));
  const noteText = noteIdx >= 0 ? escapeSvg(allLines[noteIdx]) : "架空の事例です";
  const contentLines = allLines.filter((_, i) => i !== noteIdx);

  // Before/After に分割（"Before"/"After" をキーに判断）
  const beforeLines = contentLines.filter((l) => /before|課題|導入前/i.test(l));
  const afterLines = contentLines.filter((l) => /after|導入後|効果|削減|増加/i.test(l));
  const otherLines = contentLines.filter(
    (l) => !beforeLines.includes(l) && !afterLines.includes(l)
  );
  // フォールバック: 前半をBefore・後半をAfterに
  const bLines = beforeLines.length ? beforeLines : otherLines.slice(0, Math.ceil(otherLines.length / 2));
  const aLines = afterLines.length ? afterLines : otherLines.slice(Math.ceil(otherLines.length / 2));

  const lineH = 58;

  const beforeHtml = bLines.slice(0, 3).map((l, i) => {
    const y = 240 + i * lineH;
    return `<text x="320" y="${y}" text-anchor="middle" font-size="30" font-weight="400" fill="rgba(26,37,68,0.75)" font-family="${FONT}">${escapeSvg(l)}</text>`;
  }).join("\n");

  const afterHtml = aLines.slice(0, 3).map((l, i) => {
    const y = 240 + i * lineH;
    return `<text x="960" y="${y}" text-anchor="middle" font-size="30" font-weight="500" fill="#1a2544" font-family="${FONT}">${escapeSvg(l)}</text>`;
  }).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${FONT_FACE_STYLE}
  <defs>
    <linearGradient id="story-bg" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#e8ecf4"/>
      <stop offset="50%" stop-color="#f4f3f0"/>
      <stop offset="100%" stop-color="#dff0f9"/>
    </linearGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#story-bg)"/>

  <!-- 左パネル（Before・グレー系） -->
  <rect x="0" y="0" width="640" height="${H}" fill="rgba(180,190,210,0.25)"/>
  <!-- 右パネル（After・ブルー系） -->
  <rect x="640" y="0" width="640" height="${H}" fill="rgba(186,230,253,0.25)"/>

  <!-- 中央仕切り矢印 -->
  <line x1="638" y1="80" x2="638" y2="${H - 60}" stroke="rgba(26,37,68,0.15)" stroke-width="2"/>
  <polygon points="638,${H / 2 - 20} 658,${H / 2} 638,${H / 2 + 20}" fill="#d97706" opacity="0.8"/>

  <!-- 上部アクセントバー -->
  <rect x="0" y="0" width="${W}" height="6" fill="#d97706" opacity="0.7"/>

  <!-- 見出し -->
  <text x="${W / 2}" y="56" text-anchor="middle" font-size="36" font-weight="700" fill="#1a2544" font-family="${FONT}" letter-spacing="1">${heading}</text>

  <!-- ラベル注記 -->
  <text x="${W / 2}" y="90" text-anchor="middle" font-size="20" font-weight="400" fill="rgba(26,37,68,0.45)" font-family="${FONT}">${noteText}</text>

  <!-- Before ラベル -->
  <text x="320" y="160" text-anchor="middle" font-size="28" font-weight="700" fill="rgba(100,116,139,1)" font-family="${FONT}" letter-spacing="2">Before</text>
  <rect x="200" y="172" width="240" height="3" rx="2" fill="rgba(100,116,139,0.5)"/>

  <!-- After ラベル -->
  <text x="960" y="160" text-anchor="middle" font-size="28" font-weight="700" fill="#1d6fa4" font-family="${FONT}" letter-spacing="2">After</text>
  <rect x="840" y="172" width="240" height="3" rx="2" fill="rgba(29,111,164,0.5)"/>

  <!-- Before テキスト -->
  ${beforeHtml}

  <!-- After テキスト -->
  ${afterHtml}

  <!-- highlight（効果数値） -->
  ${highlight ? `
  <rect x="720" y="${H - 120}" width="480" height="60" rx="12" fill="rgba(217,119,6,0.12)"/>
  <text x="960" y="${H - 80}" text-anchor="middle" font-size="34" font-weight="700" fill="#d97706" font-family="${FONT}" letter-spacing="1">${highlight}</text>` : ""}

  <!-- ブランドマーク -->
  <text x="${W - 48}" y="${H - 28}" text-anchor="end" font-size="17" font-weight="600" fill="rgba(26,37,68,0.25)" font-family="${FONT}" letter-spacing="3">NTS 日本提携支援</text>
</svg>`;
}

// ──────────────────────────────────────────────────────────────────
// CTA スライド（期限強調 + NTS 無料相談）
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
      // 「申請期限」行はオレンジ強調
      const isDeadline = /期限|締切/.test(l);
      const color = isDeadline ? "#f59e0b" : "rgba(248,247,244,0.80)";
      const weight = isDeadline ? "700" : "400";
      return `<text x="${W / 2}" y="${y}" text-anchor="middle" font-size="30" font-weight="${weight}" fill="${color}" font-family="${FONT}">${escapeSvg(l)}</text>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${FONT_FACE_STYLE}
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
  <text x="${W / 2}" y="310" text-anchor="middle" font-size="64" font-weight="700" fill="#d97706" font-family="${FONT}" letter-spacing="2">${highlight}</text>

  <!-- テキスト行 -->
  ${linesHtml}

  <!-- ブランドマーク -->
  <text x="${W - 48}" y="${H - 28}" text-anchor="end" font-size="17" font-weight="600" fill="rgba(248,247,244,0.30)" font-family="${FONT}" letter-spacing="3">NTS 日本提携支援</text>
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

  const hlLen = slide.highlight?.length ?? 0;
  const hlSize = hlLen <= 6 ? 88 : hlLen <= 10 ? 72 : 58;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${FONT_FACE_STYLE}
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

  const allLines: string[] = [];
  for (const line of slide.lines) {
    allLines.push(...wrapText(line, 26));
  }
  const displayLines = allLines.slice(0, 6);

  const lineCount = displayLines.length;
  const fontSize = lineCount <= 3 ? 44 : lineCount <= 5 ? 38 : 34;
  const lineH = fontSize * 1.7;

  const totalTextH = lineCount * lineH;
  const contentAreaTop = 130;
  const contentAreaH = H - contentAreaTop - 80;
  const startY = contentAreaTop + (contentAreaH - totalTextH) / 2 + fontSize;

  const linesHtml = displayLines
    .map((l, i) => {
      const y = startY + i * lineH;
      const isItem = l.startsWith("・") || l.startsWith("•");
      const x = isItem ? 140 : 120;
      return `<text x="${x}" y="${y}" font-size="${fontSize}" font-weight="${isItem ? "400" : "500"}" fill="${textColor}" font-family="${FONT}" opacity="0.93">${escapeSvg(l)}</text>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${FONT_FACE_STYLE}
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
// メインディスパッチャー（type/layout 優先・既存ロジックはフォールバック）
// ──────────────────────────────────────────────────────────────────
function buildSlideSvg(slide: SlideInput): string {
  if (slide.isTitle) {
    return buildTitleSlide(slide);
  }

  // type ベースのディスパッチ（P1新規）
  if (slide.type) {
    switch (slide.type) {
      case "hook":
        return buildHookSlide(slide);
      case "problem":
        return buildProblemSlide(slide);
      case "solution":
        return buildSolutionSlide(slide);
      case "numbers":
        return buildNumberSlide(slide);
      case "story":
        return buildStorySlide(slide);
      case "cta":
        return buildCtaSlide(slide);
    }
  }

  // 後方互換フォールバック（type なし・旧データ対応）
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

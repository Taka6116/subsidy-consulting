/**
 * FFmpeg で複数のスライドPNG＋MP3音声を合成して MP4 を生成する。
 *
 * 方式:
 *   - 各スライドの表示秒数は VideoScriptSection.duration_sec に従う
 *   - concat フィルターでスライドを結合し、音声トラックを最後まで乗せる
 *   - 出力: H.264 / AAC, 1280×720, 最大ビットレート 2Mbps
 *
 * 必要環境:
 *   FFMPEG_PATH 環境変数 or システムPATH に ffmpeg が存在すること。
 *   Lambda では /opt/bin/ffmpeg（FFmpeg Lambda Layer）を想定。
 */

import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";
import path from "node:path";
import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import sharp from "sharp";
import type { VideoScriptSection } from "@/lib/ai/bedrockVideoScriptGenerate";
import type { StockClip } from "@/lib/video/stockFootage";
import {
  resolveVideoFontPath,
} from "@/lib/video/fonts";

const LOG_PREFIX = "[composeVideo]";
const requireFromHere = createRequire(import.meta.url);

export type SlideTimingInput = {
  pngPath: string;      // スライドPNGのファイルパス
  durationSec: number;  // このスライドを表示する秒数
};

export type ComposeVideoResult = {
  outputPath: string;
  durationSec: number;
};

export type ComposeEnhancedVideoInput = {
  slides: SlideTimingInput[];
  sections: VideoScriptSection[];
  stockClips: StockClip[];
  title?: string;
  audioPath: string;
  subtitlePath?: string;
  outputDir: string;
  outputName?: string;
};

/**
 * FFmpegのパスを解決する。
 * Lambda: /opt/bin/ffmpeg
 * ローカル: PATH から自動解決
 */
function resolveFfmpegPath(): string | undefined {
  const envPath = process.env.FFMPEG_PATH;
  if (envPath && existsSync(envPath)) return envPath;

  // Lambda Layer の標準パス
  const lambdaPath = "/opt/bin/ffmpeg";
  if (existsSync(lambdaPath)) return lambdaPath;

  if (ffmpegStatic && existsSync(ffmpegStatic)) {
    return ffmpegStatic;
  }

  const cwd = process.cwd();
  const staticCandidates = [
    path.join(cwd, "node_modules", "ffmpeg-static", "ffmpeg"),
    path.join(cwd, "node_modules", "ffmpeg-static", "ffmpeg.exe"),
    path.join(cwd, "..", "node_modules", "ffmpeg-static", "ffmpeg"),
    path.join(cwd, "..", "node_modules", "ffmpeg-static", "ffmpeg.exe"),
    path.join(cwd, ".next", "server", "node_modules", "ffmpeg-static", "ffmpeg"),
    path.join(cwd, ".next", "server", "node_modules", "ffmpeg-static", "ffmpeg.exe"),
    "/var/task/node_modules/ffmpeg-static/ffmpeg",
    "/var/task/node_modules/ffmpeg-static/ffmpeg.exe",
    "/var/task/nts-gate-lp/node_modules/ffmpeg-static/ffmpeg",
    "/var/task/nts-gate-lp/node_modules/ffmpeg-static/ffmpeg.exe",
  ];
  try {
    const pkgPath = requireFromHere.resolve("ffmpeg-static/package.json");
    const pkgDir = path.dirname(pkgPath);
    staticCandidates.unshift(path.join(pkgDir, "ffmpeg"), path.join(pkgDir, "ffmpeg.exe"));
  } catch {
    // package may be bundled without package.json in some serverless traces
  }
  for (const candidate of staticCandidates) {
    if (existsSync(candidate)) return candidate;
  }

  return undefined; // システムPATHに委ねる
}

/**
 * concat demuxer 用の設定ファイルを生成する。
 * 各スライドを duration_sec 秒ループさせる。
 */
async function writeConcatFile(
  slides: SlideTimingInput[],
  concatFilePath: string
): Promise<void> {
  const lines: string[] = ["ffconcat version 1.0"];
  for (const slide of slides) {
    // Windows パスの \ を / に統一（FFmpeg は / を期待する）
    const posixPath = slide.pngPath.replace(/\\/g, "/");
    lines.push(`file '${posixPath}'`);
    lines.push(`duration ${slide.durationSec}`);
  }
  // FFmpegのconcatは最後のファイルを1回余分に出力するので末尾に同じファイルを追加
  const last = slides[slides.length - 1];
  if (last) {
    lines.push(`file '${last.pngPath.replace(/\\/g, "/")}'`);
  }
  await fs.writeFile(concatFilePath, lines.join("\n"), "utf-8");
}

/**
 * スライドPNGリスト＋MP3音声 → MP4 を生成する。
 * @param slides      スライド情報（パス＋表示秒数）
 * @param audioPath   MP3ファイルのローカルパス
 * @param outputDir   出力先ディレクトリ
 * @param outputName  出力ファイル名（デフォルト: output.mp4）
 */
export async function composeVideo(
  slides: SlideTimingInput[],
  audioPath: string,
  outputDir: string,
  outputName = "output.mp4"
): Promise<ComposeVideoResult> {
  const ffmpegPath = resolveFfmpegPath();
  if (ffmpegPath) {
    ffmpeg.setFfmpegPath(ffmpegPath);
  }

  await fs.mkdir(outputDir, { recursive: true });

  const concatFilePath = path.join(outputDir, "concat.txt");
  await writeConcatFile(slides, concatFilePath);

  const outputPath = path.join(outputDir, outputName);
  const totalDuration = slides.reduce((sum, s) => sum + s.durationSec, 0);

  console.log(LOG_PREFIX, `composing ${slides.length} slides, audio: ${audioPath}, output: ${outputPath}`);

  await new Promise<void>((resolve, reject) => {
    ffmpeg()
      // ① 画像入力: concat demuxer
      .input(concatFilePath)
      .inputOptions(["-f concat", "-safe 0"])
      // ② 音声入力: MP3
      .input(audioPath)
      .outputOptions([
        "-c:v libx264",
        "-preset fast",
        "-crf 23",
        "-c:a aac",
        "-b:a 128k",
        "-pix_fmt yuv420p",
        // 音声の長さに合わせて映像を終了（音声が動画より短い場合は映像で終了）
        "-shortest",
        "-movflags +faststart",    // ストリーミング最適化
        "-vf scale=1280:720:flags=lanczos,format=yuv420p",
      ])
      .output(outputPath)
      .on("start", (cmd) => console.log(LOG_PREFIX, "ffmpeg cmd:", cmd))
      .on("progress", (p) =>
        console.log(LOG_PREFIX, `progress: ${JSON.stringify(p)}`)
      )
      .on("end", () => {
        console.log(LOG_PREFIX, "ffmpeg done:", outputPath);
        resolve();
      })
      .on("error", (err) => {
        console.error(LOG_PREFIX, "ffmpeg error:", err.message);
        reject(err);
      })
      .run();
  });

  return { outputPath, durationSec: totalDuration };
}

function toFfmpegConcatPath(filePath: string): string {
  return filePath.replace(/\\/g, "/").replace(/'/g, "'\\''");
}

function escapeFilterPath(filePath: string): string {
  return filePath.replace(/\\/g, "/").replace(/:/g, "\\:").replace(/'/g, "\\'");
}

async function runFfmpegSegment(
  label: string,
  build: (cmd: ffmpeg.FfmpegCommand) => ffmpeg.FfmpegCommand,
): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    build(ffmpeg())
      .on("start", (cmd) => console.log(LOG_PREFIX, `${label} cmd:`, cmd))
      .on("end", () => {
        console.log(LOG_PREFIX, `${label} done`);
        resolve();
      })
      .on("error", (err) => {
        console.error(LOG_PREFIX, `${label} error:`, err.message);
        reject(err);
      })
      .run();
  });
}

async function writeSegmentsConcatFile(segmentPaths: string[], concatFilePath: string): Promise<void> {
  const lines = ["ffconcat version 1.0", ...segmentPaths.map((segment) => `file '${toFfmpegConcatPath(segment)}'`)];
  await fs.writeFile(concatFilePath, lines.join("\n"), "utf-8");
}

const VIDEO_W = 1280;
const VIDEO_H = 720;

function wrapNewsText(text: string, maxChars: number): string[] {
  const lines: string[] = [];
  let current = "";
  for (const ch of text) {
    current += ch;
    if (current.length >= maxChars || /[。！？、]/.test(ch)) {
      lines.push(current);
      current = "";
    }
  }
  if (current) lines.push(current);
  return lines.filter(Boolean);
}

type NewsTextLayer = {
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color?: string;
  weight?: "normal" | "bold";
  maxChars?: number;
};

async function renderSvgPng(svg: string, outputPath: string): Promise<string> {
  await sharp(Buffer.from(svg)).png({ compressionLevel: 6 }).toFile(outputPath);
  return outputPath;
}

function newsBackgroundSvg(index: number): string {
  const hue = index % 2 === 0 ? "#0f1a35" : "#17264a";
  const accent = index % 3 === 0 ? "#d97706" : "#2563eb";
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${VIDEO_W}" height="${VIDEO_H}" viewBox="0 0 ${VIDEO_W} ${VIDEO_H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${hue}"/>
      <stop offset="100%" stop-color="#081226"/>
    </linearGradient>
    <radialGradient id="glow" cx="72%" cy="18%" r="70%">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${VIDEO_W}" height="${VIDEO_H}" fill="url(#bg)"/>
  <rect width="${VIDEO_W}" height="${VIDEO_H}" fill="url(#glow)"/>
  <g opacity="0.10" stroke="#ffffff" stroke-width="1">
    ${Array.from({ length: 18 }, (_, i) => `<line x1="${i * 90 - 220}" y1="0" x2="${i * 90 + 180}" y2="${VIDEO_H}"/>`).join("")}
    ${Array.from({ length: 9 }, (_, i) => `<line x1="0" y1="${i * 90}" x2="${VIDEO_W}" y2="${i * 90 - 160}"/>`).join("")}
  </g>
  <circle cx="1040" cy="120" r="260" fill="#ffffff" opacity="0.04"/>
  <circle cx="1140" cy="80" r="150" fill="${accent}" opacity="0.10"/>
  <rect x="0" y="596" width="${VIDEO_W}" height="124" fill="#020817" opacity="0.38"/>
</svg>`;
}

function newsOverlaySvg(opts: {
  title: string;
  heading: string;
  highlight?: string;
  lines: string[];
  index: number;
  isTitle?: boolean;
}): string {
  if (opts.isTitle) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${VIDEO_W}" height="${VIDEO_H}" viewBox="0 0 ${VIDEO_W} ${VIDEO_H}">
  <rect x="64" y="56" width="248" height="48" rx="24" fill="#d97706"/>
  <rect x="64" y="160" width="900" height="326" rx="28" fill="#020817" opacity="0.70"/>
  <rect x="64" y="160" width="8" height="326" rx="4" fill="#d97706"/>
  <rect x="64" y="610" width="1152" height="46" rx="23" fill="#0f172a" opacity="0.82"/>
</svg>`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${VIDEO_W}" height="${VIDEO_H}" viewBox="0 0 ${VIDEO_W} ${VIDEO_H}">
  <rect x="54" y="42" width="178" height="42" rx="21" fill="#d97706"/>
  <rect x="54" y="116" width="720" height="408" rx="26" fill="#020817" opacity="0.70"/>
  <rect x="54" y="116" width="8" height="408" rx="4" fill="#d97706"/>
  <rect x="94" y="214" width="310" height="60" rx="30" fill="#d97706" opacity="0.95"/>
  <rect x="852" y="118" width="318" height="112" rx="24" fill="#ffffff" opacity="0.10"/>
  <rect x="64" y="610" width="1152" height="46" rx="23" fill="#0f172a" opacity="0.82"/>
</svg>`;
}

function drawTextEscape(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/:/g, "\\:")
    .replace(/'/g, "\\'")
    .replace(/,/g, "\\,")
    .replace(/\[/g, "\\[")
    .replace(/\]/g, "\\]")
    .replace(/\r?\n/g, " ");
}

function drawTextFilter(layer: NewsTextLayer, fontPath: string | null): string {
  const fontArg = fontPath ? `fontfile='${escapeFilterPath(fontPath)}':` : "";
  const border = layer.fontSize >= 40 ? 3 : 2;
  const fontColor = (layer.color ?? "white").replace(/^#/, "0x");
  return [
    `drawtext=${fontArg}text='${drawTextEscape(layer.text)}'`,
    `x=${layer.x}`,
    `y=${layer.y}`,
    `fontsize=${layer.fontSize}`,
    `fontcolor=${fontColor}`,
    `borderw=${border}`,
    "bordercolor=black@0.34",
  ].join(":");
}

function newsTextLayers(opts: {
  title: string;
  heading: string;
  highlight?: string;
  lines: string[];
  index: number;
  isTitle?: boolean;
}): NewsTextLayer[] {
  const addWrapped = (layers: NewsTextLayer[], layer: NewsTextLayer, lineHeight: number) => {
    const lines = layer.maxChars ? wrapNewsText(layer.text, layer.maxChars) : [layer.text];
    lines.slice(0, 2).forEach((text, i) => {
      layers.push({ ...layer, text, y: layer.y + i * lineHeight });
    });
  };

  if (opts.isTitle) {
    const layers: NewsTextLayer[] = [
      { text: "補助金解説 NEWS", x: 91, y: 69, fontSize: 21, weight: "bold" },
      { text: "今日の補助金ポイント", x: 104, y: 218, fontSize: 34, color: "#fbbf24", weight: "bold" },
      { text: "対象・金額・申請前の注意点を短時間で解説します", x: 104, y: 402, fontSize: 30, color: "#cbd5e1" },
      { text: "NTS 日本提携支援 / 補助金活用の戦略設計と伴走支援", x: 92, y: 620, fontSize: 23, weight: "bold" },
    ];
    addWrapped(layers, { text: opts.title, x: 104, y: 292, fontSize: 40, weight: "bold", maxChars: 21 }, 50);
    return layers;
  }

  const layers: NewsTextLayer[] = [
    { text: `POINT ${String(opts.index).padStart(2, "0")}`, x: 88, y: 56, fontSize: 20, weight: "bold" },
    { text: "補助金解説ニュース", x: 256, y: 49, fontSize: 24, color: "#e2e8f0", weight: "bold" },
    { text: opts.highlight ?? "重要ポイント", x: 128, y: 231, fontSize: 31, weight: "bold", maxChars: 10 },
    { text: "CHECK", x: 882, y: 142, fontSize: 22, color: "#fbbf24", weight: "bold" },
    { text: "詳細は公募要領で確認", x: 882, y: 178, fontSize: 25, weight: "bold" },
    { text: "NTS 日本提携支援 / 補助金活用の無料相談受付中", x: 92, y: 620, fontSize: 23, weight: "bold" },
  ];
  addWrapped(layers, { text: opts.heading, x: 94, y: 142, fontSize: 36, weight: "bold", maxChars: 18 }, 43);
  const displayLines = opts.lines.flatMap((line) => wrapNewsText(line, 20)).slice(0, 5);
  displayLines.forEach((line, i) => {
    layers.push({ text: line, x: 96, y: 280 + i * 48, fontSize: 30, weight: "bold", maxChars: 22 });
  });
  return layers;
}

async function createNewsSegment(input: {
  clip?: StockClip;
  backgroundPath: string;
  overlayPath: string;
  textLayers: NewsTextLayer[];
  durationSec: number;
  outputPath: string;
}): Promise<void> {
  const duration = Math.max(1, input.durationSec);
  const isStock = !!input.clip;
  const fontPath = resolveVideoFontPath();
  const bgFilter = isStock
    ? "scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,eq=brightness=-0.18:saturation=1.12[bg]"
    : "scale=1280:720:flags=lanczos,format=rgba[bg]";
  const textFilters = input.textLayers.map((layer) => drawTextFilter(layer, fontPath)).join(",");
  const filter = `[0:v]${bgFilter};[1:v]format=rgba[card];[bg][card]overlay=0:0:format=auto${textFilters ? `,${textFilters}` : ""},format=yuv420p`;

  await runFfmpegSegment(isStock ? "news stock segment" : "news motion segment", (cmd) => {
    const base = cmd.input(isStock && input.clip ? input.clip.filePath : input.backgroundPath);
    base.inputOptions(isStock ? ["-stream_loop -1", `-t ${duration}`] : ["-loop 1", `-t ${duration}`]);
    return base
      .input(input.overlayPath)
      .outputOptions([
        "-an",
        "-filter_complex",
        filter,
        "-c:v libx264",
        "-preset veryfast",
        "-crf 23",
        "-pix_fmt yuv420p",
        "-r 30",
        "-t",
        String(duration),
      ])
      .output(input.outputPath);
  });
}

export async function composeEnhancedVideo(input: ComposeEnhancedVideoInput): Promise<ComposeVideoResult> {
  const ffmpegPath = resolveFfmpegPath();
  if (ffmpegPath) {
    ffmpeg.setFfmpegPath(ffmpegPath);
  }

  const outputName = input.outputName ?? "output.mp4";
  await fs.mkdir(input.outputDir, { recursive: true });
  const segmentDir = path.join(input.outputDir, "segments");
  await fs.mkdir(segmentDir, { recursive: true });

  const clipsBySection = new Map(input.stockClips.map((clip) => [clip.sectionIndex, clip]));
  const segmentPaths: string[] = [];
  let segmentIndex = 0;
  const fontPath = resolveVideoFontPath();
  console.log(
    LOG_PREFIX,
    `enhanced news compose sections=${input.sections.length} stockClips=${input.stockClips.length} font=${fontPath ?? "missing"}`,
  );

  const titleDuration = input.slides[0]?.durationSec ?? 4;
  const titleBg = await renderSvgPng(newsBackgroundSvg(0), path.join(segmentDir, "title-bg.png"));
  const titleOverlay = await renderSvgPng(
    newsOverlaySvg({
      title: input.title ?? "補助金解説動画",
      heading: "補助金解説動画",
      lines: [],
      index: 0,
      isTitle: true,
    }),
    path.join(segmentDir, "title-overlay.png"),
  );
  const titleSegment = path.join(segmentDir, `segment-${String(segmentIndex++).padStart(3, "0")}-title.mp4`);
  await createNewsSegment({
    backgroundPath: titleBg,
    overlayPath: titleOverlay,
    textLayers: newsTextLayers({
      title: input.title ?? "補助金解説動画",
      heading: "補助金解説動画",
      lines: [],
      index: 0,
      isTitle: true,
    }),
    durationSec: titleDuration,
    outputPath: titleSegment,
  });
  segmentPaths.push(titleSegment);

  for (let i = 0; i < input.sections.length; i++) {
    const section = input.sections[i];
    const duration = Math.max(4, section.duration_sec ?? input.slides[i + 1]?.durationSec ?? 12);
    const clip = clipsBySection.get(i);
    const bgPath = await renderSvgPng(newsBackgroundSvg(i + 1), path.join(segmentDir, `bg-${String(i).padStart(2, "0")}.png`));
    const overlayPath = await renderSvgPng(
      newsOverlaySvg({
        title: input.title ?? "補助金解説動画",
        heading: section.heading,
        highlight: section.highlight,
        lines: section.slide_lines ?? [section.text],
        index: i + 1,
      }),
      path.join(segmentDir, `overlay-${String(i).padStart(2, "0")}.png`),
    );
    const segmentPath = path.join(segmentDir, `segment-${String(segmentIndex++).padStart(3, "0")}-news.mp4`);
    await createNewsSegment({
      clip,
      backgroundPath: bgPath,
      overlayPath,
      textLayers: newsTextLayers({
        title: input.title ?? "補助金解説動画",
        heading: section.heading,
        highlight: section.highlight,
        lines: section.slide_lines ?? [section.text],
        index: i + 1,
      }),
      durationSec: duration,
      outputPath: segmentPath,
    });
    segmentPaths.push(segmentPath);
  }

  const concatFilePath = path.join(input.outputDir, "enhanced-concat.txt");
  await writeSegmentsConcatFile(segmentPaths, concatFilePath);

  const outputPath = path.join(input.outputDir, outputName);
  const totalDuration = titleDuration + input.sections.reduce((sum, s) => sum + Math.max(4, s.duration_sec ?? 12), 0);
  // Section-level captions are burned into each segment with drawtext and fontfile.
  // This avoids serverless fontconfig differences in the ASS subtitles filter.
  const vf = "format=yuv420p";

  await new Promise<void>((resolve, reject) => {
    ffmpeg()
      .input(concatFilePath)
      .inputOptions(["-f concat", "-safe 0"])
      .input(input.audioPath)
      .outputOptions([
        "-c:v libx264",
        "-preset fast",
        "-crf 23",
        "-c:a aac",
        "-b:a 128k",
        "-pix_fmt yuv420p",
        "-shortest",
        "-movflags +faststart",
        "-vf",
        vf,
      ])
      .output(outputPath)
      .on("start", (cmd) => console.log(LOG_PREFIX, "enhanced ffmpeg cmd:", cmd))
      .on("progress", (p) => console.log(LOG_PREFIX, `enhanced progress: ${JSON.stringify(p)}`))
      .on("end", () => {
        console.log(LOG_PREFIX, "enhanced ffmpeg done:", outputPath);
        resolve();
      })
      .on("error", (err) => {
        console.error(LOG_PREFIX, "enhanced ffmpeg error:", err.message);
        reject(err);
      })
      .run();
  });

  return { outputPath, durationSec: totalDuration };
}

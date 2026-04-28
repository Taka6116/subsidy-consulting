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
import { Resvg } from "@resvg/resvg-js";
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
  thumbnailPath?: string;
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
const RESVG_FONT_FAMILY = "Noto Sans CJK JP";

function escapeSvgText(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

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

async function renderSvgPng(svg: string, outputPath: string): Promise<string> {
  const fontPath = resolveVideoFontPath();
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: VIDEO_W },
    font: {
      fontFiles: fontPath ? [fontPath] : [],
      loadSystemFonts: false,
      defaultFontFamily: RESVG_FONT_FAMILY,
    },
  });
  await fs.writeFile(outputPath, resvg.render().asPng());
  return outputPath;
}

async function compositePng(basePath: string, overlayPath: string, outputPath: string): Promise<string> {
  await sharp(basePath)
    .composite([{ input: overlayPath, left: 0, top: 0 }])
    .png({ compressionLevel: 6 })
    .toFile(outputPath);
  return outputPath;
}

function newsBackgroundSvg(index: number): string {
  const accent = index % 3 === 0 ? "#5b7cfa" : index % 3 === 1 ? "#22a7d8" : "#6c8ff5";
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${VIDEO_W}" height="${VIDEO_H}" viewBox="0 0 ${VIDEO_W} ${VIDEO_H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#eef6ff"/>
      <stop offset="52%" stop-color="#f8fbff"/>
      <stop offset="100%" stop-color="#dfeaff"/>
    </linearGradient>
    <radialGradient id="glow" cx="78%" cy="14%" r="72%">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.30"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${VIDEO_W}" height="${VIDEO_H}" fill="url(#bg)"/>
  <rect width="${VIDEO_W}" height="${VIDEO_H}" fill="url(#glow)"/>
  <g opacity="0.30" stroke="#bdd2f6" stroke-width="1">
    ${Array.from({ length: 14 }, (_, i) => `<line x1="${i * 120 - 180}" y1="0" x2="${i * 120 + 160}" y2="${VIDEO_H}"/>`).join("")}
  </g>
  <circle cx="1080" cy="118" r="210" fill="#ffffff" opacity="0.72"/>
  <circle cx="1140" cy="86" r="122" fill="${accent}" opacity="0.13"/>
  <rect x="0" y="612" width="${VIDEO_W}" height="108" fill="#6c8ff5" opacity="0.10"/>
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
  const font = RESVG_FONT_FAMILY;
  const titleLines = wrapNewsText(opts.title, 18).slice(0, 2);
  const titleHtml = titleLines
    .map((line, i) => `<text x="82" y="${240 + i * 56}" font-size="46" font-weight="800" fill="#16233d" font-family="${font}">${escapeSvgText(line)}</text>`)
    .join("\n");
  const headingHtml = wrapNewsText(opts.heading, 16)
    .slice(0, 2)
    .map((line, i) => `<text x="74" y="${142 + i * 42}" font-size="34" font-weight="800" fill="#16233d" font-family="${font}">${escapeSvgText(line)}</text>`)
    .join("\n");
  const displayLines = opts.lines
    .flatMap((line) => wrapNewsText(line, 20))
    .map((line) => line.replace(/^・/, "").trim())
    .filter(Boolean)
    .slice(0, 4);
  const bulletHtml = displayLines
    .map((line, i) => {
      const x = i % 2 === 0 ? 72 : 675;
      const y = i < 2 ? 350 : 492;
      return `
  <rect x="${x}" y="${y - 60}" width="532" height="112" rx="28" fill="#ffffff" filter="url(#shadow)"/>
  <circle cx="${x + 42}" cy="${y - 4}" r="21" fill="#e9f2ff"/>
  <text x="${x + 42}" y="${y + 4}" text-anchor="middle" font-size="17" font-weight="800" fill="#5b7cfa" font-family="${font}">${String(i + 1).padStart(2, "0")}</text>
  <text x="${x + 82}" y="${y + 4}" font-size="25" font-weight="800" fill="#16233d" font-family="${font}">${escapeSvgText(line)}</text>`;
    })
    .join("\n");
  const accent = opts.index % 3 === 0 ? "#5b7cfa" : opts.index % 3 === 1 ? "#22a7d8" : "#6c8ff5";
  const highlightText = escapeSvgText(opts.highlight ?? "重要ポイント");

  if (opts.isTitle) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${VIDEO_W}" height="${VIDEO_H}" viewBox="0 0 ${VIDEO_W} ${VIDEO_H}">
  <defs>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="#496184" flood-opacity="0.16"/>
    </filter>
    <linearGradient id="hero" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f8fbff"/>
      <stop offset="100%" stop-color="#dfeaff"/>
    </linearGradient>
  </defs>
  <rect width="${VIDEO_W}" height="${VIDEO_H}" fill="url(#hero)"/>
  <circle cx="1070" cy="95" r="250" fill="#6c8ff5" opacity="0.14"/>
  <circle cx="1020" cy="90" r="118" fill="#ffffff" opacity="0.72"/>
  <rect x="62" y="62" width="1110" height="554" rx="34" fill="#ffffff" filter="url(#shadow)"/>
  <rect x="62" y="62" width="1110" height="112" rx="34" fill="#eaf2ff"/>
  <text x="82" y="118" font-size="21" font-weight="800" fill="#5b7cfa" font-family="${font}">SUBSIDY GUIDE MOVIE</text>
  <text x="82" y="192" font-size="30" font-weight="800" fill="#22a7d8" font-family="${font}">今日の補助金ポイント</text>
  ${titleHtml}
  <rect x="82" y="392" width="300" height="84" rx="24" fill="#5b7cfa"/>
  <text x="116" y="444" font-size="28" font-weight="800" fill="#ffffff" font-family="${font}">数字を大きく整理</text>
  <rect x="410" y="392" width="300" height="84" rx="24" fill="#eef6ff"/>
  <text x="444" y="444" font-size="28" font-weight="800" fill="#16233d" font-family="${font}">対象を短く確認</text>
  <rect x="738" y="392" width="300" height="84" rx="24" fill="#fff4df"/>
  <text x="772" y="444" font-size="28" font-weight="800" fill="#9a5a00" font-family="${font}">申請前に判断</text>
  <text x="82" y="562" font-size="23" font-weight="700" fill="#56677f" font-family="${font}">対象・金額・期限・活用例を、1分でわかりやすく解説します</text>
  <text x="1162" y="662" text-anchor="end" font-size="19" font-weight="800" fill="#7890b2" font-family="${font}">NTS 日本提携支援</text>
</svg>`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${VIDEO_W}" height="${VIDEO_H}" viewBox="0 0 ${VIDEO_W} ${VIDEO_H}">
  <defs>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="16" stdDeviation="16" flood-color="#496184" flood-opacity="0.14"/>
    </filter>
    <linearGradient id="page" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f8fbff"/>
      <stop offset="58%" stop-color="#eef6ff"/>
      <stop offset="100%" stop-color="#dde9ff"/>
    </linearGradient>
  </defs>
  <rect width="${VIDEO_W}" height="${VIDEO_H}" fill="url(#page)"/>
  <circle cx="1118" cy="110" r="230" fill="${accent}" opacity="0.12"/>
  <rect x="46" y="44" width="1188" height="604" rx="34" fill="#ffffff" filter="url(#shadow)"/>
  <rect x="46" y="44" width="1188" height="108" rx="34" fill="#edf5ff"/>
  <rect x="46" y="126" width="1188" height="26" fill="#edf5ff"/>
  <rect x="74" y="74" width="154" height="44" rx="22" fill="${accent}"/>
  <text x="151" y="103" text-anchor="middle" font-size="19" font-weight="800" fill="#ffffff" font-family="${font}">SLIDE ${String(opts.index).padStart(2, "0")}</text>
  ${headingHtml}
  <rect x="72" y="188" width="532" height="82" rx="28" fill="${accent}"/>
  <text x="106" y="241" font-size="40" font-weight="900" fill="#ffffff" font-family="${font}">${highlightText}</text>
  <rect x="676" y="188" width="532" height="82" rx="28" fill="#f5f8ff"/>
  <text x="710" y="241" font-size="28" font-weight="800" fill="#56677f" font-family="${font}">詳細は公募要領で最終確認</text>
  ${bulletHtml}
  <rect x="74" y="612" width="400" height="4" rx="2" fill="${accent}"/>
  <text x="74" y="665" font-size="20" font-weight="800" fill="#7890b2" font-family="${font}">NTS 日本提携支援 / 補助金活用ガイド</text>
  <text x="1206" y="665" text-anchor="end" font-size="20" font-weight="800" fill="#7890b2" font-family="${font}">無料相談受付中</text>
</svg>`;
}


async function createNewsSegment(input: {
  clip?: StockClip;
  backgroundPath: string;
  overlayPath: string;
  durationSec: number;
  outputPath: string;
}): Promise<void> {
  const duration = Math.max(1, input.durationSec);
  const isStock = !!input.clip;
  const bgFilter = isStock
    ? `scale=1400:788:force_original_aspect_ratio=increase,crop=1280:720:x='60+40*sin(t*0.32)':y='34+26*cos(t*0.24)',eq=brightness=-0.18:saturation=1.12[bg]`
    : `scale=1360:765:flags=lanczos,crop=1280:720:x='40+40*sin(t*0.32)':y='22+22*cos(t*0.24)',format=rgba[bg]`;
  const filter = `[0:v]${bgFilter};[1:v]format=rgba[card];[bg][card]overlay=0:0:format=auto,format=yuv420p`;

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
  const thumbnailPath = await compositePng(
    titleBg,
    titleOverlay,
    path.join(input.outputDir, "thumbnail.png"),
  );
  const titleSegment = path.join(segmentDir, `segment-${String(segmentIndex++).padStart(3, "0")}-title.mp4`);
  await createNewsSegment({
    backgroundPath: titleBg,
    overlayPath: titleOverlay,
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
      durationSec: duration,
      outputPath: segmentPath,
    });
    segmentPaths.push(segmentPath);
  }

  const concatFilePath = path.join(input.outputDir, "enhanced-concat.txt");
  await writeSegmentsConcatFile(segmentPaths, concatFilePath);

  const outputPath = path.join(input.outputDir, outputName);
  const totalDuration =
    titleDuration +
    input.sections.reduce((sum, s) => sum + Math.max(4, s.duration_sec ?? 12), 0);
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

  return { outputPath, durationSec: totalDuration, thumbnailPath };
}

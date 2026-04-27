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
import type { VideoScriptSection } from "@/lib/ai/bedrockVideoScriptGenerate";
import type { StockClip } from "@/lib/video/stockFootage";

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

function escapeSubtitleFilterPath(filePath: string): string {
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

async function createSlideSegment(
  slide: SlideTimingInput,
  durationSec: number,
  outputPath: string,
): Promise<void> {
  const duration = Math.max(1, durationSec);
  await runFfmpegSegment("slide segment", (cmd) =>
    cmd
      .input(slide.pngPath)
      .inputOptions(["-loop 1", `-t ${duration}`])
      .outputOptions([
        "-an",
        "-c:v libx264",
        "-preset veryfast",
        "-crf 24",
        "-pix_fmt yuv420p",
        "-r 30",
        "-vf",
        "scale=1280:720:flags=lanczos,zoompan=z='min(zoom+0.0012,1.06)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1280x720:fps=30,format=yuv420p",
      ])
      .output(outputPath),
  );
}

async function createStockSegment(
  clip: StockClip,
  durationSec: number,
  outputPath: string,
): Promise<void> {
  const duration = Math.max(1, durationSec);
  await runFfmpegSegment("stock segment", (cmd) =>
    cmd
      .input(clip.filePath)
      .inputOptions(["-stream_loop -1", `-t ${duration}`])
      .outputOptions([
        "-an",
        "-c:v libx264",
        "-preset veryfast",
        "-crf 24",
        "-pix_fmt yuv420p",
        "-r 30",
        "-vf",
        "scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,format=yuv420p",
      ])
      .output(outputPath),
  );
}

async function writeSegmentsConcatFile(segmentPaths: string[], concatFilePath: string): Promise<void> {
  const lines = ["ffconcat version 1.0", ...segmentPaths.map((segment) => `file '${toFfmpegConcatPath(segment)}'`)];
  await fs.writeFile(concatFilePath, lines.join("\n"), "utf-8");
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

  for (let i = 0; i < input.slides.length; i++) {
    const slide = input.slides[i];
    const sectionIndex = i - 1;
    const clip = sectionIndex >= 0 ? clipsBySection.get(sectionIndex) : undefined;
    const stockDuration = clip && slide.durationSec >= 12 ? Math.min(5, Math.max(3, Math.floor(slide.durationSec * 0.25))) : 0;
    const slideDuration = Math.max(2, slide.durationSec - stockDuration);

    const slideSegment = path.join(segmentDir, `segment-${String(segmentIndex++).padStart(3, "0")}-slide.mp4`);
    await createSlideSegment(slide, slideDuration, slideSegment);
    segmentPaths.push(slideSegment);

    if (clip && stockDuration > 0) {
      const stockSegment = path.join(segmentDir, `segment-${String(segmentIndex++).padStart(3, "0")}-stock.mp4`);
      await createStockSegment(clip, stockDuration, stockSegment);
      segmentPaths.push(stockSegment);
    }
  }

  const concatFilePath = path.join(input.outputDir, "enhanced-concat.txt");
  await writeSegmentsConcatFile(segmentPaths, concatFilePath);

  const outputPath = path.join(input.outputDir, outputName);
  const totalDuration = input.slides.reduce((sum, s) => sum + s.durationSec, 0);
  const vf = input.subtitlePath
    ? `subtitles='${escapeSubtitleFilterPath(input.subtitlePath)}',format=yuv420p`
    : "format=yuv420p";

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

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";
import type { HyperframesVideoData } from "@/lib/video-hyperframes/buildVideoData";

const execFileAsync = promisify(execFile);
const LOG_PREFIX = "[renderHyperframesVideo]";
const requireFromHere = createRequire(import.meta.url);

export type HyperframesRenderResult = {
  silentVideoPath: string;
  finalVideoPath?: string;
  thumbnailPath?: string;
  durationSec: number;
};

type ComposeInput = {
  silentVideoPath: string;
  audioPath: string;
  outputDir: string;
  outputName?: string;
  durationSec: number;
};

function moduleDir(): string {
  return path.dirname(fileURLToPath(import.meta.url));
}

function templateDir(): string {
  return path.join(moduleDir(), "templates", "subsidy-lp-video");
}

function resolveFfmpegPath(): string | undefined {
  const envPath = process.env.FFMPEG_PATH;
  if (envPath && existsSync(envPath)) return envPath;
  const lambdaPath = "/opt/bin/ffmpeg";
  if (existsSync(lambdaPath)) return lambdaPath;
  if (ffmpegStatic && existsSync(ffmpegStatic)) return ffmpegStatic;
  return undefined;
}

async function copyUseCaseAssets(projectDir: string): Promise<void> {
  const assetsDir = path.join(projectDir, "assets");
  await fs.mkdir(assetsDir, { recursive: true });
  const publicIconDir = path.join(process.cwd(), "public", "icon-assets");
  const names = ["isometric_10.webp", "isometric_20.webp", "isometric_15.webp"];
  await Promise.all(
    names.map((name) =>
      fs.copyFile(path.join(publicIconDir, name), path.join(assetsDir, name)),
    ),
  );
}

async function prepareProject(data: HyperframesVideoData, projectDir: string): Promise<void> {
  await fs.rm(projectDir, { recursive: true, force: true });
  await fs.mkdir(projectDir, { recursive: true });
  await fs.cp(templateDir(), projectDir, { recursive: true });
  await copyUseCaseAssets(projectDir);
  await fs.writeFile(
    path.join(projectDir, "video-data.js"),
    `window.__HYPERFRAMES_VIDEO_DATA__ = ${JSON.stringify(data)};\n`,
    "utf-8",
  );
}

export async function renderHyperframesVideo(
  data: HyperframesVideoData,
  outputDir: string,
): Promise<HyperframesRenderResult> {
  await fs.mkdir(outputDir, { recursive: true });
  const projectDir = path.join(outputDir, "hyperframes-project");
  const silentVideoPath = path.join(outputDir, "hyperframes-silent.mp4");
  await prepareProject(data, projectDir);

  const hyperframesCli = path.join(
    path.dirname(requireFromHere.resolve("hyperframes/package.json")),
    "dist",
    "cli.js",
  );
  const args = [
    hyperframesCli,
    "render",
    "--output",
    silentVideoPath,
    "--fps",
    String(data.fps),
    "--quality",
    "standard",
    "--quiet",
  ];

  console.log(`${LOG_PREFIX} render start output=${silentVideoPath}`);
  const result = await execFileAsync(process.execPath, args, {
    cwd: projectDir,
    maxBuffer: 1024 * 1024 * 8,
    env: process.env,
  });
  if (result.stdout) console.log(`${LOG_PREFIX} stdout:`, result.stdout);
  if (result.stderr) console.log(`${LOG_PREFIX} stderr:`, result.stderr);

  if (!existsSync(silentVideoPath)) {
    throw new Error(`HyperFrames did not create output: ${silentVideoPath}`);
  }

  return {
    silentVideoPath,
    durationSec: data.totalDurationSec,
  };
}

export async function composeHyperframesVideoWithAudio(
  input: ComposeInput,
): Promise<HyperframesRenderResult> {
  const ffmpegPath = resolveFfmpegPath();
  if (ffmpegPath) ffmpeg.setFfmpegPath(ffmpegPath);

  await fs.mkdir(input.outputDir, { recursive: true });
  const outputPath = path.join(input.outputDir, input.outputName ?? "output.mp4");
  const thumbnailPath = path.join(input.outputDir, "thumbnail.png");

  await new Promise<void>((resolve, reject) => {
    ffmpeg()
      .input(input.silentVideoPath)
      .input(input.audioPath)
      .outputOptions([
        "-map 0:v:0",
        "-map 1:a:0",
        "-c:v libx264",
        "-preset fast",
        "-crf 22",
        "-c:a aac",
        "-b:a 128k",
        "-pix_fmt yuv420p",
        "-shortest",
        "-movflags +faststart",
      ])
      .output(outputPath)
      .on("start", (cmd) => console.log(`${LOG_PREFIX} compose cmd:`, cmd))
      .on("progress", (progress) => console.log(`${LOG_PREFIX} compose progress: ${JSON.stringify(progress)}`))
      .on("end", () => resolve())
      .on("error", (err) => reject(err))
      .run();
  });

  await new Promise<void>((resolve, reject) => {
    ffmpeg(outputPath)
      .seekInput(1)
      .outputOptions(["-frames:v 1"])
      .output(thumbnailPath)
      .on("start", (cmd) => console.log(`${LOG_PREFIX} thumbnail cmd:`, cmd))
      .on("end", () => resolve())
      .on("error", (err) => reject(err))
      .run();
  });

  return {
    silentVideoPath: input.silentVideoPath,
    finalVideoPath: outputPath,
    thumbnailPath,
    durationSec: input.durationSec,
  };
}

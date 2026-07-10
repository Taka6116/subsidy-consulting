/**
 * 補助金 1 件 → 動画台本生成 → TTS 音声合成 → スライド生成 → FFmpeg MP4合成 → S3 保存 の Worker。
 * トリガー（CLI / API / Lambda）から共通で呼び出せるコア。
 *
 * 処理:
 *  1. SubsidyGrant + 関連記事を取得
 *  2. ContentJob(video) を running に upsert
 *  3. Bedrock で動画台本生成（slide_lines 付き）→ DB 保存 (contentType=video_script)
 *  4. ElevenLabs または AWS Polly で音声合成 → S3 に MP3 保存
 *  5. sharp + SVG でスライドPNGを生成（tmpdir）
 *  6. FFmpeg でスライド + 音声を MP4 に合成
 *  7. S3 に MP4 をアップロード → videoPath を設定
 *  8. GeneratedContent(contentType=video) を upsert して published に設定
 *  9. ContentJob を done に更新
 *  10. 例外時は ContentJob を failed に書き戻して throw
 */

import os from "node:os";
import path from "node:path";
import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import { randomUUID } from "node:crypto";

import { prisma } from "@/lib/db/prisma";
import {
  generateVideoScript,
  type SubsidyForVideoScript,
} from "@/lib/ai/bedrockVideoScriptGenerate";
import { checkVideoScriptQuality } from "@/lib/content/generatedContentGuard";
import { validateVideoData } from "@/lib/video/validateVideoData";
import { synthesizeAndUpload } from "@/lib/aws/pollyTts";
import { synthesizeElevenLabsAndUpload } from "@/lib/aws/elevenLabsTts";
import { renderSlidesToDir, type SlideInput } from "@/lib/video/generateSlides";
import { composeEnhancedVideo, composeVideo, type SlideTimingInput } from "@/lib/video/composeVideo";
import { downloadStockFootageForScript } from "@/lib/video/stockFootage";
import { writeAssSubtitles } from "@/lib/video/subtitles";
import { buildHyperframesVideoData } from "@/lib/video-hyperframes/buildVideoData";
import { validateHyperframesVideoData } from "@/lib/video-hyperframes/validateHyperframesVideoData";
import {
  composeHyperframesVideoWithAudio,
  composeSceneAudioTimeline,
  getAudioDuration,
  renderHyperframesVideo,
} from "@/lib/video-hyperframes/renderHyperframesVideo";
import {
  cleanSubsidyName,
  cleanSubsidyDescription,
} from "@/lib/subsidyCheckResultHelpers";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";

const LOG_PREFIX = "[runVideoJob]";
type TtsProvider = "elevenlabs" | "polly";
type VideoProvider = "enhanced" | "slides" | "hyperframes";

export type RunVideoJobResult = {
  contentId: string;
  slug: string;
  title: string;
  subsidyId: string;
  status: "published" | "audio_only" | "script_only";
  audioPath: string | null;
  videoPath: string | null;
};

export type RunVideoJobParams = {
  subsidyId: string;
  force?: boolean;
  videoProvider?: VideoProvider;
};

function resolveVideoProvider(requested: VideoProvider | undefined): VideoProvider {
  if (requested) return requested;
  const env = process.env.VIDEO_RENDERER?.trim().toLowerCase();
  if (env === "hyperframes") return "hyperframes";
  if (env === "slides") return "slides";
  return "enhanced";
}

async function synthesizeNarration(text: string, subsidyId: string) {
  const requestedProvider = (process.env.VIDEO_TTS_PROVIDER?.trim().toLowerCase() ||
    "polly") as TtsProvider;

  if (requestedProvider === "elevenlabs") {
    const elevenLabsResult = await synthesizeElevenLabsAndUpload(text, subsidyId);
    if (elevenLabsResult) {
      console.log(`${LOG_PREFIX} TTS provider=elevenlabs`);
      return elevenLabsResult;
    }
    console.warn(`${LOG_PREFIX} ElevenLabs synthesis failed — falling back to Polly`);
  }

  const pollyResult = await synthesizeAndUpload(text, subsidyId);
  if (pollyResult) console.log(`${LOG_PREFIX} TTS provider=polly`);
  return pollyResult;
}

async function ensureUniqueSlug(
  baseSlug: string,
  currentContentId: string | null,
): Promise<string> {
  let candidate = baseSlug;
  for (let attempt = 0; attempt < 5; attempt++) {
    const existing = await prisma.generatedContent.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!existing || existing.id === currentContentId) {
      return candidate;
    }
    const suffix = randomUUID().slice(0, 6);
    candidate = `${baseSlug}-${suffix}`.slice(0, 60);
  }
  return `${baseSlug}-${randomUUID().slice(0, 8)}`.slice(0, 60);
}

/**
 * S3 から MP3 をダウンロードしてローカルの tmpPath に保存する。
 */
async function downloadS3ToFile(s3Key: string, localPath: string): Promise<void> {
  const bucket = process.env.VIDEO_S3_BUCKET!;
  const region = process.env.VIDEO_S3_REGION ?? process.env.AWS_REGION ?? "ap-northeast-1";
  const s3 = new S3Client({ region });

  const res = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: s3Key }));
  if (!res.Body) throw new Error(`S3 GetObject returned no body: ${s3Key}`);

  const chunks: Uint8Array[] = [];
  for await (const chunk of res.Body as AsyncIterable<Uint8Array>) {
    chunks.push(chunk);
  }
  await fs.writeFile(localPath, Buffer.concat(chunks));
}

/**
 * ローカルの MP4 ファイルを S3 にアップロードして公開 URL を返す。
 */
async function uploadMp4ToS3(localPath: string, s3Key: string): Promise<string> {
  const bucket = process.env.VIDEO_S3_BUCKET!;
  const region = process.env.VIDEO_S3_REGION ?? process.env.AWS_REGION ?? "ap-northeast-1";
  const baseUrl = process.env.VIDEO_S3_BASE_URL;
  const s3 = new S3Client({ region });

  const fileBuffer = await fs.readFile(localPath);
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: s3Key,
      Body: fileBuffer,
      ContentType: "video/mp4",
      CacheControl: "public, max-age=86400",
    })
  );

  return baseUrl
    ? `${baseUrl}/${s3Key}`
    : `https://${bucket}.s3.${region}.amazonaws.com/${s3Key}`;
}

/**
 * ローカルの MP3 ファイルを S3 にアップロードして公開 URL を返す。
 */
async function uploadMp3ToS3(localPath: string, s3Key: string): Promise<string> {
  const bucket = process.env.VIDEO_S3_BUCKET!;
  const region = process.env.VIDEO_S3_REGION ?? process.env.AWS_REGION ?? "ap-northeast-1";
  const baseUrl = process.env.VIDEO_S3_BASE_URL;
  const s3 = new S3Client({ region });

  const fileBuffer = await fs.readFile(localPath);
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: s3Key,
      Body: fileBuffer,
      ContentType: "audio/mpeg",
      CacheControl: "public, max-age=86400",
    })
  );

  return baseUrl
    ? `${baseUrl}/${s3Key}`
    : `https://${bucket}.s3.${region}.amazonaws.com/${s3Key}`;
}

/**
 * ローカルの PNG ファイルを S3 にアップロードして公開 URL を返す。
 */
async function uploadPngToS3(localPath: string, s3Key: string): Promise<string> {
  const bucket = process.env.VIDEO_S3_BUCKET!;
  const region = process.env.VIDEO_S3_REGION ?? process.env.AWS_REGION ?? "ap-northeast-1";
  const baseUrl = process.env.VIDEO_S3_BASE_URL;
  const s3 = new S3Client({ region });

  const fileBuffer = await fs.readFile(localPath);
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: s3Key,
      Body: fileBuffer,
      ContentType: "image/png",
      CacheControl: "public, max-age=604800",
    })
  );

  return baseUrl
    ? `${baseUrl}/${s3Key}`
    : `https://${bucket}.s3.${region}.amazonaws.com/${s3Key}`;
}

export async function runVideoJob(
  params: RunVideoJobParams,
): Promise<RunVideoJobResult> {
  const jobType = "video";
  const { subsidyId } = params;
  const requestedVideoProvider = resolveVideoProvider(params.videoProvider);

  console.log(`${LOG_PREFIX} start subsidyId=${subsidyId}`);

  const grant = await prisma.subsidyGrant.findUnique({ where: { id: subsidyId } });
  if (!grant) throw new Error(`SubsidyGrant not found: ${subsidyId}`);

  const relatedArticle = await prisma.generatedContent.findFirst({
    where: { subsidyId, contentType: "article", status: "published" },
    select: { excerpt: true },
  });

  await prisma.contentJob.upsert({
    where: { subsidyId_jobType: { subsidyId, jobType } },
    create: { subsidyId, jobType, status: "running" },
    update: { status: "running", completedAt: null, triggeredAt: new Date() },
  });

  // 作業用 tmpdir（処理後にクリーンアップ）
  const workDir = path.join(os.tmpdir(), `video-${subsidyId}-${Date.now()}`);

  try {
    const existingVideo = await prisma.generatedContent.findFirst({
      where: { subsidyId, contentType: "video" },
    });
    if (existingVideo && !params.force) {
      console.log(`${LOG_PREFIX} existing video found — skip`);
      await prisma.contentJob.update({
        where: { subsidyId_jobType: { subsidyId, jobType } },
        data: { status: "done", completedAt: new Date() },
      });
      return {
        contentId: existingVideo.id,
        slug: existingVideo.slug ?? `video-${existingVideo.id.slice(0, 8)}`,
        title: existingVideo.title ?? cleanSubsidyName(grant.name ?? ""),
        subsidyId,
        status: "published",
        audioPath: existingVideo.audioPath ?? null,
        videoPath: existingVideo.videoPath ?? null,
      };
    }

    if (requestedVideoProvider === "hyperframes") {
      if (!process.env.VIDEO_S3_BUCKET) {
        throw new Error("VIDEO_S3_BUCKET is required for HyperFrames video generation");
      }

      const lpContent = await prisma.generatedContent.findFirst({
        where: { subsidyId, contentType: "lp", status: "published" },
        orderBy: { createdAt: "desc" },
      });
      const videoData = await buildHyperframesVideoData(grant, lpContent);
      const hyperframesValidation = validateHyperframesVideoData(videoData);
      if (!hyperframesValidation.isValid) {
        throw new Error(`HyperFrames video data validation failed: ${hyperframesValidation.errors.join("; ")}`);
      }
      if (hyperframesValidation.warnings.length > 0) {
        console.warn(`${LOG_PREFIX} HyperFrames validation warnings:`, hyperframesValidation.warnings);
      }

      const scriptSlugBase = `video-${subsidyId.replace(/[^a-z0-9]/gi, "").slice(0, 10).toLowerCase() || "subsidy"}`;

      // ── 音声先生成パイプライン ─────────────────────────────────
      // 設計: 音声を先に生成 → 実際の音声長を計測 → duration を確定 → 映像生成
      // これにより音声と映像のズレを根本解決する

      await fs.mkdir(workDir, { recursive: true });
      const sceneAudioDir = path.join(workDir, "scene-audio");
      await fs.mkdir(sceneAudioDir, { recursive: true });

      // Step A: 各シーンのナレーションを個別に TTS 生成
      console.log(`${LOG_PREFIX} [音声先生成] シーン別TTS開始 scenes=${videoData.scenes.length}`);
      const sceneAudioFiles: Array<{ sceneId: string; localPath: string; s3Key: string; publicUrl: string }> = [];
      for (const sceneItem of videoData.scenes) {
        const audioResult = await synthesizeNarration(sceneItem.voiceover, subsidyId);
        if (!audioResult) throw new Error(`Scene TTS failed: ${sceneItem.id}`);
        const localPath = path.join(sceneAudioDir, `${sceneItem.id}.mp3`);
        await downloadS3ToFile(audioResult.s3Key, localPath);
        sceneAudioFiles.push({ sceneId: sceneItem.id, localPath, s3Key: audioResult.s3Key, publicUrl: audioResult.publicUrl });
        console.log(`${LOG_PREFIX} [音声先生成] scene=${sceneItem.id} chars=${sceneItem.voiceover.length}`);
      }

      // Step B: 各音声ファイルの実際の長さを ffprobe で計測
      console.log(`${LOG_PREFIX} [音声計測] ffprobe で各シーン音声長を計測`);
      let cursor = 0;
      const measuredScenes = await Promise.all(
        videoData.scenes.map(async (sceneItem, i) => {
          const audioFile = sceneAudioFiles[i];
          const measured = await getAudioDuration(audioFile.localPath);
          const actualDuration = measured ?? sceneItem.duration; // 計測失敗時は概算値を使用
          console.log(`${LOG_PREFIX} [音声計測] scene=${sceneItem.id} estimated=${sceneItem.duration.toFixed(1)}s actual=${actualDuration.toFixed(1)}s`);
          return { audioPath: audioFile.localPath, start: 0, duration: actualDuration }; // start は後で計算
        }),
      );

      // Step C: 計測した duration を元に start を再計算してシーンを更新
      const refinedScenes = videoData.scenes.map((sceneItem, i) => {
        const start = cursor;
        cursor += measuredScenes[i].duration;
        return { ...sceneItem, start, duration: measuredScenes[i].duration };
      });
      const totalMeasuredDuration = cursor;

      // videoData を計測済み duration で更新
      const refinedVideoData = {
        ...videoData,
        scenes: refinedScenes,
        totalDurationSec: Math.ceil(totalMeasuredDuration),
        narrationText: refinedScenes.map((s) => s.voiceover).join("\n"),
      };

      console.log(`${LOG_PREFIX} [duration確定] totalDuration=${refinedVideoData.totalDurationSec}s`);

      // Step D: 台本 DB 保存（確定した narrationText で）
      await prisma.generatedContent.upsert({
        where: { slug: `${scriptSlugBase}-hyperframes-script` },
        create: {
          subsidyId,
          contentType: "video_script",
          slug: `${scriptSlugBase}-hyperframes-script`,
          title: `[台本] ${refinedVideoData.title}`,
          body: refinedVideoData.narrationText,
          excerpt: `${refinedVideoData.subsidyName}のLP内容に基づく音声付き説明動画の台本です。`,
          tags: ["HyperFrames", "LP動画", "音声付き"],
          status: "draft",
        },
        update: {
          title: `[台本] ${refinedVideoData.title}`,
          body: refinedVideoData.narrationText,
          excerpt: `${refinedVideoData.subsidyName}のLP内容に基づく音声付き説明動画の台本です。`,
          tags: ["HyperFrames", "LP動画", "音声付き"],
        },
      });

      // Step E: シーン音声をタイムライン順に結合（FFmpegで adelay 合成）
      const sceneAudiosForTimeline = refinedScenes.map((s, i) => ({
        audioPath: sceneAudioFiles[i].localPath,
        start: s.start,
        duration: s.duration,
      }));
      const timelineAudioPath = path.join(workDir, "hf-timeline-audio.mp3");
      await composeSceneAudioTimeline(sceneAudiosForTimeline, timelineAudioPath, refinedVideoData.totalDurationSec);
      const timelineS3Key = `videos/${subsidyId}/audio-hf-timeline-${Date.now()}.mp3`;
      const timelinePublicUrl = await uploadMp3ToS3(timelineAudioPath, timelineS3Key);

      // Step F: 確定した duration で HyperFrames 映像をレンダリング
      const hyperframesDir = path.join(workDir, "hyperframes");
      const rendered = await renderHyperframesVideo(refinedVideoData, hyperframesDir);
      const composed = await composeHyperframesVideoWithAudio({
        silentVideoPath: rendered.silentVideoPath,
        audioPath: timelineAudioPath,
        outputDir: path.join(workDir, "output"),
        outputName: "output.mp4",
        durationSec: refinedVideoData.totalDurationSec,
      });

      const version = Date.now();
      const mp4S3Key = `videos/${subsidyId}/video-hyperframes-${version}.mp4`;
      const videoPublicUrl = await uploadMp4ToS3(composed.finalVideoPath!, mp4S3Key);
      console.log(`${LOG_PREFIX} HyperFrames video uploaded: ${mp4S3Key}`);

      const thumbS3Key = `videos/${subsidyId}/thumbnail-hyperframes-${version}.png`;
      const thumbnailPublicUrl = composed.thumbnailPath
        ? await uploadPngToS3(composed.thumbnailPath, thumbS3Key)
        : existingVideo?.thumbnailPath ?? null;
      if (thumbnailPublicUrl) {
        console.log(`${LOG_PREFIX} HyperFrames thumbnail uploaded: ${thumbS3Key}`);
      }

      const uniqueSlug = existingVideo?.slug
        ? existingVideo.slug
        : await ensureUniqueSlug(scriptSlugBase, null);
      const now = new Date();
      const commonData = {
        title: refinedVideoData.title,
        excerpt: `${refinedVideoData.subsidyName}の概要、数字、活用イメージを約${refinedVideoData.totalDurationSec}秒で整理する音声付き動画です。`,
        body: refinedVideoData.narrationText,
        tags: ["HyperFrames", "LP動画", "音声付き"],
        audioPath: timelinePublicUrl,
        videoPath: videoPublicUrl,
        thumbnailPath: thumbnailPublicUrl,
        duration: composed.durationSec,
        status: "published",
      };

      const saved = existingVideo
        ? await prisma.generatedContent.update({
            where: { id: existingVideo.id },
            data: {
              ...commonData,
              thumbnailPath: thumbnailPublicUrl ?? existingVideo.thumbnailPath ?? null,
              publishedAt: existingVideo.publishedAt ?? now,
            },
          })
        : await prisma.generatedContent.create({
            data: {
              subsidyId,
              contentType: "video",
              slug: uniqueSlug,
              ...commonData,
              publishedAt: now,
            },
          });

      await prisma.contentJob.update({
        where: { subsidyId_jobType: { subsidyId, jobType } },
        data: { status: "done", completedAt: new Date() },
      });

      console.log(
        `${LOG_PREFIX} done subsidyId=${subsidyId} contentId=${saved.id} status=published provider=hyperframes`,
      );

      return {
        contentId: saved.id,
        slug: uniqueSlug,
        title: refinedVideoData.title,
        subsidyId,
        status: "published",
        audioPath: timelinePublicUrl,
        videoPath: videoPublicUrl,
      };
    }

    // ── Step 1: 台本生成 ──────────────────────────────────────
    const subsidyForScript: SubsidyForVideoScript = {
      id: grant.id,
      name: cleanSubsidyName(grant.name ?? ""),
      description: cleanSubsidyDescription(grant.description) || null,
      maxAmountLabel: grant.maxAmountLabel ?? null,
      deadlineLabel: grant.deadlineLabel ?? null,
      subsidyRate:
        grant.subsidyRate !== null && grant.subsidyRate !== undefined
          ? String(grant.subsidyRate)
          : null,
      targetIndustries: grant.targetIndustries ?? [],
      targetIndustryNote: grant.targetIndustryNote ?? null,
      prefecture: grant.prefecture ?? null,
      articleExcerpt: relatedArticle?.excerpt ?? null,
    };

    // ── Step 1a: 台本生成（バリデーション失敗時は最大3回リトライ） ──
    let script = await generateVideoScript(subsidyForScript);
    if (!script) throw new Error("Video script generation returned null");

    let retryCount = 0;
    const MAX_RETRIES = 3;
    let validation = validateVideoData(script.sections);
    while (!validation.isValid && retryCount < MAX_RETRIES) {
      retryCount++;
      console.warn(
        `${LOG_PREFIX} validation failed (attempt ${retryCount}/${MAX_RETRIES}), errors:`,
        validation.errors,
      );
      const retried = await generateVideoScript(subsidyForScript, validation.errors);
      if (!retried) {
        console.warn(`${LOG_PREFIX} retry ${retryCount} returned null — using previous result`);
        break;
      }
      script = retried;
      validation = validateVideoData(script.sections);
    }
    if (!validation.isValid) {
      throw new Error(
        `Video script validation failed after ${retryCount} retries: ${validation.errors.join(" | ")}`,
      );
    }

    const securityVerdict = checkVideoScriptQuality(script);
    if (!securityVerdict.ok) {
      throw new Error(
        `Video script security rejected: ${securityVerdict.violations.join(" | ")}`,
      );
    }

    // 台本DB保存
    await prisma.generatedContent.upsert({
      where: { slug: `${script.slug}-script` },
      create: {
        subsidyId,
        contentType: "video_script",
        slug: `${script.slug}-script`,
        title: `[台本] ${script.title}`,
        body: script.narration_text,
        excerpt: script.excerpt,
        tags: script.tags,
        status: "draft",
      },
      update: {
        body: script.narration_text,
        title: `[台本] ${script.title}`,
        excerpt: script.excerpt,
        tags: script.tags,
      },
    });

    // ── Step 2: TTS 音声合成 ─────────────────────────────────
    let audioResult = null;
    if (process.env.VIDEO_S3_BUCKET) {
      audioResult = await synthesizeNarration(script.narration_text, subsidyId);
      if (!audioResult) {
        console.warn(`${LOG_PREFIX} TTS synthesis failed — saving as script_only`);
      }
    } else {
      console.warn(`${LOG_PREFIX} VIDEO_S3_BUCKET not set — skipping TTS`);
    }

    // ── Step 3: スライドPNG 生成 ──────────────────────────────
    let videoPublicUrl: string | null = null;
    let thumbnailPublicUrl: string | null = null;

    if (audioResult && process.env.VIDEO_S3_BUCKET) {
      await fs.mkdir(workDir, { recursive: true });

      // タイトルスライド（index=0）
      const titleSlide: SlideInput = {
        index: 0,
        heading: script.title,
        lines: [
          cleanSubsidyName(grant.name ?? "").slice(0, 30),
          grant.prefecture ? `対象地域: ${grant.prefecture}` : "全国対象",
        ],
        highlight: grant.maxAmountLabel
          ? `最大 ${grant.maxAmountLabel}`
          : undefined,
        isTitle: true,
      };

      // セクションスライド（index=1〜）
      const sectionSlides: SlideInput[] = script.sections.map((sec, i) => ({
        index: i + 1,
        heading: sec.heading,
        lines: sec.slide_lines ?? [sec.text.slice(0, 80)],
        highlight: sec.highlight ?? undefined,
        type: sec.type,
        layout: sec.layout,
      }));

      const allSlides = [titleSlide, ...sectionSlides];
      const slidesDir = path.join(workDir, "slides");
      const pngPaths = await renderSlidesToDir(allSlides, slidesDir);

      // スライドと対応する表示時間
      // タイトルスライドは 4 秒固定、セクションは duration_sec そのまま
      const timings: SlideTimingInput[] = allSlides.map((slide, i) => ({
        pngPath: pngPaths[i],
        durationSec: slide.isTitle ? 4 : (script.sections[i - 1]?.duration_sec ?? 20),
      }));

      // 通常版のフォールバック用。強化版ではニュース風タイトルフレームに差し替える。
      const fallbackThumbnailPath = pngPaths[0];

      // ── Step 4: MP3 を S3 からローカルにダウンロード ──────────
      const localMp3 = path.join(workDir, "audio.mp3");
      await downloadS3ToFile(audioResult.s3Key, localMp3);

      // ── Step 5: FFmpeg で MP4 合成 ────────────────────────────
      const videoDir = path.join(workDir, "output");
      let composed;
      if (requestedVideoProvider === "enhanced") {
        try {
          const stockDir = path.join(workDir, "stock");
          const subtitlePath = path.join(workDir, "subtitles.ass");
          const stockResult = await downloadStockFootageForScript(script, stockDir);
          console.log(
            `${LOG_PREFIX} stock footage clips=${stockResult.clips.length} attempted=${stockResult.attemptedQueries} pexels=${stockResult.pexelsConfigured} pixabay=${stockResult.pixabayConfigured}`,
          );
          await writeAssSubtitles(script.sections, subtitlePath, { initialOffsetSec: 4 });
          composed = await composeEnhancedVideo({
            slides: timings,
            sections: script.sections,
            stockClips: stockResult.clips,
            title: script.title,
            audioPath: localMp3,
            subtitlePath,
            outputDir: videoDir,
            outputName: "output.mp4",
          });
        } catch (e) {
          console.error(`${LOG_PREFIX} enhanced video compose failed`, e);
          throw e;
        }
      } else {
        composed = await composeVideo(timings, localMp3, videoDir, "output.mp4");
      }

      // ── Step 6: MP4 を S3 にアップロード ─────────────────────
      const version = Date.now();
      const mp4S3Key = `videos/${subsidyId}/video-${version}.mp4`;
      videoPublicUrl = await uploadMp4ToS3(composed.outputPath, mp4S3Key);
      console.log(`${LOG_PREFIX} video uploaded: ${mp4S3Key}`);

      const thumbnailLocalPath = composed.thumbnailPath ?? fallbackThumbnailPath;
      const thumbS3Key =
        requestedVideoProvider === "enhanced"
          ? `videos/${subsidyId}/thumbnail-${version}.png`
          : `videos/${subsidyId}/thumbnail.png`;
      thumbnailPublicUrl = await uploadPngToS3(thumbnailLocalPath, thumbS3Key);
      console.log(`${LOG_PREFIX} thumbnail uploaded: ${thumbS3Key}`);
    }

    // ── Step 7: DB 保存 ───────────────────────────────────────
    // 既存レコードがある場合はスラッグを変えない（URLが変わると404になるため）
    const uniqueSlug = existingVideo?.slug
      ? existingVideo.slug
      : await ensureUniqueSlug(script.slug, null);
    const now = new Date();
    const durationSec =
      audioResult?.durationSec ?? script.total_duration_sec ?? null;

    let saved;
    if (existingVideo) {
      saved = await prisma.generatedContent.update({
        where: { id: existingVideo.id },
        data: {
          // slug は意図的に更新しない（URLの継続性を保持）
          title: script.title,
          excerpt: script.excerpt,
          body: script.narration_text,
          tags: script.tags,
          audioPath: audioResult?.publicUrl ?? existingVideo.audioPath ?? null,
          videoPath: videoPublicUrl ?? existingVideo.videoPath ?? null,
          thumbnailPath: thumbnailPublicUrl ?? existingVideo.thumbnailPath ?? null,
          duration: durationSec,
          status: "published",
          publishedAt: existingVideo.publishedAt ?? now,
        },
      });
    } else {
      saved = await prisma.generatedContent.create({
        data: {
          subsidyId,
          contentType: "video",
          slug: uniqueSlug,
          title: script.title,
          excerpt: script.excerpt,
          body: script.narration_text,
          tags: script.tags,
          audioPath: audioResult?.publicUrl ?? null,
          videoPath: videoPublicUrl,
          thumbnailPath: thumbnailPublicUrl,
          duration: durationSec,
          status: "published",
          publishedAt: now,
        },
      });
    }

    await prisma.contentJob.update({
      where: { subsidyId_jobType: { subsidyId, jobType } },
      data: { status: "done", completedAt: new Date() },
    });

    const resultStatus = videoPublicUrl
      ? "published"
      : audioResult
        ? "audio_only"
        : "script_only";

    console.log(
      `${LOG_PREFIX} done subsidyId=${subsidyId} contentId=${saved.id} status=${resultStatus}`,
    );

    return {
      contentId: saved.id,
      slug: uniqueSlug,
      title: script.title,
      subsidyId,
      status: resultStatus,
      audioPath: audioResult?.publicUrl ?? null,
      videoPath: videoPublicUrl,
    };
  } catch (e) {
    await prisma.contentJob
      .update({
        where: { subsidyId_jobType: { subsidyId, jobType } },
        data: { status: "failed", completedAt: new Date() },
      })
      .catch(() => {});
    console.error(`${LOG_PREFIX} failed subsidyId=${subsidyId}`, e);
    throw e;
  } finally {
    // tmpdir クリーンアップ
    if (existsSync(workDir)) {
      await fs.rm(workDir, { recursive: true, force: true }).catch(() => {});
    }
  }
}

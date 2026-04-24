/**
 * 補助金 1 件 → 動画台本生成 → Polly 音声合成 → スライド生成 → FFmpeg MP4合成 → S3 保存 の Worker。
 * トリガー（CLI / API / Lambda）から共通で呼び出せるコア。
 *
 * 処理:
 *  1. SubsidyGrant + 関連記事を取得
 *  2. ContentJob(video) を running に upsert
 *  3. Bedrock で動画台本生成（slide_lines 付き）→ DB 保存 (contentType=video_script)
 *  4. AWS Polly で音声合成 → S3 に MP3 保存
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
import { synthesizeAndUpload } from "@/lib/aws/pollyTts";
import { renderSlidesToDir, type SlideInput } from "@/lib/video/generateSlides";
import { composeVideo, type SlideTimingInput } from "@/lib/video/composeVideo";
import {
  cleanSubsidyName,
  cleanSubsidyDescription,
} from "@/lib/subsidyCheckResultHelpers";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";

const LOG_PREFIX = "[runVideoJob]";

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
};

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

    const script = await generateVideoScript(subsidyForScript);
    if (!script) throw new Error("Video script generation returned null");

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

    // ── Step 2: Polly 音声合成 ────────────────────────────────
    let audioResult = null;
    if (process.env.VIDEO_S3_BUCKET) {
      audioResult = await synthesizeAndUpload(script.narration_text, subsidyId);
      if (!audioResult) {
        console.warn(`${LOG_PREFIX} Polly synthesis failed — saving as script_only`);
      }
    } else {
      console.warn(`${LOG_PREFIX} VIDEO_S3_BUCKET not set — skipping Polly`);
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

      // ── Step 3.5: スライド1枚目をサムネイルとして S3 にアップロード ──
      const thumbS3Key = `videos/${subsidyId}/thumbnail.png`;
      thumbnailPublicUrl = await uploadPngToS3(pngPaths[0], thumbS3Key);
      console.log(`${LOG_PREFIX} thumbnail uploaded: ${thumbS3Key}`);

      // ── Step 4: MP3 を S3 からローカルにダウンロード ──────────
      const localMp3 = path.join(workDir, "audio.mp3");
      await downloadS3ToFile(audioResult.s3Key, localMp3);

      // ── Step 5: FFmpeg で MP4 合成 ────────────────────────────
      const videoDir = path.join(workDir, "output");
      const composed = await composeVideo(timings, localMp3, videoDir, "output.mp4");

      // ── Step 6: MP4 を S3 にアップロード ─────────────────────
      const mp4S3Key = `videos/${subsidyId}/video.mp4`;
      videoPublicUrl = await uploadMp4ToS3(composed.outputPath, mp4S3Key);
      console.log(`${LOG_PREFIX} video uploaded: ${mp4S3Key}`);
    }

    // ── Step 7: DB 保存 ───────────────────────────────────────
    const uniqueSlug = await ensureUniqueSlug(script.slug, existingVideo?.id ?? null);
    const now = new Date();
    const durationSec =
      audioResult?.durationSec ?? script.total_duration_sec ?? null;

    let saved;
    if (existingVideo) {
      saved = await prisma.generatedContent.update({
        where: { id: existingVideo.id },
        data: {
          slug: uniqueSlug,
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

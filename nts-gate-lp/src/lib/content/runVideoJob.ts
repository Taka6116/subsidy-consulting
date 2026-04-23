/**
 * 補助金 1 件 → 動画台本生成 → Polly 音声合成 → DB 保存 の Worker 関数。
 * トリガー（CLI / API / Lambda）から共通で呼び出せるコア。
 *
 * 処理:
 *  1. SubsidyGrant + 関連記事を取得
 *  2. ContentJob(video) を running に upsert
 *  3. Bedrock で動画台本生成 → DB 保存 (contentType=video_script)
 *  4. AWS Polly で音声合成 → S3 保存
 *  5. GeneratedContent(contentType=video) を upsert して published に設定
 *  6. ContentJob を done に更新
 *  7. 例外時は ContentJob を failed に書き戻して throw
 */

import { prisma } from "@/lib/db/prisma";
import {
  generateVideoScript,
  type SubsidyForVideoScript,
} from "@/lib/ai/bedrockVideoScriptGenerate";
import { synthesizeAndUpload } from "@/lib/aws/pollyTts";
import {
  cleanSubsidyName,
  cleanSubsidyDescription,
} from "@/lib/subsidyCheckResultHelpers";
import { randomUUID } from "node:crypto";

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
  /** 既存の動画があっても強制再生成する */
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

export async function runVideoJob(
  params: RunVideoJobParams,
): Promise<RunVideoJobResult> {
  const jobType = "video";
  const { subsidyId } = params;

  console.log(`${LOG_PREFIX} start subsidyId=${subsidyId}`);

  const grant = await prisma.subsidyGrant.findUnique({
    where: { id: subsidyId },
  });
  if (!grant) {
    throw new Error(`SubsidyGrant not found: ${subsidyId}`);
  }

  // 関連記事の excerpt を取得（台本生成の参考情報として使用）
  const relatedArticle = await prisma.generatedContent.findFirst({
    where: { subsidyId, contentType: "article", status: "published" },
    select: { excerpt: true },
  });

  // ContentJob を running にセット
  await prisma.contentJob.upsert({
    where: { subsidyId_jobType: { subsidyId, jobType } },
    create: { subsidyId, jobType, status: "running" },
    update: { status: "running", completedAt: null, triggeredAt: new Date() },
  });

  try {
    // 既存動画コンテンツのチェック
    const existingVideo = await prisma.generatedContent.findFirst({
      where: { subsidyId, contentType: "video" },
    });
    if (existingVideo && !params.force) {
      console.log(
        `${LOG_PREFIX} existing video found (contentId=${existingVideo.id}) — skip`,
      );
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

    // Bedrock への入力データ構築
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

    // 台本生成
    const script = await generateVideoScript(subsidyForScript);
    if (!script) {
      throw new Error("Video script generation returned null");
    }

    // 台本を video_script として DB 保存（監査・再利用用）
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

    // Polly 音声合成
    let audioResult = null;
    if (process.env.VIDEO_S3_BUCKET) {
      audioResult = await synthesizeAndUpload(
        script.narration_text,
        subsidyId,
      );
      if (!audioResult) {
        console.warn(`${LOG_PREFIX} Polly synthesis failed — saving as script_only`);
      }
    } else {
      console.warn(`${LOG_PREFIX} VIDEO_S3_BUCKET not set — skipping Polly`);
    }

    const uniqueSlug = await ensureUniqueSlug(
      script.slug,
      existingVideo?.id ?? null,
    );

    const now = new Date();
    const effectiveStatus = "published";
    const durationSec = audioResult?.durationSec ?? script.total_duration_sec ?? null;

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
          videoPath: null,
          duration: durationSec,
          status: effectiveStatus,
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
          videoPath: null,
          duration: durationSec,
          status: effectiveStatus,
          publishedAt: now,
        },
      });
    }

    await prisma.contentJob.update({
      where: { subsidyId_jobType: { subsidyId, jobType } },
      data: { status: "done", completedAt: new Date() },
    });

    const resultStatus = audioResult ? "published" : "script_only";
    console.log(
      `${LOG_PREFIX} done subsidyId=${subsidyId} contentId=${saved.id} slug=${uniqueSlug} status=${resultStatus}`,
    );

    return {
      contentId: saved.id,
      slug: uniqueSlug,
      title: script.title,
      subsidyId,
      status: resultStatus,
      audioPath: audioResult?.publicUrl ?? null,
      videoPath: null,
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
  }
}

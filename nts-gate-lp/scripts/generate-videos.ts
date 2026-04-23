/**
 * 既存の published 記事から動画台本 + Polly 音声を生成する CLI スクリプト。
 *
 * 使い方:
 *   npx tsx scripts/generate-videos.ts [--limit 5] [--force]
 *
 * - デフォルトで最新の published 記事上位 5 件の補助金を対象とする
 * - `--limit N` で対象件数を変更
 * - `--force` で既存動画コンテンツがあっても上書き再生成する
 * - 失敗しても次の件に進む（1 件の失敗で全体停止しない）
 * - 終了時に JSON サマリを stdout に 1 行で出力
 *
 * 必要な環境変数（.env または .env.local から読み込む）:
 *   DATABASE_URL
 *   AWS_REGION
 *   BEDROCK_MODEL_ID
 *   VIDEO_S3_BUCKET    （任意: 未設定の場合は音声なし・台本のみで保存）
 *   VIDEO_S3_BASE_URL  （任意: CloudFront URL）
 */

import dotenv from "dotenv";
import path from "node:path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

type RunSummary = {
  ok: boolean;
  picked: number;
  published: number;
  audio_only: number;
  script_only: number;
  failed: number;
  details: Array<{
    subsidyId: string;
    result: "published" | "audio_only" | "script_only" | "failed";
    slug?: string;
    error?: string;
  }>;
};

async function main() {
  const args = process.argv.slice(2);
  const limitArgIndex = args.indexOf("--limit");
  const limit =
    limitArgIndex >= 0 ? Number(args[limitArgIndex + 1]) || 5 : 5;
  const force = args.includes("--force");

  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set");
    process.exit(2);
  }
  if (!process.env.BEDROCK_MODEL_ID || !process.env.AWS_REGION) {
    console.error("BEDROCK_MODEL_ID / AWS_REGION is not set");
    process.exit(2);
  }

  const { prisma } = await import("../src/lib/db/prisma");
  const { runVideoJob } = await import("../src/lib/content/runVideoJob");

  const summary: RunSummary = {
    ok: true,
    picked: 0,
    published: 0,
    audio_only: 0,
    script_only: 0,
    failed: 0,
    details: [],
  };

  try {
    // 既に動画コンテンツがある補助金 ID を除外する（force モード以外）
    const existingVideoIds = force
      ? []
      : (
          await prisma.generatedContent.findMany({
            where: { contentType: "video" },
            select: { subsidyId: true },
          })
        ).map((r) => r.subsidyId);

    // 最新 published 記事の補助金を取得（動画未生成の補助金のみ）
    const articles = await prisma.generatedContent.findMany({
      where: {
        contentType: "article",
        status: "published",
        ...(existingVideoIds.length > 0
          ? { subsidyId: { notIn: existingVideoIds } }
          : {}),
      },
      orderBy: { publishedAt: "desc" },
      take: limit,
      select: { subsidyId: true, slug: true },
    });

    summary.picked = articles.length;
    console.log(
      `[generate-videos] picked=${articles.length} limit=${limit} force=${force}`,
    );

    if (articles.length === 0) {
      console.log("[generate-videos] No articles to process. All videos may already exist.");
    }

    for (const article of articles) {
      try {
        console.log(`[generate-videos] processing subsidyId=${article.subsidyId}`);
        const result = await runVideoJob({ subsidyId: article.subsidyId, force });

        const resultStatus = result.status;
        if (resultStatus === "published") summary.published += 1;
        else if (resultStatus === "audio_only") summary.audio_only += 1;
        else summary.script_only += 1;

        summary.details.push({
          subsidyId: article.subsidyId,
          result: resultStatus,
          slug: result.slug,
        });
        console.log(
          `[generate-videos] done subsidyId=${article.subsidyId} status=${resultStatus} slug=${result.slug}`,
        );
      } catch (e) {
        summary.failed += 1;
        const msg = e instanceof Error ? e.message : String(e);
        summary.details.push({
          subsidyId: article.subsidyId,
          result: "failed",
          error: msg,
        });
        console.error(
          `[generate-videos] failed subsidyId=${article.subsidyId}: ${msg}`,
        );
      }
    }

    console.log(JSON.stringify(summary));
  } catch (e) {
    summary.ok = false;
    const msg = e instanceof Error ? e.message : String(e);
    console.error(JSON.stringify({ ...summary, error: msg }));
    process.exit(1);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
}

main();

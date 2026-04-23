/**
 * 補助金 1 件 → Bedrock で SEO 記事を生成し、DB に published で書き戻す Worker 関数。
 * トリガー（CLI / API / 将来の Lambda）から共通で呼び出せるコア。
 *
 * 処理:
 *  1. SubsidyGrant を取得（なければ throw）
 *  2. ContentJob を running に upsert
 *  3. Bedrock で記事 draft 生成
 *  4. slug の衝突を避けてユニーク化
 *  5. GeneratedContent を upsert（subsidyId + contentType=article で一意）
 *  6. 画像プールから heroImagePath を決定
 *  7. ContentJob を done に更新
 *  8. 例外時は ContentJob を failed に書き戻して throw
 */

import { prisma } from "@/lib/db/prisma";
import {
  generateSubsidyArticleDraft,
  type SubsidyForArticle,
} from "@/lib/ai/bedrockArticleGenerate";
import { pickHeroImage } from "@/lib/content/imagePool";
import { checkArticleQuality } from "@/lib/content/qualityGuard";
import {
  cleanSubsidyName,
  cleanSubsidyDescription,
} from "@/lib/subsidyCheckResultHelpers";
import { randomUUID } from "node:crypto";

const LOG_PREFIX = "[runContentJob]";

export type RunContentJobResult = {
  contentId: string;
  slug: string;
  title: string;
  subsidyId: string;
  /** ガードレール判定で自動公開を止めた場合は "rejected"、通常は "published" */
  status: "published" | "rejected";
  /** rejected 時の違反理由（空配列なら合格） */
  violations: string[];
};

export type RunContentJobParams = {
  subsidyId: string;
  jobType?: "article";
  /** 既存の記事がある場合も強制的に上書き生成する */
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

export async function runContentJob(
  params: RunContentJobParams,
): Promise<RunContentJobResult> {
  const jobType = params.jobType ?? "article";
  const { subsidyId } = params;

  console.log(`${LOG_PREFIX} start subsidyId=${subsidyId} jobType=${jobType}`);

  const grant = await prisma.subsidyGrant.findUnique({
    where: { id: subsidyId },
  });
  if (!grant) {
    throw new Error(`SubsidyGrant not found: ${subsidyId}`);
  }

  // ContentJob を running にセット（subsidyId + jobType で unique）
  await prisma.contentJob.upsert({
    where: { subsidyId_jobType: { subsidyId, jobType } },
    create: { subsidyId, jobType, status: "running" },
    update: { status: "running", completedAt: null, triggeredAt: new Date() },
  });

  try {
    // 既存記事の確認
    const existingContent = await prisma.generatedContent.findFirst({
      where: { subsidyId, contentType: "article" },
    });
    // rejected の既存記事は再生成対象とする（品質基準改善後に自動リトライ）
    if (existingContent && !params.force && existingContent.status !== "rejected") {
      console.log(
        `${LOG_PREFIX} existing article found (contentId=${existingContent.id}) — skip regeneration`,
      );
      await prisma.contentJob.update({
        where: { subsidyId_jobType: { subsidyId, jobType } },
        data: { status: "done", completedAt: new Date() },
      });
      return {
        contentId: existingContent.id,
        slug: existingContent.slug ?? `article-${existingContent.id.slice(0, 8)}`,
        title: existingContent.title ?? cleanSubsidyName(grant.name ?? ""),
        subsidyId,
        status: "published",
        violations: [],
      };
    }

    // Bedrock へ渡す正規化データ（問合せ先などを除去した description を使う）
    const subsidyForArticle: SubsidyForArticle = {
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
    };

    const draft = await generateSubsidyArticleDraft(subsidyForArticle);
    if (!draft) {
      throw new Error("Bedrock article generation returned null");
    }

    // 品質ガードレール
    const verdict = checkArticleQuality(draft);
    const effectiveStatus = verdict.ok ? "published" : "rejected";
    const violations = verdict.ok ? [] : verdict.violations;
    if (!verdict.ok) {
      console.warn(
        `${LOG_PREFIX} quality rejected subsidyId=${subsidyId} violations=${violations.join("|")}`,
      );
    }

    const heroImagePath = pickHeroImage({
      subsidyId,
      tags: draft.tags,
      targetIndustries: grant.targetIndustries ?? [],
    });

    const uniqueSlug = await ensureUniqueSlug(
      draft.slug,
      existingContent?.id ?? null,
    );

    const now = new Date();

    let saved;
    if (existingContent) {
      saved = await prisma.generatedContent.update({
        where: { id: existingContent.id },
        data: {
          slug: uniqueSlug,
          title: draft.title,
          excerpt: draft.excerpt,
          body: draft.body,
          metaDescription: draft.metaDescription,
          tags: draft.tags,
          heroImagePath,
          status: effectiveStatus,
          publishedAt:
            effectiveStatus === "published"
              ? (existingContent.publishedAt ?? now)
              : null,
        },
      });
    } else {
      saved = await prisma.generatedContent.create({
        data: {
          subsidyId,
          contentType: "article",
          slug: uniqueSlug,
          title: draft.title,
          excerpt: draft.excerpt,
          body: draft.body,
          metaDescription: draft.metaDescription,
          tags: draft.tags,
          heroImagePath,
          status: effectiveStatus,
          publishedAt: effectiveStatus === "published" ? now : null,
        },
      });
    }

    // ContentJob は done（rejected でも Bedrock 処理自体は完了している）
    await prisma.contentJob.update({
      where: { subsidyId_jobType: { subsidyId, jobType } },
      data: { status: "done", completedAt: new Date() },
    });

    console.log(
      `${LOG_PREFIX} done subsidyId=${subsidyId} contentId=${saved.id} slug=${uniqueSlug} status=${effectiveStatus} violations=${violations.length}`,
    );

    return {
      contentId: saved.id,
      slug: uniqueSlug,
      title: draft.title,
      subsidyId,
      status: effectiveStatus,
      violations,
    };
  } catch (e) {
    await prisma.contentJob
      .update({
        where: { subsidyId_jobType: { subsidyId, jobType } },
        data: { status: "failed", completedAt: new Date() },
      })
      .catch(() => {
        // ロールバック失敗は黙殺（元の例外を優先）
      });
    console.error(`${LOG_PREFIX} failed subsidyId=${subsidyId}`, e);
    throw e;
  }
}

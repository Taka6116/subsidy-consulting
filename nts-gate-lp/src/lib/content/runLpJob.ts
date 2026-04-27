/**
 * 補助金 1 件 → Bedrock で LP コピーを生成し、DB に保存する Worker。
 *
 * article と分離した contentType="lp" を使うため、
 * ContentJob の jobType は "lp" で管理する。
 * ContentJob テーブルの unique 制約は (subsidyId, jobType) なので競合しない。
 *
 * 生成済みコピーは GeneratedContent.body に JSON 文字列として保存。
 * buildSubsidyLpData.ts の parseLpAiPayload() が読み出す。
 */

import { prisma } from "@/lib/db/prisma";
import {
  generateSubsidyLpCopy,
  type SubsidyForLp,
} from "@/lib/ai/bedrockLpGenerate";
import {
  cleanSubsidyName,
  cleanSubsidyDescription,
} from "@/lib/subsidyCheckResultHelpers";

const LOG_PREFIX = "[runLpJob]";

export type RunLpJobResult = {
  contentId: string;
  subsidyId: string;
  status: "published" | "skipped";
};

export type RunLpJobParams = {
  subsidyId: string;
  force?: boolean;
};

export async function runLpJob(params: RunLpJobParams): Promise<RunLpJobResult> {
  const { subsidyId, force = false } = params;
  const jobType = "lp";

  console.log(`${LOG_PREFIX} start subsidyId=${subsidyId}`);

  const grant = await prisma.subsidyGrant.findUnique({ where: { id: subsidyId } });
  if (!grant) throw new Error(`SubsidyGrant not found: ${subsidyId}`);

  // ContentJob を running にセット
  await prisma.contentJob.upsert({
    where: { subsidyId_jobType: { subsidyId, jobType } },
    create: { subsidyId, jobType, status: "running" },
    update: { status: "running", completedAt: null, triggeredAt: new Date() },
  });

  try {
    // 既存の LP コンテンツ確認
    const existing = await prisma.generatedContent.findFirst({
      where: { subsidyId, contentType: "lp" },
    });

    if (existing && !force) {
      console.log(`${LOG_PREFIX} existing lp found (contentId=${existing.id}) — skip`);
      await prisma.contentJob.update({
        where: { subsidyId_jobType: { subsidyId, jobType } },
        data: { status: "done", completedAt: new Date() },
      });
      return { contentId: existing.id, subsidyId, status: "skipped" };
    }

    const subsidyForLp: SubsidyForLp = {
      id: grant.id,
      name: cleanSubsidyName(grant.name ?? ""),
      description: cleanSubsidyDescription(grant.description) || null,
      maxAmountLabel: grant.maxAmountLabel ?? null,
      deadlineLabel: grant.deadlineLabel ?? null,
      subsidyRate:
        grant.subsidyRate != null ? String(grant.subsidyRate) : null,
      targetIndustries: grant.targetIndustries ?? [],
      targetIndustryNote: grant.targetIndustryNote ?? null,
      prefecture: grant.prefecture ?? null,
    };

    const copy = await generateSubsidyLpCopy(subsidyForLp);

    // copy が null でも保存はする（フォールバックで描画されるため）
    const bodyJson = copy ? JSON.stringify(copy) : null;
    const now = new Date();

    let saved;
    if (existing) {
      saved = await prisma.generatedContent.update({
        where: { id: existing.id },
        data: {
          body: bodyJson,
          status: "published",
          publishedAt: existing.publishedAt ?? now,
        },
      });
    } else {
      saved = await prisma.generatedContent.create({
        data: {
          subsidyId,
          contentType: "lp",
          slug: null, // LP は slug 不要（URL は /subsidies/lp/[id]）
          title: grant.name ?? "補助金LP",
          body: bodyJson,
          status: "published",
          publishedAt: now,
        },
      });
    }

    await prisma.contentJob.update({
      where: { subsidyId_jobType: { subsidyId, jobType } },
      data: { status: "done", completedAt: new Date() },
    });

    console.log(`${LOG_PREFIX} done contentId=${saved.id} hasCopy=${!!copy}`);
    return { contentId: saved.id, subsidyId, status: "published" };
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

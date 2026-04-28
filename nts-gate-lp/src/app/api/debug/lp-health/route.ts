import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { buildSubsidyLpData } from "@/lib/subsidy-lp/buildSubsidyLpData";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type CheckResult =
  | { ok: true; data?: Record<string, unknown> }
  | { ok: false; error: string; code?: string };

function sanitizeError(error: unknown): { error: string; code?: string } {
  if (error instanceof Error) {
    const maybeCode = (error as Error & { code?: string }).code;
    return {
      error: error.message.slice(0, 500),
      code: maybeCode,
    };
  }
  return { error: String(error).slice(0, 500) };
}

async function runCheck(fn: () => Promise<Record<string, unknown> | void>): Promise<CheckResult> {
  try {
    const data = await fn();
    return data ? { ok: true, data } : { ok: true };
  } catch (error) {
    return { ok: false, ...sanitizeError(error) };
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id") ?? "141dddbb-5ba0-4f1f-be28-217593900b87";

  // #region agent log
  fetch("http://127.0.0.1:7351/ingest/efe37463-f1a9-4637-b820-39586edc1951", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "376052" },
    body: JSON.stringify({
      sessionId: "376052",
      runId: "lp-health",
      hypothesisId: "J",
      location: "src/app/api/debug/lp-health/route.ts:GET",
      message: "LP health check requested",
      data: { id },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  const env = {
    DATABASE_URL: Boolean(process.env.DATABASE_URL),
    AWS_REGION: Boolean(process.env.AWS_REGION),
    BEDROCK_MODEL_ID: Boolean(process.env.BEDROCK_MODEL_ID),
    ARTICLE_GENERATE_TOKEN: Boolean(process.env.ARTICLE_GENERATE_TOKEN),
  };

  const dbPing = await runCheck(async () => {
    await prisma.$queryRaw`SELECT 1`;
  });

  const grantCheck = await runCheck(async () => {
    const grant = await prisma.subsidyGrant.findUnique({
      where: { id },
      include: {
        contents: {
          where: { contentType: "lp", status: "published" },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!grant) {
      return { found: false };
    }

    const data = buildSubsidyLpData(grant, grant.contents[0] ?? null);
    const serialized = JSON.stringify(data);

    return {
      found: true,
      hasPublishedLpContent: grant.contents.length > 0,
      generatedKeys: Object.keys(data),
      serializedLength: serialized.length,
      sample: {
        id: data.id,
        name: data.name,
        updatedAtLabel: data.updatedAtLabel,
        useCases: data.useCases.length,
        faqs: data.faqs.length,
      },
    };
  });

  return NextResponse.json({
    ok: dbPing.ok && grantCheck.ok,
    timestamp: new Date().toISOString(),
    id,
    env,
    checks: {
      dbPing,
      grantCheck,
    },
  });
}

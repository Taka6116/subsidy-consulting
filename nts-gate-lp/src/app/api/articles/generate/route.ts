/**
 * POST /api/articles/generate
 * 指定補助金について Bedrock 経由で記事を生成し DB に保存する。
 *
 * 認証: x-internal-token ヘッダで ARTICLE_GENERATE_TOKEN と照合する簡易認証。
 *       環境変数未設定時は 503 を返す（本番誤爆防止）。
 *
 * Body: { "subsidyId": string, "force"?: boolean }
 */
import { NextResponse } from "next/server";
import { runContentJob } from "@/lib/content/runContentJob";

// Bedrock 呼び出しに時間がかかるため動的扱い
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  if (
    process.env.ARTICLE_GENERATION_DISABLED === "1" ||
    process.env.ARTICLE_GENERATION_DISABLED === "true"
  ) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Article generation on Vercel is disabled (ARTICLE_GENERATION_DISABLED). Resume after CPU quota recovery.",
      },
      { status: 503 },
    );
  }

  const expectedToken = process.env.ARTICLE_GENERATE_TOKEN?.trim();
  if (!expectedToken) {
    return NextResponse.json(
      { ok: false, error: "ARTICLE_GENERATE_TOKEN is not configured" },
      { status: 503 },
    );
  }

  const providedToken = request.headers.get("x-internal-token");
  if (providedToken !== expectedToken) {
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401 },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid json body" },
      { status: 400 },
    );
  }

  const body = (payload ?? {}) as Record<string, unknown>;
  const subsidyId = typeof body.subsidyId === "string" ? body.subsidyId.trim() : "";
  const force = body.force === true;

  if (!subsidyId) {
    return NextResponse.json(
      { ok: false, error: "subsidyId is required" },
      { status: 400 },
    );
  }

  try {
    const result = await runContentJob({ subsidyId, force });
    return NextResponse.json({
      ok: true,
      ...result,
      url: `/subsidies/articles/${result.slug}`,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const status = msg.startsWith("SubsidyGrant not found") ? 404 : 500;
    return NextResponse.json({ ok: false, error: msg }, { status });
  }
}

/**
 * POST /api/videos/generate
 * 指定補助金について動画台本 + Polly 音声を生成し DB に保存する。
 *
 * 認証: x-internal-token ヘッダで ARTICLE_GENERATE_TOKEN と照合する簡易認証（記事生成と共通トークン）。
 *       環境変数未設定時は 503 を返す（本番誤爆防止）。
 *
 * Body: { "subsidyId": string, "force"?: boolean }
 */
import { NextResponse } from "next/server";
import { runVideoJob } from "@/lib/content/runVideoJob";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST(request: Request) {
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
    const result = await runVideoJob({ subsidyId, force });
    return NextResponse.json({
      ok: true,
      ...result,
      url: `/subsidies/videos/${result.slug}`,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const status = msg.startsWith("SubsidyGrant not found") ? 404 : 500;
    return NextResponse.json({ ok: false, error: msg }, { status });
  }
}

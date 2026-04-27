/**
 * POST /api/lp/generate
 *
 * Lambda（article-pipeline）から呼び出され、
 * 補助金 1 件の LP コピーを Bedrock で生成して DB に保存する。
 *
 * 認証: x-internal-token ヘッダ（ARTICLE_GENERATE_TOKEN と共用）
 * Body: { "subsidyId": string, "force"?: boolean }
 */
import { NextResponse } from "next/server";
import { runLpJob } from "@/lib/content/runLpJob";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  const expectedToken = process.env.ARTICLE_GENERATE_TOKEN?.trim();
  if (!expectedToken) {
    return NextResponse.json(
      { ok: false, error: "ARTICLE_GENERATE_TOKEN is not configured" },
      { status: 503 },
    );
  }

  const provided = request.headers.get("x-internal-token");
  if (provided !== expectedToken) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid json body" }, { status: 400 });
  }

  const body = (payload ?? {}) as Record<string, unknown>;
  const subsidyId = typeof body.subsidyId === "string" ? body.subsidyId.trim() : "";
  const force = body.force === true;

  if (!subsidyId) {
    return NextResponse.json({ ok: false, error: "subsidyId is required" }, { status: 400 });
  }

  try {
    const result = await runLpJob({ subsidyId, force });
    return NextResponse.json({
      ok: true,
      ...result,
      url: `/subsidies/lp/${subsidyId}`,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const status = msg.startsWith("SubsidyGrant not found") ? 404 : 500;
    return NextResponse.json({ ok: false, error: msg }, { status });
  }
}

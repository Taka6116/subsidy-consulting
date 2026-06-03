/**
 * GET /api/cron/newsletter-digest
 *
 * 未配信の公開記事を週刊ダイジェストとして購読者へ送信する。
 * Vercel Cron から呼び出す（Authorization: Bearer CRON_SECRET）。
 *
 * 即時配信（記事公開時）に失敗した記事の取りこぼし救済にも使う。
 */
import { NextResponse } from "next/server";
import { sendNewsletterDigest } from "@/lib/email/newsletter/sendArticleNotification";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

function isAuthorized(request: Request): boolean {
  const cronSecret =
    process.env.CRON_SECRET?.trim() ||
    process.env.NEWSLETTER_CRON_SECRET?.trim();
  if (!cronSecret) return false;

  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  try {
    const result = await sendNewsletterDigest();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[cron/newsletter-digest] error:", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function redirectToUnsubscribePage(
  req: NextRequest,
  params: Record<string, string>,
): NextResponse {
  const url = new URL("/unsubscribe", req.nextUrl.origin);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return NextResponse.redirect(url, 303);
}

/** メール内リンクからのワンクリック配信停止 */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token")?.trim() ?? "";

  if (!UUID_RE.test(token)) {
    return redirectToUnsubscribePage(req, { error: "invalid" });
  }

  const subscriber = await prisma.subscriber.findUnique({
    where: { unsubscribeToken: token },
    select: { id: true, unsubscribedAt: true },
  });

  if (!subscriber) {
    return redirectToUnsubscribePage(req, { error: "not_found" });
  }

  if (!subscriber.unsubscribedAt) {
    await prisma.subscriber.update({
      where: { id: subscriber.id },
      data: { unsubscribedAt: new Date() },
    });
  }

  return redirectToUnsubscribePage(req, { success: "1" });
}

/** フォームからの配信停止（JSON / form 両対応） */
export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") ?? "";
    let token: string | null = null;

    if (contentType.includes("application/json")) {
      const body = await req.json();
      token = typeof body.token === "string" ? body.token.trim() : null;
    } else {
      const form = await req.formData();
      const raw = form.get("token");
      token = typeof raw === "string" ? raw.trim() : null;
    }

    if (!token || !UUID_RE.test(token)) {
      return NextResponse.json({ error: "無効なトークンです。" }, { status: 400 });
    }

    const subscriber = await prisma.subscriber.findUnique({
      where: { unsubscribeToken: token },
      select: { id: true, unsubscribedAt: true },
    });

    if (!subscriber) {
      return NextResponse.json({ error: "登録が見つかりません。" }, { status: 404 });
    }

    if (!subscriber.unsubscribedAt) {
      await prisma.subscriber.update({
        where: { id: subscriber.id },
        data: { unsubscribedAt: new Date() },
      });
    }

    if (!contentType.includes("application/json")) {
      return redirectToUnsubscribePage(req, { success: "1" });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[unsubscribe] error:", err);
    return NextResponse.json(
      { error: "配信停止に失敗しました。" },
      { status: 500 },
    );
  }
}

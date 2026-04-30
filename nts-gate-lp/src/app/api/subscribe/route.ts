// ========== [NEW 2026-04-30] メール購読 Route Handler ==========
// TODO: 将来的に SES 経由でウェルカムメールを送信する

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") ?? "";

    let email: string | null = null;
    let source: string | null = null;
    let subsidyId: string | null = null;

    if (contentType.includes("application/json")) {
      const body = await req.json();
      email = typeof body.email === "string" ? body.email.trim().toLowerCase() : null;
      source = typeof body.source === "string" ? body.source : null;
      subsidyId = typeof body.subsidyId === "string" ? body.subsidyId : null;
    } else {
      // form の POST（application/x-www-form-urlencoded）
      const form = await req.formData();
      const raw = form.get("email");
      email = typeof raw === "string" ? raw.trim().toLowerCase() : null;
      const rawSource = form.get("source");
      source = typeof rawSource === "string" ? rawSource : null;
      const rawSubsidyId = form.get("subsidyId");
      subsidyId = typeof rawSubsidyId === "string" ? rawSubsidyId : null;
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "メールアドレスが無効です。" }, { status: 400 });
    }

    // upsert: 同一メールは重複登録しない
    await prisma.subscriber.upsert({
      where: { email },
      update: {
        // 既存レコードの unsubscribedAt をクリア（再登録扱い）
        unsubscribedAt: null,
        source: source ?? undefined,
      },
      create: {
        email,
        source: source ?? undefined,
        subsidyId: subsidyId ?? undefined,
      },
    });

    // フォームからのリクエストはリダイレクト
    if (!contentType.includes("application/json")) {
      const referer = req.headers.get("referer") ?? "/";
      return NextResponse.redirect(new URL(`${referer}?subscribed=1`, req.url), 303);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[subscribe] error:", err);
    return NextResponse.json({ error: "登録に失敗しました。しばらく後でお試しください。" }, { status: 500 });
  }
}

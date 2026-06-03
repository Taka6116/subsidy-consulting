import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { createUnsubscribeToken } from "@/lib/email/newsletter/subscribers";
import { sendWelcomeEmail } from "@/lib/email/newsletter/sendWelcomeEmail";

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

    const existing = await prisma.subscriber.findUnique({
      where: { email },
      select: { id: true, unsubscribeToken: true },
    });

    const unsubscribeToken = existing?.unsubscribeToken ?? createUnsubscribeToken();

    await prisma.subscriber.upsert({
      where: { email },
      update: {
        unsubscribedAt: null,
        source: source ?? undefined,
        subsidyId: subsidyId ?? undefined,
      },
      create: {
        email,
        source: source ?? undefined,
        subsidyId: subsidyId ?? undefined,
        unsubscribeToken,
      },
    });

    if (!existing) {
      sendWelcomeEmail({ email, unsubscribeToken }).catch((err) => {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`[subscribe] welcome email failed: ${message}`);
      });
    }

    if (!contentType.includes("application/json")) {
      const referer = req.headers.get("referer") ?? "/";
      return NextResponse.redirect(new URL(`${referer}?subscribed=1`, req.url), 303);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[subscribe] error:", err);
    return NextResponse.json(
      { error: "登録に失敗しました。しばらく後でお試しください。" },
      { status: 500 },
    );
  }
}

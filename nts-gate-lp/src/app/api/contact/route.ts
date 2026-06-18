import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { notifyContact } from "@/lib/contact/notifyContact";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const company = typeof body.company === "string" ? body.company.trim() : null;
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const source = typeof body.source === "string" ? body.source.trim() : null;

    if (!name) {
      return NextResponse.json({ error: "お名前を入力してください。" }, { status: 400 });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "メールアドレスが無効です。" }, { status: 400 });
    }
    if (!message) {
      return NextResponse.json({ error: "お問い合わせ内容を入力してください。" }, { status: 400 });
    }

    // DB 保存（成功した場合のみ通知処理へ進む）
    await prisma.contactInquiry.create({
      data: {
        name,
        email,
        company: company || null,
        message,
        source: source || null,
      },
    });

    // 通知処理（将来 CRM 連携に差し替える場合は notifyContact の実装を変更する）
    await notifyContact({ name, email, company, message, source });

    return NextResponse.json({ ok: true });
  } catch (err) {
    // 個人情報を含む変数は console に出力しない
    const message = err instanceof Error ? err.message : "unknown error";
    const stack = err instanceof Error ? err.stack : undefined;
    console.error("[contact] error:", message);
    if (stack) console.error("[contact] stack:", stack);
    return NextResponse.json(
      { error: "送信に失敗しました。しばらく後でお試しください。" },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "nts_admin_session";
const COOKIE_MAX_AGE = 60 * 60 * 8; // 8時間

export async function POST(req: NextRequest) {
  const body = await req.json() as { username?: string; password?: string };

  const expectedUser = (process.env.ADMIN_USER ?? "").trim();
  const expectedPass = (process.env.ADMIN_PASS ?? "").trim();
  const inputUser = (body.username ?? "").trim();
  const inputPass = (body.password ?? "").trim();

  // デバッグ用（本番確認後に削除）
  console.log("[admin/login] expectedUser length:", expectedUser.length, "inputUser length:", inputUser.length);
  console.log("[admin/login] match user:", inputUser === expectedUser, "match pass:", inputPass === expectedPass);

  if (
    !expectedUser ||
    !expectedPass ||
    inputUser !== expectedUser ||
    inputPass !== expectedPass
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, "1", {
    httpOnly: true,   // JS から読めない
    secure: true,     // HTTPS のみ
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
  return res;
}

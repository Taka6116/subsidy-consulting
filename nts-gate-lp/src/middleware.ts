import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "nts_admin_session";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // /admin/login と /api/admin/login・logout は認証不要
  if (
    pathname === "/admin/login" ||
    pathname === "/api/admin/login" ||
    pathname === "/api/admin/logout"
  ) {
    return NextResponse.next();
  }

  // /admin/* と /api/admin/* は Cookie チェック
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    const session = req.cookies.get(COOKIE_NAME);
    if (!session || session.value !== "1") {
      // ページへのアクセスはログインにリダイレクト
      if (pathname.startsWith("/admin")) {
        const loginUrl = new URL("/admin/login", req.url);
        return NextResponse.redirect(loginUrl);
      }
      // API へのアクセスは 401
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

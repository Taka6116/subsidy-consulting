import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: NextRequest) {
  // トークン認証
  const token = req.nextUrl.searchParams.get("token") ?? "";
  const adminToken = process.env.ADMIN_TOKEN;

  if (!adminToken || token !== adminToken) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const rows = await prisma.contactInquiry.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      company: true,
      message: true,
      source: true,
      createdAt: true,
    },
  });

  // CSV 生成（BOM付きUTF-8 → Excel で文字化けしない）
  const BOM = "\uFEFF";
  const header = ["受信日時", "お名前", "会社名", "メール", "流入元", "お問い合わせ内容"].join(",");

  const escape = (v: string | null) => {
    if (v == null) return "";
    const s = String(v).replace(/"/g, '""');
    return /[,"\n\r]/.test(s) ? `"${s}"` : s;
  };

  const lines = rows.map((r) =>
    [
      escape(new Date(r.createdAt).toLocaleString("ja-JP")),
      escape(r.name),
      escape(r.company),
      escape(r.email),
      escape(r.source),
      escape(r.message),
    ].join(","),
  );

  const csv = BOM + [header, ...lines].join("\r\n");
  const filename = `contacts_${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

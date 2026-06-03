/**
 * /admin/contacts — 問い合わせ一覧管理ページ
 *
 * アクセス制限: クエリパラメータ ?token=ADMIN_TOKEN で簡易保護
 * 例: /admin/contacts?token=your_secret_token
 *
 * 環境変数: ADMIN_TOKEN（未設定時は本番でアクセス拒否）
 */

import { prisma } from "@/lib/db/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import ContactsTable from "./ContactsTable";

type PageProps = {
  searchParams: Promise<{ token?: string; page?: string }>;
};

const PAGE_SIZE = 50;

export default async function AdminContactsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const token = params.token ?? "";
  const page = Math.max(1, Number(params.page ?? "1"));

  // ── 簡易アクセス制限 ──────────────────────────────────────
  const adminToken = process.env.ADMIN_TOKEN;
  if (!adminToken || token !== adminToken) {
    // ヘッダーを読んで本番かどうか確認（開発環境は緩和）
    const h = await headers();
    const host = h.get("host") ?? "";
    const isLocalhost = host.startsWith("localhost") || host.startsWith("127.");
    if (!isLocalhost) {
      redirect("/");
    }
  }

  // ── データ取得 ────────────────────────────────────────────
  const [total, rows] = await Promise.all([
    prisma.contactInquiry.count(),
    prisma.contactInquiry.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        name: true,
        email: true,
        company: true,
        message: true,
        source: true,
        createdAt: true,
      },
    }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <main className="min-h-screen bg-[#F3F6FA] px-4 py-10">
      <div className="mx-auto max-w-7xl">
        {/* ヘッダー */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#0B173A]">問い合わせ一覧</h1>
            <p className="mt-1 text-sm text-gray-500">全 {total} 件</p>
          </div>
          {/* CSV ダウンロードボタン */}
          <a
            href={`/api/admin/contacts/csv?token=${token}`}
            className="inline-flex items-center gap-2 rounded-lg bg-[#0B173A] px-4 py-2 text-sm font-bold text-white transition hover:opacity-80"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            CSV ダウンロード
          </a>
        </div>

        {/* テーブル */}
        <ContactsTable rows={rows} token={token} page={page} totalPages={totalPages} />
      </div>
    </main>
  );
}

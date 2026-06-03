"use client";

import Link from "next/link";
import { useState } from "react";

type Row = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  message: string;
  source: string | null;
  createdAt: Date;
};

type Props = {
  rows: Row[];
  token: string;
  page: number;
  totalPages: number;
};

function formatDate(d: Date): string {
  return new Date(d).toLocaleString("ja-JP", {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function ContactsTable({ rows, token, page, totalPages }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-12 text-center text-sm text-gray-500">
        まだ問い合わせはありません。
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100 bg-[#F8F9FC] text-left text-xs font-bold text-gray-500">
              <th className="px-4 py-3">受信日時</th>
              <th className="px-4 py-3">お名前</th>
              <th className="px-4 py-3">会社名</th>
              <th className="px-4 py-3">メール</th>
              <th className="px-4 py-3">流入元</th>
              <th className="px-4 py-3">内容</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <>
                <tr
                  key={row.id}
                  className="border-b border-neutral-100 transition hover:bg-blue-50/40 cursor-pointer"
                  onClick={() => setExpanded(expanded === row.id ? null : row.id)}
                >
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">
                    {formatDate(row.createdAt)}
                  </td>
                  <td className="px-4 py-3 font-semibold text-[#0B173A]">{row.name}</td>
                  <td className="px-4 py-3 text-gray-600">{row.company ?? "―"}</td>
                  <td className="px-4 py-3">
                    <a
                      href={`mailto:${row.email}`}
                      className="text-blue-600 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {row.email}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {row.source ? (
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">
                        {row.source}
                      </span>
                    ) : "―"}
                  </td>
                  <td className="max-w-[200px] truncate px-4 py-3 text-gray-600">
                    {row.message}
                  </td>
                </tr>
                {/* 展開行 */}
                {expanded === row.id && (
                  <tr key={`${row.id}-expanded`} className="bg-blue-50/60">
                    <td colSpan={6} className="px-6 py-4">
                      <p className="mb-1 text-xs font-bold text-gray-500">お問い合わせ内容</p>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#0B173A]">
                        {row.message}
                      </p>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* ページネーション */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          {page > 1 && (
            <Link
              href={`/admin/contacts?token=${token}&page=${page - 1}`}
              className="rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-[#0B173A] transition hover:bg-gray-50"
            >
              ← 前へ
            </Link>
          )}
          <span className="text-sm text-gray-500">
            {page} / {totalPages} ページ
          </span>
          {page < totalPages && (
            <Link
              href={`/admin/contacts?token=${token}&page=${page + 1}`}
              className="rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-[#0B173A] transition hover:bg-gray-50"
            >
              次へ →
            </Link>
          )}
        </div>
      )}
    </>
  );
}

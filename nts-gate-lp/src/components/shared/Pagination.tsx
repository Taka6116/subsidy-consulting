"use client";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "...")[] = [1];
  const start = Math.max(2, current - 2);
  const end = Math.min(total - 1, current + 2);

  if (start > 2) pages.push("...");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push("...");
  pages.push(total);

  return pages;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(currentPage, totalPages);
  const isFirst = currentPage === 1;
  const isLast = currentPage === totalPages;

  return (
    <nav
      aria-label="ページナビゲーション"
      className="flex flex-wrap justify-center items-center gap-1 mt-8 mb-4"
    >
      {/* 前へ */}
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={isFirst}
        aria-label="前のページ"
        className={`px-3 py-2 text-sm rounded-xl transition ${
          isFirst
            ? "opacity-40 pointer-events-none text-[#6b7a99]"
            : "text-[#1f4dab] hover:bg-[#f1f5fb] border border-[#d6e1f4]"
        }`}
      >
        ← 前
      </button>

      {/* ページ番号 */}
      {pages.map((p, i) =>
        p === "..." ? (
          <span
            key={`ellipsis-${i}`}
            className="px-2 py-2 text-sm text-[#6b7a99] select-none"
            aria-hidden
          >
            ...
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p as number)}
            aria-label={`${p}ページ目`}
            aria-current={p === currentPage ? "page" : undefined}
            className={`min-w-[2.25rem] px-2 py-2 text-sm rounded-xl transition ${
              p === currentPage
                ? "bg-[#1f4dab] text-white font-bold shadow-sm"
                : "border border-[#d6e1f4] text-[#2a3f72] hover:bg-[#f1f5fb]"
            }`}
          >
            {p}
          </button>
        ),
      )}

      {/* 次へ */}
      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={isLast}
        aria-label="次のページ"
        className={`px-3 py-2 text-sm rounded-xl transition ${
          isLast
            ? "opacity-40 pointer-events-none text-[#6b7a99]"
            : "text-[#1f4dab] hover:bg-[#f1f5fb] border border-[#d6e1f4]"
        }`}
      >
        次 →
      </button>
    </nav>
  );
}

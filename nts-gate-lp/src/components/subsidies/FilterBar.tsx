"use client";

import { Search, X } from "lucide-react";

export type StatusTab = "all" | "open" | "closed";

interface FilterBarProps {
  query: string;
  onQueryChange: (v: string) => void;
  tab: StatusTab;
  onTabChange: (v: StatusTab) => void;
  counts: { all: number; open: number; closed: number };
  placeholder?: string;
}

const TABS: { value: StatusTab; label: string }[] = [
  { value: "all", label: "すべて" },
  { value: "open", label: "受付中" },
  { value: "closed", label: "受付終了" },
];

export default function FilterBar({
  query,
  onQueryChange,
  tab,
  onTabChange,
  counts,
  placeholder = "補助金名・キーワードで検索",
}: FilterBarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
      {/* タブ */}
      <div className="flex shrink-0 rounded-xl border border-[#e4e1da] bg-[#f7f6f3] p-1">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => onTabChange(t.value)}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
              tab === t.value
                ? "bg-white text-[var(--accent-navy)] shadow-sm"
                : "text-[#77746d] hover:text-[#2f2e2b]"
            }`}
          >
            {t.label}
            <span
              className={`rounded-full px-1.5 py-0.5 text-[11px] font-bold ${
                tab === t.value
                  ? "bg-[var(--accent-navy)] text-white"
                  : "bg-[#e4e1da] text-[#77746d]"
              }`}
            >
              {counts[t.value]}
            </span>
          </button>
        ))}
      </div>

      {/* 検索窓 */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#b0ada6]" />
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-[#e4e1da] bg-white py-2 pl-9 pr-9 text-sm text-[#2f2e2b] placeholder:text-[#b0ada6] focus:border-[var(--accent-navy)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-navy)]"
        />
        {query && (
          <button
            onClick={() => onQueryChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b0ada6] hover:text-[#2f2e2b]"
            aria-label="クリア"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

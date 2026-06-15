"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  audience: "end_user" | "partner";
};

const NAV_LINKS = [
  { label: "補助金TOP",  href: "/subsidies",          exact: true  },
  { label: "補助金一覧", href: "/subsidies/list",     exact: false },
  { label: "解説記事",   href: "/subsidies/articles", exact: false },
  { label: "活用ガイド", href: "/subsidies/lp",       exact: false },
  { label: "解説動画",   href: "/subsidies/videos",   exact: false },
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function CheckPortalHeader({ audience }: Props) {
  const pathname = usePathname();

  return (
    <header
      className="fixed left-0 right-0 top-0 z-[1000] border-b border-[var(--border-subtle)]"
      style={{ background: "var(--bg-base)" }}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        {/* ロゴ */}
        <Link
          href="/"
          className="shrink-0 rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-teal)]"
        >
          <img
            src="/nts-logo.svg"
            alt="日本提携支援"
            className="h-7 w-auto sm:h-8"
            width={200}
            height={29}
          />
        </Link>

        {/* 補助金プラットフォームナビ */}
        <nav
          className="flex min-w-0 flex-1 items-center justify-center gap-x-3 overflow-hidden sm:ml-2 lg:gap-x-5"
          aria-label="補助金プラットフォーム"
        >
          {NAV_LINKS.map(({ label, href, exact }) => {
            const isActive = exact
              ? pathname === href
              : pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`hidden shrink-0 whitespace-nowrap text-xs transition-colors sm:block lg:text-sm ${
                  isActive
                    ? "border-b-2 border-[#1e40af] font-bold text-[#1e40af]"
                    : "font-medium text-[var(--text-secondary)] hover:text-[var(--accent-navy)]"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* 右端CTA */}
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/consult"
            className="rounded-full bg-[#0e357f] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#1a4fa0] sm:text-sm"
          >
            無料相談を予約する
          </Link>
        </div>
      </div>
    </header>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const SEGMENT_LABELS: Record<string, string> = {
  "/subsidies":          "補助金TOP",
  "/subsidies/list":     "補助金一覧",
  "/subsidies/articles": "解説記事",
  "/subsidies/lp":       "活用ガイド",
  "/subsidies/videos":   "解説動画",
};

type BreadcrumbItem = { label: string; href: string | null };

function buildCrumbs(pathname: string, pageTitle?: string): BreadcrumbItem[] {
  const knownBase = Object.keys(SEGMENT_LABELS).find(
    (base) => pathname === base || pathname.startsWith(base + "/"),
  );
  if (!knownBase) return [];

  const crumbs: BreadcrumbItem[] = [
    { label: "補助金TOP", href: "/subsidies" },
  ];

  if (knownBase !== "/subsidies") {
    const isLeaf = pathname === knownBase;
    crumbs.push({
      label: SEGMENT_LABELS[knownBase],
      href: isLeaf ? null : knownBase,
    });

    if (!isLeaf) {
      crumbs.push({ label: pageTitle ?? "詳細", href: null });
    }
  }

  return crumbs;
}

type Props = {
  pageTitle?: string;
  className?: string;
};

export default function Breadcrumb({ pageTitle, className = "" }: Props) {
  const pathname = usePathname();
  const crumbs = buildCrumbs(pathname, pageTitle);

  if (crumbs.length <= 1) return null;

  return (
    <nav
      aria-label="パンくずリスト"
      className={`flex flex-wrap items-center gap-x-1.5 text-sm text-gray-500 ${className}`}
    >
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <span key={i} className="flex items-center gap-x-1.5">
            {i > 0 && (
              <span aria-hidden className="text-gray-300 select-none">
                /
              </span>
            )}
            {isLast || !crumb.href ? (
              <span aria-current={isLast ? "page" : undefined} className="text-gray-700">
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="transition hover:text-gray-700"
              >
                {crumb.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}

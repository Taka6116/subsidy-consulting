"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { trackCTAClick, trackPartnerLinkClick } from "@/lib/analytics";
import { getPartnerUrl } from "@/lib/partnerUrl";

const navLinkClass = (heroStyle: boolean) =>
  `rounded-sm text-sm font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-navy)] sm:text-[0.9375rem] ${
    heroStyle
      ? "text-[var(--text-primary)] hover:text-[var(--accent-navy)]"
      : "text-[var(--text-secondary)] hover:text-[var(--accent-navy)]"
  }`;

function HeaderCtaGroup() {
  return (
    <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 sm:gap-2.5">
      <Link
        href="/check"
        onClick={() => trackCTAClick("header_subsidy_lookup")}
        className="header-cta header-cta--secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-navy)]"
      >
        対象補助金を確認する
      </Link>
      <Link
        href="/consult"
        onClick={() => trackCTAClick("header_consult")}
        className="header-cta header-cta--primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-navy)]"
      >
        無料相談する
      </Link>
    </div>
  );
}

export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isPartnerPage = pathname === "/partner";
  const isSubsidies =
    pathname === "/subsidies" || pathname.startsWith("/subsidies/");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const heroStyle = isHome && !scrolled;
  const partnerHref = getPartnerUrl();
  const partnerNavHref = isPartnerPage ? "/" : partnerHref;
  const partnerNavLabel = isPartnerPage ? "補助金活用ご希望の方" : "パートナー企業の方へ";
  /** トップ以外は常に視認性のあるヘッダー帯（ロゴ反転のため） */
  const barClass = heroStyle
    ? "border-transparent bg-transparent"
    : !isHome
      ? "lp-site-header border-b"
      : scrolled
        ? "lp-site-header border-b"
        : "border-transparent bg-transparent";

  return (
    <header
      className={`
        lp-site-header fixed left-0 right-0 top-0 z-[50]
        flex flex-col items-stretch gap-2.5 px-4 py-2.5 transition-all duration-300
        sm:min-h-[3.5rem] sm:flex-row sm:items-center sm:gap-4 sm:px-6 sm:py-0
        ${barClass}
      `}
      data-hero-transparent={heroStyle ? "true" : undefined}
    >
      <Link
        href="/"
        className="flex shrink-0 items-center justify-center rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-navy)] sm:justify-start"
      >
        <img
          src="/nts-logo.svg"
          alt="日本提携支援"
          className="h-8 w-auto sm:h-9"
          width={200}
          height={29}
        />
      </Link>

      {isSubsidies ? (
        <>
          <nav
            className="flex w-full flex-wrap items-center justify-start gap-x-3 gap-y-2 sm:ml-4 sm:w-auto sm:flex-1 sm:justify-end sm:gap-x-4 lg:ml-8 lg:gap-x-6"
            aria-label="補助金プラットフォーム"
          >
            <Link href="/subsidies/list" className={`${navLinkClass(heroStyle)} shrink-0`}>
              補助金一覧
            </Link>
            <Link href="/subsidies/articles" className={`${navLinkClass(heroStyle)} shrink-0`}>
              解説記事
            </Link>
            <Link href="/subsidies" className={`${navLinkClass(heroStyle)} shrink-0`}>
              動画
            </Link>
            <Link
              href={partnerHref}
              onClick={() => trackPartnerLinkClick("header_subsidies")}
              className={`${navLinkClass(heroStyle)} shrink-0`}
            >
              提携先の方へ
              <span className="ml-0.5" aria-hidden="true">
                →
              </span>
            </Link>
            <Link href="/check" className={`${navLinkClass(heroStyle)} shrink-0`}>
              補助金を申請したい方へ
              <span className="ml-0.5" aria-hidden="true">
                →
              </span>
            </Link>
            <span className="hidden h-6 w-px shrink-0 bg-[var(--border-subtle)] sm:inline-block lg:mx-1" aria-hidden />
            <HeaderCtaGroup />
          </nav>
        </>
      ) : (
        <div className="flex min-w-0 flex-1 flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-end sm:gap-4 md:gap-5">
          <div className="order-1 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:justify-end sm:gap-x-5">
            <Link
              href={partnerNavHref}
              onClick={() => trackPartnerLinkClick("header")}
              className={`${navLinkClass(heroStyle)} shrink-0`}
            >
              {partnerNavLabel}
            </Link>
            <Link
              href="/subsidies"
              onClick={() => trackCTAClick("header_subsidy_detail")}
              className={`${navLinkClass(heroStyle)} shrink-0`}
            >
              補助金詳細
            </Link>
            <HeaderCtaGroup />
          </div>
        </div>
      )}
    </header>
  );
}

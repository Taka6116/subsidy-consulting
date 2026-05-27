"use client";

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
        href="/consult"
        onClick={() => trackCTAClick("header_consult")}
        className="header-cta header-cta--primary sm:min-w-[11rem] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-navy)]"
      >
        無料相談予約する
      </Link>
    </div>
  );
}

export default function Header() {
  const pathname = usePathname();
  const isPartnerPage = pathname === "/partner";
  const isSubsidies =
    pathname === "/subsidies" || pathname.startsWith("/subsidies/");
  const heroStyle = false;
  const partnerHref = getPartnerUrl();
  const partnerNavHref = isPartnerPage ? "/" : partnerHref;
  const partnerNavLabel = isPartnerPage ? "補助金活用ご希望の方" : "パートナー企業の方へ";
  /** エンドユーザー/提携先ともに同一の白背景ヘッダーを常時適用 */
  const barClass = "lp-site-header";

  return (
    <header
      className={`
        lp-site-header fixed left-0 right-0 top-0 z-[1000] pointer-events-auto
        flex flex-col items-stretch gap-2.5 px-4 py-2.5 transition-all duration-300
        sm:min-h-[3.5rem] sm:flex-row sm:items-center sm:gap-4 sm:px-6 sm:py-0
        ${barClass}
        ${isSubsidies ? "lp-site-header--subsidies" : ""}
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
          {/* ナビリンク：CTA除外・フォント小さめで1段に収める */}
          <nav
            className="flex min-w-0 flex-1 items-center justify-end gap-x-3 overflow-hidden sm:ml-2 lg:ml-6 lg:gap-x-5"
            aria-label="補助金プラットフォーム"
          >
            <Link href="/subsidies" className="header-nav-link shrink-0 whitespace-nowrap text-xs lg:text-sm">
              トップへ
            </Link>
            <Link href="/subsidies/list" className="header-nav-link shrink-0 whitespace-nowrap text-xs lg:text-sm">
              補助金一覧
            </Link>
            <Link href="/subsidies/articles" className="header-nav-link shrink-0 whitespace-nowrap text-xs lg:text-sm">
              解説記事
            </Link>
            <Link href="/subsidies/lp" className="header-nav-link shrink-0 whitespace-nowrap text-xs lg:text-sm">
              補助金ページ
            </Link>
            <Link href="/subsidies/videos" className="header-nav-link shrink-0 whitespace-nowrap text-xs lg:text-sm">
              動画
            </Link>
            <Link
              href={partnerHref}
              onClick={() => trackPartnerLinkClick("header_subsidies")}
              className="header-cta header-cta--check shrink-0 text-xs lg:text-sm"
            >
              提携先の方へ
            </Link>
            <Link href="/check" className="header-nav-link shrink-0 whitespace-nowrap text-xs lg:text-sm">
              補助金を申請したい方へ
            </Link>
          </nav>
          {/* CTAボタンはnavの外・右端固定 */}
          <div className="shrink-0">
            <HeaderCtaGroup />
          </div>
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

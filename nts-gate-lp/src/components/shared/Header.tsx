"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { trackCTAClick, trackPartnerLinkClick } from "@/lib/analytics";
import { getPartnerUrl } from "@/lib/partnerUrl";

const navLinkClass = (heroStyle: boolean) =>
  `rounded-sm text-[0.8rem] font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-navy)] lg:text-[0.9375rem] ${
    heroStyle
      ? "text-[var(--text-primary)] hover:text-[var(--accent-navy)]"
      : "text-[var(--text-secondary)] hover:text-[var(--accent-navy)]"
  }`;

function HeaderCtaGroup() {
  return (
    <div className="flex shrink-0 items-center gap-2">
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
        /* ── 補助金プラットフォーム内：ナビ + CTAを右端に寄せて整列 ── */
        <div className="flex min-w-0 flex-1 items-center justify-end gap-3 sm:ml-4 lg:ml-8 lg:gap-5">
          {/* ナビリンク群：短いラベルを優先し、長いものはlgで表示 */}
          <nav
            className="hidden items-center gap-x-3 sm:flex lg:gap-x-5"
            aria-label="補助金プラットフォーム"
          >
            <Link href="/subsidies" className={navLinkClass(heroStyle)}>
              トップへ
            </Link>
            <Link href="/subsidies/list" className={navLinkClass(heroStyle)}>
              補助金一覧
            </Link>
            <Link href="/subsidies/articles" className={navLinkClass(heroStyle)}>
              解説記事
            </Link>
            <Link href="/subsidies/lp" className={navLinkClass(heroStyle)}>
              活用ガイド
            </Link>
            <Link href="/subsidies/videos" className={navLinkClass(heroStyle)}>
              動画
            </Link>
            {/* lg以上でのみ表示する長めのリンク */}
            <Link
              href={partnerHref}
              onClick={() => trackPartnerLinkClick("header_subsidies")}
              className={`${navLinkClass(heroStyle)} hidden lg:inline`}
            >
              提携先の方へ →
            </Link>
            <Link
              href="/check"
              className={`${navLinkClass(heroStyle)} hidden lg:inline`}
            >
              補助金を申請したい方へ →
            </Link>
          </nav>

          {/* CTAボタン群：常に右端に固定 */}
          <HeaderCtaGroup />
        </div>
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

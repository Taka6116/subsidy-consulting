"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { trackPartnerLinkClick } from "@/lib/analytics";
import { getPartnerUrl } from "@/lib/partnerUrl";

const navLinkClass = (heroStyle: boolean) =>
  `rounded-sm text-xs transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 sm:text-sm ${
    heroStyle
      ? "text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)] hover:text-white/95"
      : "text-neutral-600 hover:text-primary-700"
  }`;

export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
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
  /** トップ以外は常に視認性のあるヘッダー帯（ロゴ反転のため） */
  const barClass =
    heroStyle
      ? "border-transparent bg-transparent"
      : !isHome
        ? "border-b border-neutral-200 bg-neutral-50/95 backdrop-blur-[12px]"
        : scrolled
          ? "border-b border-neutral-200 bg-neutral-50/90 backdrop-blur-[12px]"
          : "border-transparent bg-transparent";

  return (
    <header
      className={`
        absolute left-0 right-0 top-4 z-[10]
        flex flex-col items-stretch gap-3 px-6 py-2 transition-all duration-300
        sm:h-16 sm:flex-row sm:items-center sm:gap-4 sm:py-0
        ${barClass}
      `}
      data-hero-transparent={heroStyle ? "true" : undefined}
    >
      <Link
        href="/"
        className={`flex shrink-0 items-center justify-center rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 sm:justify-start ${heroStyle ? "drop-shadow-[0_1px_3px_rgba(0,0,0,0.45)]" : ""}`}
      >
        <img
          src="/nts-logo.svg"
          alt="日本提携支援"
          className={`h-7 w-auto sm:h-8 ${heroStyle ? "brightness-0 invert contrast-[1.05]" : ""}`}
          width={200}
          height={29}
        />
      </Link>

      {isSubsidies ? (
        <>
          <nav
            className="flex w-full flex-wrap items-center justify-start gap-x-4 gap-y-2 sm:ml-6 sm:w-auto sm:shrink-0 sm:gap-x-5 lg:ml-10 lg:gap-x-8"
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
          </nav>
          <div
            className="hidden min-h-0 min-w-0 flex-1 sm:block"
            aria-hidden
          />
        </>
      ) : (
        <div className="flex flex-1 justify-end sm:items-center">
          <Link
            href={partnerHref}
            onClick={() => trackPartnerLinkClick("header")}
            className={`
          shrink-0 text-small transition-colors duration-200
          rounded-sm
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500
          ${
            heroStyle
              ? "text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)] hover:text-white/95"
              : "text-neutral-600 hover:text-primary-700"
          }
        `}
          >
            パートナー企業の方へ
            <span className="ml-1" aria-hidden="true">
              →
            </span>
          </Link>
        </div>
      )}
    </header>
  );
}

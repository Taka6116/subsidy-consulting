import Link from "next/link";
import FooterPartnerLink from "./FooterPartnerLink";

const NAV_COLUMNS: {
  heading: string;
  links: { label: string; href: string }[];
}[] = [
  {
    heading: "About us",
    links: [
      { label: "日本提携支援について", href: "#" },
      { label: "理念", href: "#" },
      { label: "代表挨拶", href: "#" },
      { label: "会社概要", href: "#" },
    ],
  },
  {
    heading: "Service",
    links: [
      { label: "事業内容", href: "#" },
      { label: "M&Aオファー", href: "#" },
      { label: "M&A買収サポート", href: "#" },
      { label: "M&A提案サポート", href: "#" },
    ],
  },
  {
    heading: "Case Study & Column",
    links: [
      { label: "導入事例", href: "#" },
      { label: "お役立ち情報", href: "#" },
    ],
  },
  {
    heading: "News & Recruit",
    links: [
      { label: "お知らせ", href: "#" },
      { label: "採用情報", href: "#" },
    ],
  },
];

const linkClass =
  "block text-sm text-white/90 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white rounded-sm";

const headingClass = "mb-4 text-xs font-bold uppercase tracking-wider text-[#7ed9f5]";

export default function Footer() {
  return (
    <footer className="relative z-[20] border-t border-white/10 bg-[#0a1628] text-white">
      <div className="mx-auto max-w-6xl px-6 py-14 md:px-8 md:py-16 lg:py-20">
        <div className="flex flex-col gap-12 lg:flex-row lg:gap-0 lg:divide-x lg:divide-white/15">
          {/* 左：ロゴ・会社情報・CTA・SNS */}
          <div className="shrink-0 lg:w-[min(100%,380px)] lg:pr-12 xl:pr-16">
            <Link
              href="/"
              className="inline-block rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <img
                src="/nts-logo.svg"
                alt="日本提携支援"
                className="h-9 w-auto brightness-0 invert sm:h-10"
                width={200}
                height={36}
              />
            </Link>

            <address className="mt-8 space-y-2 not-italic text-sm leading-relaxed text-white/90">
              <p className="font-heading text-base font-bold text-white">
                株式会社日本提携支援
              </p>
              <p>〒103-0006</p>
              <p>東京都中央区日本橋富沢町10-11TWG 日本橋イーストⅡ10階</p>
              <p>
                <a
                  href="tel:0366670221"
                  className="underline-offset-4 transition-colors hover:text-white hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white rounded-sm"
                >
                  TEL: 03-6667-0221
                </a>
              </p>
            </address>

            <div className="mt-8">
              <Link
                href="/consult"
                id="footer-contact"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-[#0a1628] shadow-sm transition hover:bg-white/95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00c6ff]"
              >
                お問い合わせ
                <span aria-hidden className="text-base">
                  ›
                </span>
              </Link>
            </div>

            <div className="mt-8 flex items-center gap-5">
              <a
                href="#"
                className="text-white/80 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white rounded-sm"
                aria-label="X（準備中）"
              >
                <span className="text-base font-bold tracking-tight" aria-hidden>
                  X
                </span>
              </a>
              <a
                href="#"
                className="text-white/80 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white rounded-sm"
                aria-label="Facebook（準備中）"
              >
                <span className="text-lg font-bold" aria-hidden>
                  f
                </span>
              </a>
              <a
                href="#"
                className="text-white/80 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white rounded-sm"
                aria-label="YouTube（準備中）"
              >
                <span className="text-lg font-bold" aria-hidden>
                  ▶
                </span>
              </a>
            </div>
          </div>

          {/* 右：ナビ列 */}
          <nav
            className="min-w-0 flex-1 lg:pl-12 xl:pl-16"
            aria-label="フッターサイトマップ"
          >
            <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-2 md:grid-cols-4 md:gap-x-6">
              {NAV_COLUMNS.map((col) => (
                <div key={col.heading}>
                  <p className={headingClass}>{col.heading}</p>
                  <ul className="space-y-3">
                    {col.links.map((l) => (
                      <li key={l.label}>
                        <Link href={l.href} className={linkClass}>
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </nav>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/15 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-caption text-white/70">
            &copy; 2026 株式会社日本提携支援
          </p>
          <FooterPartnerLink />
        </div>
      </div>
    </footer>
  );
}

import Link from "next/link";
import FooterPartnerLink from "./FooterPartnerLink";

const FOOTER_GRADIENT =
  "linear-gradient(135deg, #0F2027 0%, #2C5364 50%, #00c6ff 100%)";

const footerLinks = [
  { label: "サービス", href: "#" },
  { label: "会社情報", href: "#" },
  { label: "お問い合わせ", href: "/#footer-contact" },
] as const;

export default function Footer() {
  return (
    <footer className="text-white" style={{ background: FOOTER_GRADIENT }}>
      <div className="mx-auto max-w-container px-6 py-16">
        <div className="mb-8 space-y-4 text-small leading-relaxed text-white">
          <p className="text-base font-bold font-heading tracking-tight">
            株式会社日本提携支援
          </p>
          <p className="text-white/95">〒103-0006</p>
          <p className="text-white/95">
            東京都中央区日本橋富沢町10-11TWG 日本橋イーストⅡ10階
          </p>
          <p>
            <a
              href="tel:0366670221"
              className="text-white/95 underline-offset-4 transition-colors hover:text-white hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white rounded-sm"
            >
              TEL: 03-6667-0221
            </a>
          </p>
        </div>

        <nav className="mb-12 flex flex-wrap gap-8" aria-label="フッターナビ">
          {footerLinks.map((link) => (
            <Link
              key={link.label}
              id={link.label === "お問い合わせ" ? "footer-contact" : undefined}
              href={link.href}
              className="
                text-small text-white/85 transition-colors duration-200
                hover:text-white
                focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white rounded-sm
              "
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col gap-4 border-t border-white/20 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-caption text-white/80">
            &copy; 2026 NTS Inc. All rights reserved.
          </p>
          <FooterPartnerLink />
        </div>
      </div>
    </footer>
  );
}

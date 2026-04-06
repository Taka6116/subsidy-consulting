import Link from "next/link";
import FooterPartnerLink from "./FooterPartnerLink";

const footerLinks = [
  { label: "サービス", href: "#" },
  { label: "会社情報", href: "#" },
  { label: "お問い合わせ", href: "/#footer-contact" },
] as const;

export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-neutral-500">
      <div className="mx-auto max-w-container px-6 py-16">
        <div className="mb-8">
          <p className="text-lg font-bold text-white font-heading tracking-tight">
            日本提携支援
          </p>
        </div>

        <div className="mb-8 space-y-1">
          <p className="text-small">株式会社日本提携支援</p>
          <p className="text-small">
            〒000-0000 東京都○○区○○ 0-0-0
          </p>
        </div>

        <nav className="mb-12 flex flex-wrap gap-8" aria-label="フッターナビ">
          {footerLinks.map((link) => (
            <Link
              key={link.label}
              id={link.label === "お問い合わせ" ? "footer-contact" : undefined}
              href={link.href}
              className="
                text-small text-neutral-500 transition-colors duration-200
                hover:text-white
                focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 rounded-sm
              "
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col gap-4 border-t border-neutral-700 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-caption">
            &copy; 2026 NTS Inc. All rights reserved.
          </p>
          <FooterPartnerLink />
        </div>
      </div>
    </footer>
  );
}

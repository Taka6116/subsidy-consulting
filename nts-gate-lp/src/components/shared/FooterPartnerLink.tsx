"use client";

import Link from "next/link";
import { trackPartnerLinkClick } from "@/lib/analytics";

export default function FooterPartnerLink() {
  return (
    <Link
      href="https://partner.firstgate.jp"
      onClick={() => trackPartnerLinkClick("footer")}
      className="
        text-small text-neutral-500 transition-colors duration-200
        hover:text-white
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 rounded-sm
      "
    >
      パートナー企業の方はこちら
      <span className="ml-1" aria-hidden="true">→</span>
    </Link>
  );
}

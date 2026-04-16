"use client";

import Link from "next/link";
import { trackPartnerLinkClick } from "@/lib/analytics";
import { getPartnerUrl } from "@/lib/partnerUrl";

export default function FooterPartnerLink() {
  return (
    <Link
      href={getPartnerUrl()}
      onClick={() => trackPartnerLinkClick("footer")}
      className="
        text-small text-[var(--accent-navy)] transition-colors duration-200
        hover:text-[var(--accent-teal)]
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-navy)] rounded-sm
      "
    >
      パートナー企業の方はこちら
      <span className="ml-1" aria-hidden="true">→</span>
    </Link>
  );
}

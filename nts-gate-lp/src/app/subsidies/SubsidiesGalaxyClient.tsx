"use client";

/*
 * メモ: 一時期 FV を public/images/subsidy-footer.jpg + オーバーレイ + 白文字にしていた。
 * 現在は Galaxy（SubsidiesGalaxyBackdrop と同型）に戻している。
 */

import Link from "next/link";
import { getPartnerUrl } from "@/lib/partnerUrl";
import SubsidiesGalaxyBackdrop from "./SubsidiesGalaxyBackdrop";

export default function SubsidiesGalaxyClient() {
  const partnerHref = getPartnerUrl();

  return (
    <section
      className="relative flex min-h-[100svh] w-full flex-col overflow-hidden bg-[#f8f7f4] font-body"
      aria-label="補助金情報プラットフォーム"
    >
      <SubsidiesGalaxyBackdrop />

      <div className="relative z-10 flex min-h-[100svh] flex-col items-center justify-center px-6 py-24 text-center">
        <p className="mb-4 text-xs tracking-[0.2em] text-neutral-500">
          SUBSIDY INTELLIGENCE PLATFORM
        </p>
        <h1 className="font-heading max-w-4xl text-[clamp(32px,5vw,72px)] font-normal leading-[1.15] text-[#2a2926]">
          補助金を、最速で。
        </h1>
        <p className="mt-6 max-w-[480px] text-base font-light leading-relaxed text-neutral-600">
          最新の補助金情報・解説記事・動画を一箇所に。
          <br />
          あなたのビジネスに最適な支援策をすぐに見つける。
        </p>

        <div className="mt-10 flex w-full max-w-lg flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4">
          <Link
            href="/check"
            className="inline-flex items-center justify-center border border-[#2a2926] px-6 py-3.5 text-[13px] tracking-[0.08em] text-[#2a2926] transition-colors hover:bg-[#2a2926] hover:text-[#f8f7f4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2a2926]"
          >
            無料で補助金申請する
            <span className="ml-1" aria-hidden="true">
              →
            </span>
          </Link>
          <Link
            href={partnerHref}
            className="inline-flex items-center justify-center border border-[#2a2926] px-6 py-3.5 text-[13px] tracking-[0.08em] text-[#2a2926] transition-colors hover:bg-[#2a2926] hover:text-[#f8f7f4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2a2926]"
          >
            提携先ページへ
            <span className="ml-1" aria-hidden="true">
              →
            </span>
          </Link>
        </div>

        <Link
          href="/check"
          className="mt-8 inline-block border border-[#2a2926] px-9 py-3.5 text-[13px] tracking-[0.12em] text-[#2a2926] transition-colors hover:bg-[#2a2926] hover:text-[#f8f7f4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2a2926]"
        >
          補助金を探す →
        </Link>
        <Link
          href="/"
          className="mt-6 text-sm text-neutral-500 underline-offset-4 transition hover:text-[#2a2926] hover:underline"
        >
          トップへ戻る
        </Link>
      </div>
    </section>
  );
}

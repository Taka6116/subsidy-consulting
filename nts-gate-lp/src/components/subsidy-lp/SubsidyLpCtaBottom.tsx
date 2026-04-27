"use client";

import Link from "next/link";
import type { SubsidyLpData } from "@/lib/subsidy-lp/buildSubsidyLpData";

type Props = { data: SubsidyLpData };

export default function SubsidyLpCtaBottom({ data }: Props) {
  const hasUrgency = data.remainingDays !== null && data.remainingDays >= 0 && data.remainingDays <= 30;

  return (
    <div className="sticky bottom-0 z-50 border-t border-white/10 bg-[#071525]/95 px-4 py-4 text-white shadow-[0_-10px_30px_rgba(0,0,0,0.28)] backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-lg flex-col gap-3">
        <div>
          <p className="text-sm font-black">
            {hasUrgency
              ? `締切まで残り ${data.remainingDays} 日。無料相談で確認できます`
              : "この補助金について、無料で相談できます"}
          </p>
          <p className="mt-0.5 text-xs font-medium text-white/62">
            対象かどうか、どの枠が合うか。専門家が無料でお答えします。
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/consult"
            className="flex flex-1 items-center justify-center rounded-full bg-[#fd9f1b] px-4 py-3 text-sm font-extrabold text-[#172033] transition hover:bg-[#ffb64c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#fd9f1b]"
          >
            無料相談する
          </Link>
          <Link
            href="/check"
            className="flex items-center justify-center rounded-full border border-white/30 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            診断
          </Link>
        </div>
      </div>
    </div>
  );
}

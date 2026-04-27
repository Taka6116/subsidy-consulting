import Link from "next/link";
import type { SubsidyLpData } from "@/lib/subsidy-lp/buildSubsidyLpData";

type Props = { data: SubsidyLpData };

export default function SubsidyLpCtaSidebar({ data }: Props) {
  const hasUrgency = data.remainingDays !== null && data.remainingDays >= 0 && data.remainingDays <= 30;

  return (
    <div className="sticky top-24 space-y-4">
      <div className="overflow-hidden rounded-[28px] border border-[#dce6ef] bg-white shadow-[0_18px_45px_rgba(23,32,51,0.12)]">
        <div className="bg-[#0d2138] px-6 py-5 text-white">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#8fd3ff]">
            Free Consultation
          </p>
          <p className="mt-2 text-lg font-black leading-snug">無料相談を受け付けています</p>
        </div>
        <div className="p-6">
        {hasUrgency && (
          <div className="mb-4 rounded-2xl bg-[#fff7eb] px-4 py-3 text-xs font-black text-[#8a5200] ring-1 ring-[#ffd89a]">
            締切まで残り {data.remainingDays} 日です
          </div>
        )}
        <p className="text-sm font-medium leading-7 text-[#556875]">
          「自社が対象か」「どの枠が合うか」を専門家が整理します。まだ検討段階でも構いません。
        </p>

        <Link
          href="/consult"
          className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-[#fd9f1b] px-5 py-3.5 text-sm font-extrabold text-[#172033] shadow-[0_10px_25px_rgba(253,159,27,0.24)] transition hover:-translate-y-0.5 hover:bg-[#ffb64c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#fd9f1b] active:translate-y-0"
        >
          無料相談する
        </Link>
        <Link
          href="/check"
          className="mt-3 inline-flex w-full items-center justify-center rounded-full border border-[#dce6ef] px-5 py-3 text-xs font-bold text-[#172033] transition hover:bg-[#f1f6fb] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e9bdb]"
        >
          まず補助金診断を受ける
        </Link>

        <div className="mt-5 space-y-2 border-t border-[#edf2f6] pt-5 text-xs font-bold text-[#556875]">
          <p>相談申し込み無料</p>
          <p>申請後も伴走サポート</p>
          <p>個人情報の取り扱いは厳守</p>
        </div>
        </div>
      </div>

      <div className="rounded-[24px] border border-[#dce6ef] bg-white p-5 text-sm shadow-[0_18px_45px_rgba(23,32,51,0.08)]">
        <p className="mb-4 text-xs font-extrabold uppercase tracking-[0.2em] text-[#1e9bdb]">Summary</p>
        <dl className="space-y-2">
          <div className="flex justify-between gap-3">
            <dt className="text-[#556875]">上限補助額</dt>
            <dd className="text-right font-black text-[#172033]">{data.amountLabel}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-[#556875]">補助率</dt>
            <dd className="text-right font-black text-[#172033]">{data.rateLabel}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-[#556875]">公募期限</dt>
            <dd className={`text-right font-black ${
              data.remainingDays !== null && data.remainingDays <= 14
                ? "text-red-600"
                : "text-[#172033]"
            }`}>
              {data.deadlineLabel}
            </dd>
          </div>
        </dl>

        {data.officialUrl && (
          <a
            href={data.officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-1 text-xs font-bold text-[#1e5f8c] underline underline-offset-4 hover:text-[#1e9bdb] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e9bdb]"
          >
            公式ページを見る ↗
          </a>
        )}
      </div>
    </div>
  );
}

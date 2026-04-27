import type { SubsidyLpData } from "@/lib/subsidy-lp/buildSubsidyLpData";
import { subsidyLpAsset } from "@/lib/subsidy-lp/assets";

type Props = { data: SubsidyLpData };

export default function SubsidyLpPainSection({ data }: Props) {
  const advisorImage = subsidyLpAsset("advisor.png");

  return (
    <section className="overflow-hidden rounded-[28px] border border-[#dce6ef] bg-white shadow-[0_18px_45px_rgba(23,32,51,0.08)]">
      <div className="border-b border-[#edf2f6] bg-[#0d2138] px-6 py-7 text-white sm:px-8">
        <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-[#8fd3ff]">
          Problem
        </p>
        <h2 className="mt-2 text-2xl font-black leading-tight tracking-[-0.02em] sm:text-3xl">
          こんなお悩みはありませんか？
        </h2>
        <div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <p className="max-w-2xl text-sm font-medium leading-7 text-white/72">
            {data.name}を検討する前に、まずは自社の課題と制度の相性を整理することが重要です。
          </p>
          <img
            src={advisorImage}
            alt=""
            aria-hidden="true"
            className="hidden h-32 w-auto shrink-0 object-contain drop-shadow-[0_14px_24px_rgba(0,0,0,0.18)] sm:block"
          />
        </div>
      </div>

      <ul className="grid grid-cols-1 gap-0 divide-y divide-[#edf2f6] sm:grid-cols-2 sm:divide-x sm:divide-y-0">
        {data.pains.map((pain, i) => (
          <li
            key={i}
            className="group flex min-h-28 items-start gap-4 bg-white px-6 py-5 transition hover:bg-[#f6fbff] sm:px-8"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#eef6fc] text-sm font-black text-[#1e9bdb] transition group-hover:bg-[#1e9bdb] group-hover:text-white">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="text-sm font-bold leading-7 text-[#172033]">{pain}</span>
          </li>
        ))}
      </ul>

      <div className="bg-[#f1f6fb] px-6 py-5 sm:px-8">
        <p className="text-sm font-extrabold leading-7 text-[#172033]">
          こうした課題を、補助金を使った投資計画として整理できるかを無料相談で確認できます。
        </p>
      </div>
    </section>
  );
}

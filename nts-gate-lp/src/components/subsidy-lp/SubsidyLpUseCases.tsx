import type { SubsidyLpData } from "@/lib/subsidy-lp/buildSubsidyLpData";

type Props = { data: SubsidyLpData };

export default function SubsidyLpUseCases({ data }: Props) {
  return (
    <section className="rounded-[28px] border border-[#dce6ef] bg-white p-6 shadow-[0_18px_45px_rgba(23,32,51,0.08)] sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-[#1e9bdb]">
            Use Cases
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-[-0.02em] text-[#172033] sm:text-3xl">
            活用イメージ
          </h2>
        </div>
        <p className="max-w-md rounded-2xl bg-[#fff7eb] px-4 py-3 text-xs font-bold leading-6 text-[#8a5200] ring-1 ring-[#ffd89a]">
          以下は参考用の架空イメージです。実際の採択事例ではありません。
        </p>
      </div>

      <div className="mt-7 grid gap-4 lg:grid-cols-3">
        {data.useCases.map((uc, i) => (
          <div
            key={i}
            className="relative overflow-hidden rounded-[22px] border border-[#dce6ef] bg-[#f8fbfe] p-5"
          >
            <span className="absolute -right-3 -top-5 text-7xl font-black leading-none text-white">
              {String(i + 1).padStart(2, "0")}
            </span>
            <p className="relative text-sm font-black leading-snug text-[#172033]">{uc.label}</p>
            <p className="relative mt-3 text-sm font-medium leading-7 text-[#556875]">{uc.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

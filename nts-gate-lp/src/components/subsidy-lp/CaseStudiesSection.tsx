import type { ConstructionElectrificationSubsidy } from "@/lib/subsidy-data/construction-electrification";

export default function CaseStudiesSection({
  data,
}: {
  data: ConstructionElectrificationSubsidy;
}) {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <h2 className="mb-12 text-center text-2xl font-bold text-[#0B173A] md:text-3xl">
          活用企業の成功事例
        </h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {data.caseStudies.map((item, index) => (
            <div
              key={`${item.industry}-${index}`}
              className="rounded-xl border border-gray-100 p-5 transition-shadow hover:shadow-md"
            >
              <span className="mb-3 inline-block rounded-sm bg-[#008894]/10 px-2 py-0.5 text-xs font-medium text-[#008894]">
                {item.industry}
              </span>
              <p className="mb-2 text-base font-bold leading-snug text-[#0B173A]">
                {item.result}
              </p>
              <p className="mb-4 text-xs leading-relaxed text-gray-500">{item.detail}</p>
              <p className="text-sm font-bold text-[#FEA00D]">{item.amount}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <a href="#" className="text-sm text-[#1E40AF] hover:underline">
            さらに多くの事例を見る →
          </a>
        </div>
      </div>
    </section>
  );
}

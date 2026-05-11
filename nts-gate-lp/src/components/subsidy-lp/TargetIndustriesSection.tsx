import Image from "next/image";
import { Clock3 } from "lucide-react";
import industryA from "../../../icon-assets/isometric_10.png";
import industryB from "../../../icon-assets/isometric_15.png";
import industryC from "../../../icon-assets/isometric_11.png";
import industryD from "../../../icon-assets/isometric_20.png";
import type { SubsidyLpData } from "@/lib/subsidy-data/types";

const industryImages = [industryA, industryB, industryC, industryD];

export default function TargetIndustriesSection({
  data,
}: {
  data: SubsidyLpData;
}) {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <h2 className="mb-5 text-center text-2xl font-bold text-[#0B173A] md:text-3xl">
          こんな企業におすすめの補助金です
        </h2>
        <p className="mx-auto mb-12 max-w-2xl text-center text-sm leading-relaxed text-gray-500 md:text-base">
          下記いずれかに該当する企業は、本補助金の対象となる可能性が高い領域です。
        </p>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {data.targetIndustries.map((industry, index) => (
            <div
              key={industry.label}
              className="flex h-full flex-col rounded-xl bg-[#F3F6FA] p-5 transition-shadow hover:shadow-md"
            >
              <p className="mb-3 text-xs font-bold tracking-wide text-[#008894]">
                {industry.label}
              </p>
              <div className="mb-3 flex aspect-[4/3] w-full items-center justify-center">
                <Image
                  src={industryImages[index % industryImages.length]}
                  alt={industry.label}
                  className="h-28 w-28 object-contain"
                />
              </div>
              <p className="text-sm leading-relaxed text-gray-600">{industry.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-xl bg-[#F3F6FA] p-5 md:flex-row md:p-6">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 flex-shrink-0 text-[#FEA00D]">
              <Clock3 className="h-10 w-10" />
            </div>
            <div>
              <p className="mb-1 text-sm font-bold text-[#0B173A]">
                予算がなくなり次第終了のため、早めの検討がおすすめです
              </p>
              <p className="text-xs leading-relaxed text-gray-500">
                本補助金は予算上限に達し次第、受付終了となります。早めのご相談で、申請前の整理をしっかり進められます。
              </p>
            </div>
          </div>
          <div className="flex-shrink-0 text-right">
            <p className="mb-1 text-xs text-gray-500">申請締切まで</p>
            <p className="text-2xl font-bold text-[#0B173A]">
              あと
              <span className="text-[#FEA00D]">{data.dates.remainingDays}</span>日
            </p>
            <p className="text-xs text-gray-400">{data.dates.deadline}まで</p>
          </div>
          <a
            href="#contact"
            className="inline-flex flex-shrink-0 items-center whitespace-nowrap rounded-lg bg-[#FEA00D] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#e8900a]"
          >
            今すぐ無料で相談する →
          </a>
        </div>
      </div>
    </section>
  );
}

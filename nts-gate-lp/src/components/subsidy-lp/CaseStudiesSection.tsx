import Image from "next/image";
import caseImage1 from "../../../icon-assets/isometric_15.png";
import caseImage2 from "../../../icon-assets/isometric_20.png";
import caseImage3 from "../../../icon-assets/isometric_07.png";
import caseImage4 from "../../../icon-assets/isometric_09.png";
import type { ConstructionElectrificationSubsidy } from "@/lib/subsidy-data/construction-electrification";

const caseImages = [caseImage1, caseImage2, caseImage3, caseImage4];

export default function CaseStudiesSection({
  data,
}: {
  data: ConstructionElectrificationSubsidy;
}) {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <p className="mb-3 text-center text-xs font-bold tracking-[0.18em] text-[#008894]">
          USE CASES
        </p>
        <h2 className="mb-5 text-center text-2xl font-bold text-[#0B173A] md:text-3xl">
          活用例
        </h2>
        <p className="mx-auto mb-12 max-w-2xl text-center text-sm leading-relaxed text-gray-500 md:text-base">
          建設機械の電動化補助金は、業種や事業フェーズによって活用の仕方が大きく異なります。代表的な活用例をもとに、貴社に近い使い方をイメージしてください。
        </p>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {data.caseStudies.map((item, index) => (
            <div
              key={`${item.industry}-${index}`}
              className="flex flex-col overflow-hidden rounded-xl border border-gray-100 transition-shadow hover:shadow-md"
            >
              <div className="flex aspect-[5/3] items-center justify-center bg-[#F3F6FA]">
                <Image
                  src={caseImages[index % caseImages.length]}
                  alt={item.industry}
                  className="h-24 w-auto object-contain"
                />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <span className="mb-3 inline-block self-start rounded-sm bg-[#008894]/10 px-2 py-0.5 text-xs font-medium text-[#008894]">
                  {item.industry}
                </span>
                <p className="mb-2 text-base font-bold leading-snug text-[#0B173A]">
                  {item.result}
                </p>
                <p className="mb-4 text-xs leading-relaxed text-gray-500">{item.detail}</p>
                <p className="mt-auto text-sm font-bold text-[#FEA00D]">{item.amount}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

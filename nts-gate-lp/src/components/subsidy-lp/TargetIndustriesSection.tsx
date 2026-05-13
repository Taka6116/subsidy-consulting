import Image from "next/image";
import { Clock3 } from "lucide-react";
import type { SubsidyLpData } from "@/lib/subsidy-data/types";
import { resolveLpCardGridImage } from "@/lib/lp-cardgrid-pictures/resolveLpCardGridImage";

/** 業種ラベルに含まれるキーワード → 候補画像リスト（優先度順・複数枚で重複防止） */
const INDUSTRY_IMAGE_MAP: { keywords: string[]; srcs: string[] }[] = [
  { keywords: ["食品加工", "食品工場"], srcs: ["/images/industries/food-processing.png"] },
  {
    keywords: ["建設", "土木", "建築", "重機", "電動建機"],
    srcs: ["/images/industries/construction.webp", "/images/industries/construction2.webp", "/images/industries/construction3.webp"],
  },
  {
    keywords: ["リース", "レンタル", "脱炭素", "GX", "重機保有"],
    srcs: ["/images/industries/construction2.webp", "/images/industries/construction3.webp", "/images/industries/transport2.webp"],
  },
  { keywords: ["運送", "配送", "輸送", "トラック"], srcs: ["/images/industries/transport.png", "/images/industries/transport2.webp", "/images/industries/transport3.webp"] },
  { keywords: ["物流", "倉庫", "3PL", "マテハン"], srcs: ["/images/industries/logistics.png", "/images/industries/transport3.webp"] },
  { keywords: ["製造", "加工業", "機械"], srcs: ["/images/industries/manufacturing.png", "/images/industries/manufacturing2.webp", "/images/industries/manufacturing3.webp"] },
  { keywords: ["印刷"], srcs: ["/images/industries/printing.png"] },
  { keywords: ["介護", "福祉"], srcs: ["/images/industries/care-welfare.png"] },
  { keywords: ["医療", "クリニック", "病院", "診療所"], srcs: ["/images/industries/medical.png"] },
  { keywords: ["飲食", "レストラン"], srcs: ["/images/industries/restaurant.png", "/images/industries/retail-food.png"] },
  { keywords: ["小売", "卸売"], srcs: ["/images/industries/retail-food.png"] },
  { keywords: ["IT", "DX", "デジタル", "システム"], srcs: ["/images/industries/dx-it.webp", "/images/industries/dx-it2.webp"] },
  { keywords: ["人材", "採用", "雇用", "育成", "賃上げ"], srcs: ["/images/industries/human-resources2.webp", "/images/industries/human-resources3.webp"] },
  { keywords: ["農業", "林業", "漁業"], srcs: ["/images/industries/agriculture.png"] },
];

const FALLBACK_POOL = [
  "/images/industries/manufacturing.png",
  "/images/industries/logistics.png",
  "/images/industries/retail-food.png",
  "/images/industries/food-processing.png",
  "/images/industries/manufacturing2.webp",
  "/images/industries/transport2.webp",
];

function resolveIndustryImage(label: string, usedSrcs: Set<string>): string {
  const cardGridImage = resolveLpCardGridImage(label);
  if (cardGridImage && !usedSrcs.has(cardGridImage)) return cardGridImage;

  for (const rule of INDUSTRY_IMAGE_MAP) {
    if (rule.keywords.some((kw) => label.includes(kw))) {
      const unused = rule.srcs.find((s) => !usedSrcs.has(s));
      return unused ?? rule.srcs[0];
    }
  }
  const unusedFallback = FALLBACK_POOL.find((s) => !usedSrcs.has(s));
  return unusedFallback ?? FALLBACK_POOL[0];
}

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
          {(() => {
            const usedSrcs = new Set<string>();
            return data.targetIndustries.map((industry) => {
              const imgSrc = resolveIndustryImage(industry.label, usedSrcs);
              usedSrcs.add(imgSrc);
              return (
                <div
                  key={industry.label}
                  className="flex h-full flex-col rounded-xl bg-[#F3F6FA] p-5 transition-shadow hover:shadow-md"
                >
                  <p className="mb-3 text-xs font-bold tracking-wide text-[#008894]">
                    {industry.label}
                  </p>
                  <div className="mb-3 overflow-hidden rounded-lg aspect-[4/3] w-full">
                    <Image
                      src={imgSrc}
                      alt={industry.label}
                      width={400}
                      height={300}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <p className="text-sm leading-relaxed text-gray-600">{industry.desc}</p>
                </div>
              );
            });
          })()}
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

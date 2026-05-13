import Image from "next/image";
import type { SubsidyLpData } from "@/lib/subsidy-data/types";

/** 業種ラベルに含まれるキーワード → 画像パス（TargetIndustriesSectionと共通ルール） */
const CASE_IMAGE_MAP: { keywords: string[]; src: string }[] = [
  { keywords: ["食品加工", "食品・物流", "食品工場"], src: "/images/industries/food-processing.png" },
  { keywords: ["建設", "土木", "建築", "重機", "電動化", "脱炭素", "GX", "リース", "レンタル", "重機保有"], src: "/images/industries/construction.webp" },
  { keywords: ["運送", "配送", "輸送"], src: "/images/industries/transport.png" },
  { keywords: ["製造", "加工業", "機械"], src: "/images/industries/manufacturing.png" },
  { keywords: ["印刷"], src: "/images/industries/printing.png" },
  { keywords: ["物流", "倉庫", "3PL", "マテハン"], src: "/images/industries/logistics.png" },
  { keywords: ["介護", "福祉"], src: "/images/industries/care-welfare.png" },
  { keywords: ["医療", "クリニック", "病院", "診療所"], src: "/images/industries/medical.png" },
  { keywords: ["飲食", "レストラン"], src: "/images/industries/restaurant.png" },
  { keywords: ["小売", "卸売"], src: "/images/industries/retail-food.png" },
  { keywords: ["農業", "林業", "漁業"], src: "/images/industries/agriculture.png" },
];

const CASE_FALLBACK = [
  "/images/industries/manufacturing.png",
  "/images/industries/logistics.png",
  "/images/industries/food-processing.png",
  "/images/industries/construction.webp",
];

function resolveCaseImage(industry: string, index: number): string {
  for (const rule of CASE_IMAGE_MAP) {
    if (rule.keywords.some((kw) => industry.includes(kw))) return rule.src;
  }
  return CASE_FALLBACK[index % CASE_FALLBACK.length];
}

export default function CaseStudiesSection({
  data,
}: {
  data: SubsidyLpData;
}) {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <h2 className="mb-5 text-center text-2xl font-bold text-[#0B173A] md:text-3xl">
          活用例
        </h2>
        <p className="mx-auto mb-12 max-w-2xl text-center text-sm leading-relaxed text-gray-500 md:text-base">
          業種や事業フェーズによって活用の仕方が大きく異なります。代表的な活用例をもとに、貴社に近い使い方をイメージしてください。
        </p>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {data.caseStudies.map((item, index) => (
            <div
              key={`${item.industry}-${index}`}
              className="flex flex-col overflow-hidden rounded-xl border border-gray-100 transition-shadow hover:shadow-md"
            >
              <div className="aspect-[5/3] overflow-hidden">
                <Image
                  src={resolveCaseImage(item.industry, index)}
                  alt={item.industry}
                  width={400}
                  height={240}
                  className="h-full w-full object-cover"
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

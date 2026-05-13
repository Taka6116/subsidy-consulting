import Image from "next/image";
import type { SubsidyLpData } from "@/lib/subsidy-data/types";

/**
 * 業種キーワード → 候補画像リスト（複数枚持つことで同一LP内での重複を防ぐ）
 * 優先度順。上にあるルールが先に評価される。
 */
const CASE_IMAGE_MAP: { keywords: string[]; srcs: string[] }[] = [
  {
    keywords: ["食品加工", "食品工場"],
    srcs: ["/images/industries/food-processing.png"],
  },
  {
    keywords: ["建設", "土木", "建築", "重機", "電動建機"],
    srcs: [
      "/images/industries/construction.webp",
      "/images/industries/construction2.webp",
      "/images/industries/construction3.webp",
    ],
  },
  {
    keywords: ["リース", "レンタル", "脱炭素", "GX"],
    srcs: [
      "/images/industries/construction2.webp",
      "/images/industries/construction3.webp",
      "/images/industries/transport2.webp",
    ],
  },
  {
    keywords: ["運送", "配送", "輸送", "ドライバー", "トラック"],
    srcs: [
      "/images/industries/transport.png",
      "/images/industries/transport2.webp",
      "/images/industries/transport3.webp",
    ],
  },
  {
    keywords: ["物流", "倉庫", "3PL", "マテハン"],
    srcs: [
      "/images/industries/logistics.png",
      "/images/industries/transport3.webp",
    ],
  },
  {
    keywords: ["製造", "加工業", "機械", "工場"],
    srcs: [
      "/images/industries/manufacturing.png",
      "/images/industries/manufacturing2.webp",
      "/images/industries/manufacturing3.webp",
    ],
  },
  {
    keywords: ["印刷"],
    srcs: ["/images/industries/printing.png"],
  },
  {
    keywords: ["介護", "福祉"],
    srcs: ["/images/industries/care-welfare.png"],
  },
  {
    keywords: ["医療", "クリニック", "病院", "診療所"],
    srcs: ["/images/industries/medical.png"],
  },
  {
    keywords: ["飲食", "レストラン", "料理", "食堂"],
    srcs: ["/images/industries/restaurant.png", "/images/industries/retail-food.png"],
  },
  {
    keywords: ["小売", "卸売"],
    srcs: ["/images/industries/retail-food.png"],
  },
  {
    keywords: ["IT", "DX", "デジタル", "システム", "クラウド"],
    srcs: ["/images/industries/dx-it.webp", "/images/industries/dx-it2.webp"],
  },
  {
    keywords: ["人材", "採用", "雇用", "研修", "育成", "賃上げ"],
    srcs: [
      "/images/industries/human-resources2.webp",
      "/images/industries/human-resources3.webp",
    ],
  },
  {
    keywords: ["農業", "林業", "漁業"],
    srcs: ["/images/industries/agriculture.png"],
  },
];

const ALL_FALLBACK = [
  "/images/industries/manufacturing.png",
  "/images/industries/logistics.png",
  "/images/industries/construction.webp",
  "/images/industries/food-processing.png",
  "/images/industries/manufacturing2.webp",
  "/images/industries/transport2.webp",
];

/**
 * 業種ラベルにマッチする候補画像リストを返す。
 * マッチしない場合はすべての候補を返す（フォールバック）。
 */
function getCandidates(industry: string): string[] {
  for (const rule of CASE_IMAGE_MAP) {
    if (rule.keywords.some((kw) => industry.includes(kw))) return rule.srcs;
  }
  return ALL_FALLBACK;
}

/**
 * 使用済み画像セットを考慮しながら画像を選ぶ。
 * 候補の中で未使用のものを優先し、全て使用済みなら候補先頭を返す。
 */
function resolveCaseImage(industry: string, usedSrcs: Set<string>): string {
  const candidates = getCandidates(industry);
  const unused = candidates.find((src) => !usedSrcs.has(src));
  return unused ?? candidates[0];
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
          {(() => {
            const usedSrcs = new Set<string>();
            return data.caseStudies.map((item, index) => {
              const imgSrc = resolveCaseImage(item.industry, usedSrcs);
              usedSrcs.add(imgSrc);
              return (
              <div
                key={`${item.industry}-${index}`}
                className="flex flex-col overflow-hidden rounded-xl border border-gray-100 transition-shadow hover:shadow-md"
              >
                <div className="aspect-[5/3] overflow-hidden">
                  <Image
                    src={imgSrc}
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
              );
            });
          })()}
        </div>
      </div>
    </section>
  );
}

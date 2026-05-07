import { BarChart3, Fuel, Leaf } from "lucide-react";
import Image, { type StaticImageData } from "next/image";
import defaultHeroVisual from "../../../icon-assets/isometric_22.png";
import constructionHeroVisual from "../../../icon-assets/construction-hero.webp";
import type { ConstructionElectrificationSubsidy } from "@/lib/subsidy-data/construction-electrification";

const benefitIcons = {
  fuel: Fuel,
  leaf: Leaf,
  chart: BarChart3,
} as const;

const CONSTRUCTION_KEYWORDS = ["建設業", "建設機械", "重機", "建機"];

function pickHeroVisual(category: string): {
  src: StaticImageData;
  alt: string;
  isPhotoStyle: boolean;
} {
  const matchesConstruction = CONSTRUCTION_KEYWORDS.some((keyword) =>
    category.includes(keyword),
  );
  if (matchesConstruction) {
    return {
      src: constructionHeroVisual,
      alt: "建設業向け補助金イメージ",
      isPhotoStyle: true,
    };
  }
  return {
    src: defaultHeroVisual,
    alt: "補助金イメージ",
    isPhotoStyle: false,
  };
}

export default function HeroSection({
  data,
}: {
  data: ConstructionElectrificationSubsidy;
}) {
  const heroVisual = pickHeroVisual(data.category);

  return (
    <section className="relative min-h-[520px] overflow-hidden bg-[#0B173A] md:min-h-[600px]">
      <Image
        src={heroVisual.src}
        alt={heroVisual.alt}
        fill
        className={
          heroVisual.isPhotoStyle
            ? "object-cover opacity-55"
            : "object-cover opacity-25"
        }
        priority
      />
      <div
        className={
          heroVisual.isPhotoStyle
            ? "absolute inset-0 bg-gradient-to-r from-[#0B173A]/92 via-[#0B173A]/72 to-[#0B173A]/55"
            : "absolute inset-0 bg-[#0B173A]/78"
        }
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-16 lg:px-8 md:py-20">
        <div className="flex flex-col items-start gap-10 lg:flex-row">
          <div className="flex-1 text-white">
            <div className="mb-5 flex flex-wrap gap-2">
              <span className="rounded-sm bg-white/20 px-3 py-1 text-xs font-medium tracking-wide text-white">
                {data.badge}
              </span>
              <span className="rounded-sm bg-white/20 px-3 py-1 text-xs font-medium tracking-wide text-white">
                {data.category}
              </span>
            </div>

            <h1 className="mb-2 text-3xl font-bold leading-tight text-white md:text-4xl lg:text-5xl">
              {data.headline}
            </h1>
            <p className="mb-4 text-3xl font-bold text-[#FEA00D] md:text-4xl lg:text-5xl">
              {data.headlineAccent}
            </p>
            <p className="mb-8 max-w-3xl text-sm leading-relaxed text-white/80 md:text-base">
              {data.subheadline}
            </p>

            <div className="mb-10 flex flex-wrap gap-5 md:gap-6">
              {data.benefits.map((benefit) => {
                const Icon = benefitIcons[benefit.icon];
                return (
                  <div key={benefit.label} className="flex flex-col items-center gap-1">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-center text-xs text-white/90">
                      {benefit.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-4 rounded-lg bg-white/10 px-5 py-4 md:grid-cols-4">
              <div>
                <p className="mb-1 text-xs text-white/60">公募開始</p>
                <p className="text-sm font-bold text-white">{data.dates.start}</p>
              </div>
              <div>
                <p className="mb-1 text-xs text-white/60">申請締切</p>
                <p className="text-sm font-bold text-white">{data.dates.deadline}</p>
              </div>
              <div>
                <p className="mb-1 text-xs text-white/60">残り期間</p>
                <p className="text-sm font-bold text-white">
                  あと
                  <span className="ml-1 text-lg text-[#FEA00D]">
                    {data.dates.remainingDays}
                  </span>
                  日
                </p>
              </div>
              <div>
                <p className="mb-1 text-xs text-white/60">補助上限</p>
                <p className="text-sm font-bold text-[#FEA00D]">{data.dates.maxAmount}</p>
              </div>
            </div>
          </div>

          <div className="w-full rounded-xl bg-white p-6 shadow-2xl lg:w-[340px]">
            <p className="mb-1 text-sm font-bold text-[#0B173A]">
              あなたの会社は対象？
            </p>
            <p className="mb-4 text-xs text-gray-500">
              当てはまる項目を選択してください（複数選択可）
            </p>
            <div className="mb-5 space-y-3">
              {data.targetChecklist.map((item, i) => (
                <label
                  key={`${item}-${i}`}
                  className="group flex cursor-pointer items-start gap-3"
                >
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 cursor-pointer accent-[#008894]"
                  />
                  <span className="text-sm text-gray-700 transition-colors group-hover:text-[#0B173A]">
                    {item}
                  </span>
                </label>
              ))}
            </div>
            <p className="mb-4 text-xs font-medium text-[#008894]">
              3つ以上当てはまる方は、対象の可能性が高いです
            </p>
            <a
              href="#contact"
              className="block w-full rounded-lg bg-[#FEA00D] py-3.5 text-center text-sm font-bold text-white transition-colors hover:bg-[#e8900a]"
            >
              無料で対象診断してみる →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

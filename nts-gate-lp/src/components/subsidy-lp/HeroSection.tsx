import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import defaultHeroVisual from "../../../icon-assets/isometric_22.png";
import constructionHeroVisual from "../../../icon-assets/construction-hero.webp";
import type { ConstructionElectrificationSubsidy } from "@/lib/subsidy-data/construction-electrification";

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
  return { src: defaultHeroVisual, alt: "補助金イメージ", isPhotoStyle: false };
}

export default function HeroSection({
  data,
}: {
  data: ConstructionElectrificationSubsidy;
}) {
  const heroVisual = pickHeroVisual(data.category);

  return (
    <section className="relative min-h-[480px] overflow-hidden bg-[#0B173A] md:min-h-[540px]">
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
            ? "absolute inset-0 bg-gradient-to-r from-[#0B173A]/94 via-[#0B173A]/75 to-[#0B173A]/40"
            : "absolute inset-0 bg-[#0B173A]/78"
        }
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-16 lg:px-8 md:py-20">
        {/* バッジ */}
        <div className="mb-5 flex flex-wrap gap-2">
          <span className="rounded-sm bg-white/20 px-3 py-1 text-xs font-medium tracking-wide text-white">
            {data.badge}
          </span>
          <span className="rounded-sm bg-white/20 px-3 py-1 text-xs font-medium tracking-wide text-white">
            {data.category}
          </span>
        </div>

        {/* メインコピー */}
        <h1 className="mb-2 max-w-2xl text-3xl font-bold leading-tight text-white md:text-4xl lg:text-5xl">
          {data.headline}
        </h1>
        <p className="mb-4 max-w-2xl text-3xl font-bold text-[#FEA00D] md:text-4xl lg:text-5xl">
          {data.headlineAccent}
        </p>
        <p className="mb-10 max-w-2xl text-sm leading-relaxed text-white/80 md:text-base">
          {data.subheadline}
        </p>

        {/* CTAボタン */}
        <div className="mb-12 flex flex-wrap items-center gap-4">
          <Link
            href="#checker"
            className="inline-flex items-center rounded-lg bg-[#FEA00D] px-7 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-[#e8900a]"
          >
            無料で対象診断してみる →
          </Link>
          <Link
            href="#contact"
            className="inline-flex items-center rounded-lg border border-white/40 px-7 py-3.5 text-sm font-bold text-white transition hover:bg-white/10"
          >
            無料相談を予約する
          </Link>
        </div>

        {/* 公募期間バー */}
        <div className="grid max-w-2xl grid-cols-2 gap-4 rounded-lg bg-white/10 px-5 py-4 md:grid-cols-4">
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
    </section>
  );
}

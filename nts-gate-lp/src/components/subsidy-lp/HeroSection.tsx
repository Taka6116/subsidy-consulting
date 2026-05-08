import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import constructionHeroVisual from "../../../icon-assets/construction-hero.webp";
import dxHeroVisual from "../../../icon-assets/dx-lp-hero.webp";
import equipmentHeroVisual from "../../../icon-assets/equipment-hero.webp";
import generalHeroVisual from "../../../icon-assets/general-hero.webp";
import businessPlanHeroVisual from "../../../icon-assets/business-plan-hero.webp";
import humanResourcesHeroVisual from "../../../icon-assets/human-resources-hero.webp";
import logisticsHeroVisual from "../../../icon-assets/logistics-hero.webp";
import type { SubsidyLpData } from "@/lib/subsidy-data/types";

const CONSTRUCTION_KEYWORDS = ["建設業", "建設機械", "重機", "建機"];
const DX_KEYWORDS = ["DX", "デジタル", "IT導入", "デジタル化", "情報化", "クラウド", "AI", "システム導入", "IT化", "デジタル技術"];
const EQUIPMENT_KEYWORDS = ["設備投資", "ものづくり", "設備更新", "設備導入", "製造", "省力化"];
const BUSINESS_PLAN_KEYWORDS = ["事業再構築", "新事業", "事業計画", "経営革新", "事業展開", "販路"];
const HUMAN_RESOURCES_KEYWORDS = [
  "人材", "雇用", "人手不足", "採用", "求人", "研修", "育成",
  "賃上げ", "処遇改善", "働き方", "テレワーク", "副業", "兼業",
  "定着", "離職", "インターン", "リスキリング", "スキルアップ",
];
const LOGISTICS_KEYWORDS = ["物流", "運送", "輸送", "配送", "流通", "トラック", "運輸", "倉庫"];

function pickHeroVisual(category: string): {
  src: StaticImageData;
  alt: string;
  isPhotoStyle: boolean;
} {
  if (CONSTRUCTION_KEYWORDS.some((k) => category.includes(k))) {
    return { src: constructionHeroVisual, alt: "建設業向け補助金イメージ", isPhotoStyle: true };
  }
  if (DX_KEYWORDS.some((k) => category.includes(k))) {
    return { src: dxHeroVisual, alt: "DX補助金イメージ", isPhotoStyle: true };
  }
  if (LOGISTICS_KEYWORDS.some((k) => category.includes(k))) {
    return { src: logisticsHeroVisual, alt: "物流・運送向け補助金イメージ", isPhotoStyle: true };
  }
  if (BUSINESS_PLAN_KEYWORDS.some((k) => category.includes(k))) {
    return { src: businessPlanHeroVisual, alt: "事業計画向け補助金イメージ", isPhotoStyle: true };
  }
  if (HUMAN_RESOURCES_KEYWORDS.some((k) => category.includes(k))) {
    return { src: humanResourcesHeroVisual, alt: "人材向け補助金イメージ", isPhotoStyle: true };
  }
  if (EQUIPMENT_KEYWORDS.some((k) => category.includes(k))) {
    return { src: equipmentHeroVisual, alt: "設備投資補助金イメージ", isPhotoStyle: true };
  }
  return { src: generalHeroVisual, alt: "補助金イメージ", isPhotoStyle: true };
}

export default function HeroSection({
  data,
}: {
  data: SubsidyLpData;
}) {
  const fallbackVisual = pickHeroVisual(data.category);
  const heroVisual: {
    src: string | StaticImageData;
    alt: string;
    isPhotoStyle: boolean;
    isExternal: boolean;
  } = data.heroImagePath
    ? {
        src: data.heroImagePath,
        alt: `${data.category}向け補助金イメージ`,
        isPhotoStyle: true,
        isExternal: true,
      }
    : {
        ...fallbackVisual,
        isExternal: false,
      };

  return (
    <section className="relative min-h-[480px] overflow-hidden bg-[#0B173A] md:min-h-[540px]">
      <Image
        src={heroVisual.src}
        alt={heroVisual.alt}
        fill
        sizes="100vw"
        className={
          heroVisual.isPhotoStyle
            ? "object-cover opacity-55"
            : "object-cover opacity-25"
        }
        priority
        placeholder={heroVisual.isExternal ? "empty" : "blur"}
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
        <div className="grid max-w-3xl grid-cols-2 gap-0 rounded-lg bg-white/10 md:grid-cols-4">
          <div className="flex flex-col justify-center px-6 py-5 md:border-r md:border-white/10">
            <p className="mb-1.5 text-xs font-medium text-white/60">公募開始</p>
            <p className="text-xl font-bold text-white">{data.dates.start}</p>
          </div>
          <div className="flex flex-col justify-center px-6 py-5 md:border-r md:border-white/10">
            <p className="mb-1.5 text-xs font-medium text-white/60">申請締切</p>
            <p className="text-xl font-bold text-white">{data.dates.deadline}</p>
          </div>
          <div className="flex flex-col justify-center px-6 py-5 md:border-r md:border-white/10">
            <p className="mb-1.5 text-xs font-medium text-white/60">残り期間</p>
            <p className="text-xl font-bold text-white">
              あと<span className="mx-1 text-2xl text-[#FEA00D]">{data.dates.remainingDays}</span>日
            </p>
          </div>
          <div className="flex flex-col justify-center px-6 py-5">
            <p className="mb-1.5 text-xs font-medium text-white/60">補助上限</p>
            <p className="text-xl font-bold text-[#FEA00D]">{data.dates.maxAmount}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

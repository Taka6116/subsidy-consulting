"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  HERO_CARD_FILTERS,
  type HeroFilterAction,
  type IndustryKey,
  type PurposeKey,
} from "@/lib/lp-pictures/pickLpCategoryImage";

type Props = {
  totalLpCount: number;
  purposes: Set<PurposeKey>;
  industries: Set<IndustryKey>;
  onSelectFilter: (action: HeroFilterAction) => void;
  pulseHeroLabel: string | null;
};

function isCardFilterActive(
  label: string,
  purposes: Set<PurposeKey>,
  industries: Set<IndustryKey>,
): boolean {
  const action = HERO_CARD_FILTERS[label];
  if (!action) return false;
  if (action.type === "purpose") return purposes.has(action.key);
  return industries.has(action.key);
}

const purposeCards = [
  {
    label: "設備投資",
    image: "/images/industries/manufacturing3.webp",
    alt: "設備投資・生産設備のイメージ",
    className: "lg:left-[0%] lg:top-[10px] xl:top-[8px]",
  },
  {
    label: "IT導入・DX",
    image: "/images/industries/dx-it2.webp",
    alt: "IT導入・DXのイメージ",
    className: "lg:left-[24%] lg:top-[6px] xl:top-[4px]",
  },
  {
    label: "人材確保",
    image: "/images/industries/human-resources3.webp",
    alt: "人材確保のイメージ",
    className: "lg:left-[48%] lg:top-[8px] xl:top-[6px]",
  },
  {
    label: "物流・運送",
    image: "/images/industries/transport2.webp",
    alt: "物流・運送のイメージ",
    className: "lg:left-[72%] lg:top-[8px] xl:top-[6px]",
  },
  {
    label: "建設・施工",
    image: "/images/industries/construction.webp",
    alt: "建設・施工のイメージ",
    className: "lg:left-[4%] lg:top-[170px] xl:top-[210px] 2xl:top-[256px]",
  },
  {
    label: "省エネ",
    image: "/images/industries/manufacturing2.webp",
    alt: "省エネ・設備改善のイメージ",
    className: "lg:left-[34%] xl:left-[30%] 2xl:left-[30%] lg:top-[170px] xl:top-[210px] 2xl:top-[256px]",
  },
  {
    label: "事業計画",
    image: "/api/article-pictures/%E4%BA%8B%E6%A5%AD%E8%A8%88%E7%94%BB/business-meeting-conference-concept.webp",
    alt: "事業計画のイメージ",
    className: "lg:left-[64%] xl:left-[56%] 2xl:left-[56%] lg:top-[170px] xl:top-[210px] 2xl:top-[256px]",
  },
] as const;


export default function LpPurposeHero({
  totalLpCount,
  purposes,
  industries,
  onSelectFilter,
  pulseHeroLabel,
}: Props) {
  return (
    <section className="relative isolate overflow-hidden bg-[#EDF6FF] pb-10 pt-10 sm:pt-12 lg:min-h-[560px] lg:pb-10 lg:pt-12 xl:min-h-[600px] xl:pb-14 xl:pt-14 2xl:min-h-[640px]">
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 84% 22%, rgba(65,176,255,.2), transparent 32%), radial-gradient(circle at 46% 80%, rgba(255,255,255,.94), transparent 38%), linear-gradient(115deg, #ffffff 0%, #f7fbff 30%, #e9f7ff 52%, #bfe8ff 73%, #4ba8f0 100%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-75"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 24%, rgba(255,255,255,0.98), transparent 27%), radial-gradient(circle at 72% 30%, rgba(255,255,255,0.36), transparent 30%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
          backgroundSize: "54px 54px, 54px 54px",
          maskImage: "linear-gradient(90deg, transparent 0%, rgba(0,0,0,.12) 36%, rgba(0,0,0,.85) 64%, rgba(0,0,0,1) 100%)",
          WebkitMaskImage:
            "linear-gradient(90deg, transparent 0%, rgba(0,0,0,.12) 36%, rgba(0,0,0,.85) 64%, rgba(0,0,0,1) 100%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "linear-gradient(118deg, transparent 0 29%, rgba(255,255,255,.56) 29.12%, transparent 29.42% 47%, rgba(255,255,255,.42) 47.12%, transparent 47.42%), linear-gradient(135deg, transparent 0 52%, rgba(52,177,255,.2) 52.12%, transparent 52.55%)",
        }}
      />
      <div
        aria-hidden
        className="absolute -bottom-[210px] left-[36%] h-[360px] w-[820px] rounded-[50%] border-t border-cyan-200/65"
      />
      <div
        aria-hidden
        className="absolute -bottom-[245px] left-[46%] h-[420px] w-[980px] rounded-[50%] border-t-2 border-white/75"
      />
      <div
        aria-hidden
        className="absolute -bottom-[190px] left-[58%] h-[320px] w-[720px] rounded-[50%] border-t border-blue-200/55"
      />
      <div
        aria-hidden
        className="absolute -bottom-28 left-0 h-[260px] w-[66vw] rounded-full bg-white/85 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#F4F7FB] to-transparent"
      />

      <div className="relative z-10 mx-auto grid max-w-[1780px] items-center gap-8 px-5 sm:px-8 lg:grid-cols-[0.42fr_0.58fr] lg:px-12 xl:px-14 2xl:px-16">
        <div className="max-w-[720px] lg:pl-2">
          <h1 className="mt-0 text-[clamp(2.875rem,4.1vw,4.5rem)] font-black leading-[1.14] tracking-tight text-[#081C44] xl:mt-8">
            業種・目的から
            <br />
            <span className="bg-gradient-to-r from-[#0EA5E9] to-[#006FE6] bg-clip-text text-transparent">
              使える補助金
            </span>
            を見つける
          </h1>

          <p className="mt-5 max-w-[560px] text-[clamp(1rem,1.1vw,1.1875rem)] font-semibold leading-[1.95] tracking-wide text-[#102C54] xl:mt-6">
            設備投資、IT導入、人材確保、物流改善まで。
            <br className="hidden sm:block" />
            自社に関係する制度を、目的別にわかりやすく整理しています。
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row xl:mt-9 xl:gap-4">
            <Link
              href="/check"
              className="inline-flex h-[52px] items-center justify-center gap-2 rounded-xl bg-[#075BD8] px-6 text-sm font-black text-white shadow-[0_20px_42px_rgba(7,91,216,.30)] transition hover:-translate-y-0.5 hover:bg-[#044BB8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#075BD8] xl:h-14 xl:px-8 xl:text-base"
            >
              自社に合う制度を確認する
              <ArrowRight className="h-5 w-5 rounded-full bg-white/18 p-1" />
            </Link>
            <Link
              href="/consult"
              className="inline-flex h-[52px] items-center justify-center gap-2 rounded-xl border-2 border-[#081C44] bg-white/70 px-6 text-sm font-black text-[#081C44] shadow-sm backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#075BD8] xl:h-14 xl:px-8 xl:text-base"
            >
              相談予約する
              <ArrowRight className="h-5 w-5 rounded-full bg-[#EEF4FF] p-1 text-[#075BD8]" />
            </Link>
          </div>

          <div className="mt-7 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_12px_32px_rgba(10,45,90,.10)] xl:mt-8">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4 sm:flex-nowrap sm:gap-x-5">
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-emerald-600 ring-1 ring-emerald-300">
                <span className="relative flex h-1.5 w-1.5 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>
                LIVE
              </span>
              <p className="text-sm font-bold text-gray-500">公開中</p>
              <span className="text-[2.25rem] font-black leading-none tabular-nums text-gray-900 xl:text-[2.5rem]">
                {totalLpCount}
              </span>
              <p className="text-sm font-bold leading-snug text-gray-500">
                件の補助金情報がここに集約
              </p>
              <span className="ml-auto hidden shrink-0 text-xs font-bold text-gray-400 sm:block">
                随時更新中
              </span>
            </div>
            <div className="h-px bg-gray-100" />
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-2.5">
              <span className="text-[11px] font-semibold text-gray-500">受付中の制度を含む</span>
              <span className="hidden h-3 w-px bg-gray-200 sm:block" />
              <span className="text-[11px] font-semibold text-gray-500">締切情報を確認できます</span>
              <span className="hidden h-3 w-px bg-gray-200 sm:block" />
              <span className="text-[11px] font-semibold text-gray-500">無料相談へ進められます</span>
            </div>
          </div>
        </div>

        <div className="relative lg:min-h-[360px] xl:min-h-[450px] 2xl:min-h-[540px]">
          <div
            aria-hidden
            className="absolute -inset-10 rounded-[4rem] bg-sky-300/20 blur-3xl"
          />
          <div className="relative grid grid-cols-2 gap-3 sm:grid-cols-3 lg:block lg:h-[360px] lg:-mr-24 xl:h-[450px] xl:-mr-24 2xl:h-[540px] 2xl:-mr-32">
            {purposeCards.map((card, index) => {
              const filterAction = HERO_CARD_FILTERS[card.label];
              const isActive = isCardFilterActive(card.label, purposes, industries);
              const isPulsing = pulseHeroLabel === card.label;

              return (
                <button
                  key={card.label}
                  type="button"
                  onClick={() => {
                    if (filterAction) onSelectFilter(filterAction);
                  }}
                  aria-pressed={isActive}
                  aria-label={`${card.label}で絞り込む`}
                  className={`group relative h-[120px] overflow-hidden rounded-[14px] border bg-slate-900 shadow-[0_20px_44px_rgba(18,67,122,.24)] ring-1 ring-white/70 transition duration-300 hover:-translate-y-1.5 hover:scale-[1.02] hover:shadow-[0_30px_64px_rgba(14,165,233,.26)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#075BD8] sm:h-[140px] lg:absolute lg:h-[155px] lg:w-[145px] lg:-skew-x-[8deg] xl:h-[198px] xl:w-[185px] 2xl:h-[240px] 2xl:w-[225px] ${card.className} ${
                    index === 6 ? "sm:col-start-2 lg:col-start-auto" : ""
                  } ${
                    isActive
                      ? "border-[#075BD8] ring-4 ring-[#075BD8]/50 ring-offset-2 ring-offset-[#EDF6FF]"
                      : "border-sky-200/70"
                  } ${isPulsing ? "animate-[heroCardPulse_0.6s_ease-out_2]" : ""}`}
                >
                  <div className="absolute inset-0 lg:-mx-6 lg:skew-x-[8deg]">
                    <Image
                      src={card.image}
                      alt={card.alt}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px"
                      className="object-cover transition duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div
                    aria-hidden
                    className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/70 to-transparent"
                  />
                  <div
                    aria-hidden
                    className="absolute inset-x-0 bottom-0 h-px bg-cyan-200/90 shadow-[0_0_20px_rgba(103,232,249,0.85)]"
                  />
                  <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between gap-1.5 px-2.5 py-2 lg:skew-x-[8deg] xl:px-3 xl:py-2.5">
                    <span className="text-[11px] font-black leading-none text-white drop-shadow-md xl:text-xs 2xl:text-sm">
                      {card.label}
                    </span>
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white/20 text-white ring-1 ring-white/30 xl:h-6 xl:w-6">
                      <ArrowRight className="h-2.5 w-2.5 xl:h-3 xl:w-3" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

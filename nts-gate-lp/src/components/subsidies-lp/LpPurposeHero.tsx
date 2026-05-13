import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarCheck,
  CheckSquare,
  Headphones,
  BarChart3,
  Building2,
  Factory,
  Leaf,
  MonitorCog,
  Truck,
  Users,
} from "lucide-react";

type Props = {
  totalLpCount: number;
};

const purposeCards = [
  {
    label: "設備投資",
    href: "#lp-list",
    image: "/images/industries/manufacturing3.webp",
    alt: "設備投資・生産設備のイメージ",
    icon: Factory,
    className: "lg:left-[2%] lg:top-[10px]",
  },
  {
    label: "IT導入・DX",
    href: "#lp-list",
    image: "/images/industries/dx-it2.webp",
    alt: "IT導入・DXのイメージ",
    icon: MonitorCog,
    className: "lg:left-[25%] lg:top-[10px]",
  },
  {
    label: "人材確保",
    href: "#lp-list",
    image: "/images/industries/human-resources3.webp",
    alt: "人材確保のイメージ",
    icon: Users,
    className: "lg:left-[48%] lg:top-[10px]",
  },
  {
    label: "物流・運送",
    href: "#lp-list",
    image: "/images/industries/transport2.webp",
    alt: "物流・運送のイメージ",
    icon: Truck,
    className: "lg:left-[71%] lg:top-[10px]",
  },
  {
    label: "建設・施工",
    href: "#lp-list",
    image: "/images/industries/construction.webp",
    alt: "建設・施工のイメージ",
    icon: Building2,
    className: "lg:left-[1%] lg:top-[310px]",
  },
  {
    label: "省エネ",
    href: "#lp-list",
    image: "/images/industries/manufacturing2.webp",
    alt: "省エネ・設備改善のイメージ",
    icon: Leaf,
    className: "lg:left-[28%] lg:top-[310px]",
  },
  {
    label: "事業計画",
    href: "#lp-list",
    image: "/api/article-pictures/%E4%BA%8B%E6%A5%AD%E8%A8%88%E7%94%BB/business-meeting-conference-concept.webp",
    alt: "事業計画のイメージ",
    icon: BarChart3,
    className: "lg:left-[55%] lg:top-[310px]",
  },
] as const;

const proofChips = [
  { label: "受付中の制度を整理", icon: CheckSquare },
  { label: "締切前に確認", icon: CalendarCheck },
  { label: "活用例もわかる", icon: BriefcaseBusiness },
  { label: "無料相談へ進める", icon: Headphones },
] as const;

export default function LpPurposeHero({ totalLpCount }: Props) {
  return (
    <section className="relative isolate overflow-hidden bg-[#EDF6FF] pb-12 pt-12 sm:pt-14 lg:min-h-[760px] lg:pb-16 lg:pt-16">
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 88% 24%, rgba(41,151,255,.28), transparent 30%), radial-gradient(circle at 50% 82%, rgba(255,255,255,.92), transparent 38%), linear-gradient(115deg, #ffffff 0%, #eef7ff 35%, #d9f0ff 58%, #72c4ff 78%, #1f7be8 100%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(circle at 22% 24%, rgba(255,255,255,0.95), transparent 26%), radial-gradient(circle at 74% 24%, rgba(255,255,255,0.42), transparent 30%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-55"
        style={{
          backgroundImage:
            "linear-gradient(115deg, transparent 0 25%, rgba(255,255,255,0.7) 25.1%, transparent 25.45% 43%, rgba(255,255,255,0.55) 43.1%, transparent 43.5%), linear-gradient(rgba(255,255,255,0.26) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.22) 1px, transparent 1px)",
          backgroundSize: "100% 100%, 48px 48px, 48px 48px",
        }}
      />
      <div
        aria-hidden
        className="absolute -bottom-28 left-0 h-[260px] w-[66vw] rounded-full bg-white/85 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#F4F7FB] to-transparent"
      />

      <div className="relative z-10 mx-auto grid max-w-[1780px] items-center gap-8 px-5 sm:px-8 lg:grid-cols-[0.43fr_0.57fr] lg:px-16">
        <div className="max-w-[720px] lg:pl-2">
          <span className="inline-flex items-center rounded-full bg-gradient-to-r from-[#0B63CE] to-[#51D6FF] px-7 py-3 text-lg font-black text-white shadow-[0_16px_38px_rgba(11,99,206,.28)]">
            補助金ナビ
          </span>

          <h1 className="mt-9 text-[3.25rem] font-black leading-[1.14] tracking-tight text-[#081C44] sm:text-6xl lg:text-[5.2rem] xl:text-[5.7rem]">
            業種・目的から
            <br />
            <span className="bg-gradient-to-r from-[#0EA5E9] to-[#006FE6] bg-clip-text text-transparent">
              使える補助金
            </span>
            を見つける
          </h1>

          <p className="mt-7 max-w-[660px] text-lg font-bold leading-9 tracking-wide text-[#102C54] sm:text-xl">
            設備投資、IT導入、人材確保、物流改善まで。
            <br className="hidden sm:block" />
            自社に関係する制度を、目的別にわかりやすく整理しています。
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="#consult-cta"
              className="inline-flex h-16 items-center justify-center gap-3 rounded-xl bg-[#075BD8] px-10 text-lg font-black text-white shadow-[0_20px_42px_rgba(7,91,216,.30)] transition hover:-translate-y-0.5 hover:bg-[#044BB8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#075BD8]"
            >
              自社に合う制度を確認する
              <ArrowRight className="h-6 w-6 rounded-full bg-white/18 p-1" />
            </Link>
            <Link
              href="#lp-list"
              className="inline-flex h-16 items-center justify-center gap-3 rounded-xl border-2 border-[#081C44] bg-white/70 px-10 text-lg font-black text-[#081C44] shadow-sm backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#075BD8]"
            >
              目的別に見る
              <ArrowRight className="h-6 w-6 rounded-full bg-[#EEF4FF] p-1 text-[#075BD8]" />
            </Link>
          </div>

          <div className="mt-9 grid grid-cols-2 gap-5 sm:grid-cols-4">
            {proofChips.map((chip) => {
              const Icon = chip.icon;
              return (
                <div
                  key={chip.label}
                  className="flex min-h-[164px] flex-col items-center justify-center gap-4 rounded-2xl border border-white bg-white/86 px-5 py-5 text-center shadow-[0_18px_40px_rgba(10,45,90,.12)] backdrop-blur-md"
                >
                  <Icon className="h-12 w-12 text-[#B78A32]" strokeWidth={1.55} />
                  <span className="text-base font-black leading-snug text-[#0B2F4A]">
                    {chip.label}
                  </span>
                </div>
              );
            })}
          </div>

          <p className="mt-5 text-sm font-bold text-[#2B5578]/80">
            公開中 {totalLpCount}件の制度情報を整理中
          </p>
        </div>

        <div className="relative lg:min-h-[640px]">
          <div
            aria-hidden
            className="absolute -inset-10 rounded-[4rem] bg-sky-300/20 blur-3xl"
          />
          <div className="relative grid grid-cols-2 gap-3 sm:grid-cols-3 lg:block lg:h-[640px] lg:-mr-28 xl:-mr-40">
            {purposeCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.label}
                  href={card.href}
                  className={`group relative h-[132px] overflow-hidden rounded-[22px] border border-sky-200/70 bg-slate-900 shadow-[0_24px_54px_rgba(18,67,122,.28)] ring-1 ring-white/70 transition duration-300 hover:-translate-y-1.5 hover:scale-[1.02] hover:shadow-[0_30px_64px_rgba(14,165,233,.26)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#075BD8] sm:h-[154px] lg:absolute lg:h-[300px] lg:w-[260px] lg:-skew-x-[8deg] xl:h-[300px] xl:w-[285px] ${card.className} ${
                    index === 6 ? "sm:col-start-2 lg:col-start-auto" : ""
                  }`}
                >
                  <div className="absolute inset-0 lg:-mx-7 lg:skew-x-[8deg]">
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
                    className="absolute inset-0 bg-gradient-to-t from-[#04122E]/92 via-[#04122E]/18 to-white/8"
                  />
                  <div
                    aria-hidden
                    className="absolute inset-x-0 bottom-0 h-[72px] bg-[#04122E]/78 backdrop-blur-[2px]"
                  />
                  <div
                    aria-hidden
                    className="absolute inset-x-0 bottom-0 h-px bg-cyan-200/90 shadow-[0_0_24px_rgba(103,232,249,0.95)]"
                  />
                  <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between gap-3 p-5 lg:skew-x-[8deg]">
                    <span className="flex items-center gap-2 text-sm font-black text-white drop-shadow sm:text-lg xl:text-xl">
                      <Icon className="h-6 w-6" strokeWidth={1.7} />
                      {card.label}
                    </span>
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/18 text-white ring-1 ring-white/30 backdrop-blur">
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

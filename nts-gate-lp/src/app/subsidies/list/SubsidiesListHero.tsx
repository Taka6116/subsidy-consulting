import Image from "next/image";
import Link from "next/link";
import { ArrowRight, FileSearch } from "lucide-react";

type SubsidiesListHeroProps = {
  counts: {
    all: number;
    open: number;
    closed: number;
  };
};

function StatusCard({
  counts,
  openRatio,
  className = "",
}: {
  counts: SubsidiesListHeroProps["counts"];
  openRatio: number;
  className?: string;
}) {
  return (
    <div
      className={`w-[292px] rounded-2xl border border-white/90 bg-white/95 p-5 shadow-[0_20px_45px_rgba(35,74,117,0.17)] backdrop-blur-sm ${className}`}
    >
      <div className="flex items-center justify-between border-b border-[#e5edf6] pb-3.5">
        <div className="flex items-center gap-2 text-xs font-bold text-[#2b4c70]">
          <FileSearch className="h-4 w-4 text-[#1a7b6f]" />
          公募状況
        </div>
        <span className="text-[10px] text-[#8091a6]">掲載データ</span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <p className="flex items-center gap-1.5 text-[11px] font-semibold text-[#258467]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#22a57e]" />
            受付中
          </p>
          <p className="mt-1.5 text-[2rem] font-black leading-none tracking-tight text-[#19775f]">
            {counts.open.toLocaleString("ja-JP")}
            <span className="ml-1 text-xs">件</span>
          </p>
        </div>
        <div className="border-l border-[#e7edf4] pl-4">
          <p className="text-[11px] font-semibold text-[#8c6270]">受付終了</p>
          <p className="mt-1.5 text-[2rem] font-black leading-none tracking-tight text-[#a24f60]">
            {counts.closed.toLocaleString("ja-JP")}
            <span className="ml-1 text-xs">件</span>
          </p>
        </div>
      </div>
      <div className="mt-5 flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#e7edf4]">
          <div
            className="h-full rounded-full bg-[#24aa82]"
            style={{ width: `${openRatio}%` }}
          />
        </div>
        <span className="text-[10px] font-bold text-[#6c829b]">{openRatio}%</span>
      </div>
    </div>
  );
}

export default function SubsidiesListHero({
  counts,
}: SubsidiesListHeroProps) {
  const openRatio =
    counts.all > 0 ? Math.min(100, Math.round((counts.open / counts.all) * 100)) : 0;

  return (
    <section
      className="relative isolate overflow-hidden bg-[#eff8ff]"
      aria-labelledby="subsidies-list-title"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_35%,rgba(180,221,252,0.42),transparent_31%),linear-gradient(108deg,#fbfdff_0%,#f4faff_42%,#e4f3ff_100%)]"
        aria-hidden
      />
      {/* デスクトップ: 人物の頭が上端付近・裾が下端に届くサイズで、中央やや右に配置 */}
      <div
        className="pointer-events-none absolute -top-[13%] bottom-0 left-0 right-0 hidden md:block"
        aria-hidden
      >
        <Image
          src="/images/subsidies-list-hero-business-woman-circle.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-contain object-[57%_100%]"
        />
      </div>
      {/* ヒーロー下端はページ背景色へなだらかに繋げて境界線を消す */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-[linear-gradient(180deg,rgba(247,249,252,0)_0%,rgba(247,249,252,0.55)_58%,#f7f9fc_100%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-10 [background-image:radial-gradient(#b2d4ef_1px,transparent_1px)] [background-size:22px_22px] md:hidden"
        aria-hidden
      />

      <div className="relative mx-auto min-h-[430px] max-w-[1720px] px-5 py-9 sm:px-7 md:flex md:min-h-[450px] md:items-center md:px-10 md:py-11 lg:min-h-[475px] lg:px-14">
        <div className="relative z-10 flex max-w-[730px] flex-col justify-center md:w-[52%] lg:w-[49%]">
          <p className="inline-flex w-fit items-center gap-2 rounded-full border border-[#c7dcf1] bg-white/85 px-3.5 py-1.5 text-xs font-bold tracking-wide text-[#1f5da4] shadow-sm">
            <span className="h-2 w-2 rounded-full bg-[#20a37a]" />
            全国の補助金をまとめて検索
          </p>

          <h1
            id="subsidies-list-title"
            className="mt-5 max-w-[660px] font-heading text-[clamp(2rem,4vw,3.55rem)] font-black leading-[1.2] tracking-[-0.035em] text-[#10294a]"
          >
            使える補助金を、
            <br />
            <span className="text-[#1766bd]">迷わず見つける。</span>
          </h1>
          <p className="mt-5 max-w-[580px] text-sm font-medium leading-7 text-[#526882] sm:text-[15px]">
            国・自治体の補助金情報を集約。業種・地域・締切から、
            <br className="hidden sm:block" />
            自社に合う制度をスムーズに探せます。
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href="#subsidy-search"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#075cc8] px-5 text-sm font-bold text-white shadow-[0_12px_24px_rgba(7,92,200,0.23)] transition hover:-translate-y-0.5 hover:bg-[#074fa9]"
            >
              補助金を検索する
              <ArrowRight className="h-4 w-4" />
            </a>
            <Link
              href="/consult"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#a9c4e2] bg-white/90 px-5 text-sm font-bold text-[#18569d] shadow-sm transition hover:-translate-y-0.5 hover:bg-white"
            >
              無料相談する
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <Link
            href="/subsidies/articles"
            className="mt-4 inline-flex w-fit items-center gap-1.5 text-xs font-bold text-[#276db5] transition hover:text-[#0c4e96]"
          >
            最新の解説記事を見る
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* モバイルはコピーの下に写真を独立配置 */}
        <div className="relative -mx-5 mt-8 min-h-[300px] overflow-hidden sm:-mx-7 md:hidden">
          <div className="absolute inset-0">
            <Image
              src="/images/subsidies-list-hero-business-woman.webp"
              alt="補助金活用を検討する事業者"
              fill
              priority
              sizes="100vw"
              className="object-cover object-[67%_42%]"
            />
            <div
              className="absolute inset-0 bg-[linear-gradient(180deg,#eff8ff_0%,rgba(239,248,255,0.08)_24%,rgba(239,248,255,0)_100%)]"
              aria-hidden
            />
          </div>
          <StatusCard
            counts={counts}
            openRatio={openRatio}
            className="absolute bottom-5 left-1/2 -translate-x-1/2"
          />
        </div>

        {/* 参考構図どおり、人物の右側へ独立配置 */}
        <StatusCard
          counts={counts}
          openRatio={openRatio}
          className="absolute right-[clamp(2rem,4vw,5rem)] top-1/2 hidden -translate-y-[42%] md:block"
        />
      </div>
    </section>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpDown,
  Briefcase,
  CalendarDays,
  MapPin,
  MessageCircle,
  Search,
} from "lucide-react";

type Option = { value: string; label: string };

type SubsidiesListHeroProps = {
  prefectureGroups: { label: string; prefectures: string[] }[];
  industryOptions: string[];
  deadlineOptions: Option[];
  sortOptions: Option[];
  prefecture: string;
  industry: string;
  deadline: string;
  sort: string;
  onPrefectureChange: (value: string) => void;
  onIndustryChange: (value: string) => void;
  onDeadlineChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onSearch: () => void;
};

const SELECT_CLASS =
  "w-full appearance-none rounded-lg border border-[#cfdbec] bg-white py-2.5 pl-9 pr-8 text-sm font-semibold text-[#22355a] shadow-sm transition focus:outline-none focus:ring-2 focus:ring-[#1f4dab]/25";

function FieldRow({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="grid grid-cols-[64px_minmax(0,1fr)] items-center gap-2">
      <span className="text-[13px] font-bold text-[#3c4f70]">{label}</span>
      <span className="relative block">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#7b90b4]">
          {icon}
        </span>
        {children}
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#7b90b4]">
          ▼
        </span>
      </span>
    </label>
  );
}

export default function SubsidiesListHero({
  prefectureGroups,
  industryOptions,
  deadlineOptions,
  sortOptions,
  prefecture,
  industry,
  deadline,
  sort,
  onPrefectureChange,
  onIndustryChange,
  onDeadlineChange,
  onSortChange,
  onSearch,
}: SubsidiesListHeroProps) {
  return (
    <section
      className="relative isolate overflow-hidden bg-[#f2f4f6]"
      aria-labelledby="subsidies-list-title"
    >
      {/* デスクトップ: 写真は4:3のままトリミングせず右端に配置（引きの構図） */}
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden md:block" aria-hidden>
        <div className="relative aspect-[4/3] h-full">
          <Image
            src="/images/subsidies-list-hero-consult.webp"
            alt=""
            fill
            priority
            sizes="(min-width: 768px) 820px, 100vw"
            quality={95}
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,#f2f4f6_0%,rgba(242,244,246,0.85)_6%,rgba(242,244,246,0)_22%)]" />
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-[1720px] px-5 pb-9 pt-16 sm:px-7 sm:pt-10 md:px-10 md:pb-11 md:pt-10 lg:px-14">
        <p className="text-[13px] font-bold tracking-wide text-[#33475f]">
          全国の補助金をまとめて検索
        </p>

        <h1
          id="subsidies-list-title"
          className="mt-3 font-heading text-[clamp(1.6rem,3vw,2.6rem)] font-black leading-[1.3] tracking-[-0.01em] text-[#12203a]"
        >
          <span className="text-[#1a6fe0]">使える補助金</span>を、迷わず見つける。
        </h1>

        <p className="mt-3 max-w-[520px] text-sm font-medium leading-7 text-[#43556e]">
          国・自治体の補助金情報を集約。業種・地域・締切から、
          <br className="hidden sm:block" />
          自社に合う制度をスムーズに探せます。
        </p>

        {/* モバイルは写真を独立表示 */}
        <div className="relative -mx-5 mt-5 aspect-[16/9] overflow-hidden sm:-mx-7 md:hidden">
          <Image
            src="/images/subsidies-list-hero-consult.webp"
            alt="補助金の活用について相談する様子"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[center_20%]"
          />
        </div>

        {/* 検索パネル */}
        <div className="mt-6 grid max-w-[760px] gap-5 rounded-2xl border border-[#e2e8f2] bg-white p-5 shadow-[0_18px_45px_rgba(21,52,94,0.14)] sm:p-6 md:mt-7 md:grid-cols-[minmax(0,1.05fr)_minmax(220px,0.85fr)]">
          <div className="grid gap-3">
            <FieldRow label="対象地域" icon={<MapPin className="h-4 w-4" />}>
              <select
                value={prefecture}
                onChange={(e) => onPrefectureChange(e.target.value)}
                className={SELECT_CLASS}
                aria-label="対象地域で絞り込み"
              >
                <option value="">全国すべて</option>
                {prefectureGroups.map((group) => (
                  <optgroup key={group.label} label={group.label}>
                    {group.prefectures.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </FieldRow>

            <FieldRow label="業種" icon={<Briefcase className="h-4 w-4" />}>
              <select
                value={industry}
                onChange={(e) => onIndustryChange(e.target.value)}
                className={SELECT_CLASS}
                aria-label="業種で絞り込み"
              >
                <option value="">すべての業種</option>
                {industryOptions.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
            </FieldRow>

            <FieldRow label="締切" icon={<CalendarDays className="h-4 w-4" />}>
              <select
                value={deadline}
                onChange={(e) => onDeadlineChange(e.target.value)}
                className={SELECT_CLASS}
                aria-label="受付状況で絞り込み"
              >
                {deadlineOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </FieldRow>

            <FieldRow label="並び替え" icon={<ArrowUpDown className="h-4 w-4" />}>
              <select
                value={sort}
                onChange={(e) => onSortChange(e.target.value)}
                className={SELECT_CLASS}
                aria-label="並び替え"
              >
                {sortOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </FieldRow>
          </div>

          <div className="flex flex-col justify-center gap-3 md:border-l md:border-[#e8edf5] md:pl-5">
            <button
              type="button"
              onClick={onSearch}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold text-white shadow-[0_10px_22px_rgba(11,78,162,0.24)] transition hover:-translate-y-0.5 hover:brightness-110 [background:var(--nts-gradient-primary)]"
            >
              <Search className="h-4 w-4" />
              補助金を検索する
              <ArrowRight className="h-4 w-4" />
            </button>
            <Link
              href="/consult"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#b9cdea] bg-white px-5 text-sm font-bold text-[#18569d] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#f6faff]"
            >
              <MessageCircle className="h-4 w-4" />
              無料相談する
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/subsidies/articles"
              className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-[#1d5fe8] transition hover:text-[#0c4e96]"
            >
              最新の解説記事を見る
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

import Image from "next/image";
import { Clock3 } from "lucide-react";
import industryA from "../../../icon-assets/isometric_10.png";
import industryB from "../../../icon-assets/isometric_15.png";
import industryC from "../../../icon-assets/isometric_11.png";
import industryD from "../../../icon-assets/isometric_20.png";
import type { ConstructionElectrificationSubsidy } from "@/lib/subsidy-data/construction-electrification";

const industryImages = [industryA, industryB, industryC, industryD];

const industryDetails: Record<
  string,
  { lead: string; bullets: string[] }
> = {
  建設業: {
    lead: "建設機械の更新や電動化を検討している企業",
    bullets: [
      "老朽化した重機の入れ替えタイミングが近い",
      "燃料費・整備費の上昇を経営課題と感じている",
      "脱炭素・GX対応で取引先評価を高めたい",
    ],
  },
  "リース・レンタル業": {
    lead: "電動建機の導入でサービス競争力を高めたい企業",
    bullets: [
      "環境対応モデルの取扱いを増やし顧客単価を引き上げたい",
      "新ラインアップの初期投資を抑えたい",
      "脱炭素重視の発注先からの引き合いに応えたい",
    ],
  },
  重機保有企業: {
    lead: "燃料費の高騰に悩み、コスト構造を見直したい企業",
    bullets: [
      "燃料費が固定費を圧迫しており、削減余地を探している",
      "稼働効率を高め、人手不足下でも生産性を維持したい",
      "電動化・スマート化を組み合わせた投資を検討したい",
    ],
  },
  "脱炭素・GX推進企業": {
    lead: "環境対応を進め、企業価値を高めたい企業",
    bullets: [
      "Scope1排出量の削減施策として電動化を位置付けたい",
      "サステナビリティ経営方針を具体的な投資につなげたい",
      "補助金を活用し、複数年計画でGX投資を加速させたい",
    ],
  },
};

export default function TargetIndustriesSection({
  data,
}: {
  data: ConstructionElectrificationSubsidy;
}) {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <p className="mb-3 text-center text-xs font-bold tracking-[0.18em] text-[#008894]">
          TARGET COMPANIES
        </p>
        <h2 className="mb-5 text-center text-2xl font-bold text-[#0B173A] md:text-3xl">
          こんな企業におすすめの補助金です
        </h2>
        <p className="mx-auto mb-12 max-w-2xl text-center text-sm leading-relaxed text-gray-500 md:text-base">
          建設機械の電動化は、燃料費削減・脱炭素・人手不足対応・企業価値向上を同時に進められる、数少ない設備投資です。下記いずれかに該当する企業は、本補助金の対象となる可能性が高い領域です。
        </p>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {data.targetIndustries.map((industry, index) => {
            const detail = industryDetails[industry.label];
            return (
              <div
                key={industry.label}
                className="flex h-full flex-col rounded-xl bg-[#F3F6FA] p-5 transition-shadow hover:shadow-md"
              >
                <p className="mb-3 text-xs font-bold tracking-wide text-[#008894]">
                  {industry.label}
                </p>
                <div className="mb-3 flex aspect-[4/3] w-full items-center justify-center">
                  <Image
                    src={industryImages[index % industryImages.length]}
                    alt={industry.label}
                    className="h-28 w-28 object-contain"
                  />
                </div>
                <p className="mb-3 text-sm font-bold leading-snug text-[#0B173A]">
                  {detail?.lead ?? industry.desc}
                </p>
                <ul className="mt-auto space-y-1.5 text-xs leading-relaxed text-gray-600">
                  {(detail?.bullets ?? [industry.desc]).map((line) => (
                    <li key={line} className="flex items-start gap-1.5">
                      <span className="mt-[3px] inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#008894]/70" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
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
                本補助金は予算上限に達し次第、受付終了となります。早めのご相談で採択率も高まります。
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

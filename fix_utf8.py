import os

base = r"C:\Users\goto_\補助金サービスV6\nts-gate-lp\src\components\subsidy-lp"

files = {
    "BeforeAfterSection.tsx": '''import Image from "next/image";
import beforeImage from "../../../icon-assets/isometric_08.png";
import afterImage from "../../../icon-assets/isometric_21.png";
import type { SubsidyLpData } from "@/lib/subsidy-data/types";

export default function BeforeAfterSection({
  data,
}: {
  data: SubsidyLpData;
}) {
  return (
    <section className="bg-[#F3F6FA] py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <h2 className="mb-5 text-center text-2xl font-bold text-[#0B173A] md:text-3xl">
          補助金活用で、こんな未来が実現できます
        </h2>
        <p className="mx-auto mb-12 max-w-2xl text-center text-sm leading-relaxed text-gray-500 md:text-base">
          設備・デジタル化・賃上げへの投資は、補助金を組み合わせることで初期負担を抑えながら次世代の体制づくりが可能になります。
        </p>

        <div className="flex flex-col items-stretch gap-5 md:flex-row md:items-center">
          <div className="flex-1 rounded-xl bg-white/70 p-6 md:p-8">
            <span className="mb-4 inline-block rounded-full bg-gray-400 px-3 py-1 text-xs font-bold text-white">
              Before
            </span>
            <p className="mb-4 text-base font-bold text-[#1f3856]">
              いまの経営課題
            </p>
            <ul className="space-y-3">
              {data.beforeAfter.before.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-sm leading-relaxed text-gray-600"
                >
                  <span className="mt-0.5 flex-shrink-0 text-gray-400">×</span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex h-32 items-end justify-center">
              <Image
                src={beforeImage}
                alt="導入前"
                className="h-full w-auto object-contain opacity-60"
              />
            </div>
          </div>

          <div className="flex flex-shrink-0 items-center justify-center text-3xl font-bold text-[#008894] md:text-4xl">
            <span className="rotate-90 md:rotate-0">&gt;&gt;</span>
          </div>

          <div className="flex-1 rounded-xl bg-white p-6 shadow-md md:p-8">
            <span className="mb-4 inline-block rounded-full bg-[#008894] px-3 py-1 text-xs font-bold text-white">
              After
            </span>
            <p className="mb-4 text-base font-bold text-[#0B173A]">
              補助金活用後の未来
            </p>
            <ul className="space-y-3">
              {data.beforeAfter.after.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-sm font-medium leading-relaxed text-[#0B173A]"
                >
                  <span className="mt-0.5 flex-shrink-0 text-[#008894]">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex h-32 items-end justify-center">
              <Image src={afterImage} alt="導入後" className="h-full w-auto object-contain" />
            </div>
          </div>
        </div>

        <p className="mx-auto mt-10 max-w-3xl text-center text-xs leading-relaxed text-gray-500 md:text-sm">
          上記はあくまで本制度を活用した一般的な改善イメージです。実際の効果は、業種・機材構成・既存の運用体制によって異なります。NTSは現状のヒアリングに基づいて、貴社にとって最適な活用シナリオをご提案します。
        </p>
      </div>
    </section>
  );
}
''',
    "CaseStudiesSection.tsx": '''import Image from "next/image";
import caseImage1 from "../../../icon-assets/isometric_15.png";
import caseImage2 from "../../../icon-assets/isometric_20.png";
import caseImage3 from "../../../icon-assets/isometric_07.png";
import caseImage4 from "../../../icon-assets/isometric_09.png";
import type { SubsidyLpData } from "@/lib/subsidy-data/types";

const caseImages = [caseImage1, caseImage2, caseImage3, caseImage4];

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
              <div className="flex aspect-[5/3] items-center justify-center bg-[#F3F6FA]">
                <Image
                  src={caseImages[index % caseImages.length]}
                  alt={item.industry}
                  className="h-24 w-auto object-contain"
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
''',
    "TargetIndustriesSection.tsx": '''import Image from "next/image";
import { Clock3 } from "lucide-react";
import industryA from "../../../icon-assets/isometric_10.png";
import industryB from "../../../icon-assets/isometric_15.png";
import industryC from "../../../icon-assets/isometric_11.png";
import industryD from "../../../icon-assets/isometric_20.png";
import type { SubsidyLpData } from "@/lib/subsidy-data/types";

const industryImages = [industryA, industryB, industryC, industryD];

export default function TargetIndustriesSection({
  data,
}: {
  data: SubsidyLpData;
}) {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <h2 className="mb-5 text-center text-2xl font-bold text-[#0B173A] md:text-3xl">
          こんな企業におすすめの補助金です
        </h2>
        <p className="mx-auto mb-12 max-w-2xl text-center text-sm leading-relaxed text-gray-500 md:text-base">
          下記いずれかに該当する企業は、本補助金の対象となる可能性が高い領域です。
        </p>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {data.targetIndustries.map((industry, index) => (
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
              <p className="text-sm leading-relaxed text-gray-600">{industry.desc}</p>
            </div>
          ))}
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
''',
    "CheckerSection.tsx": '''"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import type { SubsidyLpData } from "@/lib/subsidy-data/types";

export default function CheckerSection({
  data,
}: {
  data: SubsidyLpData;
}) {
  const [checked, setChecked] = useState<boolean[]>(
    Array(data.targetChecklist.length).fill(false),
  );

  const checkedCount = checked.filter(Boolean).length;
  const isEligible = checkedCount >= 1;

  function toggle(index: number) {
    setChecked((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  }

  return (
    <section id="checker" className="bg-[#F3F6FA] py-14 md:py-16">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-[#0B173A] md:text-3xl">
            あなたの会社は対象ですか？
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-gray-500">
            当てはまる項目にチェックしてください。<br className="hidden sm:inline" />
            <span className="font-semibold text-[#008894]">1つでも当てはまれば</span>、本補助金の対象企業である可能性があります。
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {data.targetChecklist.map((item, i) => (
            <button
              key={item}
              type="button"
              onClick={() => toggle(i)}
              className={[
                "flex items-center gap-3 rounded-xl border-2 px-5 py-4 text-left text-sm font-medium transition-all",
                checked[i]
                  ? "border-[#008894] bg-[#e8faf7] text-[#0B173A] shadow-sm"
                  : "border-[#DCE8F2] bg-white text-gray-700 hover:border-[#008894]/50 hover:bg-[#f5fcfb]",
              ].join(" ")}
            >
              <span
                className={[
                  "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                  checked[i]
                    ? "border-[#008894] bg-[#008894]"
                    : "border-gray-300 bg-white",
                ].join(" ")}
              >
                {checked[i] && (
                  <svg
                    className="h-3.5 w-3.5 text-white"
                    viewBox="0 0 14 14"
                    fill="none"
                  >
                    <path
                      d="M2 7l4 4 6-6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </span>
              <span>{item}</span>
            </button>
          ))}
        </div>

        <div
          className={[
            "mt-8 rounded-2xl px-6 py-5 transition-all md:flex md:items-center md:justify-between md:gap-6",
            checkedCount === 0
              ? "border border-[#DCE8F2] bg-white"
              : isEligible
              ? "border border-[#008894]/30 bg-gradient-to-r from-[#e8faf7] to-[#f0fcfa] shadow-sm"
              : "border border-[#DCE8F2] bg-white",
          ].join(" ")}
        >
          <div className="mb-4 flex items-start gap-3 md:mb-0">
            {checkedCount === 0 ? (
              <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#F3F6FA] text-gray-400">
                <span className="text-lg font-bold">?</span>
              </div>
            ) : (
              <CheckCircle2 className="mt-0.5 h-8 w-8 flex-shrink-0 text-[#008894]" />
            )}
            <div>
              {checkedCount === 0 ? (
                <>
                  <p className="text-sm font-bold text-gray-500">
                    気になる項目にチェックを入れてみてください
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    1つでも当てはまれば、対象となる可能性があります。
                  </p>
                </>
              ) : (
                <>
                  <p className="text-base font-bold text-[#0B173A]">
                    <span className="text-[#008894]">{checkedCount}項目</span>が当てはまっています
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    本補助金の対象企業である可能性があります。まずは無料相談で詳細をご確認ください。
                  </p>
                </>
              )}
            </div>
          </div>
          <a
            href="#contact"
            className={[
              "inline-flex w-full flex-shrink-0 items-center justify-center rounded-xl px-7 py-3.5 text-sm font-bold text-white transition-colors md:w-auto",
              isEligible && checkedCount > 0
                ? "bg-[#FEA00D] hover:bg-[#e8900a]"
                : "bg-[#0B173A] hover:bg-[#162340]",
            ].join(" ")}
          >
            無料相談を予約する →
          </a>
        </div>
      </div>
    </section>
  );
}
''',
    "FlowSection.tsx": '''import {
  BadgeCheck,
  FileCheck2,
  Globe2,
  MessageSquareMore,
  ShieldCheck,
} from "lucide-react";
import type { SubsidyLpData } from "@/lib/subsidy-data/types";

export default function FlowSection({
  data,
}: {
  data: SubsidyLpData;
}) {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <h2 className="mb-12 text-center text-2xl font-bold text-[#0B173A] md:text-3xl">
          ご相談から採択・受給までの流れ
        </h2>

        <div className="mb-12 grid grid-cols-1 gap-4 md:grid-cols-5">
          {data.flow.map((step, index) => (
            <div
              key={step.step}
              className="relative rounded-xl bg-[#F3F6FA] p-4 text-center md:p-5"
            >
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#0B173A]">
                <span className="text-xs font-bold text-white">{step.step}</span>
              </div>
              <p className="mb-1 text-sm font-bold text-[#0B173A]">{step.title}</p>
              <p className="text-xs leading-relaxed text-gray-500">{step.desc}</p>
              {index < data.flow.length - 1 && (
                <span className="absolute -right-3 top-1/2 hidden -translate-y-1/2 text-xl font-bold text-gray-300 md:block">
                  ›
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-8 md:grid-cols-4">
          {[
            { label: "相談無料", Icon: MessageSquareMore },
            { label: "全国対応", Icon: Globe2 },
            { label: "採択率を高めるサポート", Icon: BadgeCheck },
            { label: "申請後も伴走支援", Icon: FileCheck2 },
          ].map(({ label, Icon }) => (
            <div key={label} className="flex items-center justify-center gap-2">
              <Icon className="h-5 w-5 text-[#008894]" />
              <span className="text-sm text-gray-600">{label}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500">
          <ShieldCheck className="h-4 w-4 text-[#008894]" />
          専門チームが要件確認から受給完了まで段階ごとに伴走します。
        </div>
      </div>
    </section>
  );
}
''',
}

for filename, content in files.items():
    filepath = os.path.join(base, filename)
    with open(filepath, 'wb') as f:
        f.write(content.encode('utf-8'))
    # verify
    with open(filepath, 'rb') as f:
        data = f.read()
    try:
        data.decode('utf-8')
        print(f"OK: {filename} ({len(data)} bytes)")
    except UnicodeDecodeError as e:
        print(f"ERROR: {filename} - {e}")

print("Done")

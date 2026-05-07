import Image from "next/image";
import beforeImage from "../../../icon-assets/isometric_08.png";
import afterImage from "../../../icon-assets/isometric_21.png";
import type { ConstructionElectrificationSubsidy } from "@/lib/subsidy-data/construction-electrification";

const afterPoints = [
  "ランニングコストの削減で利益率が改善",
  "最新機種の導入で稼働率と作業効率が向上",
  "省人化機能で人手不足の影響を最小化",
  "脱炭素対応で取引先評価と企業価値が向上",
];

export default function BeforeAfterSection({
  data,
}: {
  data: ConstructionElectrificationSubsidy;
}) {
  return (
    <section className="bg-[#F3F6FA] py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <p className="mb-3 text-center text-xs font-bold tracking-[0.18em] text-[#008894]">
          BEFORE / AFTER
        </p>
        <h2 className="mb-5 text-center text-2xl font-bold text-[#0B173A] md:text-3xl">
          補助金活用で、こんな未来が実現できます
        </h2>
        <p className="mx-auto mb-12 max-w-2xl text-center text-sm leading-relaxed text-gray-500 md:text-base">
          建設機械の電動化は、単なる環境対応ではなく、燃料費・整備費・稼働率・人材確保といった経営課題を一度に前進させる投資です。補助金を組み合わせることで、初期負担を抑えながら次世代の体制づくりが可能になります。
        </p>

        <div className="flex flex-col items-stretch gap-5 md:flex-row md:items-center">
          <div className="flex-1 rounded-xl bg-white/70 p-6 md:p-8">
            <span className="mb-4 inline-block rounded-full bg-gray-400 px-3 py-1 text-xs font-bold text-white">
              Before
            </span>
            <p className="mb-4 text-base font-bold text-[#1f3856]">
              いまの建設業界が抱える共通の悩み
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
              補助金 × 電動化で、経営の未来が変わる
            </p>
            <ul className="space-y-3">
              {afterPoints.map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-2 text-sm font-medium leading-relaxed text-[#0B173A]"
                >
                  <span className="mt-0.5 flex-shrink-0 text-[#008894]">✓</span>
                  {point}
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

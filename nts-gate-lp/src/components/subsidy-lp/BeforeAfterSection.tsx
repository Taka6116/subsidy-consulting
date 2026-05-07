import Image from "next/image";
import beforeImage from "../../../icon-assets/isometric_08.png";
import afterImage from "../../../icon-assets/isometric_21.png";
import type { ConstructionElectrificationSubsidy } from "@/lib/subsidy-data/construction-electrification";

export default function BeforeAfterSection({
  data,
}: {
  data: ConstructionElectrificationSubsidy;
}) {
  return (
    <section className="bg-[#F3F6FA] py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <h2 className="mb-12 text-center text-2xl font-bold text-[#0B173A] md:text-3xl">
          補助金活用で、こんな未来が実現できます
        </h2>
        <div className="flex flex-col items-center gap-4 md:flex-row">
          <div className="flex-1 rounded-xl bg-white/60 p-6 md:p-8">
            <span className="mb-4 inline-block rounded-full bg-gray-400 px-3 py-1 text-xs font-bold text-white">
              Before
            </span>
            <ul className="space-y-3">
              {data.beforeAfter.before.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
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

          <div className="flex-shrink-0 text-4xl font-bold text-[#008894]">&gt;&gt;</div>

          <div className="flex-1 rounded-xl bg-white p-6 shadow-md md:p-8">
            <span className="mb-4 inline-block rounded-full bg-[#008894] px-3 py-1 text-xs font-bold text-white">
              After
            </span>
            <ul className="space-y-3">
              {data.beforeAfter.after.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-sm font-medium text-[#0B173A]"
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
      </div>
    </section>
  );
}

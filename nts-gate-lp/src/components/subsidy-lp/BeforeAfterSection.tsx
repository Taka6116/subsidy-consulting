import Image from "next/image";
import beforeImage from "../../../icon-assets/isometric_08.png";
import afterImage from "../../../icon-assets/isometric_21.png";
import type { SubsidyLpData } from "@/lib/subsidy-data/types";

const afterPoints = [
  "??????????????????",
  "???????????????????",
  "?????????????????",
  "???????????????????",
];

export default function BeforeAfterSection({
  data,
}: {
  data: SubsidyLpData;
}) {
  return (
    <section className="bg-[#F3F6FA] py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <h2 className="mb-5 text-center text-2xl font-bold text-[#0B173A] md:text-3xl">
          ???????????????????
        </h2>
        <p className="mx-auto mb-12 max-w-2xl text-center text-sm leading-relaxed text-gray-500 md:text-base">
          ???????????????????????????????????????????????????????????
        </p>

        <div className="flex flex-col items-stretch gap-5 md:flex-row md:items-center">
          <div className="flex-1 rounded-xl bg-white/70 p-6 md:p-8">
            <span className="mb-4 inline-block rounded-full bg-gray-400 px-3 py-1 text-xs font-bold text-white">
              Before
            </span>
            <p className="mb-4 text-base font-bold text-[#1f3856]">
              ???????
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
                alt="???"
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
              ?????????
            </p>
            <ul className="space-y-3">
              {data.beforeAfter.after.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-sm font-medium leading-relaxed text-[#0B173A]"
                >
                  <span className="mt-0.5 flex-shrink-0 text-[#008894]">?</span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex h-32 items-end justify-center">
              <Image src={afterImage} alt="???" className="h-full w-auto object-contain" />
            </div>
          </div>
        </div>

        <p className="mx-auto mt-10 max-w-3xl text-center text-xs leading-relaxed text-gray-500 md:text-sm">
          ????????????????????????????????????????????????????????????NTS??????????????????????????????????????
        </p>
      </div>
    </section>
  );
}

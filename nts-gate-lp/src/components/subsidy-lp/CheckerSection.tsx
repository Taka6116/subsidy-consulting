"use client";

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
            ?????????????
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-gray-500">
            ???????????????????<br className="hidden sm:inline" />
            <span className="font-semibold text-[#008894]">1?????????</span>??????????????????????
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

        {/* ????? */}
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
                    ?????????????????????
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    1????????????????????????
                  </p>
                </>
              ) : (
                <>
                  <p className="text-base font-bold text-[#0B173A]">
                    <span className="text-[#008894]">{checkedCount}??</span>??????????
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    ????????????????????????????????????????
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
            ????????? ?
          </a>
        </div>
      </div>
    </section>
  );
}

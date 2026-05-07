import {
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
          ???????????????
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
                  ?
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-8 md:grid-cols-4">
          {[
            { label: "????", Icon: MessageSquareMore },
            { label: "????", Icon: Globe2 },
            { label: "???????????", Icon: BadgeCheck },
            { label: "????????", Icon: FileCheck2 },
          ].map(({ label, Icon }) => (
            <div key={label} className="flex items-center justify-center gap-2">
              <Icon className="h-5 w-5 text-[#008894]" />
              <span className="text-sm text-gray-600">{label}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500">
          <ShieldCheck className="h-4 w-4 text-[#008894]" />
          ?????????????????????????????
        </div>
      </div>
    </section>
  );
}

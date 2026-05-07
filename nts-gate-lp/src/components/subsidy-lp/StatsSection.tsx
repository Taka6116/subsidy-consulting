import { BarChart3, BriefcaseBusiness, Handshake, Wallet } from "lucide-react";
import type { ConstructionElectrificationSubsidy } from "@/lib/subsidy-data/construction-electrification";

const statIcons = [Wallet, BarChart3, BriefcaseBusiness, Handshake];

export default function StatsSection({
  data,
}: {
  data: ConstructionElectrificationSubsidy;
}) {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <p className="mb-8 text-center text-sm text-gray-500">
          安心してご利用いただける理由
        </p>
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {data.stats.map((stat, index) => {
            const Icon = statIcons[index % statIcons.length];
            return (
              <div key={stat.label} className="text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center text-[#008894]">
                  <Icon className="h-8 w-8" />
                </div>
                <p className="text-2xl font-bold text-[#0B173A] md:text-3xl">
                  {stat.value}
                  {stat.suffix ? (
                    <span className="ml-1 text-sm font-normal text-gray-500">
                      {stat.suffix}
                    </span>
                  ) : null}
                </p>
                <p className="mt-1 text-xs text-gray-500">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

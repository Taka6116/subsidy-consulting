import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import Header from "@/components/shared/Header";
import LpFooter from "@/components/gate-lp/LpFooter";
import SubsidiesGalaxyBackdrop from "../SubsidiesGalaxyBackdrop";

export const metadata: Metadata = {
  title: "補助金一覧 | 日本提携支援",
  description: "補助金制度の一覧・検索をご案内します。公募要領での最終確認をお願いします。",
};

type SubsidyCard = {
  id: string;
  name: string | null;
  description: string | null;
  maxAmountLabel: string | null;
  deadlineLabel: string | null;
  deadline: string | null;
  targetIndustries: string[];
  status: string;
  source: string;
  updatedAt: string;
};

type SubsidiesResponse = {
  grants: SubsidyCard[];
  total: number;
  limit: number;
  offset: number;
};

function isDeadlineSoon(deadline: string | null): boolean {
  if (!deadline) return false;
  const date = new Date(deadline);
  if (Number.isNaN(date.getTime())) return false;
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= 30;
}

async function fetchSubsidies(): Promise<SubsidiesResponse> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3001";
  const protocol = h.get("x-forwarded-proto") ?? "http";
  const baseUrl = `${protocol}://${host}`;

  const res = await fetch(`${baseUrl}/api/subsidies?limit=20`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch subsidies: ${res.status}`);
  }
  return (await res.json()) as SubsidiesResponse;
}

export default async function SubsidiesListPage() {
  const data = await fetchSubsidies();

  return (
    <>
      <Header />
      <main className="relative z-[2] min-h-[100svh] font-body">
        <SubsidiesGalaxyBackdrop />
        <div className="relative z-10 mx-auto max-w-7xl px-6 py-24">
          <div className="rounded-2xl border border-white/20 bg-white/90 p-8 shadow-sm backdrop-blur-sm md:p-10">
            <h1 className="font-heading text-3xl font-normal text-[#2a2926] sm:text-4xl">
              公募中の補助金一覧
            </h1>
            <p className="mt-4 text-neutral-700">
              {data.total}件の補助金が公募中です
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {["すべて", "NTS取扱", "設備投資", "IT・デジタル", "事業承継"].map((label) => (
                <button
                  key={label}
                  type="button"
                  className="rounded-full border border-[#d6d3cd] bg-white px-4 py-2 text-sm text-[#4a4946] transition hover:bg-[#f7f6f3]"
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {data.grants.map((grant) => (
                <Link
                  key={grant.id}
                  href={`/subsidies/list/${grant.id}`}
                  className="group rounded-2xl border border-[#e4e1da] bg-white p-6 shadow-sm transition hover:border-[#d7b785] hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="line-clamp-2 text-lg font-semibold leading-snug text-[#2f2e2b]">
                      {grant.name ?? "名称未設定"}
                    </h2>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      {grant.source === "manual" && (
                        <span className="rounded-full bg-[#1A7B6F]/10 px-2.5 py-1 text-xs font-medium text-[#1A7B6F]">
                          NTS取扱
                        </span>
                      )}
                      {isDeadlineSoon(grant.deadline) && (
                        <span className="rounded-full bg-[#c94834]/10 px-2.5 py-1 text-xs font-medium text-[#c94834]">
                          締切迫る
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-[#615f5a]">
                    {grant.description ?? "制度概要は準備中です。"}
                  </p>

                  <dl className="mt-5 space-y-2 text-sm">
                    <div className="flex items-start justify-between gap-3">
                      <dt className="text-[#77746d]">上限金額</dt>
                      <dd className="text-right font-medium text-[#2f2e2b]">
                        {grant.maxAmountLabel ?? "-"}
                      </dd>
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <dt className="text-[#77746d]">締切</dt>
                      <dd className="text-right font-medium text-[#2f2e2b]">
                        {grant.deadlineLabel ?? "-"}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {(grant.targetIndustries ?? []).slice(0, 3).map((industry) => (
                      <span
                        key={`${grant.id}-${industry}`}
                        className="rounded-full bg-[#f4f2ee] px-2.5 py-1 text-xs text-[#5f5c55]"
                      >
                        {industry}
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
      <LpFooter />
    </>
  );
}

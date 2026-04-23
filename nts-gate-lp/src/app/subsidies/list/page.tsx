import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import Header from "@/components/shared/Header";
import LpFooter from "@/components/gate-lp/LpFooter";
import SubsidiesGalaxyBackdrop from "../SubsidiesGalaxyBackdrop";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "補助金一覧 | 日本提携支援",
  description: "補助金制度の一覧・検索をご案内します。公募要領での最終確認をお願いします。",
};

type SubsidyCard = {
  id: string;
  name: string | null;
  description: string | null;
  maxAmountLabel: string | null;
  rawPayload?: { subsidy_max_limit?: number | string } | null;
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

/** 2050年より先の日付は jGrants のデータ不備とみなす */
const DEADLINE_MAX = new Date("2050-01-01");

function parseDeadlineDate(deadline: string | null): Date | null {
  if (!deadline) return null;
  const date = new Date(deadline);
  if (Number.isNaN(date.getTime())) return null;
  if (date > DEADLINE_MAX) return null; // 2124年など異常値を除外
  return date;
}

function isDeadlineSoon(deadline: string | null): boolean {
  const date = parseDeadlineDate(deadline);
  if (!date) return false;
  const diffDays = (date.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= 30;
}

function isExpiredDeadline(deadline: string | null): boolean {
  const date = parseDeadlineDate(deadline);
  if (!date) return false;
  return date < new Date();
}

function formatDeadlineLabel(grant: SubsidyCard): string {
  const raw = grant.deadlineLabel ?? grant.deadline;
  if (!raw) return "公募中";
  const date = parseDeadlineDate(raw);
  if (!date) return "公募中"; // 異常値（2124年など）は「公募中」と表示
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

function formatAmountLabel(grant: SubsidyCard): string {
  const current = grant.maxAmountLabel?.trim() ?? "";
  if (/^最大\s*[\d,]+\s*円$/.test(current)) return current.replace(/\s+/g, "");

  const candidate = Number(grant.rawPayload?.subsidy_max_limit ?? 0);
  if (!Number.isFinite(candidate) || candidate <= 0) return "-";
  return `最大 ${candidate.toLocaleString("ja-JP")} 円`;
}

async function fetchSubsidies(page: number): Promise<SubsidiesResponse> {
  const limit = 20;
  const offset = Math.max(0, page - 1) * limit;
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3001";
  const protocol = h.get("x-forwarded-proto") ?? "http";
  const baseUrl = `${protocol}://${host}`;

  const res = await fetch(`${baseUrl}/api/subsidies?limit=${limit}&offset=${offset}`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) {
    return { grants: [], total: 0, limit, offset };
  }
  return (await res.json()) as SubsidiesResponse;
}

export default async function SubsidiesListPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const currentPage = Math.max(1, Number(params.page ?? "1") || 1);
  const data = await fetchSubsidies(currentPage);
  const totalPages = Math.max(1, Math.ceil(data.total / Math.max(1, data.limit)));
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

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
                (() => {
                  const isExpired = isExpiredDeadline(grant.deadline);
                  const isExpiringSoon = isDeadlineSoon(grant.deadline);
                  return (
                    <Link
                      key={grant.id}
                      href={`/subsidies/list/${grant.id}`}
                      aria-disabled={isExpired}
                      tabIndex={isExpired ? -1 : 0}
                      className={`group rounded-2xl border border-[#e4e1da] bg-white p-6 shadow-sm transition hover:border-[#d7b785] hover:shadow-md ${
                        isExpired ? "pointer-events-none opacity-50 grayscale" : ""
                      }`}
                    >
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="line-clamp-2 text-lg font-semibold leading-snug text-[#2f2e2b]">
                      {grant.name ?? "名称未設定"}
                    </h2>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      {isExpired ? (
                        <span className="rounded-full bg-gray-200 px-2.5 py-1 text-xs font-medium text-gray-700">
                          締切済み
                        </span>
                      ) : null}
                      {grant.source === "manual" && (
                        <span className="rounded-full bg-[#1A7B6F]/10 px-2.5 py-1 text-xs font-medium text-[#1A7B6F]">
                          NTS取扱
                        </span>
                      )}
                      {isExpiringSoon && !isExpired && (
                        <span className="rounded-full bg-[#c94834]/10 px-2.5 py-1 text-xs font-medium text-[#c94834]">
                          締切迫る
                        </span>
                      )}
                    </div>
                  </div>

                  <dl className="mt-5 space-y-2 text-sm">
                    <div className="flex items-start justify-between gap-3">
                      <dt className="text-[#77746d]">上限金額</dt>
                      <dd className="text-right font-medium text-[#2f2e2b]">
                        {formatAmountLabel(grant)}
                      </dd>
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <dt className="text-[#77746d]">締切</dt>
                      <dd className="text-right font-medium text-[#2f2e2b]">
                        {formatDeadlineLabel(grant)}
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
                  );
                })()
              ))}
            </div>

            {data.grants.length === 0 && (
              <p className="mt-8 text-sm text-[#6a6760]">
                補助金データを読み込み中です。しばらくしてから再度お試しください。
              </p>
            )}

            {data.grants.length > 0 && (
              <div className="mt-10 flex items-center justify-center gap-3">
                {hasPrev && (
                  <Link
                    href={`/subsidies/list?page=${currentPage - 1}`}
                    className="rounded border border-[#d6d3cd] bg-white px-4 py-2 text-sm text-[#4a4946] transition hover:bg-[#f7f6f3]"
                  >
                    前の20件
                  </Link>
                )}
                <span className="text-sm text-[#6a6760]">
                  {currentPage} / {totalPages} ページ
                </span>
                {hasNext && (
                  <Link
                    href={`/subsidies/list?page=${currentPage + 1}`}
                    className="rounded border border-[#d6d3cd] bg-white px-4 py-2 text-sm text-[#4a4946] transition hover:bg-[#f7f6f3]"
                  >
                    さらに読み込む
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      <LpFooter />
    </>
  );
}

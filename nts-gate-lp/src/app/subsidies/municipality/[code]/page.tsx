import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/shared/Header";
import LpFooter from "@/components/gate-lp/LpFooter";
import { prisma } from "@/lib/db/prisma";

type MunicipalityPageProps = {
  params: Promise<{ code: string }>;
};

function formatDateTimeJP(value: Date | null): string {
  if (!value) return "未実行";
  return `${value.toLocaleDateString("ja-JP")} ${value.toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

export async function generateMetadata({ params }: MunicipalityPageProps): Promise<Metadata> {
  const { code } = await params;
  const municipality = await prisma.municipality.findUnique({
    where: { code },
    select: { name: true },
  });
  return {
    title: municipality ? `${municipality.name}の補助金一覧 | 日本提携支援` : "自治体別補助金一覧 | 日本提携支援",
    description: "自治体別の補助金情報を一覧表示します。",
  };
}

export default async function MunicipalitySubsidiesPage({ params }: MunicipalityPageProps) {
  const { code } = await params;
  const municipality = await prisma.municipality.findUnique({
    where: { code },
    select: {
      code: true,
      name: true,
      officialUrl: true,
      subsidyPageUrl: true,
      lastCrawledAt: true,
      crawlStatus: true,
      prefectureName: true,
    },
  });

  const grants = await prisma.subsidyGrant.findMany({
    where: {
      municipalityCode: code,
      status: "open",
    },
    orderBy: { updatedAt: "desc" },
    take: 100,
    select: {
      id: true,
      name: true,
      description: true,
      maxAmountLabel: true,
      deadlineLabel: true,
      officialPageUrl: true,
      fetchedAt: true,
      updatedAt: true,
    },
  });

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#f7f9fc] pb-20 pt-24 font-body">
        <div className="mx-auto w-full max-w-6xl px-6">
          <Link href="/subsidies/list?page=1" className="text-sm text-[#6b7280] hover:text-[#1f2937]">
            ← 補助金一覧に戻る
          </Link>

          {!municipality ? (
            <section className="mt-6 rounded-2xl border border-[#dbe4f0] bg-white p-8 shadow-sm">
              <h1 className="text-2xl font-bold text-[#0f172a]">自治体が見つかりません</h1>
              <p className="mt-3 text-sm text-[#475569]">指定された自治体コード（{code}）は存在しません。</p>
            </section>
          ) : (
            <>
              <section className="mt-6 rounded-2xl border border-[#dbe4f0] bg-white p-8 shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[#eef6ff] px-3 py-1 text-xs font-semibold text-[#1d4ed8]">
                    {municipality.prefectureName}
                  </span>
                  <span className="rounded-full bg-[#f8fafc] px-3 py-1 text-xs font-medium text-[#475569]">
                    自治体コード: {municipality.code}
                  </span>
                  <span className="rounded-full bg-[#f8fafc] px-3 py-1 text-xs font-medium text-[#475569]">
                    クロール: {municipality.crawlStatus}
                  </span>
                  <span className="rounded-full bg-[#f8fafc] px-3 py-1 text-xs font-medium text-[#475569]">
                    最終クロール: {formatDateTimeJP(municipality.lastCrawledAt)}
                  </span>
                </div>

                <h1 className="mt-4 text-3xl font-bold text-[#0f172a]">{municipality.name}の補助金一覧</h1>
                <p className="mt-2 text-sm text-[#475569]">
                  この自治体に紐づく公募中の補助金を表示しています。
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {municipality.officialUrl ? (
                    <Link
                      href={municipality.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center rounded-full border border-[#dbe4f0] px-4 py-2 text-sm font-medium text-[#0f172a] hover:bg-[#f8fafc]"
                    >
                      自治体公式サイト ↗
                    </Link>
                  ) : null}
                  {municipality.subsidyPageUrl ? (
                    <Link
                      href={municipality.subsidyPageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center rounded-full bg-[#1d4ed8] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1e40af]"
                    >
                      補助金ページ ↗
                    </Link>
                  ) : null}
                </div>
              </section>

              <section className="mt-6 space-y-3">
                {grants.length === 0 ? (
                  <div className="rounded-2xl border border-[#dbe4f0] bg-white p-6 text-sm text-[#475569] shadow-sm">
                    現在、公募中の補助金は見つかっていません。
                  </div>
                ) : (
                  grants.map((grant) => (
                    <article key={grant.id} className="rounded-2xl border border-[#dbe4f0] bg-white p-6 shadow-sm">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#64748b]">
                        <span>取得: {formatDateTimeJP(grant.fetchedAt ?? null)}</span>
                        <span>更新: {grant.updatedAt.toLocaleDateString("ja-JP")}</span>
                      </div>
                      <h2 className="mt-2 text-lg font-semibold text-[#0f172a]">
                        <Link href={`/subsidies/list/${grant.id}`} className="hover:underline">
                          {grant.name ?? "名称未設定"}
                        </Link>
                      </h2>
                      <p className="mt-2 text-sm text-[#475569] line-clamp-3">
                        {grant.description ?? "概要は準備中です。"}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                        {grant.maxAmountLabel ? (
                          <span className="rounded-full bg-[#eef6ff] px-2.5 py-1 text-[#1d4ed8]">
                            {grant.maxAmountLabel}
                          </span>
                        ) : null}
                        {grant.deadlineLabel ? (
                          <span className="rounded-full bg-[#fff7ed] px-2.5 py-1 text-[#c2410c]">
                            期限: {grant.deadlineLabel}
                          </span>
                        ) : null}
                        {grant.officialPageUrl ? (
                          <Link
                            href={grant.officialPageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-full border border-[#dbe4f0] px-2.5 py-1 text-[#334155] hover:bg-[#f8fafc]"
                          >
                            公式 ↗
                          </Link>
                        ) : null}
                      </div>
                    </article>
                  ))
                )}
              </section>
            </>
          )}
        </div>
      </main>
      <LpFooter />
    </>
  );
}

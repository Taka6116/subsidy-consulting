import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/shared/Header";
import LpFooter from "@/components/gate-lp/LpFooter";
import { prisma } from "@/lib/db/prisma";

export const metadata: Metadata = {
  title: "補助金別アクションガイド | 日本提携支援",
  description:
    "制度ごとに、対象企業のイメージ・申請の流れ・相談前に確認すべきポイントを1ページで整理。あなたの会社が使える補助金を最短で見つけられます。",
};

export const revalidate = 300;

const DEADLINE_MAX = new Date("2050-01-01");

function formatPublishedAt(date: Date | null): string {
  if (!date) return "";
  return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
}

function formatDeadlineLabel(
  deadlineLabel: string | null | undefined,
  deadline: Date | null | undefined,
): string | null {
  const candidates = [
    deadline instanceof Date ? deadline : null,
    deadlineLabel ? new Date(deadlineLabel) : null,
  ];

  for (const d of candidates) {
    if (d && !Number.isNaN(d.getTime()) && d < DEADLINE_MAX) {
      return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
    }
  }
  return null;
}

function formatMaxAmount(
  label: string | null | undefined,
  amountYen: bigint | null | undefined,
): string | null {
  const raw = label?.trim();
  if (raw) return raw.startsWith("最大") ? raw : `最大 ${raw}`;
  if (amountYen == null) return null;

  const yen = Number(amountYen);
  if (!Number.isFinite(yen) || yen <= 0) return null;
  const man = yen / 10000;
  if (man >= 10000) {
    const oku = man / 10000;
    return `最大 ${oku.toFixed(oku >= 10 ? 0 : 1)}億円`;
  }
  return `最大 ${Math.round(man).toLocaleString("ja-JP")}万円`;
}

function parseHeroCopy(body: string | null): string | null {
  if (!body) return null;
  try {
    const parsed = JSON.parse(body) as { heroCopy?: unknown };
    return typeof parsed.heroCopy === "string" && parsed.heroCopy.trim()
      ? parsed.heroCopy.trim()
      : null;
  } catch {
    return null;
  }
}

export default async function SubsidiesLpIndexPage() {
  const rows = await prisma.generatedContent.findMany({
    where: {
      contentType: "lp",
      status: "published",
    },
    orderBy: { publishedAt: "desc" },
    take: 60,
    include: {
      grant: {
        select: {
          id: true,
          name: true,
          maxAmountLabel: true,
          subsidyAmount: true,
          deadlineLabel: true,
          deadline: true,
          prefecture: true,
          targetIndustries: true,
        },
      },
    },
  });

  return (
    <>
      <Header />
      <main className="min-h-[100svh] bg-[#eef4f9] pt-16 font-body sm:pt-20">
        <section className="relative isolate overflow-hidden bg-[#071525] text-white">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_80%_20%,rgba(30,155,219,0.32),transparent_34%),linear-gradient(135deg,#071525_0%,#0e2c47_55%,#133d59_100%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-24 top-0 -z-10 h-full w-[36%] skew-x-[-13deg] bg-[#1e9bdb]/20"
          />
          <div className="mx-auto max-w-7xl px-6 py-16 lg:py-20">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#7DD3FC]">
              Action Guide Library
            </p>
            <div className="mt-4 max-w-3xl">
              <h1 className="font-heading text-[clamp(34px,5vw,58px)] font-black leading-tight tracking-[-0.03em] text-white">
                補助金別アクションガイド
              </h1>
              <p className="mt-5 text-base font-medium leading-8 text-white/80 sm:text-lg">
                制度ごとに、対象企業のイメージ・申請の流れ・相談前に確認すべきポイントを1ページで整理。<br className="hidden sm:inline" />
                あなたの会社が使える補助金を最短で見つけられます。
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white ring-1 ring-white/20">
                公開中 {rows.length}件
              </span>
              <span className="rounded-full bg-white/8 px-3 py-1 text-xs font-bold text-white ring-1 ring-white/15">
                相談導線つき
              </span>
              <span className="rounded-full bg-white/8 px-3 py-1 text-xs font-bold text-white ring-1 ring-white/15">
                自動生成・随時追加
              </span>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-12 lg:py-16">
          {rows.length === 0 ? (
            <div className="rounded-[16px] border border-white/10 bg-[rgba(15,24,42,0.6)] p-8 text-center shadow-[0_4px_16px_rgba(0,0,0,0.25)]">
              <p className="text-sm text-white/70">
                現在公開中の活用ガイドはありません。補助金データの取り込み後、順次追加されます。
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {rows.map((row) => {
                const grant = row.grant;
                const heroCopy =
                  parseHeroCopy(row.body) ??
                  "この補助金を、自社の投資判断に活かすためのガイドです。";
                const amountLabel = formatMaxAmount(
                  grant.maxAmountLabel,
                  grant.subsidyAmount,
                );
                const deadlineLabel = formatDeadlineLabel(
                  grant.deadlineLabel,
                  grant.deadline,
                );
                const publishedAt = formatPublishedAt(row.publishedAt);

                return (
                  <Link
                    key={row.id}
                    href={`/subsidies/lp/${grant.id}`}
                    aria-label={`${grant.name ?? "補助金活用ガイド"} のガイドを見る`}
                    className={[
                      "group flex min-h-[300px] flex-col overflow-hidden",
                      "rounded-[16px] border border-white/[0.08]",
                      "bg-[rgba(15,24,42,0.6)]",
                      "shadow-[0_4px_16px_rgba(0,0,0,0.25)]",
                      "motion-safe:transition motion-safe:duration-[240ms] motion-safe:ease-out",
                      "hover:-translate-y-0.5 hover:border-white/[0.18] hover:shadow-[0_8px_24px_rgba(0,0,0,0.35)]",
                      "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7DD3FC]",
                    ].join(" ")}
                  >
                    {/* カードヘッダー */}
                    <div className="relative overflow-hidden px-6 pt-6 pb-4">
                      <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-[#7DD3FC]/10" aria-hidden />
                      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[rgba(125,211,252,0.9)]">
                        Action Guide
                      </p>
                      <h2 className="relative mt-2 line-clamp-2 text-lg font-bold leading-[1.4] text-white sm:text-[20px]">
                        {grant.name ?? row.title ?? "補助金活用ガイド"}
                      </h2>
                    </div>

                    {/* カードボディ */}
                    <div className="flex flex-1 flex-col px-6 pb-6">
                      <p className="line-clamp-3 text-sm font-normal leading-[1.7] text-white/70">
                        {heroCopy}
                      </p>

                      {/* KPIミニカード */}
                      <dl className="mt-4 grid grid-cols-2 gap-2">
                        <div className="rounded-[10px] bg-white/[0.04] p-3">
                          <dt className="text-[11px] font-medium uppercase text-white/50">補助上限</dt>
                          <dd className="mt-1 text-sm font-semibold text-white">
                            {amountLabel ?? "要確認"}
                          </dd>
                        </div>
                        <div className="rounded-[10px] bg-white/[0.04] p-3">
                          <dt className="text-[11px] font-medium uppercase text-white/50">公募期限</dt>
                          <dd className="mt-1 text-sm font-semibold text-white">
                            {deadlineLabel ?? "要確認"}
                          </dd>
                        </div>
                      </dl>

                      {/* フッター行 */}
                      <div className="mt-auto pt-5 flex items-end justify-between gap-3">
                        <span className="text-sm font-semibold text-[#7DD3FC] underline-offset-4 group-hover:underline">
                          ガイドを見る{" "}
                          <span
                            className="inline-block motion-safe:transition motion-safe:duration-200 group-hover:translate-x-1"
                            aria-hidden
                          >→</span>
                        </span>
                        {publishedAt && (
                          <span className="shrink-0 text-[11px] text-white/40">{publishedAt}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </main>
      <LpFooter />
    </>
  );
}

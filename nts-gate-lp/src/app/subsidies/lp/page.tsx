import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/shared/Header";
import LpFooter from "@/components/gate-lp/LpFooter";
import { prisma } from "@/lib/db/prisma";

export const metadata: Metadata = {
  title: "補助金活用ガイド | 日本提携支援",
  description:
    "補助金ごとの対象課題・活用イメージ・申請の流れをLP形式でわかりやすく整理した活用ガイド集です。",
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
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-200">
              Action Guide Library
            </p>
            <div className="mt-4 max-w-3xl">
              <h1 className="font-heading text-[clamp(34px,5vw,58px)] font-black leading-tight tracking-[-0.03em]">
                補助金活用ガイド
              </h1>
              <p className="mt-5 text-base font-medium leading-8 text-slate-200 sm:text-lg">
                補助金ごとに、使える企業のイメージ・申請の流れ・相談前に見るべきポイントをLP形式で整理しています。
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white ring-1 ring-white/20">
                公開中 {rows.length}件
              </span>
              <span className="rounded-full bg-teal-400/15 px-3 py-1 text-xs font-bold text-teal-100 ring-1 ring-teal-300/30">
                相談導線つきLP
              </span>
              <span className="rounded-full bg-amber-400/15 px-3 py-1 text-xs font-bold text-amber-100 ring-1 ring-amber-300/30">
                自動生成・随時追加
              </span>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-12 lg:py-16">
          {rows.length === 0 ? (
            <div className="rounded-[28px] border border-[#dce6ef] bg-white p-8 text-center shadow-[0_18px_45px_rgba(23,32,51,0.08)]">
              <p className="text-sm text-neutral-600">
                現在公開中の活用ガイドはありません。補助金データの取り込み後、順次追加されます。
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
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

                return (
                  <Link
                    key={row.id}
                    href={`/subsidies/lp/${grant.id}`}
                    className="group flex min-h-[280px] flex-col overflow-hidden rounded-[28px] border border-[#dce6ef] bg-white shadow-[0_18px_45px_rgba(23,32,51,0.08)] transition hover:-translate-y-1 hover:border-[#b9d8ee] hover:shadow-[0_24px_60px_rgba(23,32,51,0.13)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1e9bdb]"
                  >
                    <div className="relative overflow-hidden bg-[#0d2138] px-5 py-6 text-white">
                      <div className="absolute -right-10 -top-12 h-32 w-32 rounded-full bg-[#1e9bdb]/25" aria-hidden />
                      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-teal-200">
                        Action Guide
                      </p>
                      <h2 className="relative mt-3 line-clamp-2 text-xl font-black leading-snug">
                        {grant.name ?? row.title ?? "補助金活用ガイド"}
                      </h2>
                    </div>

                    <div className="flex flex-1 flex-col px-5 py-5">
                      <p className="line-clamp-3 text-sm font-medium leading-7 text-[#556875]">
                        {heroCopy}
                      </p>

                      <dl className="mt-4 grid grid-cols-2 gap-2 text-xs">
                        <div className="rounded-2xl bg-[#f1f6fb] p-3">
                          <dt className="font-bold text-[#687987]">補助上限</dt>
                          <dd className="mt-1 font-black text-[#172033]">
                            {amountLabel ?? "要確認"}
                          </dd>
                        </div>
                        <div className="rounded-2xl bg-[#f1f6fb] p-3">
                          <dt className="font-bold text-[#687987]">公募期限</dt>
                          <dd className="mt-1 font-black text-[#172033]">
                            {deadlineLabel ?? "要確認"}
                          </dd>
                        </div>
                      </dl>

                      <div className="mt-4 flex items-center justify-between gap-3">
                        <div className="flex flex-wrap gap-1.5">
                          {grant.prefecture ? (
                            <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-700 ring-1 ring-teal-100">
                              {grant.prefecture.length > 10 ? "全国" : grant.prefecture}
                            </span>
                          ) : null}
                          {grant.targetIndustries.slice(0, 2).map((industry) => (
                            <span
                              key={`${row.id}-${industry}`}
                              className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600"
                            >
                              {industry}
                            </span>
                          ))}
                        </div>
                        {formatPublishedAt(row.publishedAt) ? (
                          <span className="shrink-0 text-xs text-neutral-400">
                            {formatPublishedAt(row.publishedAt)}
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-5 text-sm font-black text-[#1e5f8c] transition group-hover:translate-x-0.5">
                        ガイドを見る →
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

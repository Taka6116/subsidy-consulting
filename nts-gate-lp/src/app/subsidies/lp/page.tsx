import type { Metadata } from "next";
import Header from "@/components/shared/Header";
import LpFooter from "@/components/gate-lp/LpFooter";
import { prisma } from "@/lib/db/prisma";
import SubsidiesLpClient from "./SubsidiesLpClient";

export const metadata: Metadata = {
  title: "補助金ページ一覧 | 日本提携支援",
  description:
    "制度ごとに、対象企業のイメージ・申請の流れ・相談前に確認すべきポイントを1ページで整理。あなたの会社が使える補助金を最短で見つけられます。",
};

export const revalidate = 300;

export default async function SubsidiesLpIndexPage() {
  const raw = await prisma.generatedContent.findMany({
    where: {
      contentType: "lp",
      status: "published",
    },
    orderBy: { publishedAt: "desc" },
    take: 200,
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
          status: true,
        },
      },
    },
  });

  const rows = raw.map((r) => ({
    id: r.id,
    title: r.title,
    body: r.body,
    publishedAt: r.publishedAt ? r.publishedAt.toISOString() : null,
    grant: {
      id: r.grant.id,
      name: r.grant.name,
      maxAmountLabel: r.grant.maxAmountLabel,
      subsidyAmount: r.grant.subsidyAmount != null ? String(r.grant.subsidyAmount) : null,
      deadlineLabel: r.grant.deadlineLabel,
      deadline: r.grant.deadline ? r.grant.deadline.toISOString() : null,
      prefecture: r.grant.prefecture,
      targetIndustries: r.grant.targetIndustries ?? [],
      status: r.grant.status,
    },
  }));

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
            <div className="max-w-3xl">
              <h1 className="font-heading text-[clamp(34px,5vw,58px)] font-black leading-tight tracking-[-0.03em] text-white">
                補助金ページ一覧
              </h1>
              <p className="mt-5 text-base font-medium leading-8 text-white/80 sm:text-lg">
                制度ごとに、対象企業のイメージ・申請の流れ・相談前に確認すべきポイントを1ページで整理。
                <br className="hidden sm:inline" />
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
          <SubsidiesLpClient rows={rows} />
        </section>
      </main>
      <LpFooter />
    </>
  );
}

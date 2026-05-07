import type { Metadata } from "next";
import Header from "@/components/shared/Header";
import LpFooter from "@/components/gate-lp/LpFooter";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import SubsidiesLpClient from "./SubsidiesLpClient";

const FEATURED_LPS = [
  {
    href: "/subsidies/construction-electrification",
    name: "高用車等の電動化促進事業（建設機械）",
    copy: "建設機械の電動化で燃料費削減・脱炭素・生産性向上を一気に実現。最大14.3億円の補助が利用できます。",
    amount: "最大14.3億円",
    deadline: "2027年1月29日",
    badge: "令和7年度（補正）",
  },
  {
    href: "/subsidies/dx-support",
    name: "中小・小規模企業デジタル技術導入支援",
    copy: "ITツール・クラウド導入で業務効率化と競争力強化を。DX推進の第一歩を補助金で加速させます。",
    amount: "最大300万円",
    deadline: "2026年6月30日",
    badge: "令和8年度",
  },
  {
    href: "/subsidies/equipment-productivity",
    name: "中小企業設備投資・生産性向上促進補助金",
    copy: "老朽化設備の更新・省力化投資を国が支援。製造業・加工業・物流業の生産性を飛躍的に改善します。",
    amount: "最大4,000万円",
    deadline: "2026年8月31日",
    badge: "令和8年度",
  },
  {
    href: "/subsidies/wage-support",
    name: "中小・小規模事業者賃上げ環境整備支援補助金",
    copy: "賃上げと経営強化を同時に実現。人材確保・定着・生産性向上に取り組む中小企業を強力サポートします。",
    amount: "最大300万円",
    deadline: "2026年12月31日",
    badge: "令和8年度",
  },
] as const;

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

        {/* 特集LP（固定カード） */}
        <section className="border-b border-white/10 bg-[rgba(7,21,37,0.7)] px-6 py-10">
          <div className="mx-auto max-w-7xl">
            <p className="mb-5 text-xs font-bold tracking-[0.14em] text-[#7DD3FC]">
              特集補助金 — NTS専門LPあり
            </p>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURED_LPS.map((lp) => (
                <Link
                  key={lp.href}
                  href={lp.href}
                  className="group flex flex-col overflow-hidden rounded-[16px] border border-[#7DD3FC]/30 bg-[rgba(30,100,200,0.08)] shadow-[0_2px_12px_rgba(125,211,252,0.08)] transition hover:-translate-y-0.5 hover:border-[#7DD3FC]/60 hover:shadow-[0_6px_20px_rgba(125,211,252,0.15)]"
                >
                  <div className="flex flex-1 flex-col px-5 py-5">
                    <span className="mb-2 inline-block self-start rounded-full bg-[#7DD3FC]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#7DD3FC]">
                      {lp.badge}
                    </span>
                    <h3 className="mb-2 line-clamp-2 text-base font-bold leading-snug text-white">
                      {lp.name}
                    </h3>
                    <p className="mb-4 line-clamp-2 text-xs leading-relaxed text-white/60">
                      {lp.copy}
                    </p>
                    <dl className="mt-auto grid grid-cols-2 gap-2">
                      <div className="rounded-[8px] bg-white/[0.04] p-2.5">
                        <dt className="text-[10px] font-medium text-white/50">補助上限</dt>
                        <dd className="mt-0.5 text-xs font-semibold text-white">{lp.amount}</dd>
                      </div>
                      <div className="rounded-[8px] bg-white/[0.04] p-2.5">
                        <dt className="text-[10px] font-medium text-white/50">締切目安</dt>
                        <dd className="mt-0.5 text-xs font-semibold text-white">{lp.deadline}</dd>
                      </div>
                    </dl>
                    <div className="mt-4 text-xs font-semibold text-[#7DD3FC] underline-offset-4 group-hover:underline">
                      専門LPを見る →
                    </div>
                  </div>
                </Link>
              ))}
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

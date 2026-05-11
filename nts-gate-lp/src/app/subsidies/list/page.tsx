import type { Metadata } from "next";
import Header from "@/components/shared/Header";
import LpFooter from "@/components/gate-lp/LpFooter";
import SubsidiesListClient from "./SubsidiesListClient";
import { prisma } from "@/lib/db/prisma";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "補助金一覧 | 日本提携支援",
  description: "補助金制度の一覧・検索をご案内します。公募要領での最終確認をお願いします。",
};

export default async function SubsidiesListPage() {
  const raw = await prisma.subsidyGrant.findMany({
    where: { status: "open" },
    select: {
      id: true,
      name: true,
      description: true,
      maxAmountLabel: true,
      deadlineLabel: true,
      deadline: true,
      targetIndustries: true,
      prefecture: true,
      institutionName: true,
      subsidyRate: true,
      status: true,
      source: true,
      syncedAt: true,
      updatedAt: true,
      contents: {
        where: { contentType: "article", status: "published", slug: { not: null } },
        orderBy: { publishedAt: "desc" },
        take: 1,
        select: { slug: true },
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 500,
  });

  const grants = raw.map((g) => ({
    id: g.id,
    name: g.name,
    description: g.description,
    cardImagePath: null,
    maxAmountLabel: g.maxAmountLabel,
    rawPayload: null,
    deadlineLabel: g.deadlineLabel,
    deadline: g.deadline ? g.deadline.toISOString() : null,
    targetIndustries: g.targetIndustries ?? [],
    prefecture: g.prefecture,
    institutionName: g.institutionName,
    // Prisma.Decimal は JSON シリアライズ不可。Number でプリミティブに揃える。
    subsidyRate: g.subsidyRate != null ? Number(g.subsidyRate) : null,
    status: g.status,
    source: g.source,
    syncedAt: g.syncedAt.toISOString(),
    updatedAt: g.updatedAt.toISOString(),
    articleSlug: g.contents[0]?.slug ?? null,
  }));

  return (
    <>
      <Header />
      <main className="relative z-[2] min-h-[100svh] bg-[#f7f9fc] pt-16 font-body sm:pt-20">
        <div className="mx-auto w-full max-w-[1720px] px-3 py-8 md:px-5 lg:px-6">
          <SubsidiesListClient grants={grants} />
        </div>
      </main>
      <LpFooter />
    </>
  );
}

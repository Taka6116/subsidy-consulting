import type { Metadata } from "next";
import Header from "@/components/shared/Header";
import LpFooter from "@/components/gate-lp/LpFooter";
import SubsidiesGalaxyBackdrop from "../SubsidiesGalaxyBackdrop";
import SubsidiesListClient from "./SubsidiesListClient";
import { prisma } from "@/lib/db/prisma";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "補助金一覧 | 日本提携支援",
  description: "補助金制度の一覧・検索をご案内します。公募要領での最終確認をお願いします。",
};

export default async function SubsidiesListPage() {
  const raw = await prisma.subsidyGrant.findMany({
    select: {
      id: true,
      name: true,
      maxAmountLabel: true,
      deadlineLabel: true,
      deadline: true,
      targetIndustries: true,
      prefecture: true,
      status: true,
      source: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: "desc" },
    take: 500,
  });

  const grants = raw.map((g) => ({
    id: g.id,
    name: g.name,
    description: null,
    maxAmountLabel: g.maxAmountLabel,
    rawPayload: null,
    deadlineLabel: g.deadlineLabel,
    deadline: g.deadline ? g.deadline.toISOString() : null,
    targetIndustries: g.targetIndustries ?? [],
    prefecture: g.prefecture,
    status: g.status,
    source: g.source,
    updatedAt: g.updatedAt.toISOString(),
  }));

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
            <div className="mt-6">
              <SubsidiesListClient grants={grants} total={grants.length} />
            </div>
          </div>
        </div>
      </main>
      <LpFooter />
    </>
  );
}

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

// 実在する個別補助金データのみを対象とする
// chusho / maff / meti はニュース記事・カテゴリページで補助金個別情報ではないため除外
// manual にはプレースホルダーが含まれるため除外
const TRUSTED_SOURCES = ["jgrants", "municipality"];

export default async function SubsidiesListPage() {
  const [raw, lpGrantIds] = await Promise.all([
    prisma.subsidyGrant.findMany({
      where: {
        status: "open",
        source: { in: TRUSTED_SOURCES },
        name: { not: null },
      },
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
        rawPayload: true,
        contents: {
          where: { contentType: "article", status: "published", slug: { not: null } },
          orderBy: { publishedAt: "desc" },
          take: 1,
          select: { slug: true },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 500,
    }),
    // 専門LP（contentType="lp"）が存在する grant の ID セットを取得
    prisma.generatedContent
      .findMany({
        where: { contentType: "lp", status: "published" },
        select: { subsidyId: true },
      })
      .then((rows) => new Set(rows.map((r) => r.subsidyId))),
  ]);

  const grants = raw.map((g) => {
    const payload = g.rawPayload as Record<string, unknown> | null;
    const derivedInstitutionName =
      g.institutionName ??
      (typeof payload?.institution_name === "string" && payload.institution_name.trim()
        ? payload.institution_name.trim()
        : null);

    return {
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
      institutionName: derivedInstitutionName,
      subsidyRate: g.subsidyRate != null ? Number(g.subsidyRate) : null,
      status: g.status,
      source: g.source,
      syncedAt: g.syncedAt.toISOString(),
      updatedAt: g.updatedAt.toISOString(),
      articleSlug: g.contents[0]?.slug ?? null,
      hasLp: lpGrantIds.has(g.id),
    };
  });

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

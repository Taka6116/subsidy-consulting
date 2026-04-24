import type { Metadata } from "next";
import Header from "@/components/shared/Header";
import LpFooter from "@/components/gate-lp/LpFooter";
import { prisma } from "@/lib/db/prisma";
import SubsidiesGalaxyClient from "./SubsidiesGalaxyClient";

export const metadata: Metadata = {
  title: "補助金情報 | 日本提携支援",
  description:
    "最新の補助金情報・解説をまとめてご覧いただけます。公募要領での最終確認をお願いします。",
};

export const revalidate = 300;

export default async function SubsidiesPage() {
  const [grantCount, articleCount, videoCount] = await Promise.all([
    prisma.subsidyGrant.count({ where: { status: "open" } }),
    prisma.generatedContent.count({
      where: { contentType: "article", status: "published" },
    }),
    prisma.generatedContent.count({
      where: { contentType: "video", status: "published" },
    }),
  ]);

  return (
    <>
      <Header />
      <main className="relative z-[2] font-body">
        <SubsidiesGalaxyClient
          counts={{ grants: grantCount, articles: articleCount, videos: videoCount }}
        />
      </main>
      <LpFooter />
    </>
  );
}

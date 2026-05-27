import type { Metadata } from "next";
import Header from "@/components/shared/Header";
import LpFooter from "@/components/gate-lp/LpFooter";
import SubsidiesGalaxyClientV2 from "@/components/subsidies/SubsidiesGalaxyClientV2";
import { getPortalStats } from "@/lib/subsidies/portalStats";

export const metadata: Metadata = {
  title: "補助金情報 | 日本提携支援",
  description:
    "最新の補助金情報・解説をまとめてご覧いただけます。公募要領での最終確認をお願いします。",
};

export const revalidate = 0;

export default async function SubsidiesTop2Page() {
  const { grantCount, articleCount, videoCount, lpCount, activePrefectureCount } =
    await getPortalStats();

  return (
    <>
      <Header />
      <main className="relative z-[2] font-body">
        <SubsidiesGalaxyClientV2
          counts={{
            grants: grantCount,
            articles: articleCount,
            videos: videoCount,
            lps: lpCount,
          }}
          activePrefectureCount={activePrefectureCount}
        />
      </main>
      <LpFooter />
    </>
  );
}

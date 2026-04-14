import type { Metadata } from "next";
import Header from "@/components/shared/Header";
import LpFooter from "@/components/gate-lp/LpFooter";
import SubsidiesGalaxyBackdrop from "../SubsidiesGalaxyBackdrop";

export const metadata: Metadata = {
  title: "補助金一覧 | 日本提携支援",
  description: "補助金制度の一覧・検索をご案内します。公募要領での最終確認をお願いします。",
};

export default function SubsidiesListPage() {
  return (
    <>
      <Header />
      <main className="relative z-[2] min-h-[100svh] font-body">
        <SubsidiesGalaxyBackdrop />
        <div className="relative z-10 mx-auto max-w-3xl px-6 py-28">
          <div className="rounded-lg bg-white/85 p-8 shadow-sm backdrop-blur-sm">
            <h1 className="font-heading text-3xl font-normal text-[#2a2926] sm:text-4xl">
              補助金一覧
            </h1>
            <p className="mt-4 text-neutral-600">
              コンテンツは順次追加予定です。
            </p>
          </div>
        </div>
      </main>
      <LpFooter />
    </>
  );
}

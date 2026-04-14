import type { Metadata } from "next";
import Header from "@/components/shared/Header";
import LpFooter from "@/components/gate-lp/LpFooter";
import SubsidiesGalaxyBackdrop from "../SubsidiesGalaxyBackdrop";

export const metadata: Metadata = {
  title: "解説記事 | 日本提携支援",
  description: "補助金・支援制度に関する解説記事をまとめてお届けします。",
};

export default function SubsidiesArticlesPage() {
  return (
    <>
      <Header />
      <main className="relative z-[2] min-h-[100svh] font-body">
        <SubsidiesGalaxyBackdrop />
        <div className="relative z-10 mx-auto max-w-3xl px-6 py-28">
          <div className="rounded-lg bg-white/85 p-8 shadow-sm backdrop-blur-sm">
            <h1 className="font-heading text-3xl font-normal text-[#2a2926] sm:text-4xl">
              解説記事
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

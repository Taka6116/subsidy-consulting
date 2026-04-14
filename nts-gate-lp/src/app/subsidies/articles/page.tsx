import type { Metadata } from "next";
import Header from "@/components/shared/Header";
import LpFooter from "@/components/gate-lp/LpFooter";
import SubsidiesArticlesIndex from "./SubsidiesArticlesIndex";

export const metadata: Metadata = {
  title: "解説記事 | 日本提携支援",
  description: "補助金・支援制度に関する解説記事をまとめてお届けします。",
};

export default function SubsidiesArticlesPage() {
  return (
    <>
      <Header />
      <main className="relative z-[2] min-h-[100svh] bg-[#f9f7f2] font-body">
        <SubsidiesArticlesIndex />
      </main>
      <LpFooter />
    </>
  );
}

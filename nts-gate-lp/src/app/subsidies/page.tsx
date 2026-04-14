import type { Metadata } from "next";
import Header from "@/components/shared/Header";
import LpFooter from "@/components/gate-lp/LpFooter";
import SubsidiesGalaxyClient from "./SubsidiesGalaxyClient";

export const metadata: Metadata = {
  title: "補助金情報 | 日本提携支援",
  description:
    "最新の補助金情報・解説をまとめてご覧いただけます。公募要領での最終確認をお願いします。",
};

export default function SubsidiesPage() {
  return (
    <>
      <Header />
      <main className="relative z-[2] font-body">
        <SubsidiesGalaxyClient />
      </main>
      <LpFooter />
    </>
  );
}

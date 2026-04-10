import type { Metadata } from "next";
import Link from "next/link";
import CheckPortalHeader from "@/components/check/CheckPortalHeader";
import SubsidyCheckClient from "@/components/check/SubsidyCheckClient";

export const metadata: Metadata = {
  title: "対象補助金の確認（デモ） | 日本提携支援",
  description:
    "会社名と業種から、対象になり得る補助金のイメージを確認します。表示は参考例です。公募要領で必ずご確認ください。",
};

type SearchParams = { audience?: string | string[] };

export default async function CheckPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const raw = params.audience;
  const audienceParam = Array.isArray(raw) ? raw[0] : raw;
  const audience = audienceParam === "partner" ? "partner" : "end_user";

  return (
    <div className="check-portal min-h-screen font-body text-portal-on-surface">
      <CheckPortalHeader audience={audience} />
      <main className="min-h-[calc(100vh-5rem)] px-6 pb-16 pt-24">
        <div className="mx-auto max-w-5xl">
          <SubsidyCheckClient audience={audience} />
        </div>
      </main>
      <footer className="border-t border-[rgba(0,198,255,0.1)] bg-[rgba(0,0,0,0.2)] py-8">
        <div className="mx-auto max-w-5xl px-6 text-center text-caption">
          <Link
            href="/"
            className="font-medium text-[#7ed9f5] underline-offset-4 hover:text-[#00c6ff] hover:underline"
          >
            日本提携支援 トップへ戻る
          </Link>
        </div>
      </footer>
    </div>
  );
}

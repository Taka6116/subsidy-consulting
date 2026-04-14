import type { Metadata } from "next";
import Link from "next/link";
import CheckPortalHeader from "@/components/check/CheckPortalHeader";
import SubsidyCheckClient from "@/components/check/SubsidyCheckClient";
import HeroThreeWebGLBackground from "@/components/gate-lp/hero-three/HeroThreeWebGLBackground";

export const metadata: Metadata = {
  title: "対象補助金の確認（デモ） | 日本提携支援",
  description:
    "会社名・業種で対象になり得る補助金のイメージを確認できます。公式サイトURLは任意です。表示は参考例です。公募要領で必ずご確認ください。",
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
  const isEndUser = audience === "end_user";

  return (
    <div
      className={`check-portal min-h-screen font-body text-portal-on-surface${isEndUser ? " check-portal-lp-bg" : ""}`}
    >
      {isEndUser ? <HeroThreeWebGLBackground interactive={false} /> : null}
      <CheckPortalHeader audience={audience} />
      <main className="relative z-[2] min-h-[calc(100vh-5rem)] px-6 pb-16 pt-24">
        <div className="mx-auto max-w-5xl">
          <SubsidyCheckClient audience={audience} />
        </div>
      </main>
      <footer className="relative z-[2] border-t border-white/10 bg-[rgba(6,14,28,0.35)] py-8">
        <div className="mx-auto max-w-5xl px-6 text-center text-caption">
          <Link
            href="/"
            className="font-medium text-white/60 underline-offset-4 transition hover:text-white hover:underline"
          >
            日本提携支援 トップへ戻る
          </Link>
        </div>
      </footer>
    </div>
  );
}

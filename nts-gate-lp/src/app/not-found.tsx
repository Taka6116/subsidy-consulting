import Link from "next/link";
import Header from "@/components/shared/Header";
import LpFooter from "@/components/gate-lp/LpFooter";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="relative z-[2] flex min-h-[100svh] flex-col items-center justify-center bg-[#f8faff] px-4 pt-16 font-body sm:pt-20">
        <div className="text-center">
          <p className="text-6xl font-black text-[#0e357f]">404</p>
          <h1 className="mt-4 text-xl font-bold text-[#111827] sm:text-2xl">
            ページが見つかりませんでした
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-neutral-500">
            お探しのページは削除されたか、URLが変更された可能性があります。
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/"
              className="rounded-xl bg-[#0e357f] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#1a4fa0]"
            >
              トップページへ
            </Link>
            <Link
              href="/subsidies/articles"
              className="rounded-xl border border-[#0e357f]/30 bg-white px-6 py-3 text-sm font-bold text-[#0e357f] transition hover:bg-[#eff6ff]"
            >
              解説記事一覧へ
            </Link>
          </div>
        </div>
      </main>
      <LpFooter />
    </>
  );
}

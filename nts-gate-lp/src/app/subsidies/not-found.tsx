import Link from "next/link";
import Header from "@/components/shared/Header";
import LpFooter from "@/components/gate-lp/LpFooter";

export default function SubsidiesNotFound() {
  return (
    <>
      <Header />
      <main className="relative z-[2] flex min-h-[100svh] flex-col items-center justify-center bg-[#f8faff] px-4 pt-16 font-body sm:pt-20">
        <p className="text-7xl font-black text-blue-200">404</p>

        <h1 className="mt-4 text-2xl font-bold text-[#111827]">
          ページが見つかりませんでした
        </h1>
        <p className="mt-3 max-w-sm text-center text-sm leading-relaxed text-neutral-500">
          補助金情報は更新・整理されることがあります。
          以下から最新情報をご確認ください。
        </p>

        {/* プライマリCTA */}
        <Link
          href="/subsidies"
          className="mt-8 rounded-full bg-[#0e357f] px-8 py-3 text-sm font-bold text-white transition hover:bg-[#1a4fa0]"
        >
          補助金TOPへ戻る
        </Link>

        {/* セカンダリリンク */}
        <div className="mt-4 grid w-full max-w-sm grid-cols-2 gap-3">
          <Link
            href="/subsidies/list"
            className="flex flex-col items-center gap-1 rounded-xl border border-gray-200 p-4 text-sm text-gray-700 transition hover:border-blue-400 hover:bg-blue-50"
          >
            <span className="text-lg">📋</span>
            補助金一覧
          </Link>
          <Link
            href="/subsidies/articles"
            className="flex flex-col items-center gap-1 rounded-xl border border-gray-200 p-4 text-sm text-gray-700 transition hover:border-blue-400 hover:bg-blue-50"
          >
            <span className="text-lg">📰</span>
            解説記事
          </Link>
          <Link
            href="/subsidies/lp"
            className="flex flex-col items-center gap-1 rounded-xl border border-gray-200 p-4 text-sm text-gray-700 transition hover:border-blue-400 hover:bg-blue-50"
          >
            <span className="text-lg">📖</span>
            活用ガイド
          </Link>
          <Link
            href="/subsidies/videos"
            className="flex flex-col items-center gap-1 rounded-xl border border-gray-200 p-4 text-sm text-gray-700 transition hover:border-blue-400 hover:bg-blue-50"
          >
            <span className="text-lg">🎬</span>
            解説動画
          </Link>
        </div>
      </main>
      <LpFooter />
    </>
  );
}

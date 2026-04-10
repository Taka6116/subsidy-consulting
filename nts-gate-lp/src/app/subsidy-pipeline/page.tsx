import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "補助金情報を届ける仕組み（デモ） | 日本提携支援",
  description:
    "行政情報の公開を起点に、クラウドと AI で制度内容を解説コンテンツへ展開する取り組みのイメージをご紹介します。",
};

export default function SubsidyPipelinePage() {
  return (
    <div className="check-portal min-h-screen font-body text-portal-on-surface">
      <main className="mx-auto max-w-3xl px-6 py-12 md:py-16">
        <div className="rounded-2xl border border-white/45 bg-white/92 p-6 shadow-xl backdrop-blur-sm sm:p-8 md:p-10 md:py-12">
        <p className="text-sm font-medium text-portal-primary-container">
          <Link
            href="/check"
            className="underline-offset-4 hover:underline"
          >
            対象補助金の確認（/check）に戻る
          </Link>
        </p>
        <h1 className="mt-8 font-heading text-h1 font-bold leading-tight text-portal-primary">
          補助金情報を、いち早く届ける仕組み
        </h1>
        <p className="mt-4 text-body leading-loose text-portal-on-surface-variant">
          本ページは、補助金・助成金などの行政情報をどのように整理し、事業者の皆さまにわかりやすく届けていくかの
          <strong className="font-semibold text-portal-on-surface">構想イメージ（デモ説明）</strong>
          です。実際の運用・公開タイミングは制度・媒体ごとに異なります。
        </p>

        <section className="mt-12 space-y-6" aria-labelledby="pipeline-flow-heading">
          <h2
            id="pipeline-flow-heading"
            className="font-heading text-h2 font-bold text-portal-primary-container"
          >
            全体の流れ
          </h2>
          <ol className="list-decimal space-y-4 pl-5 text-body leading-relaxed text-portal-on-surface">
            <li>
              <strong className="text-portal-primary">トリガー（行政情報のリリース）</strong>
              <br />
              新設・更新された制度や公募情報の公開などを起点とします。
            </li>
            <li>
              <strong className="text-portal-primary">情報解析（クラウド上）</strong>
              <br />
              公開情報をクラウド上で収集・整理し、要点の抽出や構造化に向けた処理を行います。
            </li>
            <li>
              <strong className="text-portal-primary">AI によるコンテンツ作成</strong>
              <br />
              解析結果をもとに、解説記事、解説ランディングページ、動画など、媒体に応じた案出し・下書き生成を行います。
            </li>
            <li>
              <strong className="text-portal-primary">各媒体への反映</strong>
              <br />
              Web 記事、専用 LP、動画プラットフォームなど、利用者が触れるチャネルへ反映します。
            </li>
          </ol>
        </section>

        <section className="mt-12 rounded-xl border border-portal-outline/40 bg-portal-surface-lowest p-6 shadow-sm">
          <h2 className="font-heading text-h3 font-bold text-portal-primary-container">
            目指すスピード感（例）
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-portal-on-surface-variant">
            行政側の情報公開から<strong className="font-medium text-portal-on-surface">数時間オーダー</strong>
            で初版の解説コンテンツにたどり着くことを目標にしたパイプライン設計のイメージです。品質担保・法務確認・人による校正など、実運用では追加工程が入ります。
          </p>
        </section>

        <section className="mt-10">
          <h2 className="font-heading text-h3 font-bold text-portal-primary-container">
            広告との連携
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-portal-on-surface-variant">
            生成したコンテンツのリーチを広げるため、デジタル広告などで補強する想定もあります（デモ上の説明です）。
          </p>
        </section>

        <p className="mt-12 text-xs leading-relaxed text-portal-on-surface-variant">
          ※採択可否・金額・要件の最終判断は必ず公募要領および公式情報でご確認ください。
        </p>
        </div>
      </main>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";

export const metadata: Metadata = {
  title: "パートナー・提案企業の方へ | 日本提携支援",
  description:
    "補助金は「制度の紹介」ではなく、御社の商材提案や顧客の課題解決を前に進める手段になります。省力化・事業承継（引継ぎ）補助金の申請サポートを中心に、提携プログラムをご案内します。",
};

export default function PartnerPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-neutral-100 pt-24 pb-8 font-body text-neutral-900">
        <div className="mx-auto max-w-container px-6 py-10 md:py-14">
          <p className="text-xs font-bold uppercase tracking-widest text-primary-700">
            Partner
          </p>
          <h1 className="mt-3 font-heading text-h1 font-bold leading-tight text-primary-900">
            補助金を、御社のビジネス課題の解決手段に
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-loose text-neutral-700">
            単に制度を並べるのではなく、<strong className="font-semibold text-neutral-900">顧客の投資やDX、人手不足の解消</strong>
            が補助金で動きやすくなる——そんな提案が、御社の成約率や顧客満足につながります。日本提携支援は、複雑な申請手続きを支えるパートナーとして、提携企業様とともに顧客企業を支援します。
          </p>

          <section className="mt-14 border-t border-neutral-200 pt-12">
            <h2 className="font-heading text-h2 font-bold text-primary-900">
              主なサポート領域
            </h2>
            <ul className="mt-6 max-w-3xl space-y-8 text-body leading-loose text-neutral-700">
              <li>
                <p className="font-heading font-bold text-neutral-900">
                  省力化補助金（中小企業省力化投資補助金）
                </p>
                <p className="mt-2">
                  人手不足に悩む企業が、IoT機器やロボットなどの省力化製品を導入する際の費用を支援する制度です。御社の商材・サービスと組み合わせやすい領域です。
                </p>
              </li>
              <li>
                <p className="font-heading font-bold text-neutral-900">
                  事業承継補助金（事業承継・引継ぎ補助金）
                </p>
                <p className="mt-2">
                  代替わりやM&Aをきっかけとした、新たな設備投資や専門家への相談費用などを支援する制度です。承継・引継ぎニーズのある顧客への提案に活用できます。
                </p>
              </li>
            </ul>
          </section>

          <section className="mt-14 border-t border-neutral-200 pt-12">
            <h2 className="font-heading text-h2 font-bold text-primary-900">
              料金の考え方（例）
            </h2>
            <p className="mt-4 max-w-3xl text-body leading-loose text-neutral-700">
              お客様にとって分かりやすい体系として、
              <strong className="font-semibold text-neutral-900">手付金15万円</strong>
              に加え、
              <strong className="font-semibold text-neutral-900">採択時の成功報酬（補助額の10〜15%）</strong>
              といった形でのご提供を想定しています。詳細はお問い合わせのうえ、個別にご説明します。
            </p>
          </section>

          <section className="mt-14 rounded-card border border-primary-200 bg-primary-50/80 p-8 md:p-10">
            <h2 className="font-heading text-h2 font-bold text-primary-900">
              顧客企業の対象確認（デモ）
            </h2>
            <p className="mt-4 max-w-3xl text-body leading-loose text-neutral-700">
              顧客企業の会社名・業種から、対象になり得る補助金のイメージを確認する画面を用意しています（現在はモック表示です。本番では法人番号API・制度データと接続予定）。
            </p>
            <Link
              href="/check?audience=partner"
              className="mt-6 inline-flex rounded-card bg-accent-500 px-8 py-4 text-base font-bold text-white shadow-sm transition-colors hover:bg-accent-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
            >
              顧客企業向けチェックを試す（デモ）
            </Link>
          </section>

          <p className="mt-14 text-center text-sm text-neutral-600 md:text-left">
            提携のご相談・お問い合わせは、
            <Link
              href="/#footer-contact"
              className="font-bold text-primary-700 underline underline-offset-4 hover:text-primary-900"
            >
              フッターのお問い合わせ
            </Link>
            よりご連絡ください。
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}

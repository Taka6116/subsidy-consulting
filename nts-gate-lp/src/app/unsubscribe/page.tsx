import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "メール配信停止 | 日本提携支援",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function pickFirst(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function UnsubscribePage({ searchParams }: Props) {
  const params = await searchParams;
  const success = pickFirst(params.success) === "1";
  const error = pickFirst(params.error);

  return (
    <main className="min-h-screen bg-[#F4F2E9] px-4 py-16 font-[family-name:var(--font-zen-kaku-gothic-new,'Noto_Sans_JP',sans-serif)]">
      <div className="mx-auto max-w-lg rounded-2xl bg-white p-8 shadow-sm ring-1 ring-neutral-200">
        {success ? (
          <>
            <p className="text-sm font-bold tracking-[0.12em] text-[#28A4A3]">NTS 補助金情報</p>
            <h1 className="mt-2 text-2xl font-bold text-[#0E357F]">配信を停止しました</h1>
            <p className="mt-4 text-sm leading-7 text-neutral-600">
              補助金情報メールの配信を停止しました。再度受け取る場合は、サイトから登録し直してください。
            </p>
          </>
        ) : error === "invalid" || error === "not_found" ? (
          <>
            <p className="text-sm font-bold tracking-[0.12em] text-[#28A4A3]">NTS 補助金情報</p>
            <h1 className="mt-2 text-2xl font-bold text-[#0E357F]">リンクが無効です</h1>
            <p className="mt-4 text-sm leading-7 text-neutral-600">
              配信停止リンクの有効期限が切れているか、URL が正しくありません。
              お手数ですが、最新のメール内リンクから再度お試しください。
            </p>
          </>
        ) : (
          <>
            <p className="text-sm font-bold tracking-[0.12em] text-[#28A4A3]">NTS 補助金情報</p>
            <h1 className="mt-2 text-2xl font-bold text-[#0E357F]">メール配信停止</h1>
            <p className="mt-4 text-sm leading-7 text-neutral-600">
              配信停止は、受信したメール内の「配信停止はこちら」リンクから行えます。
            </p>
          </>
        )}

        <Link
          href="/subsidies/articles"
          className="mt-8 inline-flex items-center justify-center rounded-full bg-[#28A4A3] px-6 py-3 text-sm font-bold text-white transition hover:brightness-110"
        >
          補助金記事一覧へ
        </Link>
      </div>
    </main>
  );
}

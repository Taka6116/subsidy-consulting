import Link from "next/link";

type Props = {
  audience: "end_user" | "partner";
};

export default function CheckPortalHeader({ audience }: Props) {
  const isPartner = audience === "partner";

  return (
    <header className="check-portal-glass-nav fixed left-0 right-0 top-0 z-50">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
        <div className="flex min-w-0 flex-1 items-center gap-6">
          <Link
            href="/"
            className="shrink-0 rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-portal-primary"
          >
            <img
              src="/nts-logo.svg"
              alt="日本提携支援"
              className="h-7 w-auto sm:h-8"
              width={200}
              height={29}
            />
          </Link>
          <span className="hidden font-heading text-lg font-bold tracking-tight text-portal-primary-container sm:inline">
            {isPartner ? "顧客向け補助金チェック（デモ）" : "御社に最適な補助金提案（デモ）"}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <Link
            href="/"
            className="text-sm font-medium text-portal-on-surface-variant underline-offset-4 hover:text-portal-primary hover:underline"
          >
            トップへ
          </Link>
          <span className="rounded-full bg-portal-primary-container px-3 py-1.5 text-xs font-bold text-portal-on-primary">
            AI 分析（デモ）
          </span>
        </div>
      </div>
    </header>
  );
}

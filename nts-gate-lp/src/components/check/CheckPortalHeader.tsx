import Link from "next/link";

type Props = {
  audience: "end_user" | "partner";
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function CheckPortalHeader({ audience }: Props) {
  return (
    <header className="check-portal-glass-nav fixed left-0 right-0 top-0 z-50 text-white">
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
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <Link
            href="/"
            className="text-sm font-medium text-white underline-offset-4 drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)] hover:text-white/90 hover:underline"
          >
            トップへ
          </Link>
        </div>
      </div>
    </header>
  );
}

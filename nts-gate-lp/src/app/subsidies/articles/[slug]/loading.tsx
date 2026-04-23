import Header from "@/components/shared/Header";
import LpFooter from "@/components/gate-lp/LpFooter";

export default function LoadingArticle() {
  return (
    <>
      <Header />
      <main className="relative z-[2] min-h-[100svh] bg-[#f9f7f2] pt-16 font-body sm:pt-20">
        <div className="mx-auto max-w-3xl animate-pulse px-5 py-10 sm:px-6 lg:py-14">
          <div className="h-4 w-40 rounded bg-neutral-200" />
          <div className="mt-6 h-4 w-32 rounded bg-neutral-200" />
          <div className="mt-4 h-10 w-full rounded bg-neutral-200" />
          <div className="mt-2 h-10 w-4/5 rounded bg-neutral-200" />
          <div className="mt-4 flex gap-2">
            <div className="h-7 w-20 rounded-full bg-neutral-200" />
            <div className="h-7 w-24 rounded-full bg-neutral-200" />
          </div>
          <div className="mt-8 aspect-[16/9] w-full rounded-xl bg-neutral-200" />
          <div className="mt-10 space-y-3">
            <div className="h-4 w-full rounded bg-neutral-200" />
            <div className="h-4 w-11/12 rounded bg-neutral-200" />
            <div className="h-4 w-10/12 rounded bg-neutral-200" />
            <div className="h-4 w-9/12 rounded bg-neutral-200" />
          </div>
        </div>
      </main>
      <LpFooter />
    </>
  );
}

import Header from "@/components/shared/Header";
import LpFooter from "@/components/gate-lp/LpFooter";
import SubsidiesGalaxyBackdrop from "../SubsidiesGalaxyBackdrop";

export default function LoadingSubsidiesList() {
  return (
    <>
      <Header />
      <main className="relative z-[2] min-h-[100svh] bg-[#f7f9fc] pt-16 font-body sm:pt-20">
        <SubsidiesGalaxyBackdrop />
        <div className="relative z-10 mx-auto max-w-7xl px-6 py-24">
          <div className="rounded-2xl border border-[#e4e1da] bg-[#f9f7f3]/95 p-8 shadow-sm backdrop-blur-sm md:p-10">
            <div className="h-10 w-72 animate-pulse rounded bg-[#ece8df]" />
            <div className="mt-4 h-5 w-64 animate-pulse rounded bg-[#ece8df]" />
            <p className="mt-6 text-sm text-[#6a6760]">補助金情報を取得中...</p>

            <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={`subsidy-skeleton-${i}`}
                  className="rounded-2xl border border-[#e4e1da] bg-white p-6 shadow-sm"
                >
                  <div className="h-6 w-4/5 animate-pulse rounded bg-[#ece8df]" />
                  <div className="mt-5 space-y-2">
                    <div className="h-4 w-full animate-pulse rounded bg-[#f0ede6]" />
                    <div className="h-4 w-4/5 animate-pulse rounded bg-[#f0ede6]" />
                  </div>
                  <div className="mt-6 h-4 w-2/3 animate-pulse rounded bg-[#f0ede6]" />
                  <div className="mt-3 h-4 w-1/2 animate-pulse rounded bg-[#f0ede6]" />
                  <div className="mt-6 flex gap-2">
                    <div className="h-6 w-20 animate-pulse rounded-full bg-[#f0ede6]" />
                    <div className="h-6 w-16 animate-pulse rounded-full bg-[#f0ede6]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <LpFooter />
    </>
  );
}

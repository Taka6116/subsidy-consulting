import Header from "@/components/shared/Header";
import LpFooter from "@/components/gate-lp/LpFooter";

export default function LoadingSubsidiesList() {
  return (
    <>
      <Header />
      <main className="relative z-[2] min-h-[100svh] bg-[#f7f9fc] pt-16 font-body sm:pt-20">
        <section className="border-b border-[#d9e5f5] bg-[linear-gradient(110deg,#f8fcff_0%,#eff8ff_46%,#dff1ff_100%)]">
          <div className="mx-auto grid min-h-[430px] max-w-[1720px] items-center gap-8 px-5 py-10 sm:px-7 md:grid-cols-2 md:px-10 lg:min-h-[475px] lg:px-14">
            <div>
              <div className="h-7 w-48 animate-pulse rounded-full bg-[#dcecf9]" />
              <div className="mt-6 h-12 w-[min(100%,480px)] animate-pulse rounded-lg bg-[#d7e9f8]" />
              <div className="mt-3 h-12 w-[min(82%,380px)] animate-pulse rounded-lg bg-[#d7e9f8]" />
              <div className="mt-6 h-4 w-[min(100%,420px)] animate-pulse rounded bg-[#dceaf7]" />
              <div className="mt-3 h-4 w-[min(84%,355px)] animate-pulse rounded bg-[#dceaf7]" />
              <div className="mt-8 flex gap-3">
                <div className="h-12 w-44 animate-pulse rounded-xl bg-[#c7dff2]" />
                <div className="h-12 w-36 animate-pulse rounded-xl bg-white/80" />
              </div>
            </div>
            <div className="relative h-72">
              <div className="absolute bottom-5 right-0 h-48 w-72 animate-pulse rounded-[2rem] bg-[#d6e9f8]" />
              <div className="absolute bottom-4 right-0 h-40 w-64 animate-pulse rounded-2xl border border-white bg-white/80" />
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-[1720px] px-3 py-8 md:px-5 lg:px-6">
          <div className="rounded-2xl border border-[#dbe3f0] bg-white p-4 shadow-sm md:p-5">
            <div className="grid gap-3 md:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={`filter-skeleton-${i}`} className="h-11 animate-pulse rounded-xl bg-[#eef4fa]" />
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={`tab-skeleton-${i}`} className="h-8 w-24 animate-pulse rounded-full bg-[#eef4fa]" />
              ))}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={`subsidy-skeleton-${i}`}
                className="rounded-2xl border border-[#e2e8f4] bg-white p-5 shadow-sm"
              >
                <div className="h-5 w-4/5 animate-pulse rounded bg-[#e7eff8]" />
                <div className="mt-4 h-4 w-full animate-pulse rounded bg-[#f0f5fa]" />
                <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-[#f0f5fa]" />
                <div className="mt-6 flex gap-2">
                  <div className="h-10 flex-1 animate-pulse rounded-xl bg-[#dceafa]" />
                  <div className="h-10 w-20 animate-pulse rounded-xl bg-[#eef4fa]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <LpFooter />
    </>
  );
}

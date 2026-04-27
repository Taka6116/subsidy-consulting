import Header from "@/components/shared/Header";
import LpFooter from "@/components/gate-lp/LpFooter";

export default function LoadingSubsidyLp() {
  return (
    <>
      <Header />
      <main className="relative z-[2] min-h-[100svh] bg-[#0a1628] font-body">
        {/* Hero skeleton */}
        <div className="w-full animate-pulse px-6 py-20 sm:py-28"
          style={{ background: "linear-gradient(135deg,#0f2027 0%,#203a43 50%,#2c5364 100%)" }}
        >
          <div className="mx-auto max-w-4xl">
            <div className="h-5 w-28 rounded-full bg-white/10" />
            <div className="mt-6 h-10 w-3/4 rounded bg-white/15" />
            <div className="mt-3 h-10 w-1/2 rounded bg-white/15" />
            <div className="mt-4 h-5 w-full rounded bg-white/10" />
            <div className="mt-2 h-5 w-4/5 rounded bg-white/10" />
            <div className="mt-8 flex gap-3">
              <div className="h-12 w-44 rounded-full bg-white/20" />
              <div className="h-12 w-28 rounded-full bg-white/10" />
            </div>
          </div>
        </div>

        {/* Stats + body skeleton */}
        <div className="mx-auto max-w-6xl px-6 py-10">
          {/* Stat cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse rounded-2xl bg-white/5 p-6">
                <div className="h-4 w-20 rounded bg-white/10" />
                <div className="mt-3 h-7 w-32 rounded bg-white/15" />
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col gap-8 lg:flex-row">
            {/* Main column */}
            <div className="flex-1 space-y-8">
              {/* Pain section */}
              <div className="animate-pulse rounded-2xl bg-white/5 p-6">
                <div className="h-6 w-40 rounded bg-white/10" />
                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-10 rounded-lg bg-white/8" />
                  ))}
                </div>
              </div>
              {/* Use case section */}
              <div className="animate-pulse rounded-2xl bg-white/5 p-6">
                <div className="h-6 w-48 rounded bg-white/10" />
                <div className="mt-5 space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="rounded-xl bg-white/8 p-4">
                      <div className="h-4 w-36 rounded bg-white/15" />
                      <div className="mt-3 space-y-2">
                        <div className="h-3 w-full rounded bg-white/10" />
                        <div className="h-3 w-4/5 rounded bg-white/10" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Sidebar skeleton (desktop) */}
            <div className="hidden animate-pulse lg:block lg:w-72">
              <div className="rounded-2xl bg-white/5 p-6">
                <div className="h-5 w-36 rounded bg-white/10" />
                <div className="mt-4 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-4 w-full rounded bg-white/8" />
                  ))}
                </div>
                <div className="mt-6 h-12 w-full rounded-full bg-white/20" />
              </div>
            </div>
          </div>
        </div>
      </main>
      <LpFooter />
    </>
  );
}

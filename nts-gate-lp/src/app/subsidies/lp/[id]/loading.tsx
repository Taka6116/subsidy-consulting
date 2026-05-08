import Header from "@/components/shared/Header";
import LpFooter from "@/components/gate-lp/LpFooter";
import Image from "next/image";
import generalHeroVisual from "../../../../../icon-assets/general-hero.webp";

export default function LoadingSubsidyLp() {
  return (
    <>
      <Header />
      <main className="bg-white pt-16 sm:pt-20">
        <section className="relative min-h-[480px] overflow-hidden bg-[#0B173A] md:min-h-[540px]">
          <Image
            src={generalHeroVisual}
            alt=""
            aria-hidden="true"
            fill
            priority
            placeholder="blur"
            sizes="100vw"
            className="object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B173A]/94 via-[#0B173A]/75 to-[#0B173A]/40" />
          <div className="relative z-10 mx-auto max-w-7xl px-6 py-16 lg:px-8 md:py-20">
            <div className="mb-5 h-6 w-36 rounded-sm bg-white/20" />
            <div className="mb-3 h-12 w-full max-w-2xl rounded bg-white/15" />
            <div className="mb-8 h-12 w-[70%] max-w-xl rounded bg-white/15" />
            <div className="h-12 w-56 rounded-lg bg-[#FEA00D]/80" />
          </div>
        </section>
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl bg-slate-100 p-6">
                <div className="h-4 w-20 rounded bg-slate-200" />
                <div className="mt-3 h-7 w-32 rounded bg-slate-200" />
              </div>
            ))}
          </div>
          <div className="mt-8 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-2xl bg-slate-100" />
            ))}
          </div>
        </div>
      </main>
      <LpFooter />
    </>
  );
}

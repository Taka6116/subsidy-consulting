"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { SubsidyLpData } from "@/lib/subsidy-lp/buildSubsidyLpData";
import { subsidyLpAsset } from "@/lib/subsidy-lp/assets";

type Props = { data: SubsidyLpData };

function UrgencyBadge({ days }: { days: number | null }) {
  if (days === null) {
    return (
      <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white ring-1 ring-white/20">
        公募期限は要確認
      </span>
    );
  }
  if (days < 0) return (
    <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/70 ring-1 ring-white/20">
      締切済み
    </span>
  );
  const colorClass =
    days <= 14
      ? "bg-red-500 text-white ring-red-300/40"
      : days <= 30
      ? "bg-[#fd9f1b] text-[#172033] ring-amber-200/60"
      : "bg-emerald-400 text-[#0c1b2e] ring-emerald-200/50";
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-extrabold shadow-sm ring-1 ${colorClass}`}>
      締切まで残り {days} 日
    </span>
  );
}

export default function SubsidyLpHero({ data }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const heroImage = subsidyLpAsset("hero-consulting.png");

  return (
    <section
      className="relative isolate overflow-hidden bg-[#071525] text-white"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_78%_18%,rgba(30,155,219,0.34),transparent_34%),linear-gradient(135deg,#071525_0%,#0e2c47_54%,#133d59_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-20 top-0 -z-10 h-full w-[42%] skew-x-[-13deg] bg-[#1e9bdb]/20"
      />
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#f5f8fc] to-transparent" />

      <div className="relative mx-auto max-w-7xl px-5 pb-20 pt-28 sm:px-6 sm:pb-24 sm:pt-32 lg:grid lg:grid-cols-[minmax(0,1fr)_470px] lg:items-center lg:gap-12">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-bold tracking-[0.18em] text-white/85 backdrop-blur">
              SUBSIDY ACTION GUIDE
            </span>
            {mounted && <UrgencyBadge days={data.remainingDays} />}
          </div>

          <p className="mt-6 text-sm font-bold text-[#8fd3ff]">{data.institutionName}</p>
          <h1 className="mt-3 max-w-3xl font-heading text-[clamp(34px,5vw,60px)] font-extrabold leading-[1.08] tracking-[-0.03em] text-white">
            {data.heroCopy}
          </h1>
          <p className="mt-5 max-w-2xl text-base font-medium leading-8 text-white sm:text-lg">
            {data.subCopy}
          </p>

          <div className="mt-7 rounded-2xl border border-white/15 bg-white/10 p-4 shadow-2xl shadow-black/10 backdrop-blur-md sm:max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/50">
              Target Subsidy
            </p>
            <p className="mt-2 text-lg font-extrabold leading-snug text-white sm:text-xl">
              {data.name}
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/consult"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#fd9f1b] px-8 py-3.5 text-sm font-extrabold text-[#172033] shadow-[0_10px_30px_rgba(253,159,27,0.34)] transition hover:-translate-y-0.5 hover:bg-[#ffb64c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#fd9f1b] active:translate-y-0"
            >
              無料相談する
              <span aria-hidden className="ml-2">→</span>
            </Link>
            <Link
              href="#lp-overview"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/35 bg-white/10 px-7 py-3.5 text-sm font-bold text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/18 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white active:translate-y-0"
            >
              制度概要を見る
            </Link>
          </div>

          <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-white/70">
            <span className="rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/15">相談無料</span>
            <span className="rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/15">公募要領で最終確認</span>
            <span className="rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/15">申請後も伴走支援</span>
          </div>
        </div>

        <div className="mt-10 lg:mt-0">
          <div className="relative overflow-hidden rounded-[34px] border border-white/18 bg-white p-5 text-[#172033] shadow-2xl shadow-black/25">
            <div className="absolute right-0 top-0 h-28 w-28 rounded-bl-[72px] bg-[#1e9bdb]/12" aria-hidden />
            <div className="relative -mx-2 -mt-2 mb-3 overflow-hidden rounded-[28px] bg-[#eef7fd] px-3 pt-4">
              <img
                src={heroImage}
                alt=""
                aria-hidden="true"
                className="mx-auto h-auto w-full max-w-[430px] object-contain drop-shadow-[0_18px_30px_rgba(23,32,51,0.16)]"
              />
            </div>
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#1e9bdb]">
              Free Consultation
            </p>
            <h2 className="mt-3 text-2xl font-extrabold leading-tight">
              自社で使えるか、まずは無料で確認できます。
            </h2>
            <dl className="mt-6 space-y-3 text-sm">
              {[
                ["補助上限", data.amountLabel],
                ["補助率", data.rateLabel],
                ["公募期限", data.deadlineLabel],
                ["対象地域", data.targetArea],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-4 rounded-2xl bg-[#f1f6fb] px-4 py-3">
                  <dt className="shrink-0 text-xs font-bold text-[#556875]">{label}</dt>
                  <dd className="text-right font-extrabold text-[#172033]">{value || "要確認"}</dd>
                </div>
              ))}
            </dl>
            <Link
              href="/consult"
              className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[#172033] px-5 py-3.5 text-sm font-extrabold text-white transition hover:bg-[#24354d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e9bdb]"
            >
              無料相談を予約する
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

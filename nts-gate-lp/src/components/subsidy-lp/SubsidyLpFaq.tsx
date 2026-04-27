"use client";

import { useState } from "react";
import type { SubsidyLpData } from "@/lib/subsidy-lp/buildSubsidyLpData";

type Props = { data: SubsidyLpData };

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-neutral-100 last:border-0">
      <button
        className="flex w-full items-start justify-between gap-4 py-5 text-left text-sm font-black text-[#172033] transition hover:text-[#1e5f8c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e9bdb]"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="flex items-start gap-2">
          <span className="mt-0.5 shrink-0 text-[#1e9bdb]">Q.</span>
          {q}
        </span>
        <span className="shrink-0 text-neutral-400 transition-transform duration-200" style={{ transform: open ? "rotate(45deg)" : "none" }}>
          +
        </span>
      </button>
      {open && (
        <div className="pb-5 pl-5 pr-2 text-sm font-medium leading-7 text-[#556875]">
          <span className="mr-2 font-black text-[#fd9f1b]">A.</span>
          {a}
        </div>
      )}
    </div>
  );
}

export default function SubsidyLpFaq({ data }: Props) {
  return (
    <section className="rounded-[28px] border border-[#dce6ef] bg-white p-6 shadow-[0_18px_45px_rgba(23,32,51,0.08)] sm:p-8">
      <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-[#1e9bdb]">FAQ</p>
      <h2 className="mt-2 text-2xl font-black tracking-[-0.02em] text-[#172033] sm:text-3xl">
        よくある質問
      </h2>

      <div className="mt-6 divide-y divide-[#edf2f6] rounded-[22px] border border-[#dce6ef] bg-[#f8fbfe] px-5">
        {data.faqs.map((faq, i) => (
          <FaqItem key={i} q={faq.q} a={faq.a} />
        ))}
      </div>
    </section>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function SideFloatingCTA({ subsidyId }: { subsidyId: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollableHeight <= 0) {
        setVisible(false);
        return;
      }
      const scrollPct = window.scrollY / scrollableHeight;
      setVisible(scrollPct > 0.2);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 hidden md:block">
      {/* ========== [NEW 2026-04-30] サイドフローティングCTA - PDF持ち帰り ========== */}
      {/* TODO: /subsidies/lp/[id]/pdf のRoute Handlerを作る。今はPhase 6以降で実装予定 */}
      <Link
        href={`/subsidies/lp/${subsidyId}/pdf`}
        className="flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-xl ring-1 ring-slate-200 transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
      >
        <span aria-hidden="true">PDF</span>
        PDFで概要を持ち帰る
      </Link>
    </div>
  );
}

"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

const GalaxyBackground = dynamic(
  () =>
    import("@/components/galaxy/GalaxyBackground").then((m) => ({
      default: m.GalaxyBackground,
    })),
  { ssr: false, loading: () => null },
);

/** 補助金一覧・解説記事などで使う固定 Galaxy 背景（オフホワイト系） */
export default function SubsidiesGalaxyBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      <div className="relative h-full w-full">
        <Suspense fallback={null}>
          <GalaxyBackground
            className="absolute inset-0 block h-full w-full"
            particleIntensity={1.2}
          />
        </Suspense>
      </div>
    </div>
  );
}

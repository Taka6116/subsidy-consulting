"use client";

import type { DiagnosisQuestion } from "@/lib/diagnosis-logic";

type StepId = DiagnosisQuestion["id"];

const ICON_MAP: Record<StepId, string> = {
  q1: "/diagnosis/q1-person.svg",
  q2: "/diagnosis/q2-building.svg",
  q3: "/diagnosis/q3-document.svg",
  q4: "/diagnosis/q4-screen.svg",
};

export default function DiagnosisStepArt({ stepId }: { stepId: StepId }) {
  const src = ICON_MAP[stepId];
  if (!src) return null;

  return (
    <div
      className="mx-auto mb-6 flex h-[108px] w-[108px] shrink-0 items-center justify-center rounded-full bg-primary-50 sm:h-[120px] sm:w-[120px]"
      aria-hidden="true"
    >
      <div
        className="h-[56px] w-[56px] sm:h-[64px] sm:w-[64px]"
        style={{
          backgroundColor: "var(--primary-700)",
          WebkitMaskImage: `url(${src})`,
          WebkitMaskSize: "contain",
          WebkitMaskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          maskImage: `url(${src})`,
          maskSize: "contain",
          maskRepeat: "no-repeat",
          maskPosition: "center",
        }}
      />
    </div>
  );
}

type DeadlineTone = "expired" | "soon" | "normal" | "always";

type Props = {
  amountLabel: string;
  rateLabel: string;
  deadlinePrimary: string;
  deadlineSecondary: string | null;
  deadlineTone: DeadlineTone;
};

function parseAmountParts(amountLabel: string): {
  main: string;
  unit: string;
  uncertain: boolean;
} {
  if (amountLabel === "要確認") {
    return { main: "要確認", unit: "", uncertain: true };
  }
  const matched = amountLabel.match(/^([\d,.]+)(万円|億円|円)$/);
  if (matched) {
    return { main: matched[1], unit: matched[2], uncertain: false };
  }
  return { main: amountLabel, unit: "", uncertain: false };
}

function FactRow({
  label,
  value,
  valueClassName,
  subValue,
}: {
  label: string;
  value: string;
  valueClassName: string;
  subValue?: string | null;
}) {
  return (
    <div className="py-2.5 first:pt-0 last:pb-0">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-[#6b7a99]">
        {label}
      </p>
      <p className={`mt-1 text-[15px] font-bold leading-snug tabular-nums ${valueClassName}`}>
        {value}
      </p>
      {subValue ? (
        <p className="mt-0.5 font-mono text-[10px] leading-snug tabular-nums text-[#6b7a99]">
          {subValue}
        </p>
      ) : null}
    </div>
  );
}

export default function SubsidyAmountHeroRow({
  amountLabel,
  rateLabel,
  deadlinePrimary,
  deadlineSecondary,
  deadlineTone,
}: Props) {
  const amount = parseAmountParts(amountLabel);
  const rateUncertain = rateLabel === "要確認";

  const deadlineValueClass =
    deadlineTone === "soon"
      ? "text-amber-700"
      : deadlineTone === "expired"
        ? "text-neutral-500"
        : "text-[#0d2640]";

  return (
    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-stretch sm:gap-3">
      {/* 左: 金額 metric well */}
      <div className="relative min-w-0 overflow-hidden rounded-xl bg-gradient-to-b from-white to-[#f4f8ff] px-4 py-3.5 shadow-[0_8px_24px_rgba(29,78,160,0.06),0_0_0_1px_rgba(29,78,160,0.09)] sm:min-w-[58%] sm:flex-[1.4] sm:px-4 sm:py-4">
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[#2563eb]/70 via-[#60a5fa]/40 to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.55)_0%,transparent_38%)]"
        />
        <div className="relative">
          <p className="text-[11px] font-semibold tracking-wide text-[#5b6b8c]">補助上限</p>
          {amount.uncertain ? (
            <p className="mt-2 text-[clamp(1.5rem,4.2vw,1.75rem)] font-bold tabular-nums leading-tight text-[#94a3b8]">
              要確認
            </p>
          ) : (
            <p className="mt-1.5 flex items-baseline gap-0.5 tabular-nums leading-none text-[#0B4F8A]">
              <span className="text-[clamp(1.5rem,4.2vw,2.125rem)] font-extrabold tracking-normal">
                {amount.main}
              </span>
              {amount.unit ? (
                <span className="text-[clamp(1rem,2.6vw,1.375rem)] font-bold">{amount.unit}</span>
              ) : null}
            </p>
          )}
          {!amount.uncertain ? (
            <p className="mt-2 text-[10px] font-medium text-[#7a8cad]">制度上の上限額</p>
          ) : null}
        </div>
      </div>

      {/* 右: ファクトレール（カード内カードにしない） */}
      <div className="flex min-w-0 flex-1 flex-col justify-center rounded-xl bg-white px-3.5 py-1 shadow-[0_0_0_1px_rgba(15,38,96,0.08)] sm:max-w-[42%] sm:px-4">
        {/* SP: 締切 → 補助率 */}
        <div className="order-1 border-b border-[#eef2f8] sm:order-2 sm:border-b-0">
          <FactRow
            label="締切"
            value={deadlinePrimary}
            valueClassName={deadlineValueClass}
            subValue={deadlineSecondary}
          />
        </div>
        <div className="order-2 sm:order-1 sm:border-b sm:border-[#eef2f8]">
          <FactRow
            label="補助率"
            value={rateLabel}
            valueClassName={rateUncertain ? "text-[#94a3b8]" : "text-[#0d2640]"}
          />
        </div>
      </div>
    </div>
  );
}

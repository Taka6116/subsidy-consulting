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
    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-stretch sm:gap-2.5">
      {/* 左: 金額ヒーロー */}
      <div className="min-w-0 flex-[1.2] rounded-xl border border-[#dbe5fa]/90 bg-gradient-to-br from-[#f5f9ff] to-[#eef4ff] px-3.5 py-3 shadow-[0_1px_2px_rgba(15,38,96,0.04)] sm:min-w-[58%] sm:flex-[1.35] sm:px-4 sm:py-3.5">
        <p className="text-[11px] font-semibold tracking-wide text-[#5b6b8c]">補助上限</p>
        {amount.uncertain ? (
          <p className="mt-1.5 text-xl font-bold tabular-nums leading-tight text-[#94a3b8] sm:text-2xl">
            要確認
          </p>
        ) : (
          <p className="mt-1 flex items-baseline gap-0.5 tabular-nums leading-none text-[#0B4F8A]">
            <span className="text-[clamp(1.5rem,4.2vw,2.125rem)] font-extrabold tracking-normal">
              {amount.main}
            </span>
            {amount.unit ? (
              <span className="text-[clamp(1rem,2.6vw,1.375rem)] font-bold">{amount.unit}</span>
            ) : null}
          </p>
        )}
        {!amount.uncertain ? (
          <p className="mt-1.5 text-[10px] font-medium text-[#7a8cad]">制度上の上限額</p>
        ) : null}
      </div>

      {/* 右: 補助率・締切（SPは 締切 → 補助率 の順） */}
      <div className="flex min-w-0 flex-1 flex-col gap-2 sm:gap-2">
        <div className="order-1 flex min-h-[4.25rem] flex-col justify-center rounded-xl border border-[#eef2f8] bg-white px-3.5 py-2.5 sm:order-2">
          <p className="text-[10px] font-medium text-[#6b7a99]">締切</p>
          <p className={`mt-1 text-base font-bold leading-tight tabular-nums ${deadlineValueClass}`}>
            {deadlinePrimary}
          </p>
          {deadlineSecondary ? (
            <p className="mt-1 text-[10px] leading-snug text-[#6b7a99]">{deadlineSecondary}</p>
          ) : null}
        </div>
        <div className="order-2 flex min-h-[4.25rem] flex-col justify-center rounded-xl border border-[#eef2f8] bg-white px-3.5 py-2.5 sm:order-1">
          <p className="text-[10px] font-medium text-[#6b7a99]">補助率</p>
          <p
            className={`mt-1 text-base font-bold leading-tight tabular-nums ${
              rateUncertain ? "text-[#94a3b8]" : "text-[#0d2640]"
            }`}
          >
            {rateLabel}
          </p>
        </div>
      </div>
    </div>
  );
}

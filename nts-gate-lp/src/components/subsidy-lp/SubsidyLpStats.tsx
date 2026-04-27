import type { SubsidyLpData } from "@/lib/subsidy-lp/buildSubsidyLpData";

type Props = { data: SubsidyLpData };

type StatCardProps = {
  label: string;
  value: string;
  sub?: string;
  tone?: "default" | "urgent" | "warning";
  index: string;
};

function StatCard({ label, value, sub, tone = "default", index }: StatCardProps) {
  const valueColor =
    tone === "urgent"
      ? "text-red-600"
      : tone === "warning"
      ? "text-[#c77700]"
      : "text-[#172033]";

  return (
    <div className="relative overflow-hidden rounded-[24px] border border-[#dce6ef] bg-white p-5 shadow-[0_18px_45px_rgba(23,32,51,0.08)]">
      <span className="absolute right-4 top-4 text-5xl font-black leading-none text-[#eaf2f8]">
        {index}
      </span>
      <p className="relative text-xs font-extrabold uppercase tracking-[0.18em] text-[#556875]">{label}</p>
      <p className={`relative mt-3 break-words text-2xl font-black leading-tight sm:text-3xl ${valueColor}`}>
        {value || "要確認"}
      </p>
      {sub && <p className="relative mt-2 text-xs font-medium leading-relaxed text-[#687987]">{sub}</p>}
    </div>
  );
}

export default function SubsidyLpStats({ data }: Props) {
  const urgencyTone =
    data.remainingDays !== null && data.remainingDays <= 14
      ? "urgent"
      : data.remainingDays !== null && data.remainingDays <= 30
      ? "warning"
      : "default";

  return (
    <section id="lp-overview" aria-label="補助金概要" className="scroll-mt-24">
      <div className="mb-5">
        <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#1e9bdb]">
          Key Information
        </p>
        <h2 className="mt-2 text-2xl font-black tracking-[-0.02em] text-[#172033] sm:text-3xl">
          相談前に確認したい4つの基本情報
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          index="01"
          label="補助上限額"
          value={data.amountLabel}
          sub="※枠・条件により異なる場合があります"
        />
        <StatCard
          index="02"
          label="補助率（自己負担の軽減）"
          value={data.rateLabel}
          sub="※類型・要件により異なる場合があります"
        />
        <StatCard
          index="03"
          label="公募期限"
          value={data.deadlineLabel}
          sub={
            data.remainingDays !== null && data.remainingDays >= 0
              ? `残り ${data.remainingDays} 日`
              : undefined
          }
          tone={urgencyTone}
        />
        <StatCard
          index="04"
          label="対象地域"
          value={data.targetArea}
          sub="※対象地域・業種は公募要領で確認が必要です"
        />
      </div>

      <div className="mt-5 overflow-hidden rounded-[24px] border border-[#dce6ef] bg-white shadow-[0_18px_45px_rgba(23,32,51,0.06)]">
        <table className="w-full text-sm">
          <tbody className="divide-y divide-[#edf2f6]">
            {[
              ["公募開始", data.acceptanceStart],
              ["所管省庁・機関", data.institutionName],
              [
                "更新日",
                `${data.updatedAt.getFullYear()}年${data.updatedAt.getMonth() + 1}月${data.updatedAt.getDate()}日`,
              ],
            ].map(([k, v]) => (
              <tr key={k}>
                <th className="w-36 bg-[#f1f6fb] px-4 py-3 text-left text-xs font-extrabold text-[#556875] sm:w-44">
                  {k}
                </th>
                <td className="px-4 py-3 font-bold text-[#172033]">{v || "要確認"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

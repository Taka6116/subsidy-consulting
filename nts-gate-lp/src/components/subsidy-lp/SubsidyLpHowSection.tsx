import Link from "next/link";
import { subsidyLpAsset } from "@/lib/subsidy-lp/assets";

const STEPS = [
  {
    num: "01",
    title: "公募要領の確認",
    body: "対象要件、補助対象経費、締切を確認し、自社で検討できる制度かを整理します。",
    active: true,
  },
  {
    num: "02",
    title: "事業計画書の作成",
    body: "補助事業の目的・取り組み内容・期待効果を整理します。採択の鍵となる最重要ステップです。",
    active: false,
  },
  {
    num: "03",
    title: "申請書類の提出",
    body: "公募期間内に所定のシステムや窓口から申請します。書類不備がないよう最終確認が重要です。",
    active: false,
  },
  {
    num: "04",
    title: "採択後の実施・完了報告",
    body: "採択通知後に事業を実施し、完了報告・確定検査を経て補助金が交付されます。",
    active: false,
  },
];

export default function SubsidyLpHowSection() {
  const handshakeImage = subsidyLpAsset("handshake.png");

  return (
    <section className="rounded-[28px] border border-[#dce6ef] bg-white p-6 shadow-[0_18px_45px_rgba(23,32,51,0.08)] sm:p-8">
      <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-[#1e9bdb]">
        Process
      </p>
      <h2 className="mt-2 text-2xl font-black tracking-[-0.02em] text-[#172033] sm:text-3xl">
        申請検討から採択後までの流れ
      </h2>

      <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step) => (
          <div
            key={step.num}
            className={`relative overflow-hidden rounded-[22px] border p-5 ${
              step.active
                ? "border-[#fd9f1b] bg-[#fff7eb]"
                : "border-[#dce6ef] bg-[#f8fbfe]"
            }`}
          >
            <span
              className={`text-xs font-black ${
                step.active ? "text-[#b56500]" : "text-[#1e9bdb]"
              }`}
            >
              STEP {step.num}
            </span>
            <p className="mt-3 text-base font-black leading-snug text-[#172033]">{step.title}</p>
            <p className="mt-3 text-sm font-medium leading-7 text-[#556875]">{step.body}</p>
            {step.active && (
              <span className="absolute right-3 top-3 rounded-full bg-[#fd9f1b] px-2.5 py-1 text-[10px] font-black text-[#172033]">
                最初に確認
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="mt-7 grid overflow-hidden rounded-[24px] border border-[#b9d8ee] bg-[#eef7fd] md:grid-cols-[1fr_230px]">
        <div className="px-5 py-5">
          <p className="text-base font-black text-[#172033]">NTSは「申請代行」ではなく「戦略設計と伴走支援」です</p>
          <p className="mt-2 text-sm font-medium leading-7 text-[#556875]">
            どの補助金をどう活用するかという設計から、採択後の実行管理までを一緒に整理します。制度の最終確認は公募要領に基づいて行います。
          </p>
          <Link
            href="/consult"
            className="mt-4 inline-flex items-center rounded-full bg-[#172033] px-5 py-3 text-xs font-extrabold text-white transition hover:bg-[#24354d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e9bdb]"
          >
            無料相談を予約する
          </Link>
        </div>
        <div className="hidden items-end justify-center bg-white/45 px-4 pt-4 md:flex">
          <img
            src={handshakeImage}
            alt=""
            aria-hidden="true"
            className="h-48 w-auto object-contain drop-shadow-[0_14px_24px_rgba(23,32,51,0.14)]"
          />
        </div>
      </div>
    </section>
  );
}

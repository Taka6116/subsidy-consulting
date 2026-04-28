import type { SubsidyLpData } from "@/lib/subsidy-lp/buildSubsidyLpData";
import { subsidyLpAsset } from "@/lib/subsidy-lp/assets";

type Props = { data: SubsidyLpData };

export default function SubsidyLpPainSection({ data }: Props) {
  const advisorImage = subsidyLpAsset("advisor.png");
  const handshakeImage = subsidyLpAsset("handshake.png");
  const teamImage = subsidyLpAsset("team.png");
  const images = [advisorImage, handshakeImage, teamImage];
  const cardPains = data.pains.slice(0, 3);

  return (
    <section className="rounded-[28px] border border-[#dce6ef] bg-white p-6 shadow-[0_18px_45px_rgba(23,32,51,0.08)] sm:p-8">
      <div className="text-center">
        <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-[#1e9bdb]">
          Problem
        </p>
        <h2 className="mt-2 text-2xl font-black leading-tight tracking-[-0.02em] text-[#172033] sm:text-3xl">
          こんなお悩みはありませんか？
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm font-medium leading-7 text-[#556875]">
          {data.name}を検討する前に、まずは自社の課題と制度の相性を整理することが重要です。
        </p>
      </div>

      <ul className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
        {cardPains.map((pain, i) => (
          <li
            key={i}
            className="group overflow-hidden rounded-[24px] border border-[#dce6ef] bg-white shadow-[0_12px_30px_rgba(23,32,51,0.06)] transition hover:-translate-y-1 hover:shadow-[0_20px_42px_rgba(23,32,51,0.10)]"
          >
            <div className="relative flex h-44 items-end justify-center overflow-hidden bg-[#eef6ff] px-4 pt-4">
              <img
                src={images[i] ?? advisorImage}
                alt=""
                aria-hidden="true"
                className="h-full w-auto object-contain object-bottom drop-shadow-[0_14px_24px_rgba(23,32,51,0.12)] transition duration-300 group-hover:scale-105"
              />
            </div>
            <div className="p-6">
              <p className="text-xs font-black tracking-[0.14em] text-[#1e9bdb]">
                ISSUE {String(i + 1).padStart(2, "0")}
              </p>
              <p className="mt-3 text-lg font-black leading-8 text-[#172033]">{pain}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-7 rounded-[22px] bg-[#f1f6fb] px-6 py-5">
        <p className="text-center text-sm font-extrabold leading-7 text-[#172033]">
          こうした課題を、補助金を使った投資計画として整理できるかを無料相談で確認できます。
        </p>
      </div>
    </section>
  );
}

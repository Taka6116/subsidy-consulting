import type { SubsidyLpData } from "@/lib/subsidy-lp/buildSubsidyLpData";
import { subsidyLpAsset } from "@/lib/subsidy-lp/assets";

type Props = { data: SubsidyLpData };

export default function SubsidyLpPainSection({ data }: Props) {
  const advisorImage = subsidyLpAsset("advisor.png");
  const issue02Image = "/icon-assets/isometric_24.webp";
  const teamImage = subsidyLpAsset("team.png");
  const images = [advisorImage, issue02Image, teamImage];
  const cardPains = data.pains.slice(0, 3);

  return (
    <section className="bg-[var(--bg-section-alt)] py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
      <div className="text-center">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
          Problem
        </p>
        <h2
          className="text-2xl font-black leading-tight tracking-[-0.02em] sm:text-3xl"
          style={{ color: "var(--text-primary)" }}
        >
          こんなお悩みはありませんか？
        </h2>
        <p
          className="mx-auto mt-4 max-w-2xl text-sm font-medium leading-7"
          style={{ color: "var(--text-secondary)" }}
        >
          {data.name}を検討する前に、まずは自社の課題と制度の相性を整理することが重要です。
        </p>
      </div>

      <ul className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
        {cardPains.map((pain, i) => (
          <li
            key={i}
            className="group overflow-hidden rounded-[24px] border bg-white shadow-[0_10px_24px_rgba(10,34,64,0.08)] transition hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(10,34,64,0.12)]"
            style={{ borderColor: "var(--border-subtle, #dce4ef)" }}
          >
            <div
              className="relative flex h-44 items-end justify-center overflow-hidden px-4 pt-4"
              style={{ background: "var(--bg-base)" }}
            >
              <img
                src={images[i] ?? advisorImage}
                alt=""
                aria-hidden="true"
                className="h-full w-auto object-contain object-bottom drop-shadow-[0_8px_16px_rgba(10,34,64,0.12)] transition duration-300 group-hover:scale-105"
              />
            </div>
            <div className="p-6">
              <p
                className="text-xs font-black tracking-[0.14em]"
                style={{ color: "var(--text-muted)" }}
              >
                ISSUE {String(i + 1).padStart(2, "0")}
              </p>
              <p
                className="mt-3 text-lg font-black leading-8"
                style={{ color: "var(--text-primary)" }}
              >
                {pain}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <div
        className="mt-7 rounded-[22px] border px-6 py-5"
        style={{ background: "var(--bg-base)", borderColor: "var(--border-subtle, #dce4ef)" }}
      >
        <p
          className="text-center text-sm font-extrabold leading-7"
          style={{ color: "var(--text-primary)" }}
        >
          こうした課題を、補助金を使った投資計画として整理できるかを無料相談で確認できます。
        </p>
      </div>

      <div
        className="mt-12 border-t pt-8 text-center"
        style={{ borderColor: "var(--border-subtle, #dce4ef)" }}
      >
        <p className="mb-2 text-sm uppercase tracking-widest text-gray-400">Solution</p>
        <p
          className="text-lg font-medium"
          style={{ color: "var(--text-secondary)" }}
        >
          同じ課題を持つ企業が、この補助金をどう使えるか。
        </p>
        <svg
          className="mx-auto mt-4"
          style={{ color: "var(--text-muted)" }}
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </div>
      </div>
    </section>
  );
}

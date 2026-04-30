import type { SubsidyLpData } from "@/lib/subsidy-lp/buildSubsidyLpData";
import { subsidyLpAsset } from "@/lib/subsidy-lp/assets";

type Props = { data: SubsidyLpData };

export default function SubsidyLpPainSection({ data }: Props) {
  const advisorImage = subsidyLpAsset("advisor.png");
  const issue02Image = "/icon-assets/isometric_24.webp";
  const teamImage = subsidyLpAsset("team.png");
  const images = [advisorImage, issue02Image, teamImage];
  const cardPains = data.pains.slice(0, 3);
  const verticalPains = cardPains.map((pain, i) => ({
    headline: pain,
    sub:
      i === 0
        ? "その課題は、設備・IT・新規事業への投資として整理できる可能性があります。"
        : i === 1
          ? "自己負担だけで判断する前に、補助対象経費として扱えるか確認しておく価値があります。"
          : "早めに制度との相性を見ておくことで、締切前に慌てず動き出せます。",
    image: images[i] ?? advisorImage,
  }));

  return (
    <section className="bg-[var(--bg-section-alt)] py-20 md:py-32">
      {/* ========== [LEGACY 2026-04-30] 旧お悩み3カード横並び - ロールバック時は下のコメントアウトを解除 ========== */}
      {/*
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
            <li key={i}>
              ISSUE {String(i + 1).padStart(2, "0")} {pain}
            </li>
          ))}
        </ul>
      </div>
      */}

      {/* ========== [NEW 2026-04-30] 縦スクロール式お悩み - 既存Isometric画像を流用 ========== */}
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
          Problem
        </p>
        {/* <h2>こんなお悩みはありませんか？</h2> ← 旧 */}
        <h2
          className="text-2xl font-black leading-tight tracking-[-0.02em] sm:text-4xl"
          style={{ color: "var(--text-primary)" }}
        >
          「うちは関係ない」と思っていませんか？
        </h2>
        <p
          className="mx-auto mt-4 max-w-2xl text-sm font-medium leading-7"
          style={{ color: "var(--text-secondary)" }}
        >
          {data.name}は、制度名だけを見ると遠く感じるかもしれません。けれど、実際にはいま抱えている経営課題から検討が始まります。
        </p>
      </div>

      <div className="mx-auto mt-16 max-w-5xl space-y-20 px-4 sm:px-6 md:mt-24 md:space-y-28">
        {verticalPains.map((item, i) => (
          <div
            key={i}
            className="grid items-center gap-8 md:grid-cols-2 md:gap-14"
          >
            <div className={i % 2 === 1 ? "md:order-2" : ""}>
              <div
                className="flex min-h-64 items-end justify-center overflow-hidden rounded-[28px] border px-6 pt-8"
                style={{ background: "var(--bg-base)", borderColor: "var(--border-subtle, #dce4ef)" }}
              >
                <img
                  src={item.image}
                  alt=""
                  aria-hidden="true"
                  className="h-60 w-auto object-contain object-bottom drop-shadow-[0_12px_24px_rgba(10,34,64,0.14)]"
                />
              </div>
            </div>
            <div className="text-center md:text-left">
              <p
                className="text-xs font-black uppercase tracking-[0.2em]"
                style={{ color: "var(--text-muted)" }}
              >
                ISSUE {String(i + 1).padStart(2, "0")}
              </p>
              <p
                className="mt-3 text-2xl font-black leading-tight tracking-[-0.02em] sm:text-3xl md:text-4xl md:leading-[1.25]"
                style={{ color: "var(--text-primary)" }}
              >
                {item.headline}
              </p>
              <p
                className="mt-5 text-sm font-medium leading-7 sm:text-base"
                style={{ color: "var(--text-secondary)" }}
              >
                {item.sub}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-16 max-w-3xl px-4 text-center sm:px-6">
        <div
          className="rounded-[22px] border px-6 py-5"
          style={{ background: "var(--bg-base)", borderColor: "var(--border-subtle, #dce4ef)" }}
        >
          <p
            className="text-sm font-extrabold leading-7"
            style={{ color: "var(--text-primary)" }}
          >
            こうした課題を、補助金を使った投資計画として整理できるかを無料相談で確認できます。
          </p>
        </div>
      </div>
    </section>
  );
}

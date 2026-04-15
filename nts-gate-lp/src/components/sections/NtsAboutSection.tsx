"use client";

import Image from "next/image";

const HERO_BG = "/images/subsidy-footer.jpg";

/**
 * 現行 TrustSection と同一（レイアウト・文言・スタイル）
 */
export default function NtsAboutSection() {
  return (
    <section className="relative z-10 overflow-hidden py-[calc(5rem+2.35rem)] md:py-[calc(7rem+2.35rem)] lg:py-[calc(8rem+2.35rem)]">
      <Image
        src={HERO_BG}
        alt=""
        fill
        className="object-cover object-[30%_42%]"
        sizes="100vw"
        priority={false}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(15,32,39,0.58) 0%, rgba(44,83,100,0.45) 45%, rgba(15,32,39,0.55) 100%)",
        }}
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-container px-6">
        <h2 className="font-heading text-h1 font-bold leading-tight text-white drop-shadow-sm">
          補助金活用の専門チームが、
          <br />
          あなたの経営課題に寄り添います。
        </h2>

        <div className="mt-10 grid max-w-5xl grid-cols-1 gap-4 text-body leading-loose text-white/95 drop-shadow-sm md:mt-12 md:grid-cols-3 md:text-lg md:leading-loose">
          <div className="rounded-xl border border-white/20 bg-white/[0.08] p-5">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">戦略設計</p>
            <p className="mt-2 text-sm leading-relaxed text-white/95 md:text-base">
              補助金を使う目的と順序を、経営計画と照らし合わせながら設計します。
            </p>
          </div>
          <div className="rounded-xl border border-white/20 bg-white/[0.08] p-5">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">申請サポート</p>
            <p className="mt-2 text-sm leading-relaxed text-white/95 md:text-base">
              提携行政書士と連携し、書類準備から採択まで伴走します。
            </p>
          </div>
          <div className="rounded-xl border border-white/20 bg-white/[0.08] p-5">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">採択後の伴走</p>
            <p className="mt-2 text-sm leading-relaxed text-white/95 md:text-base">
              設備の導入定着・効果検証・次の一手の設計まで、1年間関わり続けます。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

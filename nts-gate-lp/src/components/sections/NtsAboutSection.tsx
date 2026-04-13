"use client";

import Image from "next/image";

const HERO_BG = "/images/subsidy-footer.jpg";

/**
 * 現行 TrustSection と同一（レイアウト・文言・スタイル）
 */
export default function NtsAboutSection() {
  return (
    <section className="relative z-10 overflow-hidden py-16 md:py-24 lg:py-28">
      <Image
        src={HERO_BG}
        alt=""
        fill
        className="object-cover"
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
          日本提携支援について
        </h2>

        <div className="mt-10 max-w-3xl space-y-6 text-body leading-loose text-white/95 drop-shadow-sm md:mt-12 md:text-lg md:leading-loose">
          <p className="font-heading text-h2 font-bold leading-snug text-white md:text-[1.65rem]">
            <span className="text-white">&ldquo;相談先がない&rdquo;</span>
          </p>
          <p className="text-lg font-medium text-white/95 md:text-xl">
            ――それが私たちの出発点。
          </p>
          <p>
            「相談先がない」「もっと早く相談すればよかった」という経営者の切実な声に応え、
            私たちは独立した相談窓口を創設しました。
          </p>
          <p>
            そして、豊富な専門家ネットワークを駆使し、各企業、各経営者が納得できる最適な選択肢を提供し続けてまいりました。
            廃業の危機や将来の不安を共に乗り越えることで、企業の未来を守り、地域や従業員が持続的に継続、
            発展していくと信じているからです。
          </p>
          <p>
            私たちはこれからも経営者の伴走者として、全力で未来への一歩を支援いたします。
          </p>
        </div>
      </div>
    </section>
  );
}

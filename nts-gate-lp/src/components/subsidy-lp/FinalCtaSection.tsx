import Image from "next/image";
import consultantImage from "../../../icon-assets/PANA3025.webp";

export default function FinalCtaSection() {
  return (
    <section className="relative overflow-hidden bg-[#0B173A] py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col items-center gap-10 md:flex-row">
          <div className="flex-1 text-white">
            <p className="mb-2 text-sm font-medium text-[#FEA00D]">補助金のプロが、</p>
            <h2 className="mb-4 text-2xl font-bold leading-tight md:text-4xl">
              貴社の挑戦を
              <br />
              サポートします
            </h2>
            <p className="text-sm leading-relaxed text-white/70">
              「自社が対象か知りたい」「まずは相談だけしたい」
              <br />
              そんな方もお気軽にご相談ください。
            </p>
          </div>

          <div className="flex flex-col items-center gap-3">
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/60">
              簡単30秒で完了
            </span>
            <a
              href="#contact"
              id="cta-main"
              className="inline-flex w-64 items-center justify-center rounded-lg bg-[#FEA00D] px-8 py-4 text-base font-bold text-white transition-colors hover:bg-[#e8900a]"
            >
              無料相談を予約する →
            </a>
            <a
              href="#"
              className="inline-flex w-64 items-center justify-center rounded-lg border border-white/40 px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              資料をダウンロードする
            </a>
          </div>

          <div className="hidden w-48 flex-shrink-0 md:block">
            <Image
              src={consultantImage}
              alt="専門コンサルタント"
              className="w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

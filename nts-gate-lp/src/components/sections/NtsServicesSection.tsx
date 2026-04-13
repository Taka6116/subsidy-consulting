"use client";

import { motion, useReducedMotion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "対象制度の特定",
    subtitle: "何が使えるかを知る",
    body: "企業名・業種・投資計画をヒアリング。活用できる補助金を横断的に調査し、最適な制度を選定します。",
    accent: "照会は1分・完全無料",
  },
  {
    number: "02",
    title: "書類作成サポート",
    subtitle: "採択率を左右する書類を一緒に",
    body: "事業計画書・申請書類の作成をプロがサポート。要件の解釈から文章化まで、二人三脚で仕上げます。",
    accent: "採択率に直結するフェーズ",
  },
  {
    number: "03",
    title: "申請手続き代行",
    subtitle: "複雑な手続きをすべて代行",
    body: "ポータル操作・添付書類の準備・提出まで一式対応。締切管理も含め、手続きの煩雑さから解放します。",
    accent: "窓口はNTSが担当",
  },
  {
    number: "04",
    title: "採択後の報告対応",
    subtitle: "採択がゴールではない",
    body: "補助事業の実施報告・実績報告まで、最後まで伴走します。採択後の義務も安心してお任せください。",
    accent: "最後まで責任を持って伴走",
  },
];

export default function NtsServicesSection() {
  const shouldReduceMotion = useReducedMotion();

  const fadeUp = (delay: number) =>
    shouldReduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 28 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.15 },
          transition: {
            duration: 0.55,
            ease: [0.22, 1, 0.36, 1] as const,
            delay,
          },
        };

  return (
    <section
      className="relative py-28 md:py-36"
      style={{ zIndex: 10 }}
      aria-labelledby="home-nts-services-heading"
    >
      <div className="mx-auto max-w-6xl px-6 md:px-8">
        {/* ヘッダー */}
        <motion.div className="mb-16 text-center" {...fadeUp(0)}>
          <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.25em] text-white/40">
            NTS の サポート 内 容
          </p>
          <h2
            id="home-nts-services-heading"
            className="font-heading text-3xl font-bold leading-tight text-white md:text-[2.6rem]"
          >
            照会から採択後まで、
            <br />
            NTSがすべて対応します。
          </h2>
          <p className="mt-5 text-base leading-relaxed text-white/55">
            「申請してみたいけど、何から始めればいいかわからない」
            <br className="hidden sm:block" />
            そのまま相談してください。最初の一歩からご一緒します。
          </p>
        </motion.div>

        {/* ステップ群ラッパー */}
        <div className="relative">
          {/* PC用：カード上部の番号バッジを横につなぐ線 */}
          <div
            className="absolute top-[2.6rem] hidden lg:block"
            style={{
              left: "calc(12.5% + 1.6rem)",
              right: "calc(12.5% + 1.6rem)",
              height: "1px",
              background:
                "linear-gradient(to right, rgba(255,255,255,0.0), rgba(255,255,255,0.18) 15%, rgba(255,255,255,0.18) 85%, rgba(255,255,255,0.0))",
            }}
            aria-hidden="true"
          />

          {/* モバイル用：カード左側の番号バッジを縦につなぐ線 */}
          <div
            className="absolute left-[2.4rem] top-10 block lg:hidden"
            style={{
              height: "calc(100% - 5rem)",
              width: "1px",
              background:
                "linear-gradient(to bottom, rgba(255,255,255,0.0), rgba(255,255,255,0.15) 10%, rgba(255,255,255,0.15) 90%, rgba(255,255,255,0.0))",
            }}
            aria-hidden="true"
          />

          {/* グリッド：PC=4列横、モバイル=1列縦 */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-4 lg:gap-5">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                {...fadeUp(i * 0.08)}
                className="group relative flex lg:flex-col items-start gap-5 rounded-2xl border border-white/[0.08] bg-white/[0.05] p-6 backdrop-blur-[14px] [-webkit-backdrop-filter:blur(14px)] transition-all duration-300 hover:border-white/[0.16] hover:bg-white/[0.08]"
              >
                {/* 番号バッジ */}
                <div className="relative flex-none">
                  <div className="flex h-[3.2rem] w-[3.2rem] items-center justify-center rounded-full border border-white/20 bg-white/[0.08]">
                    <span className="font-heading text-lg font-bold text-white/90">
                      {step.number}
                    </span>
                  </div>
                  <div className="absolute inset-0 rounded-full bg-blue-400/20 opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100" />
                </div>

                {/* テキスト */}
                <div className="flex-1 lg:pt-4">
                  <span className="mb-2 inline-block rounded-full border border-white/12 bg-white/[0.06] px-2.5 py-0.5 text-[10px] font-medium tracking-wide text-white/45">
                    {step.accent}
                  </span>
                  <h3 className="mb-1 text-[1rem] font-bold leading-snug text-white">
                    {step.title}
                  </h3>
                  <p className="mb-2 text-[0.75rem] font-medium text-white/38">
                    {step.subtitle}
                  </p>
                  <p className="text-sm leading-relaxed text-white/62">
                    {step.body}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* 下部注記 */}
        <motion.p
          className="mt-10 text-center text-xs text-white/30"
          {...fadeUp(0.45)}
        >
          ※
          照会・ご相談は完全無料です。費用が発生するのは申請サポートをご依頼いただいた場合のみです（手付金15万円＋採択時成功報酬）。
        </motion.p>
      </div>
    </section>
  );
}

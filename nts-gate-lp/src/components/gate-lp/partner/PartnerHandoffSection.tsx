"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.12 },
  transition: { duration: 0.55, ease: EASE_OUT, delay },
});

// ────────────────────────────────────────────────────────────
// アイコン
// ────────────────────────────────────────────────────────────
type IconType = "relation" | "field" | "proposal" | "knowledge" | "strategy" | "network";

function Icon({ type }: { type: IconType }) {
  const base = "h-5 w-5";
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#eef4ff] text-[#1a56db]">
      {type === "relation" && (
        <svg viewBox="0 0 24 24" className={base} fill="none" aria-hidden>
          <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.7" />
          <circle cx="17" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.7" />
          <path d="M3 19c.7-2.8 2.8-4.5 6-4.5s5.3 1.7 6 4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          <path d="M17 14c1.8.4 3.2 1.6 3.8 3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      )}
      {type === "field" && (
        <svg viewBox="0 0 24 24" className={base} fill="none" aria-hidden>
          <path d="M12 3L4 9v12h5v-6h6v6h5V9L12 3Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        </svg>
      )}
      {type === "proposal" && (
        <svg viewBox="0 0 24 24" className={base} fill="none" aria-hidden>
          <path d="M8 5h8l3 4-3 4H8V5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
          <path d="M8 13v6M12 13v6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      )}
      {type === "knowledge" && (
        <svg viewBox="0 0 24 24" className={base} fill="none" aria-hidden>
          <path d="M12 4C8.7 4 6 6.7 6 10c0 2.2 1.2 4.1 3 5.2V17h6v-1.8c1.8-1.1 3-3 3-5.2 0-3.3-2.7-6-6-6Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
          <path d="M9 20h6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      )}
      {type === "strategy" && (
        <svg viewBox="0 0 24 24" className={base} fill="none" aria-hidden>
          <path d="M3 19h18M7 19V9l5-5 5 5v10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="10" y="13" width="4" height="6" rx="0.5" stroke="currentColor" strokeWidth="1.7" />
        </svg>
      )}
      {type === "network" && (
        <svg viewBox="0 0 24 24" className={base} fill="none" aria-hidden>
          <circle cx="12" cy="5" r="2" stroke="currentColor" strokeWidth="1.7" />
          <circle cx="5" cy="19" r="2" stroke="currentColor" strokeWidth="1.7" />
          <circle cx="19" cy="19" r="2" stroke="currentColor" strokeWidth="1.7" />
          <path d="M12 7v4M10.3 12.5 6.4 17M13.7 12.5l3.9 4.5M8 19h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      )}
    </span>
  );
}

// ────────────────────────────────────────────────────────────
// 入口カード
// ────────────────────────────────────────────────────────────
function InputCard({
  label,
  accent,
  items,
}: {
  label: string;
  accent: string;
  items: { type: IconType; text: string }[];
}) {
  return (
    <div className="rounded-2xl border border-[#cdddf0] bg-white p-4 shadow-[0_6px_20px_rgba(12,42,72,0.07)]">
      <p className={`mb-3 text-sm font-black tracking-widest ${accent}`}>{label}</p>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.text} className="flex items-center gap-2.5 text-[13px] font-semibold text-[#1e3a5f]">
            <Icon type={item.type} />
            {item.text}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// 中央カード
// ────────────────────────────────────────────────────────────
function CenterCard({
  title,
  items,
  accent = false,
}: {
  title: string;
  items: string[];
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-3 text-sm ${
        accent
          ? "border-[#b3d9cc] bg-[#f0fbf7]"
          : "border-[#cdddf0] bg-white"
      } shadow-[0_4px_14px_rgba(12,42,72,0.07)]`}
    >
      <p className={`mb-2 text-[11px] font-black tracking-widest ${accent ? "text-[#1a7a5e]" : "text-[#1a56db]"}`}>
        {title}
      </p>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-1.5 text-[12px] font-semibold leading-snug text-[#1e3a5f]">
            <span className={`mt-[4px] h-1.5 w-1.5 shrink-0 rounded-full ${accent ? "bg-[#1a7a5e]" : "bg-[#1a56db]"}`} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// 山ゴールコンポーネント
// ────────────────────────────────────────────────────────────
function MountainGoal() {
  return (
    <div className="relative flex flex-col items-center">
      {/* 背景画像（装飾のみ） */}
      <div className="relative h-[180px] w-[220px] sm:h-[200px] sm:w-[240px]">
        <Image
          src="/images/nts_partner_progress_destination_bg_v1.png"
          alt=""
          fill
          className="object-contain opacity-80"
          sizes="240px"
          aria-hidden
        />
      </div>
      {/* ラベル（画像の上に重ねる） */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
        <p className="whitespace-nowrap text-[15px] font-black tracking-[0.08em] text-[#071b46] drop-shadow-sm md:text-[17px]">
          お客様の前進へ
        </p>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// セクション本体
// ────────────────────────────────────────────────────────────
export default function PartnerHandoffSection() {
  const reduce = useReducedMotion();
  const fu = (delay: number) => (reduce ? {} : fadeUp(delay));

  const yourItems: { type: IconType; text: string }[] = [
    { type: "relation", text: "お客様との信頼・関係性" },
    { type: "field", text: "現場の相談・経営課題の把握" },
    { type: "proposal", text: "提案したい商材・サービス" },
  ];

  const ntsItems: { type: IconType; text: string }[] = [
    { type: "knowledge", text: "補助金制度の知見・最新情報" },
    { type: "strategy", text: "活用戦略の設計力・投資判断の整理" },
    { type: "network", text: "専門家ネットワーク・実行支援体制" },
  ];

  return (
    <section
      className="relative overflow-hidden bg-[#f0f5fb] py-20 md:py-28"
      aria-labelledby="joint-progress-heading"
    >
      {/* 上部グラデーション */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/80 to-transparent" />

      <div className="relative mx-auto max-w-[1200px] px-5 sm:px-8">

        {/* ── 見出し・リード ── */}
        <motion.div className="mb-12 text-center md:mb-16" {...fu(0)}>
          <h2
            id="joint-progress-heading"
            className="font-heading text-3xl font-bold leading-tight text-[#071b46] md:text-4xl"
          >
            御社とともに、
            <br />
            お客様の前進を支える連携へ。
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[#31445f] md:text-lg">
            お客様の課題を一緒に深く捉え、提案や事業の前進につながる選択肢をともに考える。
            <br className="hidden md:inline" />
            NTSは補助金活用の視点も添えながら、御社の顧客支援と提案活動をバックアップします。
          </p>
        </motion.div>

        {/* ── PC 図解: 横並び ── */}
        <div className="hidden lg:block">
          <div className="grid grid-cols-[220px_1fr_220px] items-center gap-0">

            {/* 左: 入口ノード */}
            <motion.div className="space-y-4" {...fu(0.06)}>
              <InputCard label="御社" accent="text-[#1a56db]" items={yourItems} />
              <InputCard label="NTS" accent="text-[#0d7c5e]" items={ntsItems} />
            </motion.div>

            {/* 中央: 合流ゾーン + 共同パス + ゴール */}
            <motion.div className="relative flex items-center" {...fu(0.12)} aria-hidden>
              {/* 左→中央への収束SVG */}
              <svg
                className="absolute left-0 top-0 h-full w-[100px] shrink-0"
                viewBox="0 0 100 260"
                preserveAspectRatio="none"
                fill="none"
              >
                <path d="M0 65 C30 65 70 120 100 130" stroke="#c2d5ee" strokeWidth="2" />
                <path d="M0 195 C30 195 70 140 100 130" stroke="#c2d5ee" strokeWidth="2" />
              </svg>

              {/* 中央ゾーン */}
              <div className="mx-[100px] flex-1">
                {/* 共同ゾーンヘッダー */}
                <div className="mb-4 rounded-2xl border-2 border-[#1a56db]/30 bg-white px-5 py-3 text-center shadow-[0_4px_16px_rgba(26,86,219,0.10)]">
                  <p className="text-sm font-black tracking-widest text-[#1a56db]">御社 × NTS</p>
                  <p className="mt-0.5 text-base font-black leading-snug text-[#071b46]">一緒に深く考える</p>
                </div>

                {/* 主要カード3枚 */}
                <div className="grid grid-cols-3 gap-2.5">
                  <CenterCard
                    title="課題の深掘り"
                    items={["本質的な課題の特定", "制約条件の整理", "投資背景の確認"]}
                  />
                  <CenterCard
                    title="解決の選択肢を広げる"
                    items={["解決アプローチの検討", "優先順位の整理", "実現可能性の評価"]}
                  />
                  <CenterCard
                    title="提案の質を高める"
                    items={["ストーリーの構築", "効果・メリットの最大化", "意思決定の後押し"]}
                  />
                </div>

                {/* 補助カード3枚 */}
                <div className="mt-2.5 grid grid-cols-3 gap-2.5">
                  <CenterCard title="補助金活用の知見" items={["制度選定の視点"]} accent />
                  <CenterCard title="投資背景の整理" items={["優先課題の明確化"]} accent />
                  <CenterCard title="専門家との連携" items={["行政書士・士業連携"]} accent />
                </div>

                {/* 中央下補助文 */}
                <p className="mt-3 text-center text-[12px] font-semibold text-[#4a6580]">
                  御社とNTSがともに考え、お客様の前進につながる提案へ。
                </p>

                {/* 中央→右への共同パス矢印 */}
                <div className="mt-4 flex items-center justify-center">
                  <div className="h-0.5 flex-1 bg-gradient-to-r from-[#1a56db]/40 to-[#1a56db]" />
                  <svg className="mx-1 h-5 w-5 shrink-0 text-[#1a56db]" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                    <path d="M8 4l6 6-6 6V4Z" />
                  </svg>
                </div>
              </div>

              {/* 右: ゴール（山） */}
              <div className="shrink-0">
                <MountainGoal />
              </div>
            </motion.div>

            {/* 右: CTA */}
            <motion.div {...fu(0.2)}>
              <div className="rounded-2xl border border-[#cdddf0] bg-white p-5 shadow-[0_6px_20px_rgba(12,42,72,0.08)]">
                <p className="mb-1 text-sm font-black tracking-widest text-[#1a56db]">ご相談</p>
                <p className="mb-3 text-base font-black text-[#071b46]">案件のご相談はこちら</p>
                <p className="mb-4 text-[12px] leading-relaxed text-[#4a6580]">
                  提案中の案件や、今後のご計画についてお気軽にご相談ください。
                </p>
                <a
                  href="#contact"
                  className="block w-full rounded-xl bg-[#1a56db] py-3 text-center text-sm font-black tracking-wide text-white shadow-[0_4px_14px_rgba(26,86,219,0.25)] transition hover:bg-[#1645b8]"
                >
                  相談する
                </a>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── SP 縦構成 ── */}
        <div className="lg:hidden space-y-6">
          {/* 入口ノード2枚 */}
          <motion.div className="grid grid-cols-1 gap-4 sm:grid-cols-2" {...fu(0.06)}>
            <InputCard label="御社" accent="text-[#1a56db]" items={yourItems} />
            <InputCard label="NTS" accent="text-[#0d7c5e]" items={ntsItems} />
          </motion.div>

          {/* 収束線（装飾） */}
          <div className="flex justify-center" aria-hidden>
            <svg width="40" height="32" viewBox="0 0 40 32" fill="none">
              <path d="M10 0 Q10 16 20 24 Q30 16 30 0" stroke="#c2d5ee" strokeWidth="2" fill="none" />
              <path d="M16 24 L20 32 L24 24" stroke="#1a56db" strokeWidth="2" strokeLinejoin="round" fill="none" />
            </svg>
          </div>

          {/* 共同ゾーン */}
          <motion.div {...fu(0.1)}>
            <div className="rounded-2xl border-2 border-[#1a56db]/30 bg-white p-4 shadow-[0_4px_16px_rgba(26,86,219,0.09)]">
              <div className="mb-3 text-center">
                <p className="text-sm font-black tracking-widest text-[#1a56db]">御社 × NTS</p>
                <p className="mt-0.5 text-base font-black text-[#071b46]">一緒に深く考える</p>
              </div>
              <div className="space-y-2.5">
                <CenterCard
                  title="課題の深掘り"
                  items={["本質的な課題の特定", "制約条件の整理", "投資背景の確認"]}
                />
                <CenterCard
                  title="解決の選択肢を広げる"
                  items={["解決アプローチの検討", "優先順位の整理", "実現可能性の評価"]}
                />
                <CenterCard
                  title="提案の質を高める"
                  items={["ストーリーの構築", "効果・メリットの最大化", "意思決定の後押し"]}
                />
                <div className="grid grid-cols-3 gap-2">
                  <CenterCard title="補助金活用の知見" items={["制度選定の視点"]} accent />
                  <CenterCard title="投資背景の整理" items={["優先課題の明確化"]} accent />
                  <CenterCard title="専門家との連携" items={["行政書士・士業連携"]} accent />
                </div>
              </div>
              <p className="mt-3 text-center text-[11px] font-semibold text-[#4a6580]">
                御社とNTSがともに考え、お客様の前進につながる提案へ。
              </p>
            </div>
          </motion.div>

          {/* 矢印 */}
          <div className="flex justify-center" aria-hidden>
            <svg width="28" height="24" viewBox="0 0 28 24" fill="none">
              <path d="M14 0 V16 M7 10 L14 20 L21 10" stroke="#1a56db" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {/* 山ゴール */}
          <motion.div className="flex justify-center" {...fu(0.16)}>
            <MountainGoal />
          </motion.div>

          {/* CTA */}
          <motion.div {...fu(0.2)}>
            <div className="rounded-2xl border border-[#cdddf0] bg-white p-5 shadow-[0_6px_20px_rgba(12,42,72,0.08)]">
              <p className="mb-1 text-sm font-black tracking-widest text-[#1a56db]">ご相談</p>
              <p className="mb-2 text-base font-black text-[#071b46]">案件のご相談はこちら</p>
              <p className="mb-4 text-[12px] leading-relaxed text-[#4a6580]">
                提案中の案件や、今後のご計画についてお気軽にご相談ください。
              </p>
              <a
                href="#contact"
                className="block w-full rounded-xl bg-[#1a56db] py-3 text-center text-sm font-black tracking-wide text-white shadow-[0_4px_14px_rgba(26,86,219,0.25)] transition hover:bg-[#1645b8]"
              >
                相談する
              </a>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}

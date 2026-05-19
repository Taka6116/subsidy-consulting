"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import sakurabaPhoto from "../../../icon-assets/PANA2727.webp";
import seinoPhoto from "../../../icon-assets/PANA2741.webp";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

// ============================================================
// データ
// ============================================================
type Consultant = {
  id: string;
  name: string;
  title: string;
  photo: typeof sakurabaPhoto;
  photoObjectPosition: string;
  photoScale: number;
  message: string;
  supports: string[];
  specialty: string;
  watchPoints: string;
  /** 展開時にパネルが開く方向 */
  panelSide: "right" | "left";
};

const CONSULTANTS: Consultant[] = [
  {
    id: "sakuraba",
    name: "櫻庭真之介",
    title: "中小企業診断士",
    photo: sakurabaPhoto,
    photoObjectPosition: "50% 20%",
    photoScale: 1.08,
    panelSide: "right",
    message: "制度を見つけるだけで終わらせず、申請準備から採択後の活用相談まで継続して支援します。",
    supports: [
      "事業計画の整理・補助金活用戦略の設計",
      "申請準備・必要書類の整理サポート",
      "採択後の活用相談・効果検証の伴走",
    ],
    specialty: "事業計画策定 / 補助金活用設計",
    watchPoints: "補助金を「使える制度」で終わらせず、事業成長につながっているかを定期的に確認します。",
  },
  {
    id: "seino",
    name: "清野洋司",
    title: "中小企業診断士",
    photo: seinoPhoto,
    photoObjectPosition: "50% 18%",
    photoScale: 1.08,
    panelSide: "left",
    message: "制度の選定だけでなく、申請後の運用や効果測定まで、担当者として継続的に伴走します。",
    supports: [
      "現状ヒアリングと本質課題の整理",
      "最適な制度の選定・申請準備の支援",
      "導入後の効果測定・改善相談",
    ],
    specialty: "課題整理 / 採択後の活用支援",
    watchPoints: "投資が計画どおりに事業の成果につながっているか、現場目線で定点観測します。",
  },
];

function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.1 },
    transition: { duration: 0.6, ease: EASE, delay },
  };
}

// ============================================================
// セクション本体
// ============================================================
export default function NtsWarmIntroMergedSection() {
  const reduce = useReducedMotion();
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleOpen = (id: string) => setActiveId(id);
  const handleClose = () => setActiveId(null);

  return (
    <section
      aria-labelledby="warm-merged-heading"
      className="relative overflow-hidden bg-[#f0f4fa] py-20 md:py-28"
    >
      <div className="relative z-10 mx-auto w-full max-w-[1280px] px-5 sm:px-8 xl:px-10">

        {/* ── 見出し ── */}
        <motion.div {...(reduce ? {} : fadeUp(0))} className="mb-12 text-center md:mb-14">
          <h2
            id="warm-merged-heading"
            className="text-[1.9rem] font-black leading-snug tracking-tight text-[#0c2a48] md:text-[2.6rem] lg:text-[2.8rem]"
            style={{ fontFamily: "'Noto Sans JP', sans-serif" }}
          >
            「補助金が使えます」。
            <br className="hidden sm:block" />
            その先に、1年間の伴走があります。
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-[0.97rem] leading-relaxed text-[#4a6a82] md:text-[1.05rem]">
            制度を見つけるだけで終わらせず、申請準備から採択後の活用相談まで、担当者が継続して支援します。
          </p>
        </motion.div>

        {/* ── カードエリア（PC: md以上） ── */}
        <div className="hidden md:block">
          {activeId === null ? (
            /* ===== 通常時: 2枚横並び ===== */
            <div className="grid grid-cols-2 gap-6 lg:gap-8">
              {CONSULTANTS.map((c, i) => (
                <motion.div
                  key={c.id}
                  {...(reduce ? {} : fadeUp(0.07 + i * 0.07))}
                >
                  <NormalCard c={c} onOpen={() => handleOpen(c.id)} />
                </motion.div>
              ))}
            </div>
          ) : (
            /* ===== 展開時 ===== */
            (() => {
              const active = CONSULTANTS.find((c) => c.id === activeId)!;
              const isLeft = active.panelSide === "left"; // 清野さん → パネルが左

              return (
                <div className={`flex items-stretch gap-0 overflow-hidden rounded-2xl border border-[#cce0f0] bg-white shadow-[0_4px_24px_rgba(18,56,110,0.10)] ${isLeft ? "flex-row-reverse" : "flex-row"}`}>
                  {/* 写真カード — 元の位置・サイズを維持 */}
                  <div className="w-1/2 shrink-0">
                    <PhotoCard c={active} onClose={handleClose} isActive />
                  </div>

                  {/* プロフィールパネル — 横に広がる */}
                  <AnimatePresence initial={false}>
                    <motion.div
                      key={`panel-${active.id}`}
                      initial={reduce ? {} : { opacity: 0, width: 0, x: isLeft ? -16 : 16 }}
                      animate={{ opacity: 1, width: "50%", x: 0 }}
                      exit={reduce ? {} : { opacity: 0, width: 0, x: isLeft ? -16 : 16 }}
                      transition={{ duration: reduce ? 0 : 0.32, ease: EASE }}
                      className="overflow-hidden border-l border-[#dce9f5]"
                      style={isLeft ? { borderLeft: "none", borderRight: "1px solid #dce9f5" } : {}}
                    >
                      <ProfilePanel c={active} onClose={handleClose} />
                    </motion.div>
                  </AnimatePresence>
                </div>
              );
            })()
          )}
        </div>

        {/* ── カードエリア（SP: md未満） ── */}
        <div className="flex flex-col gap-5 md:hidden">
          {activeId === null ? (
            /* 通常時: 縦積み */
            CONSULTANTS.map((c, i) => (
              <motion.div
                key={c.id}
                {...(reduce ? {} : fadeUp(0.07 + i * 0.07))}
              >
                <NormalCard c={c} onOpen={() => handleOpen(c.id)} />
              </motion.div>
            ))
          ) : (
            /* 展開時: 選択者のみ表示 */
            (() => {
              const active = CONSULTANTS.find((c) => c.id === activeId)!;
              return (
                <div className="overflow-hidden rounded-2xl border border-[#cce0f0] bg-white shadow-[0_4px_20px_rgba(18,56,110,0.09)]">
                  <PhotoCard c={active} onClose={handleClose} isActive spMode />
                  <AnimatePresence initial={false}>
                    <motion.div
                      key={`sp-panel-${active.id}`}
                      initial={reduce ? {} : { opacity: 0, height: 0, y: 12 }}
                      animate={{ opacity: 1, height: "auto", y: 0 }}
                      exit={reduce ? {} : { opacity: 0, height: 0, y: 12 }}
                      transition={{ duration: reduce ? 0 : 0.3, ease: EASE }}
                      className="overflow-hidden border-t border-[#dce9f5]"
                    >
                      <ProfilePanel c={active} onClose={handleClose} />
                    </motion.div>
                  </AnimatePresence>
                </div>
              );
            })()
          )}
        </div>

      </div>
    </section>
  );
}

// ============================================================
// NormalCard — 通常時の写真カード
// ============================================================
function NormalCard({ c, onOpen }: { c: Consultant; onOpen: () => void }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[#d4e8f6] bg-white shadow-[0_2px_14px_rgba(18,56,110,0.08)] transition-shadow duration-300 hover:shadow-[0_6px_28px_rgba(18,56,110,0.13)]">
      {/* 写真 */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#edf5fb] sm:aspect-[5/6]">
        <Image
          src={c.photo}
          alt={`${c.name}（${c.title}）の写真`}
          fill
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          style={{
            objectPosition: c.photoObjectPosition,
            transform: `scale(${c.photoScale})`,
          }}
          sizes="(min-width: 768px) 50vw, 100vw"
          quality={92}
        />
        {/* 下グラデ */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-28"
          style={{ background: "linear-gradient(to top, rgba(12,42,72,0.46), transparent)" }}
          aria-hidden
        />
        {/* ボタン */}
        <button
          type="button"
          onClick={onOpen}
          aria-label={`${c.name}の詳細を見る`}
          className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-[#1d6fe8] px-4 py-2 text-[12px] font-bold text-white shadow-[0_3px_12px_rgba(29,111,232,0.36)] transition hover:-translate-y-0.5 hover:bg-[#1a60d0] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:text-[13px]"
        >
          詳細を見る
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden>
            <path d="M2 5.5h7M6 2.5l3 3-3 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
      {/* 名前・肩書 */}
      <div className="px-5 py-4 sm:px-6">
        <p className="text-[12px] font-bold uppercase tracking-widest text-[#5a80a0]">{c.title}</p>
        <p className="mt-1 text-[20px] font-black leading-snug text-[#0c2a48] sm:text-[22px]">{c.name}</p>
      </div>
    </div>
  );
}

// ============================================================
// PhotoCard — 展開時の写真カード（位置・サイズ維持）
// ============================================================
function PhotoCard({
  c,
  onClose,
  isActive,
  spMode = false,
}: {
  c: Consultant;
  onClose: () => void;
  isActive: boolean;
  spMode?: boolean;
}) {
  return (
    <div className="relative h-full">
      <div
        className={`relative w-full overflow-hidden bg-[#edf5fb] ${spMode ? "aspect-[4/3]" : "h-full min-h-[420px]"}`}
      >
        <Image
          src={c.photo}
          alt={`${c.name}（${c.title}）の写真`}
          fill
          className="object-cover"
          style={{
            objectPosition: c.photoObjectPosition,
            transform: `scale(${c.photoScale})`,
          }}
          sizes="(min-width: 768px) 50vw, 100vw"
          quality={92}
        />
        {/* 下グラデ */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-28"
          style={{ background: "linear-gradient(to top, rgba(12,42,72,0.42), transparent)" }}
          aria-hidden
        />
        {/* 閉じるボタン（写真左上） */}
        {isActive && (
          <button
            type="button"
            onClick={onClose}
            aria-label="プロフィールを閉じる"
            className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-[#3a5a78] shadow-sm backdrop-blur-sm transition hover:bg-white hover:text-[#1d6fe8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1d6fe8]"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
              <path d="M2 2l9 9M11 2l-9 9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
          </button>
        )}
        {/* 名前（写真左下） */}
        <div className="absolute bottom-4 left-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-white/80">{c.title}</p>
          <p className="text-[19px] font-black leading-snug text-white drop-shadow-sm">{c.name}</p>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// ProfilePanel — プロフィール本文パネル
// ============================================================
function ProfilePanel({ c, onClose }: { c: Consultant; onClose: () => void }) {
  return (
    <div className="h-full overflow-y-auto p-6 lg:p-7">
      {/* 肩書 + 名前 */}
      <p className="text-[11px] font-bold uppercase tracking-widest text-[#1d6fe8]">{c.title}</p>
      <p className="mt-1 text-[21px] font-black leading-snug text-[#0c2a48] lg:text-[23px]">{c.name}</p>

      {/* 一言メッセージ */}
      <p className="mt-4 rounded-xl bg-[#eff6fd] px-4 py-3 text-[13px] leading-relaxed text-[#1a4972]">
        {c.message}
      </p>

      {/* 支援できること */}
      <div className="mt-5">
        <p className="text-[11px] font-bold uppercase tracking-wider text-[#5a80a0]">支援できること</p>
        <ul className="mt-2 space-y-2">
          {c.supports.map((s) => (
            <li key={s} className="flex items-start gap-2 text-[13px] leading-relaxed text-[#3a5a78]">
              <span aria-hidden className="mt-[6px] inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[#1d6fe8]" />
              <span>{s}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 得意領域 */}
      <div className="mt-5">
        <p className="text-[11px] font-bold uppercase tracking-wider text-[#5a80a0]">得意領域</p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-[#3a5a78]">{c.specialty}</p>
      </div>

      {/* 1年間の伴走で見るポイント */}
      <div className="mt-5 rounded-xl border border-[#dde9f4] bg-[#f4f9fe] p-4">
        <p className="text-[11px] font-bold uppercase tracking-wider text-[#1d6fe8]">1年間の伴走で見るポイント</p>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-[#3a5a78]">{c.watchPoints}</p>
      </div>

      {/* 閉じるボタン（パネル下部） */}
      <button
        type="button"
        onClick={onClose}
        className="mt-6 inline-flex items-center gap-1.5 text-[12px] font-bold text-[#5a80a0] transition hover:text-[#1d6fe8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1d6fe8]"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
          <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        閉じる
      </button>
    </div>
  );
}

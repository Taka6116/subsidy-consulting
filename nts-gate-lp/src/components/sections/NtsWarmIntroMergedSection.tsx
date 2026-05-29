"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import ScrollTextReveal from "@/components/shared/ScrollTextReveal";
import sakurabaPhoto from "../../../icon-assets/PANA2727.webp";
import seinoPhoto from "../../../icon-assets/PANA2741.webp";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const MODAL_PHOTO_WIDTH = 400;
const MODAL_PANEL_WIDTH = 720;
const MODAL_PANEL_DELAY_MS = 500;

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
  /** カード下部の補足テキスト（任意） */
  cardTagline?: string;
  message: string;
  /** リード枠の見出し（任意） */
  messageTitle?: string;
  supports: string[];
  /** 実績リスト（任意・モーダル専用セクション） */
  achievements?: string[];
  specialty: string;
  /** 略歴（任意・モーダル下部に小さく表示） */
  biography?: string;
  /** 下部ハイライト枠の見出し（未指定時は「1年間の伴走で見るポイント」） */
  highlightTitle?: string;
  /** 下部ハイライト枠の本文（未指定時は非表示） */
  watchPoints?: string;
  /** 展開時にパネルが開く方向 */
  panelSide: "right" | "left";
};

const CONSULTANTS: Consultant[] = [
  {
    id: "sakuraba",
    name: "櫻庭 真之介",
    title: "中小企業診断士",
    photo: sakurabaPhoto,
    photoObjectPosition: "50% 20%",
    photoScale: 1.08,
    panelSide: "right",
    messageTitle: "1年間の伴走で大切にする視点",
    message:
      "補助金はゴールではなく、課題解決の「手段の一つ」です。まず事業の本当の課題を見極め、その解決にどう資金を活かすかを一緒に設計します。申請して終わりにせず、事業成長につながっているかを経営目線で定期的に確認しながら伴走します。",
    supports: [
      "事業の「本当の課題」の発見と、解決方針の設計",
      "新規事業・既存事業の立ち上げから運営までの実行支援",
      "解決策を前に進めるための資金戦略づくり（補助金の活用設計を含む）",
      "採択後の実行・資金活用・効果検証までの伴走",
      "申請準備に必要な情報・資料整理のサポート",
    ],
    specialty:
      "課題発見・解決方針の設計 ／ 事業開発・事業運営 ／ M&A（買い手実務・売り手支援） ／ DD・PMI ／ 資金戦略・補助金活用設計",
    biography:
      "青山学院大学経済学部卒業後、大手証券会社でリテール・ホールセール業務に従事。大手生命保険会社で保険事業の立ち上げコンサルティング・店舗開発に携わった後、東証上場企業へ参画。主力事業の企画推進を担い、約2年で4つの新規部門を立ち上げ、事業の運営・マネジメントまで一貫して牽引。事業拡大に向けたM&Aも複数手掛ける。2024年以降は全社M&Aを統括する専門部署のマネージャーとして、計9件のM&A・出資案件でソーシングからデューデリジェンス、クロージングに至る一連のプロセスに従事。2026年1月、株式会社日本提携支援に執行役員COOとして参画し、事業全体の統括・推進を担う。",
    highlightTitle: "現場経験から見える、資金活用の判断軸",
    watchPoints:
      "新規事業の立ち上げから運営、M&AのDD・PMIまで、自ら現場で事業を動かしてきました。だからこそ、表面的な数字の裏にある「本当の課題」を見抜き、資金をどこに効かせるべきかを経営者目線で判断できます。補助金を入れること自体を目的化させず、課題の特定から効果検証まで一貫して伴走します。",
  },
  {
    id: "seino",
    name: "清野 洋司",
    title: "中小企業診断士",
    photo: seinoPhoto,
    photoObjectPosition: "50% 18%",
    photoScale: 1.08,
    panelSide: "left",
    messageTitle: "印象に残っている支援",
    message:
      "一度不採択となった案件の再挑戦支援や、売上3,000万円規模の建設業者の経営計画策定など、事業者の転機に関わる相談を数多く担当。補助金を「申請するための制度」ではなく、事業を前に進めるための計画づくりとして支援しています。",
    supports: [
      "補助金申請に向けた事業計画の整理",
      "資金調達を見据えた計画策定・金融機関対応の相談",
      "建設業、製造業、飲食店などの中長期計画策定",
      "M&Aや新規事業を含む経営課題の総合相談",
    ],
    // NOTE: 件数・金額は掲載前に最新情報・根拠の確認が必要な場合があります
    achievements: [
      "2023年以降、延べ300件以上の経営相談に対応",
      "補助金獲得支援 50件以上",
      "補助金獲得支援総額 6.5億円規模",
      "建設業、製造業、飲食店など幅広い業種の計画策定を支援",
    ],
    specialty:
      "補助金申請支援 / 資金調達支援 / 中長期計画策定 / 経営相談 / M&A実行支援",
    biography:
      "1983年生まれ、北海道出身。明治大学文学部心理社会学科卒業後、医療系専門出版社に7年間勤務し、編集・制作部長を経験。2019年に中小企業診断士登録。2021年より経営コンサルタントとして独立し、きづき経営コンサルティングを開業。補助金申請支援、資金調達支援、中長期計画策定、M&A実行支援など、事業者の現場に近い経営相談を幅広く支援しています。",
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
      className="section-block section-alt lp-section-depth relative overflow-hidden py-20 md:py-28"
    >
      <div className="relative z-10 mx-auto w-full max-w-[1280px] px-5 sm:px-8 xl:px-10">

        {/* ── 見出し ── */}
        <motion.div {...(reduce ? {} : fadeUp(0))} className="mb-12 text-center md:mb-14">
          <ScrollTextReveal
            as="h2"
            id="warm-merged-heading"
            className="font-heading text-3xl font-bold leading-tight text-[var(--text-primary)] md:text-4xl"
          >
            伴走するのは、補助金活用を知る専門家です。
          </ScrollTextReveal>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[var(--text-secondary)] md:text-lg">
            申請前の整理、課題特定から、採択後の活用・投資判断、経営戦略まで
            <br className="hidden md:inline" />
            中小企業診断士保有のコンサルタントが、貴社の状況に合わせて伴走します。
          </p>
        </motion.div>

        {/* ── 担当者カード（常時2枚表示） ── */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6 lg:gap-8">
          {CONSULTANTS.map((c, i) => (
            <motion.div key={c.id} {...(reduce ? {} : fadeUp(0.07 + i * 0.07))}>
              <NormalCard c={c} onOpen={() => handleOpen(c.id)} />
            </motion.div>
          ))}
        </div>

        <ConsultantProfileModal
          consultant={CONSULTANTS.find((c) => c.id === activeId) ?? null}
          reduceMotion={!!reduce}
          onClose={handleClose}
        />

      </div>
    </section>
  );
}

// ============================================================
// ConsultantProfileModal — 中央に写真 → 1秒後にプロフィールが横へ展開
// ============================================================
function ConsultantProfileModal({
  consultant,
  reduceMotion,
  onClose,
}: {
  consultant: Consultant | null;
  reduceMotion: boolean;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [panelReady, setPanelReady] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!consultant) {
      setPanelReady(false);
      return;
    }
    if (reduceMotion) {
      setPanelReady(true);
      return;
    }
    setPanelReady(false);
    const timer = window.setTimeout(() => setPanelReady(true), MODAL_PANEL_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [consultant?.id, reduceMotion]);

  useEffect(() => {
    if (!consultant) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [consultant, handleEscape]);

  if (!mounted) return null;

  const expandFromLeft = consultant?.panelSide === "left";

  return createPortal(
    <AnimatePresence>
      {consultant ? (
        <motion.div
          key={consultant.id}
          className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-5 lg:p-8"
          role="presentation"
        >
          <motion.button
            type="button"
            aria-label="プロフィールを閉じる"
            className="absolute inset-0 bg-[#0c2a48]/55 backdrop-blur-[2px]"
            initial={reduceMotion ? undefined : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.22 }}
            onClick={onClose}
          />
          {/* ── デスクトップ (md+): 写真固定 → パネルが横に伸びる ── */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="consultant-modal-title"
            className={`relative hidden max-h-[90vh] overflow-hidden rounded-2xl border border-[#cce0f0] bg-white shadow-[0_24px_64px_rgba(8,42,94,0.22)] md:flex ${
              expandFromLeft ? "md:flex-row-reverse" : "md:flex-row"
            }`}
            initial={reduceMotion ? undefined : { opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, scale: 0.95 }}
            transition={{ duration: reduceMotion ? 0 : 0.3, ease: EASE }}
            onClick={(e) => e.stopPropagation()}
          >
            <p id="consultant-modal-title" className="sr-only">
              {consultant.name}のプロフィール
            </p>

            {/* 写真 — 最初から最終サイズで表示 */}
            <div
              className="shrink-0"
              style={{ width: MODAL_PHOTO_WIDTH, minHeight: 520 }}
            >
              <PhotoCard c={consultant} onClose={onClose} isActive modalMode />
            </div>

            {/* プロフィール — 1秒後に横へ伸びる */}
            <motion.div
              className={`shrink-0 overflow-hidden border-[#dce9f5] ${
                expandFromLeft ? "border-r" : "border-l"
              }`}
              initial={{ width: 0, opacity: 0 }}
              animate={{
                width: panelReady ? MODAL_PANEL_WIDTH : 0,
                opacity: panelReady ? 1 : 0,
              }}
              exit={{ width: 0, opacity: 0 }}
              transition={{
                duration: reduceMotion ? 0 : 0.42,
                ease: EASE,
                opacity: { duration: reduceMotion ? 0 : 0.28, delay: panelReady ? 0.06 : 0 },
              }}
            >
              <div className="h-full" style={{ width: MODAL_PANEL_WIDTH }}>
                <ProfilePanel c={consultant} onClose={onClose} />
              </div>
            </motion.div>
          </motion.div>

          {/* ── モバイル (<md): 写真 → パネルが下に伸びる ── */}
          <motion.div
            role="dialog"
            aria-modal="true"
            className="relative flex max-h-[92vh] w-full max-w-[min(96vw,420px)] flex-col overflow-hidden rounded-2xl border border-[#cce0f0] bg-white shadow-[0_24px_64px_rgba(8,42,94,0.22)] md:hidden"
            initial={reduceMotion ? undefined : { opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, scale: 0.95 }}
            transition={{ duration: reduceMotion ? 0 : 0.3, ease: EASE }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="shrink-0">
              <PhotoCard c={consultant} onClose={onClose} isActive modalMode />
            </div>
            <motion.div
              className="overflow-hidden border-t border-[#dce9f5]"
              initial={{ height: 0, opacity: 0 }}
              animate={{
                height: panelReady ? "auto" : 0,
                opacity: panelReady ? 1 : 0,
              }}
              exit={{ height: 0, opacity: 0 }}
              transition={{
                duration: reduceMotion ? 0 : 0.38,
                ease: EASE,
                opacity: { duration: reduceMotion ? 0 : 0.26, delay: panelReady ? 0.04 : 0 },
              }}
            >
              <ProfilePanel c={consultant} onClose={onClose} />
            </motion.div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
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
          className="nts-cta-primary nts-cta-primary--pill absolute bottom-4 right-4 gap-1.5 px-4 py-2 text-[12px] sm:text-[13px] focus-visible:outline-white"
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
        {c.cardTagline ? (
          <p className="mt-2 text-[13px] leading-relaxed text-[#4a6a82]">{c.cardTagline}</p>
        ) : null}
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
  modalMode = false,
}: {
  c: Consultant;
  onClose: () => void;
  isActive: boolean;
  spMode?: boolean;
  modalMode?: boolean;
}) {
  const sizeClass = modalMode
    ? "aspect-[4/3] md:aspect-auto md:h-full md:min-h-[380px]"
    : spMode
      ? "aspect-[4/3]"
      : "h-full min-h-[420px]";

  return (
    <div className="relative h-full">
      <div className={`relative w-full overflow-hidden bg-[#edf5fb] ${sizeClass}`}>
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
function parseSpecialtyChips(specialty: string) {
  return specialty.split(/\s*\/\s*/).filter(Boolean);
}

function ProfileEditorialListSection({
  title,
  items,
  className = "mt-8 lg:mt-11",
}: {
  title: string;
  items: string[];
  className?: string;
}) {
  return (
    <section className={className}>
      <h3 className="border-b border-[#d7dce5] pb-3 text-base font-bold text-[#101828]">{title}</h3>
      <ul className="mt-5 space-y-3 sm:mt-6 sm:space-y-4">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-[14px] leading-7 text-[#475467] sm:gap-4 sm:text-[15px]">
            <span aria-hidden className="mt-3 h-1 w-1 flex-none rounded-full bg-[#aab3c2]" />
            <span className="min-w-0 break-words">{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ProfilePanel({ c, onClose }: { c: Consultant; onClose: () => void }) {
  const specialtyChips = parseSpecialtyChips(c.specialty);
  const highlightTitle = c.highlightTitle ?? "1年間の伴走で見るポイント";

  return (
    <div className="flex h-full max-h-full min-h-0 min-w-0 flex-col overflow-y-auto overflow-x-hidden bg-[#fbfbfd] px-6 py-8 text-[#101828] sm:px-8 sm:py-10 lg:px-12 lg:py-12">
      <div className="mb-7 lg:mb-9">
        <p className="text-xs font-bold tracking-[0.08em] text-[#0f4fa8]">{c.title}</p>
        <h2 className="mt-2 text-2xl font-bold leading-tight text-[#101828] sm:mt-3 sm:text-3xl lg:text-4xl">
          {c.name}
        </h2>
      </div>

      <section className="rounded-xl bg-[#f1f4f8] px-5 py-5 sm:px-7 sm:py-7">
        {c.messageTitle ? (
          <h3 className="text-sm font-bold text-[#0f4fa8]">{c.messageTitle}</h3>
        ) : null}
        <p
          className={`break-words text-[14px] leading-7 text-[#344054] sm:text-[15px] sm:leading-8 ${c.messageTitle ? "mt-3 sm:mt-4" : ""}`}
        >
          {c.message}
        </p>
      </section>

      {c.achievements && c.achievements.length > 0 ? (
        <ProfileEditorialListSection title="実績" items={c.achievements} className="mt-8 lg:mt-11" />
      ) : null}

      <ProfileEditorialListSection title="支援できること" items={c.supports} />

      <section className="mt-8 lg:mt-10">
        <h3 className="text-sm font-bold tracking-[0.08em] text-[#475467]">得意領域</h3>
        <div className="mt-3 flex flex-wrap gap-2 sm:mt-4">
          {specialtyChips.map((chip) => (
            <span
              key={chip}
              className="inline-block max-w-full break-words rounded-md border border-[#cfd7e6] bg-white px-3 py-1.5 text-xs text-[#475467] sm:px-4 sm:py-2 sm:text-sm"
            >
              {chip}
            </span>
          ))}
        </div>
      </section>

      {c.biography ? (
        <section className="mt-8 lg:mt-11">
          <h3 className="border-b border-[#d7dce5] pb-3 text-base font-bold text-[#101828]">略歴</h3>
          <p className="mt-5 break-words text-sm leading-7 text-[#5f6b7a] sm:mt-6 sm:leading-8">{c.biography}</p>
        </section>
      ) : null}

      {c.watchPoints ? (
        <section className="mt-8 rounded-xl border border-[#d7e1f1] bg-white px-5 py-5 shadow-sm sm:px-7 sm:py-6 lg:mt-10">
          <h3 className="text-sm font-bold text-[#0f4fa8]">{highlightTitle}</h3>
          <p className="mt-3 break-words text-sm leading-7 text-[#475467] sm:mt-4 sm:leading-8">{c.watchPoints}</p>
        </section>
      ) : null}

      <button
        type="button"
        onClick={onClose}
        className="mt-8 inline-flex items-center gap-1.5 text-sm font-bold text-[#5f6b7a] transition hover:text-[#0f4fa8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0f4fa8] lg:mt-10"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
          <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        閉じる
      </button>
    </div>
  );
}

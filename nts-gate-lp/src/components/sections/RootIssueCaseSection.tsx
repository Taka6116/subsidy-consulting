"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  Target,
  ClipboardList,
  Search,
  Monitor,
} from "lucide-react";

// ============================================================
// 左側：制度単体で進めた場合（白＋薄いグレー）
// ============================================================
const LEFT_STEPS = [
  {
    num: "01",
    title: "最初に見つけた制度を確認",
    body: "設備投資系の補助金を中心に検討",
    image: "/api/article-pictures/%E4%BA%8B%E6%A5%AD%E8%A8%88%E7%94%BB/working-process-startup-businessman-working-wood-table-with-new-finance-project-modern-notebook-table-pen-holding-hand.webp",
    alt: "資料を整理して制度を確認するイメージ",
  },
  {
    num: "02",
    title: "表面的な対象経費で整理",
    body: "設備購入費だけを申請対象として想定",
    image: "/api/article-pictures/%E4%BA%8B%E6%A5%AD%E8%A8%88%E7%94%BB/business-corporate-people-working-concept.webp",
    alt: "経費を整理するイメージ",
  },
] as const;

// ============================================================
// 右側：NTSに相談した場合（淡青＋NTSブルー強調）
// ============================================================
const RIGHT_STEPS = [
  {
    num: "01",
    title: "本質課題を整理",
    body: "人手不足・在庫確認・作業の属人化まで確認",
    image: "/images/PANA3362.jpg",
    alt: "課題を整理するイメージ",
  },
  {
    num: "02",
    title: "根本解決に近い制度も比較",
    body: "省力化・IT導入・業務改善系の制度も確認",
    image: "/images/PANA3955.jpg",
    alt: "複数制度を比較するイメージ",
  },
] as const;

// ============================================================
// 卸売業ケース（前2枚）
// ============================================================
const CASE_CARDS = [
  {
    label: "見えていた相談",
    body: "設備を更新したい",
    icon: ClipboardList,
  },
  {
    label: "隠れていた課題",
    body: "在庫確認・出荷作業・部門連携に時間がかかる",
    icon: Search,
  },
] as const;

// 線の共通色
const LINE_COLOR = "rgba(11,79,138,0.4)";
const LINE_COLOR_SOFT = "rgba(11,79,138,0.22)";

export default function RootIssueCaseSection() {
  return (
    <section
      aria-labelledby="root-issue-heading"
      className="w-full py-20 md:py-24 lg:py-28"
      style={{ background: "#F4F8FC" }}
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ─── ヘッダー ──────────────────────────────────── */}
        <div className="text-center">
          <h2
            id="root-issue-heading"
            className="font-heading mt-0"
            style={{
              fontSize: "clamp(1.6rem, 3.2vw, 2.4rem)",
              fontWeight: 700,
              lineHeight: 1.4,
              color: "var(--text-primary)",
              letterSpacing: "0.01em",
            }}
          >
            しかし、より最適な補助金制度があるかもしれません
          </h2>
          <p
            className="font-body mx-auto mt-5"
            style={{
              maxWidth: "720px",
              fontSize: "0.95rem",
              lineHeight: 1.85,
              color: "var(--text-secondary)",
            }}
          >
            制度名から選ぶだけでなく、事業課題を整理することで、より適した活用余地を確認できます。
          </p>
        </div>

        {/* ─── メイン提案書パネル ───────────────────────── */}
        <div
          className="relative mt-10 overflow-hidden rounded-[20px] bg-white md:mt-12"
          style={{
            border: "1px solid #DDE7F2",
            boxShadow:
              "0 14px 40px rgba(26,76,142,0.10), 0 4px 12px rgba(26,76,142,0.05)",
          }}
        >
          <div className="p-5 sm:p-6 md:p-8 lg:p-10">

            {/* ====================================================== */}
            {/* トップ：左ピル | 中央ノード | 右ピル                  */}
            {/* ====================================================== */}
            {/* PC */}
            <div className="relative hidden md:grid md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-4">
              {/* 左タイトルピル — 右寄せでノードに接続 */}
              <div className="flex items-center justify-end gap-3">
                <span
                  className="font-heading inline-flex items-center rounded-full bg-white px-5 py-2.5"
                  style={{
                    fontSize: "0.88rem",
                    fontWeight: 700,
                    color: "var(--text-secondary)",
                    border: "1px solid var(--border-subtle)",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                  }}
                >
                  制度単体で進めた場合
                </span>
                <span
                  aria-hidden
                  className="h-px w-10 lg:w-16"
                  style={{ background: LINE_COLOR }}
                />
              </div>

              {/* 中央：相談内容ノード */}
              <div className="flex flex-col items-center">
                <div
                  className="relative z-[3] flex flex-col items-center justify-center rounded-full bg-white px-5 py-3"
                  style={{
                    border: "1.5px solid #B5D4F4",
                    boxShadow: "0 6px 18px rgba(26,76,142,0.12)",
                    minWidth: "150px",
                  }}
                >
                  <Target
                    size={16}
                    strokeWidth={2}
                    style={{ color: "var(--accent-navy)" }}
                    aria-hidden
                  />
                  <p
                    className="font-heading mt-1"
                    style={{
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      color: "var(--accent-navy)",
                      letterSpacing: "0.06em",
                    }}
                  >
                    相談内容
                  </p>
                  <p
                    className="font-body mt-0.5"
                    style={{
                      fontSize: "0.78rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    設備を更新したい
                  </p>
                </div>
              </div>

              {/* 右タイトルピル */}
              <div className="flex items-center justify-start gap-3">
                <span
                  aria-hidden
                  className="h-px w-10 lg:w-16"
                  style={{ background: LINE_COLOR }}
                />
                <span
                  className="font-heading inline-flex items-center rounded-full px-5 py-2.5"
                  style={{
                    fontSize: "0.88rem",
                    fontWeight: 700,
                    color: "#fff",
                    background: "var(--accent-navy)",
                    boxShadow: "0 6px 18px rgba(26,76,142,0.22)",
                  }}
                >
                  NTSに相談した場合
                </span>
              </div>
            </div>

            {/* SP */}
            <div className="flex flex-col items-center gap-3 md:hidden">
              <div
                className="flex flex-col items-center justify-center rounded-full bg-white px-5 py-3"
                style={{
                  border: "1.5px solid #B5D4F4",
                  boxShadow: "0 4px 14px rgba(26,76,142,0.10)",
                }}
              >
                <Target
                  size={16}
                  strokeWidth={2}
                  style={{ color: "var(--accent-navy)" }}
                  aria-hidden
                />
                <p
                  className="font-heading mt-1"
                  style={{
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    color: "var(--accent-navy)",
                  }}
                >
                  相談内容
                </p>
                <p
                  className="font-body mt-0.5"
                  style={{
                    fontSize: "0.78rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  設備を更新したい
                </p>
              </div>
            </div>

            {/* ====================================================== */}
            {/* 比較本体（PC）                                          */}
            {/* ====================================================== */}
            <div className="relative mt-6 hidden md:block md:mt-8">
              {/* 中央スプリット線 — 上から差額イメージまで貫通 */}
              <div
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-0 z-0 hidden md:block"
                style={{
                  width: "2px",
                  height: "100%",
                  background: `linear-gradient(to bottom, ${LINE_COLOR} 0%, ${LINE_COLOR} 85%, ${LINE_COLOR_SOFT} 100%)`,
                  transform: "translateX(-1px)",
                }}
              />

              {/* 統合グリッド：01, 02, 03 を同一グリッドで管理（縦線が行をまたいで連続する） */}
              <div
                className="relative z-[1] grid"
                style={{
                  gridTemplateColumns: "minmax(0,1fr) auto minmax(0,1fr)",
                  columnGap: "clamp(28px, 4vw, 56px)",
                  rowGap: "16px",
                }}
              >
                {/* 左 01 */}
                <BadgeColumn side="left" position="top">
                  <StepCard step={LEFT_STEPS[0]} tone="left" />
                </BadgeColumn>
                {/* 中央 01 行スペーサー */}
                <div aria-hidden />
                {/* 右 01 */}
                <BadgeColumn side="right" position="top">
                  <StepCard step={RIGHT_STEPS[0]} tone="right" />
                </BadgeColumn>

                {/* 左 02 */}
                <BadgeColumn side="left" position="middle">
                  <StepCard step={LEFT_STEPS[1]} tone="left" />
                </BadgeColumn>
                {/* 中央 02 行スペーサー */}
                <div aria-hidden />
                {/* 右 02 */}
                <BadgeColumn side="right" position="middle">
                  <StepCard step={RIGHT_STEPS[1]} tone="right" />
                </BadgeColumn>

                {/* 左 03 活用余地 100万円 */}
                <BadgeColumn side="left" position="bottom">
                  <ActivationCard
                    amount="100"
                    amountUnit="万円規模"
                    caption="制度単体で確認した場合の目安"
                    tone="left"
                  />
                </BadgeColumn>

                {/* 中央：差額イメージ + 左右接続線（03行と同じ行に配置） */}
                <div className="relative" style={{ alignSelf: "center" }}>
                  {/* 左側接続線（左の活用余地カードへ） */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute right-full top-1/2"
                    style={{
                      width: "clamp(28px, 4vw, 56px)",
                      height: "0",
                      borderTop: `1.5px dashed ${LINE_COLOR}`,
                      transform: "translateY(-1px)",
                    }}
                  />
                  {/* 右側接続線（右の活用余地カードへ） */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute left-full top-1/2"
                    style={{
                      width: "clamp(28px, 4vw, 56px)",
                      height: "0",
                      borderTop: `1.5px dashed ${LINE_COLOR}`,
                      transform: "translateY(-1px)",
                    }}
                  />
                  <div
                    className="font-body relative z-[2] flex flex-col items-center rounded-[14px] bg-white px-5 py-4"
                    style={{
                      border: `1.5px dashed ${LINE_COLOR}`,
                      boxShadow: "0 8px 22px rgba(26,76,142,0.12)",
                      minWidth: "150px",
                    }}
                  >
                    <p
                      className="font-heading"
                      style={{
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                        color: "var(--text-muted)",
                      }}
                    >
                      差額イメージ
                    </p>
                    <p
                      className="font-heading mt-1.5 text-center"
                      style={{
                        fontSize: "1.2rem",
                        fontWeight: 700,
                        color: "var(--accent-navy)",
                        lineHeight: 1.35,
                      }}
                    >
                      +50万円規模
                      <br />
                      <span
                        style={{
                          fontSize: "0.78rem",
                          fontWeight: 600,
                        }}
                      >
                        の活用余地
                      </span>
                    </p>
                  </div>
                </div>

                {/* 右 03 活用余地 150万円 */}
                <BadgeColumn side="right" position="bottom">
                  <ActivationCard
                    amount="150"
                    amountUnit="万円規模"
                    caption="条件が合えば、追加の活用余地が見つかる場合があります"
                    tone="right"
                  />
                </BadgeColumn>
              </div>
            </div>

            {/* ====================================================== */}
            {/* 比較本体（SP）                                          */}
            {/* ====================================================== */}
            <div className="mt-6 flex flex-col gap-4 md:hidden">
              {/* 左タイトル */}
              <div className="flex justify-center">
                <span
                  className="font-heading inline-flex rounded-full bg-white px-4 py-1.5"
                  style={{
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    color: "var(--text-secondary)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  制度単体で進めた場合
                </span>
              </div>
              {LEFT_STEPS.map((step) => (
                <div key={`mob-L-${step.num}`} className="relative pl-5">
                  <StepCard step={step} tone="left" />
                </div>
              ))}
              <div className="relative pl-5">
                <ActivationCard
                  amount="100"
                  amountUnit="万円規模"
                  caption="制度単体で確認した場合の目安"
                  tone="left"
                  mobile
                />
              </div>

              {/* 差額 */}
              <div className="flex justify-center">
                <div
                  className="font-body flex flex-col items-center rounded-[14px] bg-white px-5 py-4"
                  style={{ border: `1.5px dashed ${LINE_COLOR}` }}
                >
                  <p
                    className="font-heading"
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      color: "var(--text-muted)",
                    }}
                  >
                    差額イメージ
                  </p>
                  <p
                    className="font-heading mt-1.5 text-center"
                    style={{
                      fontSize: "1.15rem",
                      fontWeight: 700,
                      color: "var(--accent-navy)",
                      lineHeight: 1.35,
                    }}
                  >
                    +50万円規模
                    <br />
                    <span style={{ fontSize: "0.78rem", fontWeight: 600 }}>
                      の活用余地
                    </span>
                  </p>
                </div>
              </div>

              {/* 右タイトル */}
              <div className="flex justify-center">
                <span
                  className="font-heading inline-flex rounded-full px-4 py-1.5"
                  style={{
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    color: "#fff",
                    background: "var(--accent-navy)",
                  }}
                >
                  NTSに相談した場合
                </span>
              </div>
              {RIGHT_STEPS.map((step) => (
                <div key={`mob-R-${step.num}`} className="relative pl-5">
                  <StepCard step={step} tone="right" />
                </div>
              ))}
              <div className="relative pl-5">
                <ActivationCard
                  amount="150"
                  amountUnit="万円規模"
                  caption="条件が合えば、追加の活用余地が見つかる場合があります"
                  tone="right"
                  mobile
                />
              </div>
            </div>

            {/* ====================================================== */}
            {/* 卸売業ケース（パネル内）                                */}
            {/* ====================================================== */}
            <div
              className="mt-10 rounded-[14px] p-5 sm:p-6 md:mt-12"
              style={{
                background: "#F7FAFD",
                border: "1px solid #E5EBF3",
              }}
            >
              <h3
                className="font-heading mb-4"
                style={{
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                }}
              >
                たとえば、卸売業のケース
              </h3>

              <div
                className="grid grid-cols-1 gap-3 md:items-stretch md:gap-3"
                style={{
                  gridTemplateColumns:
                    "var(--cols, 1fr) /* mobile fallback */",
                }}
              >
                <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto_1fr_auto_1.5fr] md:items-stretch">
                  {/* カード1 */}
                  <CaseCard
                    label={CASE_CARDS[0].label}
                    body={CASE_CARDS[0].body}
                    icon={CASE_CARDS[0].icon}
                  />
                  {/* 矢印 */}
                  <div
                    aria-hidden
                    className="hidden items-center justify-center md:flex"
                  >
                    <ChevronRight
                      size={20}
                      strokeWidth={1.8}
                      style={{ color: "#B5C5DA" }}
                    />
                  </div>
                  {/* カード2 */}
                  <CaseCard
                    label={CASE_CARDS[1].label}
                    body={CASE_CARDS[1].body}
                    icon={CASE_CARDS[1].icon}
                  />
                  {/* 矢印 */}
                  <div
                    aria-hidden
                    className="hidden items-center justify-center md:flex"
                  >
                    <ChevronRight
                      size={20}
                      strokeWidth={1.8}
                      style={{ color: "#B5C5DA" }}
                    />
                  </div>
                  {/* カード3 — 機器プレースホルダー入り */}
                  <div
                    className="font-body flex h-full flex-col rounded-[12px] bg-white p-4 md:flex-row md:items-stretch md:gap-3"
                    style={{
                      border: "1px solid #E5EBF3",
                      boxShadow: "0 2px 6px rgba(26,76,142,0.04)",
                    }}
                  >
                    <div className="flex flex-1 flex-col">
                      <div className="mb-2 flex items-center gap-2">
                        <span
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                          style={{ background: "#F0F6FE" }}
                          aria-hidden
                        >
                          <Monitor
                            size={15}
                            strokeWidth={2}
                            style={{ color: "var(--accent-navy)" }}
                          />
                        </span>
                        <p
                          className="font-heading"
                          style={{
                            fontSize: "0.82rem",
                            fontWeight: 700,
                            color: "var(--accent-navy)",
                          }}
                        >
                          整理した投資内容
                        </p>
                      </div>
                      <p
                        style={{
                          fontSize: "0.83rem",
                          lineHeight: 1.75,
                          color: "var(--text-secondary)",
                        }}
                      >
                        基幹システム、ハンディ端末、ラベルプリンター
                      </p>
                    </div>

                    {/* 整理した投資内容 — 画像 */}
                    <div
                      className="relative mt-3 shrink-0 overflow-hidden rounded-[10px] md:mt-0"
                      style={{
                        width: "120px",
                        minWidth: "120px",
                        height: "80px",
                        background: "#EEF3F8",
                      }}
                    >
                      <Image
                        src="/api/article-pictures/%E8%A8%AD%E5%82%99%E3%83%BB%E8%A8%AD%E5%82%99%E6%8A%95%E8%B3%87/monitor-green-energy-solar-panels-plant-with-software-used-optimize-layouts.webp"
                        alt="システム・設備を活用した業務改善のイメージ"
                        fill
                        sizes="120px"
                        className="object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ====================================================== */}
            {/* CTA帯（パネル内最下段）                                 */}
            {/* ====================================================== */}
            <div
              className="mt-6 flex flex-col items-center justify-between gap-4 rounded-[14px] px-5 py-5 sm:flex-row sm:gap-5 md:mt-8 md:px-7"
              style={{
                background:
                  "linear-gradient(135deg, #F0F6FE 0%, #E7F1FC 100%)",
                border: "1px solid #B5D4F4",
              }}
            >
              <p
                className="font-heading text-center sm:text-left"
                style={{
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  lineHeight: 1.55,
                }}
              >
                本当に最適でベストな補助金制度は何か、経営課題と一緒に提案させていただきます。
              </p>
              <Link
                href="/consult"
                className="font-body inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-[10px] px-7 py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a4c8e] sm:w-auto"
                style={{
                  background: "var(--accent-navy)",
                  letterSpacing: "0.06em",
                  whiteSpace: "nowrap",
                  boxShadow: "0 6px 14px rgba(26,76,142,0.18)",
                }}
              >
                無料相談予約する
                <ArrowRight size={16} aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// BadgeColumn — カード左に番号バッジ + 縦線
// ============================================================
function BadgeColumn({
  side,
  position,
  children,
}: {
  side: "left" | "right";
  /** top: 01の位置（バッジ上は線なし） / middle: 02 / bottom: 03 */
  position: "top" | "middle" | "bottom";
  children: React.ReactNode;
}) {
  const isRight = side === "right";
  const lineColor = isRight ? "rgba(26,76,142,0.35)" : "rgba(120,140,165,0.30)";

  return (
    <div className="relative pl-5 md:pl-6">
      {/* バッジ上方の縦線（02と03に表示）— rowGap を十分にカバー */}
      {position !== "top" && (
        <span
          aria-hidden
          className="pointer-events-none absolute"
          style={{
            left: "calc(0.75rem - 0.5px)",
            top: "-20px",
            height: "calc(20px + 14px)",
            width: "1.5px",
            background: lineColor,
          }}
        />
      )}
      {/* バッジ下方の縦線（01と02に表示）— 次の行のバッジ上端まで十分に伸ばす */}
      {position !== "bottom" && (
        <span
          aria-hidden
          className="pointer-events-none absolute"
          style={{
            left: "calc(0.75rem - 0.5px)",
            top: "44px",
            bottom: "-20px",
            width: "1.5px",
            background: lineColor,
          }}
        />
      )}
      {children}
    </div>
  );
}

// ============================================================
// StepCard — 写真サムネ＋番号バッジ＋テキスト
// ============================================================
function StepCard({
  step,
  tone,
}: {
  step: {
    num: string;
    title: string;
    body: string;
    image: string;
    alt: string;
  };
  tone: "left" | "right";
}) {
  const isRight = tone === "right";
  return (
    <>
      {/* 番号バッジ — カード左に被るように配置 */}
      <span
        className="font-heading absolute left-0 top-3 z-[3] flex h-8 w-8 items-center justify-center rounded-full md:h-9 md:w-9"
        style={{
          background: isRight ? "var(--accent-navy)" : "#F1F4F9",
          color: isRight ? "#fff" : "#5A6B82",
          fontSize: "0.72rem",
          fontWeight: 700,
          letterSpacing: "0.04em",
          boxShadow: "0 2px 6px rgba(0,0,0,0.10)",
        }}
        aria-hidden
      >
        {step.num}
      </span>

      <div
        className="relative z-[2] flex items-stretch gap-3 rounded-[12px] p-3 md:gap-4 md:p-3.5"
        style={{
          background: isRight ? "#F0F6FE" : "#fff",
          border: isRight ? "1px solid #B5D4F4" : "1px solid #E5EBF3",
          boxShadow: isRight
            ? "0 4px 12px rgba(26,76,142,0.06)"
            : "0 2px 6px rgba(0,0,0,0.03)",
        }}
      >
        <div
          className="relative h-[68px] w-[110px] shrink-0 overflow-hidden rounded-[8px] md:h-[76px] md:w-[124px]"
          style={{ background: "#EEF3F8" }}
        >
          <Image
            src={step.image}
            alt={step.alt}
            fill
            sizes="124px"
            className="object-cover"
          />
        </div>

        <div className="flex flex-1 flex-col justify-center">
          <p
            className="font-heading"
            style={{
              fontSize: "0.95rem",
              fontWeight: 700,
              color: isRight ? "var(--accent-navy)" : "var(--text-primary)",
              lineHeight: 1.45,
            }}
          >
            {step.title}
          </p>
          <p
            className="font-body mt-1"
            style={{
              fontSize: "0.82rem",
              lineHeight: 1.7,
              color: isRight ? "#365578" : "var(--text-secondary)",
            }}
          >
            {step.body}
          </p>
        </div>
      </div>
    </>
  );
}

// ============================================================
// ActivationCard — 100/150 万円規模カード
// ============================================================
function ActivationCard({
  amount,
  amountUnit,
  caption,
  tone,
  mobile = false,
}: {
  amount: string;
  amountUnit: string;
  caption: string;
  tone: "left" | "right";
  mobile?: boolean;
}) {
  const isRight = tone === "right";
  const num = "03";
  return (
    <>
      {/* SP用バッジ */}
      {mobile && (
        <span
          className="font-heading absolute left-0 top-3 z-[3] flex h-8 w-8 items-center justify-center rounded-full"
          style={{
            background: isRight ? "var(--accent-navy)" : "#F1F4F9",
            color: isRight ? "#fff" : "#5A6B82",
            fontSize: "0.72rem",
            fontWeight: 700,
            boxShadow: "0 2px 6px rgba(0,0,0,0.10)",
          }}
          aria-hidden
        >
          {num}
        </span>
      )}
      {/* PC用バッジは BadgeColumn 内で背景線として担当、バッジ自体はここに描画 */}
      {!mobile && (
        <span
          className="font-heading absolute left-0 top-5 z-[3] flex h-8 w-8 items-center justify-center rounded-full md:h-9 md:w-9"
          style={{
            background: isRight ? "var(--accent-navy)" : "#F1F4F9",
            color: isRight ? "#fff" : "#5A6B82",
            fontSize: "0.72rem",
            fontWeight: 700,
            letterSpacing: "0.04em",
            boxShadow: "0 2px 6px rgba(0,0,0,0.10)",
          }}
          aria-hidden
        >
          {num}
        </span>
      )}

      <div
        className="relative z-[2] flex flex-col justify-center rounded-[14px] p-5 md:p-6"
        style={{
          background: isRight
            ? "linear-gradient(135deg, #F0F6FE 0%, #E4EFFC 100%)"
            : "#fff",
          border: isRight ? "1.5px solid #B5D4F4" : "1px solid #E5EBF3",
          boxShadow: isRight
            ? "0 8px 22px rgba(26,76,142,0.14)"
            : "0 2px 8px rgba(0,0,0,0.04)",
          minHeight: "190px",
        }}
      >
        <div className="flex-1">
          <p
            className="font-heading"
            style={{
              fontSize: "0.72rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              color: isRight ? "var(--accent-navy)" : "var(--text-muted)",
            }}
          >
            活用余地
          </p>
          <p
            className="font-heading mt-0.5"
            style={{
              fontSize: isRight
                ? "clamp(2.5rem, 4.2vw, 3.1rem)"
                : "clamp(1.45rem, 2.5vw, 1.75rem)",
              fontWeight: 700,
              color: isRight ? "var(--accent-navy)" : "var(--text-primary)",
              lineHeight: 1.15,
            }}
          >
            {amount}
            <span
              style={{
                fontSize: "0.85rem",
                fontWeight: 700,
                marginLeft: "3px",
              }}
            >
              {amountUnit}
            </span>
          </p>
        </div>
        <p
          className="font-body mt-4"
          style={{
            fontSize: "0.8rem",
            lineHeight: 1.7,
            color: isRight ? "#365578" : "var(--text-muted)",
          }}
        >
          {caption}
        </p>
      </div>
    </>
  );
}

// ============================================================
// CaseCard — 卸売業ケース 1, 2 枚目用
// ============================================================
function CaseCard({
  label,
  body,
  icon: Icon,
}: {
  label: string;
  body: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; style?: React.CSSProperties }>;
}) {
  return (
    <div
      className="font-body flex h-full flex-col rounded-[12px] bg-white p-4"
      style={{
        border: "1px solid #E5EBF3",
        boxShadow: "0 2px 6px rgba(26,76,142,0.04)",
      }}
    >
      <div className="mb-2 flex items-center gap-2">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
          style={{ background: "#F0F6FE" }}
          aria-hidden
        >
          <Icon
            size={15}
            strokeWidth={2}
            style={{ color: "var(--accent-navy)" }}
          />
        </span>
        <p
          className="font-heading"
          style={{
            fontSize: "0.82rem",
            fontWeight: 700,
            color: "var(--accent-navy)",
          }}
        >
          {label}
        </p>
      </div>
      <p
        style={{
          fontSize: "0.83rem",
          lineHeight: 1.75,
          color: "var(--text-secondary)",
        }}
      >
        {body}
      </p>
    </div>
  );
}

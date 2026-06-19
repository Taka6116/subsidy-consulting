"use client";

import ScrollTextReveal from "@/components/shared/ScrollTextReveal";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Target,
  ClipboardList,
  Search,
  Monitor,
  Handshake,
  Lightbulb,
  TrendingUp,
} from "lucide-react";

/** NTS紺（--accent-navy）ベースのグラデーション */
const NAVY_GRADIENT_SOLID =
  "linear-gradient(135deg, #143a6f 0%, var(--accent-navy) 48%, #2162a5 100%)";
const NAVY_GRADIENT_PANEL =
  "linear-gradient(165deg, #f6f9fd 0%, #eaf2fa 42%, #dceaf7 100%)";
const NAVY_GRADIENT_CARD =
  "linear-gradient(160deg, #f8fbff 0%, #eef5fc 55%, #e5eff9 100%)";
const NAVY_GRADIENT_CARD_EMPHASIZED =
  "linear-gradient(160deg, #ebf3fb 0%, #dfeefb 52%, #d3e7f8 100%)";

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
    title: "根本解決に近い制度を比較",
    body: "省力化・IT導入・業務改善系の制度も確認",
    image: "/images/PANA3955.jpg",
    alt: "複数制度を比較するイメージ",
  },
  {
    num: "03",
    title: "採択後の活用計画を設計",
    body: "導入内容、スケジュール、必要資料を整理",
    image: "/api/article-pictures/%E4%BA%8B%E6%A5%AD%E8%A8%88%E7%94%BB/business-corporate-people-working-concept.webp",
    alt: "活用計画を設計するイメージ",
  },
  {
    num: "04",
    title: "実績報告・年次報告まで伴走",
    body: "採択後の報告準備や定点確認、必要に応じた年次報告の準備支援（提携専門家と連携）まで継続支援",
    image: "/api/article-pictures/%E4%BA%8B%E6%A5%AD%E8%A8%88%E7%94%BB/working-process-startup-businessman-working-wood-table-with-new-finance-project-modern-notebook-table-pen-holding-hand.webp",
    alt: "報告・伴走支援のイメージ",
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

export default function RootIssueCaseSection({
  heading,
  homeDepth = false,
}: {
  heading?: string;
  homeDepth?: boolean;
} = {}) {
  return (
    <section
      aria-labelledby="root-issue-heading"
      className={`w-full py-20 md:py-24 lg:py-28${homeDepth ? " lp-section-depth" : ""}`}
      style={homeDepth ? undefined : { background: "#F4F8FC" }}
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ─── ヘッダー ──────────────────────────────────── */}
        <div className="text-center">
          <ScrollTextReveal
            as="h2"
            id="root-issue-heading"
            className="font-heading mt-0 text-3xl font-bold leading-tight text-[var(--text-primary)] md:text-4xl"
          >
            {heading ?? "より最適な補助金制度があるかもしれません"}
          </ScrollTextReveal>
          <p
            className="font-body mx-auto mt-5"
            style={{
              maxWidth: "720px",
              fontSize: "0.95rem",
              lineHeight: 1.85,
              color: "var(--text-secondary)",
            }}
          >
            制度名だけで選ぶのではなく、事業課題と採択後の運用まで整理することで、より活用しやすい制度や支援の進め方が見えてきます。
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
                    background: NAVY_GRADIENT_SOLID,
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
            {/* 比較本体（PC）— 5行：左2+100万 / 右01〜05（04は活用余地）      */}
            {/* ====================================================== */}
            <div className="relative mt-6 hidden md:block md:mt-8">
              {/* ─── グリッドラッパー ─── */}
              <div className="relative">
                <div
                  className="relative z-[1] grid"
                  style={{
                    gridTemplateColumns: "minmax(0,1fr) auto minmax(0,1fr)",
                    columnGap: "clamp(28px, 4vw, 56px)",
                    rowGap: "16px",
                  }}
                >
                {/* row 1 */}
                <BadgeColumn side="left" slot="start">
                  <StepCard step={LEFT_STEPS[0]} tone="left" />
                </BadgeColumn>
                <div aria-hidden />
                <BadgeColumn side="right" slot="start">
                  <StepCard step={RIGHT_STEPS[0]} tone="right" />
                </BadgeColumn>

                {/* row 2 */}
                <BadgeColumn side="left" slot="between">
                  <StepCard step={LEFT_STEPS[1]} tone="left" />
                </BadgeColumn>
                <div aria-hidden />
                <BadgeColumn side="right" slot="between">
                  <StepCard step={RIGHT_STEPS[1]} tone="right" />
                </BadgeColumn>

                {/* row 3 — 左は揃え用スペーサー、右は03 */}
                <BadgeColumn side="left" slot="between">
                  <div className="h-[108px] min-h-[92px] md:h-[118px]" aria-hidden />
                </BadgeColumn>
                <div aria-hidden />
                <BadgeColumn side="right" slot="between">
                  <StepCard step={RIGHT_STEPS[2]} tone="right" />
                </BadgeColumn>

                {/* row 4 — 100万 / 差分 / 150万 */}
                <BadgeColumn side="left" slot="end">
                  <ActivationCard
                    amount="100"
                    amountUnit="万円規模"
                    caption="制度単体で確認した場合の目安"
                    tone="left"
                  />
                </BadgeColumn>
                <div className="relative flex items-center justify-center" style={{ alignSelf: "center" }}>
                  <div
                    className="font-body relative z-[2] flex max-w-[200px] flex-col items-center rounded-[14px] bg-white px-4 py-3.5 sm:px-5 sm:py-4"
                    style={{
                      border: `1.5px dashed ${LINE_COLOR}`,
                      boxShadow: "0 8px 22px rgba(26,76,142,0.12)",
                      minWidth: "148px",
                    }}
                  >
                    <p
                      className="font-heading text-center"
                      style={{
                        fontSize: "0.68rem",
                        fontWeight: 700,
                        letterSpacing: "0.06em",
                        color: "var(--text-muted)",
                        lineHeight: 1.35,
                      }}
                    >
                      活用余地の差
                    </p>
                    <p
                      className="font-body mt-1 text-center"
                      style={{
                        fontSize: "0.72rem",
                        fontWeight: 600,
                        color: "var(--text-secondary)",
                        lineHeight: 1.45,
                      }}
                    >
                      追加で獲得できた可能性
                    </p>
                    <p
                      className="font-heading mt-2 text-center"
                      style={{
                        fontSize: "1.15rem",
                        fontWeight: 800,
                        color: "var(--accent-navy)",
                        lineHeight: 1.25,
                      }}
                    >
                      +50万円規模
                    </p>
                    <p
                      className="font-body mt-2 text-center"
                      style={{
                        fontSize: "0.68rem",
                        lineHeight: 1.5,
                        color: "var(--text-muted)",
                      }}
                    >
                      ※条件により異なります
                    </p>
                  </div>
                </div>
                <BadgeColumn side="right" slot="between">
                  <ActivationCard
                    amount="150"
                    amountUnit="万円規模"
                    caption="条件が合えば、追加の活用余地が見つかる場合があります"
                    tone="right"
                    emphasized
                  />
                </BadgeColumn>

                {/* row 5 — 右のみ04 */}
                <div aria-hidden />
                <div aria-hidden />
                <BadgeColumn side="right" slot="between">
                  <StepCard step={RIGHT_STEPS[3]} tone="right" />
                </BadgeColumn>

                {/* row 6 — 右カラムのみ：04真下の矢印＋サイクル図 */}
                <div aria-hidden />
                <div aria-hidden />
                <div className="flex flex-col items-center pb-4">
                  {/* ラベル */}
                  <span
                    className="font-heading"
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      color: "var(--accent-navy)",
                      letterSpacing: "0.04em",
                      whiteSpace: "nowrap",
                      marginBottom: "6px",
                    }}
                  >
                    ここから中長期伴走へ
                  </span>
                  {/* 縦線 */}
                  <div
                    aria-hidden
                    style={{ width: "3px", height: "32px", background: "#2f63bd", borderRadius: "2px" }}
                  />
                  {/* 下向き矢印 */}
                  <div
                    aria-hidden
                    style={{
                      width: 0,
                      height: 0,
                      borderLeft: "8px solid transparent",
                      borderRight: "8px solid transparent",
                      borderTop: "11px solid #2f63bd",
                      marginBottom: "8px",
                    }}
                  />
                  {/* サイクル図 */}
                  <div className="w-full">
                    <CycleDiagram />
                  </div>
                </div>
                </div>

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
                />
              </div>

              {/* 差額 */}
              <div className="flex justify-center">
                <div
                  className="font-body flex max-w-[280px] flex-col items-center rounded-[14px] bg-white px-4 py-3.5"
                  style={{ border: `1.5px dashed ${LINE_COLOR}` }}
                >
                  <p
                    className="font-heading text-center"
                    style={{
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      color: "var(--text-muted)",
                    }}
                  >
                    活用余地の差
                  </p>
                  <p
                    className="font-body mt-1 text-center"
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      color: "var(--text-secondary)",
                      lineHeight: 1.45,
                    }}
                  >
                    追加で獲得できた可能性
                  </p>
                  <p
                    className="font-heading mt-2 text-center"
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: 800,
                      color: "var(--accent-navy)",
                    }}
                  >
                    +50万円規模
                  </p>
                  <p
                    className="font-body mt-2 text-center"
                    style={{ fontSize: "0.68rem", color: "var(--text-muted)", lineHeight: 1.5 }}
                  >
                    ※条件により異なります
                  </p>
                </div>
              </div>

              {/* 右ブロック（NTSに相談した場合） */}
              <div
                className="rounded-[14px] px-3 pb-4 pt-5"
                style={{
                  background: NAVY_GRADIENT_PANEL,
                  boxShadow: "inset 0 0 0 1px rgba(26,76,142,0.10)",
                }}
              >
                <div className="flex justify-center">
                  <span
                    className="font-heading inline-flex rounded-full px-4 py-1.5"
                    style={{
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      color: "#fff",
                      background: NAVY_GRADIENT_SOLID,
                      boxShadow: "0 4px 14px rgba(26,76,142,0.2)",
                    }}
                  >
                    NTSに相談した場合
                  </span>
                </div>
                {RIGHT_STEPS.slice(0, 3).map((step) => (
                  <div key={`mob-R-${step.num}`} className="relative mt-4 pl-5">
                    <StepCard step={step} tone="right" />
                  </div>
                ))}
                <div className="relative mt-4 pl-5">
                  <ActivationCard
                    amount="150"
                    amountUnit="万円規模"
                    caption="条件が合えば、追加の活用余地が見つかる場合があります"
                    tone="right"
                    emphasized
                  />
                </div>
                <div className="relative mt-4 pl-5">
                  <StepCard step={RIGHT_STEPS[3]} tone="right" />
                </div>

                {/* SP: 中長期伴走ブリッジ */}
                <div className="mt-3 flex items-center gap-1.5 pl-5">
                  <ChevronDown
                    size={14}
                    strokeWidth={2}
                    aria-hidden
                    style={{ color: "var(--accent-navy)", flexShrink: 0 }}
                  />
                  <span
                    className="font-heading"
                    style={{
                      fontSize: "0.73rem",
                      fontWeight: 700,
                      color: "var(--accent-navy)",
                      letterSpacing: "0.04em",
                    }}
                  >
                    ここから中長期伴走へ
                  </span>
                </div>

                {/* SP: サイクル図 */}
                <div className="mt-2">
                  <CycleDiagram />
                </div>
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
              <div className="flex min-w-0 flex-1 flex-col gap-2 text-center sm:text-left">
                <p
                  className="font-heading"
                  style={{
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    lineHeight: 1.55,
                  }}
                >
                  本当に見るべき制度だけでなく、採択後の実績報告や年次報告の準備まで見据えて、
                  <br />
                  経営課題と一緒に整理します。
                </p>
                <p
                  className="font-body max-w-xl text-[0.72rem] leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  ※ NTSは補助金活用支援・申請準備支援を行います。実績報告や年次報告に関する準備支援・必要資料の整理が必要な場合は、提携専門家と連携します。
                </p>
              </div>
              <Link
                href="/consult"
                className="nts-cta-primary font-body w-full shrink-0 gap-2 rounded-[10px] px-7 py-3.5 text-sm sm:w-auto"
                style={{
                  letterSpacing: "0.06em",
                  whiteSpace: "nowrap",
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
  children,
}: {
  side?: "left" | "right";
  slot?: "start" | "between" | "end";
  children: React.ReactNode;
}) {
  return (
    <div className="relative pl-5 md:pl-6">
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
          background: isRight ? NAVY_GRADIENT_SOLID : "#F1F4F9",
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
          background: isRight ? NAVY_GRADIENT_CARD : "#fff",
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
  emphasized = false,
}: {
  amount: string;
  amountUnit: string;
  caption: string;
  tone: "left" | "right";
  emphasized?: boolean;
}) {
  const isRight = tone === "right";
  return (
    <div
      className="relative z-[2] flex flex-col justify-center rounded-[14px] p-5 md:p-6"
        style={{
          background: isRight
            ? emphasized
              ? NAVY_GRADIENT_CARD_EMPHASIZED
              : NAVY_GRADIENT_CARD
            : "#fff",
          border: isRight
            ? emphasized
              ? "2px solid var(--accent-navy)"
              : "1.5px solid #B5D4F4"
            : "1px solid #E5EBF3",
          boxShadow: isRight
            ? emphasized
              ? "0 10px 28px rgba(26,76,142,0.16)"
              : "0 8px 22px rgba(26,76,142,0.14)"
            : "0 2px 8px rgba(0,0,0,0.04)",
          minHeight: emphasized ? "200px" : "190px",
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
                ? emphasized
                  ? "clamp(2.65rem, 4.5vw, 3.35rem)"
                  : "clamp(2.5rem, 4.2vw, 3.1rem)"
                : "clamp(1.45rem, 2.5vw, 1.75rem)",
              fontWeight: 800,
              color: isRight ? "var(--accent-navy)" : "var(--text-primary)",
              lineHeight: 1.12,
            }}
          >
            {amount}
            <span
              style={{
                fontSize: emphasized ? "0.92rem" : "0.85rem",
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
  );
}

// ============================================================
// CycleDiagram — 中長期伴走サイクル（円形矢印 + 白丸アイコンノードをコードで再現）
// ============================================================
// ノード（時計回り）: 上=補助金制度提案 → 右=実行支援 → 下=実行フォロー → 左=次の課題発見
const CYCLE_NODES = [
  { lines: ["補助金制度", "提案"], Icon: ClipboardList, pos: { left: "50%", top: "14%" } },
  { lines: ["実行支援"],           Icon: Handshake,     pos: { left: "86%", top: "50%" } },
  { lines: ["実行フォロー"],       Icon: TrendingUp,    pos: { left: "50%", top: "86%" } },
  { lines: ["次の課題", "発見"],   Icon: Lightbulb,     pos: { left: "14%", top: "50%" } },
] as const;

/** 角度（度, 0=上, 時計回り）と半径から viewBox 座標を計算 */
function cyclePolar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

/** 太い円弧の path（時計回り）。fromDeg→toDeg */
function cycleArc(cx: number, cy: number, r: number, fromDeg: number, toDeg: number) {
  const s = cyclePolar(cx, cy, r, fromDeg);
  const e = cyclePolar(cx, cy, r, toDeg);
  const large = ((toDeg - fromDeg + 360) % 360) > 180 ? 1 : 0;
  return `M ${s.x.toFixed(2)} ${s.y.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${e.x.toFixed(2)} ${e.y.toFixed(2)}`;
}

/** 弧の終端 toDeg に接する三角形の矢じり（時計回り方向を向く）のポリゴン座標 */
function cycleArrowHead(cx: number, cy: number, r: number, toDeg: number, halfW: number, len: number) {
  // 矢じりの先端は終端より少し進んだ位置
  const tip = cyclePolar(cx, cy, r, toDeg + len);
  // 基部は終端位置で、半径方向に ±halfW 広げる
  const base = cyclePolar(cx, cy, r, toDeg);
  const rad = ((toDeg - 90) * Math.PI) / 180;
  const ux = Math.cos(rad); // 外向き半径方向
  const uy = Math.sin(rad);
  const p1 = { x: base.x + ux * halfW, y: base.y + uy * halfW };
  const p2 = { x: base.x - ux * halfW, y: base.y - uy * halfW };
  return `${tip.x.toFixed(2)},${tip.y.toFixed(2)} ${p1.x.toFixed(2)},${p1.y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`;
}

function CycleDiagram() {
  const VB = 400;        // viewBox サイズ
  const C = VB / 2;      // 中心
  const R_ARC = 146;     // 弧の半径（ノード中心と一致）
  const ARC_W = 13;      // 弧の太さ
  // ノードは 0/90/180/270 度。弧はその間を時計回りに繋ぐ（終端に矢じり）
  // ノード円にめり込まないよう、両端に余白を確保
  const ARCS = [
    { from: 30, to: 57 },
    { from: 120, to: 147 },
    { from: 210, to: 237 },
    { from: 300, to: 327 },
  ];

  return (
    <div
      className="relative z-[2] overflow-hidden rounded-[18px] p-5 md:p-6"
      style={{
        background: "#ffffff",
        border: "1.5px solid #DBEAFE",
        boxShadow: "0 8px 32px rgba(26,76,142,0.10)",
      }}
    >
      {/* ─── タイトル ─── */}
      <p
        className="font-heading text-center"
        style={{ fontSize: "1rem", fontWeight: 800, color: "#1e3a6e", letterSpacing: "0.04em" }}
      >
        中長期伴走サイクル
      </p>

      {/* ─── リング領域（正方形） ─── */}
      <div className="relative mx-auto" style={{ width: "100%", maxWidth: "340px", aspectRatio: "1 / 1" }}>
        {/* 弧矢印 + 装飾点線（SVG レイヤー） */}
        <svg
          viewBox={`0 0 ${VB} ${VB}`}
          className="absolute inset-0 h-full w-full"
          aria-hidden
        >
          <defs>
            <linearGradient id="cycleArcGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#5e8fd0" />
              <stop offset="100%" stopColor="#2f63bd" />
            </linearGradient>
          </defs>

          {/* 装飾：中央まわりの点線円 */}
          <circle cx={C} cy={C} r="74" fill="none" stroke="#cfe0f4" strokeWidth="1" strokeDasharray="2 5" />

          {/* 太い弧矢印（時計回り4本：弧 + 矢じり） */}
          {ARCS.map((a, i) => (
            <g key={i}>
              <path
                d={cycleArc(C, C, R_ARC, a.from, a.to)}
                fill="none"
                stroke="url(#cycleArcGrad)"
                strokeWidth={ARC_W}
                strokeLinecap="round"
              />
              <polygon
                points={cycleArrowHead(C, C, R_ARC, a.to, ARC_W + 5, 8)}
                fill="#2f63bd"
              />
            </g>
          ))}
        </svg>

        {/* 中央：コインスタック + ¥バッジ + テキスト（HTML） */}
        <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
          <div className="relative" style={{ width: 40, height: 34 }}>
            {/* コインスタック（積み重なった円柱） */}
            <svg width="40" height="34" viewBox="0 0 40 34" aria-hidden>
              <g fill="none" stroke="#2f63bd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <ellipse cx="16" cy="8" rx="11" ry="4" />
                <path d="M5 8v6c0 2.2 4.9 4 11 4s11-1.8 11-4V8" />
                <path d="M5 14v6c0 2.2 4.9 4 11 4s11-1.8 11-4v-6" />
              </g>
              {/* ¥ バッジ */}
              <circle cx="30" cy="22" r="8" fill="#2f63bd" />
              <text x="30" y="26" textAnchor="middle" fontSize="10" fontWeight="900" fill="#ffffff">¥</text>
            </svg>
            {/* キラキラ装飾 */}
            <span aria-hidden className="absolute -left-3 -top-2 text-[10px]" style={{ color: "#9cc0ea" }}>✦</span>
            <span aria-hidden className="absolute -right-3 top-0 text-[8px]" style={{ color: "#9cc0ea" }}>✦</span>
          </div>
          <p
            className="font-heading mt-2 text-center leading-tight"
            style={{ fontSize: "0.72rem", fontWeight: 700, color: "#1e3a6e" }}
          >
            継続的な<br />紹介報酬
          </p>
        </div>

        {/* 4ノード（白丸 + アイコン + ラベル, HTML） */}
        {CYCLE_NODES.map((node) => {
          const { Icon, lines } = node;
          return (
            <div
              key={lines.join("")}
              className="absolute flex flex-col items-center justify-center rounded-full bg-white"
              style={{
                left: node.pos.left,
                top: node.pos.top,
                width: "27%",
                height: "27%",
                transform: "translate(-50%, -50%)",
                border: "2px solid #cfe0f4",
                boxShadow: "0 4px 14px rgba(26,76,142,0.12)",
              }}
            >
              <Icon size={20} strokeWidth={1.7} style={{ color: "#3b6fc4" }} aria-hidden />
              <p
                className="font-heading mt-1 text-center leading-tight"
                style={{ fontSize: "0.68rem", fontWeight: 700, color: "#1e3a6e", letterSpacing: "0.01em" }}
              >
                {lines.map((line, li) => (
                  <span key={li}>
                    {line}
                    {li < lines.length - 1 && <br />}
                  </span>
                ))}
              </p>
            </div>
          );
        })}
      </div>

      {/* ─── キャプション ─── */}
      <p
        className="font-body mt-5 text-center"
        style={{ fontSize: "0.75rem", lineHeight: 1.8, color: "#4b6585" }}
      >
        補助金獲得後も継続的に伴走し、次の課題を特定し、<br />
        最適な支援提案へとつなげます。
      </p>
    </div>
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

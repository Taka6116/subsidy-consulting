"use client";

/**
 * [NEW 2026-04-30] NtsComparisonSection — カード型リデザイン
 *
 * レイアウト:
 *   - モバイル（< md）: 1列縦積み
 *   - デスクトップ（>= md）: 3列横並び、NTS列が2px ボーダーで主役化
 *
 * ロールバック手順:
 *   return文内の [NEW] ブロックをコメントアウトし、[LEGACY] ブロックを解除するだけで旧版に戻る。
 *   ファイル変更はこのファイル1つのみ。
 */

import { motion, useReducedMotion } from "framer-motion";
import {
  fadeInUpInitial,
  fadeInUpInView,
  fadeInUpReduced,
  fadeInUpTransition,
  fadeInUpViewport,
} from "@/components/sections/sectionStyles";

// ========== [LEGACY 2026-04-30] 旧比較テーブル用の型・データ・アイコン ==========
// ロールバック時: 下の[NEW]ブロックをコメントアウトし、このLEGACYブロックを解除する
/*
import { CheckCircle2, XCircle, MinusCircle } from "lucide-react";

type CellValue = "good" | "bad" | "partial";

type Axis = {
  axis: string;
  other: { label: string; value: CellValue };
  platform: { label: string; value: CellValue };
  nts: { label: string; value: CellValue };
};

const AXES: readonly Axis[] = [
  {
    axis: "費用",
    other: { label: "数十万〜数百万円", value: "bad" },
    platform: { label: "数万〜数十万円", value: "partial" },
    nts: { label: "成功報酬型で明快", value: "good" },
  },
  {
    axis: "書類作成",
    other: { label: "担当者任せ・品質にムラ", value: "partial" },
    platform: { label: "AI自動生成。通過率が下がる傾向", value: "bad" },
    nts: { label: "審査側視点＋提携行政書士で設計", value: "good" },
  },
  {
    axis: "各種対応サポート",
    other: { label: "別途費用が発生することが多い", value: "bad" },
    platform: { label: "対応不可／経営者本人が対応", value: "bad" },
    nts: { label: "NTSが代わりに対応。経営者の時間を守る", value: "good" },
  },
  {
    axis: "採択後フォロー",
    other: { label: "申請で関係が終わる", value: "bad" },
    platform: { label: "申請で関係が終わる", value: "bad" },
    nts: { label: "1年間伴走。実績報告・精算・効果検証まで", value: "good" },
  },
  {
    axis: "担当者の専門性",
    other: { label: "若手〜実績豊富まで差がある", value: "partial" },
    platform: { label: "担当者なし", value: "bad" },
    nts: { label: "補助金専門コンサルタントが対応", value: "good" },
  },
  {
    axis: "姿勢",
    other: { label: "書類を作ることが目的", value: "bad" },
    platform: { label: "申請件数を増やすことが目的", value: "bad" },
    nts: { label: "採択の先の「活用」まで責任を持つ", value: "good" },
  },
] as const;

function CellIcon({ value }: { value: CellValue }) {
  if (value === "good")
    return (
      <CheckCircle2
        className="h-5 w-5 shrink-0 text-[var(--accent-teal)]"
        aria-hidden
      />
    );
  if (value === "partial")
    return (
      <MinusCircle className="h-5 w-5 shrink-0 text-amber-400" aria-hidden />
    );
  return (
    <XCircle className="h-5 w-5 shrink-0 text-[#9aa5b3]" aria-hidden />
  );
}
*/
// ========== /LEGACY ==========

type ItemStatus = "ok" | "ng" | "warn";

const OTHER_ITEMS: { label: string; status: ItemStatus; text: string }[] = [
  { label: "パートナーとしての姿勢", status: "ng",   text: "書類を作ることが目的" },
  { label: "コストの透明性",         status: "ng",   text: "数十万〜数百万円。不透明になりがち" },
  { label: "申請以外の負担",          status: "warn", text: "別途費用が発生することが多い" },
  { label: "採択後の伴走",            status: "ng",   text: "採択後の関係は続かない" },
  { label: "担当者の専門性",          status: "warn", text: "若手〜実績豊富まで、担当で差が出る" },
  { label: "申請書類の品質",          status: "warn", text: "担当者任せで品質にムラ" },
];

const PLATFORM_ITEMS: { label: string; status: ItemStatus; text: string }[] = [
  { label: "パートナーとしての姿勢", status: "ng", text: "申請件数を増やすことが目的" },
  { label: "コストの透明性",         status: "warn", text: "数万〜数十万円。定額だが対応範囲が限られる" },
  { label: "申請以外の負担",          status: "ng", text: "対応不可。経営者本人が動く必要がある" },
  { label: "採択後の伴走",            status: "ng", text: "採択後の関係は続かない" },
  { label: "担当者の専門性",          status: "ng", text: "担当者なし。自己完結が前提" },
  { label: "申請書類の品質",          status: "ng", text: "AI自動生成。通過率が下がる傾向" },
];

const NTS_ITEMS: { label: string; text: string }[] = [
  { label: "パートナーとしての姿勢", text: "採択の「活用」まで責任を持つ" },
  { label: "コストの透明性",         text: "成功報酬型で明快。採択まで費用なし" },
  { label: "申請以外の負担",          text: "NTSが代わりに対応。経営者の時間を守る" },
  { label: "採択後の伴走",            text: "1年間伴走。実績報告・精算・効果検証まで" },
  { label: "担当者の専門性",          text: "補助金専門コンサルタントが担当" },
  { label: "申請書類の品質",          text: "審査側視点＋提携行政書士で設計" },
];

function StatusIcon({ status }: { status: ItemStatus }) {
  const cls =
    status === "ng"
      ? "text-red-400"
      : status === "warn"
      ? "text-amber-500"
      : "text-emerald-500";
  const symbol = status === "ng" ? "✕" : status === "warn" ? "△" : "✓";
  return (
    <span className={`mt-0.5 flex-shrink-0 text-sm font-bold ${cls}`}>
      {symbol}
    </span>
  );
}

export default function NtsComparisonSection() {
  const reduce = useReducedMotion();

  // ========== [NEW 2026-04-30] カード型比較UI ==========
  return (
    <section
      className="section-block bg-section-white text-[var(--text-primary)]"
      style={{ zIndex: 10 }}
      aria-labelledby="home-nts-comparison-heading"
    >
      <div className="section-inner">
        {/* ヘッダー */}
        <motion.div
          className="mb-14 text-center"
          initial={reduce ? fadeInUpReduced : fadeInUpInitial}
          whileInView={reduce ? fadeInUpReduced : fadeInUpInView}
          viewport={fadeInUpViewport}
          transition={fadeInUpTransition}
        >
          <h2
            id="home-nts-comparison-heading"
            className="mb-4 font-heading text-[1.75rem] font-bold leading-tight tracking-tight text-[var(--text-primary)] md:text-[2.25rem]"
          >
            「申請して終わり」を、終わらせる。
          </h2>
          <p className="mx-auto max-w-lg text-base leading-relaxed text-[var(--text-secondary)]">
            補助金パートナー選びで本当に見るべきは、
            <br className="hidden md:inline" />
            「採択の先で何をしてくれるか」です。
          </p>
        </motion.div>

        {/* 3カードグリッド */}
        <motion.div
          className="grid grid-cols-1 items-start gap-4 md:grid-cols-3 md:gap-3"
          initial={reduce ? fadeInUpReduced : fadeInUpInitial}
          whileInView={reduce ? fadeInUpReduced : fadeInUpInView}
          viewport={fadeInUpViewport}
          transition={{ ...fadeInUpTransition, delay: 0.08 }}
        >
          {/* ─── カード①：書類を作る人 ─── */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 opacity-90">
            <div className="mb-5 border-b border-slate-200 pb-5">
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                書類を作る人
              </p>
              <p className="mb-1 text-base font-semibold text-slate-700">
                補助金会社・FA
              </p>
              <p className="text-sm leading-relaxed text-slate-500">
                申請で、
                <br />
                関係が終わる。
              </p>
            </div>

            <ul className="space-y-4">
              {OTHER_ITEMS.map((item) => (
                <li key={item.label}>
                  <p className="mb-1 text-[10px] font-semibold tracking-[0.08em] text-slate-400">
                    {item.label}
                  </p>
                  <div className="flex items-start gap-2">
                    <StatusIcon status={item.status} />
                    <p className="text-sm leading-relaxed text-slate-500">{item.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* ─── カード②：ツールを使う場所 ─── */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 opacity-90">
            <div className="mb-5 border-b border-slate-200 pb-5">
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                ツールを使う場所
              </p>
              <p className="mb-1 text-base font-semibold text-slate-700">
                補助金プラットフォーム
              </p>
              <p className="text-sm leading-relaxed text-slate-500">
                ツールだけで、
                <br />
                終わる。
              </p>
            </div>

            <ul className="space-y-4">
              {PLATFORM_ITEMS.map((item) => (
                <li key={item.label}>
                  <p className="mb-1 text-[10px] font-semibold tracking-[0.08em] text-slate-400">
                    {item.label}
                  </p>
                  <div className="flex items-start gap-2">
                    <StatusIcon status={item.status} />
                    <p className="text-sm leading-relaxed text-slate-500">{item.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* ─── カード③：日本提携支援（主役） ─── */}
          <div className="relative rounded-2xl border-2 border-emerald-500 bg-white p-6 shadow-lg shadow-emerald-500/10">
            {/* 上部バッジ */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="whitespace-nowrap rounded-full bg-emerald-600 px-4 py-1 text-[11px] font-semibold tracking-wide text-white">
                日本提携支援
              </span>
            </div>

            <div className="mb-5 mt-1 border-b border-slate-100 pb-5">
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-600">
                経営に伴走する仕組み
              </p>
              <p className="mb-1 text-base font-semibold text-slate-900">
                日本提携支援
              </p>
              <p className="text-sm leading-relaxed text-slate-600">
                採択の先まで、
                <br />
                一緒に走る。
              </p>
            </div>

            <ul className="space-y-4">
              {NTS_ITEMS.map((item) => (
                <li key={item.label}>
                  <p className="mb-1 text-[10px] font-semibold tracking-[0.08em] text-slate-400">
                    {item.label}
                  </p>
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 flex-shrink-0 text-sm font-bold text-emerald-500">
                      ✓
                    </span>
                    <p className="text-sm font-semibold leading-relaxed text-slate-900">
                      {item.text}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <div className="mt-6 border-t border-slate-100 pt-5">
              <a
                href="/contact"
                className="block w-full rounded-full bg-emerald-600 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-emerald-700 active:scale-[0.98]"
              >
                無料相談する →
              </a>
              <p className="mt-2 text-center text-[11px] text-slate-400">
                NTSへの相談は無料。採択後の成功報酬のみ
              </p>
            </div>
          </div>
        </motion.div>

        {/* 注記 */}
        <p className="mt-8 border-l-2 border-slate-200 pl-4 text-xs leading-relaxed text-[var(--text-secondary)]">
          ※ NTSへの相談は無料です。採択後の成功報酬については個別にご案内いたします。
          書類作成や各種対応は、別途費用なくNTSが一括して対応します。
        </p>
      </div>
    </section>
  );
  // ========== /NEW ==========
}

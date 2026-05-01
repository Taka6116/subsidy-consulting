"use client";

import { useState } from "react";
import Link from "next/link";

type CheckItem = { id: string; label: string };

const DEFAULT_CHECKS: CheckItem[] = [
  { id: "c1", label: "中小企業または中堅企業である" },
  { id: "c2", label: "新規事業・業態転換・DX投資などを検討している" },
  { id: "c3", label: "売上の減少・コスト増加など、経営上の課題を抱えている" },
];

type Result = "high" | "mid" | "low" | null;

function getResult(count: number): Result {
  if (count === 3) return "high";
  if (count === 2) return "mid";
  if (count === 1) return "low";
  return null;
}

const RESULT_CONFIG = {
  high: {
    label: "対象の可能性が高い",
    body: "3項目すべてに該当しています。この補助金を活用できる可能性が高いです。無料相談で要件・補助額・申請手順を個別に整理しましょう。",
    cta: { label: "無料相談を予約する →", href: "/consult" },
    ctaStyle: {
      background: "var(--nts-accent-orange)",
      color: "#0F172A",
      boxShadow: "var(--nts-glow-orange)",
    },
    badgeStyle: { background: "rgba(16,185,129,0.18)", color: "#34D399" },
  },
  mid: {
    label: "詳細確認を推奨します",
    body: "一部の要件に該当しています。申請できるかどうかは公募要領の詳細確認が必要です。専門家に質問して、申請可否を早めに判断しましょう。",
    cta: { label: "専門家に質問する →", href: "/consult" },
    ctaStyle: {
      background: "var(--nts-accent-teal)",
      color: "#0F172A",
    },
    badgeStyle: { background: "rgba(245,158,11,0.18)", color: "#FCD34D" },
  },
  low: {
    label: "別の補助金が向いているかも",
    body: "現時点では別の補助金制度の方がマッチする可能性があります。補助金一覧から条件に合う制度を探してみましょう。",
    cta: { label: "他の補助金を見る →", href: "/subsidies/list" },
    ctaStyle: {
      background: "#F8FAFC",
      color: "#0F172A",
      border: "1px solid #E2E8F0",
    },
    badgeStyle: { background: "rgba(99,102,241,0.18)", color: "#A5B4FC" },
  },
};

export default function SubsidyLpChecker() {
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const count = checked.size;
  const result = getResult(count);
  const cfg = result ? RESULT_CONFIG[result] : null;

  return (
    <section className="bg-white py-16 md:py-24">
      <div className="relative mx-auto max-w-3xl overflow-hidden rounded-[28px] border border-slate-100 bg-white px-6 py-10 shadow-[0_18px_45px_rgba(23,32,51,0.08)] sm:px-10 sm:py-12">
      {/* 装飾グロー */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full blur-3xl"
        style={{ background: "rgba(14,165,164,0.12)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-16 -right-16 h-52 w-52 rounded-full blur-3xl"
        style={{ background: "rgba(79,70,229,0.1)" }}
      />

      <div className="relative">
        {/* ヘッダー */}
        <h2
          className="text-xl font-black leading-snug tracking-[-0.02em] sm:text-2xl"
          style={{ color: "var(--text-primary)" }}
        >
          あなたの会社は、この補助金の対象ですか？
        </h2>
        <p
          className="mt-2 text-sm font-medium"
          style={{ color: "var(--text-secondary)" }}
        >
          該当する項目にチェックを入れてください（複数可）
        </p>

        {/* チェックボックス群 */}
        <fieldset className="mt-7 space-y-3" aria-label="対象診断チェック">
          <legend className="sr-only">対象診断チェックリスト</legend>
          {DEFAULT_CHECKS.map((item) => {
            const isChecked = checked.has(item.id);
            return (
              <label
                key={item.id}
                className="flex cursor-pointer items-start gap-4 rounded-2xl px-4 py-4 transition"
                style={{
                  background: isChecked
                    ? "rgba(14,165,164,0.12)"
                    : "#F8FAFC",
                  border: `1px solid ${isChecked ? "rgba(14,165,164,0.4)" : "#E2E8F0"}`,
                  transitionDuration: "var(--nts-dur-fast)",
                }}
              >
                <span
                  className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition"
                  style={{
                    background: isChecked ? "var(--nts-accent-teal)" : "#FFFFFF",
                    border: isChecked ? "none" : "1.5px solid #CBD5E1",
                    transitionDuration: "var(--nts-dur-fast)",
                  }}
                  aria-hidden
                >
                  {isChecked && (
                    <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
                      <path d="M1 5L5 9L13 1" stroke="#0F172A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={isChecked}
                  onChange={() => toggle(item.id)}
                  aria-label={item.label}
                />
                <span
                  className="text-sm font-bold leading-relaxed"
                  style={{ color: isChecked ? "var(--nts-text-primary-light)" : "var(--nts-text-secondary-light)" }}
                >
                  {item.label}
                </span>
              </label>
            );
          })}
        </fieldset>

        {/* 結果パネル */}
        {cfg && (
          <div
            className="mt-6 overflow-hidden rounded-2xl"
            style={{
              background: "#F8FAFC",
              border: "1px solid #E2E8F0",
              animation: "nts-fade-up var(--nts-dur-normal) var(--nts-ease-out) both",
            }}
          >
            <div className="px-5 py-5">
              <div className="flex items-center gap-3">
                <span
                  className="inline-flex items-center rounded-full px-3 py-1 text-xs font-extrabold"
                  style={cfg.badgeStyle}
                >
                  {cfg.label}
                </span>
              </div>
              <p
                className="mt-3 text-sm font-medium leading-7"
                style={{ color: "var(--nts-text-secondary-light)" }}
              >
                {cfg.body}
              </p>
              <Link
                href={cfg.cta.href}
                className="mt-4 inline-flex items-center rounded-full px-6 py-3 text-sm font-extrabold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
                style={{
                  ...cfg.ctaStyle,
                  transitionDuration: "var(--nts-dur-fast)",
                }}
              >
                {cfg.cta.label}
              </Link>
            </div>
          </div>
        )}

        {/* 未選択時のヒント */}
        {count === 0 && (
          <p
            className="mt-4 text-center text-xs"
            style={{ color: "var(--nts-text-tertiary-light)" }}
          >
            ↑ チェックを入れると診断結果が表示されます
          </p>
        )}
      </div>
      </div>
    </section>
  );
}

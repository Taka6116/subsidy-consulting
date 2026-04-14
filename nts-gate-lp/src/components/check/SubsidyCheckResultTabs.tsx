"use client";

import Image from "next/image";
import Link from "next/link";
import { useId, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  FileText,
} from "lucide-react";
import type { MatchedSubsidyPreview } from "@/lib/subsidyCheckMocks";
import {
  RESULT_DASHBOARD_HERO_IMAGE,
  eligibilityPair,
} from "@/lib/subsidyCheckResultHelpers";
import heroStyles from "@/components/gate-lp/hero-three/HeroSection.module.css";

type TabId = "overview" | "examples" | "checks" | "related";

const TABS: { id: TabId; label: string }[] = [
  { id: "overview", label: "概要" },
  { id: "examples", label: "活用例" },
  { id: "checks", label: "確認事項" },
  { id: "related", label: "その他関連補助金" },
];

type Props = {
  item: MatchedSubsidyPreview;
  results: MatchedSubsidyPreview[];
  activeResultIndex: number;
  onChangeActiveIndex: (index: number) => void;
};

export default function SubsidyCheckResultTabs({
  item,
  results,
  activeResultIndex,
  onChangeActiveIndex,
}: Props) {
  const baseId = useId();
  const [tab, setTab] = useState<TabId>("overview");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const onTabKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const next = (index + 1) % TABS.length;
      setTab(TABS[next]!.id);
      queueMicrotask(() => tabRefs.current[next]?.focus());
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prev = (index - 1 + TABS.length) % TABS.length;
      setTab(TABS[prev]!.id);
      queueMicrotask(() => tabRefs.current[prev]?.focus());
    } else if (e.key === "Home") {
      e.preventDefault();
      setTab("overview");
      queueMicrotask(() => tabRefs.current[0]?.focus());
    } else if (e.key === "End") {
      e.preventDefault();
      const last = TABS.length - 1;
      setTab(TABS[last]!.id);
      queueMicrotask(() => tabRefs.current[last]?.focus());
    }
  };

  const selectRelated = (globalIndex: number) => {
    onChangeActiveIndex(globalIndex);
    setTab("overview");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const d = item.decision;
  const factBody = item.description ?? item.summary;
  const criteria = eligibilityPair(item);
  const insightCards = d?.insightCards ?? [];
  const risks = d?.riskFlags ?? [];
  const reasons = d?.matchReason ?? [];
  /** メイン切替後も元の候補へ戻せるよう、全件を一覧に含める（index 0 も表示） */
  const relatedCandidates = results;

  return (
    <div className="results-dashboard rounded-2xl border border-white/10 bg-white/[0.05] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-[14px] [-webkit-backdrop-filter:blur(14px)] sm:p-6 md:p-8">
      <header className="mb-8 flex flex-col gap-6 md:mb-10 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-white/35">
            照合結果
          </p>
          <h1 className="font-heading text-2xl font-bold leading-tight text-white md:text-3xl">
            {item.name}
          </h1>
          {item.institutionName ? (
            <p className="mt-2 text-sm text-white/70">
              実施主体（参考）: {item.institutionName}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-3 md:gap-4">
          <div className="min-w-[140px] rounded-xl border border-white/10 bg-white/[0.08] px-5 py-3">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-white/40">
              最大補助（参照）
            </p>
            <p className="font-display text-xl font-bold tabular-nums text-white md:text-2xl">
              {item.maxAmountLabel}
            </p>
          </div>
          <div className="min-w-[140px] rounded-xl border border-white/10 bg-white/[0.08] px-5 py-3">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-white/40">
              公募期限
            </p>
            <p className="text-base font-bold text-white">
              {item.deadlineLabel && item.deadlineLabel !== "—"
                ? item.deadlineLabel
                : "要確認"}
            </p>
          </div>
        </div>
      </header>

      <div
        role="tablist"
        aria-label="照合結果の内訳"
        className="mb-8 flex gap-1 overflow-x-auto rounded-2xl border border-white/10 bg-[rgba(4,12,24,0.35)] p-1 backdrop-blur-md"
      >
        {TABS.map(({ id, label }, i) => {
          const selected = tab === id;
          const panelId = `${baseId}-panel-${id}`;
          return (
            <button
              key={id}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${id}`}
              aria-selected={selected}
              aria-controls={panelId}
              tabIndex={selected ? 0 : -1}
              onClick={() => setTab(id)}
              onKeyDown={(e) => onTabKeyDown(e, i)}
              className={`min-w-[112px] flex-1 rounded-lg px-5 py-2.5 text-center text-sm font-bold transition-all sm:min-w-[120px] ${
                selected
                  ? "bg-white text-[#0a1628] shadow-md shadow-black/20"
                  : "text-white/55 hover:bg-white/[0.06] hover:text-white"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="space-y-8">
        {tab === "overview" && (
          <div
            role="tabpanel"
            id={`${baseId}-panel-overview`}
            aria-labelledby={`${baseId}-tab-overview`}
            className="space-y-8"
          >
            <section
              className="relative min-h-[280px] overflow-hidden rounded-3xl bg-[var(--rd-surface-high)] md:min-h-[320px]"
              aria-label="制度概要"
            >
              <div className="absolute inset-0">
                <Image
                  src={RESULT_DASHBOARD_HERO_IMAGE}
                  alt=""
                  fill
                  className="object-cover opacity-35 transition-opacity duration-700 hover:opacity-45"
                  sizes="(max-width: 768px) 100vw, 896px"
                  priority
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-[rgba(6,14,28,0.95)] via-[rgba(6,14,28,0.55)] to-transparent"
                  aria-hidden
                />
              </div>
              <div className="relative z-10 flex min-h-[280px] flex-col justify-end p-6 md:min-h-[320px] md:p-10">
                <span className="mb-3 inline-block w-fit rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white/90">
                  概要
                </span>
                {d?.summary ? (
                  <p
                    id={`${baseId}-featured-heading`}
                    className="mb-4 max-w-2xl text-sm font-medium leading-relaxed text-white/70 md:text-base"
                  >
                    {d.summary}
                  </p>
                ) : null}
                {factBody ? (
                  <p className="mb-8 max-w-2xl text-sm leading-relaxed text-white md:text-base">
                    {factBody.length > 560 ? `${factBody.slice(0, 560)}…` : factBody}
                  </p>
                ) : (
                  <p className="mb-8 text-sm text-white/70">
                    説明文の取得がありません。公式情報でご確認ください。
                  </p>
                )}
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
                  <Link
                    href="/consult"
                    className={heroStyles.cta}
                  >
                    無料相談を申し込む
                    <span className={heroStyles.ctaArrow} aria-hidden="true">
                      →
                    </span>
                  </Link>
                  {item.detailUrl?.trim() ? (
                    <a
                      href={item.detailUrl.trim()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={heroStyles.ctaSecondary}
                    >
                      公式の詳細を見る
                      <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
                    </a>
                  ) : null}
                </div>
              </div>
            </section>
          </div>
        )}

        {tab === "examples" && (
          <div
            role="tabpanel"
            id={`${baseId}-panel-examples`}
            aria-labelledby={`${baseId}-tab-examples`}
          >
            {insightCards.length > 0 ? (
              <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {insightCards.map((card, idx) => (
                  <li
                    key={`${card.title}-${idx}`}
                    className="rounded-2xl border border-[var(--rd-border)] bg-[var(--rd-surface)] p-6"
                  >
                    <p className="mb-2 text-xs font-bold uppercase tracking-wide text-white/70">
                      {card.title}
                    </p>
                    <p className="text-sm leading-relaxed text-[var(--rd-on-surface)]">
                      {card.body}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rounded-2xl border border-dashed border-[var(--rd-border)] bg-[var(--rd-surface)]/60 p-8 text-center text-sm text-[var(--rd-on-surface-variant)]">
                照合結果に活用例の生成（insightCards）が含まれていません。概要タブの要約・本文をご確認ください。
              </p>
            )}
          </div>
        )}

        {tab === "checks" && (
          <div
            role="tabpanel"
            id={`${baseId}-panel-checks`}
            aria-labelledby={`${baseId}-tab-checks`}
            className="space-y-8"
          >
            {risks.length > 0 ? (
              <section aria-labelledby={`${baseId}-risks-heading`}>
                <h2
                  id={`${baseId}-risks-heading`}
                  className="mb-3 flex items-center gap-2 font-heading text-lg font-bold text-amber-300"
                >
                  <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden />
                  注意・リスクフラグ
                </h2>
                <ul className="space-y-2 rounded-2xl border border-[var(--rd-warning)]/35 bg-[var(--rd-warning)]/10 p-4">
                  {risks.map((r) => (
                    <li
                      key={r}
                      className="text-sm leading-relaxed text-[var(--rd-on-surface)]"
                    >
                      {r}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <section aria-labelledby={`${baseId}-target-reasons-heading`}>
              <h2
                id={`${baseId}-target-reasons-heading`}
                className="mb-3 font-heading text-lg font-bold text-[var(--rd-on-surface)]"
              >
                対象理由
              </h2>
              {reasons.length > 0 ? (
                <ul className="space-y-3">
                  {reasons.map((line) => (
                    <li
                      key={line}
                      className="flex gap-3 rounded-xl border border-[var(--rd-border)] bg-[var(--rd-surface)] p-4 text-sm leading-relaxed text-[var(--rd-on-surface)]"
                    >
                      <CheckCircle2
                        className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400"
                        aria-hidden
                      />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-[var(--rd-on-surface-variant)]">
                  理由文がありません。
                </p>
              )}
            </section>

            <section aria-labelledby={`${baseId}-criteria-heading`}>
              <h2
                id={`${baseId}-criteria-heading`}
                className="mb-3 font-heading text-lg font-bold text-[var(--rd-on-surface)]"
              >
                事実ベースの条件（抜粋）
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {criteria.map((c) => (
                  <div
                    key={c.label}
                    className="rounded-xl border border-[var(--rd-border)] bg-[var(--rd-surface-high)] p-4"
                  >
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-white/70">
                      {c.label}
                    </p>
                    <p className="text-sm leading-relaxed text-[var(--rd-on-surface)]">
                      {c.text}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {tab === "related" && (
          <div
            role="tabpanel"
            id={`${baseId}-panel-related`}
            aria-labelledby={`${baseId}-tab-related`}
          >
            {relatedCandidates.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-[var(--rd-border)] bg-[var(--rd-surface)]/60 p-8 text-center text-sm text-[var(--rd-on-surface-variant)]">
                候補がありません。
              </p>
            ) : (
              <ul className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {relatedCandidates.map((r, globalIndex) => {
                  const selected = activeResultIndex === globalIndex;
                  return (
                    <li key={r.id}>
                      <button
                        type="button"
                        onClick={() => selectRelated(globalIndex)}
                        className={`flex h-full w-full flex-col rounded-2xl border p-6 text-left transition ${
                          selected
                            ? "border-[var(--rd-primary)] bg-[var(--rd-surface-high)] ring-2 ring-[var(--rd-primary)]/40"
                            : "border-[var(--rd-border)] bg-[var(--rd-surface)] hover:border-[var(--rd-border-strong)]"
                        }`}
                      >
                        <span className="mb-3 inline-block w-fit rounded-full bg-[var(--rd-primary-muted)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--rd-primary)]">
                          {selected ? "表示中" : "候補"}
                        </span>
                        <span className="font-heading text-base font-semibold text-[var(--rd-on-surface)]">
                          {r.name}
                        </span>
                        <span className="mt-3 font-display text-xl font-bold text-white">
                          {r.maxAmountLabel}
                        </span>
                        <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[var(--rd-primary)]">
                          この制度をメインに表示
                          <ChevronRight className="h-4 w-4" aria-hidden />
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>

      <p className="mt-10 flex items-start gap-2 text-xs leading-relaxed text-[var(--rd-on-surface-dim)]">
        <FileText className="mt-0.5 h-4 w-4 shrink-0 text-[var(--rd-on-surface-dim)]" aria-hidden />
        補助金採択を確約するものではありません。
      </p>
    </div>
  );
}

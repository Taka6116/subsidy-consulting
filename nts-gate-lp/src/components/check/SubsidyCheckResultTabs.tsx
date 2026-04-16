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
    <div className="results-dashboard nts-card p-4 sm:p-6 md:p-8">
      <header className="mb-8 flex flex-col gap-6 md:mb-10 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">
            照合結果
          </p>
          <h1 className="font-heading text-2xl font-bold leading-tight text-[var(--text-primary)] md:text-3xl">
            {item.name}
          </h1>
          {item.institutionName ? (
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              実施主体（参考）: {item.institutionName}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-3 md:gap-4">
          <div className="min-w-[140px] rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-section-alt)] px-5 py-3">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
              最大補助（参照）
            </p>
            <p className="font-display text-xl font-bold tabular-nums text-[var(--text-primary)] md:text-2xl">
              {item.maxAmountLabel}
            </p>
          </div>
          <div className="min-w-[140px] rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-section-alt)] px-5 py-3">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
              公募期限
            </p>
            <p className="text-base font-bold text-[var(--text-primary)]">
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
        className="mb-8 flex gap-1 overflow-x-auto rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-section-alt)] p-1"
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
                  ? "bg-[var(--accent-navy)] text-white shadow-md"
                  : "text-[var(--text-muted)] hover:bg-[var(--bg-base)] hover:text-[var(--text-primary)]"
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
              className="overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-white)]"
              aria-label="制度概要"
            >
              {/* ヒーロー画像エリア（画像あり） */}
              <div className="relative h-56 w-full overflow-hidden md:h-64">
                <Image
                  src={RESULT_DASHBOARD_HERO_IMAGE}
                  alt=""
                  fill
                  className="object-cover object-top opacity-70"
                  sizes="(max-width: 768px) 100vw, 896px"
                  priority
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-[var(--accent-navy)]/70 via-[var(--accent-navy)]/30 to-transparent"
                  aria-hidden
                />
                <span className="absolute bottom-4 left-6 inline-block rounded-full border border-white/30 bg-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-sm">
                  概要
                </span>
              </div>
              {/* テキストエリア */}
              <div className="p-6 md:p-8">
                {d?.summary ? (
                  <p className="mb-3 text-sm font-medium leading-relaxed text-[var(--text-secondary)] md:text-base">
                    {d.summary}
                  </p>
                ) : null}
                {factBody ? (
                  <p className="mb-6 text-sm leading-[1.9] text-[var(--text-primary)] md:text-base">
                    {factBody.length > 560 ? `${factBody.slice(0, 560)}…` : factBody}
                  </p>
                ) : (
                  <p className="mb-6 text-sm text-[var(--text-muted)]">
                    説明文の取得がありません。公式情報でご確認ください。
                  </p>
                )}
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                  <Link href="/consult" className={heroStyles.cta}>
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
                    className="nts-card p-6"
                  >
                    <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--accent-teal)]">
                      {card.title}
                    </p>
                    <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                      {card.body}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="rounded-xl border border-dashed border-[var(--border-subtle)] bg-[var(--bg-section-alt)] p-8 text-center">
                <p className="text-sm text-[var(--text-muted)]">
                  活用例の詳細はまだ生成されていません。
                </p>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  概要タブの制度説明をご確認いただき、活用のイメージは
                  <Link href="/consult" className="ml-1 font-medium text-[var(--accent-teal)] underline underline-offset-2 hover:opacity-80">
                    無料相談
                  </Link>
                  でお気軽にご相談ください。
                </p>
              </div>
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
                  className="mb-3 flex items-center gap-2 font-heading text-lg font-bold text-amber-700"
                >
                  <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden />
                  注意・リスクフラグ
                </h2>
                <ul className="space-y-2 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  {risks.map((r) => (
                    <li
                      key={r}
                      className="text-sm leading-relaxed text-[var(--text-primary)]"
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
                className="mb-3 font-heading text-lg font-bold text-[var(--text-primary)]"
              >
                対象理由
              </h2>
              {reasons.length > 0 ? (
                <ul className="space-y-3">
                  {reasons.map((line) => (
                    <li
                      key={line}
                      className="flex gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-white)] p-4 text-sm leading-relaxed text-[var(--text-primary)]"
                    >
                      <CheckCircle2
                        className="mt-0.5 h-5 w-5 shrink-0 text-[var(--accent-teal)]"
                        aria-hidden
                      />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="rounded-xl border border-dashed border-[var(--border-subtle)] bg-[var(--bg-section-alt)] p-6 text-center">
                  <p className="text-sm text-[var(--text-muted)]">
                    照合根拠の詳細データがありません。
                  </p>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">
                    公募要領を直接ご確認いただくか、
                    <Link href="/consult" className="ml-1 font-medium text-[var(--accent-teal)] underline underline-offset-2 hover:opacity-80">
                      無料相談
                    </Link>
                    でお問い合わせください。
                  </p>
                </div>
              )}
            </section>

            <section aria-labelledby={`${baseId}-criteria-heading`}>
              <h2
                id={`${baseId}-criteria-heading`}
                className="mb-3 font-heading text-lg font-bold text-[var(--text-primary)]"
              >
                事実ベースの条件（抜粋）
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {criteria.map((c) => (
                  <div
                    key={c.label}
                    className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-section-alt)] p-4"
                  >
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                      {c.label}
                    </p>
                    <p className="text-sm leading-relaxed text-[var(--text-primary)]">
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
              <div className="rounded-2xl border border-dashed border-[var(--border-subtle)] bg-[var(--bg-section-alt)] p-8 text-center">
                <p className="text-sm text-[var(--text-muted)]">他の候補補助金がありません。</p>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  業種・規模・目的を変えて再診断するか、
                  <Link href="/consult" className="ml-1 font-medium text-[var(--accent-teal)] underline underline-offset-2 hover:opacity-80">
                    無料相談
                  </Link>
                  でご確認ください。
                </p>
              </div>
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
                            ? "border-[var(--accent-teal)] bg-[var(--bg-section-alt)] ring-2 ring-[var(--accent-teal)]/30"
                            : "border-[var(--border-subtle)] bg-[var(--bg-white)] hover:border-[var(--accent-teal)]/50 hover:shadow-sm"
                        }`}
                      >
                        <span className="mb-3 inline-block w-fit rounded-full bg-[var(--accent-teal)]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--accent-teal)]">
                          {selected ? "表示中" : "候補"}
                        </span>
                        <span className="font-heading text-base font-semibold text-[var(--text-primary)]">
                          {r.name}
                        </span>
                        <span className="mt-3 font-display text-xl font-bold text-[var(--accent-navy)]">
                          {r.maxAmountLabel}
                        </span>
                        <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent-teal)]">
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

      <p className="mt-10 flex items-start gap-2 text-xs leading-relaxed text-[var(--text-muted)]">
        <FileText className="mt-0.5 h-4 w-4 shrink-0 text-[var(--text-muted)]" aria-hidden />
        補助金採択を確約するものではありません。
      </p>
    </div>
  );
}

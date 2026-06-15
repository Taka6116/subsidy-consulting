"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { INDUSTRY_OPTIONS } from "@/data/industryOptions";
import { JAPAN_PREFECTURES } from "@/data/japanPrefectures";
import type { MatchedSubsidyPreview } from "@/lib/subsidyCheckMocks";
import type { CorporateCandidate } from "@/types/corporateSearch";
import SubsidyMatchLoading from "@/components/check/SubsidyMatchLoading";
import SubsidyCheckResultTabs from "@/components/check/SubsidyCheckResultTabs";
import {
  cleanSubsidyDescription,
  cleanSubsidyName,
} from "@/lib/subsidyCheckResultHelpers";
import heroStyles from "@/components/gate-lp/hero-three/HeroSection.module.css";

const EMPLOYEE_OPTIONS: { id: string; label: string }[] = [
  { id: "", label: "選択しない" },
  { id: "1〜5人", label: "1〜5人" },
  { id: "6〜20人", label: "6〜20人" },
  { id: "21〜50人", label: "21〜50人" },
  { id: "51〜100人", label: "51〜100人" },
  { id: "101〜300人", label: "101〜300人" },
  { id: "301人以上", label: "301人以上" },
];

function parseStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === "string");
}

const MAX_INSIGHT_CARDS_PARSE = 4;

function parseInsightCardsFromApi(v: unknown): { title: string; body: string }[] {
  if (!Array.isArray(v)) return [];
  const out: { title: string; body: string }[] = [];
  for (const el of v) {
    if (!el || typeof el !== "object") continue;
    const o = el as Record<string, unknown>;
    const title = typeof o.title === "string" ? o.title.trim() : "";
    const body = typeof o.body === "string" ? o.body.trim() : "";
    if (!title || !body) continue;
    out.push({ title, body });
    if (out.length >= MAX_INSIGHT_CARDS_PARSE) break;
  }
  return out;
}

function parseMatchApiResults(payload: unknown): MatchedSubsidyPreview[] {
  if (payload === null || typeof payload !== "object") return [];
  const raw = (payload as { results?: unknown }).results;
  if (!Array.isArray(raw)) return [];

  return raw
    .map((r) => {
      if (!r || typeof r !== "object") return null;
      const row = r as Record<string, unknown>;
      const id = typeof row.id === "string" ? row.id : "";
      if (!id) return null;
      const rawName = typeof row.name === "string" ? row.name : "名称未設定";
      /** 末尾の「（21次締切）」等、一般ユーザーに意味不明な公募回数表記を落として表示 */
      const name = cleanSubsidyName(rawName) || rawName;
      /**
       * jGrants 原文の description には「■問合せ先」「■参照URL」等が含まれ、
       * 放置するとユーザーが NTS を介さず事務局へ直接連絡してしまうため必ず除去する。
       */
      const description = cleanSubsidyDescription(
        typeof row.description === "string" ? row.description : "",
      );
      const maxAmountLabel = typeof row.maxAmountLabel === "string" ? row.maxAmountLabel : "—";
      const deadlineLabel = typeof row.deadlineLabel === "string" ? row.deadlineLabel : "—";
      const targetIndustries = parseStringArray(row.targetIndustries);
      const subsidyRate = typeof row.subsidyRate === "string" ? row.subsidyRate : "";
      const targetArea = typeof row.targetArea === "string" ? row.targetArea : "";
      const institutionName = typeof row.institutionName === "string" ? row.institutionName : "";
      const detailUrl = typeof row.detailUrl === "string" ? row.detailUrl : "";

      const matchScoreRaw = row.matchScore;
      const matchScore =
        typeof matchScoreRaw === "number" && Number.isFinite(matchScoreRaw) ? matchScoreRaw : 0;
      const decisionSummary = cleanSubsidyDescription(
        typeof row.summary === "string" ? row.summary : "",
      );
      const matchReason = parseStringArray(row.matchReason);
      const riskFlags = parseStringArray(row.riskFlags);
      const insightCards = parseInsightCardsFromApi(row.insightCards);

      const out: MatchedSubsidyPreview = {
        id,
        name,
        maxAmountLabel,
        deadlineLabel,
        summary: decisionSummary || description,
        description: description || undefined,
        targetIndustries: targetIndustries.length ? targetIndustries : undefined,
        subsidyRate: subsidyRate || undefined,
        targetArea: targetArea || undefined,
        institutionName: institutionName || undefined,
        detailUrl: detailUrl || undefined,
        decision: {
          matchScore,
          summary: decisionSummary,
          matchReason,
          riskFlags,
          ...(insightCards.length > 0 ? { insightCards } : {}),
        },
      };
      return out;
    })
    .filter((item): item is MatchedSubsidyPreview => item != null);
}

type Step = "form" | "loading" | "results";

type InitialValues = {
  companyName?: string;
  companyWebsiteUrl?: string;
  industryId?: string;
  prefecture?: string;
  employees?: string;
  businessNotes?: string;
  autorun?: boolean;
};

type Props = {
  audience: "end_user" | "partner";
  initialValues?: InitialValues;
};

function syntheticCorporate(name: string, prefecture: string): CorporateCandidate {
  const n = name.trim();
  return {
    corporateNumber: "",
    name: n,
    prefecture: prefecture.trim(),
    city: "",
  };
}

export default function SubsidyCheckClient({ audience, initialValues }: Props) {
  const [step, setStep] = useState<Step>("form");
  const [companyName, setCompanyName] = useState(initialValues?.companyName ?? "");
  const [industryId, setIndustryId] = useState(initialValues?.industryId ?? "");
  const [prefecture, setPrefecture] = useState(initialValues?.prefecture ?? "");
  const [employees, setEmployees] = useState(initialValues?.employees ?? "");
  const [businessNotes, setBusinessNotes] = useState(initialValues?.businessNotes ?? "");
  const [companyWebsiteUrl, setCompanyWebsiteUrl] = useState(
    initialValues?.companyWebsiteUrl ?? "",
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<CorporateCandidate | null>(null);
  const [results, setResults] = useState<MatchedSubsidyPreview[]>([]);
  const [activeResultIndex, setActiveResultIndex] = useState(0);
  const [searchLoading, setSearchLoading] = useState(false);
  /** 照合 API 完了（ローディングで最終フレーム→結果へ進むトリガー） */
  const [matchApiComplete, setMatchApiComplete] = useState(false);

  const isPartner = audience === "partner";
  /** フォーム内ウィザード: 1=必須項目 2=任意項目 */
  const [wizardStep, setWizardStep] = useState<1 | 2>(1);

  const canProceedToStep2 =
    companyName.trim() !== "" && industryId !== "" && prefecture !== "";

  useEffect(() => {
    setActiveResultIndex(0);
  }, [results]);

  const handleLoadingComplete = useCallback(() => {
    setStep("results");
    setMatchApiComplete(false);
  }, []);

  /** ヒーロー側のクイック診断フォームから ?autorun=1 で渡された場合に
   *  着地と同時に照合を走らせる。重複起動防止のため ref ガード。 */
  const autoRunStartedRef = useRef(false);

  const reset = useCallback(() => {
    setStep("form");
    setCompanyName("");
    setIndustryId("");
    setPrefecture("");
    setEmployees("");
    setBusinessNotes("");
    setCompanyWebsiteUrl("");
    setFormError(null);
    setConfirmed(null);
    setResults([]);
    setActiveResultIndex(0);
    setSearchLoading(false);
    setMatchApiComplete(false);
  }, []);

  const runMatch = useCallback(
    async (corp: CorporateCandidate) => {
      try {
        const industryLabel =
          INDUSTRY_OPTIONS.find((o) => o.id === industryId)?.label ?? industryId;

        const matchRes = await fetch("/api/subsidy/match", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            industry: industryId,
            companyName: corp.name,
            industryLabel,
            prefecture: corp.prefecture || "",
            employees: employees.trim(),
            revenueBand: "",
            businessNotes: businessNotes.trim(),
            companyWebsiteUrl: companyWebsiteUrl.trim(),
          }),
        });

        let matchJson: unknown;
        try {
          matchJson = await matchRes.json();
        } catch {
          matchJson = null;
        }

        const rows = parseMatchApiResults(matchJson);
        setResults(rows);
      } catch {
        setResults([]);
      } finally {
        setMatchApiComplete(true);
      }
    },
    [industryId, employees, businessNotes, companyWebsiteUrl],
  );

  useEffect(() => {
    if (autoRunStartedRef.current) return;
    if (!initialValues?.autorun) return;
    const name = (initialValues.companyName ?? "").trim();
    const indId = initialValues.industryId ?? "";
    const pref = initialValues.prefecture ?? "";
    if (!name || !indId || !pref) return;

    autoRunStartedRef.current = true;
    const corp = syntheticCorporate(name, pref);
    setConfirmed(corp);
    setSearchLoading(true);
    setMatchApiComplete(false);
    setStep("loading");
    void runMatch(corp).finally(() => {
      setSearchLoading(false);
    });
  }, [initialValues, runMatch]);

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!companyName.trim()) {
      setFormError(isPartner ? "顧客企業の会社名を入力してください。" : "会社名を入力してください。");
      return;
    }
    if (!industryId) {
      setFormError("業種を選択してください。");
      return;
    }
    if (!prefecture) {
      setFormError("都道府県を選択してください。");
      return;
    }

    const corp = syntheticCorporate(companyName, prefecture);
    setConfirmed(corp);
    setSearchLoading(true);
    setMatchApiComplete(false);
    setStep("loading");

    try {
      await runMatch(corp);
    } finally {
      setSearchLoading(false);
    }
  };

  const locationLine =
    confirmed && (confirmed.prefecture || confirmed.city)
      ? `（${confirmed.prefecture}${confirmed.city}）`
      : "";

  return (
    <div className="mx-auto w-full max-w-5xl">
      {step === "form" && (
        <>
          {/* ページタイトル・リード文 */}
          <section className="mb-8" aria-labelledby="check-intro-heading">
            <h1
              id="check-intro-heading"
              className="text-2xl font-bold leading-tight text-[var(--text-primary)] md:text-3xl"
            >
              {isPartner ? "顧客企業の対象補助金を無料でチェック" : "対象補助金を無料でチェック"}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--text-secondary)]">
              {isPartner
                ? "顧客企業の会社名・業種・所在地を入力するだけで、対象になり得る補助金の概要を表示します。"
                : "会社名・業種・所在地を入力するだけで、御社に該当する可能性のある補助金の概要を表示します。"}
            </p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              ※ 個人情報（氏名・連絡先）の入力は不要です。法人の正式な特定は行いません。
            </p>
          </section>

          <div className="nts-card p-6 sm:p-8">
            {/* 進捗インジケーター */}
            <div className="mb-8 flex items-center gap-2">
              <div className={`flex items-center gap-1.5 ${wizardStep >= 1 ? "text-[#1e40af]" : "text-gray-400"}`}>
                <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${wizardStep >= 1 ? "bg-[#1e40af] text-white" : "bg-gray-200 text-gray-500"}`}>
                  1
                </span>
                <span className="text-sm font-medium">基本情報</span>
              </div>
              <div className={`h-0.5 flex-1 ${wizardStep >= 2 ? "bg-[#1e40af]" : "bg-gray-200"}`} />
              <div className={`flex items-center gap-1.5 ${wizardStep >= 2 ? "text-[#1e40af]" : "text-gray-400"}`}>
                <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${wizardStep >= 2 ? "bg-[#1e40af] text-white" : "bg-gray-200 text-gray-500"}`}>
                  2
                </span>
                <span className="text-sm font-medium">詳細情報（任意）</span>
              </div>
            </div>

            <form onSubmit={submitForm} className="space-y-6">
              {/* ── STEP 1: 必須項目 ── */}
              {wizardStep === 1 && (
                <div className="space-y-5">
                  <div>
                    <label htmlFor="check-company" className="block text-sm font-bold text-[var(--text-primary)]">
                      {isPartner ? "顧客企業の会社名" : "会社名"}
                      <span className="ml-1 text-red-500">*</span>
                    </label>
                    <input
                      id="check-company"
                      type="text"
                      autoComplete="organization"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="例：株式会社○○"
                      className="mt-2 w-full rounded-lg border border-[var(--border-subtle)] bg-white px-4 py-3 text-body text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-teal)] focus:ring-2 focus:ring-[var(--accent-teal)]/20 placeholder:text-[var(--text-muted)]"
                    />
                  </div>
                  <div>
                    <label htmlFor="check-industry" className="block text-sm font-bold text-[var(--text-primary)]">
                      業種
                      <span className="ml-1 text-red-500">*</span>
                    </label>
                    <select
                      id="check-industry"
                      value={industryId}
                      onChange={(e) => setIndustryId(e.target.value)}
                      className="mt-2 w-full rounded-lg border border-[var(--border-subtle)] bg-white px-4 py-3 text-body text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-teal)] focus:ring-2 focus:ring-[var(--accent-teal)]/20"
                    >
                      <option value="">選択してください</option>
                      {INDUSTRY_OPTIONS.map((opt) => (
                        <option key={opt.id} value={opt.id}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="check-prefecture" className="block text-sm font-bold text-[var(--text-primary)]">
                      所在地（都道府県）
                      <span className="ml-1 text-red-500">*</span>
                    </label>
                    <p className="mt-1 text-xs text-[var(--text-muted)]">地域限定の補助金を正しく判定するために使用します。</p>
                    <select
                      id="check-prefecture"
                      value={prefecture}
                      onChange={(e) => setPrefecture(e.target.value)}
                      className="mt-2 w-full rounded-lg border border-[var(--border-subtle)] bg-white px-4 py-3 text-body text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-teal)] focus:ring-2 focus:ring-[var(--accent-teal)]/20"
                    >
                      <option value="">選択してください</option>
                      {JAPAN_PREFECTURES.filter((p) => p.id).map((p) => (
                        <option key={p.id} value={p.id}>{p.label}</option>
                      ))}
                    </select>
                  </div>
                  {formError && <p className="text-sm font-medium text-red-500">{formError}</p>}
                  {/* 次へボタン */}
                  <button
                    type="button"
                    onClick={() => setWizardStep(2)}
                    disabled={!canProceedToStep2}
                    className={`w-full rounded-full py-3.5 text-sm font-bold transition ${canProceedToStep2 ? "bg-[#0e357f] text-white hover:bg-[#1a4fa0]" : "cursor-not-allowed bg-gray-200 text-gray-400"}`}
                  >
                    次へ：詳細情報を入力する（任意）
                  </button>
                  {/* スキップ送信 */}
                  <button
                    type="submit"
                    disabled={!canProceedToStep2 || searchLoading}
                    className="w-full py-2.5 text-sm text-[#0e357f] underline underline-offset-2 disabled:text-gray-400 disabled:no-underline"
                  >
                    {searchLoading ? "照合中…" : "詳細情報を入力せずに照合する"}
                  </button>
                </div>
              )}

              {/* ── STEP 2: 任意項目 ── */}
              {wizardStep === 2 && (
                <div className="space-y-5">
                  <div>
                    <label htmlFor="check-employees" className="block text-sm font-bold text-[var(--text-primary)]">
                      従業員数
                      <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">任意</span>
                    </label>
                    <p className="mt-1 text-xs text-[var(--text-muted)]">小規模事業者・中小企業向け制度の判定に使えます。</p>
                    <select
                      id="check-employees"
                      value={employees}
                      onChange={(e) => setEmployees(e.target.value)}
                      className="mt-2 w-full rounded-lg border border-[var(--border-subtle)] bg-white px-4 py-3 text-body text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-teal)] focus:ring-2 focus:ring-[var(--accent-teal)]/20"
                    >
                      {EMPLOYEE_OPTIONS.map((opt) => (
                        <option key={opt.id} value={opt.id}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="check-business-notes" className="block text-sm font-bold text-[var(--text-primary)]">
                      事業内容・取扱い
                      <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">任意</span>
                    </label>
                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                      数行で結構です。会社固有の事業内容が分かるとマッチング精度が大きく上がります。
                    </p>
                    <textarea
                      id="check-business-notes"
                      value={businessNotes}
                      onChange={(e) => setBusinessNotes(e.target.value)}
                      placeholder="例：ゴルフスクール運営、ゴルフ用品のEC販売"
                      rows={4}
                      maxLength={500}
                      className="mt-2 w-full resize-none rounded-lg border border-[var(--border-subtle)] bg-white px-4 py-3 text-body text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-teal)] focus:ring-2 focus:ring-[var(--accent-teal)]/20 placeholder:text-[var(--text-muted)]"
                    />
                    <p className="mt-1 text-right text-xs text-[var(--text-muted)]">{businessNotes.length} / 500</p>
                  </div>
                  <div>
                    <label htmlFor="check-company-website" className="block text-sm font-bold text-[var(--text-primary)]">
                      会社の公式サイトURL
                      <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">任意</span>
                    </label>
                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                      入力があればサーバーがページを取得し、照合キーワード・マッチングに使います。取得できない場合は無視されます。
                    </p>
                    <input
                      id="check-company-website"
                      type="text"
                      inputMode="url"
                      autoComplete="url"
                      value={companyWebsiteUrl}
                      onChange={(e) => setCompanyWebsiteUrl(e.target.value)}
                      placeholder="https://example.co.jp"
                      className="mt-2 w-full rounded-lg border border-[var(--border-subtle)] bg-white px-4 py-3 text-body text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-teal)] focus:ring-2 focus:ring-[var(--accent-teal)]/20 placeholder:text-[var(--text-muted)]"
                    />
                  </div>
                  {formError && <p className="text-sm font-medium text-red-500">{formError}</p>}
                  {/* 照合ボタン */}
                  <button
                    type="submit"
                    disabled={searchLoading}
                    className="w-full rounded-full py-3.5 text-sm font-bold text-white shadow-[0_14px_32px_rgba(11,78,162,0.22)] transition-all hover:-translate-y-px hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 [background:var(--nts-gradient-primary)]"
                  >
                    {searchLoading ? "照合中…" : "補助金を照合する →"}
                  </button>
                  {/* 戻るボタン */}
                  <button
                    type="button"
                    onClick={() => setWizardStep(1)}
                    className="flex w-full items-center justify-center gap-1 py-2.5 text-sm text-gray-500 hover:text-gray-700"
                  >
                    ← 基本情報に戻る
                  </button>
                </div>
              )}
            </form>
          </div>
        </>
      )}

      {step === "loading" && (
        <SubsidyMatchLoading
          apiComplete={matchApiComplete}
          onReadyToTransition={handleLoadingComplete}
        />
      )}

      {step === "results" && confirmed && (
        <div className="space-y-12">
          <div>
            <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">
              照合結果
            </p>
            <p className="text-base font-medium text-[var(--text-secondary)]">
              <span className="font-bold text-[var(--text-primary)]">{confirmed.name}</span>
              {locationLine}
              <span className="mx-1">　·　</span>
              {INDUSTRY_OPTIONS.find((o) => o.id === industryId)?.label ?? industryId}
            </p>
          </div>

          {results.length === 0 ? (
            <>
              <h1 className="font-heading text-h1 font-bold text-[var(--text-primary)]">
                照合結果
              </h1>
              <div className="nts-card mt-6 max-w-2xl space-y-4 p-6 text-sm leading-relaxed sm:p-8">
                <p className="font-medium text-[var(--text-primary)]">
                  現在、御社の条件に完全に合致する公募中の補助金が見つかりませんでした。
                </p>
                <p className="text-[var(--text-secondary)]">これは以下の可能性があります：</p>
                <ul className="list-inside list-disc space-y-1 text-[var(--text-secondary)]">
                  <li>現在、公募が始まっていない（近日公募予定の制度あり）</li>
                  <li>業種・地域の条件が特殊なケース</li>
                  <li>御社の課題に合う制度が複数省庁にまたがるケース</li>
                </ul>
                <p className="text-[var(--text-secondary)]">
                  補助金は年間を通じて新規公募が出ます。
                  <br />
                  専門家への無料相談で、最新情報と合わせてご案内します。
                </p>
                <div className="pt-2">
                  <Link
                    href="/consult"
                    className={`${heroStyles.cta} w-full justify-center sm:w-auto`}
                  >
                    無料で専門家に相談する
                    <span className={heroStyles.ctaArrow} aria-hidden="true">
                      →
                    </span>
                  </Link>
                </div>
              </div>
            </>
          ) : (
            <>
              <SubsidyCheckResultTabs
                item={results[activeResultIndex] ?? results[0]}
                results={results}
                activeResultIndex={activeResultIndex}
                onChangeActiveIndex={(index) => {
                  setActiveResultIndex(index);
                }}
              />
            </>
          )}

          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] transition hover:text-[var(--text-primary)]"
            >
              ← 条件を変えてやり直す
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

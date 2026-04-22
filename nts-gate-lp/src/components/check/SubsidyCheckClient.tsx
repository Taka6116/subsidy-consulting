"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { INDUSTRY_OPTIONS } from "@/data/industryOptions";
import { JAPAN_PREFECTURES } from "@/data/japanPrefectures";
import type { MatchedSubsidyPreview } from "@/lib/subsidyCheckMocks";
import type { CorporateCandidate } from "@/types/corporateSearch";
import SubsidyMatchLoading from "@/components/check/SubsidyMatchLoading";
import SubsidyCheckResultTabs from "@/components/check/SubsidyCheckResultTabs";
import { cleanSubsidyName } from "@/lib/subsidyCheckResultHelpers";
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
      const description = typeof row.description === "string" ? row.description : "";
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
      const decisionSummary = typeof row.summary === "string" ? row.summary : "";
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

type Props = {
  audience: "end_user" | "partner";
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

export default function SubsidyCheckClient({ audience }: Props) {
  const [step, setStep] = useState<Step>("form");
  const [companyName, setCompanyName] = useState("");
  const [industryId, setIndustryId] = useState("");
  const [prefecture, setPrefecture] = useState("");
  const [employees, setEmployees] = useState("");
  const [businessNotes, setBusinessNotes] = useState("");
  const [companyWebsiteUrl, setCompanyWebsiteUrl] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<CorporateCandidate | null>(null);
  const [results, setResults] = useState<MatchedSubsidyPreview[]>([]);
  const [activeResultIndex, setActiveResultIndex] = useState(0);
  const [searchLoading, setSearchLoading] = useState(false);
  /** 照合 API 完了（ローディングで最終フレーム→結果へ進むトリガー） */
  const [matchApiComplete, setMatchApiComplete] = useState(false);

  const isPartner = audience === "partner";

  useEffect(() => {
    setActiveResultIndex(0);
  }, [results]);

  const handleLoadingComplete = useCallback(() => {
    setStep("results");
    setMatchApiComplete(false);
  }, []);

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

  const formTitle = isPartner
    ? "顧客企業の対象補助金が把握できます"
    : "対象補助金が把握できます";

  const formLead =
    "個人の氏名・連絡先は不要です。会社名・業種・所在地で照合します。事業内容・従業員数・公式サイトURLを任意で入れると、御社に合った制度を見つけやすくなります（法人の正式な特定は行いません）。";

  return (
    <div className="mx-auto w-full max-w-5xl">
      {step === "form" && (
        <>
          <section className="mb-10" aria-labelledby="check-intro-heading">
            <h1
              id="check-intro-heading"
              className="font-heading text-h1 font-bold leading-tight text-[var(--text-primary)]"
            >
              {formTitle}
            </h1>
            <p className="mt-4 max-w-2xl text-body leading-loose text-[var(--text-secondary)]">
              {formLead}
            </p>
          </section>
          <div className="nts-card p-6 sm:p-8">
            <h2 className="font-heading text-h2 font-bold text-[var(--text-primary)]">
              {isPartner ? "顧客企業の情報を入力" : "会社情報を入力"}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
              {isPartner
                ? "顧客企業の会社名・業種・所在地（都道府県）が必須です。従業員数や公式サイトURLは任意です。法人の正式な特定は行わず、入力内容をもとに対象制度のイメージを表示します。"
                : "会社名・業種・所在地（都道府県）が必須です。従業員数や公式サイトURLは任意です。法人の正式な特定は行わず、入力内容をもとに対象制度のイメージを表示します。"}
            </p>
            <form onSubmit={submitForm} className="mt-8 space-y-6">
              <div>
                <label
                  htmlFor="check-company"
                  className="block text-sm font-bold text-[var(--text-primary)]"
                >
                  {isPartner ? "顧客企業の会社名" : "会社名"}
                  <span className="ml-1 text-red-500">*</span>
                </label>
                <input
                  id="check-company"
                  type="text"
                  autoComplete="organization"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder={isPartner ? "例：株式会社○○" : "例：株式会社○○"}
                  className="mt-2 w-full rounded-lg border border-[var(--border-subtle)] bg-white px-4 py-3 text-body text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-teal)] focus:ring-2 focus:ring-[var(--accent-teal)]/20 placeholder:text-[var(--text-muted)]"
                />
              </div>
              <div>
                <label
                  htmlFor="check-industry"
                  className="block text-sm font-bold text-[var(--text-primary)]"
                >
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
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="check-prefecture"
                  className="block text-sm font-bold text-[var(--text-primary)]"
                >
                  所在地（都道府県）
                  <span className="ml-1 text-red-500">*</span>
                </label>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  地域限定の補助金を正しく判定するために使用します。
                </p>
                <select
                  id="check-prefecture"
                  value={prefecture}
                  onChange={(e) => setPrefecture(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-[var(--border-subtle)] bg-white px-4 py-3 text-body text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-teal)] focus:ring-2 focus:ring-[var(--accent-teal)]/20"
                >
                  <option value="">選択してください</option>
                  {JAPAN_PREFECTURES.filter((p) => p.id).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="check-employees"
                  className="block text-sm font-bold text-[var(--text-primary)]"
                >
                  従業員数（任意）
                </label>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  小規模事業者・中小企業向け制度の判定に使えます。
                </p>
                <select
                  id="check-employees"
                  value={employees}
                  onChange={(e) => setEmployees(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-[var(--border-subtle)] bg-white px-4 py-3 text-body text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-teal)] focus:ring-2 focus:ring-[var(--accent-teal)]/20"
                >
                  {EMPLOYEE_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="check-business-notes"
                  className="block text-sm font-bold text-[var(--text-primary)]"
                >
                  事業内容・取扱い（任意）
                </label>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  数行で結構です。会社固有の事業内容が分かるとマッチング精度が大きく上がります。
                  <br />
                  例：「ゴルフスクール運営・ゴルフ用品のEC販売」「金属加工部品の製造（自動車向け）」「地域のデイサービス事業」
                </p>
                <textarea
                  id="check-business-notes"
                  value={businessNotes}
                  onChange={(e) => setBusinessNotes(e.target.value)}
                  placeholder="例：ゴルフスクール運営、ゴルフ用品のEC販売"
                  rows={3}
                  maxLength={500}
                  className="mt-2 w-full resize-y rounded-lg border border-[var(--border-subtle)] bg-white px-4 py-3 text-body text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-teal)] focus:ring-2 focus:ring-[var(--accent-teal)]/20 placeholder:text-[var(--text-muted)]"
                />
                <p className="mt-1 text-right text-xs text-[var(--text-muted)]">
                  {businessNotes.length} / 500
                </p>
              </div>
              <div>
                <label
                  htmlFor="check-company-website"
                  className="block text-sm font-bold text-[var(--text-primary)]"
                >
                  会社の公式サイトURL（任意）
                </label>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  入力があればサーバーがページを取得し、照合キーワード・マッチングに使います。取得できない場合は無視されます（サイトの利用規約・robots
                  等はご確認ください）。
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
              {formError ? (
                <p className="text-sm font-medium text-red-500">{formError}</p>
              ) : null}
              <div className="flex w-full justify-center pt-1">
                <button
                  type="submit"
                  disabled={searchLoading}
                  className="w-full rounded-full bg-[var(--accent-teal)] px-6 py-4 text-base font-bold text-white shadow-sm transition-all hover:brightness-105 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-teal)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[240px]"
                >
                  {searchLoading ? "照合中…" : "補助金を照合する"}
                </button>
              </div>
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

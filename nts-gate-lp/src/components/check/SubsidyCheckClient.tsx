"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { INDUSTRY_OPTIONS } from "@/data/industryOptions";
import { JAPAN_PREFECTURES } from "@/data/japanPrefectures";

const EMPLOYEE_BAND_OPTIONS = [
  { id: "", label: "指定しない" },
  { id: "1〜4人", label: "1〜4人" },
  { id: "5〜20人", label: "5〜20人" },
  { id: "21〜100人", label: "21〜100人" },
  { id: "101〜300人", label: "101〜300人" },
  { id: "301人以上", label: "301人以上" },
] as const;

const REVENUE_BAND_OPTIONS = [
  { id: "", label: "指定しない" },
  { id: "〜3,000万円未満", label: "〜3,000万円未満" },
  { id: "3,000万円〜1億円未満", label: "3,000万円〜1億円未満" },
  { id: "1億円〜10億円未満", label: "1億円〜10億円未満" },
  { id: "10億円以上", label: "10億円以上" },
] as const;
import type { MatchedSubsidyPreview } from "@/lib/subsidyCheckMocks";
import type { CorporateCandidate } from "@/types/corporateSearch";
import SubsidyResultCard from "@/components/check/SubsidyResultCard";
import SubsidyResultHero from "@/components/check/SubsidyResultHero";

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
      const name = typeof row.name === "string" ? row.name : "名称未設定";
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
        summary: description,
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

function syntheticCorporate(name: string): CorporateCandidate {
  const n = name.trim();
  return {
    corporateNumber: "",
    name: n,
    prefecture: "",
    city: "",
  };
}

export default function SubsidyCheckClient({ audience }: Props) {
  const [step, setStep] = useState<Step>("form");
  const [companyName, setCompanyName] = useState("");
  const [industryId, setIndustryId] = useState("");
  const [prefecture, setPrefecture] = useState("");
  const [employeeBand, setEmployeeBand] = useState("");
  const [revenueBand, setRevenueBand] = useState("");
  const [businessNotes, setBusinessNotes] = useState("");
  const [companyWebsiteUrl, setCompanyWebsiteUrl] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<CorporateCandidate | null>(null);
  const [results, setResults] = useState<MatchedSubsidyPreview[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const isPartner = audience === "partner";

  const reset = useCallback(() => {
    setStep("form");
    setCompanyName("");
    setIndustryId("");
    setPrefecture("");
    setEmployeeBand("");
    setRevenueBand("");
    setBusinessNotes("");
    setFormError(null);
    setConfirmed(null);
    setResults([]);
    setSearchLoading(false);
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
            prefecture: prefecture || corp.prefecture || "",
            employees: employeeBand,
            revenueBand,
            businessNotes,
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
        setStep("results");
      }
    },
    [industryId, prefecture, employeeBand, revenueBand, businessNotes, companyWebsiteUrl],
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

    const corp = syntheticCorporate(companyName);
    setConfirmed(corp);
    setSearchLoading(true);
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
    ? "顧客企業の対象補助金イメージ（デモ）"
    : "御社の対象補助金イメージ（デモ）";

  const formLead =
    "個人の氏名・連絡先は不要です。ご入力の会社名と業種をもとに、対象になり得る制度のイメージを表示します（法人の正式な特定は行いません）。表示は参考例です。制度DB・AIの設定に応じて内容が変わります。";

  return (
    <div className="mx-auto w-full max-w-5xl">
      {step === "form" && (
        <>
          <section className="mb-10" aria-labelledby="check-intro-heading">
            <span className="mb-4 inline-block rounded-full border border-[rgba(0,198,255,0.3)] bg-[rgba(0,198,255,0.12)] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#00a0cc]">
              デモ・参考表示
            </span>
            <p className="text-xs font-bold uppercase tracking-widest text-portal-primary-container">
              {isPartner ? "Partner check" : "Subsidy check"}
            </p>
            <h1
              id="check-intro-heading"
              className="mt-3 font-heading text-h1 font-bold leading-tight text-portal-primary"
            >
              {formTitle}
            </h1>
            <p className="mt-4 max-w-2xl text-body leading-loose text-portal-on-surface-variant">
              {formLead}
            </p>
          </section>
          <div className="rounded-xl border border-white/10 bg-white p-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)] sm:p-8">
            <h2 className="font-heading text-h2 font-bold text-[#0F2027]">
              {isPartner ? "顧客企業の情報を入力" : "会社情報を入力"}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#5a7080]">
              {isPartner
                ? "顧客企業の会社名と業種を入力してください（事業内容・地域・規模は任意）。法人の正式な特定は行わず、入力内容をもとに対象制度のイメージを表示します。"
                : "会社名と業種を入力してください（事業内容・地域・規模は任意）。法人の正式な特定は行わず、入力内容をもとに対象制度のイメージを表示します。"}
            </p>
            <form onSubmit={submitForm} className="mt-8 space-y-6">
              <div>
                <label
                  htmlFor="check-company"
                  className="block text-sm font-bold text-[#1a3a4a]"
                >
                  {isPartner ? "顧客企業の会社名" : "会社名"}
                  <span className="ml-1 text-portal-error">*</span>
                </label>
                <input
                  id="check-company"
                  type="text"
                  autoComplete="organization"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder={isPartner ? "例：株式会社○○" : "例：株式会社○○"}
                  className="mt-2 w-full rounded-lg border border-[#d0dde5] bg-[#f8fbfd] px-4 py-3 text-body text-[#0F2027] outline-none transition-colors focus:border-[#00a0cc] focus:ring-2 focus:ring-[#00a0cc]/20 placeholder:text-[#a0b4bf]"
                />
              </div>
              <div>
                <label
                  htmlFor="check-industry"
                  className="block text-sm font-bold text-[#1a3a4a]"
                >
                  業種
                  <span className="ml-1 text-portal-error">*</span>
                </label>
                <select
                  id="check-industry"
                  value={industryId}
                  onChange={(e) => setIndustryId(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-[#d0dde5] bg-[#f8fbfd] px-4 py-3 text-body text-[#0F2027] outline-none transition-colors focus:border-[#00a0cc] focus:ring-2 focus:ring-[#00a0cc]/20"
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
                  className="block text-sm font-bold text-[#1a3a4a]"
                >
                  本社・主たる事業所の都道府県（任意）
                </label>
                <select
                  id="check-prefecture"
                  value={prefecture}
                  onChange={(e) => setPrefecture(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-[#d0dde5] bg-[#f8fbfd] px-4 py-3 text-body text-[#0F2027] outline-none transition-colors focus:border-[#00a0cc] focus:ring-2 focus:ring-[#00a0cc]/20"
                >
                  {JAPAN_PREFECTURES.map((p) => (
                    <option key={p.id || "none"} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="check-employees"
                  className="block text-sm font-bold text-[#1a3a4a]"
                >
                  従業員規模（任意）
                </label>
                <select
                  id="check-employees"
                  value={employeeBand}
                  onChange={(e) => setEmployeeBand(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-[#d0dde5] bg-[#f8fbfd] px-4 py-3 text-body text-[#0F2027] outline-none transition-colors focus:border-[#00a0cc] focus:ring-2 focus:ring-[#00a0cc]/20"
                >
                  {EMPLOYEE_BAND_OPTIONS.map((o) => (
                    <option key={o.id || "none"} value={o.id}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="check-revenue"
                  className="block text-sm font-bold text-[#1a3a4a]"
                >
                  売上規模の目安（任意）
                </label>
                <select
                  id="check-revenue"
                  value={revenueBand}
                  onChange={(e) => setRevenueBand(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-[#d0dde5] bg-[#f8fbfd] px-4 py-3 text-body text-[#0F2027] outline-none transition-colors focus:border-[#00a0cc] focus:ring-2 focus:ring-[#00a0cc]/20"
                >
                  {REVENUE_BAND_OPTIONS.map((o) => (
                    <option key={o.id || "none"} value={o.id}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="check-business-notes"
                  className="block text-sm font-bold text-[#1a3a4a]"
                >
                  事業内容・取扱い（任意）
                </label>
                <p className="mt-1 text-xs text-[#8aa0ad]">
                  例：オンライン英会話、化学物質は扱わない、店舗数、主な顧客など。照合の精度向上に使います。
                </p>
                <textarea
                  id="check-business-notes"
                  rows={3}
                  value={businessNotes}
                  onChange={(e) => setBusinessNotes(e.target.value)}
                  placeholder="具体的な事業・業務内容に関してなど"
                  className="mt-2 w-full resize-y rounded-lg border border-[#d0dde5] bg-[#f8fbfd] px-4 py-3 text-body text-[#0F2027] outline-none transition-colors focus:border-[#00a0cc] focus:ring-2 focus:ring-[#00a0cc]/20 placeholder:text-[#a0b4bf]"
                />
              </div>
              <div>
                <label
                  htmlFor="check-company-website"
                  className="block text-sm font-bold text-[#1a3a4a]"
                >
                  会社の公式サイトURL（任意）
                </label>
                <p className="mt-1 text-xs text-[#8aa0ad]">
                  入力があればサーバーがページを取得し、ユーザー記述とあわせて照合に使います。取得できない場合は無視されます（サイトの利用規約・robots
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
                  className="mt-2 w-full rounded-lg border border-[#d0dde5] bg-[#f8fbfd] px-4 py-3 text-body text-[#0F2027] outline-none transition-colors focus:border-[#00a0cc] focus:ring-2 focus:ring-[#00a0cc]/20 placeholder:text-[#a0b4bf]"
                />
              </div>
              {formError ? (
                <p className="text-sm font-medium text-portal-error">{formError}</p>
              ) : null}
              <button
                type="submit"
                disabled={searchLoading}
                className="w-full rounded-full bg-[#00c6ff] px-6 py-4 text-base font-bold text-[#0b1a22] shadow-sm transition-all hover:bg-[#00b0e6] hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00c6ff] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {searchLoading ? "照合中…" : "補助金を照合する"}
              </button>
            </form>
          </div>
        </>
      )}

      {step === "loading" && (
        <div className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-white/10 bg-white p-10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <div
            className="h-10 w-10 animate-spin rounded-full border-4 border-[#e0e8ed] border-t-[#00a0cc]"
            aria-hidden
          />
          <p className="mt-6 text-center font-medium text-[#0F2027]">対象制度を照合しています…</p>
          <p className="mt-2 text-center text-sm text-[#5a7080]">
            制度データを取得し、適合度を評価しています…
          </p>
        </div>
      )}

      {step === "results" && confirmed && (
        <div className="space-y-12">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-portal-primary-container">
              照合結果（デモ）
            </p>
            <p className="mt-2 text-sm text-portal-on-surface-variant">
              <span className="font-semibold text-portal-on-surface">{confirmed.name}</span>
              {locationLine}
              <span className="mx-1">・</span>
              {INDUSTRY_OPTIONS.find((o) => o.id === industryId)?.label ?? industryId}
            </p>
          </div>

          {results.length === 0 ? (
            <>
              <h1 className="font-heading text-h1 font-bold text-portal-primary">照合結果（デモ）</h1>
              <div className="mt-6 max-w-2xl space-y-4 rounded-xl border border-white/10 bg-white p-6 text-sm leading-relaxed text-[#0F2027] shadow-[0_8px_32px_rgba(0,0,0,0.35)] sm:p-8">
                <p className="font-medium text-[#1a3a4a]">
                  現在、御社の条件に完全に合致する公募中の補助金が見つかりませんでした。
                </p>
                <p className="text-[#5a7080]">これは以下の可能性があります：</p>
                <ul className="list-inside list-disc space-y-1 text-[#5a7080]">
                  <li>現在、公募が始まっていない（近日公募予定の制度あり）</li>
                  <li>業種・地域の条件が特殊なケース</li>
                  <li>御社の課題に合う制度が複数省庁にまたがるケース</li>
                </ul>
                <p className="text-[#5a7080]">
                  補助金は年間を通じて新規公募が出ます。
                  <br />
                  専門家への無料相談で、最新情報と合わせてご案内します。
                </p>
                <div className="pt-2">
                  <Link
                    href="/consult"
                    className="inline-flex w-full items-center justify-center rounded-full bg-[#00c6ff] px-6 py-4 text-base font-bold text-[#0b1a22] shadow-sm transition-all hover:bg-[#00b0e6] hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00c6ff] sm:w-auto"
                  >
                    無料で専門家に相談する
                  </Link>
                </div>
              </div>
            </>
          ) : (
            <>
              <SubsidyResultHero item={results[0]} />
              {results.length > 1 ? (
                <section className="mt-16 md:mt-20" aria-labelledby="check-related-heading">
                  <h2
                    id="check-related-heading"
                    className="mb-8 font-heading text-2xl font-bold text-portal-primary-container"
                  >
                    関連する候補
                  </h2>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {results.slice(1).map((r) => (
                      <SubsidyResultCard key={r.id} item={r} />
                    ))}
                  </div>
                </section>
              ) : null}
            </>
          )}

          <p className="text-xs leading-relaxed text-portal-on-surface-variant">
            本画面は開発用のイメージです。採択可否・金額は公募要領および最新の情報で必ずご確認ください。
          </p>
          <button
            type="button"
            onClick={reset}
            className="w-full rounded-full border-2 border-[rgba(0,198,255,0.35)] bg-white/5 px-6 py-3 text-sm font-bold text-[#7ed9f5] backdrop-blur-sm transition-colors hover:border-[#00c6ff] hover:bg-white/10 hover:text-[#00c6ff] sm:w-auto"
          >
            条件を変えてやり直す
          </button>
        </div>
      )}
    </div>
  );
}

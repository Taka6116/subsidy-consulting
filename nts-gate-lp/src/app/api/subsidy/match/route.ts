import { NextResponse } from "next/server";
import {
  fetchSubsidyDetail,
  fetchSubsidyListUnion,
  formatMaxAmount,
  formatDeadline,
  INDUSTRY_ID_TO_JGRANTS,
  isSubsidyAcceptanceEndOpen,
} from "@/lib/jgrants/client";
import {
  runSubsidyMatchBedrock,
  type CompanyProfileForMatch,
  type NormalizedSubsidyForMatch,
} from "@/lib/ai/bedrockSubsidyMatch";
import {
  defaultJgrantsKeywordPlan,
  runJgrantsKeywordPlanBedrock,
} from "@/lib/ai/bedrockJgrantsKeywordPlan";
import { INDUSTRY_OPTIONS } from "@/data/industryOptions";
import { fetchWebsiteExcerpt } from "@/lib/fetchWebsiteExcerpt";
import { applyEligibilityPrefilters } from "@/lib/subsidyEligibilityFilter";
import {
  fetchStaticSubsidies,
  staticSubsidyDeadlineLabel,
  toBedrockInput,
} from "@/lib/staticSubsidies";

const LIST_LIMIT = 40;
const DETAIL_POOL = 20;
const FINAL_TOP = 5;
/** この点数未満は、他に十分な件数があるときレスポンスから除外 */
const MIN_DISPLAY_SCORE = 28;

/** 照合API経由の jGrants 取得は鮮度優先（終了済み混入・キャッシュずれの抑制） */
const JGRANTS_MATCH_CACHE = "no-store" as RequestCache;

/** jGrants の detail.industry 行とユーザーの業種の整合（事前ランキング用） */
type IndustryClass = "match" | "mismatch" | "unknown";

function classifyIndustryMatch(
  subsidyIndustryField: string | undefined,
  userJgrantsIndustry: string,
  userIndustryLabel: string,
): IndustryClass {
  const raw = subsidyIndustryField?.trim();
  if (!raw) return "unknown";

  const segments = raw
    .split(/[/／、]/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (segments.length === 0) return "unknown";

  const u = (userJgrantsIndustry || userIndustryLabel).trim();
  if (!u) return "unknown";

  const userChunks = u.split("、").map((s) => s.trim()).filter(Boolean);

  const hit = segments.some((seg) => {
    if (u.includes(seg) || seg.includes(u)) return true;
    return userChunks.some((c) => seg.includes(c) || c.includes(seg));
  });

  return hit ? "match" : "mismatch";
}

/** jGrants の detail フィールドに含まれる HTML タグを除去してプレーンテキスト化 */
function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * 制度 description から交付申請サイトの事務的注意書き冒頭を除去して、
 * 制度本来の説明部分を Bedrock に渡す。
 */
function stripAdminPreamble(text: string): string {
  return text
    .replace(/^本ページは[^\n]*?(サイトです|ページです)[。．\.\s]*/gm, "")
    .replace(/^(新規の公募|最新の公募)[^\n]*?(ください|あります)[。．\.\s]*/gm, "")
    .replace(/^\s*\n/gm, "")
    .trim();
}

function mergeNotesForKeywordFallback(
  businessNotes: string,
  websiteExcerpt: string,
): string {
  const u = businessNotes.trim();
  const w = websiteExcerpt.trim();
  if (u && w) return `${u}\n\n【公式サイト抜粋（参考）】${w}`.slice(0, 2500);
  if (u) return u;
  return w;
}

function buildBusinessPurpose(
  industryLabel: string,
  businessNotes: string,
  websiteExcerpt: string,
): string {
  const base = `${industryLabel}として事業を運営しています。`;
  const chunks: string[] = [];
  const notes = businessNotes.trim();
  if (notes) chunks.push(`事業内容・取扱い（ユーザー記述）: ${notes.slice(0, 500)}`);
  const ex = websiteExcerpt.trim();
  if (ex) {
    chunks.push(`公式サイトからの抜粋（参考・取得できた範囲のみ）: ${ex.slice(0, 700)}`);
  }
  if (chunks.length === 0) return base;
  return `${base} ${chunks.join(" ")}`.slice(0, 2200);
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ results: [] });
  }

  const b = typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};
  const industry = typeof b.industry === "string" ? b.industry : undefined;
  const companyName = typeof b.companyName === "string" ? b.companyName : "";
  const prefecture = typeof b.prefecture === "string" ? b.prefecture : "";
  const employees = typeof b.employees === "string" ? b.employees : "";
  const revenueBand = typeof b.revenueBand === "string" ? b.revenueBand : "";
  const businessNotes = typeof b.businessNotes === "string" ? b.businessNotes : "";
  const companyWebsiteUrl =
    typeof b.companyWebsiteUrl === "string" ? b.companyWebsiteUrl : "";

  const industryLabel =
    INDUSTRY_OPTIONS.find((o) => o.id === industry)?.label ?? industry ?? "";

  const userJgrantsIndustry = industry ? (INDUSTRY_ID_TO_JGRANTS[industry] ?? "") : "";

  try {
    const websiteExcerpt = companyWebsiteUrl.trim()
      ? await fetchWebsiteExcerpt(companyWebsiteUrl)
      : "";
    const notesForRuleKeywords = mergeNotesForKeywordFallback(
      businessNotes,
      websiteExcerpt,
    );

    // Phase A: 検索キーワード（Bedrock で入力範囲内の JSON + 決定的フォールバックをマージ）
    const aiKeywords = await runJgrantsKeywordPlanBedrock({
      companyName,
      industryLabel,
      prefecture,
      employees,
      revenueBand,
      businessNotes,
      websiteExcerpt,
    });
    const ruleKeywords = defaultJgrantsKeywordPlan(industryLabel, notesForRuleKeywords);
    const planKeywords = [...new Set([...(aiKeywords ?? []), ...ruleKeywords])].slice(0, 5);
    console.log("[subsidy/match] Phase A keyword plan:", planKeywords);

    let summaries = await fetchSubsidyListUnion({
      industryId: industry,
      keywords: planKeywords,
      perQueryLimit: LIST_LIMIT,
      acceptance: "1",
      cache: JGRANTS_MATCH_CACHE,
    });
    summaries = summaries.filter((s) => isSubsidyAcceptanceEndOpen(s.acceptance_end_datetime));
    console.log("[subsidy/match] jGrants union (募集中+期限フィルタ) count:", summaries.length);

    if (summaries.length === 0) {
      const wider = [...new Set([...planKeywords, "補助金", "助成金", "支援"])].slice(0, 6);
      summaries = await fetchSubsidyListUnion({
        industryId: industry,
        keywords: wider,
        perQueryLimit: LIST_LIMIT,
        acceptance: "1",
        cache: JGRANTS_MATCH_CACHE,
      });
      summaries = summaries.filter((s) => isSubsidyAcceptanceEndOpen(s.acceptance_end_datetime));
      console.log("[subsidy/match] jGrants union (広いキーワード・募集中+期限) count:", summaries.length);
    }

    if (summaries.length === 0) {
      summaries = await fetchSubsidyListUnion({
        industryId: undefined,
        keywords: ["補助金"],
        perQueryLimit: LIST_LIMIT,
        acceptance: "1",
        cache: JGRANTS_MATCH_CACHE,
      });
      summaries = summaries.filter((s) => isSubsidyAcceptanceEndOpen(s.acceptance_end_datetime));
      console.log("[subsidy/match] jGrants union (業種なし・募集中+期限) count:", summaries.length);
    }

    console.log("[subsidy/match] jGrants summaries count (final):", summaries.length);

    if (summaries.length === 0) {
      const staticFallback = await fetchStaticSubsidies();
      console.log(
        "[subsidy/match] jGrants 0件 — static fallback:",
        staticFallback.length,
      );
      if (staticFallback.length === 0) {
        return NextResponse.json({ results: [] });
      }

      const company: CompanyProfileForMatch = {
        industryLabel,
        jGrantsIndustryParam: userJgrantsIndustry || undefined,
        companyName: companyName || "（社名未入力）",
        prefecture: prefecture.trim() || "（未指定）",
        employees: employees.trim() || "（未指定）",
        revenueBand: revenueBand.trim() || "（未指定）",
        businessPurpose: buildBusinessPurpose(
          industryLabel,
          businessNotes,
          websiteExcerpt,
        ),
      };

      const normalizedForBedrockStaticOnly = staticFallback
        .map(toBedrockInput)
        .slice(0, 8);
      const bedrockRowsStatic = await runSubsidyMatchBedrock(
        company,
        normalizedForBedrockStaticOnly,
      );
      console.log(
        "[subsidy/match] bedrock rows (static-only):",
        bedrockRowsStatic?.length ?? "null",
      );

      const brMapStatic = new Map(
        (bedrockRowsStatic ?? []).map((row) => [row.subsidyId, row]),
      );

      const staticOnlyResults = staticFallback.map((s) => {
        const br = brMapStatic.get(s.id);
        return {
          id: s.id,
          name: s.title,
          description: s.summary,
          maxAmountLabel: formatMaxAmount(s.subsidy_max_limit),
          deadlineLabel: staticSubsidyDeadlineLabel(s),
          targetIndustries: s.target_themes ?? [],
          subsidyRate: s.subsidy_rate,
          targetArea: s.target_area_search,
          institutionName: s.institution_name,
          detailUrl: s.official_url,
          matchScore: br?.matchScore ?? 0,
          summary: br?.summary ?? s.summary,
          matchReason: br?.matchReason ?? [],
          riskFlags: br?.riskFlags ?? [],
          insightCards: br?.insightCards ?? [],
        };
      });

      staticOnlyResults.sort((a, b) => b.matchScore - a.matchScore);
      const aboveFloorStatic = staticOnlyResults.filter(
        (r) => r.matchScore >= MIN_DISPLAY_SCORE,
      );
      const finalStaticOnly =
        aboveFloorStatic.length > 0 ? aboveFloorStatic : staticOnlyResults;

      console.log(
        "[subsidy/match] results count (static-only):",
        finalStaticOnly.length,
      );
      return NextResponse.json({ results: finalStaticOnly });
    }

    const pool = summaries.slice(0, DETAIL_POOL);
    const details = await Promise.all(
      pool.map((s) => fetchSubsidyDetail(s.id, { cache: JGRANTS_MATCH_CACHE })),
    );

    type Row = {
      summary: (typeof pool)[0];
      detail: (typeof details)[0];
      cls: IndustryClass;
    };

    const classified: Row[] = pool
      .map((summary, i) => ({
        summary,
        detail: details[i] ?? null,
        cls: classifyIndustryMatch(details[i]?.industry, userJgrantsIndustry, industryLabel),
      }))
      .filter((row) =>
        isSubsidyAcceptanceEndOpen(
          row.detail?.acceptance_end_datetime ?? row.summary.acceptance_end_datetime,
        ),
      );

    const ordered: Row[] = [
      ...classified.filter((x) => x.cls === "match"),
      ...classified.filter((x) => x.cls === "unknown"),
      ...classified.filter((x) => x.cls === "mismatch"),
    ];

    const seen = new Set<string>();
    const deduped: Row[] = [];
    for (const row of ordered) {
      const id = row.summary.id;
      if (!id || seen.has(id)) continue;
      seen.add(id);
      deduped.push(row);
    }

    const { rows: eligibilityRows, meta: eligibilityMeta } = applyEligibilityPrefilters(
      deduped,
      prefecture,
    );
    console.log("[subsidy/match] eligibility prefilter:", eligibilityMeta);

    const top = eligibilityRows.slice(0, FINAL_TOP);

    // ---- 独自DB補助金をマージ ----
    const staticSubsidies = await fetchStaticSubsidies();
    const staticInputs = staticSubsidies.map(toBedrockInput);
    console.log("[subsidy/match] static subsidies loaded:", staticInputs.length);
    // ---- ここまで ----

    // Phase B: 候補に対するスコア・要約（既存 Bedrock マッチ）
    const jgrantsNormalizedForBedrock: NormalizedSubsidyForMatch[] = top.map(({ summary, detail }) => {
      const rawDetailText = stripAdminPreamble(stripHtml(detail?.detail ?? ""));
      const catchPhrase = detail?.subsidy_catch_phrase?.trim() ?? "";
      const descParts = [catchPhrase, rawDetailText].filter(Boolean);
      const cleanDesc = descParts.join("\n").slice(0, 800);
      return {
        id: summary.id,
        title: summary.title ?? summary.name ?? "",
        description: cleanDesc,
        targetIndustries: detail?.industry
          ? detail.industry.split(" / ").map((s) => s.trim())
          : [],
        eligibility: [
          detail?.target_area_detail ? `対象地域（詳細）: ${detail.target_area_detail}` : "",
          detail?.use_purpose ?? "",
          detail?.target_number_of_employees ? `従業員数: ${detail.target_number_of_employees}` : "",
          detail?.subsidy_rate ? `補助率: ${detail.subsidy_rate}` : "",
        ]
          .filter(Boolean)
          .join(" / "),
        maxSubsidyAmount: summary.subsidy_max_limit ?? detail?.subsidy_max_limit ?? null,
        deadline: formatDeadline(summary.acceptance_end_datetime),
        region: summary.target_area_search ?? "",
      };
    });

    // 独自DBを先頭に置き、jGrants結果を後ろに追加（合計8件上限）
    const normalizedForBedrock: NormalizedSubsidyForMatch[] = [
      ...staticInputs,
      ...jgrantsNormalizedForBedrock,
    ].slice(0, 8);

    const company: CompanyProfileForMatch = {
      industryLabel,
      jGrantsIndustryParam: userJgrantsIndustry || undefined,
      companyName: companyName || "（社名未入力）",
      prefecture: prefecture.trim() || "（未指定）",
      employees: employees.trim() || "（未指定）",
      revenueBand: revenueBand.trim() || "（未指定）",
      businessPurpose: buildBusinessPurpose(
        industryLabel,
        businessNotes,
        websiteExcerpt,
      ),
    };

    const bedrockRows = await runSubsidyMatchBedrock(company, normalizedForBedrock);
    console.log("[subsidy/match] bedrock rows:", bedrockRows?.length ?? "null");

    const brMap = new Map((bedrockRows ?? []).map((row) => [row.subsidyId, row]));

    const jgrantsResults = top.map(({ summary, detail }) => {
      const rawDesc = detail?.detail ?? detail?.subsidy_catch_phrase ?? "";
      const cleanDesc = stripHtml(rawDesc);
      const br = brMap.get(summary.id);

      return {
        id: summary.id,
        name: summary.title ?? summary.name ?? "名称未設定",
        description: cleanDesc,
        maxAmountLabel: formatMaxAmount(summary.subsidy_max_limit ?? detail?.subsidy_max_limit),
        deadlineLabel: formatDeadline(summary.acceptance_end_datetime),
        targetIndustries: detail?.industry
          ? detail.industry.split(" / ").map((s) => s.trim())
          : [],
        subsidyRate: detail?.subsidy_rate ?? "",
        targetArea: summary.target_area_search ?? "",
        institutionName: summary.institution_name ?? "",
        detailUrl: detail?.front_subsidy_detail_page_url ?? "",
        matchScore: br?.matchScore ?? 0,
        summary: br?.summary ?? detail?.subsidy_catch_phrase ?? "",
        matchReason: br?.matchReason ?? [],
        riskFlags: br?.riskFlags ?? [],
        insightCards: br?.insightCards ?? [],
      };
    });

    const staticResults = staticSubsidies.map((s) => {
      const br = brMap.get(s.id);
      return {
        id: s.id,
        name: s.title,
        description: s.summary,
        maxAmountLabel: formatMaxAmount(s.subsidy_max_limit),
        deadlineLabel: staticSubsidyDeadlineLabel(s),
        targetIndustries: s.target_themes ?? [],
        subsidyRate: s.subsidy_rate,
        targetArea: s.target_area_search,
        institutionName: s.institution_name,
        detailUrl: s.official_url,
        matchScore: br?.matchScore ?? 0,
        summary: br?.summary ?? s.summary,
        matchReason: br?.matchReason ?? [],
        riskFlags: br?.riskFlags ?? [],
        insightCards: br?.insightCards ?? [],
      };
    });

    const results = [...staticResults, ...jgrantsResults];

    results.sort((a, b) => b.matchScore - a.matchScore);

    const aboveFloor = results.filter((r) => r.matchScore >= MIN_DISPLAY_SCORE);
    const finalResults = aboveFloor.length > 0 ? aboveFloor : results;

    console.log("[subsidy/match] results count:", finalResults.length);
    return NextResponse.json({ results: finalResults });
  } catch (e) {
    console.error("[subsidy/match] error:", e);
    return NextResponse.json({ results: [] });
  }
}

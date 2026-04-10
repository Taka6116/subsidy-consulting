import type { NormalizedSubsidyForMatch } from "@/lib/ai/bedrockSubsidyMatch";
import pool from "@/lib/db";
import { formatDeadline } from "@/lib/jgrants/client";

export type StaticSubsidy = {
  id: string;
  title: string;
  summary: string;
  subsidy_max_limit: number;
  subsidy_rate: string;
  target_area_search: string;
  target_number_of_employees: string;
  acceptance_status: string;
  acceptance_end_datetime: string | Date | null;
  target_themes: string[];
  excluded_industries: string[];
  official_url: string;
  institution_name: string;
};

function acceptanceEndToIso(v: string | Date | null | undefined): string | null {
  if (v == null || v === "") return null;
  if (v instanceof Date) return v.toISOString();
  return v;
}

/**
 * is_active=true の補助金を全件取得
 * DB障害時は空配列を返してフォールバック
 */
export async function fetchStaticSubsidies(): Promise<StaticSubsidy[]> {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM static_subsidies WHERE is_active = true ORDER BY created_at ASC`,
    );
    console.log("[staticSubsidies] fetched:", rows.length);
    return rows as StaticSubsidy[];
  } catch (e) {
    console.error("[staticSubsidies] DB fetch failed:", e);
    return [];
  }
}

/**
 * Bedrock に渡す normalizedForBedrock 形式に変換
 */
export function toBedrockInput(s: StaticSubsidy): NormalizedSubsidyForMatch {
  const endIso = acceptanceEndToIso(s.acceptance_end_datetime);
  const eligibilityParts = [
    s.subsidy_rate ? `補助率: ${s.subsidy_rate}` : "",
    s.target_number_of_employees ? `従業員数: ${s.target_number_of_employees}` : "",
    s.acceptance_status ? `受付状況: ${s.acceptance_status}` : "",
    s.excluded_industries?.length
      ? `除外業種（参考）: ${s.excluded_industries.join("、")}`
      : "",
  ].filter(Boolean);

  return {
    id: s.id,
    title: s.title,
    description: s.summary.slice(0, 800),
    targetIndustries: s.target_themes ?? [],
    eligibility: eligibilityParts.join(" / "),
    maxSubsidyAmount: s.subsidy_max_limit,
    deadline: endIso ? formatDeadline(endIso) : s.acceptance_status || "—",
    region: s.target_area_search ?? "",
  };
}

/** API レスポンス用の期限ラベル */
export function staticSubsidyDeadlineLabel(s: StaticSubsidy): string {
  const endIso = acceptanceEndToIso(s.acceptance_end_datetime);
  return endIso ? formatDeadline(endIso) : s.acceptance_status || "—";
}
